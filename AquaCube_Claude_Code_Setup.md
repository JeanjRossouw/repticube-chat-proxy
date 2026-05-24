# AquaCube Shopify Setup - Claude Code Instructions

## Project Overview
- **Store:** aquacubesa.co.za (Shopify)
- **Products:** 389 SKUs across 8 categories
- **Status:** Products imported, need image mapping + bulk updates
- **Timeline:** Days 5-7 (Tidio chat, Payfast, shipping zones)

---

## Files Available for Processing

### Product Inventory (8 CSV files - ready to import)
Located: `/outputs/`

1. **AquaCube_01_Lighting_CO2_SHOPIFY_COLLECTIONS.csv** (36 products)
2. **AquaCube_02_Pumps_Flow_SHOPIFY_COLLECTIONS.csv** (55 products)
3. **AquaCube_03_Filtration_Accessories_SHOPIFY_COLLECTIONS.csv** (66 products)
4. **AquaCube_04_Decorations_Ornaments_SHOPIFY_COLLECTIONS.csv** (38 products)
5. **AquaCube_05_Hardscape_Decorations_SHOPIFY_COLLECTIONS.csv** (78 products)
6. **AquaCube_06_DR_Tank_Fertilizers_SHOPIFY_COLLECTIONS.csv** (29 products)
7. **AquaCube_07_Voonline_Crash_Accessories_SHOPIFY_COLLECTIONS.csv** (34 products)
8. **AquaCube_08_Akwa_Products_SHOPIFY_COLLECTIONS.csv** (53 products)

**CSV Columns:** Title, URL handle, Description, Vendor, Product category, Type, Tags, Published on online store, Status, SKU, Barcode, Option1-3 fields, Price, Compare-at price, Cost per item, Charge tax, Inventory tracker, Inventory quantity, Weight, Requires shipping, Fulfillment service, Gift card, SEO title, SEO description, Google Shopping category, Collections

**Pricing Formula:** (Cost × 1.15 VAT) × 1.30 markup = Final Price

---

## Image Data

### Extracted from Akwa PDF
- **Total images:** 5,910 JPGs
- **Location:** `/outputs/akwa_extracted_images.zip` (17MB)
- **Image files:** akwa_img-000.jpg through akwa_img-5909.jpg
- **File sizes:** Range from 1.2KB (logos) to 425KB (product photos)

### Akwa SKU-to-Image Mapping
Located: `/outputs/Akwa_Image_Mapping_with_Title.csv`

**Columns:** Title, SKU, Image_File, Image_Instructions, Image_Src

**53 Akwa products mapped to specific image files**

---

## Shopify Integration Tasks

### Task 1: Upload Extracted Images to Shopify
**Steps:**
1. Download `akwa_extracted_images.zip`
2. Extract locally
3. In Shopify admin → Settings > Files
4. Upload all 5,910 JPG files
5. Shopify generates CDN URLs (e.g., `https://cdn.shopify.com/s/files/...`)

### Task 2: Map Images to Akwa Products
**Current state:** 53 Akwa products have SKUs but no image URLs

**Mapping logic:**
- Read `Akwa_Image_Mapping_with_Title.csv`
- For each SKU, get assigned image file (e.g., LED0010 → akwa_img-041.jpg)
- Once images uploaded to Shopify, get CDN URL
- Create bulk update CSV with Handle + Image Src columns
- Use Shopify bulk editor to add images

### Task 3: Add Images to Other 336 Products
**Challenge:** Non-Akwa products (Files 1-7) don't have images mapped

**Options:**
1. **Use Bing/Google Image Search URLs** (already generated in `/outputs/AquaCube_Products_with_Image_URLs.csv`)
2. **Use placeholder images** (generic aquarium product photos)
3. **Manual assignment** (pick best image for each product)

---

## Claude Code Tasks

### High-Priority Tasks

**1. Create Shopify Bulk Image Update CSV**
- Input: Akwa product SKUs + extracted image filenames
- Output: CSV with columns [Handle, Image Src, Image Alt Text]
- Process: Match SKU → image file → generate Shopify bulk CSV
- Example row: `akwa-led-5w-white-blue,https://cdn.shopify.com/.../akwa_img-041.jpg,Akwa LED 5W White & Blue Light`

**2. Generate Image Search URLs for Non-Akwa Products**
- Input: Product titles from Files 1-7 (336 products)
- Output: CSV with [Handle, Product Title, Bing Image Search URL]
- Process: Create clickable Bing search links for each product
- Goal: Let user select best image per product

**3. Validate CSV Formatting**
- Input: All 8 Shopify product CSVs
- Output: Validation report (missing fields, formatting errors)
- Check: Required columns present, price format correct, SKUs unique

**4. Create Shopify Bulk Editor Template**
- Input: Product handles + image URLs
- Output: Pre-formatted CSV for Shopify bulk editor
- Columns: Handle, Image Src, Image Alt Text, Image Position
- Format must match Shopify's bulk editor requirements

**5. Map All 5,910 Extracted Images to Products**
- Input: 5,910 image files + 389 product SKUs
- Output: CSV with [SKU, Product Title, Image File, Image URL (placeholder)]
- Process: Intelligently assign images (e.g., LED products get product photos, not logos)

---

## Database Structure

### Product Data
```
SKU | Title | URL Handle | Price | Cost | Inventory | Category | Collection | Image URL
LED0010 | Akwa LED 5W White & Blue Light | akwa-led-5w-white-blue | 156.98 | 120.75 | 10 | Lighting | Lighting | [NULL]
...
```

### Image Mapping
```
SKU | Image File | Image URL | Image Alt Text
LED0010 | akwa_img-041.jpg | [NULL - needs Shopify CDN URL] | Akwa LED 5W White & Blue Light
...
```

### Categories
19 total collections:
- Lighting, CO2 & Dosing, Pumps & Filters, Filtration, Decorations, Hardscape, Backgrounds, Plants, Substrate, Tanks, Heaters, Maintenance, Aeration, Food, Feeding, Water Treatment, Water Testing, Accessories, Breeding

---

## Shopify API / Technical Notes

### CSV Import Requirements
- **Encoding:** UTF-8
- **Delimiter:** Comma
- **Line endings:** LF
- **Image URLs:** Must be public HTTPS URLs (not local paths)
- **Max file size:** 50MB per import
- **Max products per import:** ~500 (split into batches)

### Bulk Editor Limitations
- Can update max 250 products per batch
- Changes apply immediately (no preview)
- Image URLs must be hosted (Shopify CDN or external)

### Collections Auto-Assignment
- CSV column: `Collections` (e.g., "Lighting" or "Pumps & Filters")
- Must exactly match collection name in Shopify
- Multiple collections per product: Separate with comma (e.g., "Lighting, Featured")

---

## Next Steps (In Order)

### Week 1 (Days 5-7)
- [ ] Extract images from Akwa PDF (DONE - 5,910 files)
- [ ] Upload images to Shopify Files
- [ ] Create bulk image CSV for Akwa products (53)
- [ ] Bulk update Akwa products with images

### Week 2 (Days 8-10)
- [ ] Map images to remaining 336 products (Files 1-7)
- [ ] Either: Use Bing Image Search URLs OR manually select images
- [ ] Bulk update remaining products with images

### Week 3 (Days 11-14)
- [ ] Tidio chat setup
- [ ] Payfast payment gateway
- [ ] Shipping zones (SA only)

### Week 4 (Days 15-30)
- [ ] QA testing (checkout, images, shipping)
- [ ] Final optimizations
- [ ] LAUNCH

---

## File Locations

**Shopify Product CSVs:**
- `/outputs/AquaCube_*_SHOPIFY_COLLECTIONS.csv` (8 files)

**Image Files:**
- `/outputs/akwa_extracted_images.zip` (zipped, 17MB)
- `/outputs/akwa_extracted_images/` (unzipped folder)

**Mapping Files:**
- `/outputs/Akwa_Image_Mapping_with_Title.csv` (53 Akwa products)
- `/outputs/AquaCube_Products_with_Image_URLs.csv` (389 products + Bing search URLs)

**Reference:**
- `/outputs/AquaCube_Business_Plan_2026.md` (Full strategy)
- `/outputs/AquaCube_Shopify_Categories.txt` (19 collections)

---

## Key Contacts / Resources

**Shopify Bulk Editor:** https://help.shopify.com/en/manual/products/edit-products/bulk-edit
**Shopify CSV Import:** https://help.shopify.com/en/manual/products/import-export/import-products
**CSV Validation:** Use Claude Code to validate before import

---

## Summary for Claude Code

**Main Goal:** Map 5,910 extracted images to 389 products and create Shopify-ready bulk import CSVs

**Priority 1:** Create working bulk image CSV for 53 Akwa products
**Priority 2:** Generate image search links for 336 remaining products  
**Priority 3:** Validate all 8 product CSVs for Shopify import

**Output Format:** CSV files ready for Shopify bulk editor / import

---

