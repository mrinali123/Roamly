"use client";

import Link from "next/link";

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  type?: "button" | "submit";
}

const sizes = {
  sm: { padding: "8px 18px",  fontSize: 14 },
  md: { padding: "12px 24px", fontSize: 15 },
  lg: { padding: "16px 32px", fontSize: 17 },
};

export default function GradientButton({
  children,
  onClick,
  href,
  size = "md",
  loading = false,
  className = "",
  type = "button",
}: GradientButtonProps) {
  const sizeStyle = sizes[size];
  const inner = loading ? (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  ) : children;

  if (href) {
    return (
      <Link href={href} className={`gradient-btn ${className}`} style={sizeStyle}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`gradient-btn ${className}`}
      style={sizeStyle}
    >
      {inner}
    </button>
  );
}
