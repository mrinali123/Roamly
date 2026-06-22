"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1E293B",
          color: "#F1F5F9",
          border: "1px solid #334155",
          borderRadius: "10px",
          fontSize: "14px",
        },
        success: {
          iconTheme: { primary: "#38BDF8", secondary: "#0F172A" },
        },
        error: {
          iconTheme: { primary: "#F87171", secondary: "#0F172A" },
        },
      }}
    />
  );
}
