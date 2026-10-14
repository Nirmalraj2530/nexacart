import { createSlice } from "@reduxjs/toolkit";

// NOTE: initialState must be identical on server and client.
// All localStorage access is intentionally deferred to the hydrateAuth action
// which only runs client-side inside a useEffect. This prevents SSR hydration
// mismatch which causes Next.js to trigger a full page reload loop.
const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoginModalOpen: false,
  authModalTab: "login", // "login" | "register"
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth: (state) => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("nexacart_access_token") || null;
      let user = null;
      try {
        const raw = localStorage.getItem("nexacart_user");
        user = raw ? JSON.parse(raw) : null;
      } catch {
        user = null;
      }
      state.token = token;
      state.user = user;
      state.isAuthenticated = !!token;
      state.isHydrated = true;
    },
    setCredentials: (state, action) => {
      const { access_token, user } = action.payload;
      if (access_token) {
        state.token = access_token;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("nexacart_access_token", access_token);
        }
      }
      if (user) {
        state.user = user;
        if (typeof window !== "undefined") {
          localStorage.setItem("nexacart_user", JSON.stringify(user));
        }
      }
    },
    setUserProfile: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("nexacart_user", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("nexacart_access_token");
        localStorage.removeItem("nexacart_refresh_token");
        localStorage.removeItem("nexacart_user");
      }
    },
    openLoginModal: (state, action) => {
      state.isLoginModalOpen = true;
      state.authModalTab = action?.payload === "register" ? "register" : "login";
    },
    openRegisterModal: (state) => {
      state.isLoginModalOpen = true;
      state.authModalTab = "register";
    },
    setAuthModalTab: (state, action) => {
      state.authModalTab = action.payload === "register" ? "register" : "login";
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
  },
});

export const {
  hydrateAuth,
  setCredentials,
  setUserProfile,
  logout,
  openLoginModal,
  openRegisterModal,
  setAuthModalTab,
  closeLoginModal,
} = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoginModalOpen = (state) => state.auth.isLoginModalOpen;
export const selectAuthModalTab = (state) => state.auth.authModalTab || "login";
export const selectIsHydrated = (state) => state.auth.isHydrated;

export default authSlice.reducer;
