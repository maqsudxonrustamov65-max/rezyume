"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LABELS } from "@/cv/i18n";
import { emptyCv, isEmptyCv, newId } from "@/cv/model";
import { sampleCv } from "@/cv/samples";
import { LANGS, TEMPLATES, type CV, type Lang, type TemplateId } from "@/cv/types";
import { useCvDoc, type SaveStatus } from "@/hooks/useCvDoc";
import { downloadPdf, loadPdfModule } from "@/lib/download";
import { ConfirmDialog, type ConfirmOptions } from "./ConfirmDialog";
import { Editor, type RemovedItem } from "./Editor";
import { AlertIcon, CheckIcon, DownloadIcon, LogoMark, SpinnerIcon } from "./icons";
import { Preview } from "./Preview";
import { Button, Segmented, cx } from "./ui";

type Tab = "edit" | "preview";

interface Toast {
  id: number;
  message: string;
  tone?: "default" | "error";
  action?: { label: string; run: () => void };
}

const TEMPLATE_NAMES: Record<TemplateId, string> = { classic: "Classic", modern: "Modern", minimal: "Minimal" };

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const content =
    status === "saving" ? (
      <>
        <SpinnerIcon width={14} height={14} />
        <span className="hidden sm:inline">Saving</span>
      </>
    ) : status === "saved" ? (
      <>
        <CheckIcon width={14} height={14} />
        <span className="hidden sm:inline">Saved</span>
      </>
    ) : (
      <>
        <AlertIcon width={14} height={14} />
        <span className="hidden sm:inline">Not saved</span>
      </>
    );
  return (
    <span
      role="status"
      title={status === "error" ? "This browser is blocking local storage, so changes are not saved." : "Saved in this browser"}
      className={cx(
        "inline-flex items-center gap-1.5 text-[12.5px] font-medium",
        status === "error" ? "text-[#B42318]" : "text-ink-3",
      )}
    >
      {content}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 px-4 py-5 sm:px-6" aria-hidden>
      {[120, 96, 64, 64].map((h, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-line bg-subtle" style={{ height: h }} />
      ))}
    </div>
  );
}

export function App() {
  const { doc, setDoc, status } = useCvDoc();
  const [tab, setTabState] = useState<Tab>("edit");
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [busy, setBusy] = useState(false);
  const editScroll = useRef(0);

  const update = useCallback(
    (fn: (cv: CV) => CV) => setDoc((d) => (d ? { ...d, cv: fn(d.cv) } : d)),
    [setDoc],
  );

  const showToast = useCallback((t: Omit<Toast, "id">) => setToast({ ...t, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), toast.action ? 6000 : 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Phones show one pane at a time; keep the editor's scroll position between tabs.
  const setTab = (next: Tab) => {
    if (next === tab) return;
    const phone = !window.matchMedia("(min-width: 1024px)").matches;
    if (phone && tab === "edit") editScroll.current = window.scrollY;
    setTabState(next);
    if (phone) requestAnimationFrame(() => window.scrollTo({ top: next === "edit" ? editScroll.current : 0 }));
  };

  if (!doc) {
    return (
      <div className="min-h-dvh bg-white">
        <Header status="idle" busy={false} disabled onDownload={() => {}} />
        <Skeleton />
      </div>
    );
  }

  const empty = isEmptyCv(doc.cv);

  const fillExample = () => {
    const apply = () => setDoc((d) => (d ? { ...d, cv: sampleCv(d.lang, newId) } : d));
    if (empty) apply();
    else
      setConfirm({
        title: "Replace your CV with the example?",
        body: `Everything you have entered will be replaced by a sample CV in ${LABELS[doc.lang].name}.`,
        confirmLabel: "Replace",
        tone: "danger",
        onConfirm: apply,
      });
  };

  const clearAll = () =>
    setConfirm({
      title: "Clear the whole CV?",
      body: "All details, sections and your photo will be removed from this browser. This cannot be undone.",
      confirmLabel: "Clear everything",
      tone: "danger",
      onConfirm: () => setDoc((d) => (d ? { ...d, cv: emptyCv() } : d)),
    });

  const onRemoved = (r: RemovedItem) =>
    showToast({
      message: `Removed “${r.label}”`,
      action: {
        label: "Undo",
        run: () =>
          update((cv) => {
            const list = [...(cv[r.key] as RemovedItem["item"][])];
            list.splice(Math.min(r.index, list.length), 0, r.item);
            return { ...cv, [r.key]: list };
          }),
      },
    });

  const download = async () => {
    setBusy(true);
    try {
      await downloadPdf(doc);
    } catch (err) {
      console.error(err);
      showToast({ message: "The PDF could not be created. Please try again.", tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white lg:flex lg:h-dvh lg:flex-col">
      <Header status={status} busy={busy} disabled={empty} onDownload={download} />

      {/* Phone and tablet: one pane at a time */}
      <div className="sticky top-14 z-30 border-b border-line bg-white px-4 py-2 lg:hidden">
        <Segmented<Tab>
          label="View"
          value={tab}
          onChange={setTab}
          options={[
            { value: "edit", label: "Edit" },
            { value: "preview", label: "Preview" },
          ]}
        />
      </div>

      <div className="lg:flex lg:min-h-0 lg:flex-1">
        <main
          aria-label="Editor"
          className={cx(
            "lg:w-[clamp(420px,44%,600px)] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-line",
            tab !== "edit" && "max-lg:hidden",
          )}
        >
          <div className="mx-auto max-w-[640px] px-4 pt-5 pb-16 sm:px-6 lg:pt-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">Your CV</h1>
                <p className="mt-0.5 text-[13px] text-ink-3">Changes are saved automatically in this browser.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={fillExample}>
                  Fill example
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAll} disabled={empty}>
                  Clear
                </Button>
              </div>
            </div>
            <Editor cv={doc.cv} update={update} onRemoved={onRemoved} />
          </div>
        </main>

        <section
          aria-label="Preview"
          className={cx(
            "bg-subtle max-lg:min-h-[calc(100dvh-7.5rem)] lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:overflow-y-auto",
            tab !== "preview" && "max-lg:hidden",
          )}
        >
          <div className="z-20 border-b border-line bg-subtle/95 px-4 py-3 sm:px-6 lg:sticky lg:top-0">
            <div className="mx-auto flex max-w-[820px] flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6">
              <div className="flex items-center gap-3">
                <span className="w-[68px] shrink-0 text-[12.5px] font-medium text-ink-3 sm:w-auto">Template</span>
                <Segmented<TemplateId>
                  label="Template"
                  className="flex-1 sm:w-[252px] sm:flex-none"
                  value={doc.template}
                  onChange={(template) => setDoc((d) => (d ? { ...d, template } : d))}
                  options={TEMPLATES.map((t) => ({ value: t, label: TEMPLATE_NAMES[t] }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-[68px] shrink-0 text-[12.5px] font-medium text-ink-3 sm:w-auto">Language</span>
                <Segmented<Lang>
                  label="CV language"
                  className="flex-1 sm:w-[288px] sm:flex-none"
                  value={doc.lang}
                  onChange={(lang) => setDoc((d) => (d ? { ...d, lang } : d))}
                  options={LANGS.map((l) => ({ value: l, label: LABELS[l].name }))}
                />
              </div>
            </div>
          </div>
          <div className="px-4 pt-5 pb-12 sm:px-6 lg:px-8 lg:pt-7">
            <Preview doc={doc} onFillExample={fillExample} />
          </div>
        </section>
      </div>

      <ConfirmDialog options={confirm} onClose={() => setConfirm(null)} />

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
          <div
            key={toast.id}
            role="status"
            className={cx(
              "toast-enter pointer-events-auto flex max-w-[460px] items-center gap-3 rounded-lg px-4 py-2.5 text-[13.5px] shadow-[0_12px_32px_rgba(10,26,58,0.24)]",
              toast.tone === "error" ? "bg-[#B42318] text-white" : "bg-ink text-white",
            )}
          >
            <span className="min-w-0 truncate">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.run();
                  setToast(null);
                }}
                className="shrink-0 rounded px-1.5 py-0.5 font-semibold text-[#9DBBFF] hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Header({
  status,
  busy,
  disabled,
  onDownload,
}: {
  status: SaveStatus;
  busy: boolean;
  disabled: boolean;
  onDownload: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white lg:static">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <LogoMark size={26} />
          <span className="text-[15.5px] font-semibold tracking-[-0.01em] text-ink">Rezyume</span>
          <span className="hidden text-[13px] text-ink-3 md:inline">CV builder</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <SaveIndicator status={status} />
          <Button
            variant="primary"
            onClick={onDownload}
            onPointerEnter={() => void loadPdfModule()}
            onFocus={() => void loadPdfModule()}
            disabled={busy || disabled}
            title={disabled ? "Add some details first" : undefined}
          >
            {busy ? <SpinnerIcon /> : <DownloadIcon />}
            {busy ? "Preparing" : "Download PDF"}
          </Button>
        </div>
      </div>
    </header>
  );
}
