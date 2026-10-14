"use client";

import React from "react";
import { useGetLocationsQuery } from "@/redux/services/productApi";
import { TableSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { MapPin, Navigation, Phone, Clock } from "lucide-react";

export default function LocationsPage() {
  const { data: locations = [], isLoading, isError, error, refetch } = useGetLocationsQuery();

  return (
    <div className="header-container" style={{ paddingTop: "3rem", paddingBottom: "4rem" }}>
      <div style={{ textAlign: "center", maxWidth: "36rem", margin: "0 auto 3rem" }}>
        <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)" }}>
          Store Finder (GET /locations)
        </span>
        <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)", fontWeight: 900, color: "var(--color-text-main)", margin: "0.5rem 0 0.75rem", letterSpacing: "-0.025em" }}>
          Our Physical Locations & Pickup Hubs
        </h1>
        <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.6 }}>
          Find official Nexacart store branches, pickup stations, and fulfillment locations near you.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <ErrorState title="Failed to load store locations" message={error?.data?.message} onRetry={refetch} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1.5rem" }}>
          {locations.map((loc, idx) => (
            <div
              key={loc.id || idx}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-2xl)",
                border: "1px solid var(--color-border)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                boxShadow: "var(--shadow-xs)",
                transition: "all var(--transition-normal)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="brand-icon-box" style={{ width: "2.5rem", height: "2.5rem" }}>
                  <MapPin style={{ width: "1.25rem", height: "1.25rem" }} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.625rem", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                  {loc.city || "Pickup Hub"}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-main)", margin: "0 0 0.25rem" }}>
                  {loc.name || loc.city || `Branch #${idx + 1}`}
                </h3>
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: 0 }}>
                  {loc.address || loc.location || "100 Retail Plaza Way, Suite 400"}
                </p>
              </div>

              <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--color-surface-hover)", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock style={{ width: "1rem", height: "1rem", color: "var(--color-primary)" }} />
                  <span>Mon - Sat: 9:00 AM - 9:00 PM</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Phone style={{ width: "1rem", height: "1rem", color: "var(--color-primary)" }} />
                  <span>+1 (800) 555-NEXA</span>
                </div>
              </div>

              <button className="btn btn-outline btn-full btn-sm" style={{ marginTop: "0.5rem" }}>
                <Navigation style={{ width: "0.875rem", height: "0.875rem" }} /> Get Directions
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
