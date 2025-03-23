"use client";

import { cn } from "@/utils/cn.js"; // Utility for merging classNames
import { forwardRef } from "react";

export const Button = forwardRef(({ className, variant = "default", size = "md", ...props }, ref) => {
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      ref={ref}
      className={cn("rounded-md transition", variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

Button.displayName = "Button";
