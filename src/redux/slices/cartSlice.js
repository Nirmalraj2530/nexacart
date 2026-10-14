import { createSlice } from "@reduxjs/toolkit";
import { cleanImageUrl } from "@/utils/formatters";

const CART_STORAGE_KEY = "nexacart_cart_v1";

const getInitialCartState = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
    return [];
  }
};

const saveCartToStorage = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

const initialState = {
  items: [],
  isHydrated: false,
  pendingCartItem: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state) => {
      state.items = getInitialCartState();
      state.isHydrated = true;
    },
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      if (!product || !product.id) return;

      const existingIndex = state.items.findIndex((item) => item.id === product.id);
      
      // Normalize image URL
      let imageUrl = "";
      if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0];
      } else if (typeof product.images === "string") {
        imageUrl = product.images;
      } else if (product.image) {
        imageUrl = product.image;
      }

      // Clean image URL if it's stringified JSON array
      if (typeof imageUrl === "string" && imageUrl.startsWith('["') && imageUrl.endsWith('"]')) {
        try {
          const parsed = JSON.parse(imageUrl);
          imageUrl = parsed[0] || "";
        } catch {
          // ignore
        }
      }

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          id: product.id,
          title: product.title,
          price: Number(product.price) || 0,
          image: cleanImageUrl(imageUrl, null, product.category?.name || product.title),
          categoryName: product.category?.name || "General",
          quantity: quantity,
        });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          item.quantity = quantity;
        }
      }
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
    setPendingCartItem: (state, action) => {
      state.pendingCartItem = action.payload;
    },
    clearPendingCartItem: (state) => {
      state.pendingCartItem = null;
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setPendingCartItem,
  clearPendingCartItem,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
export const selectPendingCartItem = (state) => state.cart.pendingCartItem;

export default cartSlice.reducer;
