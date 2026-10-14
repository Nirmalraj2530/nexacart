"use client";

import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import {
  selectAuthUser,
  selectIsAuthenticated,
  selectIsHydrated,
  setCredentials,
  logout as logoutAction,
  openLoginModal,
  openRegisterModal,
  closeLoginModal,
} from "@/redux/slices/authSlice";
import { addToast } from "@/redux/slices/uiSlice";

/**
 * Custom Hook for handling authentication, roles, session status, and demo logins.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isHydrated = useSelector(selectIsHydrated);

  // Normalize role string from backend API or demo user
  const rawRole = (user?.role || "").toLowerCase();
  const role = rawRole === "admin"
    ? "Admin"
    : rawRole === "manager"
    ? "Manager"
    : isAuthenticated
    ? "Customer"
    : "Guest";

  const isAdmin = role === "Admin";
  const isManager = role === "Manager" || role === "Admin";
  const isCustomer = role === "Customer";

  const loginAsRole = useCallback(
    (roleType = "Admin") => {
      let mockUser = {
        id: 1,
        name: "Alex Vance (Admin)",
        email: "admin@nexacart.com",
        role: "Admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      };

      if (roleType === "Manager") {
        mockUser = {
          id: 2,
          name: "Sarah Connor (Manager)",
          email: "manager@nexacart.com",
          role: "Manager",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        };
      } else if (roleType === "Customer") {
        mockUser = {
          id: 3,
          name: "John Doe (Customer)",
          email: "customer@nexacart.com",
          role: "Customer",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        };
      }

      const mockToken = `demo_jwt_token_${roleType.toLowerCase()}_${Date.now()}`;
      dispatch(setCredentials({ access_token: mockToken, user: mockUser }));
      dispatch(
        addToast({
          message: `Switched session to ${roleType} role (${mockUser.name})`,
          type: "success",
        })
      );
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    dispatch(
      addToast({
        message: "You have been logged out successfully.",
        type: "info",
      })
    );
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
      router.replace("/");
    }
    dispatch(openLoginModal());
  }, [dispatch, pathname, router]);

  const simulateSessionExpired = useCallback(() => {
    dispatch(logoutAction());
    dispatch(
      addToast({
        message: "Session expired! Please sign in again.",
        type: "warning",
      })
    );
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
      router.replace("/");
    }
    dispatch(openLoginModal());
  }, [dispatch, pathname, router]);

  const openLogin = useCallback(() => {
    dispatch(openLoginModal());
  }, [dispatch]);

  const openRegister = useCallback(() => {
    dispatch(openRegisterModal());
  }, [dispatch]);

  const closeLogin = useCallback(() => {
    dispatch(closeLoginModal());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isHydrated,
    role,
    isAdmin,
    isManager,
    isCustomer,
    loginAsRole,
    logout,
    simulateSessionExpired,
    openLogin,
    openRegister,
    closeLogin,
  };
}
