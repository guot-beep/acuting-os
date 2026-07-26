#!/usr/bin/env python3
"""extract-curriculum-text.py — make every curriculum file readable by every agent.

Agents are told to read curriculum/ first, but only some can open a PDF. A
lecture that exists solely as a PDF is invisible to the rest of the fleet while
still *looking* ingested — 37 of 43 files were in that state when this was
written. This writes a `.md` text version beside each binary source.

Page markers are `## p.N`, matching the citation format the card standards
require (`curriculum/<path>#p<N>`), so a page number in field_sources points at
something a reader can actually locate.

Usage:
  python3 scripts/extract-curriculum-text.py            # only files lacking a .md
  python3 scripts/extract-curriculum-text.py --force    # redo everything
  python3 scripts/extract-curriculum-text.py --only herbs formulas
"""
import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CUR = ROOT / "curriculum"

PDF_EXT = {".pdf"}
DOC_EXT = {".doc", ".docx", ".ppt", ".pptx"}
SHEET_EXT = {".xlsx", ".xls"}


def clean(text: str) -> str:
    """Collapse the noise PDF extraction adds without touching real content."""
    text = text.replace(" ", " ")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def scramble_ratio(pages) -> float:
    """Fraction of substantial lines that look like two columns joined together.

    Real damage, not cosmetic: flattened, `Herb Functions.pdf` reads
    `[21] Aromatic, Open Orifices • Du Zhong [W]` — 杜仲 sits in the Tonify Yang
    column on the right while the heading belongs to the left column, so an
    agent copying that line files 杜仲 (補陽) as an orifice-opener.

    Heuristic: a line carrying two or more `[N]` reference codes, or two or more
    bullets, almost always means two columns got joined. Returns 0.0 when there
    is too little text to judge.
    """
    hits = total = 0
    for page in pages:
        for line in page.splitlines():
            if len(line.strip()) < 20:
                continue
            total += 1
            if len(re.findall(r"\[\w{1,3}\]", line)) >= 2 or line.count("•") >= 2:
                hits += 1
    return hits / total if total > 20 else 0.0


SCRAMBLE_WARN = 0.15


def looks_multicolumn(pages) -> bool:
    return scramble_ratio(pages) > SCRAMBLE_WARN


def _pdfplumber(src: Path):
    import pdfplumber

    with pdfplumber.open(str(src)) as pdf:
        return [clean(page.extract_text() or "") for page in pdf.pages]


def _pypdf(src: Path):
    from pypdf import PdfReader

    return [clean(p.extract_text() or "") for p in PdfReader(str(src)).pages]


def _xy_cut(page, words, box, depth=0, max_depth=4, min_gap_x=8, min_gap_y=10):
    """Recursive XY-cut: split a region on whitespace gutters, columns first.

    Standard document-layout algorithm, needed because a spanning title (e.g.
    "CATEGORY LIST") bridges the gutter between two columns, so a single pass of
    column detection sees one wide block. Cutting horizontally under the title
    exposes the gutter on the next recursion.
    """
    x0, t0, x1, t1 = box
    ws = [w for w in words
          if w["x0"] >= x0 - 0.5 and w["x1"] <= x1 + 0.5
          and w["top"] >= t0 - 0.5 and w["bottom"] <= t1 + 0.5]
    if not ws or depth >= max_depth:
        return [box]

    def gutters(lo, hi, k0, k1, min_gap):
        n = int(hi - lo) + 2
        cov = [0] * n
        for w in ws:
            a = max(0, int(w[k0] - lo))
            b = min(n - 1, int(w[k1] - lo))
            for i in range(a, b + 1):
                cov[i] += 1
        out, start = [], None
        for i, c in enumerate(cov):
            if c == 0 and start is None:
                start = i
            elif c != 0 and start is not None:
                if i - start >= min_gap:
                    out.append((lo + start, lo + i))
                start = None
        return out

    def split(gs, lo, hi, min_size):
        edges, prev = [], lo
        for a, b in gs:
            if a > prev:
                edges.append((prev, a))
            prev = b
        if prev < hi:
            edges.append((prev, hi))
        return [e for e in edges if e[1] - e[0] > min_size]

    cols = split(gutters(x0, x1, "x0", "x1", min_gap_x), x0, x1, 40)
    if len(cols) > 1:
        out = []
        for a, b in cols:
            out += _xy_cut(page, ws, (a, t0, b, t1), depth + 1, max_depth)
        return out
    rows = split(gutters(t0, t1, "top", "bottom", min_gap_y), t0, t1, 12)
    if len(rows) > 1:
        out = []
        for a, b in rows:
            out += _xy_cut(page, ws, (x0, a, x1, b), depth + 1, max_depth)
        return out
    return [box]


def _pdfplumber_columns(src: Path):
    """Read each column top-to-bottom instead of joining rows across columns."""
    import pdfplumber

    pages = []
    with pdfplumber.open(str(src)) as pdf:
        for page in pdf.pages:
            words = page.extract_words()
            if not words:
                pages.append("")
                continue
            boxes = _xy_cut(page, words, (0, 0, page.width, page.height))
            blocks = [(page.crop(b).extract_text() or "").strip() for b in boxes]
            pages.append(clean("\n".join(b for b in blocks if b)))
    return pages


def extract_pdf(src: Path):
    """Pick the reading order that survives this file's layout.

    pdfplumber sorts by (top, x), so a page of side-by-side vertical lists comes
    out row-joined: `[21] Aromatic, Open Orifices • Du Zhong [W]` glues a
    left-column heading to a right-column herb, and 杜仲 (補陽) reads as an
    orifice-opener — a wrong category on a card, from text that looks fine.

    So: plain pdfplumber first (right for prose and real tables); if it trips
    the column-scramble detector, redo it with XY-cut and take that when it
    comes out clean. pypdf is the last resort for files pdfplumber cannot open.
    Returns (pages, engine).
    """
    flat = None
    try:
        flat = _pdfplumber(src)
        if any(flat) and not looks_multicolumn(flat):
            return flat, "pdfplumber"
    except Exception as e:  # noqa: BLE001 - fall through
        print(f"    pdfplumber failed ({e.__class__.__name__})", flush=True)

    if flat is not None and any(flat):
        before = scramble_ratio(flat)
        try:
            cut = _pdfplumber_columns(src)
        except Exception as e:  # noqa: BLE001
            print(f"    XY-cut failed ({e.__class__.__name__}), keeping flat text", flush=True)
            return flat, "pdfplumber"
        after = scramble_ratio(cut)
        # Take the column-wise read whenever it measurably unscrambles the page.
        # Demanding a perfect score would reject it on files like the herb
        # category chart, where pages 1-2 are a narrow two-per-line alphabetical
        # list that joins harmlessly (each `Name [n]` is self-contained) while
        # pages 3+ are the category columns that must not be joined at all.
        if any(cut) and after < before - 0.05:
            print(f"    multi-column layout — re-read column-wise (XY-cut, {before:.0%} → {after:.0%})", flush=True)
            return cut, "pdfplumber+xycut"
        return flat, "pdfplumber"

    return _pypdf(src), "pypdf"


def extract_office(src: Path):
    """LibreOffice headless — handles .doc/.docx/.ppt/.pptx without extra libs."""
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["soffice", "--headless", "--convert-to", "txt:Text (encoded):UTF8",
             "--outdir", tmp, str(src)],
            check=True, capture_output=True, timeout=300,
        )
        out = list(Path(tmp).glob("*.txt"))
        if not out:
            raise RuntimeError("soffice produced no output")
        return [clean(out[0].read_text(encoding="utf-8", errors="replace"))], "libreoffice"


def extract_sheet(src: Path):
    import openpyxl

    wb = openpyxl.load_workbook(str(src), data_only=True, read_only=True)
    pages = []
    for ws in wb.worksheets:
        rows = []
        for row in ws.iter_rows(values_only=True):
            cells = ["" if c is None else str(c).strip() for c in row]
            if any(cells):
                rows.append(" | ".join(cells).rstrip(" |"))
        pages.append(f"### sheet: {ws.title}\n\n" + "\n".join(rows))
    return pages, "openpyxl"


def write_md(src: Path, dest: Path, pages, engine: str):
    rel = src.relative_to(ROOT).as_posix()
    body = [
        f"# {src.stem}",
        "",
        f"> 自動抽取自 `{rel}`(engine: {engine})。**這是原始文字,未經整理或校對。**",
        f"> 引用寫法:`{rel}#p<頁碼>`。頁碼 = 下方 `## p.N` 標題。",
        "> ⚠️ PDF 的段落順序不等於視覺順序。跨欄位抓到的內容(尤其禁忌、劑量、",
        "> 針刺深度)一定要回頭確認它掛在哪一味藥/哪一個穴底下 —— 曾經在麻黃附近",
        "> 抓到的禁忌實際上屬於桂枝。",
        "",
    ]
    ratio = scramble_ratio(pages)
    if ratio > SCRAMBLE_WARN:
        body[3:3] = [
            "> ",
            f"> 🚨 **多欄版面:約 {ratio:.0%} 的行可能是「左欄 + 右欄」黏在一起的。**",
            "> 例:`[21] Aromatic, Open Orifices • Du Zhong [W]` —— 杜仲在右邊那欄",
            "> (補陽),標題在左邊那欄,兩者**沒有關係**。",
            "> **一行裡的兩個東西不一定有關係。** 要判斷「某味藥屬於哪個功效分類」,",
            "> 請找該分類**整段連續的清單**(標題 + 底下的 bullet),不要只看單一行;",
            "> 或改用逐味論述的 `herbs/Materia Medica Abbbreviated.md`。",
        ]
    elif "xycut" in engine:
        body[3:3] = [
            "> ",
            "> ℹ️ 原始版面是多欄,已依欄位逐欄由上往下重讀(XY-cut),分類歸屬正確。",
        ]
    for i, text in enumerate(pages, 1):
        body.append(f"## p.{i}")
        body.append("")
        body.append(text if text.strip() else "_(這一頁沒有可抽取的文字 —— 可能是圖片或掃描頁)_")
        body.append("")
    dest.write_text("\n".join(body).rstrip() + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="re-extract even if a .md exists")
    ap.add_argument("--only", nargs="*", help="limit to these curriculum subfolders")
    args = ap.parse_args()

    targets = []
    for src in sorted(CUR.rglob("*")):
        if not src.is_file() or src.suffix.lower() not in (PDF_EXT | DOC_EXT | SHEET_EXT):
            continue
        folder = src.relative_to(CUR).parts[0]
        if args.only and folder not in args.only:
            continue
        dest = src.with_suffix(".md")
        if dest.exists() and not args.force:
            continue
        targets.append((src, dest))

    if not targets:
        print("nothing to extract — every binary file already has a .md sibling")
        return 0

    print(f"extracting {len(targets)} file(s)\n")
    empty, failed = [], []
    for n, (src, dest) in enumerate(targets, 1):
        rel = src.relative_to(CUR).as_posix()
        print(f"[{n}/{len(targets)}] {rel}", flush=True)
        try:
            ext = src.suffix.lower()
            if ext in PDF_EXT:
                pages, engine = extract_pdf(src)
            elif ext in SHEET_EXT:
                pages, engine = extract_sheet(src)
            else:
                pages, engine = extract_office(src)
        except Exception as e:  # noqa: BLE001 - report, never abort the batch
            print(f"    FAILED: {e.__class__.__name__}: {e}", flush=True)
            failed.append(rel)
            continue

        chars = sum(len(p) for p in pages)
        write_md(src, dest, pages, engine)
        blank = sum(1 for p in pages if not p.strip())
        note = f"    → {dest.name}  {len(pages)} 頁, {chars:,} 字元 ({engine})"
        if blank:
            note += f", {blank} 頁無文字"
        print(note, flush=True)
        # Near-empty output means a scanned/image PDF: the .md exists but is a
        # lie unless we say so. Surfaced at the end rather than silently passing.
        if chars < 200 * max(1, len(pages)) // 10:
            empty.append(f"{rel} ({chars} 字元 / {len(pages)} 頁)")

    print("\n" + "=" * 60)
    print(f"done: {len(targets) - len(failed)} extracted, {len(failed)} failed")
    if empty:
        print(f"\n⚠️ 這些抽出來幾乎沒有文字(可能是掃描檔/圖片投影片),需要人工轉述:")
        for e in empty:
            print(f"  - {e}")
    if failed:
        print(f"\n❌ 失敗:")
        for f in failed:
            print(f"  - {f}")
    print("\n下一步:node scripts/index-curriculum.js")
    return 0


if __name__ == "__main__":
    sys.exit(main())
