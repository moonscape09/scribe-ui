"use client";

import { Trash2 } from "lucide-react";

export function TrashButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );
}
