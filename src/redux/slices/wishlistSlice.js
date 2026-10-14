import { createSlice } from "@reduxjs/toolkit";

const WISHLIST_KEY = "nexacart_wishlist_v1";

const getInitialWishlist = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch {}
};

const initialState = {
  items: [],
  isHydrated: false,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    hydrateWishlist: (state) => {
      state.items = getInitialWishlist();
      state.isHydrated = true;
    },
    addToWishlist: (state, action) => {
      const product = action.payload;
      if (!product || !product.id) return;
      const exists = state.items.some((item) => item.id === product.id);
      if (!exists) {
        state.items.push({
          id: product.id,
          title: product.title,
          price: Number(product.price) || 0,
          image: product.images?.[0] || product.image || null,
          categoryName: product.category?.name || "General",
          addedAt: new Date().toISOString(),
        });
        saveWishlist(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveWishlist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveWishlist([]);
    },
  },
});

export const { hydrateWishlist, addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some((item) => item.id === productId);

export default wishlistSlice.reducer;
