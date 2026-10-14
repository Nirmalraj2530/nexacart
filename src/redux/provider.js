"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store";
import { hydrateCart } from "./slices/cartSlice";
import { hydrateAuth } from "./slices/authSlice";
import { hydrateWishlist } from "./slices/wishlistSlice";
import { hydrateOrders } from "./slices/orderSlice";

function StoreHydrator({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateCart());
    dispatch(hydrateWishlist());
    dispatch(hydrateOrders());
  }, [dispatch]);

  return children;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <StoreHydrator>{children}</StoreHydrator>
    </Provider>
  );
}
