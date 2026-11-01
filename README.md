# AuraStore - Production Full-Stack MERN E-Commerce Application

A complete, production-grade E-commerce application engineered with the **MERN** stack (MongoDB, Express, React 18, Node.js 20). Built with strict domain separation, atomic conditional stock reservations, verified server pricing, pluggable payment adapter pattern (Stripe Checkout with webhook reconciliation), and an accessible custom CSS design system.

---

## 🌟 Feature Highlights

### 1. Robust Core Architecture & Business Rules
- **Atomic Stock Reservation**: Prevents overselling using conditional atomic MongoDB operations (`findOneAndUpdate` with `$gte: qty`). If any item in a multi-item checkout is unavailable, all prior reservations in that transaction are rolled back immediately.
- **Server-Recalculated Pricing**: Never trusts client-submitted prices or totals. Subtotals, tiered discounts, volume thresholds for free shipping, and taxes are strictly calculated on the server from authoritative product documents.
- **Idempotent Stripe Webhook**: Orders are marked `paid` **only** upon receiving a cryptographically verified Stripe webhook event (`checkout.session.completed`), never from browser redirects. Re-delivered webhook events are safely deduplicated.
- **Pluggable Payment Adapter**: Payment operations (`createCheckoutSession`, `verifyWebhookEvent`, `refundPayment`) sit behind an adapter interface (`PaymentAdapter`), allowing seamless hot-swapping between Stripe, Razorpay, or simulated providers.
- **Lifecycle & Forward-Only Order State Machine**: Status transitions move forward only (`placed` -> `packed` -> `shipped` -> `delivered`). Cancellations are permitted strictly before shipping (`placed`, `packed`), automatically releasing reserved stock back into inventory and initiating payment refunds.
- **Guest-to-Customer Cart Merge**: Unauthenticated guests can browse and maintain a local cart; upon registration or login, their items are automatically merged with their server-side account cart.
- **Delivered-Only Verified Reviews**: Product reviews and ratings can only be submitted by customers who have purchased and received the product in a `delivered` order.

### 2. Frontend Experience
- **React 18 + Vite**: Lightning-fast builds, code-splitting with `React.lazy` and `Suspense`, and client-side routing via React Router 6.
- **Pure Modern CSS**: Clean custom design system using CSS Custom Properties (variables), responsive Flexbox & CSS Grid, accessible forms with inline validation, and dark mode support via `@media (prefers-color-scheme: dark)`.
- **Slide-out Cart Drawer & Full Cart Page**: Quick-add to cart triggers a slide-out drawer with a live Free Shipping progress indicator; full cart page allows promo code validation and quantity adjustments.
- **Account Hub**: Comprehensive customer dashboard with order status timeline visualizer, address book management, and wishlist tracking.
- **Admin Portal**: Real-time sales metrics, category breakdown charts, order fulfillment control, product inventory management with image uploads (Cloudinary or local file fallback), coupon engine, and customer analytics.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js 20+ (ES Modules), Express 4, Mongoose 8, Zod, Bcrypt.js, JsonWebToken |
| **Database** | MongoDB (Local or MongoDB Atlas) |
| **Frontend** | React 18, Vite, React Router 6, Context API, Plain CSS |
| **Payments** | Stripe Checkout (Test Mode) + Webhook Adapter |
| **Media** | Cloudinary image upload with automatic local disk storage fallback |
| **Security** | Helmet, CORS client-origin lockdown, express-rate-limit, NoSQL query sanitizer |
| **Testing** | Jest, Supertest, `mongodb-memory-server` (Backend); Vitest, React Testing Library (Frontend) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20 or higher (`node -v`)
- **MongoDB**: Local MongoDB instance (`mongod`) or MongoDB Atlas connection string.

### 1. Clone & Install Dependencies
Run the install command from the project root:
```bash
# Installs root, server, and client packages
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
Default configuration inside `server/.env`:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/mern_ecommerce
JWT_SECRET=super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_placeholder_key_for_dev_mode
STRIPE_WEBHOOK_SECRET=whsec_placeholder_webhook_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
*(Note: Default port is set to `5001` to prevent conflicts with macOS AirPlay Receiver which binds to port 5000 by default)*

### 3. Seed Database
Populate the database with 4 users, 6 categories, 40 realistic products, promotional coupons, and sample orders across all lifecycle statuses:
```bash
npm run seed
```
To wipe and re-seed at any time:
```bash
npm run reset-db
```

### 4. Run Development Servers
Start both backend API (`http://localhost:5000`) and Vite frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## 💳 Testing Stripe Payments & Webhooks

When using real Stripe test keys (`sk_test_...` and `whsec_...`):

1. **Install Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Authenticate Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**:
   ```bash
   stripe listen --forward-to localhost:5001/api/webhooks/stripe
   ```
   *(Or `localhost:5000/api/webhooks/stripe` if your PORT is set to 5000)*
   Copy the displayed webhook signing secret (e.g. `whsec_...`) into your `server/.env` under `STRIPE_WEBHOOK_SECRET`.

4. **Simulated Development Mode**:
   If no live Stripe keys are provided, the built-in `StripeAdapter` runs in **simulated test mode**, auto-generating test checkout sessions and redirecting back to `/checkout/success` so you can test end-to-end purchasing flows without needing external credentials!

---

## 👥 Demo Logins

All test accounts share the development password: `Password123!`

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@example.com` | `Password123!` | Full store management, sales reports, inventory CRUD, status updates |
| **Customer** | `alice@example.com` | `Password123!` | Checkout, order tracking, address book, wishlist, review verified orders |
| **Customer** | `bob@example.com` | `Password123!` | Customer account with sample orders |
| **Customer** | `charlie@example.com` | `Password123!` | Customer account with cancelled order |

> **Tip:** The `/login` page includes **One-Click Demo Login** buttons for instant access.

---

## 🎟 Available Demo Coupons

- `WELCOME10`: 10% off orders over $50.00
- `SAVE20`: $20.00 off orders over $100.00
- `EXPIRED30`: Expired test coupon (validates rejection)
- `FLASH50`: Max usage limit reached coupon (validates rejection)

---

## 🧪 Running Automated Tests

Run the entire test suite (Backend Jest tests in memory + Frontend Vitest tests):
```bash
npm test
```

### Backend Tests (37 tests across 9 suites)
Uses Jest + Supertest + `mongodb-memory-server` (runs completely in-memory, requiring no running database):
```bash
npm run test:server
```
- **Unit**: Price calculation & rounding, coupon business rules, atomic stock reservations and rollback.
- **Integration**: Auth & JWT cookies, Cart CRUD & merging, Checkout session creation, Webhook processing & idempotency, Order cancellation & refunds, Role-based permissions.

### Frontend Tests
Uses Vitest + React Testing Library:
```bash
npm run test:client
```

### Linting & Formatting
```bash
npm run lint      # Runs ESLint (0 errors, 0 warnings)
npm run format    # Formats files with Prettier
```

---

## 📡 REST API Summary

All endpoints return JSON and adhere to a unified error format:
`{ "error": { "code": "STRING_CODE", "message": "Human readable message" } }`

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create customer account & set httpOnly cookie
- `POST /api/auth/login` - Authenticate & set httpOnly cookie
- `POST /api/auth/logout` - Clear auth cookie
- `GET /api/auth/me` - Get current session profile & wishlist

### Catalog (`/api`)
- `GET /api/products` - Search, filter (category, price, rating), sort, and pagination
- `GET /api/products/:slug` - Product detail with reviews
- `GET /api/categories` - Category list

### Cart (`/api/cart`)
- `GET /api/cart` - Get user cart
- `PUT /api/cart` - Replace cart items
- `POST /api/cart/merge` - Merge guest items into account cart

### Checkout & Webhooks (`/api`)
- `POST /api/checkout/session` - Atomically reserve stock & create Stripe checkout session
- `POST /api/coupons/validate` - Validate coupon code & calculate discount
- `POST /api/webhooks/stripe` - Idempotent Stripe webhook receiver

### Orders (`/api/orders`)
- `GET /api/orders` - List current user's orders
- `GET /api/orders/:id` - Detailed order view
- `PATCH /api/orders/:id/cancel` - Cancel order before shipping, restores stock & triggers refund

### Account & Reviews (`/api`)
- `GET /api/me/addresses` - List customer addresses
- `POST /api/me/addresses` - Add address
- `PUT /api/me/addresses/:id` - Edit address
- `DELETE /api/me/addresses/:id` - Remove address
- `POST /api/me/wishlist/:productId` - Toggle product in wishlist
- `POST /api/products/:id/reviews` - Submit review (verified delivered customers only)

### Admin Operations (`/api/admin`)
- `GET/POST /api/admin/products` - Product inventory management (with image upload)
- `PUT/DELETE /api/admin/products/:id` - Update / remove product
- `GET/POST /api/admin/categories` - Category CRUD
- `GET/POST /api/admin/coupons` - Coupon CRUD
- `GET /api/admin/orders` - All orders with status filtering
- `PATCH /api/admin/orders/:id/status` - Forward-only order status transition
- `GET /api/admin/customers` - Customer list with lifetime spend analytics
- `GET /api/admin/reports/sales` - Sales revenue, average order value, category breakdowns
