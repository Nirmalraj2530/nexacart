import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getHttpStatusDetails } from "@/utils/httpErrors";
import { sanitizeCategories } from "@/utils/formatters";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || "http://localhost:5000/api";

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

const baseQueryWithStatusHandling = async (args, api, extraOptions) => {
  let requestArgs = typeof args === "string" ? { url: args } : { ...args };
  let targetUrl = requestArgs.url || "";
  const method = requestArgs.method || "GET";

  // GUARANTEE: Intercept ALL Auth and User requests and force them to local backend (http://localhost:5000/api)
  if (
    targetUrl.includes("/auth") ||
    targetUrl.includes("/users") ||
    targetUrl.includes("check-email") ||
    targetUrl.includes("is-available")
  ) {
    if (targetUrl.includes("api.escuelajs.co")) {
      targetUrl = targetUrl.replace(/https?:\/\/api\.escuelajs\.co(\/api\/v1)?/, authBaseUrl);
    } else if (!targetUrl.startsWith("http")) {
      const cleanPath = targetUrl.startsWith("/") ? targetUrl : `/${targetUrl}`;
      targetUrl = `${authBaseUrl}${cleanPath}`;
    }
    requestArgs.url = targetUrl;
  }

  const isAuth = targetUrl.includes("5000") || targetUrl.includes("/auth") || targetUrl.includes("/users");

  if (isAuth && typeof window !== "undefined") {
    console.group(`%c🌐 [FRONTEND API CALL] ${method} ${targetUrl}`, "color: #3b82f6; font-weight: bold;");
    if (requestArgs?.body) {
      const masked = { ...requestArgs.body };
      if (masked.password) masked.password = "******";
      console.log("Request Payload:", masked);
    }
  }

  const result = await rawBaseQuery(requestArgs, api, extraOptions);

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
  tagTypes: ["Products", "Product", "Categories", "Category", "Users", "User", "Auth", "Locations"],
  endpoints: (builder) => ({
    // ==========================================
    // 1-8. PRODUCTS ENDPOINTSl
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
      invalidatesTags: [{ type: "Products", id: "LIST" }],
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
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
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
    // 9-15. USERS ENDPOINTS
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
        url: `${authBaseUrl}/auth/register`,
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    registerUser: builder.mutation({
      query: (userData) => ({
        url: `${authBaseUrl}/auth/register`,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
      async onQueryStarted(userData, { queryFulfilled }) {
        console.group("[productApi] registerUser API Call");
        console.log("Submitting User Data:", { ...userData, password: "***" });
        try {
          const { data } = await queryFulfilled;
          console.log("Registration API Response (Success 201):", data);
        } catch (error) {
          console.error("Registration API Response (Error):", error);
        }
        console.groupEnd();
      },
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
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    checkUserAvailability: builder.mutation({
      query: (body) => ({
        url: `${authBaseUrl}/auth/check-email`,
        method: "POST",
        body,
      }),
      async onQueryStarted(body, { queryFulfilled }) {
        console.group(`%c🌐 [FRONTEND] checkUserAvailability: "${body?.email}"`, "color: #3b82f6; font-weight: bold;");
        console.log("Endpoint:", `${authBaseUrl}/auth/check-email`);
        try {
          const { data } = await queryFulfilled;
          console.log("%c✅ [FRONTEND] Availability Result:", "color: #22c55e; font-weight: bold;", data);
        } catch (error) {
          console.warn("%c❌ [FRONTEND] Availability Error:", "color: #ef4444; font-weight: bold;", error);
        }
        console.groupEnd();
      },
    }),

    // ==========================================
    // 16-18. AUTH ENDPOINTS
    // ==========================================
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: `${authBaseUrl}/auth/login`,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(credentials, { queryFulfilled }) {
        console.group("[productApi] 🚀 loginUser API Call (MongoDB Backend)");
        console.log("Submitting Credentials:", { email: credentials.email, password: "***" });
        try {
          const { data } = await queryFulfilled;
          console.log("[productApi] ✅ Login Success Response:", data);
        } catch (error) {
          console.error("[productApi] ❌ Login Error Response:", error);
        }
        console.groupEnd();
      },
    }),

    getUserProfile: builder.query({
      query: () => `${authBaseUrl}/auth/profile`,
      providesTags: ["Auth"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("[productApi] 👤 getUserProfile API Call");
        try {
          const { data } = await queryFulfilled;
          console.log("[productApi] ✅ Profile Data Received:", data);
        } catch (error) {
          console.warn("[productApi] ⚠️ Profile Fetch Error:", error);
        }
        console.groupEnd();
      },
    }),

    refreshToken: builder.mutation({
      query: (body) => ({
        url: `${authBaseUrl}/auth/refresh-token`,
        method: "POST",
        body,
      }),
    }),

    // ==========================================
    // 19-25. CATEGORIES ENDPOINTS
    // ==========================================
    getCategories: builder.query({
      query: () => "/categories",
      transformResponse: (response) => sanitizeCategories(response),
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
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
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
      ],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
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
    // 26-27. FILE UPLOAD & LOCATIONS ENDPOINTS
    // ==========================================
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
  // Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useRegisterUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCheckUserAvailabilityMutation,
  // Auth
  useLoginUserMutation,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useRefreshTokenMutation,
  // Categories
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryBySlugQuery,
  useGetCategoryProductsQuery,
  // Files & Locations
  useUploadFileMutation,
  useGetFileQuery,
  useGetLocationsQuery,
} = productApi;
