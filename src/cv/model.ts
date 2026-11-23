import { LABELS, type CvLabels } from "./i18n";
import {
  LANGS,
  LEVELS,
  TEMPLATES,
  type CV,
  type CvDoc,
  type Lang,
  type ListItem,
  type ListKey,
  type Personal,
} from "./types";

/* ------------------------------------------------------------------ */
/* Ids and blanks                                                      */
/* ------------------------------------------------------------------ */

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const emptyPersonal = (): Personal => ({
  fullName: "",
  jobTitle: "",
  phone: "",
  email: "",
  city: "",
  telegram: "",
  linkedin: "",
  photo: null,
});

export const emptyCv = (): CV => ({
  personal: emptyPersonal(),
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
  certificates: [],
});

export const emptyDoc = (): CvDoc => ({ cv: emptyCv(), template: "classic", lang: "en" });

export function blankItem<K extends ListKey>(key: K): ListItem<K> {
  const id = newId();
  const items: { [P in ListKey]: ListItem<P> } = {
    experience: { id, role: "", company: "", city: "", start: "", end: "", current: false, description: "" },
    education: { id, degree: "", school: "", city: "", start: "", end: "", current: false, description: "" },
    projects: { id, name: "", role: "", link: "", description: "" },
    skills: { id, name: "" },
    languages: { id, name: "", level: "b2" },
    certificates: { id, name: "", issuer: "", date: "", link: "" },
  };
  return items[key];
}

/* ------------------------------------------------------------------ */
/* Immutable operations                                                */
/* ------------------------------------------------------------------ */

export function addItem<K extends ListKey>(cv: CV, key: K, item: ListItem<K> = blankItem(key)): CV {
  return { ...cv, [key]: [...cv[key], item] };
}

export function updateItem<K extends ListKey>(cv: CV, key: K, id: string, patch: Partial<ListItem<K>>): CV {
  const list = cv[key] as ListItem<K>[];
  return { ...cv, [key]: list.map((it) => (it.id === id ? { ...it, ...patch } : it)) };
}

export function removeItem<K extends ListKey>(cv: CV, key: K, id: string): CV {
  const list = cv[key] as ListItem<K>[];
  return { ...cv, [key]: list.filter((it) => it.id !== id) };
}

export function moveItem<K extends ListKey>(cv: CV, key: K, fromId: string, toId: string): CV {
  const list = [...(cv[key] as ListItem<K>[])];
  const from = list.findIndex((it) => it.id === fromId);
  const to = list.findIndex((it) => it.id === toId);
  if (from < 0 || to < 0 || from === to) return cv;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  return { ...cv, [key]: list };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const clean = (s: string | undefined | null) => (s ?? "").trim();

/** "2022-03" → "Mar 2022" in the CV language. */
export function formatMonth(ym: string, labels: CvLabels): string {
  const m = /^(\d{4})-(\d{2})$/.exec(clean(ym));
  if (!m) return clean(ym);
  const month = Number(m[2]);
  return month >= 1 && month <= 12 ? `${labels.months[month - 1]} ${m[1]}` : m[1];
}

export function formatRange(start: string, end: string, current: boolean, labels: CvLabels): string {
  const a = formatMonth(start, labels);
  const b = current ? labels.present : formatMonth(end, labels);
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

/** Strip protocol and "www." for display. */
export function displayUrl(url: string): string {
  return clean(url).replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

export function hrefFor(url: string): string {
  const u = clean(url);
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export interface Contact {
  key: "phone" | "email" | "city" | "telegram" | "linkedin";
  label: string;
  value: string;
  href?: string;
}

export function contacts(p: Personal, labels: CvLabels): Contact[] {
  const out: Contact[] = [];
  const phone = clean(p.phone);
  if (phone) out.push({ key: "phone", label: labels.phone, value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` });
  const email = clean(p.email);
  if (email) out.push({ key: "email", label: labels.email, value: email, href: `mailto:${email}` });
  const tg = clean(p.telegram)
    .replace(/^https?:\/\//i, "")
    .replace(/^(t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "");
  if (tg) out.push({ key: "telegram", label: labels.telegram, value: `t.me/${tg}`, href: `https://t.me/${tg}` });
  const li = displayUrl(p.linkedin);
  if (li) {
    const value = /linkedin\.com/i.test(li) ? li : `linkedin.com/in/${li.replace(/^@/, "")}`;
    out.push({ key: "linkedin", label: labels.linkedin, value, href: `https://${value}` });
  }
  const city = clean(p.city);
  if (city) out.push({ key: "city", label: labels.city, value: city });
  return out;
}

export type TextBlock = { kind: "bullet" | "para"; text: string };

/** Lines starting with "-", "•" or "*" become bullets; other lines are paragraphs. */
export function parseText(text: string): TextBlock[] {
  return clean(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = /^[-•*–]\s*(.*)$/.exec(l);
      return m ? { kind: "bullet" as const, text: m[1] } : { kind: "para" as const, text: l };
    })
    .filter((b) => b.text);
}

/* ------------------------------------------------------------------ */
/* What actually gets printed                                          */
/* ------------------------------------------------------------------ */

const filled = (o: object, ignore: string[] = ["id", "current", "level"]) =>
  Object.entries(o).some(([k, v]) => !ignore.includes(k) && typeof v === "string" && v.trim() !== "");

/** The CV with blank items removed, ready for a template. */
export function printable(cv: CV) {
  return {
    personal: cv.personal,
    summary: clean(cv.summary),
    experience: cv.experience.filter((x) => filled(x)),
    education: cv.education.filter((x) => filled(x)),
    projects: cv.projects.filter((x) => filled(x)),
    skills: cv.skills.filter((x) => clean(x.name)),
    languages: cv.languages.filter((x) => clean(x.name)),
    certificates: cv.certificates.filter((x) => filled(x)),
  };
}

export function isEmptyCv(cv: CV): boolean {
  const p = printable(cv);
  return (
    !filled(cv.personal, ["photo"]) &&
    !cv.personal.photo &&
    !p.summary &&
    p.experience.length + p.education.length + p.projects.length + p.skills.length + p.languages.length + p.certificates.length === 0
  );
}

export function labelsFor(lang: Lang): CvLabels {
  return LABELS[lang];
}

export function fileName(doc: CvDoc): string {
  const name = clean(doc.cv.personal.fullName)
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_");
  const suffix = LABELS[doc.lang].cv;
  return `${name ? `${name}_` : ""}${suffix}.pdf`;
}

/* ------------------------------------------------------------------ */
/* Loading saved data safely                                           */
/* ------------------------------------------------------------------ */

const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object") : [];

/** Accepts anything (e.g. old or hand-edited localStorage) and returns a valid document. */
export function normalizeDoc(raw: unknown): CvDoc {
  const base = emptyDoc();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const c = (r.cv && typeof r.cv === "object" ? r.cv : {}) as Record<string, unknown>;
  const p = (c.personal && typeof c.personal === "object" ? c.personal : {}) as Record<string, unknown>;
  const id = (v: unknown) => (typeof v === "string" && v ? v : newId());
  const photo = typeof p.photo === "string" && p.photo.startsWith("data:image/") ? p.photo : null;

  return {
    template: TEMPLATES.includes(r.template as never) ? (r.template as CvDoc["template"]) : base.template,
    lang: LANGS.includes(r.lang as never) ? (r.lang as Lang) : base.lang,
    cv: {
      personal: {
        fullName: str(p.fullName),
        jobTitle: str(p.jobTitle),
        phone: str(p.phone),
        email: str(p.email),
        city: str(p.city),
        telegram: str(p.telegram),
        linkedin: str(p.linkedin),
        photo,
      },
      summary: str(c.summary),
      experience: arr(c.experience).map((x) => ({
        id: id(x.id),
        role: str(x.role),
        company: str(x.company),
        city: str(x.city),
        start: str(x.start),
        end: str(x.end),
        current: x.current === true,
        description: str(x.description),
      })),
      education: arr(c.education).map((x) => ({
        id: id(x.id),
        degree: str(x.degree),
        school: str(x.school),
        city: str(x.city),
        start: str(x.start),
        end: str(x.end),
        current: x.current === true,
        description: str(x.description),
      })),
      projects: arr(c.projects).map((x) => ({
        id: id(x.id),
        name: str(x.name),
        role: str(x.role),
        link: str(x.link),
        description: str(x.description),
      })),
      skills: arr(c.skills).map((x) => ({ id: id(x.id), name: str(x.name) })),
      languages: arr(c.languages).map((x) => ({
        id: id(x.id),
        name: str(x.name),
        level: LEVELS.includes(x.level as never) ? (x.level as (typeof LEVELS)[number]) : "b2",
      })),
      certificates: arr(c.certificates).map((x) => ({
        id: id(x.id),
        name: str(x.name),
        issuer: str(x.issuer),
        date: str(x.date),
        link: str(x.link),
      })),
    },
  };
}

export const STORAGE_KEY = "rezyume:v1";
