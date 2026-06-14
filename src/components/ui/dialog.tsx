"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({ open, onOpenChange, title, children, className }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onOpenChange(false);
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onOpenChange]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange(false);
      }}
      className={cn(
        "max-h-[85vh] w-[min(560px,92vw)] rounded-lg border border-neutral-200 p-0 shadow-xl backdrop:bg-neutral-900/40",
        className,
      )}
    >
      <div className="flex flex-col">
        {title ? (
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
            <h2 className="text-sm font-medium text-neutral-900">{title}</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-neutral-400 hover:text-neutral-700"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}
        <div className="p-5">{children}</div>
      </div>
    </dialog>
  );
}
