"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { isEmptyCv } from "@/cv/model";
import { A4, htmlPrimitives } from "@/cv/primitives";
import { CvTemplate } from "@/cv/templates";
import type { CvDoc } from "@/cv/types";
import { Button } from "./ui";

/** 1pt = 4/3 CSS px. */
const PAGE_W = (A4.width * 4) / 3;
const PAGE_H = (A4.height * 4) / 3;

export function Preview({ doc, onFillExample }: { doc: CvDoc; onFillExample: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [contentH, setContentH] = useState(PAGE_H);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const page = pageRef.current;
    if (!wrap || !page) return;
    const ro = new ResizeObserver(() => {
      setWidth(wrap.clientWidth);
      setContentH(Math.max(PAGE_H, page.offsetHeight));
    });
    ro.observe(wrap);
    ro.observe(page);
    return () => ro.disconnect();
  }, []);

  const scale = width ? Math.min(1, width / PAGE_W) : 0;
  const pages = Math.max(1, Math.ceil((contentH - 1) / PAGE_H));
  const empty = isEmptyCv(doc.cv);

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-[820px]">
      <div
        className="relative mx-auto overflow-hidden rounded-[3px] bg-white shadow-[0_1px_2px_rgba(10,26,58,0.06),0_8px_28px_rgba(10,26,58,0.08)] ring-1 ring-[#E3E7EF]"
        style={{ width: PAGE_W * scale, height: contentH * scale, visibility: scale ? "visible" : "hidden" }}
      >
        <div
          ref={pageRef}
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: PAGE_W, transform: `scale(${scale})` }}
          aria-label="CV preview"
        >
          {/* Re-keyed so switching templates cross-fades. */}
          <div key={doc.template} className="preview-fade">
            <CvTemplate doc={doc} P={htmlPrimitives} />
          </div>
        </div>

        {Array.from({ length: pages - 1 }, (_, i) => (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-[#B9C3D6]"
            style={{ top: PAGE_H * (i + 1) * scale }}
          >
            <span className="absolute -top-2.5 right-2 rounded bg-white px-1.5 text-[10px] font-medium text-ink-3 ring-1 ring-[#E3E7EF]">
              Page {i + 2}
            </span>
          </div>
        ))}

        {empty && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-[280px] rounded-xl border border-line bg-white/95 p-5 text-center shadow-[0_8px_28px_rgba(10,26,58,0.08)]">
              <p className="text-[15px] font-semibold text-ink">Your CV will appear here</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                Start filling in your details, or load an example to see how it works.
              </p>
              <Button className="mt-4" onClick={onFillExample}>
                Fill example
              </Button>
            </div>
          </div>
        )}
      </div>
      {pages > 1 && (
        <p className="mt-3 text-center text-[12px] text-ink-3">
          {pages} pages. Page breaks in the downloaded PDF may differ slightly.
        </p>
      )}
    </div>
  );
}
