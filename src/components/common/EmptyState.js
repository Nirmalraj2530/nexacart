"use client";

import React from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  title = "No products found",
  description = "We couldn't find anything matching your criteria. Try resetting filters or searching for something else.",
  actionText,
  actionHref,
  onAction,
  icon: Icon = PackageSearch,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <Icon style={{ width: "2rem", height: "2rem" }} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionHref && actionText ? (
        <Link href={actionHref}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      ) : onAction && actionText ? (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
}
