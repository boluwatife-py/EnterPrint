# ENTERPRINT — Backend API Specification

**This document describes what the backend actually implements**, as of the
current codebase — not the original mock-derived draft. Several shapes
changed during the build (auth in particular). Anywhere this differs from
the old `endpoint.md`, it's called out explicitly under **⚠️ Changed from
original spec**.

## Conventions

- **Base URL:** `http://localhost:8000/v1` (local) — prefix is
  `settings.api_v1_prefix`, currently `/v1`.
- **Format:** JSON (`Content-Type: application/json`). File uploads use
  `multipart/form-data`.
- **Auth:** `Authorization: Bearer <accessToken>` on protected routes.
  Refresh token is **not** sent in the body — see §1.
- **Money:** integers in **Naira (NGN)**, no decimals (e.g. `unitPrice: 610`,
  `total: 157000`).
- **Dates:** order/tracking dates are `YYYY-MM-DD`. `/track`'s dates render
  as `"Jul 1, 2026"` (its own format, see §8). Message/thread timestamps are
  full ISO 8601.
- **IDs:** orders are human-readable (`EP-24815`), threads (`THR-24815`),
  messages (`msg_xxxxxxxxxxxx`), design requests (`dr_xxxxxxxxxxxx`).
  Users/addresses are 32-char hex.

### Standard error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Enter a valid email address.",
    "fields": { "email": "Enter a valid email address." }
  }
}
```

`code` values: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN`
(403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429),
`SERVER_ERROR` (500).

> ⚠️ **One inconsistency to guard against:** `require_admin` (used to gate
> catalog writes and uploaded product images) raises a plain FastAPI
> `HTTPException`, not the app's `AppException`. Its 403 body is
> `{"detail": "Admin access required"}`, **not** the `{error: {...}}`
> envelope above. If your error-handling code assumes `error.code` always
> exists, guard for this specific case (or ask backend to route it through
> `ForbiddenError` instead, which is a one-line fix).

### Paginated list envelope

```json
{ "data": [], "page": 1, "pageSize": 20, "total": 42 }
```

Not every list endpoint uses this — see each section.

---

## 1. Authentication

⚠️ **Changed from original spec — read this whole section before wiring
`auth-context.tsx`.**

- **No `company` or `role` field anywhere.** Signup, the `User` model, and
  every response that includes a user object were all built without them.
  If your signup form still has a company field, drop it — the backend
  will ignore it (`extra="ignore"` isn't set on these schemas, so sending
  it will actually get rejected as an unrecognized field... confirm this
  against your Pydantic strictness before assuming it's silently dropped).
- **Refresh token is never in a JSON body.** It's set as an **HttpOnly
  cookie** (`refresh_token`) by the server on login/verify/2fa/refresh, and
  cleared on logout. Your frontend never reads or stores it — the browser
  handles it automatically as long as requests are made
  with `credentials: "include"` (fetch) or `withCredentials: true` (axios).
- Signup requires **`confirmPassword`** in the request (not just `password`).
- Password strength is enforced server-side beyond "8 chars": needs at least
  one uppercase, one lowercase, one digit, and one symbol. Surface these
  requirements in your form's validation, not just length.
- Phone numbers are validated with real E.164/libphonenumber rules — must
  arrive with a leading `+` and country code (this matches what
  `react-phone-number-input`'s default emits, so if you're already using
  that component you're fine as-is).

### `POST /auth/signup`

**Request**

```json
{
  "name": "Amara Okafor",
  "email": "amara@brightleafco.com",
  "phoneNumber": "+2348030000000",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

Rules: `name` ≥ 2 chars, valid email, valid E.164 phone, `password` ≥ 8
chars with upper/lower/digit/symbol, `confirmPassword` must match.

**Response `201`**

```json
{
  "status": "REQUIRES_EMAIL_VERIFICATION",
  "message": "Account created. Verification email sent.",
  "email": "amara@brightleafco.com"
}
```

**Errors:** `409 CONFLICT` if email already exists; `400 VALIDATION_ERROR`
for any of the rules above.

### `POST /auth/login`

Rate limited: **5/minute**.

**Request**

```json
{ "email": "amara@brightleafco.com", "password": "Password123!" }
```

**Response `200` (success)** — sets `refresh_token` HttpOnly cookie as a
side effect:

```json
{
  "user": {
    "id": "usr_123",
    "name": "Amara Okafor",
    "email": "amara@brightleafco.com",
    "phoneNumber": "+2348030000000",
    "initials": "AO",
    "emailVerified": true,
    "requires2FA": false
  },
  "accessToken": "eyJhb..."
}
```

Note: **no `refreshToken` field** — it's the cookie. No `company`/`role` on
`user`.

**Response `200` (flow interrupts)**

```json
{ "status": "REQUIRES_EMAIL_VERIFICATION", "email": "amara@brightleafco.com" }
```

```json
{ "status": "REQUIRES_2FA", "email": "amara@brightleafco.com", "challengeId": "chg_abc" }
```

**Errors:** `401 UNAUTHORIZED` for bad credentials.

### `POST /auth/verify-email`

**Request** `{ "email": "...", "code": "123456" }` → **`200`** — same shape
as login's success response (`{ user, accessToken }`, cookie set).

### `POST /auth/2fa-challenge`

**Request** `{ "challengeId": "chg_abc", "code": "123456" }` → **`200`** —
same shape as login's success response.

### `POST /auth/forgot-password`

**Request** `{ "email": "..." }` → **`200`**
`{ "message": "If that account exists, a reset link was sent." }`
(always 200, doesn't leak whether the account exists).

### `POST /auth/reset-password`

**Request** `{ "token": "...", "newPassword": "..." }` (same strength rules
as signup) → **`200`** `{ "message": "Password updated." }`.
**Errors:** `400` invalid/expired token, `400 VALIDATION_ERROR` for a weak
password.

### `POST /auth/refresh`

⚠️ **No request body at all.** The refresh token is read from the
`refresh_token` cookie automatically — just `POST` with an empty body and
`credentials: "include"`.

**Response `200`**

```json
{ "accessToken": "eyJhb..." }
```

A **new** refresh cookie is also set (rotation) — nothing for the client to
do beyond letting the browser handle the `Set-Cookie`.

**Errors:** `401 UNAUTHORIZED` if the cookie is missing/invalid/expired —
treat as "log the user out."

### `POST /auth/logout`

⚠️ **No request body.** Reads the cookie, revokes it server-side, clears
it. → **`204`**.

---

## 2. Account, Profile & Settings

All routes below require `Authorization: Bearer <accessToken>`.

### `GET /account/me`

**`200`** → same `user` shape as login (`id`, `name`, `email`,
`phoneNumber`, `initials`, `emailVerified`, `requires2FA`). No
`company`/`role`.

### `PATCH /account/profile`

**Request** (any subset) `{ "name": "...", "phoneNumber": "..." }` —
⚠️ **no `company` field**, it doesn't exist on the model.
→ **`200`** updated `user`.

### `PATCH /account/password`

**Request**

```json
{
  "currentPassword": "...",
  "newPassword": "...",
  "confirmPassword": "..."
}
```

⚠️ Needs `confirmPassword` too, same as signup — server validates the two
match. → **`200`** `{ "message": "Password changed." }`.
**Errors:** `400` if current password is wrong, `400 VALIDATION_ERROR` if
new/confirm mismatch or weak.

### 2FA management

- `POST /account/2fa/enable` → `200` `{ "otpauthUrl": "otpauth://...", "secret": "BASE32" }`
- `POST /account/2fa/confirm` → `{ "code": "123456" }` → `200` `{ "requires2FA": true }`
- `POST /account/2fa/disable` → `{ "code": "123456" }` → `200` `{ "requires2FA": false }`

### `GET` / `PATCH /account/notifications`

Unchanged from original spec:

```json
{
  "orderUpdates":    { "email": true,  "sms": true  },
  "proofReady":      { "email": true,  "sms": true  },
  "deliveryUpdates": { "email": true,  "sms": false },
  "messages":        { "email": true,  "sms": false },
  "promotions":      { "email": false, "sms": false }
}
```

`PATCH` accepts the same shape, all five keys required → **`200`** returns
saved preferences.

### `DELETE /account`

**Request** `{ "password": "...", "confirm": "..." }` → **`204`**.
`confirm` is checked as a plain string match against whatever value the
backend expects (confirm the exact literal with backend — likely still
`"DELETE"`, but verify).

---

## 3. Addresses

⚠️ **Changed from original spec** — different field names, no `POST
/default` endpoint, `PUT` instead of `PATCH` for updates, plain array
instead of `{ data: [...] }`.

All routes require `Authorization: Bearer <accessToken>`.

### Address object

```json
{
  "id": "a1b2c3d4e5f6...",
  "title": "Home",
  "streetAddress": "14 Awolowo Road, Flat 3B",
  "city": "Ikoyi",
  "state": "Lagos",
  "country": "Nigeria",
  "isDefault": true
}
```

⚠️ There is **no `label`, `fullName`, `phone`, `line1`/`line2`, or
`postalCode`** — this app's `Address` collapsed those into a single
`streetAddress` free-text field, and dropped `postalCode`/per-address
contact info entirely. `country` defaults to `"Nigeria"` if omitted.
`state` is **not validated server-side** against `NIGERIAN_STATES` — do
that constraint on the frontend if you still want it enforced.

### `GET /account/addresses`

**`200`** → **plain array**, not `{ data: [...] }`:

```json
[
  { "id": "...", "title": "Home", "streetAddress": "...", "city": "...", "state": "...", "country": "Nigeria", "isDefault": true }
]
```

Sorted with the default address first.

### `POST /account/addresses`

**Request**

```json
{
  "title": "Home",
  "streetAddress": "14 Awolowo Road, Flat 3B",
  "city": "Ikoyi",
  "state": "Lagos",
  "country": "Nigeria",
  "isDefault": true
}
```

`country` optional (defaults `"Nigeria"`), `isDefault` optional (defaults
`false`). → **`201`** created address. If `isDefault: true`, every other
address for this user is automatically unset as default — no separate call
needed.

### `PUT /account/addresses/:id`

⚠️ **`PUT`, not `PATCH`** — but behaves like a partial update anyway
(every field optional, only sent fields are applied). Same body shape as
create, all fields optional. → **`200`** updated address.

### `DELETE /account/addresses/:id`

**`204`**. No special handling is coded for deleting the current default —
if you delete the default address, nothing auto-promotes another one to
default. Handle that on the frontend (or flag to backend if you want
server-side auto-promotion added).

### ~~`POST /account/addresses/:id/default`~~

**Does not exist.** To set an address as default, `PUT` it with
`{ "isDefault": true }` — that alone triggers the "unset all others" logic.

---

## 4. Catalog (Products & Categories)

Read endpoints are public. Write endpoints (`POST`/`PATCH`/`DELETE`) need
`Authorization: Bearer <accessToken>` **and** the user must have
`is_admin: true` — otherwise `403`. These writes weren't in the original
spec at all; they exist for your own admin tooling / seeding, not the
customer-facing storefront, but documented here in case you build an admin
panel against this backend.

### `GET /categories`

**`200`**

```json
{
  "data": [
    {
      "slug": "boxes-packaging",
      "name": "Boxes & Packaging",
      "description": "Custom mailer boxes...",
      "image": "/products/kraft-mailer-box.png",
      "icon": "package"
    }
  ]
}
```

### `GET /products`

**Query:** `?category=boxes-packaging&search=box&popular=true&page=1&pageSize=20`

**`200`** → paginated (`{ data, page, pageSize, total }`).

### `GET /products/:slug`

**`200`** → single `Product`, unchanged shape from original spec:

```json
{
  "id": "kraft-mailer-box",
  "slug": "kraft-mailer-box",
  "name": "Custom Kraft Mailer Box",
  "categorySlug": "boxes-packaging",
  "tagline": "...",
  "description": "...",
  "image": "/products/kraft-mailer-box.png",
  "basePrice": 850,
  "rating": 4.8,
  "reviews": 214,
  "tags": ["E-commerce", "Corrugated", "Eco-friendly"],
  "popular": true,
  "turnaroundDays": 7,
  "features": ["Food-grade safe inks", "Recyclable materials"],
  "options": [
    {
      "id": "size",
      "label": "Size",
      "values": [
        { "id": "small", "label": "Small (20x15x8cm)", "priceMultiplier": 1 },
        { "id": "medium", "label": "Medium (30x22x10cm)", "priceMultiplier": 1.4 }
      ]
    }
  ],
  "quantityTiers": [
    { "qty": 50, "unitPrice": 850 },
    { "qty": 100, "unitPrice": 720 }
  ]
}
```

Note: `options[].id` is auto-derived by slugifying `label` (`"Print
Finish"` → `"print-finish"`) — it's not a separately stored code, so it'll
always match whatever the label currently is.

**Errors:** `404 NOT_FOUND` for an unknown slug.

### `POST /pricing/quote`

**Request**

```json
{
  "productSlug": "kraft-mailer-box",
  "quantity": 250,
  "options": { "size": "medium", "material": "recycled", "finish": "matte" }
}
```

`options` keys must be the slugified group ids from that product's
`options[].id` (e.g. `"print-finish"`, not `"Print Finish"`).

**`200`**

```json
{ "unitPrice": 610, "quantity": 250, "subtotal": 152500, "currency": "NGN" }
```

**Errors:** `404 NOT_FOUND` for an unknown `productSlug`.

### Admin-only writes (new, not in original spec)

- `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`
  (soft-delete)
- `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`
  (soft-delete)

`PATCH` on both only applies fields you actually send
(`exclude_unset`) — omitted fields are left alone. On `ProductUpdate`,
`options` and `quantityTiers`, if sent, **fully replace** the existing
set rather than merging.

---

## 5. Uploads

⚠️ **Three separate upload endpoints, not one** — original spec only
documented `/uploads/artwork`. Use the right one for the right context.

### `POST /uploads/artwork` — checkout artwork

`multipart/form-data`, field `files` (list). **No auth required.** Rate
limited: **5/minute**. Max 15MB per file.

**`201`**

```json
{
  "files": [
    { "id": "file_a1b2c3d4", "name": "logo-final.pdf", "url": "https://cdn/.../logo-final.pdf", "kind": "file", "size": "2.4 MB" }
  ]
}
```

⚠️ `kind` is **always `"file"`** here regardless of actual content type —
this endpoint doesn't do real MIME-based kind detection. Use this for the
cart/checkout artwork flow only (feeds `ArtworkInfo.fileIds` in §6). Not
persisted with an owner/DB row — just stored and a URL handed back.

### `POST /uploads/attachments` — chat/thread attachments

`multipart/form-data`, field `files` (list). **Requires
`Authorization: Bearer <accessToken>`.** Rate limited: **15/minute**.

**`201`**

```json
{
  "files": [
    { "id": "atc_xxxxx", "name": "revised-logo.png", "url": "https://cdn/...", "kind": "image", "size": "1.1 MB" }
  ]
}
```

`kind` here **is** real content-type detection (`image`/`video`/`file`),
and each upload is persisted with the uploading user as owner — this is
what backs `attachmentIds` in `POST /threads/:id/messages` (§7). A message
can only reference attachment ids that this same user uploaded.

### `POST /uploads/image` — admin/catalog images

Admin-only (`is_admin: true`), single file, field `file`. PNG/JPEG/WEBP/GIF
only, max 5MB.

**`201`** `{ "url": "https://cdn/..." }`

Used for product/category images via the admin catalog endpoints in §4 —
not part of the customer-facing flow.

---

## 6. Orders & Checkout

All routes require `Authorization: Bearer <accessToken>` unless noted.

⚠️ **Changed from original spec:**
- `POST /orders` does **not** accept `paymentReference` in the body — the
  backend mints it server-side and hands it to Paystack. Don't send it.
- Every order response now includes **`threadId`** — the support thread
  for that order is auto-created the moment the order is placed, so
  `threadId` is populated from the very first response back from `POST
  /orders` onward. Use it to deep-link "message support about this order"
  straight to `GET /threads/:threadId` without a separate lookup call.
- `paymentUrl` is only non-null in the `POST /orders` response — redirect
  the customer there to complete payment on Paystack's hosted page.

### `Order` shape (used by `GET /orders/:id`, `POST /orders`, `POST
/orders/:id/cancel`, `PATCH /orders/:id/status`)

```json
{
  "id": "EP-24815",
  "createdAt": "2026-06-28",
  "status": "In Production",
  "artworkStatus": "Approved",
  "items": [
    {
      "productSlug": "kraft-mailer-box",
      "name": "Custom Kraft Mailer Box",
      "image": "/products/kraft-mailer-box.png",
      "options": { "size": "medium", "material": "recycled", "finish": "matte" },
      "quantity": 250,
      "unitPrice": 610
    }
  ],
  "subtotal": 152500,
  "delivery": 4500,
  "total": 157000,
  "deliveryAddress": "14 Awolowo Road, Flat 3B, Ikoyi, Lagos, Nigeria",
  "estimatedDelivery": "2026-07-09",
  "tracking": [
    { "label": "Order placed", "location": "Online", "date": "2026-06-28", "done": true },
    { "label": "Quality check", "location": "Lagos Facility", "date": "", "done": false }
  ],
  "paymentUrl": null,
  "threadId": "THR-24815"
}
```

- `status` enum: `Pending Payment | Order Received | Design Approved | In
  Production | Quality Check | Dispatched | Delivered | Cancelled`
  (⚠️ `Pending Payment` and `Cancelled` weren't in the original doc's
  enum — an order sits in `Pending Payment` between checkout and Paystack
  confirmation).
- `artworkStatus` enum: `Uploaded | Design Requested | Approved`
- `deliveryAddress` is a flattened display string (`streetAddress, city,
  state, country`), not the structured address object.

### `GET /orders`

**Query:** `?status=in-production&page=1&pageSize=20`. `status` slugs:
`all` (default omitted), `awaiting-proof`, `in-production`, `shipped`,
`delivered`, `cancelled`.

**`200`** → `{ data: Order[], page, pageSize, total }`.

### `GET /orders/:id`

**`200`** → single `Order`. **`404`** if it doesn't belong to the caller.

### `POST /orders` — place order / checkout

Rate limited: **10/minute** (real DB write + a live Paystack call).

**Request**

```json
{
  "items": [
    {
      "productSlug": "kraft-mailer-box",
      "options": { "size": "medium", "material": "recycled", "finish": "matte" },
      "quantity": 250,
      "artwork": { "type": "upload", "fileIds": ["file_a1b2c3d4"] }
    }
  ],
  "deliveryAddressId": "a1b2c3d4e5f6...",
  "deliveryMethod": "standard"
}
```

- `artwork.type`: `upload | design | none`.
  - `"upload"` **requires** `fileIds` (non-empty) — validated before
    hitting the DB.
  - `"design"` should include `brief`; sets that item's
    order-level `artworkStatus` to `"Design Requested"` if any item in
    the order requests design work.
- `deliveryMethod`: `"standard" | "express"` (defaults `"standard"` if
  omitted). Pricing: standard = ₦4,500 / +4 days buffer, express = ₦9,000
  / +1 day buffer — confirm these numbers with backend before hardcoding
  them anywhere in the UI, they were placeholder values pending real
  delivery pricing.

**Response `201`** → full `Order` **with `paymentUrl` populated** — redirect
to it to complete payment. `threadId` is also already populated at this
point.

**Errors:** `404 NOT_FOUND` for a bad `productSlug` or
`deliveryAddressId` (address must belong to the caller);
`400 VALIDATION_ERROR` for artwork-type mismatches.

### `GET /orders/verify-payment?reference=...`

Rate limited: **10/minute**. Call this once when the frontend lands back
from Paystack's redirect (`?reference=` in the URL). Talks to Paystack
directly to confirm — don't rely solely on the webhook having landed yet.

**`200`** → full `Order` (now `RECEIVED` if payment succeeded, still
`Pending Payment` if not yet confirmed on Paystack's side).

### `GET /orders/:id/payment-status`

Rate limited: **30/minute** — safe to poll every few seconds on the
confirmation page while waiting. Pure local DB read, no Paystack call.

**`200`**

```json
{ "status": "Order Received", "isFinal": true }
```

`isFinal: false` while still `"Pending Payment"` — keep polling until
`true`, then stop and reconcile with `/orders/verify-payment` if you
haven't already.

### `POST /orders/:id/reorder`

Rate limited: **10/minute** (internally calls the same checkout logic).
Re-validates each line item against the **current** catalog — a
discontinued product is silently dropped.

**`201`** → `{ "addedItems": 1 }`. **Errors:** `409 CONFLICT` if none of
the original items are still purchasable.

### `POST /orders/:id/cancel`

Rate limited: **20/minute**.

**Request** `{ "reason": "..." }` (optional, defaults to no reason) →
**`200`** updated `Order` (now `Cancelled`).

**Errors:** `409 CONFLICT` if the order is already `Dispatched`,
`Delivered`, or `Cancelled`.

### Order proofs

- `GET /orders/:id/proof` → **`200`**
  ```json
  { "status": "awaiting_approval", "url": "https://cdn/.../proof.png", "version": 2, "notes": "..." }
  ```
  **`404`** if no proof has been uploaded yet.
- `POST /orders/:id/proof/approve` (20/min) → **`200`**
  `{ "artworkStatus": "Approved" }` — also advances `Order.status` to
  `Design Approved` if it was `Order Received`.
- `POST /orders/:id/proof/reject` (20/min) — **Request** `{ "reason": "Make the logo larger" }`
  → **`200`** `{ "artworkStatus": "..." }` (unchanged from current value).

### `PATCH /orders/:id/status` — admin only

`is_admin: true` required. **No rate limit** (internal ops tool).

**Request** `{ "status": "In Production", "artworkStatus": "Approved" }`
(either/both optional, validated against the enums) → **`200`** updated
`Order`.

---

## 7. Messages (Support Threads)

⚠️ **Changed from original spec** — `POST /threads` (create-new) was
removed. A thread is created automatically the moment an order is placed
(see §6), and its id comes back as `Order.threadId` — that's the only way
to get a thread id for an order. There is no standalone "start a
conversation not tied to an order" flow.

All routes require `Authorization: Bearer <accessToken>`.

### `GET /threads`

**Query:** `?page=1&pageSize=20`. Customers see only their own threads;
admins (`is_admin: true`) see every thread.

**`200`**

```json
{
  "data": [
    {
      "id": "THR-24815",
      "orderId": "EP-24815",
      "customerId": "usr_123",
      "agentId": null,
      "agentRole": null,
      "unreadCount": 1,
      "lastMessage": {
        "id": "msg_a1b2c3d4e5f6",
        "authorType": "system",
        "authorId": null,
        "body": "Payment confirmed — your order is now being processed.",
        "attachments": [],
        "createdAt": "2026-07-03T10:24:00Z"
      },
      "createdAt": "2026-06-28T09:00:00Z",
      "updatedAt": "2026-07-03T10:24:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

⚠️ Field names differ from the original mock shape: `orderId`,
`customerId`, `agentId`/`agentRole` (not `agent`/`agentRole` as a single
string), `unreadCount` (not `unread`), `lastMessage` (not embedded
`subject`/preview text — there's no `subject` field at all, threads aren't
titled).

### `GET /threads/:id`

**`200`** → full thread with `messages[]` instead of `lastMessage`:

```json
{
  "id": "THR-24815",
  "orderId": "EP-24815",
  "customerId": "usr_123",
  "agentId": "usr_admin_1",
  "agentRole": "Production Specialist",
  "unreadCount": 0,
  "messages": [
    {
      "id": "msg_a1b2c3d4e5f6",
      "authorType": "system",
      "authorId": null,
      "body": "Payment confirmed — your order is now being processed.",
      "attachments": [],
      "createdAt": "2026-06-28T09:00:05Z"
    },
    {
      "id": "msg_b2c3d4e5f6a7",
      "authorType": "admin",
      "authorId": "usr_admin_1",
      "body": "Your Kraft mailer boxes are now in production.",
      "attachments": [],
      "createdAt": "2026-07-03T09:10:00Z"
    },
    {
      "id": "msg_c3d4e5f6a7b8",
      "authorType": "customer",
      "authorId": "usr_123",
      "body": "Can you confirm the interior print is included?",
      "attachments": [],
      "createdAt": "2026-07-03T09:40:00Z"
    }
  ],
  "createdAt": "2026-06-28T09:00:00Z",
  "updatedAt": "2026-07-03T09:40:00Z"
}
```

- `authorType` enum: `"customer" | "admin" | "system"` (⚠️ not
  `from: "support" | "customer"` as in the original doc — there are
  **three** author types, and system messages are posted automatically by
  order-lifecycle events: payment confirmed, status changes, proof
  approved/rejected).
- `agentId`/`agentRole` are **sticky**: null until the first admin ever
  replies, then permanently set to that admin — a different admin
  replying later doesn't reassign it.
- `attachments[].kind` enum: `"image" | "video" | "file"`.

**Errors:** `404 NOT_FOUND` if the thread doesn't exist or doesn't belong
to the caller (same 404 either way — doesn't leak existence).

### `POST /threads/:id/messages`

Rate limited: **30/minute**.

**Request**

```json
{ "body": "Here is the updated logo.", "attachmentIds": ["atc_xxxxx"] }
```

⚠️ Field is `body`, not `text`. `attachmentIds` come from `POST
/uploads/attachments` (§5) — upload first, then reference the returned
ids here. An attachment id only resolves if it was uploaded by the same
user sending this message.

**Response `201`** → the **full thread** (not just the new message) —
this lets your client render its own message with server-assigned
id/timestamp/resolved-attachments without a second round trip. Same shape
as `GET /threads/:id`.

Also **broadcasts over the thread's WebSocket** (see below) to any other
connected clients viewing the same thread.

### `POST /threads/:id/read`

**`200`** (⚠️ not `204` as originally spec'd) →
`{ "unreadCount": 0 }`. Customer-only — resets `Thread.unread_count`.
Admins don't have a parallel unread counter in this version.

### `WS /threads/:id/ws?token=<accessToken>`

⚠️ **New, not in original spec at all.** Live push for new messages
while a thread view is open.

- Auth via **query param**, not header (`?token=`) — browser WebSocket
  handshakes can't set custom headers. Pass the same access token you use
  for `Authorization: Bearer`.
- **Push-only** — this connection never delivers history. Always call
  `GET /threads/:id` once up front to load existing messages, *then* open
  this socket for anything posted after.
- On a new message, the server sends:
  ```json
  { "type": "message", "message": { "id": "msg_...", "authorType": "...", "authorId": "...", "body": "...", "attachments": [], "createdAt": "..." } }
  ```
- Closes with code `4401` if the token is missing/invalid, `4404` if the
  thread doesn't exist / doesn't belong to the connecting user.
- ⚠️ Known limitation: an **admin's** browser connecting here is currently
  always treated as a customer connection for the ownership check — an
  admin socket for a thread they're not the customer of will get closed
  with `4404`. Backend needs a role claim embedded in the token before
  admin real-time views work over this socket; ask before building admin
  live-chat against this endpoint.
- Only push relevant on a **single backend process/worker** right now — no
  cross-process fanout yet (fine for a single deploy, worth knowing if you
  scale to multiple backend instances later).

---

## 8. Public Order Tracking (no auth)

⚠️ **Changed from original spec** — tighter rate limit, different
`destination` semantics worth knowing about, and `updates[].timestamp`
currently has no time-of-day component (date-only for now).

### `POST /track`

Rate limited: **10/minute** — deliberately tight, this is an
unauthenticated id+email lookup and a plausible enumeration target.

**Request** `{ "orderId": "EP-0241", "email": "amaka@brightbox.ng" }`

**Response `200`**

```json
{
  "id": "EP-0241",
  "status": "Dispatch",
  "createdAt": "Jul 1, 2026",
  "estimatedDelivery": "Jul 12, 2026",
  "courier": "GIG Logistics",
  "trackingNumber": "GIG-88214460",
  "destination": "14 Awolowo Road, Flat 3B, Ikoyi, Lagos, Nigeria",
  "items": [{ "name": "Custom Nylon Packaging", "quantity": 2000 }],
  "updates": [
    {
      "stage": "Order received",
      "timestamp": "Jul 1, 2026",
      "note": "Order confirmed and queued for design review.",
      "media": []
    }
  ]
}
```

- `status` is mapped from the internal order-status wording to
  `PRODUCTION_STAGES` wording (`Order received, Design, Approval,
  Production, Finishing, Packaging, Dispatch, Delivery`, plus `Cancelled`
  for cancelled orders, which isn't in the original stage list but
  renders rather than erroring).
- `courier` / `trackingNumber` are currently **always `null`** — nothing
  populates them yet (no shipping-provider integration wired up). Handle
  `null` gracefully in the UI rather than assuming they're always present.
- ⚠️ `destination` currently returns the **full street address**, not a
  coarse "City, Country" string as the original example implied. This is
  a known gap flagged internally for a fix (should be city/state only, not
  the full delivery address, given this is an unauthenticated endpoint) —
  don't build UI that assumes it's always short/coarse, and flag to
  backend if this hasn't been narrowed down by the time you integrate.
- `updates[].timestamp` currently has **no time-of-day** — renders as
  `"Jul 1, 2026"` for every event on that date, not `"Jul 1, 9:14 AM"`.
  Don't build a UI that assumes sub-day ordering within the same date from
  this field alone.
- `updates[]` only includes events marked `done: true` internally —
  upcoming/placeholder stages aren't included at all (not returned as
  `done: false` entries the way `Order.tracking` does in §6).

**Errors:** `404 NOT_FOUND` if the id+email pair doesn't match, if the
order doesn't exist, or if the order never got past checkout
(`PENDING_PAYMENT`) — same 404 for all three, doesn't leak which.

---

## 9. Design Requests

⚠️ **Changed from original spec** — no `company` requirement (now
optional), added optional `phone`.

### `POST /design-requests`

No auth. Rate limited: **5/minute** — tightest limit in the API, this is a
public lead-gen form with a DB write and a notification task on every
call.

**Request**

```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "company": "Acme Inc.",
  "phone": "+2348030000000",
  "projectType": "branding",
  "budget": "150-500k",
  "brief": "Describe your brand, audience, style preferences..."
}
```

- `company` and `phone` are **both optional** — an individual submitting a
  personal project doesn't need to invent a company name.
- `projectType`: any category slug from §4, or `"branding"` / `"other"` —
  not validated against a fixed enum server-side (unrecognized values are
  still accepted, just won't map to a real category).
- `budget` enum (required): `under-50k | 50-150k | 150-500k | over-500k`.
- `brief`: minimum 10 characters.

**Response `201`**
`{ "id": "dr_a1b2c3d4e5f6", "message": "Design request submitted. Our team will reach out within 24 hours." }`

---

## Not part of the frontend contract

`POST /payments/webhooks/paystack` exists but is Paystack's server calling
your server directly (HMAC-signature verified) — never call this from the
frontend.

---

## Suggested integration order

1. **Auth** — note the cookie-based refresh flow before wiring
   `auth-context.tsx`; it's the biggest behavioral change from the
   original mock.
2. **Catalog** (`/categories`, `/products`, `/pricing/quote`) — public,
   unchanged in shape from the original draft.
3. **Account + Addresses** — mind the flattened `streetAddress` field and
   `PUT` (not `PATCH`) for address updates.
4. **Orders + Uploads** — checkout via `/uploads/artwork` →
   `POST /orders` → redirect to `paymentUrl` → poll
   `/orders/:id/payment-status` → confirm with `/orders/verify-payment` on
   the Paystack redirect.
5. **Messages** — use `Order.threadId` to get into a thread, no separate
   creation call. Load history via `GET /threads/:id`, then open the `WS
   /threads/:id/ws` socket for live updates.
6. **Tracking, Design requests** — both public, both straightforward
   one-shot forms.