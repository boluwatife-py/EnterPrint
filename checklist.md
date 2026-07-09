Good instinct to map this out before building further — here's every page the platform needs, organized by what's actually load-bearing for the 10 functions in your original brief versus what can wait. I've cross-checked each core function against a page so nothing's missing a home.

## Marketing (public, no auth)

- [x] `/` — Homepage _(done)_
- [ ] `/about` — Company story, trust-building for a marketplace people haven't heard of yet
- [ ] `/contact` — Distinct from `/support`; this is pre-sale ("can you do X?"), support is post-order
- [x] `/design-request` — _Request designs_

## Catalog

- [x] `/products` — Catalog browser _(done — handles both packaging + print via `?category=`)_
- [x] `/products/[slug]` — Product detail + customizer *(done — covers *Customize products* and *Upload artwork*, since those happen inline here, not as separate pages)*

## Cart & checkout

- [x] `/cart` — _(referenced already, confirm it exists)_
- [x] `/checkout` — Shipping details, artwork proof confirmation step, payment — _Make payments securely_
- [x] `/checkout/confirmation` or `/orders/[id]/confirmation` — Order success page with order number; this is what a payment gateway redirects back to

## Auth

- [x] `/login`
- [x] `/signup`
- [x] `/forgot-password`
- [x] `/reset-password`

## Account (behind auth)

- [x] `/dashboard` — Overview: active orders, quick actions
- [x] `/dashboard/orders` — Order history — _Reorder previous jobs_ (a "Reorder" button per row)
- [x] `/dashboard/orders/[id]` — Single order detail — _Monitor project progress_ + _Track production and delivery_ (logged-in view)
- [x] `/dashboard/messages` — _Communicate with support teams_, scoped to their orders
- [x] `/dashboard/addresses` — Saved delivery addresses
- [x] `/dashboard/settings` — Profile, password, notification prefs

## Guest-accessible tracking & support

- [x] `/track-order` — _Track production and delivery_ for someone who checked out as a guest or lost their dashboard login — enter order number + email, no account needed
- [ ] `/support` — Help center entry point; ticket/chat form for people who aren't (or can't get) into their dashboard

## Legal

- [ ] `/privacy`
- [ ] `/terms`
- [ ] `/shipping-returns` — Print/packaging buyers ask this constantly (turnaround times, defect policy) before ordering — worth having even at MVP

## Framework conventions (not "pages" in the marketing sense, but required)

- [ ] `not-found.tsx` (404)
- [ ] `error.tsx` (error boundary)

---

**If you're prioritizing, here's the honest MVP cut** — the smallest set where all 10 functions from your brief actually work end-to-end: `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/checkout/confirmation`, `/login`, `/signup`, `/dashboard`, `/dashboard/orders`, `/dashboard/orders/[id]`, `/track-order`, `/support`, `/design-request`. That's 13 pages. Everything else (`/about`, `/contact`, `/dashboard/messages` as its own page vs. inline in order detail, saved addresses/payment methods, legal pages) is real but can follow in week two without anything being structurally broken.

One design decision worth making now rather than later: do you want _Communicate with support_ to be its own inbox (`/dashboard/messages`) separate from order detail, or threaded directly inside `/dashboard/orders/[id]` (a chat panel scoped to that one job)? That changes whether `/dashboard/messages` needs to exist as a page at all, and it's easier to decide before you've built either.
