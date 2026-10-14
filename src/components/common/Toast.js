"use client";

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectToasts, removeToast } from "@/redux/slices/uiSlice";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch();

  return (
    <div className="toast-container" aria-live="assertive">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id]);

  const icons = {
    success: <CheckCircle2 style={{ width: "1.25rem", height: "1.25rem", color: "#10b981", flexShrink: 0 }} />,
    error: <AlertCircle style={{ width: "1.25rem", height: "1.25rem", color: "#f43f5e", flexShrink: 0 }} />,
    info: <Info style={{ width: "1.25rem", height: "1.25rem", color: "#6366f1", flexShrink: 0 }} />,
  };

  return (
    <div className="toast-item">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {icons[toast.type] || icons.success}
        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}>{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          padding: "0.25rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X style={{ width: "1rem", height: "1rem" }} />
      </button>
    </div>
  );
}
