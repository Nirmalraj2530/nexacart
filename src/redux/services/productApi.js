import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getHttpStatusDetails } from "@/utils/httpErrors";

const localBackendUrl = "http://localhost:5000/api";
const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_BASE_URL.includes("escuelajs.co")
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : localBackendUrl;
const authBaseUrl =
  process.env.NEXT_PUBLIC_AUTH_API_BASE_URL && !process.env.NEXT_PUBLIC_AUTH_API_BASE_URL.includes("escuelajs.co")
    ? process.env.NEXT_PUBLIC_AUTH_API_BASE_URL
    : baseUrl;

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("nexacart_access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

let activeRefreshPromise = null;

const attemptTokenRefresh = async (api, extraOptions) => {
  if (typeof window === "undefined") return false;
  const currentToken = localStorage.getItem("nexacart_access_token");
  if (!currentToken || currentToken.startsWith("demo_jwt_token_")) {
    return false;
  }

  if (!activeRefreshPromise) {
    activeRefreshPromise = (async () => {
      try {
        const refreshRes = await rawBaseQuery(
          {
            url: `${authBaseUrl}/auth/refresh-token`,
            method: "POST",
          },
          api,
          extraOptions
        );

        const nextToken = refreshRes?.data?.access_token || refreshRes?.data?.token;
        if (nextToken) {
          localStorage.setItem("nexacart_access_token", nextToken);
          api.dispatch({
            type: "auth/setCredentials",
            payload: { access_token: nextToken },
          });
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        activeRefreshPromise = null;
      }
    })();
  }

  return activeRefreshPromise;
};

const baseQueryWithStatusHandling = async (args, api, extraOptions) => {
  let requestArgs = typeof args === "string" ? { url: args } : { ...args };
  let targetUrl = requestArgs.url || "";
  const method = requestArgs.method || "GET";

  // Ensure all endpoints route cleanly to our local NexaCart backend
  if (targetUrl.includes("api.escuelajs.co")) {
    targetUrl = targetUrl.replace(/https?:\/\/api\.escuelajs\.co(\/api\/v1)?/, baseUrl);
    requestArgs.url = targetUrl;
  } else if (!targetUrl.startsWith("http")) {
    const cleanPath = targetUrl.startsWith("/") ? targetUrl : `/${targetUrl}`;
    if (
      targetUrl.includes("/auth") ||
      targetUrl.includes("/users") ||
      targetUrl.includes("check-email") ||
      targetUrl.includes("is-available")
    ) {
      targetUrl = `${authBaseUrl}${cleanPath}`;
    } else {
      targetUrl = `${baseUrl}${cleanPath}`;
    }
    requestArgs.url = targetUrl;
  }

  const isAuth = targetUrl.includes("5000") || targetUrl.includes("/auth") || targetUrl.includes("/users");

  if (isAuth && typeof window !== "undefined") {
    console.group(`%c🌐 [FRONTEND API CALL] ${method} ${targetUrl}`, "color: #3b82f6; font-weight: bold;");
    if (requestArgs?.body && !(requestArgs.body instanceof FormData)) {
      const masked = { ...requestArgs.body };
      if (masked.password) masked.password = "******";
      if (masked.currentPassword) masked.currentPassword = "******";
      if (masked.newPassword) masked.newPassword = "******";
      console.log("Request Payload:", masked);
    }
  }

  let result = await rawBaseQuery(requestArgs, api, extraOptions);

  // Automatic encrypted JWT refresh & retry once on 401
  const skipAutoRefresh =
    targetUrl.includes("/auth/login") ||
    targetUrl.includes("/auth/register") ||
    targetUrl.includes("/auth/refresh-token") ||
    targetUrl.includes("/auth/logout");

  if (result.error?.status === 401 && !skipAutoRefresh) {
    const refreshed = await attemptTokenRefresh(api, extraOptions);
    if (refreshed) {
      result = await rawBaseQuery(requestArgs, api, extraOptions);
    }
  }

  if (isAuth && typeof window !== "undefined") {
    if (result.error) {
      console.error(`%c❌ [FRONTEND API ERROR] ${method} ${targetUrl} ->`, "color: #ef4444; font-weight: bold;", result.error);
    } else {
      console.log(`%c✅ [FRONTEND API SUCCESS] ${method} ${targetUrl} ->`, "color: #22c55e; font-weight: bold;", result.data);
    }
    console.groupEnd();
  }

  if (result.error) {
    const statusCode = result.error.status;
    let rawMessage = result.error.data?.message;
    if (Array.isArray(rawMessage)) {
      rawMessage = rawMessage.join(", ");
    }
    if (statusCode === "FETCH_ERROR") {
      rawMessage = "Backend server is unreachable at http://localhost:5000. Please ensure the backend is running (cd backend && npm run dev).";
    }
    const details = getHttpStatusDetails(statusCode, rawMessage);
    result.error.statusCode = details.code;
    result.error.statusName = details.name;
    result.error.statusTitle = details.title;
    result.error.friendlyMessage = details.message;
  }

  return result;
};

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithStatusHandling,
  tagTypes: [
    "Products",
    "Product",
    "Categories",
    "Category",
    "Users",
    "User",
    "Auth",
    "Addresses",
    "Orders",
    "Order",
    "Reviews",
    "Coupons",
    "Cart",
    "Wishlist",
    "Analytics",
    "Locations",
  ],
  endpoints: (builder) => ({
    // ==========================================
    // 1-8. PRODUCTS ENDPOINTS
    // ==========================================
    getProducts: builder.query({
      query: (params) => {
        if (!params) return "/products";
        const queryParams = new URLSearchParams();
        if (params.title) queryParams.append("title", params.title);
        if (params.categoryId) queryParams.append("categoryId", params.categoryId);
        if (params.price_min) queryParams.append("price_min", params.price_min);
        if (params.price_max) queryParams.append("price_max", params.price_max);
        if (params.offset !== undefined) queryParams.append("offset", params.offset);
        if (params.limit !== undefined) queryParams.append("limit", params.limit);
        const queryString = queryParams.toString();
        return queryString ? `/products?${queryString}` : "/products";
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Products", id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    getProductBySlug: builder.query({
      query: (slug) => `/products/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Product", id: slug }],
    }),

    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }, "Analytics"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
        "Analytics",
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }, "Analytics"],
    }),

    getRelatedProducts: builder.query({
      query: (id) => `/products/${id}/related`,
      providesTags: (result, error, id) => [{ type: "Product", id: `related-${id}` }],
    }),

    getRelatedProductsBySlug: builder.query({
      query: (slug) => `/products/slug/${slug}/related`,
      providesTags: (result, error, slug) => [{ type: "Product", id: `related-slug-${slug}` }],
    }),

    // ==========================================
    // 9-15. USERS & ADDRESSES ENDPOINTS
    // ==========================================
    getUsers: builder.query({
      query: () => `${authBaseUrl}/users`,
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Users", id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUserById: builder.query({
      query: (id) => `${authBaseUrl}/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation({
      query: (newUser) => ({
        url: `${authBaseUrl}/users`,
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }, "Analytics"],
    }),

    registerUser: builder.mutation({
      query: (userData) => ({
        url: `${authBaseUrl}/auth/register`,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `${authBaseUrl}/users/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `${authBaseUrl}/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }, "Analytics"],
    }),

    checkUserAvailability: builder.mutation({
      query: (body) => ({
        url: `${authBaseUrl}/auth/check-email`,
        method: "POST",
        body,
      }),
    }),

    getAddresses: builder.query({
      query: () => `${authBaseUrl}/users/addresses`,
      providesTags: ["Addresses"],
    }),

    addAddress: builder.mutation({
      query: (address) => ({
        url: `${authBaseUrl}/users/addresses`,
        method: "POST",
        body: address,
      }),
      invalidatesTags: ["Addresses"],
    }),

    updateAddress: builder.mutation({
      query: ({ addressId, ...body }) => ({
        url: `${authBaseUrl}/users/addresses/${addressId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Addresses"],
    }),

    setDefaultAddress: builder.mutation({
      query: (addressId) => ({
        url: `${authBaseUrl}/users/addresses/${addressId}/default`,
        method: "PATCH",
      }),
      invalidatesTags: ["Addresses"],
    }),

    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `${authBaseUrl}/users/addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Addresses"],
    }),

    // ==========================================
    // 16-20. AUTH & PROFILE ENDPOINTS
    // ==========================================
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: `${authBaseUrl}/auth/login`,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Addresses", "Orders", "Cart", "Wishlist"],
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: `${authBaseUrl}/auth/logout`,
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Addresses", "Orders", "Cart", "Wishlist"],
    }),

    getUserProfile: builder.query({
      query: () => `${authBaseUrl}/auth/profile`,
      providesTags: ["Auth"],
    }),

    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: `${authBaseUrl}/auth/profile`,
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["Auth"],
    }),

    changePassword: builder.mutation({
      query: (passwords) => ({
        url: `${authBaseUrl}/auth/change-password`,
        method: "PUT",
        body: passwords,
      }),
    }),

    refreshToken: builder.mutation({
      query: (body) => ({
        url: `${authBaseUrl}/auth/refresh-token`,
        method: "POST",
        body,
      }),
    }),

    // ==========================================
    // 21-27. CATEGORIES ENDPOINTS
    // ==========================================
    getCategories: builder.query({
      query: () => "/categories",
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Categories", id })),
              { type: "Categories", id: "LIST" },
            ]
          : [{ type: "Categories", id: "LIST" }],
    }),

    getCategoryById: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    createCategory: builder.mutation({
      query: (newCategory) => ({
        url: "/categories",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }, "Analytics"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Categories", id: "LIST" },
        { type: "Products", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Categories", id: "LIST" },
        { type: "Products", id: "LIST" },
        "Analytics",
      ],
    }),

    getCategoryBySlug: builder.query({
      query: (slug) => `/categories/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Category", id: slug }],
    }),

    getCategoryProducts: builder.query({
      query: (id) => `/categories/${id}/products`,
      providesTags: (result, error, id) => [{ type: "Products", id: `cat-${id}` }],
    }),

    // ==========================================
    // 28-34. ORDERS ENDPOINTS
    // ==========================================
    placeOrder: builder.mutation({
      query: (orderPayload) => ({
        url: "/orders",
        method: "POST",
        body: orderPayload,
      }),
      invalidatesTags: ["Orders", "Analytics", { type: "Products", id: "LIST" }],
    }),

    getMyOrders: builder.query({
      query: () => "/orders/my",
      providesTags: ["Orders"],
    }),

    getAllOrders: builder.query({
      query: () => "/orders",
      providesTags: ["Orders"],
    }),

    trackOrder: builder.query({
      query: (code) => `/orders/track/${encodeURIComponent(code)}`,
      providesTags: (result, error, code) => [{ type: "Order", id: code }],
    }),

    cancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Orders", "Analytics"],
    }),

    requestOrderReturn: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/return`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Orders", "Analytics"],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, status, paymentStatus }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status, paymentStatus },
      }),
      invalidatesTags: ["Orders", "Analytics"],
    }),

    // ==========================================
    // 35-37. REVIEWS ENDPOINTS
    // ==========================================
    getProductReviews: builder.query({
      query: (productId) => `/products/${productId}/reviews`,
      providesTags: (result, error, productId) => [{ type: "Reviews", id: productId }],
    }),

    createProductReview: builder.mutation({
      query: ({ productId, rating, title, body }) => ({
        url: `/products/${productId}/reviews`,
        method: "POST",
        body: { rating, title, body },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Reviews", id: productId },
        "Analytics",
      ],
    }),

    toggleReviewHelpful: builder.mutation({
      query: ({ reviewId }) => ({
        url: `/reviews/${reviewId}/helpful`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { productId }) =>
        productId ? [{ type: "Reviews", id: productId }] : ["Reviews"],
    }),

    // ==========================================
    // 38-41. COUPONS ENDPOINTS
    // ==========================================
    validateCoupon: builder.mutation({
      query: ({ code, subtotal }) => ({
        url: "/coupons/validate",
        method: "POST",
        body: { code, subtotal },
      }),
    }),

    getCoupons: builder.query({
      query: () => "/coupons",
      providesTags: ["Coupons"],
    }),

    createCoupon: builder.mutation({
      query: (coupon) => ({
        url: "/coupons",
        method: "POST",
        body: coupon,
      }),
      invalidatesTags: ["Coupons"],
    }),

    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupons"],
    }),

    // ==========================================
    // 42-47. CART & WISHLIST CLOUD SYNC ENDPOINTS
    // ==========================================
    getServerCart: builder.query({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),

    syncServerCart: builder.mutation({
      query: (items) => ({
        url: "/cart",
        method: "PUT",
        body: { items },
      }),
      invalidatesTags: ["Cart"],
    }),

    clearServerCart: builder.mutation({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    getServerWishlist: builder.query({
      query: () => "/wishlist",
      providesTags: ["Wishlist"],
    }),

    addServerWishlistItem: builder.mutation({
      query: (item) => ({
        url: "/wishlist",
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["Wishlist"],
    }),

    removeServerWishlistItem: builder.mutation({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // ==========================================
    // 48-51. ADMIN ANALYTICS, FILE UPLOAD & LOCATIONS
    // ==========================================
    getAdminAnalytics: builder.query({
      query: () => "/admin/analytics",
      providesTags: ["Analytics"],
    }),

    uploadFile: builder.mutation({
      query: (formData) => ({
        url: "/files/upload",
        method: "POST",
        body: formData,
      }),
    }),

    getFile: builder.query({
      query: (filename) => `/files/${filename}`,
    }),

    getLocations: builder.query({
      query: () => "/locations",
      providesTags: ["Locations"],
    }),
  }),
});

export const {
  // Products
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetRelatedProductsQuery,
  useGetRelatedProductsBySlugQuery,
  // Users & Addresses
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useRegisterUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCheckUserAvailabilityMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
  // Auth
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRefreshTokenMutation,
  // Categories
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryBySlugQuery,
  useGetCategoryProductsQuery,
  // Orders
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useTrackOrderQuery,
  useLazyTrackOrderQuery,
  useCancelOrderMutation,
  useRequestOrderReturnMutation,
  useUpdateOrderStatusMutation,
  // Reviews
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useToggleReviewHelpfulMutation,
  // Coupons
  useValidateCouponMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  // Cart & Wishlist
  useGetServerCartQuery,
  useLazyGetServerCartQuery,
  useSyncServerCartMutation,
  useClearServerCartMutation,
  useGetServerWishlistQuery,
  useLazyGetServerWishlistQuery,
  useAddServerWishlistItemMutation,
  useRemoveServerWishlistItemMutation,
  // Admin Analytics, Files & Locations
  useGetAdminAnalyticsQuery,
  useUploadFileMutation,
  useGetFileQuery,
  useGetLocationsQuery,
} = productApi;
