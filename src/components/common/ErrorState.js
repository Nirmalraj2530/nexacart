"use client";

import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Lock,
  ShieldAlert,
  SearchX,
  ServerCrash,
} from "lucide-react";
import { Button } from "./Button";
import { getHttpStatusDetails } from "@/utils/httpErrors";

/**
 * Universal Error State Component with HTTP Status Code Specialization
 * Handles 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden),
 * 404 (Not Found), 500 (Internal Server Error), and custom error messages.
 */
export function ErrorState({
  title,
  message,
  statusCode,
  error,
  onRetry,
}) {
  const code = statusCode || error?.status || (typeof error === "number" ? error : null);
  const statusDetails = code ? getHttpStatusDetails(code, message || error?.data?.message) : null;

  const displayTitle = title || statusDetails?.title || "Something went wrong";
  const displayMessage =
    message ||
    error?.data?.message ||
    statusDetails?.message ||
    "Failed to load data from the server. Please try again.";

  // Choose appropriate icon and colors based on HTTP status code
  let IconComponent = AlertTriangle;
  let iconBg = "#ffe4e6";
  let iconColor = "#e11d48";

  if (code === 404) {
    IconComponent = SearchX;
    iconBg = "#f1f5f9";
    iconColor = "#64748b";
  } else if (code === 401) {
    IconComponent = Lock;
    iconBg = "#fef3c7";
    iconColor = "#d97706";
  } else if (code === 403) {
    IconComponent = ShieldAlert;
    iconBg = "#fee2e2";
    iconColor = "#dc2626";
  } else if (code === 400) {
    IconComponent = AlertCircle;
    iconBg = "#ffedd5";
    iconColor = "#ea580c";
  } else if (code === 500) {
    IconComponent = ServerCrash;
    iconBg = "#fee2e2";
    iconColor = "#e11d48";
  }

  return (
    <div className="error-state">
      <div className="empty-icon-wrap" style={{ backgroundColor: iconBg, color: iconColor }}>
        <IconComponent style={{ width: "2rem", height: "2rem" }} />
      </div>
      <h3 className="error-state-title">{displayTitle}</h3>
      <p className="error-state-desc">{displayMessage}</p>
      {onRetry && (
        <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
