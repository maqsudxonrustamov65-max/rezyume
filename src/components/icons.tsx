import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const PlusIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 3.5v9M3.5 8h9" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.1a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.1" />
  </svg>
);

export const GripIcon = (p: P) => (
  <svg {...base({ ...p, stroke: "none", fill: "currentColor" })}>
    {[4, 8, 12].map((y) => (
      <g key={y}>
        <circle cx="6" cy={y} r="1.1" />
        <circle cx="10" cy={y} r="1.1" />
      </g>
    ))}
  </svg>
);

export const ChevronIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
  </svg>
);

export const DownloadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 2.75v7.5M4.75 7.25 8 10.5l3.25-3.25M3 13.25h10" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m3.5 8.5 3 3 6-6.5" />
  </svg>
);

export const XIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 4.5 7 7M11.5 4.5l-7 7" />
  </svg>
);

export const UserIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="8" cy="5.75" r="2.75" />
    <path d="M2.75 13.5c.6-2.4 2.7-3.75 5.25-3.75s4.65 1.35 5.25 3.75" />
  </svg>
);

export const SpinnerIcon = (p: P) => (
  <svg {...base(p)} className={`animate-spin ${p.className ?? ""}`}>
    <path d="M8 2.25a5.75 5.75 0 1 0 5.75 5.75" />
  </svg>
);

export const AlertIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 5.5v3.25M8 10.75v.25" />
    <circle cx="8" cy="8" r="5.75" />
  </svg>
);

export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="6" fill="#142A66" />
      <rect x="6.5" y="5" width="11" height="14" rx="1.5" fill="#FFFFFF" />
      <rect x="8.5" y="7.5" width="4" height="1.6" rx=".8" fill="#2563EB" />
      <rect x="8.5" y="10.5" width="7" height="1.1" rx=".55" fill="#C5D0E6" />
      <rect x="8.5" y="12.75" width="7" height="1.1" rx=".55" fill="#C5D0E6" />
      <rect x="8.5" y="15" width="4.5" height="1.1" rx=".55" fill="#C5D0E6" />
    </svg>
  );
}
