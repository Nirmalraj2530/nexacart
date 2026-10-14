import { createSlice } from "@reduxjs/toolkit";

const COMPARISON_KEY = "nexacart_comparison_v1";
const MAX_COMPARISON_ITEMS = 4;

const getInitialComparison = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(COMPARISON_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveComparison = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMPARISON_KEY, JSON.stringify(items));
  } catch {}
};

const initialState = {
  items: [],
  isHydrated: false,
};

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    hydrateComparison: (state) => {
      state.items = getInitialComparison();
      state.isHydrated = true;
    },
    addToComparison: (state, action) => {
      const product = action.payload;
      if (!product || !product.id) return;

      const exists = state.items.some((item) => String(item.id) === String(product.id));
      if (!exists) {
        if (state.items.length >= MAX_COMPARISON_ITEMS) {
          // Replace the oldest item if max limit reached
          state.items.shift();
        }
        state.items.push({
          id: product.id,
          title: product.title,
          price: Number(product.price) || 0,
          description: product.description || "No description provided.",
          image: product.images?.[0] || product.image || null,
          categoryName: product.category?.name || "General",
          category: product.category,
        });
        saveComparison(state.items);
      }
    },
    removeFromComparison: (state, action) => {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
      saveComparison(state.items);
    },
    clearComparison: (state) => {
      state.items = [];
      saveComparison([]);
    },
  },
});

export const {
  hydrateComparison,
  addToComparison,
  removeFromComparison,
  clearComparison,
} = comparisonSlice.actions;

export const selectComparisonItems = (state) => state.comparison.items;
export const selectComparisonCount = (state) => state.comparison.items.length;
export const selectIsInComparison = (productId) => (state) =>
  state.comparison.items.some((item) => String(item.id) === String(productId));

export default comparisonSlice.reducer;

