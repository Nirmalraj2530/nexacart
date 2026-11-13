"use client";

import { useEffect, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store";
import { hydrateCart, selectCartItems, setCartItems } from "./slices/cartSlice";
import { hydrateAuth } from "./slices/authSlice";
import { hydrateWishlist, selectWishlistItems, setWishlistItems } from "./slices/wishlistSlice";
import { hydrateOrders } from "./slices/orderSlice";
import {
  useLazyGetServerCartQuery,
  useSyncServerCartMutation,
  useLazyGetServerWishlistQuery,
  useAddServerWishlistItemMutation,
  useRemoveServerWishlistItemMutation,
} from "./services/productApi";

function StoreHydrator({ children }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const cartItems = useSelector(selectCartItems);
  const wishlistItems = useSelector(selectWishlistItems);

  const [fetchServerCart] = useLazyGetServerCartQuery();
  const [syncServerCart] = useSyncServerCartMutation();
  const [fetchServerWishlist] = useLazyGetServerWishlistQuery();
  const [addServerWishlistItem] = useAddServerWishlistItemMutation();
  const [removeServerWishlistItem] = useRemoveServerWishlistItemMutation();

  const syncedTokenRef = useRef(null);
  const prevWishlistIdsRef = useRef([]);
  const isSyncReadyRef = useRef(false);

  useEffect(() => {
    dispatch(hydrateAuth());
    dispatch(hydrateCart());
    dispatch(hydrateWishlist());
    dispatch(hydrateOrders());
  }, [dispatch]);

  const hasLiveJwt = Boolean(isAuthenticated && token && !token.startsWith("demo_jwt_token_"));

  // Pull / merge server cart & wishlist on real login session
  useEffect(() => {
    if (!hasLiveJwt) {
      syncedTokenRef.current = null;
      isSyncReadyRef.current = false;
      return;
    }

    if (syncedTokenRef.current === token) return;
    syncedTokenRef.current = token;
    isSyncReadyRef.current = false;

    const runInitialCloudSync = async () => {
      try {
        const cartRes = await fetchServerCart().unwrap();
        const serverCart = Array.isArray(cartRes?.items) ? cartRes.items : [];
        if (cartItems.length === 0 && serverCart.length > 0) {
          dispatch(setCartItems(serverCart));
        } else if (cartItems.length > 0 && serverCart.length === 0) {
          await syncServerCart(cartItems).catch(() => {});
        }
      } catch {}

      try {
        const wishRes = await fetchServerWishlist().unwrap();
        const serverWish = Array.isArray(wishRes?.items) ? wishRes.items : [];
        if (wishlistItems.length === 0 && serverWish.length > 0) {
          dispatch(setWishlistItems(serverWish));
          prevWishlistIdsRef.current = serverWish.map((i) => String(i.id || i.productId));
        } else {
          prevWishlistIdsRef.current = wishlistItems.map((i) => String(i.id || i.productId));
        }
      } catch {}

      isSyncReadyRef.current = true;
    };

    runInitialCloudSync();
  }, [hasLiveJwt, token, dispatch, fetchServerCart, syncServerCart, fetchServerWishlist, cartItems, wishlistItems]);

  // Debounced cart sync to MongoDB while authenticated
  useEffect(() => {
    if (!hasLiveJwt || !isSyncReadyRef.current) return;
    const timer = setTimeout(() => {
      syncServerCart(cartItems).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [cartItems, hasLiveJwt, syncServerCart]);

  // Diff wishlist additions/removals to MongoDB while authenticated
  useEffect(() => {
    if (!hasLiveJwt || !isSyncReadyRef.current) return;

    const currentIds = wishlistItems.map((i) => String(i.id || i.productId));
    const prevIds = prevWishlistIdsRef.current;

    const added = wishlistItems.filter((i) => !prevIds.includes(String(i.id || i.productId)));
    const removedIds = prevIds.filter((id) => !currentIds.includes(id));

    added.forEach((item) => addServerWishlistItem(item).catch(() => {}));
    removedIds.forEach((id) => removeServerWishlistItem(id).catch(() => {}));

    prevWishlistIdsRef.current = currentIds;
  }, [wishlistItems, hasLiveJwt, addServerWishlistItem, removeServerWishlistItem]);

  return children;
}

export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <StoreHydrator>{children}</StoreHydrator>
    </Provider>
  );
}
