"use client";

import { useEffect, useRef, useState } from "react";
import { emptyDoc, normalizeDoc, STORAGE_KEY } from "@/cv/model";
import type { CvDoc } from "@/cv/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

function write(doc: CvDoc): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    return true;
  } catch {
    return false;
  }
}

/**
 * The CV document, loaded from localStorage on mount and saved back shortly
 * after every change (and immediately when the page is hidden or closed).
 */
export function useCvDoc() {
  const [doc, setDoc] = useState<CvDoc | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const latest = useRef<CvDoc | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    let loaded = emptyDoc();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = normalizeDoc(JSON.parse(raw));
    } catch {
      // Corrupt or blocked storage: start fresh.
    }
    latest.current = loaded;
    setDoc(loaded);
  }, []);

  useEffect(() => {
    if (!doc || doc === latest.current) return;
    latest.current = doc;
    dirty.current = true;
    setStatus("saving");
    const t = window.setTimeout(() => {
      dirty.current = false;
      setStatus(write(doc) ? "saved" : "error");
    }, 350);
    return () => window.clearTimeout(t);
  }, [doc]);

  useEffect(() => {
    const flush = () => {
      if (dirty.current && latest.current) {
        dirty.current = false;
        write(latest.current);
      }
    };
    const onVisibility = () => document.visibilityState === "hidden" && flush();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { doc, setDoc, status };
}
