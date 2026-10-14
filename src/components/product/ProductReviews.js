"use client";

import React, { useState } from "react";
import { Star, ThumbsUp, CheckCircle2, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";
import { getDemoReviews, getRatingSummary } from "@/data/mockReviews";
import { formatCurrency } from "@/utils/formatters";

function StarRow({ rating, filled = true }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{
            width: "0.875rem",
            height: "0.875rem",
            fill: s <= rating ? "#fbbf24" : "#e2e8f0",
            color: s <= rating ? "#fbbf24" : "#e2e8f0",
          }}
        />
      ))}
    </div>
  );
}

function formatReviewDate(isoString) {
  if (!isoString) return "Recently";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Recently";
  }
}

function ReviewCard({ review }) {
  const dateLabel = formatReviewDate(review.createdAt);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <img
            src={review.avatar}
            alt={review.reviewer}
            style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>{review.reviewer}</span>
              {review.verified && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.625rem", fontWeight: 700, color: "#059669", backgroundColor: "#d1fae5", padding: "0.125rem 0.375rem", borderRadius: "9999px" }}>
                  <CheckCircle2 style={{ width: "0.6rem", height: "0.6rem" }} /> Verified
                </span>
              )}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{dateLabel}</span>
          </div>
        </div>
        <StarRow rating={review.rating} />
      </div>

      <div>
        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.375rem" }}>{review.title}</p>
        <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>{review.body}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f8fafc" }}>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Helpful?</span>
        <button style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.25rem 0.625rem", cursor: "pointer" }}>
          <ThumbsUp style={{ width: "0.75rem", height: "0.75rem" }} /> {review.helpful}
        </button>
      </div>
    </div>
  );
}

/**
 * Product Reviews section — displays demo reviews with rating summary.
 * Clearly labelled as sample/demo data since no review API exists.
 */
export function ProductReviews({ productId }) {
  const [showAll, setShowAll] = useState(false);
  const reviews = getDemoReviews(productId, 8);
  const summary = getRatingSummary(productId);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const pct = (count) => Math.round((count / summary.total) * 100);

  return (
    <section style={{ paddingTop: "2rem" }}>
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem" }}>
            Customer Reviews
          </h2>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
            Based on {summary.total} verified purchases
          </p>
        </div>
        {/* Demo data badge */}
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.6875rem", fontWeight: 700, color: "#92400e", backgroundColor: "#fef3c7", border: "1px solid #fde68a", padding: "0.25rem 0.625rem", borderRadius: "9999px" }}>
          <FlaskConical style={{ width: "0.75rem", height: "0.75rem" }} /> Sample Reviews
        </span>
      </div>

      {/* Rating Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "2rem",
          backgroundColor: "#f8fafc",
          borderRadius: "1.25rem",
          border: "1px solid #e2e8f0",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          alignItems: "center",
        }}
      >
        {/* Big Average */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
            {summary.average.toFixed(1)}
          </div>
          <StarRow rating={Math.round(summary.average)} />
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
            {summary.total} reviews
          </div>
        </div>

        {/* Distribution bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", minWidth: "0.75rem" }}>{star}</span>
              <Star style={{ width: "0.75rem", height: "0.75rem", fill: "#fbbf24", color: "#fbbf24", flexShrink: 0 }} />
              <div style={{ flex: 1, height: "0.5rem", backgroundColor: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct(summary.distribution[star] || 0)}%`,
                    backgroundColor: star >= 4 ? "#10b981" : star === 3 ? "#f59e0b" : "#e11d48",
                    borderRadius: "9999px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", minWidth: "1.5rem" }}>
                {summary.distribution[star] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            marginTop: "1rem",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.375rem",
            padding: "0.75rem",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#4f46e5",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {showAll ? (
            <><ChevronUp style={{ width: "1rem", height: "1rem" }} /> Show Less</>
          ) : (
            <><ChevronDown style={{ width: "1rem", height: "1rem" }} /> Show All {reviews.length} Reviews</>
          )}
        </button>
      )}
    </section>
  );
}
