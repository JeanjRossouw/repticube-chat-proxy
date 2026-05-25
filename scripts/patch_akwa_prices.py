"""
Patch the Akwa product CSV with real Cost / Price / Compare-at price values
from data/Akwa_Cost_Prices.csv.

Rules:
- Cost per item        = Cost_Excl_VAT (true cost to a VAT-registered seller)
- Selling_Price_30pct  = Cost_Excl_VAT * 1.15 * 1.30  (supplier-computed)
- Price                = max(Selling_Price_30pct, MAP) when MAP is set,
                         else Selling_Price_30pct
- Compare-at price     = blank (no fake-discount strike-throughs)
- If supplier row is N/A, set Status=draft and leave prices at 0; flag it.

Run from repo root:  python3 scripts/patch_akwa_prices.py
"""

from __future__ import annotations

import csv
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "data"
PRODUCT_CSV = DATA / "AquaCube_08_Akwa_Products_SHOPIFY_COLLECTIONS.csv"
COST_CSV = DATA / "Akwa_Cost_Prices.csv"


def parse_money(value: str) -> float | None:
    v = (value or "").strip()
    if not v or v.upper() == "N/A":
        return None
    try:
        return float(v.replace(",", ""))
    except ValueError:
        return None


def round_money(x: float) -> str:
    return f"{round(x + 1e-9, 2):.2f}"


def main() -> int:
    if not PRODUCT_CSV.exists() or not COST_CSV.exists():
        print("error: input file missing", file=sys.stderr)
        return 1

    # Load cost sheet keyed by SKU (our SKU, not Actual_Akwa_SKU).
    cost_by_sku: dict[str, dict] = {}
    with COST_CSV.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            sku = (row["SKU"] or "").strip()
            if sku:
                cost_by_sku[sku] = row

    # Load existing Akwa product CSV.
    with PRODUCT_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        rows = list(reader)

    updated = 0
    map_applied = 0
    parked_draft: list[str] = []
    missing_cost: list[str] = []
    no_change: list[str] = []

    for r in rows:
        sku = (r["SKU"] or "").strip()
        c = cost_by_sku.get(sku)
        if not c:
            missing_cost.append(sku)
            continue

        cost_excl = parse_money(c["Cost_Excl_VAT"])
        sell_30 = parse_money(c["Selling_Price_30pct_Markup"])
        map_price = parse_money(c["Akwa_MAP_Price"])

        if cost_excl is None or sell_30 is None:
            r["Status"] = "draft"
            parked_draft.append(sku)
            continue

        # Apply MAP floor when present.
        if map_price is not None and map_price > sell_30:
            price = map_price
            map_applied += 1
        else:
            price = sell_30

        r["Cost per item"] = round_money(cost_excl)
        r["Price"] = round_money(price)
        r["Compare-at price"] = ""
        updated += 1

    # Backup before overwrite.
    backup = PRODUCT_CSV.with_suffix(".csv.bak")
    shutil.copy2(PRODUCT_CSV, backup)

    with PRODUCT_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

    print(f"backup     : {backup.name}")
    print(f"updated    : {updated}/{len(rows)} rows with Price + Cost")
    print(f"MAP floor  : {map_applied} rows had MAP > 30% markup -> Price = MAP")
    print(f"draft      : {len(parked_draft)} rows ({parked_draft}) parked at Status=draft (supplier N/A)")
    print(f"missing    : {len(missing_cost)} rows not in cost sheet ({missing_cost})")
    print(f"unchanged  : {len(no_change)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
