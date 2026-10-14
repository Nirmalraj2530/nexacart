"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";

export function ProductPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 pt-8 px-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous Page"
        className="px-2 sm:px-3 h-8"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            1
          </button>
          {startPage > 2 && <span className="text-slate-400 text-xs px-0.5 sm:px-1">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold transition-all ${
            currentPage === p
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {p}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-400 text-xs px-0.5 sm:px-1">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            {totalPages}
          </button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next Page"
        className="px-2 sm:px-3 h-8"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
