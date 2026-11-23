"use client";

import { useEffect, useRef } from "react";
import { Button } from "./ui";

export interface ConfirmOptions {
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
}

/** A small modal built on the native <dialog> element (focus trap and Escape for free). */
export function ConfirmDialog({ options, onClose }: { options: ConfirmOptions | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (options && !d.open) d.showModal();
    if (!options && d.open) d.close();
  }, [options]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="confirm-title"
      className="dialog m-auto w-[calc(100%-32px)] max-w-[400px] rounded-xl border border-line bg-white p-0 text-ink shadow-[0_24px_64px_rgba(10,26,58,0.22)]"
    >
      {options && (
        <div className="p-5">
          <h2 id="confirm-title" className="text-[16px] font-semibold tracking-[-0.01em]">
            {options.title}
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{options.body}</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button onClick={onClose} autoFocus>
              Cancel
            </Button>
            <Button
              variant={options.tone === "danger" ? "danger" : "primary"}
              onClick={() => {
                options.onConfirm();
                onClose();
              }}
            >
              {options.confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
