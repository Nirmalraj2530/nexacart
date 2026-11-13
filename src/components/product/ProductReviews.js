"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, ThumbsUp, CheckCircle2, ChevronDown, ChevronUp, MessageSquarePlus } from "lucide-react";
import { getDemoReviews, getRatingSummary } from "@/data/mockReviews";
import {
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useToggleReviewHelpfulMutation,
} from "@/redux/services/productApi";
import { useAuth } from "@/hooks/useAuth";
import { addToast } from "@/redux/slices/uiSlice";
import { Button } from "@/components/common/Button";

function StarRow({ rating }) {
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

function ReviewCard({ review, onHelpful }) {
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
        <button
          type="button"
          onClick={() => onHelpful?.(review)}
          style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.25rem 0.625rem", cursor: "pointer" }}
        >
          <ThumbsUp style={{ width: "0.75rem", height: "0.75rem" }} /> {review.helpful || 0}
        </button>
      </div>
    </div>
  );
}

/**
 * Product Reviews section — backed by live MongoDB /api/products/:id/reviews
 * with seamless fallback sample reviews when a product has no submitted reviews yet.
 */
export function ProductReviews({ productId }) {
  const dispatch = useDispatch();
  const { isAuthenticated, openLogin } = useAuth();
  const token = useSelector((state) => state.auth.token);
  const hasLiveJwt = Boolean(isAuthenticated && token && !token.startsWith("demo_jwt_token_"));

  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data: apiData } = useGetProductReviewsQuery(productId, { skip: !productId });
  const [createReview, { isLoading: isSubmitting }] = useCreateProductReviewMutation();
  const [toggleHelpful] = useToggleReviewHelpfulMutation();

  const liveReviews = apiData?.reviews || [];
  const hasLiveReviews = liveReviews.length > 0;

  const demoReviews = getDemoReviews(productId, 5);
  const demoSummary = getRatingSummary(productId);

  const reviews = hasLiveReviews ? liveReviews : demoReviews;
  const summary = hasLiveReviews
    ? {
        average: apiData?.summary?.average || 5,
        total: apiData?.summary?.total || liveReviews.length,
        distribution: apiData?.summary?.breakdown || { 5: liveReviews.length, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    : demoSummary;

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);
  const pct = (count) => (summary.total ? Math.round((count / summary.total) * 100) : 0);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!hasLiveJwt) {
      openLogin();
      return;
    }

    if (!title.trim() || !body.trim()) {
      dispatch(addToast({ message: "Please enter a review headline and details.", type: "error" }));
      return;
    }

    try {
      await createReview({ productId, rating, title: title.trim(), body: body.trim() }).unwrap();
      setTitle("");
      setBody("");
      setRating(5);
      setShowForm(false);
      dispatch(addToast({ message: "Thank you! Your review has been published.", type: "success" }));
    } catch (err) {
      dispatch(
        addToast({
          message: err?.friendlyMessage || err?.data?.message || "Could not submit review.",
          type: "error",
        })
      );
    }
  };

  const handleHelpful = async (review) => {
    if (!hasLiveReviews || !review?.id) return;
    try {
      await toggleHelpful({ reviewId: review.id, productId }).unwrap();
    } catch {}
  };

  return (
    <section style={{ paddingTop: "2rem" }}>
      {/* Section Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem" }}>
            Customer Reviews
          </h2>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
            {hasLiveReviews
              ? `Based on ${summary.total} customer review${summary.total === 1 ? "" : "s"}`
              : `Showing ${summary.total} sample reviews — be the first to write a live review!`}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={MessageSquarePlus}
          onClick={() => (hasLiveJwt ? setShowForm((v) => !v) : openLogin())}
        >
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleReviewSubmit}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: "1rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    fill: star <= rating ? "#fbbf24" : "#e2e8f0",
                    color: star <= rating ? "#fbbf24" : "#e2e8f0",
                  }}
                />
              </button>
            ))}
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review headline (e.g., Great build quality!)"
            maxLength={120}
            required
            style={{
              padding: "0.625rem 0.875rem",
              borderRadius: "0.75rem",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
            }}
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share what you liked or didn't like about this product..."
            rows={3}
            maxLength={1000}
            required
            style={{
              padding: "0.625rem 0.875rem",
              borderRadius: "0.75rem",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Publish Review
            </Button>
          </div>
        </form>
      )}

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
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
            {Number(summary.average || 0).toFixed(1)}
          </div>
          <StarRow rating={Math.round(summary.average || 0)} />
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
            {summary.total} reviews
          </div>
        </div>

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
          <ReviewCard key={review.id} review={review} onHelpful={handleHelpful} />
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
