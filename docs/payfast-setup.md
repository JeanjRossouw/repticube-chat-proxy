# Payfast on Shopify — AquaCube setup walkthrough

Payfast is the dominant SA-resident payment gateway and is supported by
Shopify as a third-party provider.

---

## 1. Create the Payfast merchant account

1. Sign up at <https://www.payfast.io/> using the AquaCube business
   email and bank details.
2. Complete FICA verification (CIPC docs, bank confirmation letter,
   director ID). Expect 1–3 business days.
3. Once approved, log in to the merchant dashboard and grab:
   - **Merchant ID**
   - **Merchant Key**
   - **Salt Passphrase** (set this yourself under *Settings → Integration*)

Keep all three out of git and email — treat them like passwords.

## 2. Enable Payfast in Shopify

1. Shopify admin → **Settings → Payments**.
2. Under *Supported payment methods* click **Add payment methods**, search
   "Payfast", select **Payfast Payments**.
3. Paste **Merchant ID**, **Merchant Key**, **Passphrase**.
4. Toggle **Test mode** ON while testing.
5. Click **Activate**.

## 3. Configure store currency

Payfast accepts **ZAR only**.
Shopify admin → **Settings → General → Store currency** → ZAR.
Changing currency later requires Shopify support, so set this before
the first order.

## 4. Configure Payfast settings on the merchant side

Inside the Payfast dashboard:

1. **Settings → Integration**
   - *Notify URL*: leave blank (Shopify auto-handles ITN via its app).
   - *Passphrase*: confirm it matches what you pasted into Shopify.
2. **Settings → Security**
   - Enable **Signature Verification**.
   - Enable **Source IP Verification** (Shopify IPs auto-allow).
3. **Settings → Receivers** — confirm payouts go to the AquaCube bank account.

## 5. Sandbox test before go-live

While Test mode is ON:

1. Place a test order on aquacubesa.co.za with a low-value product.
2. At checkout Payfast will show the **sandbox** form. Use:
   - Card: `4000 0000 0000 0002`
   - CVV: any 3 digits, expiry any future date.
3. Confirm:
   - Order moves to **Paid** in Shopify admin.
   - Refunds work: try a partial refund from Shopify → it should appear
     in the Payfast dashboard within seconds.
   - Email confirmations send to the customer.

## 6. Go live

1. In Shopify → *Payfast settings* toggle **Test mode** OFF.
2. Place one real R10 order from a personal card.
3. Refund yourself.
4. Confirm settlement lands in the AquaCube bank account
   (Payfast settles weekdays, typically T+1 for cards, T+2 for EFT).

## 7. Recommended toggles

- **Enable Instant EFT** (no card needed; popular in SA).
- **Enable Snapscan / Zapper** if you want QR mobile payments.
- **Enable Recurring** only if you ever sell subscriptions (livestock care
  plans, etc.).

## Costs (as of 2025-26 — verify on payfast.io)

- Card: ~3.5% + R2.00 per transaction
- Instant EFT: ~2%
- Refunds: free
- No monthly fee on standard plan

## Common pitfalls

- **Passphrase mismatch** — symptom: customer gets "signature mismatch"
  at checkout. Fix: re-paste passphrase identically into both ends.
- **Test mode left on after launch** — orders look paid in Shopify but
  no real money moves. Always do a real R10 test after the toggle off.
- **Currency mismatch** — if Shopify currency isn't ZAR, Payfast rejects
  the request with cryptic errors.
- **HTTPS required** — Payfast won't accept callbacks to http://. Shopify
  is HTTPS by default; only an issue if you ever build a custom checkout.

## Reference

- Payfast for Shopify: <https://payfast.io/shopify>
- Sandbox card details: <https://developers.payfast.co.za/docs#sandbox_card_details>
- Shopify Payfast docs: <https://help.shopify.com/en/manual/payments/third-party-providers/payfast>
