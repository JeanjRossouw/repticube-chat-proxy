"""
AquaCube Shopify build tasks.

Reads the 8 product CSVs + Akwa image mapping from ../data/, writes:
  outputs/validation_report.md
  outputs/Akwa_Bulk_Image_Update.csv         (Task 1)
  outputs/NonAkwa_Image_Search_URLs.csv      (Task 2)

Run from repo root:  python3 scripts/aquacube_build.py
"""

from __future__ import annotations

import csv
import re
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote_plus

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "data"
OUT = REPO / "outputs"
OUT.mkdir(exist_ok=True)

PRODUCT_FILES = [
    "AquaCube_01_Lighting_CO2_SHOPIFY_COLLECTIONS.csv",
    "AquaCube_02_Pumps_Flow_SHOPIFY_COLLECTIONS.csv",
    "AquaCube_03_Filtration_Accessories_SHOPIFY_COLLECTIONS.csv",
    "AquaCube_04_Decorations_Ornaments_SHOPIFY_COLLECTIONS.csv",
    "AquaCube_05_Hardscape_Decorations_SHOPIFY_COLLECTIONS.csv",
    "AquaCube_06_DR_Tank_Fertilizers_SHOPIFY_COLLECTIONS.csv",
    "AquaCube_07_Voonline_Crash_Accessories_SHOPIFY_COLLECTIONS.csv",
    "AquaCube_08_Akwa_Products_SHOPIFY_COLLECTIONS.csv",
]
AKWA_FILE = "AquaCube_08_Akwa_Products_SHOPIFY_COLLECTIONS.csv"
MAPPING_FILE = "Akwa_Image_Mapping_with_Title.csv"

REQUIRED_COLS = [
    "Title", "URL handle", "SKU", "Price", "Cost per item",
    "Inventory quantity", "Status", "Collections",
]
HANDLE_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def load_csv(path: Path) -> tuple[list[str], list[dict]]:
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return reader.fieldnames or [], list(reader)


def num(value: str) -> float | None:
    if value is None or value.strip() == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def validate() -> tuple[list[str], dict[str, list[dict]]]:
    """Returns (report_lines, per-file rows) and prints summary."""
    lines: list[str] = ["# AquaCube CSV Validation Report", ""]
    all_skus: dict[str, str] = {}      # sku -> file
    all_handles: dict[str, str] = {}   # handle -> file
    per_file: dict[str, list[dict]] = {}
    canonical_headers: list[str] | None = None

    total_products = 0
    total_errors = 0
    total_warnings = 0

    for fname in PRODUCT_FILES:
        path = DATA / fname
        headers, rows = load_csv(path)
        per_file[fname] = rows
        total_products += len(rows)

        errors: list[str] = []
        warnings: list[str] = []

        # Header consistency
        if canonical_headers is None:
            canonical_headers = headers
        elif headers != canonical_headers:
            extra = set(headers) - set(canonical_headers)
            missing = set(canonical_headers) - set(headers)
            errors.append(
                f"Header mismatch vs file 01. extra={sorted(extra)} missing={sorted(missing)}"
            )

        # Required columns
        for col in REQUIRED_COLS:
            if col not in headers:
                errors.append(f"Missing required column: {col}")

        for idx, row in enumerate(rows, start=2):  # row 1 = header
            sku = (row.get("SKU") or "").strip()
            handle = (row.get("URL handle") or "").strip()
            title = (row.get("Title") or "").strip()

            if not title:
                errors.append(f"row {idx}: empty Title")
            if not sku:
                errors.append(f"row {idx}: empty SKU (title={title!r})")
            else:
                if sku in all_skus:
                    errors.append(
                        f"row {idx}: duplicate SKU {sku!r} (also in {all_skus[sku]})"
                    )
                else:
                    all_skus[sku] = fname

            if not handle:
                errors.append(f"row {idx}: empty URL handle (SKU={sku})")
            else:
                if not HANDLE_RE.match(handle):
                    warnings.append(
                        f"row {idx}: handle {handle!r} not in lowercase-hyphen form"
                    )
                if handle in all_handles:
                    errors.append(
                        f"row {idx}: duplicate handle {handle!r} (also in {all_handles[handle]})"
                    )
                else:
                    all_handles[handle] = fname

            price = num(row.get("Price", ""))
            cost = num(row.get("Cost per item", ""))
            if price is None:
                errors.append(f"row {idx} ({sku}): Price is not numeric ({row.get('Price')!r})")
            elif price <= 0:
                warnings.append(f"row {idx} ({sku}): Price is {price} (zero/negative)")
            if cost is None:
                errors.append(f"row {idx} ({sku}): Cost per item not numeric ({row.get('Cost per item')!r})")

            inv = num(row.get("Inventory quantity", ""))
            if inv is None:
                warnings.append(f"row {idx} ({sku}): Inventory quantity not numeric")

            status = (row.get("Status") or "").strip().lower()
            if status not in {"active", "draft", "archived"}:
                warnings.append(f"row {idx} ({sku}): Status={status!r} (expected active/draft/archived)")

            collections = (row.get("Collections") or "").strip()
            if not collections:
                warnings.append(f"row {idx} ({sku}): empty Collections")

        total_errors += len(errors)
        total_warnings += len(warnings)
        lines.append(f"## {fname}  ({len(rows)} rows)")
        lines.append(f"- errors: {len(errors)}")
        lines.append(f"- warnings: {len(warnings)}")
        if errors:
            lines.append("\n**Errors:**")
            for e in errors[:50]:
                lines.append(f"- {e}")
            if len(errors) > 50:
                lines.append(f"- ... and {len(errors) - 50} more")
        if warnings:
            lines.append("\n**Warnings (first 20):**")
            for w in warnings[:20]:
                lines.append(f"- {w}")
            if len(warnings) > 20:
                lines.append(f"- ... and {len(warnings) - 20} more")
        lines.append("")

    lines.insert(2, f"- Total products: {total_products}")
    lines.insert(3, f"- Unique SKUs: {len(all_skus)}")
    lines.insert(4, f"- Unique handles: {len(all_handles)}")
    lines.insert(5, f"- Total errors: {total_errors}")
    lines.insert(6, f"- Total warnings: {total_warnings}")
    lines.insert(7, "")

    return lines, per_file


def build_akwa_bulk_image_csv(per_file: dict[str, list[dict]]) -> tuple[int, int, list[str]]:
    """Task 1: produce [Handle, Image Src, Image Alt Text] for the 53 Akwa products."""
    notes: list[str] = []
    mapping_path = DATA / MAPPING_FILE
    _, mapping_rows = load_csv(mapping_path)

    akwa_rows = per_file[AKWA_FILE]
    sku_to_handle = {(r["SKU"] or "").strip(): (r["URL handle"] or "").strip() for r in akwa_rows}
    sku_to_title = {(r["SKU"] or "").strip(): (r["Title"] or "").strip() for r in akwa_rows}

    output_rows: list[dict] = []
    matched = 0
    unmatched = 0
    PLACEHOLDER = "https://cdn.shopify.com/REPLACE_WITH_CDN_PATH/{img}"
    for m in mapping_rows:
        sku = (m["SKU"] or "").strip()
        img = (m["Image_File"] or "").strip()
        title = (m["Title"] or "").strip()
        handle = sku_to_handle.get(sku)
        if not handle:
            unmatched += 1
            notes.append(f"mapping SKU {sku!r} ({title}) has no matching Akwa product")
            continue
        matched += 1
        # If mapping already supplies an Image_Src, prefer it; else placeholder.
        src = (m.get("Image_Src") or "").strip() or PLACEHOLDER.format(img=img)
        alt = sku_to_title.get(sku) or title
        output_rows.append({
            "Handle": handle,
            "Image Src": src,
            "Image Alt Text": alt,
            "Image Position": 1,
            "_SKU": sku,
            "_Image File": img,
        })

    out_path = OUT / "Akwa_Bulk_Image_Update.csv"
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["Handle", "Image Src", "Image Alt Text", "Image Position", "_SKU", "_Image File"],
        )
        writer.writeheader()
        writer.writerows(output_rows)

    return matched, unmatched, notes


def build_nonakwa_search_urls(per_file: dict[str, list[dict]]) -> tuple[int, list[str]]:
    """Task 2: Bing image search URLs for the 336 non-Akwa products."""
    notes: list[str] = []
    out_rows: list[dict] = []
    for fname, rows in per_file.items():
        if fname == AKWA_FILE:
            continue
        for r in rows:
            title = (r["Title"] or "").strip()
            handle = (r["URL handle"] or "").strip()
            sku = (r["SKU"] or "").strip()
            vendor = (r.get("Vendor") or "").strip()
            if not title or not handle:
                notes.append(f"skipping row in {fname} (missing title/handle), SKU={sku}")
                continue
            if vendor and not title.lower().startswith(vendor.lower()):
                query = f"{vendor} {title}"
            else:
                query = title
            url = "https://www.bing.com/images/search?q=" + quote_plus(query)
            out_rows.append({
                "Handle": handle,
                "SKU": sku,
                "Product Title": title,
                "Vendor": vendor,
                "Source File": fname,
                "Bing Image Search URL": url,
                "Image Src": "",
            })

    out_path = OUT / "NonAkwa_Image_Search_URLs.csv"
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["Handle", "SKU", "Product Title", "Vendor", "Source File", "Bing Image Search URL", "Image Src"],
        )
        writer.writeheader()
        writer.writerows(out_rows)

    return len(out_rows), notes


def main() -> int:
    if not DATA.exists():
        print(f"error: {DATA} not found", file=sys.stderr)
        return 1

    report, per_file = validate()
    matched, unmatched, akwa_notes = build_akwa_bulk_image_csv(per_file)
    n_search, search_notes = build_nonakwa_search_urls(per_file)

    extra = ["", "## Task outputs", ""]
    extra.append(f"- `Akwa_Bulk_Image_Update.csv`: {matched} mapped rows, {unmatched} unmatched mapping rows")
    extra.append(f"- `NonAkwa_Image_Search_URLs.csv`: {n_search} rows")
    if akwa_notes:
        extra.append("\n**Akwa mapping notes:**")
        for n in akwa_notes:
            extra.append(f"- {n}")
    if search_notes:
        extra.append("\n**Non-Akwa search notes:**")
        for n in search_notes:
            extra.append(f"- {n}")
    report.extend(extra)

    (OUT / "validation_report.md").write_text("\n".join(report), encoding="utf-8")
    print((OUT / "validation_report.md").read_text(encoding="utf-8")[:4000])
    print("---")
    print(f"wrote {OUT/'validation_report.md'}")
    print(f"wrote {OUT/'Akwa_Bulk_Image_Update.csv'}  ({matched} rows)")
    print(f"wrote {OUT/'NonAkwa_Image_Search_URLs.csv'}  ({n_search} rows)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
