# ENTERPRINT — Backend API Specification

This document describes the request/response contract the frontend expects. Field
names are derived directly from the app's TypeScript models (`lib/data.ts`,
`lib/auth-context.tsx`, `lib/cart-context.tsx`, `lib/mock-account.ts`,
`lib/mock-addresses.ts`, `lib/mock-tracking.ts`, `lib/production-stages.ts`,
`lib/validation.ts`) so the responses drop in without frontend changes.

## Conventions

- **Base URL:** `https://api.enterprint.com/v1`
- **Format:** JSON (`Content-Type: application/json`). File uploads use `multipart/form-data`.
- **Auth:** `Authorization: Bearer <accessToken>` on all protected routes.
- **Money:** integers in **Naira (NGN)**, matching the current frontend
  (e.g. `unitPrice: 610`, `total: 157000`).
- **Dates:** ISO 8601. Order/tracking display dates use `YYYY-MM-DD`; message
  timestamps use full ISO (`2026-07-03T10:24:00Z`).
- **IDs:** orders are human-readable (`EP-24815`); everything else is opaque string IDs.

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

Common `code` values: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401),
`FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429),
`SERVER_ERROR` (500).

### Paginated list envelope

```json
{ "data": [], "page": 1, "pageSize": 20, "total": 42 }
```

---

## 1. Authentication

The frontend expects `{ user, accessToken, refreshToken }` on success, and two
special flow states on login: `REQUIRES_EMAIL_VERIFICATION` and `REQUIRES_2FA`.

### `POST /auth/signup`

**Request**

```json
{
  "name": "Amara Okafor",
  "email": "amara@brightleafco.com",
  "company": "Brightleaf Co.",
  "phoneNumber": "+2348030000000",
  "password": "Password123!"
}
```

Rules (from `validation.ts`): name >= 2 chars, valid email, valid phone for
country, password >= 8 chars.

**Response `201`** — signup does NOT log the user in; it triggers email verification:

```json
{
  "status": "REQUIRES_EMAIL_VERIFICATION",
  "message": "Account created. Verification email sent.",
  "email": "amara@brightleafco.com"
}
```

**Errors:** `409 CONFLICT` if email already exists.

### `POST /auth/login`

**Request**

```json
{ "email": "amara@brightleafco.com", "password": "Password123!" }
```

**Response `200` (success)**

```json
{
  "user": {
    "id": "usr_123",
    "name": "Amara Okafor",
    "email": "amara@brightleafco.com",
    "company": "Brightleaf Co.",
    "phoneNumber": "+2348030000000",
    "initials": "AO",
    "role": "Operations Lead",
    "emailVerified": true,
    "requires2FA": false
  },
  "accessToken": "eyJhb...",
  "refreshToken": "eyJyZ..."
}
```

**Response `200/403` (flow interrupts)** — return a discriminated status the client can branch on:

```json
{ "status": "REQUIRES_EMAIL_VERIFICATION", "email": "amara@brightleafco.com" }
```

```json
{ "status": "REQUIRES_2FA", "email": "amara@brightleafco.com", "challengeId": "chg_abc" }
```

**Errors:** `401 UNAUTHORIZED` for bad credentials.

### `POST /auth/verify-email`

**Request** `{ "email": "...", "code": "123456" }` → **`200`** returns the same
`{ user, accessToken, refreshToken }` shape as login.

### `POST /auth/2fa-challenge`

**Request** `{ "challengeId": "chg_abc", "code": "123456" }` → **`200`** returns
`{ user, accessToken, refreshToken }`.

### `POST /auth/forgot-password`

**Request** `{ "email": "..." }` → **`200`**
`{ "message": "If that account exists, a reset link was sent." }`
(return 200 even if not found, to avoid enumeration).

### `POST /auth/reset-password`

**Request** `{ "token": "reset_...", "newPassword": "..." }` (>= 8 chars) →
**`200`** `{ "message": "Password updated." }`. **Errors:** `400` invalid/expired token.

### `POST /auth/refresh`

**Request** `{ "refreshToken": "..." }` → **`200`**
`{ "accessToken": "...", "refreshToken": "..." }`.

### `POST /auth/logout`

**Request** `{ "refreshToken": "..." }` → **`204`** (revoke refresh token).

---

## 2. Account, Profile & Settings

### `GET /account/me`

**`200`** → the `user` object (same shape as login).

### `PATCH /account/profile`

**Request** (any subset) `{ "name": "...", "company": "...", "phoneNumber": "..." }`
→ **`200`** updated `user`.

### `PATCH /account/password` (security form)

**Request** `{ "currentPassword": "...", "newPassword": "..." }` → **`200`**
`{ "message": "Password changed." }`. **Errors:** `400` if current password wrong.

### 2FA management

- `POST /account/2fa/enable` → `200` `{ "otpauthUrl": "otpauth://...", "secret": "BASE32" }`
- `POST /account/2fa/confirm` → `{ "code": "123456" }` → `200` `{ "requires2FA": true }`
- `POST /account/2fa/disable` → `{ "code": "123456" }` → `200` `{ "requires2FA": false }`

### `GET` / `PATCH /account/notifications`

Matrix of `email`/`sms` per preference key (from `notifications-form.tsx`).

```json
{
  "orderUpdates":    { "email": true,  "sms": true  },
  "proofReady":      { "email": true,  "sms": true  },
  "deliveryUpdates": { "email": true,  "sms": false },
  "messages":        { "email": true,  "sms": false },
  "promotions":      { "email": false, "sms": false }
}
```

`PATCH` accepts the same shape → **`200`** returns saved preferences.

### `DELETE /account` (danger zone)

**Request** `{ "password": "...", "confirm": "DELETE" }` → **`204`**.

---

## 3. Addresses

Matches the `Address` type. `state` must be one of `NIGERIAN_STATES`.

- **`GET /account/addresses`** → `200` `{ "data": [ Address, ... ] }`
- **`POST /account/addresses`** → body below → `201` created `Address`
- **`PATCH /account/addresses/:id`** → partial `Address` → `200`
- **`DELETE /account/addresses/:id`** → `204` (block/normalize if deleting the default)
- **`POST /account/addresses/:id/default`** → `200` (unset default on all others)

**Address object / POST body**

```json
{
  "id": "addr_1",
  "label": "Home",
  "fullName": "Ada Okafor",
  "phone": "+234 803 555 0192",
  "line1": "14 Awolowo Road",
  "line2": "Flat 3B",
  "city": "Ikoyi",
  "state": "Lagos",
  "postalCode": "101233",
  "country": "Nigeria",
  "isDefault": true
}
```

---

## 4. Catalog (Products & Categories)

Public, read-only. Shapes match `Product`, `Category`, `OptionGroup`,
`QuantityTier` in `lib/data.ts`.

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
**`200`** → paginated list of `Product` objects.

### `GET /products/:slug`

**`200`** → a single full `Product`:

```json
{
  "id": "kraft-mailer-box",
  "slug": "kraft-mailer-box",
  "name": "Custom Kraft Mailer Box",
  "categorySlug": "boxes-packaging",
  "tagline": "Durable e-commerce shipping boxes with your brand.",
  "description": "Premium corrugated mailer boxes...",
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

### `POST /pricing/quote` (optional but recommended)

Let the server be the source of truth for price instead of trusting the client.

**Request**

```json
{
  "productSlug": "kraft-mailer-box",
  "quantity": 250,
  "options": { "size": "medium", "material": "recycled", "finish": "matte" }
}
```

**`200`**

```json
{ "unitPrice": 610, "quantity": 250, "subtotal": 152500, "currency": "NGN" }
```

---

## 5. Artwork Uploads

Used by the product customizer / cart (`ArtworkInfo`).

### `POST /uploads/artwork` (`multipart/form-data`, field `files[]`)

**`201`**

```json
{
  "files": [
    {
      "id": "file_1",
      "name": "logo-final.pdf",
      "url": "https://cdn/.../logo-final.pdf",
      "kind": "file",
      "size": "2.4 MB"
    }
  ]
}
```

---

## 6. Orders & Checkout

Order shape matches `Order` / `OrderItem` / `TrackingEvent` in `mock-account.ts`.

### `GET /orders`

**Query:** `?status=in-production&page=1` (status slugs from
`production-stages.ts`: `all`, `awaiting-proof`, `in-production`, `shipped`,
`delivered`, `cancelled`).
**`200`** → paginated list of `Order`.

### `GET /orders/:id`

**`200`** → single full `Order`:

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
  "deliveryAddress": "14 Admiralty Way, Lekki Phase 1, Lagos",
  "estimatedDelivery": "2026-07-09",
  "tracking": [
    { "label": "Order placed", "location": "Online", "date": "2026-06-28", "done": true },
    { "label": "Quality check", "location": "Lagos Facility", "date": "", "done": false }
  ]
}
```

- `status` enum: `Order Received | Design Approved | In Production | Quality Check | Dispatched | Delivered`
- `artworkStatus` enum: `Uploaded | Design Requested | Approved`

### `POST /orders` (place order / checkout)

**Request** (server should recompute prices from the cart, not trust `unitPrice`):

```json
{
  "items": [
    {
      "productSlug": "kraft-mailer-box",
      "options": { "size": "medium", "material": "recycled", "finish": "matte" },
      "quantity": 250,
      "artwork": { "type": "upload", "fileIds": ["file_1"] }
    }
  ],
  "deliveryAddressId": "addr_1",
  "deliveryMethod": "standard",
  "paymentReference": "paystack_ref_abc123"
}
```

- `artwork.type` enum: `upload | design | none`. When `design`, include `brief`;
  the created order gets `artworkStatus: "Design Requested"`.

**Response `201`** → the full created `Order` (with generated `EP-#####` id and
initial `tracking`).

### `POST /orders/:id/reorder`

**`201`** → `{ "addedItems": 1 }` (clones items back into the cart or a new draft).

### Order proofs (`order-proof-panel.tsx`)

- `GET /orders/:id/proof` → `200`

  ```json
  {
    "status": "awaiting_approval",
    "url": "https://cdn/.../proof.png",
    "version": 2,
    "notes": "Interior print included."
  }
  ```

- `POST /orders/:id/proof/approve` → `200` `{ "artworkStatus": "Approved" }`
- `POST /orders/:id/proof/reject` → `{ "reason": "Make the logo larger" }` → `200`

---

## 7. Messages (Support Threads)

Shapes match `MessageThread` / `Message` in `mock-account.ts`.

### `GET /threads`

**`200`**

```json
{
  "data": [
    {
      "id": "thread-1",
      "orderId": "EP-24815",
      "subject": "Mailer box artwork proof",
      "agent": "Tobi Adeyemi",
      "agentRole": "Production Specialist",
      "unread": 1,
      "updatedAt": "2026-07-03T10:24:00Z"
    }
  ]
}
```

### `GET /threads/:id`

**`200`** → thread with full `messages[]`:

```json
{
  "id": "thread-1",
  "orderId": "EP-24815",
  "subject": "Mailer box artwork proof",
  "agent": "Tobi Adeyemi",
  "agentRole": "Production Specialist",
  "unread": 0,
  "updatedAt": "2026-07-03T10:24:00Z",
  "messages": [
    {
      "id": "m1",
      "from": "support",
      "author": "Tobi Adeyemi",
      "text": "Your Kraft mailer boxes are now in production.",
      "time": "2026-07-03T09:10:00Z",
      "read": true,
      "attachments": []
    },
    {
      "id": "m2",
      "from": "customer",
      "author": "Amara Okafor",
      "text": "Can you confirm the interior print is included?",
      "time": "2026-07-03T09:40:00Z"
    }
  ]
}
```

- `from` enum: `support | customer`
- `attachments[].kind` enum: `image | video | file`

### `POST /threads` (start new)

**Request** `{ "orderId": "EP-24815", "subject": "...", "text": "..." }` → `201` new thread.

### `POST /threads/:id/messages`

**Request** (`multipart/form-data` when attaching files)

```json
{ "text": "Here is the updated logo.", "attachmentIds": ["file_1"] }
```

**`201`** → the created `Message`.

### `POST /threads/:id/read`

**`204`** (marks agent messages read, zeroes `unread`).

---

## 8. Public Order Tracking (no auth)

Matches `TrackedOrder` / `TrackingUpdate` and `findTrackedOrder(orderId, email)`.

### `POST /track`

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
  "destination": "Ibadan, Nigeria",
  "items": [{ "name": "Custom Nylon Packaging", "quantity": 2000 }],
  "updates": [
    {
      "stage": "Order received",
      "timestamp": "Jul 1, 9:14 AM",
      "note": "Order confirmed and queued for design review."
    },
    {
      "stage": "Production",
      "timestamp": "Jul 5, 10:20 AM",
      "note": "Printing in progress on flexo line 2.",
      "media": [
        { "kind": "image", "url": "/tracking/production-1.jpg", "caption": "First pass off the press" }
      ]
    }
  ]
}
```

- `stage` values follow `PRODUCTION_STAGES`: `Order received, Design, Approval,
  Production, Finishing, Packaging, Dispatch, Delivery`.

**Errors:** `404 NOT_FOUND` when the id+email pair doesn't match (don't leak
whether the id exists).

---

## 9. Design Requests

From `design-request-form.tsx`.

### `POST /design-requests`

**Request**

```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "company": "Acme Inc.",
  "projectType": "branding",
  "budget": "150-500k",
  "brief": "Describe your brand, audience, style preferences..."
}
```

- `projectType`: any category `slug`, or `branding` / `other`.
- `budget` enum: `under-50k | 50-150k | 150-500k | over-500k`.

**Response `201`**
`{ "id": "dr_123", "message": "Design request submitted. Our team will reach out within 24 hours." }`

---

## Suggested build order

1. **Auth** (signup → verify → login → refresh) — unblocks everything protected.
2. **Catalog** (`/categories`, `/products`) — public, easy to seed from `lib/data.ts`.
3. **Account + Addresses** — needed for checkout.
4. **Orders + Pricing quote + Uploads** — the core commerce loop.
5. **Messages, Tracking, Design requests** — supporting features.

Once your endpoints are live, the swap is mechanical: replace the
`localStorage`/mock logic in `auth-context.tsx`, `cart-context.tsx`, and the mock
imports with `fetch` calls to these routes — the response shapes already match
the existing TypeScript types.
