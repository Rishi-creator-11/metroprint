# Customer Product Flow

_Verified 2026-08-29._

## Route map

| Route | File | Type | Purpose |
|---|---|---|---|
| `/` | `src/app/page.tsx` | RSC | Hero, `CATEGORIES` grid, `getPopularProducts()` (6 slugs), how-it-works, contact CTA |
| `/products` | `src/app/products/page.tsx` | RSC (dynamic) | Catalog + category filter; Business Cards shown grouped by slug prefix; BC category link → `/business-cards` |
| `/products/[slug]` | `src/app/products/[slug]/page.tsx` | RSC (dynamic) | PDP for non-BC products |
| `/business-cards` | `src/app/business-cards/page.tsx` | static | 3 group cards (standard/premium/custom) |
| `/business-cards/[group]` | `src/app/business-cards/[group]/page.tsx` | RSC | Products in a group via `getBusinessCardsBySubcategory("Standard"|"Premium"|"Custom")` |
| `/business-cards/[group]/[slug]` | `.../[slug]/page.tsx` | RSC | PDP for BC products (breadcrumb-aware) |
| `/cart` | `src/app/cart/page.tsx` | client | Review cart (localStorage), auth check → `/checkout` |
| `/checkout` | `src/app/checkout/page.tsx` | client | Order summary, notes, "Pay with Stripe" |
| `/checkout/success` | `src/app/checkout/success/page.tsx` | client | Calls `/api/checkout/complete`, shows order number, clears cart |
| `/account` | `src/app/account/page.tsx` | client | Paid order history for the signed-in email |
| `/login`, `/signup` | client | Supabase email/password auth (+ `redirect` param, `sanitizeRedirectPath`) |
| `/request-quote` | `src/app/request-quote/page.tsx` | client | Inquiry form → `POST /api/inquiries` |
| `/contact` | static | Contact info |

## Trace: product page → order

```
1. Route (RSC) calls getProductBySlug(slug)          src/lib/products/products.ts
     ├─ Supabase products WHERE slug=? AND active=true (3s timeout)
     ├─ if option-priced slug: enrichProductFromSeed()  → title/desc/options_schema/subcat from products-data.ts
     ├─ withProductPrice()  → price = dbPrice>0 ? dbPrice : PRODUCT_PRICES[slug] ?? 29.99
     ├─ normalizePricingRules(row.pricing_rules)
     └─ on any failure → seed fallback (mapSeedToProduct)

2. Page renders:
     ├─ getProductDisplayPrice(...)  → "From $X" (display only)
     └─ <ProductAddToCart product={...}/>            src/components/products/ProductAddToCart.tsx  (client)

3. Customer selects options → local `options` state
     └─ useMemo → calculateLinePrice(product.price, product.pricing_rules, options, {slug, category, optionsSchema})
                  src/lib/pricing/pricing.ts        → { lineTotal, unitPrice, orderQuantity, isTierPricing, requiresQuote }
     └─ live price shown; if requiresQuote → "Request Quote" button instead of "Add to Cart"

4. Optional artwork:
     └─ <ArtworkUpload/> → POST /api/upload-artwork (auth req) → Supabase Storage `quote-artwork`
        returns [{name,url}] → held in component state

5. Add to Cart:
     ├─ validate required fields present
     ├─ block if artwork still uploading
     └─ useCart().addItem({ product_slug, product_title, category, selected_options,
                            unit_price, quantity, line_total, is_tier_pricing, image_url, artwork_files })
        CartProvider (src/components/cart/CartProvider.tsx) → localStorage key "metroprint-cart"
        (NO server cart; subtotal = Σ line_total)

6. /cart → "Checkout":
     └─ createClient().auth.getUser(); if none → /login?redirect=/checkout ; else → /checkout

7. /checkout → "Pay with Stripe":
     └─ POST /api/checkout  { items: CartItem[], notes }      src/app/api/checkout/route.ts

8. /api/checkout (SERVER — authoritative):
     ├─ require signed-in user (401 otherwise)
     ├─ reject if any line has quantity === "Custom order" (400 → use quote flow)
     ├─ service role: SELECT slug, price, pricing_rules, category, options_schema
     │                FROM products WHERE slug IN (cart slugs)
     │   (graceful fallback if `pricing_rules` column absent)
     ├─ for each item: basePrice = getProductPrice(slug, db.price)
     │                 result = calculateLinePrice(basePrice, db.pricing_rules, item.selected_options,
     │                                              { slug, category, optionsSchema: db/seed schema })
     │   → item.unit_price / quantity / line_total / is_tier_pricing OVERWRITTEN from result
     ├─ total = Σ line_total  (client values ignored)
     ├─ INSERT quote_requests { order_number (MP-…), customer_name (from user metadata),
     │        email, phone, company_name, product_name, category, selected_options,
     │        cart_items: validatedItems, notes, file_urls: collectArtworkUrls(items),
     │        status:'pending', payment_status:'pending', total_amount: total, user_id }
     ├─ createCheckoutSession(): Stripe Checkout Session, mode=payment,
     │        line_items from validatedItems (unit_amount = round(line_total*100), qty 1),
     │        success_url=/checkout/success?session_id=…, cancel_url=/cart,
     │        metadata { user_id, order_number, order_id }
     ├─ UPDATE quote_requests SET stripe_session_id = session.id
     └─ return { url: session.url } → browser redirects to Stripe

9. Customer pays on Stripe. Two independent fulfillment paths (idempotent):
     A. Webhook  POST /api/stripe/webhook        src/app/api/stripe/webhook/route.ts
        └─ verify signature (STRIPE_WEBHOOK_SECRET) → on checkout.session.completed →
           fulfillPaidCheckoutSession(serviceClient, session)
     B. Success page  POST /api/checkout/complete  src/app/api/checkout/complete/route.ts
        └─ require signed-in user; retrieve session; verify session email == user email;
           fulfillPaidCheckoutSession(serviceClient, session)

10. fulfillPaidCheckoutSession()               src/lib/checkout/fulfill-order.ts
     ├─ only if session.payment_status === 'paid'
     ├─ find row by stripe_session_id, else by metadata.order_id
     ├─ if already 'paid' → return existing (idempotent)
     ├─ UPDATE SET payment_status='paid', status='processing', stripe_session_id
     ├─ notifyOrderPaid(): Promise.allSettled([
     │      sendOrderConfirmationEmail(customer),
     │      sendAdminOrderNotification(NOTIFICATION_EMAIL) ])   src/lib/email.ts (Resend; no-op if unconfigured)
     └─ legacy fallback: reconstruct order from Stripe metadata cart_json if no row (pre-pending-order sessions)

11. /checkout/success shows order_number, calls useCart().clearCart()

12. /account: anon client SELECT quote_requests WHERE email=? AND payment_status='paid' ORDER BY created_at desc
     (⚠ relies on a query filter, not RLS — see DATABASE_MAP.md / CODEBASE_AUDIT.md CRITICAL-1)
```

## Trace: "Custom order" / quote flow

- PDP: selecting quantity `"Custom order"` → `calculateLinePrice` returns
  `requiresQuote: true`, price 0 → the CTA becomes **Request Quote →
  `/request-quote`**.
- `/api/checkout` also hard-rejects any cart containing a `"Custom order"` line.
- `/request-quote` → `POST /api/inquiries` → `INSERT quote_requests
  { category:'Inquiry', payment_status:'unpaid', status:'pending',
    product_name:'Custom Quote Inquiry', notes: message }` + `sendInquiryNotification`.
- Appears in `/admin/dashboard` under "Inquiries".

## Key components

| Component | Role |
|---|---|
| `components/products/ProductAddToCart.tsx` | option form + live price + artwork + add-to-cart (client, ~334 lines — largest component) |
| `components/products/ArtworkUpload.tsx` | multi-file upload to `/api/upload-artwork` |
| `components/products/ProductCard.tsx` / `CategoryCard.tsx` | catalog tiles |
| `components/cart/CartProvider.tsx` | localStorage cart context (`useCart`) |
| `components/orders/OrderItemSpecs.tsx` | renders a `CartItem`'s options + artwork (used in checkout + admin) |
| `components/layout/{SiteLayout,Header,Footer,AnnouncementBar}.tsx` | chrome |

## Key server/lib functions

`getProductBySlug` / `getProducts` / `getBusinessCardsBySubcategory`
(`lib/products/products.ts`) · `calculateLinePrice` / `normalizePricingRules`
(`lib/pricing/pricing.ts`) · `resolveOptionPrices`
(`lib/pricing/business-card-pricing-defaults.ts`) · `getProductPrice` /
`getProductDisplayPrice` (`lib/products/product-prices.ts`) ·
`createCheckoutSession` (`lib/checkout/stripe-checkout.ts`) ·
`fulfillPaidCheckoutSession` (`lib/checkout/fulfill-order.ts`) ·
`generateOrderNumber` / `isInquiry` / `isPaidOrder` (`lib/checkout/order-utils.ts`) ·
`normalizeOrder` (`lib/checkout/quote-normalize.ts`).

## Tables touched

`products` (read: catalog + checkout recompute) · `quote_requests` (write:
pending order, paid update, inquiry; read: account, admin) · storage
`quote-artwork` (write: upload; read: display).
