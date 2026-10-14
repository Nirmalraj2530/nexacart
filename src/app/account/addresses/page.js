"use client";

import React, { useState, useSyncExternalStore, useMemo } from "react";
import { addToast } from "@/redux/slices/uiSlice";
import { useDispatch } from "react-redux";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { MapPin, Plus, Trash2, Edit, CheckCircle, Home, Briefcase } from "lucide-react";

const ADDRESS_STORAGE_KEY = "nexacart_saved_addresses";

const INITIAL_ADDRESSES = [
  {
    id: "addr-1",
    fullName: "John Doe",
    phone: "+1 (555) 019-2834",
    address: "123 Market Street, Suite 400",
    city: "San Francisco",
    state: "California",
    pincode: "94103",
    country: "United States",
    type: "Home",
    isDefault: true,
  },
  {
    id: "addr-2",
    fullName: "John Doe (Office)",
    phone: "+1 (555) 019-8821",
    address: "500 Howard Street, Floor 12",
    city: "San Francisco",
    state: "California",
    pincode: "94105",
    country: "United States",
    type: "Work",
    isDefault: false,
  },
];

const addressSubscribers = new Set();
const subscribeAddresses = (cb) => {
  addressSubscribers.add(cb);
  return () => addressSubscribers.delete(cb);
};
const notifyAddresses = () => addressSubscribers.forEach((cb) => cb());
const getAddressesSnapshot = () => {
  if (typeof window === "undefined") return JSON.stringify(INITIAL_ADDRESSES);
  try {
    const stored = localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(INITIAL_ADDRESSES));
      return JSON.stringify(INITIAL_ADDRESSES);
    }
    return stored;
  } catch {
    return JSON.stringify(INITIAL_ADDRESSES);
  }
};

export default function AccountAddressesPage() {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const rawAddresses = useSyncExternalStore(
    subscribeAddresses,
    getAddressesSnapshot,
    () => JSON.stringify(INITIAL_ADDRESSES)
  );
  const addresses = useMemo(() => {
    try {
      return JSON.parse(rawAddresses);
    } catch {
      return INITIAL_ADDRESSES;
    }
  }, [rawAddresses]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "United States",
    type: "Home",
    isDefault: false,
  });

  const saveAddresses = (list) => {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
    notifyAddresses();
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "United States",
      type: "Home",
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({ ...addr });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddresses(updated);
    dispatch(addToast({ message: "Address deleted", type: "info" }));
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddresses(updated);
    dispatch(addToast({ message: "Default address updated", type: "success" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.address || !formData.city || !formData.pincode) {
      dispatch(addToast({ message: "Please fill in all required fields", type: "error" }));
      return;
    }

    let updated;
    if (editingId) {
      updated = addresses.map((a) => {
        if (a.id === editingId) {
          return { ...formData, id: editingId };
        }
        return formData.isDefault ? { ...a, isDefault: false } : a;
      });
      dispatch(addToast({ message: "Address updated successfully", type: "success" }));
    } else {
      const newAddr = {
        ...formData,
        id: `addr-${Date.now()}`,
      };
      if (formData.isDefault) {
        updated = [newAddr, ...addresses.map((a) => ({ ...a, isDefault: false }))];
      } else {
        updated = [...addresses, newAddr];
      }
      dispatch(addToast({ message: "New address added", type: "success" }));
    }

    saveAddresses(updated);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-600" />
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal delivery destinations for rapid 1-click checkout
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-3xl border p-5 shadow-xs transition-all relative flex flex-col justify-between space-y-4 ${
              addr.isDefault
                ? "bg-indigo-50/30 border-indigo-300 ring-2 ring-indigo-500/10"
                : "bg-white border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {addr.type === "Work" ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                  {addr.type || "Home"}
                </span>

                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Default
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900">{addr.fullName}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {addr.address}, {addr.city}, {addr.state} {addr.pincode}, {addr.country}
              </p>
              <p className="text-xs text-slate-500 font-mono">Phone: {addr.phone}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {!addr.isDefault ? (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-semibold">Primary Address</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(addr)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit address"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Address Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="p-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            {editingId ? "Edit Delivery Address" : "Add New Delivery Address"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                label="Full Name *"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Recipient's Name"
                required
              />
            </div>

            <Input
              label="Phone Number *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              required
            />

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Address Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <Input
                label="Street Address *"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, Apt 4"
                required
              />
            </div>

            <Input
              label="City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="San Francisco"
              required
            />

            <Input
              label="State / Province"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="California"
            />

            <Input
              label="ZIP / Postal Code *"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="94103"
              required
            />

            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Make this my primary default delivery address
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingId ? "Save Changes" : "Save Address"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
