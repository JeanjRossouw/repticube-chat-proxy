"""
Fix the Tags column on the 8 product CSVs so Shopify Smart Collections work:

  1. Convert semicolon separators to commas (Shopify native import expects ','
     and was reading 'led;akwa;5w;white;blue' as ONE tag).
  2. Append a clean category tag matching the file (e.g. 'lighting'),
     so a Smart Collection rule of `Product tag is equal to lighting`
     pulls exactly the products in that file.

Backups: <file>.csv.tagbak

Run from repo root:  python3 scripts/fix_tags_for_collections.py
"""

from __future__ import annotations

import csv
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "data"
OUT = REPO / "outputs"

FILE_TAG: dict[str, str] = {
    "AquaCube_01_Lighting_CO2_SHOPIFY_COLLECTIONS.csv":             "lighting",
    "AquaCube_02_Pumps_Flow_SHOPIFY_COLLECTIONS.csv":               "pumps-flow",
    "AquaCube_03_Filtration_Accessories_SHOPIFY_COLLECTIONS.csv":   "filtration",
    "AquaCube_04_Decorations_Ornaments_SHOPIFY_COLLECTIONS.csv":    "decorations",
    "AquaCube_05_Hardscape_Decorations_SHOPIFY_COLLECTIONS.csv":    "hardscape",
    "AquaCube_06_DR_Tank_Fertilizers_SHOPIFY_COLLECTIONS.csv":      "dr-tank-fertilizers",
    "AquaCube_07_Voonline_Crash_Accessories_SHOPIFY_COLLECTIONS.csv": "voonline-crash",
    "AquaCube_08_Akwa_Products_SHOPIFY_COLLECTIONS.csv":            "akwa",
}


def main() -> None:
    minimal_rows: list[dict[str, str]] = []
    for fname, cat in FILE_TAG.items():
        path = DATA / fname
        if not path.exists():
            print(f"skip (not found): {fname}")
            continue

        shutil.copy2(path, path.with_suffix(".csv.tagbak"))

        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames or []
            rows = list(reader)

        added = 0
        normalized = 0
        for r in rows:
            raw = (r.get("Tags") or "").strip()
            had_semi = ";" in raw
            parts = [t.strip() for t in raw.replace(";", ",").split(",") if t.strip()]
            # case-insensitive dedupe while preserving order
            seen: set[str] = set()
            deduped: list[str] = []
            for t in parts:
                key = t.lower()
                if key not in seen:
                    seen.add(key)
                    deduped.append(t)
            if cat.lower() not in seen:
                deduped.append(cat)
                added += 1
            if had_semi:
                normalized += 1
            r["Tags"] = ", ".join(deduped)
            minimal_rows.append({"Handle": r["URL handle"], "Tags": r["Tags"]})

        with path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)

        print(f"{fname:60s}  rows={len(rows):3d}  +tag={added:3d}  semi->comma={normalized:3d}  -> tag '{cat}'")

    OUT.mkdir(exist_ok=True)
    minimal_path = OUT / "Tags_Only_Update.csv"
    with minimal_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Handle", "Tags"])
        writer.writeheader()
        writer.writerows(minimal_rows)
    print(f"\nwrote {minimal_path}  ({len(minimal_rows)} rows: Handle + Tags only)")


if __name__ == "__main__":
    main()
