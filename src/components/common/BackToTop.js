"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

export function BackToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const currentScroll = window.scrollY;

      if (currentScroll > 320) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Don't render on admin routes
  if (pathname?.startsWith("/admin") || !visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
      <button
        onClick={scrollToTop}
        className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white shadow-xl shadow-slate-950/20 backdrop-blur-md border border-slate-700/80 hover:border-indigo-500 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Scroll back to top of page"
        title="Back to Top"
      >
        {/* Subtle circular scroll indicator SVG */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="19"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            className="text-slate-800"
          />
          <circle
            cx="22"
            cy="22"
            r="19"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="119.4"
            strokeDashoffset={119.4 - (119.4 * scrollProgress) / 100}
            strokeLinecap="round"
            className="text-indigo-400 group-hover:text-white transition-all duration-100"
          />
        </svg>

        <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
}
