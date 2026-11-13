"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { setUserProfile, setCredentials } from "@/redux/slices/authSlice";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/redux/services/productApi";
import { addToast } from "@/redux/slices/uiSlice";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { User, Bell, Save, Lock, Eye, EyeOff, KeyRound } from "lucide-react";

export default function AccountProfilePage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          Profile Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal information, contact email, password, and notification preferences
        </p>
      </div>

      <ProfileForm key={user?.id || user?.email || "anonymous"} user={user} role={role} />
      <ChangePasswordForm />
    </div>
  );
}

function ProfileForm({ user, role }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    currency: user?.preferences?.currency || "USD",
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasLiveJwt = Boolean(token && !token.startsWith("demo_jwt_token_"));
    if (hasLiveJwt) {
      try {
        const res = await updateProfile(formData).unwrap();
        const updatedUser = res.user || {
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
        };
        dispatch(setUserProfile(updatedUser));
        dispatch(addToast({ message: "Profile saved to your account!", type: "success" }));
        return;
      } catch (err) {
        dispatch(
          addToast({
            message: err?.friendlyMessage || err?.data?.message || "Failed to update profile.",
            type: "error",
          })
        );
        return;
      }
    }

    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
    };
    dispatch(setUserProfile(updatedUser));
    dispatch(addToast({ message: "Profile preferences saved locally!", type: "success" }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Role & Avatar Banner */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-white shadow-xs shrink-0">
          {formData.avatar ? (
            <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
          ) : (
            (formData.name?.[0] || "U").toUpperCase()
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{formData.name || "Customer"}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{formData.email}</p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email Address *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 019-2834"
        />

        <Input
          label="Avatar Image URL"
          value={formData.avatar}
          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          placeholder="https://images.unsplash.com/..."
        />
      </div>

      {/* Notification Preferences */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-indigo-600" /> Notifications & Communications
        </h3>

        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Email Order Notifications</span>
              <span className="text-slate-500">Receive tracking updates and delivery alerts via email</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.smsNotifications}
              onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Promotional Alerts</span>
              <span className="text-slate-500">Get notified when seasonal sales, coupons, and flash deals launch</span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button type="submit" variant="primary" isLoading={isSaving} icon={Save}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordForm() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const hasLiveJwt = Boolean(token && !token.startsWith("demo_jwt_token_"));
  if (!hasLiveJwt) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      dispatch(addToast({ message: "New password must be at least 6 characters.", type: "error" }));
      return;
    }
    if (newPassword !== confirmPassword) {
      dispatch(addToast({ message: "New passwords do not match.", type: "error" }));
      return;
    }

    try {
      const res = await changePassword({ currentPassword, newPassword }).unwrap();
      if (res?.access_token) {
        dispatch(setCredentials({ access_token: res.access_token }));
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      dispatch(addToast({ message: "Password updated successfully!", type: "success" }));
    } catch (err) {
      dispatch(
        addToast({
          message: err?.friendlyMessage || err?.data?.message || "Failed to update password.",
          type: "error",
        })
      );
    }
  };

  return (
    <form onSubmit={handlePasswordSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <KeyRound className="w-5 h-5 text-indigo-600" />
        <div>
          <h2 className="text-base font-bold text-slate-900">Change Password</h2>
          <p className="text-xs text-slate-500">Update your encrypted session credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Current Password *"
          type={showCurrent ? "text" : "password"}
          icon={Lock}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          required
          rightAction={
            <button
              type="button"
              onClick={() => setShowCurrent((p) => !p)}
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Input
          label="New Password *"
          type={showNew ? "text" : "password"}
          icon={Lock}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min 6 characters"
          required
          rightAction={
            <button
              type="button"
              onClick={() => setShowNew((p) => !p)}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Input
          label="Confirm New Password *"
          type={showNew ? "text" : "password"}
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          required
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="outline" isLoading={isLoading} icon={KeyRound}>
          Update Password
        </Button>
      </div>
    </form>
  );
}
