# 🛒 Nexacart — Full Project Flow

**Tech Stack:** Next.js (App Router) · Redux Toolkit · RTK Query · Vanilla CSS  
**API:** [Escuela JS Public API](https://api.escuelajs.co/api/v1)

---

## 📁 Project Structure

```
src/
├── app/                        ← Next.js App Router pages
│   ├── page.js                     → Home Page
│   ├── layout.js                   → Root Layout (global providers)
│   ├── loading.js                  → Global loading UI
│   ├── not-found.js                → 404 Page
│   ├── products/
│   │   ├── page.js                 → Product Listing Page
│   │   └── [id]/page.js            → Product Detail Page
│   ├── cart/page.js                → Shopping Cart Page
│   ├── checkout/page.js            → Checkout Page
│   ├── locations/page.js           → Store Locations Page
│   └── admin/
│       ├── layout.js               → Admin Layout (AuthGuard wrapped)
│       ├── page.js                 → Admin Dashboard
│       ├── products/
│       │   ├── page.js             → Manage All Products
│       │   ├── create/page.js      → Create New Product
│       │   └── edit/[id]/page.js   → Edit Existing Product
│       ├── categories/page.js      → Manage Categories
│       └── users/
│           ├── layout.js           → Users layout (Admin-only guard)
│           └── page.js             → Manage Users
├── components/
│   ├── layout/
│   │   ├── Header.js               → Top navigation bar
│   │   └── Footer.js               → Site footer
│   ├── home/
│   │   └── HomeHeroSlider.js       → Animated hero banner slider
│   ├── product/
│   │   ├── ProductCard.js          → Individual product card
│   │   ├── ProductGrid.js          → Grid layout wrapper
│   │   ├── ProductFilters.js       → Category & price range filters
│   │   ├── ProductSearch.js        → Search input with debounce
│   │   ├── ProductSort.js          → Sort dropdown (price, name)
│   │   ├── ProductPagination.js    → Offset-based pagination
│   │   ├── RecentlyViewed.js       → localStorage-based history
│   │   └── RelatedProducts.js      → Related product suggestions
│   ├── auth/
│   │   ├── LoginModal.js           → Global login/register modal
│   │   └── AuthGuard.js            → Role-based route protection
│   ├── admin/
│   │   ├── AdminSidebar.js         → Admin navigation sidebar
│   │   ├── AdminNav.js             → Admin breadcrumb/top nav
│   │   ├── AdminTopBar.js          → Admin header bar
│   │   ├── ProductForm.js          → Create/Edit product form
│   │   └── DeleteConfirmModal.js   → Confirmation dialog for delete
│   └── common/
│       ├── Button.js               → Reusable button (variants + sizes)
│       ├── Input.js                → Controlled text input
│       ├── Select.js               → Dropdown select
│       ├── Modal.js                → Portal-based overlay modal
│       ├── Toast.js                → Auto-dismiss notifications
│       ├── Skeleton.js             → Loading placeholder components
│       ├── LoadingOverlay.js       → Full-screen loading/auth screen
│       ├── EmptyState.js           → No data state UI
│       ├── ErrorState.js           → API error UI with retry button
│       ├── ImageUpload.js          → Drag-drop + preview image uploader
│       ├── BackToTop.js            → Floating scroll-to-top button
│       ├── PromoOfferModal.js      → Auto-popup promotional modal
│       └── GlobalLoadingManager.js → Manages full-page loading overlay
├── redux/
│   ├── store.js                    → Redux store configuration
│   ├── provider.js                 → ReduxProvider wrapper
│   ├── slices/
│   │   ├── authSlice.js            → Auth state (token, user, modal)
│   │   ├── cartSlice.js            → Cart state (items, localStorage)
│   │   └── uiSlice.js              → UI state (toasts, menu, loading)
│   └── services/
│       └── productApi.js           → RTK Query API (27 endpoints)
├── hooks/
│   ├── useAuth.js                  → Auth state + role actions hook
│   ├── useDebounce.js              → Input debounce hook
│   ├── useFormValidation.js        → Form error management hook
│   ├── useLocalStorage.js          → Generic localStorage hook
│   └── useApiSimulation.js         → Demo API delay context
├── utils/
│   ├── formatters.js               → formatCurrency, cleanImageUrl, etc.
│   └── validators.js               → Email, phone, password validators
└── styles/
    ├── tokens.css                  → CSS design tokens (colors, spacing)
    ├── common.css                  → Shared utility styles
    ├── layout.css                  → Header, footer layout styles
    ├── product.css                 → Product card & listing styles
    ├── cart.css                    → Cart page styles
    └── admin.css                   → Admin panel styles
```

---

## 1. App Bootstrap — `layout.js`

The root layout wraps every page with the following providers and global components:

| Component | Purpose |
|---|---|
| `ReduxProvider` | Mounts the global Redux store |
| `ApiSimulationProvider` | Provides demo API delay simulation context |
| `Header` | Top navigation bar (always visible) |
| `Footer` | Bottom footer (always visible) |
| `ToastContainer` | Renders global toast notifications |
| `LoginModal` | Global auth modal (can be triggered from anywhere) |
| `PromoOfferModal` | Promotional popup (auto-shows with delay) |
| `BackToTop` | Floating scroll-to-top button |
| `GlobalLoadingManager` | Manages full-screen loading overlay |

---

## 2. Redux Store — 3 Slices + 1 API Service

### 🔐 authSlice

Manages authentication state. Designed to be **SSR-safe** — localStorage is only accessed client-side.

| Action | Description |
|---|---|
| `hydrateAuth` | Loads token and user from localStorage into Redux (runs in `useEffect` only) |
| `setCredentials` | Saves token and user after successful login |
| `setUserProfile` | Updates user data after profile fetch |
| `logout` | Clears token, user, and removes localStorage keys |
| `openLoginModal` | Opens the global login modal |
| `closeLoginModal` | Closes the global login modal |

**State:**
```js
{ token, user, isAuthenticated, isLoginModalOpen, isHydrated }
```

---

### 🛒 cartSlice

Manages the shopping cart. **Automatically persists to localStorage** on every action.

| Action | Description |
|---|---|
| `hydrateCart` | Loads saved cart items from localStorage |
| `addToCart` | Adds a product (if exists → increments quantity) |
| `removeFromCart` | Removes a product by ID |
| `updateQuantity` | Updates item quantity (qty ≤ 0 → auto-removes) |
| `clearCart` | Empties the entire cart |
| `setPendingCartItem` | Stores an item when a guest tries to add (before login) |
| `clearPendingCartItem` | Clears the pending item after it's been added post-login |

**Selectors:** `selectCartItems`, `selectCartTotalCount`, `selectCartSubtotal`, `selectPendingCartItem`

---

### 🎨 uiSlice

Manages global UI state.

| Action | Description |
|---|---|
| `addToast` / `removeToast` | Add or dismiss a notification toast |
| `setSearchQuery` | Tracks the global search input value |
| `setMobileMenuOpen` / `toggleMobileMenu` | Controls mobile navigation drawer |
| `setGlobalLoading` | Shows or hides the full-page loading overlay |

---

### 🌐 productApi — RTK Query (27 Endpoints)

Base URL: `https://api.escuelajs.co/api/v1`

All requests automatically attach the JWT token from localStorage via `prepareHeaders`.

| Category | Endpoints |
|---|---|
| **Products** | `getProducts`, `getProductById`, `getProductBySlug`, `createProduct`, `updateProduct`, `deleteProduct`, `getRelatedProducts`, `getRelatedProductsBySlug` |
| **Categories** | `getCategories`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`, `getCategoryBySlug`, `getCategoryProducts` |
| **Users** | `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`, `checkUserAvailability` |
| **Auth** | `loginUser`, `getUserProfile`, `refreshToken` |
| **Files & Other** | `uploadFile`, `getFile`, `getLocations` |

---

## 3. Authentication Flow

```
User visits the site
        ↓
Header mounts → useAuth() → dispatch(hydrateAuth())
        ↓
Reads localStorage → populates Redux (token, user, isAuthenticated)
        ↓
  ┌─ Not Authenticated ─────────────────────────────────────┐
  │  Login button clicked → openLoginModal()                │
  │  LoginModal opens → user enters email + password        │
  │  → loginUser() API call                                 │
  │  → Success: setCredentials(token + user)                │
  │  → localStorage save + closeLoginModal + toast          │
  └─────────────────────────────────────────────────────────┘
        ↓
  ┌─ Authenticated ─────────────────────────────────────────┐
  │  Header shows user avatar + name + role badge           │
  │  Cart persists across sessions                          │
  │  Admin routes accessible based on role                  │
  └─────────────────────────────────────────────────────────┘
```

### Role Hierarchy

| Role | Access Level |
|---|---|
| **Guest** (not logged in) | Home, Products browse, Cart view |
| **Customer** | + Checkout, Order placement |
| **Manager** | + Admin Dashboard, Products CRUD, Categories CRUD |
| **Admin** | + Users management (all Manager permissions) |

> **Demo Login:** The `useAuth` hook provides `loginAsRole("Admin" / "Manager" / "Customer")` which creates a mock JWT token for testing purposes.

---

## 4. Route Protection — `AuthGuard`

All `/admin/*` routes are wrapped with `AuthGuard`, which implements a 4-phase render cycle to prevent SSR hydration mismatches:

```
Phase 1: mounted = false → return null
         (Server and client both return null → always match, no hydration error)

Phase 2: mounted = true, isHydrated = false → show LoadingOverlay
         (Waiting for localStorage to load into Redux)

Phase 3: isHydrated = true, hasPermission = false → show "Access Restricted" overlay
         → dispatch redirect to "/" + openLoginModal()

Phase 4: isHydrated = true, hasPermission = true → render admin content ✅
```

---

## 5. Page-by-Page Flow

### 🏠 Home Page (`/`)

1. Fetches all products and categories via RTK Query
2. Renders sections in order:
   - **HomeHeroSlider** — animated promotional banner
   - **Explore Categories** — top 6 categories in a grid
   - **Featured Products** — products[0–3]
   - **Flash Deals** — products[4–7] inside a gradient promo container
   - **Banner CTA** — full-width promotional block with shop link
   - **Latest Arrivals** — products[8–15]
   - **Recommended For You** — products[16–19]
3. Loading state renders `ProductCardSkeleton` and `CategoryCardSkeleton` components

---

### 📦 Products Listing (`/products`)

1. Reads URL query params: `category`, `price_min`, `price_max`, `title`, `offset`, `limit`
2. Passes params to `useGetProductsQuery(params)` → filtered API call
3. Features:
   - **ProductSearch** — debounced search (prevents excessive API calls)
   - **ProductFilters** — category dropdown + price range inputs
   - **ProductSort** — sort by price asc/desc, name
   - **ProductGrid** — responsive product cards grid
   - **ProductPagination** — offset-based next/prev navigation
   - **RecentlyViewed** — tracks viewed products in localStorage

---

### 🔍 Product Detail (`/products/[id]`)

1. Fetches product by ID via `useGetProductByIdQuery(id)`
2. Displays: image gallery, title, price, category, description
3. "Add to Cart" button behavior:
   - **Logged in** → `dispatch(addToCart(product))` → toast notification
   - **Not logged in** → `dispatch(setPendingCartItem(product))` → `openLoginModal()`
   - After login → `pendingCartItem` is auto-added to cart (seamless UX)
4. `RelatedProducts` — fetches related products from same category
5. Updates `RecentlyViewed` list in localStorage

---

### 🛒 Cart Page (`/cart`)

1. Reads cart state from Redux (`selectCartItems`, `selectCartSubtotal`)
2. Features:
   - Item quantity `+` / `−` controls → `dispatch(updateQuantity(...))`
   - Remove individual item → `dispatch(removeFromCart(id))` + toast
   - Clear entire cart → `dispatch(clearCart())` + toast
   - **Free Shipping Progress Bar** (threshold: $100) with animated fill
   - Order Summary sidebar (subtotal + shipping + total)
3. "Proceed to Checkout" button:
   - Not authenticated → warning toast + `openLoginModal()`
   - Authenticated → `router.push("/checkout")`

---

### 💳 Checkout Page (`/checkout`)

1. **Auth guard:** Checks `isAuthenticated` after hydration. If not logged in → toast + `openLoginModal()` + `router.replace("/cart")`
2. Collects shipping details via a validated form:
   - Full Name, Email, Phone
   - Street Address, City, State, ZIP, Country
3. Inline validation on submit (required fields + email format check)
4. **Order Summary** in a sticky sidebar with all cart items
5. Shipping logic: FREE if subtotal ≥ $100, otherwise $10
6. "Place Order" → 1-second simulated processing → `clearCart()` → **Order Success Modal**
7. Success modal displays: Order ID (`NEXA-XXXXXX`), customer name, and "Continue Shopping" button

---

### 🗺️ Locations (`/locations`)

- Fetches store locations via `useGetLocationsQuery()`
- Renders a list/map view of physical store locations

---

## 6. Admin Panel Flow

### Dashboard (`/admin`) — Requires: Manager or Admin

- Stat cards: Total Products, Total Categories, Active Users (Admin-only)
- "Recently Added Products" table (latest 5 products)
- Quick action buttons: Create Product, Manage All Products

### Products Management (`/admin/products`)

| Action | Route | API Mutation |
|---|---|---|
| View all | `/admin/products` | `useGetProductsQuery` |
| Create | `/admin/products/create` | `useCreateProductMutation` |
| Edit | `/admin/products/edit/[id]` | `useUpdateProductMutation` |
| Delete | Inline modal | `useDeleteProductMutation` |

- `ProductForm` component used for both create and edit
- `ImageUpload` component: drag-and-drop, preview, `useUploadFileMutation`
- `DeleteConfirmModal` prevents accidental deletion

### Categories Management (`/admin/categories`)

- Full CRUD for product categories
- Uses `useCreateCategoryMutation`, `useUpdateCategoryMutation`, `useDeleteCategoryMutation`

### Users Management (`/admin/users`) — Requires: Admin only

- Full user list from `useGetUsersQuery` (skipped entirely if role ≠ Admin)
- View, edit, and delete user accounts

---

## 7. Custom Hooks

| Hook | Purpose |
|---|---|
| `useAuth` | Exposes auth state, role flags (`isAdmin`, `isManager`, `isCustomer`), and actions (`login`, `logout`, `loginAsRole`, `openLogin`, `simulateSessionExpired`) |
| `useDebounce` | Delays a value update — used in search to throttle API calls |
| `useFormValidation` | Manages form error state and field validation |
| `useLocalStorage` | Generic hook for reading/writing to localStorage with state sync |
| `useApiSimulation` | Provides context for toggling simulated API delays in demo mode |

---

## 8. Common Components

| Component | Description |
|---|---|
| `Button` | Variants: `primary`, `secondary`, `outline`, `ghost` · Sizes: `sm`, `md`, `lg` · Supports `icon`, `isLoading`, `fullWidth` props |
| `Input` | Controlled input with label, error message, and accessible markup |
| `Select` | Styled dropdown with label and error support |
| `Modal` | Portal-rendered overlay with backdrop click-to-close |
| `Toast` / `ToastContainer` | Auto-dismissing notification toasts (success, error, info, warning) |
| `Skeleton` | Loading placeholders: `ProductCardSkeleton`, `CategoryCardSkeleton`, `TableSkeleton` |
| `LoadingOverlay` | Full-screen spinner overlay used during auth checks |
| `EmptyState` | No-data UI with optional action button |
| `ErrorState` | API error UI with retry callback |
| `ImageUpload` | Drag-and-drop image uploader with preview and API upload |
| `BackToTop` | Floating button that appears after scrolling down |
| `PromoOfferModal` | Auto-popup promotional offer modal with timer |
| `GlobalLoadingManager` | Subscribes to `uiSlice.isGlobalLoading` and renders `LoadingOverlay` |

---

## 9. Utilities

### `formatters.js`
- `formatCurrency(amount)` — formats numbers as USD currency strings
- `cleanImageUrl(url, fallback, label)` — handles stringified JSON image arrays, invalid URLs, and generates placeholder URLs
- Date formatters, text truncation helpers

### `validators.js`
- `validateEmail(email)` — checks valid email format
- `validatePhone(phone)` — validates phone number format
- `validatePassword(password)` — checks password strength requirements

---

## 10. Key Data Flow Diagram

```
External API (escuelajs.co)
        ↕ (HTTP via RTK Query)
  productApi (27 endpoints)
        ↕ (Redux state + cache)
  Redux Store
  ├── authSlice    → isAuthenticated, user, token, modal state
  ├── cartSlice    → items, subtotal, count (↔ localStorage)
  └── uiSlice      → toasts, mobile menu, global loading
        ↕
  React Components (pages + shared components)
        ↕
  User Interactions
  → dispatch() actions → state updates → localStorage persist
```

---

## 11. Important Implementation Notes

### SSR Hydration Safety
- `authSlice` and `cartSlice` both use `isHydrated` flag
- localStorage is **never** accessed during server-side rendering
- Access is deferred to `useEffect` (client-only) to prevent hydration mismatch errors

### Pending Cart Item Flow
```
Guest user clicks "Add to Cart"
        ↓
dispatch(setPendingCartItem(product))
dispatch(openLoginModal())
        ↓
User logs in successfully
        ↓
LoginModal detects pendingCartItem in Redux
        ↓
dispatch(addToCart(pendingCartItem))
dispatch(clearPendingCartItem())
        ↓
Item added to cart seamlessly ✅
```

### RTK Query Cache Invalidation
- Product mutations (create/update/delete) invalidate `["Products", "LIST"]` tag
- This automatically refetches all product list queries across the app
- No manual refetch calls needed

> **Note:** This is a **frontend-only portfolio demo project**. The checkout flow is simulated — no real payment processing or order backend exists. Authentication works against the real Escuela JS API.
