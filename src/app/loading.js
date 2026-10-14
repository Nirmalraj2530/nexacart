import React from "react";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

export default function Loading() {
  return <LoadingOverlay message="Loading Nexacart..." submessage="Fetching real-time catalog & offers..." />;
}
