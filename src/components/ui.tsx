"use client";

import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronIcon } from "./icons";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ variant = "secondary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex shrink-0 select-none items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap",
        "transition-[background-color,border-color,color,box-shadow] duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" ? "h-9 px-3.5 text-[13.5px]" : "h-8 px-2.5 text-[13px]",
        variant === "primary" && "bg-navy text-white shadow-[0_1px_2px_rgba(10,26,58,0.18)] hover:bg-[#0F2052] active:bg-[#0C1A44]",
        variant === "secondary" && "border border-line bg-white text-ink hover:border-[#CBD3E2] hover:bg-[#FAFBFD]",
        variant === "ghost" && "text-ink-2 hover:bg-subtle hover:text-ink",
        variant === "danger" && "bg-[#B42318] text-white hover:bg-[#9A1D14]",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors",
        "hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

// 16px on phones prevents iOS Safari from zooming into focused fields.
const control =
  "block w-full rounded-lg border border-line bg-white text-[16px] text-ink sm:text-[14px] " +
  "placeholder:text-[#B3BCCD] transition-[border-color,box-shadow] duration-150 " +
  "hover:border-[#CBD3E2] focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15 " +
  "disabled:cursor-not-allowed disabled:bg-subtle disabled:text-ink-3";

export function Field({
  label,
  hint,
  className,
  children,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className={cx("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[12.5px] font-medium text-ink-2">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] leading-snug text-ink-3">{hint}</p>}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cx(control, "h-10 px-3", className)} {...props} />;
});

/** A textarea that grows with its content. */
export function TextArea({ className, value, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight + 2, 88)}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      rows={3}
      className={cx(control, "resize-none px-3 py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cx(control, "h-10 cursor-pointer appearance-none pr-9 pl-3", className)} {...props}>
        {children}
      </select>
      <ChevronIcon className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-3" />
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Month and year pickers that store "YYYY-MM" (or "YYYY" when no month is chosen). */
export function MonthField({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const year = /^\d{4}/.exec(value)?.[0] ?? "";
  const month = /^\d{4}-(\d{2})$/.exec(value)?.[1] ?? "";
  const now = new Date().getFullYear();
  const years = Array.from({ length: now + 6 - 1960 }, (_, i) => String(now + 5 - i));

  const set = (y: string, m: string) => onChange(y ? (m ? `${y}-${m}` : y) : "");

  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="mb-1.5 block text-[12.5px] font-medium text-ink-2">{label}</legend>
      <div className="grid grid-cols-[1fr_1.15fr] gap-2">
        <Select
          id={`${id}-month`}
          aria-label={`${label} month`}
          value={month}
          onChange={(e) => set(year || String(now), e.target.value)}
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </Select>
        <Select id={`${id}-year`} aria-label={`${label} year`} value={year} onChange={(e) => set(e.target.value, month)}>
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>
    </fieldset>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[13.5px] text-ink-2 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer rounded border-line accent-[#142A66]"
      />
      {label}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented control                                                   */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx("relative grid rounded-lg bg-[#EBEEF4] p-[3px]", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = options[(index + (e.key === "ArrowRight" ? 1 : options.length - 1)) % options.length];
        onChange(next.value);
        (e.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus();
      }}
    >
      <span
        aria-hidden
        className="seg-indicator absolute top-[3px] bottom-[3px] left-[3px] rounded-md bg-white shadow-[0_1px_2px_rgba(10,26,58,0.1),0_0_0_1px_rgba(10,26,58,0.05)]"
        style={{ width: `calc((100% - 6px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          data-value={o.value}
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
          className={cx(
            "relative z-10 h-8 truncate rounded-md px-2 text-[13px] font-medium transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
            o.value === value ? "text-ink" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export { cx };
