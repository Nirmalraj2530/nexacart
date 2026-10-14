import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.escuelajs.co/api/v1";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
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
  }),
  tagTypes: ["Products", "Product", "Categories", "Category", "Users", "User", "Auth", "Locations"],
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
      query: () => "/users",
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Users", id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
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
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    checkUserAvailability: builder.mutation({
      query: (body) => ({
        url: "/users/is-available",
        method: "POST",
        body,
      }),
    }),

    // ==========================================
    // 16-18. AUTH ENDPOINTS
    // ==========================================
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    getUserProfile: builder.query({
      query: () => "/auth/profile",
      providesTags: ["Auth"],
    }),

    refreshToken: builder.mutation({
      query: (body) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body,
      }),
    }),

    // ==========================================
    // 19-25. CATEGORIES ENDPOINTS
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
