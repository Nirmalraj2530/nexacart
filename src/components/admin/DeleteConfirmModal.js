"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Trash2, AlertTriangle } from "lucide-react";

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productTitle,
  isLoading,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Product">
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-2xl text-rose-700">
          <AlertTriangle className="w-6 h-6 shrink-0 text-rose-600" />
          <p className="text-xs font-medium">
            This action cannot be undone. It will permanently remove this item from the store.
          </p>
        </div>

        <p className="text-sm text-slate-700">
          Are you sure you want to delete <span className="font-bold text-slate-900">&quot;{productTitle}&quot;</span>?
        </p>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            Delete Product
          </Button>
        </div>
      </div>
    </Modal>
  );
}
