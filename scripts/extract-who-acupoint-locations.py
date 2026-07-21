"""Extract review-only WHO point-location staging from a local PDF.

The WHO PDF itself is never copied into the repository. This script emits
short structured location facts, source page locators, extraction warnings,
and a comparison against the current 361-point canonical file.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent.parent
CANONICAL = ROOT / "data" / "acupoints" / "361.json"
OUTPUT = ROOT / "data" / "imports" / "acupoint_sources" / "who_location_staging.json"
SUMMARY = ROOT / "docs" / "WHO_ACUPOINT_LOCATION_EXTRACTION_SUMMARY.md"
CODE_PATTERN = r"(?:LU|LI|ST|SP|HT|SI|BL|KI|PC|TE|GB|LR|GV|CV)\d{1,2}"
HEADER_RE = re.compile(rf"(?m)^({CODE_PATTERN}):[^\n]*$")
LOCATION_RE = re.compile(r"^\s*((?:On|In|At)\b.*?\.(?!\d))", re.IGNORECASE | re.DOTALL)

# These five headers are absent from the PDF text layer. The short location
# sentences were transcribed from the rendered WHO source pages and remain
# draft pending a second visual review.
PAGE_IMAGE_OVERRIDES = {
    "LI7": {
        "header": "LI7: Wenliu",
        "pdf_page": 46,
        "printed_page_estimate": 37,
        "location_en_who": "On the posterolateral aspect of the forearm, on the line connecting LI5 with LI11, 5 B-cun superior to the dorsal wrist crease.",
    },
    "BL47": {
        "header": "BL47: Hunmen",
        "pdf_page": 132,
        "printed_page_estimate": 123,
        "location_en_who": "In the upper back region, at the same level as the inferior border of the spinous process of the ninth thoracic vertebra (T9), 3 B-cun lateral to the posterior median line.",
    },
    "BL48": {
        "header": "BL48: Yanggang",
        "pdf_page": 132,
        "printed_page_estimate": 123,
        "location_en_who": "In the upper back region, at the same level as the inferior border of the spinous process of the tenth thoracic vertebra (T10), 3 B-cun lateral to the posterior median line.",
    },
    "BL49": {
        "header": "BL49: Yishe",
        "pdf_page": 133,
        "printed_page_estimate": 124,
        "location_en_who": "In the upper back region, at the same level as the inferior border of the spinous process of the 11th thoracic vertebra (T11), 3 B-cun lateral to the posterior median line.",
    },
    "BL50": {
        "header": "BL50: Weicang",
        "pdf_page": 133,
        "printed_page_estimate": 124,
        "location_en_who": "In the upper back region, at the same level as the inferior border of the spinous process of the 12th thoracic vertebra (T12), 3 B-cun lateral to the posterior median line.",
    },
}


def normalize_text(value: str) -> str:
    value = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalized_compare(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def extract_candidates(reader: PdfReader) -> dict[str, list[dict]]:
    candidates: dict[str, list[dict]] = {}
    for page_index, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        headers = list(HEADER_RE.finditer(page_text))
        for index, header in enumerate(headers):
            end = headers[index + 1].start() if index + 1 < len(headers) else len(page_text)
            body = page_text[header.end():end]
            location_match = LOCATION_RE.search(body)
            location = normalize_text(location_match.group(1)) if location_match else ""
            record = {
                "code": header.group(1),
                "header": normalize_text(header.group(0)),
                "pdf_page": page_index + 1,
                "printed_page_estimate": page_index + 1 - 9,
                "location_en_who": location,
                "extraction_method": "pdf_text_layer",
                "score": 100 if location else 0,
            }
            candidates.setdefault(record["code"], []).append(record)
    return candidates


def measurement_fragments(location: str) -> list[str]:
    fragments = re.findall(
        r"(?:\d+(?:\.\d+)?\s+B-cun\s+[^,.;]+)",
        location,
        flags=re.IGNORECASE,
    )
    return [normalize_text(item) for item in fragments]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path, help="Local WHO PDF path")
    args = parser.parse_args()

    if not args.pdf.is_file():
        raise SystemExit(f"PDF not found: {args.pdf}")

    canonical = json.loads(CANONICAL.read_text(encoding="utf-8"))
    canonical_by_code = {record["code"]: record for record in canonical}
    reader = PdfReader(str(args.pdf))
    candidates = extract_candidates(reader)

    records = []
    issues = []
    for code, canonical_record in canonical_by_code.items():
        if code in PAGE_IMAGE_OVERRIDES:
            selected = {
                **PAGE_IMAGE_OVERRIDES[code],
                "code": code,
                "extraction_method": "page_image_manual_transcription",
                "score": 100,
            }
            issues.append({
                "code": code,
                "issue": "pdf_text_layer_missing_page_image_transcribed",
                "source_pdf_page": selected["pdf_page"],
                "required_action": "second visual review before any merge",
            })
            options = []
            usable = [selected]
        else:
            selected = None
            options = sorted(
                candidates.get(code, []),
                key=lambda item: (item["score"], item["pdf_page"]),
                reverse=True,
            )
            usable = [item for item in options if item["location_en_who"]]
        if not usable:
            issues.append({
                "code": code,
                "issue": "main_entry_not_reliably_extracted",
                "candidate_headers": len(options),
                "required_action": "page OCR or manual source-page verification",
            })
            continue
        selected = selected or usable[0]
        if len(usable) > 1 and usable[0]["score"] == usable[1]["score"]:
            issues.append({
                "code": code,
                "issue": "multiple_location_like_candidates",
                "candidate_pdf_pages": [item["pdf_page"] for item in usable],
                "required_action": "verify selected source page",
            })

        current = canonical_record.get("location_en", "")
        records.append({
            "code": code,
            "name_zh": canonical_record.get("chinese", ""),
            "pinyin": canonical_record.get("pinyin", ""),
            "review_status": "draft",
            "source_status": "who_extracted_pending_record_review",
            "source_id": "who_wpro_point_locations_2008",
            "source_url": "https://iris.who.int/handle/10665/353407",
            "source_pdf_page": selected["pdf_page"],
            "source_printed_page_estimate": selected["printed_page_estimate"],
            "extraction_method": selected["extraction_method"],
            "who_header": selected["header"],
            "location_en_who": selected["location_en_who"],
            "b_cun_fragments": measurement_fragments(selected["location_en_who"]),
            "current_location_en": current,
            "comparison": "same_normalized" if normalized_compare(current) == normalized_compare(selected["location_en_who"]) else "review_difference",
        })

    expected = len(canonical)
    exact = sum(record["comparison"] == "same_normalized" for record in records)
    different = sum(record["comparison"] == "review_difference" for record in records)
    with_measurement = sum(bool(record["b_cun_fragments"]) for record in records)
    payload = {
        "source": {
            "id": "who_wpro_point_locations_2008",
            "title": "WHO Standard Acupuncture Point Locations in the Western Pacific Region",
            "official_url": "https://iris.who.int/handle/10665/353407",
            "retrieval_url": "https://www.medbox.org/dl/627a4de115110145a1723f64",
            "retrieval_note": "WHO IRIS direct download returned its SPA shell on 2026-07-20; the temporary MEDBOX mirror matched the WHO title and ISBN and is fingerprinted below.",
            "local_pdf_sha256": sha256(args.pdf),
            "pdf_committed": False,
        },
        "generated_from": str(args.pdf),
        "review_status": "draft",
        "canonical_write_allowed": False,
        "summary": {
            "canonical_records": expected,
            "extracted_records": len(records),
            "unresolved_records": expected - len(records),
            "same_normalized": exact,
            "review_difference": different,
            "records_with_b_cun_fragments": with_measurement,
            "canonical_writes": 0,
        },
        "issues": issues,
        "records": records,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    unresolved = [item["code"] for item in issues if item["issue"] == "main_entry_not_reliably_extracted"]
    summary_text = f"""# WHO Acupoint Location Extraction Summary

Review-only extraction from the WHO 2008 location standard. The complete PDF is not committed. Canonical writes: **0**.

## Results

| Metric | Count |
| --- | ---: |
| Canonical records | {expected} |
| Reliably extracted records | {len(records)} |
| Unresolved records | {expected - len(records)} |
| Same after normalized comparison | {exact} |
| Location differences needing review | {different} |
| Records with B-cun fragments | {with_measurement} |
| Canonical writes | 0 |

## Unresolved Main Entries

{', '.join(f'`{code}`' for code in unresolved) if unresolved else '(none)'}

These entries have incomplete or malformed PDF text layers. They require page OCR or manual verification; the extractor does not invent them.

## Interpretation

- A location difference is not automatically an error in the canonical file. It is a review prompt.
- `b_cun_fragments` are verbatim short measurement clauses from the extracted WHO location sentence. They are not yet approved `cun_measurement` values.
- WHO location standards do not supply point-specific needling depth, moxibustion, functions, indications, or efficacy.
- Any future merge must be fill-empty/conflict-refusing and separately approved by Ting.
"""
    SUMMARY.write_text(summary_text, encoding="utf-8")
    print(json.dumps(payload["summary"], indent=2))
    if len(records) < 350:
        raise SystemExit("Extraction coverage below safety threshold (350 records)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
