"use client";

import React, { useState } from "react";
import { useUploadFileMutation } from "@/redux/services/productApi";
import { Upload, CheckCircle2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

export function ImageUpload({ value, onChange, label = "Product Image" }) {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [mode, setMode] = useState("file"); // 'file' or 'url'
  const [urlInput, setUrlInput] = useState(value || "");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadFile(formData).unwrap();
      const uploadedUrl = res.location || res.filename;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      // Fallback preview locally using FileReader if API file upload endpoint is restricted
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className="form-group space-y-2">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.25rem" }}>
        <label className="form-label" style={{ margin: 0 }}>
          {label}
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`btn btn-sm ${mode === "file" ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
          >
            <Upload style={{ width: "0.875rem", height: "0.875rem" }} /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`btn btn-sm ${mode === "url" ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
          >
            <LinkIcon style={{ width: "0.875rem", height: "0.875rem" }} /> Paste URL
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div
          style={{
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "1.5rem",
            textAlign: "center",
            backgroundColor: "var(--color-bg)",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              width: "100%",
              height: "100%",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div className="empty-icon-wrap" style={{ width: "3rem", height: "3rem", margin: 0 }}>
              <ImageIcon style={{ width: "1.5rem", height: "1.5rem" }} />
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-main)" }}>
              {isUploading ? "Uploading image to API..." : "Click or drag & drop image to upload"}
            </p>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>
              Supports JPG, PNG, WEBP (POST /files/upload)
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button type="button" variant="primary" onClick={handleUrlSubmit}>
            Set
          </Button>
        </div>
      )}

      {value && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem", padding: "0.5rem", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-surface-hover)" }}>
          <img
            src={value}
            alt="Preview"
            style={{ width: "3.5rem", height: "3.5rem", borderRadius: "var(--radius-md)", objectFit: "cover", border: "1px solid var(--color-border)" }}
          />
          <div style={{ overflow: "hidden", flex: 1 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-success)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <CheckCircle2 style={{ width: "0.875rem", height: "0.875rem" }} /> Active Image Selected
            </span>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {value}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
