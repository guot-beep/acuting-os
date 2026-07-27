#!/usr/bin/env python3
"""parse-channel-curriculum.py — turn a channel lecture PDF into structured JSON.

The channel tables are four columns: Name/Association · Location/Needling ·
Functions & Actions · Indications/Notes. Reading order flattens them, and on
several pages one column's bullets run past several points, so "which bullet
belongs to which point" cannot be answered from the text alone — LI12-LI16 shared
one visual run, and a naive read put 杜仲-style mismatches on the cards.

This pairs blocks by geometry instead. Each page is XY-cut into blocks, blocks
are assigned to a column by their x-range, and a column block belongs to the
point whose name block it overlaps vertically. That is the same reasoning done
by hand for LU and LI, made repeatable for the remaining twelve channels.

Output is an extraction, not a card: English straight from the source, no
translation and no curation. Those stay a human/LLM judgement, which is the
point — this script only guarantees the attribution.

Usage:
  python3 scripts/parse-channel-curriculum.py "curriculum/acupoints/3 STOMACH...pdf"
  python3 scripts/parse-channel-curriculum.py <pdf> --json out.json
"""
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import importlib.util

_spec = importlib.util.spec_from_file_location("ex", Path(__file__).parent / "extract-curriculum-text.py")
_ex = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_ex)

# The curriculum's channel prefixes are not the database's.
PREFIX = {"UB": "BL", "DU": "GV", "SJ": "TE", "REN": "CV", "KD": "KI", "LV": "LR"}
# Only these prefixes are points. Without the whitelist a stray note like
# "NC-17!!!]" parses as a code and invents a 46th ST point.
VALID = set(PREFIX) | {"LU", "LI", "ST", "SP", "HT", "SI", "BL", "KI", "PC", "TE", "GB", "LR", "CV", "GV"}
CODE_RE = re.compile(r"\b([A-Z]{2,3})[- ]?(\d+)(\*{0,2})")


def norm_code(prefix, num):
    return f"{PREFIX.get(prefix, prefix)}{int(num)}"


def column_bands(page, words, min_gap=6):
    """Find the table's four columns from the page's own vertical gutters.

    Fixed x-fractions are too brittle: the functions column's bullet glyph sits
    at 0.516 of the page width and a 0.52 boundary swept every bullet into the
    location column, leaving each point with one run-on functions string. The
    whitespace between columns is the real boundary, so measure it.

    Returns up to four (x0, x1) bands left to right, or None if the page does
    not look like the four-column table.
    """
    # The page header ("STOMACH CHANNEL OF FOOT YANG MING", the column titles)
    # spans the full width and bridges every gutter, so a scan over the whole
    # page finds three bands instead of four and the indications column merges
    # into functions. Measure the body only.
    body_top = page.height * 0.16
    body = [word for word in words if word["top"] >= body_top] or words
    w = int(page.width) + 2
    cov = [0] * w
    for word in body:
        for i in range(max(0, int(word["x0"])), min(w - 1, int(word["x1"])) + 1):
            cov[i] += 1
    gaps, start = [], None
    for i, c in enumerate(cov):
        if c == 0 and start is None:
            start = i
        elif c != 0 and start is not None:
            if i - start >= min_gap:
                gaps.append((start, i))
            start = None
    bands, prev = [], 0
    for g0, g1 in gaps:
        if g0 - prev > 30:
            bands.append((prev, g0))
        prev = g1
    if page.width - prev > 30:
        bands.append((prev, page.width))

    # Some pages bridge the location/functions gutter (a long location line, a
    # needling note running wide), leaving three bands. Silently accepting that
    # maps the indications column onto "functions" and drops indications for the
    # whole page — ST pages 2 and 3 lost every indication that way. Retry the
    # middle span with a tighter gap before giving up.
    if len(bands) == 3 and min_gap > 3:
        lo, hi = bands[1]
        inner = [word for word in body if lo <= (word["x0"] + word["x1"]) / 2 <= hi]
        sub = column_bands_in(inner, lo, hi, 3)
        if sub and len(sub) == 2:
            bands = [bands[0], sub[0], sub[1], bands[2]]
    return bands if len(bands) >= 3 else None


def column_bands_in(words, lo, hi, min_gap):
    """Gutter scan restricted to one x-span, used to split a merged column."""
    n = int(hi - lo) + 2
    cov = [0] * n
    for word in words:
        a = max(0, int(word["x0"] - lo))
        b = min(n - 1, int(word["x1"] - lo))
        for i in range(a, b + 1):
            cov[i] += 1
    gaps, start = [], None
    for i, c in enumerate(cov):
        if c == 0 and start is None:
            start = i
        elif c != 0 and start is not None:
            if i - start >= min_gap:
                gaps.append((lo + start, lo + i))
            start = None
    out, prev = [], lo
    for g0, g1 in gaps:
        if g0 - prev > 30:
            out.append((prev, g0))
        prev = g1
    if hi - prev > 30:
        out.append((prev, hi))
    return out


COLS = ["name", "location", "functions", "indications"]


def classify_x(mid, bands, page_width):
    """Column for an x-midpoint. Falls back to fractions when the gutter scan
    does not find a clean four-column grid (cover pages, notes pages)."""
    if bands:
        for i, (lo, hi) in enumerate(bands[:4]):
            if lo - 1 <= mid <= hi + 1:
                return COLS[i] if i < len(COLS) else "indications"
        return None
    frac = mid / page_width
    if frac < 0.30:
        return "name"
    if frac < 0.505:
        return "location"
    if frac < 0.71:
        return "functions"
    return "indications"


def bullets(text):
    """Split a column's text into items on the bullet glyph.

    Splitting on line starts does not work here: within a column the bullet
    glyph and its text sit at slightly different x positions, so a wrapped line
    can carry the *next* item's bullet at the same y — "Superior to styloid
    process of • radius •" is one physical line holding parts of two items.
    The glyph itself is the only reliable delimiter.

    "s " and "§ " mark a pairing beneath the item above and are folded into it,
    which is how the source reads them.
    """
    flat = re.sub(r"\s+", " ", text.replace("\n", " ")).strip()
    if not flat:
        return []
    parts = [p.strip(" •") for p in flat.split("•")]
    out = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        # A needling heading introduces the lines after it rather than being an
        # item of its own; keep it as a marker the caller can read.
        for sub in re.split(r"(?:^|\s)(?:s|§)\s+", part):
            sub = sub.strip()
            if not sub:
                continue
            if out and part.index(sub) > 0:
                out[-1] += f" — {sub}"
            else:
                out.append(sub)
    return out


def parse(pdf_path):
    import pdfplumber

    points = {}
    order = []
    doc_bands = None
    with pdfplumber.open(str(pdf_path)) as pdf:
        for pno, page in enumerate(pdf.pages, 1):
            words = page.extract_words()
            if not words:
                continue
            boxes = _ex._xy_cut(page, words, (0, 0, page.width, page.height))
            cells = []
            for b in boxes:
                text = (page.crop(b).extract_text() or "").strip()
                if not text:
                    continue
                cells.append({"box": b, "text": text})

            # Name cells anchor the rows. A single name cell can hold several
            # points (the tables group them), so each code inside it gets a
            # y-slice proportional to where its line sits in the cell.
            # Anchor each code at the actual y of the word that carries it.
            # Slicing a name cell proportionally by line index looked reasonable
            # but drifts whenever lines wrap unevenly — on LU it silently moved
            # LU1's and LU6's function blocks onto their neighbours. Word
            # coordinates are exact, so the row bands are too.
            bands = column_bands(page, words)
            # On some pages a single wide line touches both the location and
            # functions columns, so no gutter exists to find and the page yields
            # three bands — which silently drops the whole indications column
            # (ST pages 2-3). The table's geometry does not move between pages
            # of the same lecture, so reuse the first clean four-band reading.
            if bands and len(bands) >= 4:
                doc_bands = bands
            elif doc_bands:
                bands = doc_bands
            name_x = bands[0][1] if bands else page.width * 0.30
            anchors = []
            for w in words:
                if w["x1"] > name_x + 2:
                    continue
                m = CODE_RE.match(w["text"].strip())
                if not m or m.group(1) not in VALID:
                    continue
                anchors.append({"code": norm_code(m.group(1), m.group(2)), "stars": len(m.group(3)),
                                "y0": w["top"], "y1": None, "identity": []})
            anchors.sort(key=lambda a: a["y0"])
            # Deduplicate a code appearing twice in one column (wrapped headers).
            seen_codes = set()
            anchors = [a for a in anchors if not (a["code"] in seen_codes or seen_codes.add(a["code"]))]
            for i, a in enumerate(anchors):
                a["y1"] = anchors[i + 1]["y0"] if i + 1 < len(anchors) else page.height
            # Identity text = the name-column words inside this point's band.
            for a in anchors:
                txt = [w["text"] for w in words
                       if w["x1"] <= name_x + 2 and a["y0"] - 1 <= w["top"] < a["y1"]]
                a["identity"] = [" ".join(txt)] if txt else []

            for a in anchors:
                rec = points.setdefault(a["code"], {"code": a["code"], "stars": a["stars"], "pages": [],
                                                    "identity": [], "location": [], "functions": [], "indications": []})
                if pno not in rec["pages"]:
                    rec["pages"].append(pno)
                rec["stars"] = max(rec["stars"], a["stars"])
                rec["identity"] += [i for i in a["identity"] if i not in rec["identity"]]
                if a["code"] not in order:
                    order.append(a["code"])

            # Assign LINES, not blocks. The functions and indications columns
            # have no horizontal gutters between rows, so XY-cut returns one
            # tall block per column per page — handing that whole block to a
            # single anchor is what left LU1 and LU6 with zero functions while
            # LU3 collected 21 indications. Grouping words into lines by their
            # own y and banding each line individually is the only split that
            # matches how the table actually reads.
            # Column boundaries come from the page geometry, not from the
            # XY-cut cells: on several pages one cell straddles the location and
            # functions columns, and deriving bounds from it swallowed the
            # functions column whole — every point reported zero functions while
            # the location list doubled in length.
            lines = {}
            for w in words:
                col = classify_x((w["x0"] + w["x1"]) / 2, bands, page.width)
                if col is None or col == "name":
                    continue
                key = (col, round(w["top"] / 3))
                lines.setdefault(key, {"col": col, "top": w["top"], "words": []})["words"].append(w)

            for entry in lines.values():
                entry["words"].sort(key=lambda w: w["x0"])
                text = " ".join(w["text"] for w in entry["words"]).strip()
                if not text:
                    continue
                band = None
                for a in anchors:
                    if a["y0"] - 4 <= entry["top"] < a["y1"] - 4:
                        band = a
                        break
                if band is None:
                    continue
                rec = points[band["code"]]
                rec.setdefault("_raw_" + entry["col"], []).append((entry["top"], text))

    # Turn the collected raw lines into bullets once all pages are read.
    for rec in points.values():
        for col in ("location", "functions", "indications"):
            raw = rec.pop("_raw_" + col, [])
            raw.sort(key=lambda t: t[0])
            rec[col] = bullets("\n".join(t for _, t in raw))

    return [points[c] for c in order]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("--json", help="write JSON here instead of printing a summary")
    ap.add_argument("--code", help="show one point in full")
    args = ap.parse_args()

    recs = parse(Path(args.pdf).resolve())

    if args.json:
        Path(args.json).write_text(json.dumps(recs, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{len(recs)} points -> {args.json}")
        return 0

    if args.code:
        for r in recs:
            if r["code"].upper() == args.code.upper():
                print(json.dumps(r, ensure_ascii=False, indent=2))
                return 0
        print(f"{args.code} not found")
        return 1

    print(f"{len(recs)} points parsed from {Path(args.pdf).name}\n")
    for r in recs:
        star = "★★" if r["stars"] == 2 else ("★ " if r["stars"] == 1 else "  ")
        print(f"{star} {r['code']:<6} fn={len(r['functions']):<2} ind={len(r['indications']):<2} loc={len(r['location']):<2} p{r['pages']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
