import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toasts: [],
  searchQuery: "",
  mobileMenuOpen: false,
  isGlobalLoading: false,
  globalLoadingMessage: "Loading Nexacart...",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addToast: (state, action) => {
      // payload: { id?, message, type: 'success' | 'error' | 'info' }
      const id = action.payload.id || Date.now() + Math.random().toString();
      state.toasts.push({
        id,
        message: action.payload.message,
        type: action.payload.type || "success",
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setGlobalLoading: (state, action) => {
      if (typeof action.payload === "boolean") {
        state.isGlobalLoading = action.payload;
      } else if (action.payload) {
        state.isGlobalLoading = !!action.payload.loading;
        if (action.payload.message) {
          state.globalLoadingMessage = action.payload.message;
        }
      }
    },
  },
});

export const {
  addToast,
  removeToast,
  setSearchQuery,
  setMobileMenuOpen,
  toggleMobileMenu,
  setGlobalLoading,
} = uiSlice.actions;

export const selectToasts = (state) => state.ui.toasts;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectIsGlobalLoading = (state) => state.ui.isGlobalLoading;
export const selectGlobalLoadingMessage = (state) => state.ui.globalLoadingMessage;

export default uiSlice.reducer;
