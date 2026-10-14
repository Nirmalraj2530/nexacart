"use client";

import { useState, useEffect } from "react";

/**
 * Custom Hook to persist state in localStorage with SSR safety.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (err) {
        console.error(`Error writing key "${key}" to localStorage:`, err);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
