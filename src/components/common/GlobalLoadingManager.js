"use client";

import React from "react";
import { useSelector } from "react-redux";
import { selectIsGlobalLoading, selectGlobalLoadingMessage } from "@/redux/slices/uiSlice";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

export function GlobalLoadingManager() {
  const isLoading = useSelector(selectIsGlobalLoading);
  const message = useSelector(selectGlobalLoadingMessage);

  if (!isLoading) return null;

  return <LoadingOverlay message={message} />;
}
