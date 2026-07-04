# SoleVault: Comprehensive System Documentation

This document provides a detailed overview of the features, technologies, and implementation patterns used in the SoleVault premium sneaker resale marketplace.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Vanilla CSS for custom animations.
- **Icons**: [Lucide React](https://lucide-dev.next-hop.org/)
- **Components**: Radix UI (implied), Custom-built premium components (Glassmorphism, Gradients).
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (for Cart and Wishlist state).

### Backend & Infrastructure
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth) (Google & SMS Login).
- **Hosting**: [Vercel](https://vercel.com/)
- **Analytics**: Custom real-time visitor tracker.

### Integrations
- **Payment Gateway**: [PayU](https://www.payu.in/) (Secure SHA-512 server-side hash generation).
- **RTO Risk & Address**: [GoKwik](https://www.gokwik.co/) (Address verification and RTO risk assessment).
- **Messaging**: WhatsApp Business integration for customer support.

---

## ✨ Core Features

### 1. Premium Product Discovery
- **Dynamic Search**: Debounced search suggestions with real-time matching.
- **Advanced Filtering**: URL-based dynamic filters for Brands, Categories, Colors, Price Ranges, and Sizes.
- **Intelligent Sorting**: "Heat" based sorting to prioritize trending products.
- **Server-Side Pagination**: Efficient product loading via "Load More" pattern.

### 2. High-End Visual Experience
- **Interactive Lookbooks**: Shufflable product grids with dynamic backgrounds.
- **Heat Carousel**: Visual showcase of trending products.
- **Brand Ticker**: Animated ticker for featured partner brands.
- **Image Galleries**: Interactive product imagery with zoom and variant selection.

### 3. Shopping & Checkout Flow
- **Intelligent Cart Sync**: Seamlessly merges local storage cart items with database items upon user login.
- **Wishlist System**: Persistent wishlist for registered users.
- **Secure Checkout**:
    - Server-side PayU initiation.
    - GoKwik address pre-fill for logged-in users.
    - Coupon code validation system.
- **Approval-based COD**: "Request COD" workflow to minimize unauthorized Cash on Delivery usage.

### 4. Admin & Operational Tools
- **Owner Dashboard**: Secure dashboard for inventory management and order tracking.
- **Real-time Analytics**: Live visitor tracking and "Add to Cart" event notifications for the owner.
- **Data Scraper**: Integrated Cheerio-based scraper for importing products from external sources (e.g., Shopify sites like Culture Kings).
- **Order Management**: "Copy Info" tool for streamlining delivery logistics.

---

## 🛠 Implementation Details

### Security
- **Payment Hashing**: SHA-512 hashes are generated exclusively on the server (`/api/payment/initiate`) to prevent client-side tampering.
- **Protected Routes**: Owner dashboard is restricted via Supabase auth checks.
- **Event Bubbling Protection**: UI components (like Card links) use stopPropagation to ensure clean interactions.

### Performance
- **Prerendering**: Critical paths are optimized for Next.js static and dynamic rendering.
- **Database Resilience**: Implemented connection pooling and error-handling for Prisma during build-time and high-traffic periods.
- **Image Optimization**: Extensive use of `next/image` for responsive, fast-loading visuals.

### UX Details
- **Mobile First**: Fully responsive design with a dedicated mobile navigation menu.
- **Dark Mode**: Native support for dark/light themes with consistent UI across all flows.
- **Toast Notifications**: Real-time feedback for actions like "Added to Wishlist" or "Coupon Applied".

---

## 📂 Project Structure
- `/src/app`: Routes and API endpoints (Next.js App Router).
- `/src/components`: Reusable UI components (Navbar, Hero, ProductCard).
- `/prisma`: Database schema and migration logic.
- `/scripts`: Data migration and scraping automation.
- `/lib`: Shared utilities (Prisma client, Supabase config).

---
*Last Updated: April 2026*
