"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({
  title = "Something went wrong",
  message = "Failed to load data from the server. Please try again.",
  onRetry,
}) {
  return (
    <div className="error-state">
      <div className="empty-icon-wrap" style={{ backgroundColor: "#ffe4e6", color: "#e11d48" }}>
        <AlertTriangle style={{ width: "2rem", height: "2rem" }} />
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-desc">{message}</p>
      {onRetry && (
        <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
