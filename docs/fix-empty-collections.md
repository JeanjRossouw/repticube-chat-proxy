# Fix the empty-collection problem

**Problem:** Collection pages (e.g. /collections/lighting) show
*"No products found"* even though you have 389 products imported.

**Root cause:** Two issues compounded:

1. The original CSV used **semicolons** in the Tags column
   (`led;akwa;5w;white;blue`). Shopify's native CSV import treats that
   as ONE tag literally named `led;akwa;5w;white;blue`. So every
   product effectively has no real tags.
2. Five of the eight categories never had a category-level tag at all
   (Pumps/Flow, Filtration, Decorations, DR Tank Fertilizers, Voonline)
   — so Smart Collections matching `tag = pumps-flow` etc. had nothing
   to bind to.

Both are fixed by re-importing the **Tags_Only_Update.csv** in `outputs/`
and then configuring 8 Smart Collections.

---

## Step 1 — re-import tags (5 minutes)

1. Shopify admin → **Products → Import**.
2. Upload `outputs/Tags_Only_Update.csv`.
3. **Tick** *"Publish new products to Online Store"* — irrelevant here
   but harmless.
4. **Tick** *"Overwrite any current products that have the same handle.
   Existing values will be used for any missing columns."*
   This is the key option: because the CSV only contains `Handle` and
   `Tags`, every other product field stays exactly as it is. Prices,
   images, descriptions, SEO — all untouched.
5. Click **Upload and continue → Import**.
6. Shopify will report `389 products updated`.

## Step 2 — configure the 8 Smart Collections

For each collection below, do this in Shopify admin
**→ Products → Collections → [collection name] → edit**:

- Set **Collection type** to **Smart**.
- Set the condition row to: **Product tag · is equal to · [tag value]**.
- Save.

If the collection doesn't exist yet, click **Create collection** first.

| Collection name | Tag value | Approx. product count |
|---|---|---|
| Lighting & CO2 | `lighting` | 36 |
| Pumps & Flow | `pumps-flow` | 55 |
| Filtration & Accessories | `filtration` | 66 |
| Decorations & Ornaments | `decorations` | 38 |
| Hardscape Decorations | `hardscape` | 78 |
| DR Tank & Fertilizers | `dr-tank-fertilizers` | 29 |
| Voonline & Crash Accessories | `voonline-crash` | 34 |
| Akwa Products | `akwa` | 53 |

After saving each, the collection page should show the right count of
products. Visit `/collections/lighting` etc. to confirm.

## Step 3 — add the categories to the main navigation

Shopify admin → **Online Store → Navigation → Main menu → Add menu item**.

Add one menu item per collection (label = collection name, link =
the collection). Or group them under a single **Shop** dropdown:

- *Shop* (parent)
  - Lighting & CO2 → /collections/lighting-co2
  - Pumps & Flow → /collections/pumps-flow
  - Filtration & Accessories → /collections/filtration-accessories
  - Decorations & Ornaments → /collections/decorations-ornaments
  - Hardscape Decorations → /collections/hardscape-decorations
  - DR Tank & Fertilizers → /collections/dr-tank-fertilizers
  - Voonline & Crash → /collections/voonline-crash-accessories
  - Akwa Products → /collections/akwa-products

Save. The Clarity theme header will pick this up automatically.

## Verification checklist

- [ ] Import report shows 389 products updated, 0 errors.
- [ ] /collections/lighting shows ~36 products with thumbnails.
- [ ] Each of the other 7 collection pages shows the expected count.
- [ ] Main menu now lists all 8 categories (either flat or under "Shop").
- [ ] Search for `akwa` on the storefront returns the 53 Akwa products.

## Backups

The script that produced the patched CSVs also wrote backups:
`data/AquaCube_*_SHOPIFY_COLLECTIONS.csv.tagbak`. If anything goes
wrong, replace the patched file with its `.tagbak` and re-run.
