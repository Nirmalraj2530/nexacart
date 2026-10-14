"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * useMounted Hook
 * React 19 / Next.js 16 SSR-safe client mount detection.
 * Returns false on the server and during initial hydration, and true once mounted in the browser.
 * Uses useSyncExternalStore to eliminate cascading renders and hydration mismatches.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

