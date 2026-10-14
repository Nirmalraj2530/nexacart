import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "./services/productApi";
import cartReducer from "./slices/cartSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import wishlistReducer from "./slices/wishlistSlice";
import orderReducer from "./slices/orderSlice";
import comparisonReducer from "./slices/comparisonSlice";

export const store = configureStore({
  reducer: {
    [productApi.reducerPath]: productApi.reducer,
    cart: cartReducer,
    ui: uiReducer,
    auth: authReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
    comparison: comparisonReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productApi.middleware),
});
