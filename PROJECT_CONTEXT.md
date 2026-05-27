# Project Context: POSEproject (AquaticStore)

This document provides a comprehensive overview of the POSEproject to optimize context and token usage for AI-assisted development.

## 1. Project Overview
- **Goal**: A modern, full-featured e-commerce platform specializing in aquatic products (aquariums, fish, plants, and accessories).
- **Primary Users**: Customers (browsing, shopping, tracking orders) and Admins (managing products, orders, users, and analytics).
- **Core Value**: Seamless shopping experience with real-time notifications, secure payments, and a robust management dashboard.

## 2. Tech Stack
### Frontend
- **Core**: React 18, Vite (Build tool), React Router v7.
- **State Management**: Redux Toolkit (Slices pattern).
- **Styling**: TailwindCSS, Material-UI (MUI) v7, Emotion.
- **UI Libraries**: Headless UI, Hero Icons, Lucide React, Swiper (Carousels), Recharts (Statistics).
- **Communication**: Axios (API Client), Socket.io-client (Real-time).

### Backend
- **Core**: Node.js (ES Modules), Express.js v5.
- **Database**: MongoDB with Mongoose ODM.
- **Caching**: Redis (for product data and performance).
- **Real-time**: Socket.io.
- **Security**: JWT (Cookies), bcryptjs, Google OAuth.
- **Integrations**: VNPay & Stripe (Payments), Cloudinary (Image storage), Nodemailer (Emails).

### Infrastructure
- **Containerization**: Docker & Docker Compose.
- **Web Server**: Nginx (serving frontend and proxying API).

## 3. Directory Map
### Root
- `/client`: Frontend React application.
- `/server`: Backend Node.js API.
- `/docker-compose.yml`: Local development environment orchestration.

### Frontend (`/client/src`)
- `components/`: Categorized UI components (`admin/`, `customer/`, `common/`, etc.).
- `context/`: React Contexts for global state like `AuthContext` and `SocketContext`.
- `pages/`: Page components representing different routes.
- `redux/`: Redux store configuration and domain-specific slices (`slices/`).
- `services/`: API abstraction layer (matches backend services).
- `utils/`: Reusable utility functions (e.g., `shippingCalculator.js`).

### Backend (`/server`)
- `config/`: Configuration for DB, Redis, and Socket.io.
- `controllers/`: Handles incoming HTTP requests and delegates logic to services.
- `middlewares/`: Custom logic for auth, error handling, file uploads, and rate limiting.
- `models/`: Mongoose schemas representing database entities.
- `routes/`: Express route definitions, aggregated in `indexRoutes.js`.
- `services/`: Business logic layer (Service Layer pattern). **Contains the core logic.**
- `utils/`: Helper functions for Cloudinary, Email, and Error classes.

## 4. Key Components & Interfaces (Summary)

### Backend Service Layer (Singletons)
- `AuthService`: `register()`, `login()`, `sendOTP()`, `verifyRegistrationOTP()`.
- `ProductService`: `createProduct()`, `getAllProducts()`, `getProductById()`, `searchProducts()`, `searchProductsQuick()`.
- `BlogService`: `createBlog()`, `getAllBlogs()`, `getBlogById()`, `getBlogBySlug()`, `getPublicBlogs()`, `updateBlog()`, `updateBlogStatus()`, `deleteBlog()`.
- `CommentService`: `createComment()`, `getCommentsByBlog()`, `deleteComment()`.
- `CacheService`: redis-based methods for cache management (including blog view increments).

### Backend Models (Schema Highlights)
- `User`: Handles authentication, profiles, and roles (`user` vs `admin`). Methods: `comparePassword`, `generateAuthToken`.
- `Product`: Rich schema supporting variations (options/variants), stock tracking, and status (`ACTIVE`/`INACTIVE`).
- `Blog`: Rich schema with HTML content, cover image (Cloudinary), references to `User`, `BlogCategory`, `Tag`, and `relatedProducts` (referencing `Product` with stock population). 
  - **Approval Workflow**: 3-step process (Draft -> Pending -> Published). Rejection sends the post back to Draft with a `rejectionReason`.
  - **Security**: Product tagging (`relatedProducts`) is strictly restricted to **Admin** users.
  - **Performance**: View counts use a 30-minute Redis TTL per IP to prevent spam. Tracks `commentCount`, `likeCount`, and `bookmarkCount`.
- `Comment`: Manages user interactions on blogs.
  - **Logic**: Automatically updates `blog.commentCount` on creation and removal.
- `BlogInteraction`: Dedicated collection for `LIKE` and `BOOKMARK` actions.
  - **Logic**: High-performance toggle system with compound indexing. Synchronizes counts in the underlying Blog document.
- `BlogCategory` & `Tag`: Metadata for blog categorization. `BlogCategory` includes a `status` field (`ACTIVE`/`INACTIVE`).

### Frontend Architecture
- `api.js`: Central Axios instance with interceptors for global error handling (401 logout/redirect).
- `store.js`: Redux store aggregating slices for Auth, Cart, Products, Notifications, etc.
- `ProtectedRoute.jsx`: Logic for guarding routes based on authentication and roles.

## 5. Coding Conventions
- **Module System**: Always use ES Modules (`import`/`export`).
- **Naming Conventions**:
  - `camelCase`: Variables, functions, file names (mostly).
  - `PascalCase`: Components, Models, Classes.
  - `UPPER_SNAKE_CASE`: Constants and environment variables.
- **Pattern**: Follow the **Service Layer** architecture on the backend. Controllers should be thin; business logic belongs in Services.
- **Error Handling**: 
  - Backend: Use custom error classes (`BadRequestError`, `NotFoundError`) and catch-all `errorHandler` middleware.
  - Frontend: Use `react-toastify` for user feedback and `api.js` interceptors for global errors.
- **UI/UX**: 
  - Use Tailwind for layout and MUI for complex components.
  - Prioritize responsive design and accessible HTML attributes.
- **API Standards**:
  - Base URL prefix: `/api/v1`.
  - Use standard HTTP status codes via `http-status-codes` library.
  - Logic for API responses: `{ success: true, data: ..., message: ... }`.

## 6. Shop Page Redesign (May 2026)

### Experience Direction
- The customer shop keeps the AquaticCaps deep-aqua/neon identity in dark mode and the soft aqua/cream aquatic skin in light mode; it is intentionally not a generic white marketplace layout.
- The visual hierarchy is now: cinematic recommended hero -> sticky discovery/search controls -> personalized recommendation rail -> catalogue with compact filters -> supporting recommendation rails -> aquascape inspiration.
- A generated, locally served campaign image is stored at `client/public/images/shop-hero-aquaticcaps.jpg` (optimized JPEG, approximately 263 KB) for a stable and performant hero.

### Reusable Component Structure
- `ShopHeroBanner.jsx`: premium glass hero with campaign CTA and trending product previews.
- `ShopDiscoveryBar.jsx`: sticky search, responsive sort selector, mobile filter trigger, and quick discovery chips.
- `FilterSidebar.jsx`: 260 px desktop filter card reused inside a bottom `Drawer` on mobile. Contains collapsible categories, price, rating, availability, aquarium type, plant difficulty, and fish-type discovery controls.
- `ProductCard.jsx`: shared premium grid/rail card with lazy-loaded image, image zoom, stock state, hover/focus quick view, add-to-cart, and local recently-viewed signal. Wishlist controls are intentionally omitted until persistent wishlist support exists.
- `RecommendationSection.jsx`: horizontal, touch-scrollable recommendation rail for future recommendation sources.
- `AquascapeInspiration.jsx`: horizontal visual setup showcase using local aquatic imagery.

### Recommendation Integration
- Authenticated customers receive purchase-based results from `GET /api/v1/products/recommendations/for-you`. It considers non-cancelled/non-failed order items, excludes already purchased products, and returns two deliberately distinct sets: `recommended` across purchased categories and `similar` restricted to categories in the most recent order.
- Customers without purchase history see a truthful `Sản phẩm nổi bật` discovery rail rather than a personalized label. `Best sellers` and `Trending now` remain catalogue discovery rails based on product sales/views.
- `Recently viewed` is displayed for signed-in users after a product interaction and is persisted under `aquaticcaps-recently-viewed` in local storage.
- `RecommendationSection` accepts ordinary product arrays, so a future personalization service can replace each derived array independently without changing the presentation component.

### Responsive and Interaction Rules
- Desktop uses a compact sticky `260px` filter sidebar and an expanded product area; grid responds from two columns to three and four columns.
- Mobile uses touch-visible card actions, a sticky/floating filter action, and an MUI bottom sheet; recommendation and inspiration sections use horizontal swipe scrolling.
- Images below the hero load lazily; loading uses aquatic skeleton cards; focus/hover states use restrained aqua glow and elevation.
- Search submits intentionally rather than fetching for every keystroke, while quick chips apply focused discovery queries or sorting immediately.

### Shop Visual Tokens
- Spacing cadence: `12/16px` inside compact controls/cards, `20/24px` for headings and card groups, `40px` between discovery sections, and `64px` bottom page breathing room.
- Typography hierarchy: `Fraunces` (`font-headline`) for campaign and section headlines; `Space Grotesk` (`font-body`) for controls, product metadata, price, and badges.
- Dark surfaces use `#051C1C`/glass panels with `#00FFD1` interaction accents; light surfaces keep aqua-tinted glass, subtle depth, and the cinematic dark hero for readable campaign contrast.
