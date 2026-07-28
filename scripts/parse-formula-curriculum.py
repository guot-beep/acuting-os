#!/usr/bin/env python3
"""parse-formula-curriculum.py — read the Formulations Summary Chart by table.

The acupoint lectures needed a recursive XY-cut because they are visually
columnar with no ruling lines. This PDF is different and better: it is a real
Word table, and the ruling lines survived the export. pdfplumber's
`find_tables()` recovers a 52x17 grid on page 1, so the column each piece of
text belongs to is stated by the document rather than inferred from whitespace.

That removes the entire class of error the acupoint parser had to defend
against — 杜仲 filed under 開竅 because a left-column heading glued onto a
right-column herb cannot happen when the cell boundaries are explicit.

Column map (page 1 header row: Name [Source] | Rank | Herb | Amount | Related | Plus | Minus):

    0        方名 [出典] + the Actions/Indications/Preparation prose beneath it
    2        Rank        Chief / Deputy / Assistant / Envoy
    4, 5     Herb        (the name lands in either, depending on wrap)
    9        a single-letter abbreviation — a LAYOUT MARK, not data. Discarded.
    13       Amount
    14       Related     the derived formula's name
    15/16    Plus/Minus  what that derivation adds or removes

A formula occupies a BAND of rows: it starts where column 0 carries a name and
ends before the next such row. Ranks, herbs and amounts are read from the band,
so a four-ingredient formula spanning four table rows comes back as one record.

⚠️ `(cid:0)` is an arrow glyph the export failed to embed. It means "→" and is
translated, never kept as content.

Usage:
    python3 scripts/parse-formula-curriculum.py --json out.json [--pages 1-3]
    python3 scripts/parse-formula-curriculum.py --name "Ma Huang Tang"
"""
import argparse
import json
import re
import sys
from pathlib import Path

PDF = Path(__file__).resolve().parent.parent / "curriculum/formulas/Formulations Summary Chart.docx.pdf"

RANKS = {"chief": "君", "deputy": "臣", "assistant": "佐", "envoy": "使"}
# "Ma Huang Tang [麻黄汤]" / "Gui Zhi Tang [5 Ingredients]" / "(Ephedra Decoction)"
NAME_RE = re.compile(r"^([A-Z][A-Za-z' ]+?(?:Tang|San|Wan|Yin|Jian|Pian|Gao|Dan))\b")
# The 八法 does not sit in a fixed place within the chapter heading:
#   "Chapter 1: 汗法Formulas That Release the Exterior"   — right after the colon
#   "Chapter 2: Formulas That Harmonize 和法- Formulas…"  — after the English
#   "Chapter 4: Formulas That Clear Heat [清法] - …"      — in brackets
# Matching only the first form labelled all 60 formulas 汗法, which is worse
# than leaving it blank. Find the 法 token anywhere in the heading instead.
CHAPTER_RE = re.compile(r"Chapter\s+\d+\s*[:：]")
BAFA_RE = re.compile(r"([汗吐下和溫清消補])法")
LABELLED = ("Actions:", "Indications:", "Preparation:", "Administration:")


def clean(s):
    """Normalise a cell. (cid:0) is an un-embedded arrow, not text."""
    if not s:
        return ""
    s = s.replace("(cid:0)", " → ")
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def split_bullets(s):
    """The Plus/Minus columns use ● as the item separator, like the acupoint
    lectures use •. Cell text keeps its newlines, so strip those too or every
    item comes back with a trailing \n."""
    return [re.sub(r"\s+", " ", p).strip(" ●•") for p in clean(s).split("●")
            if re.sub(r"\s+", " ", p).strip(" ●•")]


def find_columns(rows):
    """Locate the columns by the header row's labels.

    The header reads: Name [Source] | Rank | Herb | Amount | Related | Plus |
    Minus. Its cells sit at different indices on different pages, so every page
    is measured rather than assumed. Returns None when a page carries no such
    header (cover pages, notes pages), which is how those get skipped.
    """
    want = {"rank": "rank", "herb": "herb", "amount": "amount",
            "related": "related", "plus": "plus", "minus": "minus"}
    for row in rows[:8]:
        cells = [clean(c).lower() for c in (row or [])]
        if not any(c.startswith("name") for c in cells):
            continue
        found = {}
        for j, c in enumerate(cells):
            for key, label in want.items():
                if key not in found and c.startswith(label):
                    found[key] = j
        if "rank" in found and "herb" in found and "amount" in found:
            found["name"] = next(j for j, c in enumerate(cells) if c.startswith("name"))
            return found
    return None


def parse(pdf_path, page_filter=None):
    import pdfplumber

    formulas = []
    chapter = ""
    chapter_title = ""
    with pdfplumber.open(str(pdf_path)) as pdf:
        for pno, page in enumerate(pdf.pages, 1):
            if page_filter and pno not in page_filter:
                continue
            # The chapter heading lives in the PAGE text, not reliably inside
            # the table's first rows — reading it from the table labelled all
            # 60 formulas 汗法, because chapter 1's heading was the only one
            # ever found and it then carried forward forever.
            ptext = page.extract_text() or ""
            cm = re.search(r"Chapter\s+\d+\s*[:：]\s*([^\n]{0,80})", ptext)
            if cm:
                chapter_title = cm.group(1).strip()
                b = BAFA_RE.search(chapter_title)
                # Not every chapter is one of the 八法 (温里剂, 补气 …); blank is
                # the honest value there, never the previous chapter's.
                chapter = b.group(0) if b else ""

            tables = page.find_tables()
            if not tables:
                continue
            # NOT tables[0]. The content table is index 0 on page 1 but index 1
            # on pages 3, 6 and 20 — taking the first found silently skipped
            # most of the document (36 formulas instead of ~170). The content
            # table is the biggest one.
            rows = max(tables, key=lambda t: len(t.rows)).extract()

            # Column positions are NOT stable across pages: the grid is 17
            # columns wide on page 1, 16 on page 3, 23 on another, 11 on
            # another. Hardcoding indices read the wrong column as soon as the
            # page changed, so they are located by the header row's own labels.
            col = find_columns(rows)
            if not col:
                continue

            # A formula's band runs from its name row to the row before the next.
            starts = []
            for i, row in enumerate(rows):
                c0 = clean(row[col["name"]] if row and len(row) > col["name"] else "")
                if not c0 or c0.startswith(LABELLED) or c0.startswith("Name ["):
                    continue
                nm = NAME_RE.match(c0)
                if nm:
                    starts.append((i, nm.group(1).strip(), c0))

            for k, (i, name, c0) in enumerate(starts):
                end = starts[k + 1][0] if k + 1 < len(starts) else len(rows)
                band = rows[i:end]

                rec = {
                    "pinyin": name,
                    "page": pno,
                    "ba_fa": chapter,
                    "chapter": chapter_title,
                    "name_zh": "",
                    "name_en": "",
                    "source_classic": "",
                    "composition": [],
                    "actions": [],
                    "indications": [],
                    "preparation": "",
                    "administration": "",
                    "notes": [],
                    "tongue": "",
                    "pulse": "",
                    "family": [],
                }

                # 中文名 / 英文名 / 出典 all live in the header cell's brackets.
                zh = re.search(r"[一-鿿]{2,10}", c0)
                if zh:
                    rec["name_zh"] = zh.group(0)
                en = re.search(r"\(([A-Z][^)]{3,60})\)", c0)
                if en:
                    rec["name_en"] = en.group(1).strip()
                src = re.search(r"\[(Shang Han Lun|Jin Gui[^\]]*|Wen Bing[^\]]*|Tai Ping[^\]]*|[A-Z][A-Za-z ]{6,40})\]", c0)
                if src and not re.search(r"\d+\s*Ingredient", src.group(1)):
                    rec["source_classic"] = src.group(1).strip()

                for row in band:
                    cells = [clean(c) for c in row] + [""] * 40
                    get = lambda k: cells[col[k]] if k in col and col[k] < len(cells) else ""

                    # ── prose column ──
                    for line in get("name").split("\n"):
                        line = line.strip()
                        if not line:
                            continue
                        low = line.lower()
                        if low.startswith("actions:"):
                            rec["actions"] += [x.strip() for x in re.split(r"\s*&\s*|,\s*", line[8:]) if x.strip()]
                        elif low.startswith("indications:"):
                            rec["indications"].append(line[12:].strip())
                        elif low.startswith("preparation:"):
                            rec["preparation"] = line[12:].strip()
                        elif low.startswith("administration:"):
                            rec["administration"] = line[15:].strip()
                        elif line == c0 or line in c0:
                            continue
                        else:
                            # A label does not always start its line: the cell
                            # reads "Exterior Condition Formula Preparation:
                            # Short time [<20 minutes]" on one line.
                            hit = False
                            for lab, key in (("Preparation:", "preparation"),
                                             ("Administration:", "administration"),
                                             ("Actions:", None), ("Indications:", None)):
                                p = line.find(lab)
                                if p <= 0:
                                    continue
                                head, rest = line[:p].strip(), line[p + len(lab):].strip()
                                if head:
                                    rec["notes"].append(head)
                                if key:
                                    rec[key] = rest
                                elif lab == "Actions:":
                                    rec["actions"] += [x.strip() for x in re.split(r"\s*&\s*|,\s*", rest) if x.strip()]
                                else:
                                    rec["indications"].append(rest)
                                hit = True
                                break
                            if not hit:
                                rec["notes"].append(line)

                    # ── composition ──
                    rank = RANKS.get(get("rank").strip().lower(), "")

                    # The Word table split herb names across merged sub-columns:
                    # 麻黃 arrives as "Ma Huan" in column 5 and "g" in column 7,
                    # while 杏仁 appears in BOTH column 4 (with its aliases) and
                    # column 5. Reading a single column truncated one and
                    # duplicated the other, so the name is rebuilt from 4..8:
                    # first line of each cell, skip anything already present,
                    # and glue a short all-lowercase fragment on with no space
                    # because that is a wrapped continuation, not a new word.
                    aliases, name_parts = [], []
                    for cell in cells[col["herb"]:min(col.get("amount", col["herb"] + 5), len(cells))]:
                        if not cell:
                            continue
                        lines = [x.strip() for x in cell.split("\n") if x.strip()]
                        if not lines:
                            continue
                        head = lines[0]
                        aliases += [re.sub(r"^\[|\]$", "", x) for x in lines[1:] if x.startswith("[")]
                        if head.startswith("["):
                            aliases.append(head.strip("[]"))
                            continue
                        joined = "".join(name_parts)
                        if head in joined or (joined and joined in head and len(head) > len(joined)):
                            if len(head) > len(joined):
                                name_parts = [head]
                            continue
                        if name_parts and head.islower() and len(head) <= 3:
                            name_parts[-1] += head          # "Ma Huan" + "g"
                        else:
                            name_parts.append(head)
                    herb = " ".join(name_parts).strip()
                    amount = get("amount").strip()
                    if herb and not herb.lower().startswith(("rank", "herb")):
                        entry = {"role": rank, "herb": herb, "amount": amount}
                        if aliases:
                            entry["aliases"] = aliases
                        rec["composition"].append(entry)
                    elif rank and rec["composition"]:
                        rec["composition"][-1]["role"] = rec["composition"][-1]["role"] or rank

                    # ── family: Related | Plus | Minus ──
                    related = get("related")
                    if related:
                        for chunk in related.split("\n"):
                            fm = NAME_RE.match(clean(chunk))
                            if not fm:
                                continue
                            rec["family"].append({
                                "name": fm.group(1).strip(),
                                "raw": clean(related),
                                "plus": split_bullets(get("plus")),
                                "minus": split_bullets(get("minus")),
                            })

                # 舌脈 sit inside the prose as "T: …, P: …" and wrap across
                # lines, so they are recovered from the joined notes rather
                # than from any single line. (Hand-transcribing this is what
                # produced the one error the sample card's assertion caught.)
                joined = " ".join(rec["notes"])
                tm = re.search(r"\bT:\s*([^|]*?)(?=,?\s*P:|$)", joined)
                pm = re.search(r"\bP:\s*(.+?)(?=\s{2,}|$)", joined)
                if tm:
                    rec["tongue"] = re.sub(r"\s+", " ", tm.group(1)).strip(" ,")
                if pm:
                    rec["pulse"] = re.sub(r"\s+", " ", pm.group(1)).strip(" ,")
                formulas.append(rec)
    return formulas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", nargs="?", default=str(PDF))
    ap.add_argument("--json")
    ap.add_argument("--name")
    ap.add_argument("--pages")
    a = ap.parse_args()

    pages = None
    if a.pages:
        pages = set()
        for part in a.pages.split(","):
            if "-" in part:
                lo, hi = part.split("-")
                pages.update(range(int(lo), int(hi) + 1))
            else:
                pages.add(int(part))

    out = parse(Path(a.pdf), pages)
    if a.name:
        out = [f for f in out if a.name.lower() in f["pinyin"].lower()]
        print(json.dumps(out, ensure_ascii=False, indent=1))
        return
    if a.json:
        Path(a.json).write_text(json.dumps({"source": str(a.pdf), "formulas": out},
                                           ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{len(out)} formulas -> {a.json}")
    else:
        for f in out:
            comp = " ".join(f"{c['role']}{c['herb']}{c['amount']}" for c in f["composition"])
            print(f"p{f['page']} {f['ba_fa']:4} {f['pinyin']:32} {f['name_zh']:8} {comp[:60]}")


if __name__ == "__main__":
    main()
