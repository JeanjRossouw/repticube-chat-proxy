# Shipping zones — South Africa only

A complete Shopify shipping setup needs three things: **zones**, **rates**,
and **product weights**. AquaCube's catalog weights are already populated
(40g min, 25 kg max, median 300 g). What's missing is *which courier* and
*what bands*. This doc proposes a standard SA layout you can plug rates
into.

---

## 1. Zone structure

Shopify "shipping profiles" group destinations by rate. For SA-only sales,
three zones cover ~99% of cases:

| Zone | Coverage | Example postcodes |
|---|---|---|
| **Main centres** | JHB / PTA / DBN / CPT / PE / Bloem | 0001–0299, 2000–2199, 4000–4099, 7400–8099, 6000–6099, 9300 |
| **Regional towns** | Other reachable urban areas | most other 4-digit codes |
| **Outlying / rural** | Surcharge zones per courier | Aramex/Courier Guy classify these |

Shopify won't auto-classify by postcode — you set this by **listing the
postcodes** that fall into each zone (paste into *Settings → Shipping →
General shipping rates → Create zone → South Africa → specific
postcodes*). Most SA stores instead use a **courier app** (Bob Go,
Shiplogic, uAfrica) that does live rate lookup at checkout; that's the
easier path if you have >50 SKUs with varying weights.

## 2. Recommended approach: live rates via Bob Go (or Shiplogic)

Manual rate tables are fragile when you have 389 SKUs spanning 40g to
25kg. Use a live-rate app:

| App | Cost | Couriers it covers |
|---|---|---|
| **Bob Go** | R299/mo + per-label | Aramex, Courier Guy, Fastway, PostNet, Pudo |
| **Shiplogic** | R450/mo + per-label | DSV, RAM, Courier IT, Pudo |
| **uAfrica** | R0–R599/mo | Aramex, PostNet, Pudo |

These plug into Shopify *Settings → Shipping → Carrier and app rates at
checkout*. The customer sees the real courier price for their actual
address + cart weight.

## 3. Manual fallback rates (if you skip the app)

If you don't want a live-rate app, here's a defensible flat-rate ladder
for AquaCube's weight distribution (10th–90th percentile = 110g–1600g).

### Per-band rates (suggested — confirm with your chosen courier)

| Weight | Main centres | Regional | Outlying |
|---|---|---|---|
| 0 – 500 g    | R99   | R129  | R179  |
| 500 g – 2 kg | R129  | R169  | R229  |
| 2 – 5 kg     | R189  | R249  | R329  |
| 5 – 10 kg    | R289  | R369  | R489  |
| 10 – 30 kg   | R449  | R569  | R749  |

A few honest notes:
- Heavy items (the 12L Akwa Mini Tank `AQD8003`, hardscape stones) will be
  expensive to ship — consider listing them with a *"shipping calculated
  at checkout"* note rather than free shipping promises.
- 9 SKUs exceed 5 kg, 16 exceed 2 kg, 65 exceed 1 kg.
- **Free shipping threshold**: a common SA aquarium-store offer is
  *Free standard shipping on orders > R750*. Add this as a separate
  rate with conditions: Order value ≥ R750, max weight ≤ 5 kg.

## 4. Configure in Shopify

1. **Settings → Shipping and delivery → General shipping rates → Manage**.
2. Add zone **Main centres**: country South Africa → "Add postcode
   condition" → paste the postcode ranges from §1.
3. Repeat for **Regional** and **Outlying**.
4. For each zone, add rates from the table in §3 with weight conditions:
   - *Add rate → Set up your own rates → Add conditions → Based on item
     weight*.
5. Add a free-shipping rate to **Main centres + Regional** with
   *Minimum order value R750* and *Max weight 5 kg*.
6. In **Settings → Markets → South Africa**: confirm only ZA shows.

## 5. Per-product overrides

- **Live fish / livestock** (if you ever stock them): create a
  separate **Shipping profile** named *Livestock* with main-centre-only
  next-day rates and a "we'll contact you to confirm" note. Assign all
  livestock SKUs to that profile.
- **Oversized hardscape stones (>10 kg, single item)**: same idea —
  separate profile with a flat R600 fee.

## What I need from you to finish this

1. Which courier(s) you'll use (Aramex, Courier Guy, Bob Go-managed,
   other).
2. Their published rate card (PDF or screenshots) so I can replace my
   suggested numbers in §3 with real ones.
3. Whether you want a free-shipping threshold and at what value.
4. Whether you'll list livestock (changes structure).

Once I have those I can output a **Shopify-import-ready CSV** that you
paste into the bulk shipping editor, or write the exact postcode lists.
