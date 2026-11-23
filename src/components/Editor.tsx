"use client";

import { useState, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import { LABELS } from "@/cv/i18n";
import { addItem, blankItem, formatMonth, formatRange, moveItem, newId, removeItem, updateItem } from "@/cv/model";
import { LEVELS, type CV, type ListItem, type ListKey, type Personal } from "@/cv/types";
import { ChevronIcon, GripIcon, PlusIcon, TrashIcon, XIcon } from "./icons";
import { PhotoField } from "./PhotoField";
import { SortableItem, SortableList } from "./Sortable";
import { Button, Checkbox, Field, IconButton, MonthField, Select, TextArea, TextInput, cx } from "./ui";

export interface RemovedItem {
  key: ListKey;
  item: ListItem<ListKey>;
  index: number;
  label: string;
}

interface EditorProps {
  cv: CV;
  update: (fn: (cv: CV) => CV) => void;
  onRemoved: (removed: RemovedItem) => void;
}

const EN = LABELS.en;
const join = (parts: string[], sep = " · ") => parts.map((p) => p.trim()).filter(Boolean).join(sep);

/* ------------------------------------------------------------------ */
/* Layout pieces                                                       */
/* ------------------------------------------------------------------ */

export function Collapse({ open, id, children }: { open: boolean; id?: string; children: ReactNode }) {
  return (
    <div id={id} className="collapse-grid" data-open={open} inert={!open}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Section({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section aria-labelledby={`${id}-title`} className="rounded-xl border border-line bg-white">
      <h2 id={`${id}-title`}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-body`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:px-5"
        >
          <span className="flex items-center gap-2">
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</span>
            {count != null && count > 0 && (
              <span className="rounded-full bg-subtle px-1.5 py-px text-[12px] font-medium text-ink-3 tabular-nums">{count}</span>
            )}
          </span>
          <ChevronIcon className={cx("text-ink-3 transition-transform duration-200", open && "rotate-180")} />
        </button>
      </h2>
      <Collapse open={open} id={`${id}-body`}>
        <div className="px-4 pt-1 pb-5 sm:px-5">{children}</div>
      </Collapse>
    </section>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#CBD3E2] text-[13.5px] font-medium text-ink-2 transition-colors hover:border-accent hover:bg-[#F6F9FF] hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <PlusIcon />
      {children}
    </button>
  );
}

function ItemCard({
  title,
  subtitle,
  placeholder,
  expanded,
  fresh,
  isDragging,
  handleProps,
  bodyId,
  onToggle,
  onRemove,
  children,
}: {
  title: string;
  subtitle: string;
  placeholder: string;
  expanded: boolean;
  fresh: boolean;
  isDragging: boolean;
  handleProps: HTMLAttributes<HTMLElement>;
  bodyId: string;
  onToggle: () => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const name = title.trim() || placeholder;
  return (
    <div
      className={cx(
        "rounded-lg border bg-white transition-[box-shadow,border-color] duration-150",
        isDragging ? "border-[#C3CDE0] shadow-[0_10px_28px_rgba(10,26,58,0.14)]" : "border-line",
        fresh && "item-enter",
      )}
    >
      <div className="flex items-center gap-0.5 py-1 pr-1 pl-0.5">
        <button
          type="button"
          {...handleProps}
          aria-label={`Drag to reorder: ${name}`}
          className="flex h-10 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-[#A3ADC2] transition-colors hover:text-ink-2 focus-visible:outline-2 focus-visible:outline-accent active:cursor-grabbing"
        >
          <GripIcon />
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="flex min-w-0 flex-1 flex-col items-start rounded-md px-1 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className={cx("w-full truncate text-[14px] font-medium", title.trim() ? "text-ink" : "text-ink-3")}>{name}</span>
          {subtitle && <span className="w-full truncate text-[12.5px] text-ink-3">{subtitle}</span>}
        </button>
        <IconButton label={`Remove ${name}`} onClick={onRemove} className="hover:text-[#B42318]">
          <TrashIcon />
        </IconButton>
        <IconButton label={expanded ? "Collapse" : "Expand"} onClick={onToggle}>
          <ChevronIcon className={cx("transition-transform duration-200", expanded && "rotate-180")} />
        </IconButton>
      </div>
      <Collapse open={expanded} id={bodyId}>
        <div className="border-t border-line px-3.5 pt-4 pb-4 sm:px-4">{children}</div>
      </Collapse>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generic list section                                                */
/* ------------------------------------------------------------------ */

function ListSection<K extends Exclude<ListKey, "skills">>({
  k,
  title,
  addLabel,
  placeholder,
  cv,
  update,
  onRemoved,
  summary,
  fields,
}: {
  k: K;
  title: string;
  addLabel: string;
  placeholder: string;
  cv: CV;
  update: EditorProps["update"];
  onRemoved: EditorProps["onRemoved"];
  summary: (item: ListItem<K>) => { title: string; subtitle: string };
  fields: (item: ListItem<K>, change: (patch: Partial<ListItem<K>>) => void, fresh: boolean) => ReactNode;
}) {
  const items = cv[k] as ListItem<K>[];
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [fresh, setFresh] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const add = () => {
    const item = blankItem(k);
    update((c) => addItem(c, k, item));
    setExpanded((s) => new Set(s).add(item.id));
    setFresh(item.id);
  };

  const remove = (item: ListItem<K>) => {
    const index = items.findIndex((x) => x.id === item.id);
    update((c) => removeItem(c, k, item.id));
    onRemoved({ key: k, item, index, label: summary(item).title.trim() || placeholder });
  };

  return (
    <Section id={k} title={title} count={items.length}>
      {items.length > 0 && (
        <SortableList id={`dnd-${k}`} ids={items.map((x) => x.id)} onMove={(a, b) => update((c) => moveItem(c, k, a, b))}>
          <div className="space-y-2.5">
            {items.map((item) => {
              const s = summary(item);
              return (
                <SortableItem key={item.id} id={item.id}>
                  {({ handleProps, isDragging }) => (
                    <ItemCard
                      title={s.title}
                      subtitle={s.subtitle}
                      placeholder={placeholder}
                      expanded={expanded.has(item.id)}
                      fresh={fresh === item.id}
                      isDragging={isDragging}
                      handleProps={handleProps}
                      bodyId={`${k}-${item.id}-body`}
                      onToggle={() => toggle(item.id)}
                      onRemove={() => remove(item)}
                    >
                      {fields(item, (patch) => update((c) => updateItem(c, k, item.id, patch)), fresh === item.id)}
                    </ItemCard>
                  )}
                </SortableItem>
              );
            })}
          </div>
        </SortableList>
      )}
      <AddButton onClick={add}>{addLabel}</AddButton>
    </Section>
  );
}

const DESCRIPTION_HINT = "Start a line with a dash (-) to make it a bullet point.";

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function PersonalSection({ cv, update }: Pick<EditorProps, "cv" | "update">) {
  const p = cv.personal;
  const set = (key: keyof Personal) => (v: string | null) => update((c) => ({ ...c, personal: { ...c.personal, [key]: v } }));
  const input = (key: Exclude<keyof Personal, "photo">, label: string, extra: Record<string, string> = {}, className?: string) => (
    <Field label={label} htmlFor={`personal-${key}`} className={className}>
      <TextInput id={`personal-${key}`} value={p[key]} onChange={(e) => set(key)(e.target.value)} {...extra} />
    </Field>
  );
  return (
    <Section id="personal" title="Personal details">
      <PhotoField photo={p.photo} onChange={set("photo")} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {input("fullName", "Full name", { autoComplete: "name", placeholder: "Aziza Karimova" })}
        {input("jobTitle", "Job title", { autoComplete: "organization-title", placeholder: "Frontend Developer" })}
        {input("phone", "Phone", { type: "tel", autoComplete: "tel", placeholder: "+998 90 123 45 67" })}
        {input("email", "Email", { type: "email", autoComplete: "email", placeholder: "you@example.com" })}
        {input("city", "City", { autoComplete: "address-level2", placeholder: "Tashkent, Uzbekistan" })}
        {input("telegram", "Telegram", { placeholder: "@username", autoCapitalize: "none", autoCorrect: "off", spellCheck: "false" })}
        {input(
          "linkedin",
          "LinkedIn",
          { inputMode: "url", placeholder: "linkedin.com/in/username", autoCapitalize: "none", autoCorrect: "off", spellCheck: "false" },
          "sm:col-span-2",
        )}
      </div>
    </Section>
  );
}

function SummarySection({ cv, update }: Pick<EditorProps, "cv" | "update">) {
  const n = cv.summary.trim().length;
  return (
    <Section id="summary" title="Summary">
      <Field
        label="Professional summary"
        htmlFor="summary"
        hint={`${n} characters. Two to four sentences about your experience and strengths work best.`}
      >
        <TextArea
          id="summary"
          value={cv.summary}
          placeholder="Frontend developer with 6 years of experience building fast, accessible web apps..."
          onChange={(e) => update((c) => ({ ...c, summary: e.target.value }))}
        />
      </Field>
    </Section>
  );
}

function SkillsSection({ cv, update, onRemoved }: EditorProps) {
  const [draft, setDraft] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const names = draft
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) return;
    const existing = new Set(cv.skills.map((s) => s.name.trim().toLowerCase()));
    const fresh = names.filter((n) => !existing.has(n.toLowerCase()));
    update((c) => ({ ...c, skills: [...c.skills, ...fresh.map((name) => ({ id: newId(), name }))] }));
    setDraft("");
  };

  return (
    <Section id="skills" title="Skills" count={cv.skills.length}>
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="skill-input" className="sr-only">
          New skill
        </label>
        <TextInput
          id="skill-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. TypeScript"
          enterKeyHint="done"
          autoComplete="off"
        />
        <Button type="submit" className="h-10" disabled={!draft.trim()}>
          <PlusIcon />
          Add
        </Button>
      </form>
      <p className="mt-1.5 text-[12px] text-ink-3">Press Enter to add. Paste a comma-separated list to add several. Drag to reorder.</p>
      {cv.skills.length > 0 && (
        <SortableList
          id="dnd-skills"
          layout="grid"
          ids={cv.skills.map((s) => s.id)}
          onMove={(a, b) => update((c) => moveItem(c, "skills", a, b))}
        >
          <div className="mt-3.5 flex flex-wrap gap-2">
            {cv.skills.map((s, index) => (
              <SortableItem key={s.id} id={s.id}>
                {({ handleProps, isDragging }) => (
                  <span
                    {...handleProps}
                    aria-label={`${s.name}. Press space to reorder.`}
                    className={cx(
                      "chip-enter inline-flex h-8 cursor-grab items-center gap-1 rounded-md border bg-white pr-1 pl-2.5 text-[13px] text-ink select-none active:cursor-grabbing",
                      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                      isDragging ? "border-[#C3CDE0] shadow-[0_8px_20px_rgba(10,26,58,0.14)]" : "border-line",
                    )}
                    style={{ touchAction: "manipulation" }}
                  >
                    {s.name}
                    <button
                      type="button"
                      aria-label={`Remove ${s.name}`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        update((c) => removeItem(c, "skills", s.id));
                        onRemoved({ key: "skills", item: s, index, label: s.name });
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded text-ink-3 transition-colors hover:bg-subtle hover:text-ink"
                    >
                      <XIcon width={13} height={13} />
                    </button>
                  </span>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Editor({ cv, update, onRemoved }: EditorProps) {
  const common = { cv, update, onRemoved };
  const idFor = (k: string, id: string, f: string) => `${k}-${id}-${f}`;

  return (
    <div className="space-y-3">
      <PersonalSection cv={cv} update={update} />
      <SummarySection cv={cv} update={update} />

      <ListSection
        {...common}
        k="experience"
        title="Experience"
        addLabel="Add experience"
        placeholder="Untitled position"
        summary={(x) => ({ title: x.role, subtitle: join([x.company, formatRange(x.start, x.end, x.current, EN)]) })}
        fields={(x, change, fresh) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title" htmlFor={idFor("experience", x.id, "role")}>
              <TextInput id={idFor("experience", x.id, "role")} value={x.role} autoFocus={fresh} onChange={(e) => change({ role: e.target.value })} />
            </Field>
            <Field label="Company" htmlFor={idFor("experience", x.id, "company")}>
              <TextInput id={idFor("experience", x.id, "company")} value={x.company} onChange={(e) => change({ company: e.target.value })} />
            </Field>
            <Field label="City" htmlFor={idFor("experience", x.id, "city")} className="sm:col-span-2">
              <TextInput id={idFor("experience", x.id, "city")} value={x.city} onChange={(e) => change({ city: e.target.value })} />
            </Field>
            <MonthField id={idFor("experience", x.id, "start")} label="Start date" value={x.start} onChange={(v) => change({ start: v })} />
            <MonthField
              id={idFor("experience", x.id, "end")}
              label="End date"
              value={x.current ? "" : x.end}
              disabled={x.current}
              onChange={(v) => change({ end: v })}
            />
            <div className="sm:col-span-2">
              <Checkbox label="I currently work here" checked={x.current} onChange={(v) => change({ current: v })} />
            </div>
            <Field label="Description" htmlFor={idFor("experience", x.id, "desc")} hint={DESCRIPTION_HINT} className="sm:col-span-2">
              <TextArea
                id={idFor("experience", x.id, "desc")}
                value={x.description}
                placeholder={"- Led a team of 4 engineers\n- Cut page load time by 45%"}
                onChange={(e) => change({ description: e.target.value })}
              />
            </Field>
          </div>
        )}
      />

      <ListSection
        {...common}
        k="education"
        title="Education"
        addLabel="Add education"
        placeholder="Untitled degree"
        summary={(x) => ({ title: x.degree, subtitle: join([x.school, formatRange(x.start, x.end, x.current, EN)]) })}
        fields={(x, change, fresh) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Degree or qualification" htmlFor={idFor("education", x.id, "degree")}>
              <TextInput id={idFor("education", x.id, "degree")} value={x.degree} autoFocus={fresh} onChange={(e) => change({ degree: e.target.value })} />
            </Field>
            <Field label="School or university" htmlFor={idFor("education", x.id, "school")}>
              <TextInput id={idFor("education", x.id, "school")} value={x.school} onChange={(e) => change({ school: e.target.value })} />
            </Field>
            <Field label="City" htmlFor={idFor("education", x.id, "city")} className="sm:col-span-2">
              <TextInput id={idFor("education", x.id, "city")} value={x.city} onChange={(e) => change({ city: e.target.value })} />
            </Field>
            <MonthField id={idFor("education", x.id, "start")} label="Start date" value={x.start} onChange={(v) => change({ start: v })} />
            <MonthField
              id={idFor("education", x.id, "end")}
              label="End date"
              value={x.current ? "" : x.end}
              disabled={x.current}
              onChange={(v) => change({ end: v })}
            />
            <div className="sm:col-span-2">
              <Checkbox label="I currently study here" checked={x.current} onChange={(v) => change({ current: v })} />
            </div>
            <Field label="Description" htmlFor={idFor("education", x.id, "desc")} hint={DESCRIPTION_HINT} className="sm:col-span-2">
              <TextArea id={idFor("education", x.id, "desc")} value={x.description} onChange={(e) => change({ description: e.target.value })} />
            </Field>
          </div>
        )}
      />

      <ListSection
        {...common}
        k="projects"
        title="Projects"
        addLabel="Add project"
        placeholder="Untitled project"
        summary={(x) => ({ title: x.name, subtitle: join([x.role, x.link]) })}
        fields={(x, change, fresh) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name" htmlFor={idFor("projects", x.id, "name")}>
              <TextInput id={idFor("projects", x.id, "name")} value={x.name} autoFocus={fresh} onChange={(e) => change({ name: e.target.value })} />
            </Field>
            <Field label="Your role" htmlFor={idFor("projects", x.id, "role")}>
              <TextInput id={idFor("projects", x.id, "role")} value={x.role} onChange={(e) => change({ role: e.target.value })} />
            </Field>
            <Field label="Link" htmlFor={idFor("projects", x.id, "link")} className="sm:col-span-2">
              <TextInput
                id={idFor("projects", x.id, "link")}
                value={x.link}
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="github.com/you/project"
                onChange={(e) => change({ link: e.target.value })}
              />
            </Field>
            <Field label="Description" htmlFor={idFor("projects", x.id, "desc")} hint={DESCRIPTION_HINT} className="sm:col-span-2">
              <TextArea id={idFor("projects", x.id, "desc")} value={x.description} onChange={(e) => change({ description: e.target.value })} />
            </Field>
          </div>
        )}
      />

      <SkillsSection {...common} />

      <ListSection
        {...common}
        k="languages"
        title="Languages"
        addLabel="Add language"
        placeholder="Untitled language"
        summary={(x) => ({ title: x.name, subtitle: EN.levels[x.level] })}
        fields={(x, change, fresh) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Language" htmlFor={idFor("languages", x.id, "name")}>
              <TextInput id={idFor("languages", x.id, "name")} value={x.name} autoFocus={fresh} placeholder="English" onChange={(e) => change({ name: e.target.value })} />
            </Field>
            <Field label="Level" htmlFor={idFor("languages", x.id, "level")}>
              <Select id={idFor("languages", x.id, "level")} value={x.level} onChange={(e) => change({ level: e.target.value as typeof x.level })}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {EN.levels[l]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}
      />

      <ListSection
        {...common}
        k="certificates"
        title="Certificates"
        addLabel="Add certificate"
        placeholder="Untitled certificate"
        summary={(x) => ({ title: x.name, subtitle: join([x.issuer, formatMonth(x.date, EN)]) })}
        fields={(x, change, fresh) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Certificate" htmlFor={idFor("certificates", x.id, "name")}>
              <TextInput id={idFor("certificates", x.id, "name")} value={x.name} autoFocus={fresh} onChange={(e) => change({ name: e.target.value })} />
            </Field>
            <Field label="Issued by" htmlFor={idFor("certificates", x.id, "issuer")}>
              <TextInput id={idFor("certificates", x.id, "issuer")} value={x.issuer} onChange={(e) => change({ issuer: e.target.value })} />
            </Field>
            <MonthField id={idFor("certificates", x.id, "date")} label="Date" value={x.date} onChange={(v) => change({ date: v })} />
            <Field label="Link" htmlFor={idFor("certificates", x.id, "link")}>
              <TextInput
                id={idFor("certificates", x.id, "link")}
                value={x.link}
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Optional"
                onChange={(e) => change({ link: e.target.value })}
              />
            </Field>
          </div>
        )}
      />
    </div>
  );
}
