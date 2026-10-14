"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCheckUserAvailabilityMutation,
} from "@/redux/services/productApi";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slices/uiSlice";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Modal } from "@/components/common/Modal";
import { ImageUpload } from "@/components/common/ImageUpload";
import { TableSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { Plus, Edit, Trash2, ArrowLeft, Users, ShieldCheck, Mail } from "lucide-react";

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const { data: users = [], isLoading, isError, error, refetch } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [checkAvailability] = useCheckUserAvailabilityMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    avatar: "https://picsum.photos/800",
  });
  const [availabilityStatus, setAvailabilityStatus] = useState(null);

  const handleOpenCreate = () => {
    setEditUser(null);
    setFormData({
      name: "",
      email: "",
      password: "changeme",
      role: "customer",
      avatar: "https://picsum.photos/800",
    });
    setAvailabilityStatus(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditUser(u);
    setFormData({
      name: u.name || "",
      email: u.email || "",
      password: u.password || "changeme",
      role: u.role || "customer",
      avatar: u.avatar || "https://picsum.photos/800",
    });
    setAvailabilityStatus(null);
    setModalOpen(true);
  };

  const handleCheckEmail = async () => {
    if (!formData.email) return;
    try {
      const res = await checkAvailability({ email: formData.email }).unwrap();
      if (res.isAvailable) {
        setAvailabilityStatus("Email is available!");
      } else {
        setAvailabilityStatus("Email is already taken.");
      }
    } catch {
      setAvailabilityStatus("Failed to check email availability.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      avatar: formData.avatar?.trim() || "https://picsum.photos/800",
    };

    try {
      if (editUser) {
        await updateUser({ id: editUser.id, ...sanitizedData }).unwrap();
        dispatch(addToast({ message: `Updated user "${sanitizedData.name}"`, type: "success" }));
      } else {
        await createUser(sanitizedData).unwrap();
        dispatch(addToast({ message: `Created user "${sanitizedData.name}"`, type: "success" }));
      }
      setModalOpen(false);
    } catch (err) {
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join(", ")
        : err?.data?.message || err?.message || "Operation failed";
      dispatch(addToast({ message: msg, type: "error" }));
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await deleteUser(id).unwrap();
      dispatch(addToast({ message: `Deleted user "${name}"`, type: "info" }));
    } catch (err) {
      dispatch(addToast({ message: err?.data?.message || "Failed to delete user", type: "error" }));
    }
  };

  return (
    <div className="admin-page-container">
      <Link href="/admin" className="btn btn-ghost btn-sm" style={{ marginBottom: "1rem" }}>
        <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back to Dashboard
      </Link>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 1.875rem)", fontWeight: 900, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users style={{ color: "var(--color-primary)" }} /> User Management
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
            Manage store members, user permissions, and customer accounts.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Create User
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <ErrorState title="Failed to load user list" message={error?.data?.message} onRetry={refetch} />
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>User ID</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <img
                      src={u.avatar || "https://picsum.photos/800"}
                      alt=""
                      className="table-img"
                      style={{ borderRadius: "50%" }}
                    />
                  </td>
                  <td>
                    <strong style={{ color: "var(--color-text-main)" }}>{u.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{u.email}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.625rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: u.role === "admin" ? "var(--color-primary-light)" : "var(--color-surface-hover)",
                        color: u.role === "admin" ? "var(--color-primary)" : "var(--color-text-main)",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>#{u.id}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(u)} title="Edit User">
                        <Edit style={{ width: "1rem", height: "1rem" }} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(u.id, u.name)} title="Delete User" style={{ color: "var(--color-danger)" }}>
                        <Trash2 style={{ width: "1rem", height: "1rem" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Create / Edit User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? "Edit User Account" : "Create User Account"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginTop: "0.375rem", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handleCheckEmail}
                style={{ fontSize: "0.75rem", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}
              >
                Verify Email Availability
              </button>
              {availabilityStatus && (
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: availabilityStatus.includes("available") ? "var(--color-success)" : "var(--color-danger)" }}>
                  {availabilityStatus}
                </span>
              )}
            </div>
          </div>

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: "customer", label: "Customer" },
              { value: "admin", label: "Admin" },
            ]}
          />

          <ImageUpload
            label="Avatar Image"
            value={formData.avatar}
            onChange={(url) => setFormData({ ...formData, avatar: url })}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "0.5rem" }}>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating || isUpdating}>
              {editUser ? "Save User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
