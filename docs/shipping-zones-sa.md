# Shipping — South Africa only

## Policy

| Rule | Value |
|---|---|
| Country served | South Africa only |
| Standard delivery | **R150 flat** |
| Free delivery threshold | **Orders over R1500** |
| Livestock | **None stocked** |

---

## Configure in Shopify

1. Open **Settings → Shipping and delivery**.
2. Under *Shipping*, click **Manage** next to the General shipping
   rates profile.
3. Make sure only **South Africa** is in the *Domestic* zone (delete
   any other zones).
4. Click **Add rate** in the South Africa zone:
   - Rate name: **Standard delivery**
   - *Custom flat rate*: **R150.00**
   - No conditions.
   - Save.
5. Click **Add rate** again:
   - Rate name: **Free delivery (orders over R1500)**
   - *Custom flat rate*: **R0.00**
   - *Add conditions → Based on order price → Minimum*: **R1500.00**
   - Save.

That's it. Shopify automatically shows the customer the cheaper of the
two qualifying rates, so any cart ≥ R1500 sees the free option only.

## Markets settings

**Settings → Markets** → keep only **South Africa** active. Disable the
default *International* market so non-SA shoppers don't see broken
checkout.

## Heads-up about heavy items

Your catalog spans 40 g to 25 kg. The 12 L tank (`AQD8003`, ~25 kg) and a
few large hardscape stones will cost more than R150 to ship via any SA
courier — you'll lose money on those orders unless they cross the R1500
free-shipping line (in which case you lose even more).

Two ways to handle this without changing the simple flat-rate policy:

1. **Bake the courier cost into the product price** for the few heavy
   items. Lift `AQD8003` price by R200–R300; same for any rock >5 kg.
2. **Add an oversized surcharge** as a separate rate scoped to a custom
   *Shipping profile* containing only the heavy SKUs.

Up to you. Easiest path is option 1 — small price tweaks instead of
extra shipping logic.

## Reference

- Shopify shipping rates: <https://help.shopify.com/en/manual/shipping/setting-up-and-managing-your-shipping/shipping-rates>
- Free shipping conditions: <https://help.shopify.com/en/manual/shipping/setting-up-and-managing-your-shipping/shipping-rates#free-shipping>
