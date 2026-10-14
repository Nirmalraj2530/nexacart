"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminUsersLayout({ children }) {
  return <AuthGuard requiredRole="Admin">{children}</AuthGuard>;
}
