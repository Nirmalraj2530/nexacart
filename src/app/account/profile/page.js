"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/slices/authSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { User, Bell, Save } from "lucide-react";

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
          Manage your personal information, contact email, and notification preferences
        </p>
      </div>

      <ProfileForm key={user?.id || user?.email || "anonymous"} user={user} role={role} />
    </div>
  );
}

function ProfileForm({ user, role }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 019-2834",
    avatar: user?.avatar || "",
    currency: "USD",
    emailNotifications: true,
    smsNotifications: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
      };
      dispatch(setUserProfile(updatedUser));
      dispatch(addToast({ message: "Profile preferences saved successfully!", type: "success" }));
    }, 500);
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
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      </form>
  );
}
