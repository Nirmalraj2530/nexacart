"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { addToast } from "@/redux/slices/uiSlice";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

import { useMounted } from "@/hooks/useMounted";

/**
 * AuthGuard — Role-Based Access Control for admin routes.
 */
export function AuthGuard({ children, requiredRole = "Manager" }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const mounted = useMounted();
  const hasRedirectedRef = useRef(false);
  const { isAuthenticated, isAdmin, isManager, isHydrated, openLogin } = useAuth();

  const hasPermission =
    requiredRole === "Admin"
      ? isAdmin
      : requiredRole === "Manager"
      ? isManager
      : isAuthenticated;

  // Step 2: Once mounted AND auth hydrated, evaluate permissions exactly once
  useEffect(() => {
    if (!mounted || !isHydrated) return;

    if (!hasPermission && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      if (!isAuthenticated) {
        // Not logged in → open login modal and go home
        openLogin();
        router.replace("/");
      } else {
        // Logged in but wrong role (e.g. Customer on /admin)
        dispatch(
          addToast({
            message: `Access denied. ${requiredRole} permissions required.`,
            type: "error",
          })
        );
        router.replace("/");
      }
    }
  }, [mounted, isHydrated, hasPermission, isAuthenticated, requiredRole, router, openLogin, dispatch]);

  // ── Phase 1: Not yet mounted ─────────────────────────────────────────────
  // Return null. Server renders null, client first render also returns null.
  // They ALWAYS match → zero hydration mismatch.
  if (!mounted) return null;

  // ── Phase 2: Mounted, waiting for localStorage data to load into Redux ───
  if (!isHydrated) {
    return (
      <LoadingOverlay
        message="Verifying Authorization..."
        submessage="Loading your admin session..."
      />
    );
  }

  // ── Phase 3: Hydrated but no permission ─────────────────────────────────
  // Show restricted screen while redirect is in-flight
  if (!hasPermission) {
    return (
      <LoadingOverlay
        message="Access Restricted"
        submessage="Redirecting to sign in..."
      />
    );
  }

  // ── Phase 4: Authorized → render protected admin content ────────────────
  return children;
}
