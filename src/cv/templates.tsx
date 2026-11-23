import type { ReactNode } from "react";
import { LABELS, type CvLabels } from "./i18n";
import { contacts, displayUrl, formatMonth, formatRange, hrefFor, parseText, printable, type Contact } from "./model";
import type { Primitives, Style } from "./primitives";
import type { CvDoc, LevelId } from "./types";

export const FONT = "CV Inter";

const NAVY = "#13265C";
const BLUE = "#2563EB";
const INK = "#1A2233";
const MUTED = "#5B6475";
const FAINT = "#8A93A6";
const RULE = "#D7DDE8";

/* ------------------------------------------------------------------ */
/* Data shaping shared by all templates                                */
/* ------------------------------------------------------------------ */

interface Entry {
  id: string;
  title: string;
  subtitle: string;
  dates: string;
  body: string;
  link?: { text: string; href: string };
}

interface Prepared {
  L: CvLabels;
  name: string;
  title: string;
  photo: string | null;
  contacts: Contact[];
  summary: string;
  experience: Entry[];
  education: Entry[];
  projects: Entry[];
  certificates: Entry[];
  skills: { id: string; name: string }[];
  languages: { id: string; name: string; level: LevelId; levelText: string }[];
}

const join = (parts: string[], sep = ", ") => parts.map((p) => p.trim()).filter(Boolean).join(sep);

function prepare(doc: CvDoc): Prepared {
  const L = LABELS[doc.lang];
  const cv = printable(doc.cv);
  const p = cv.personal;
  return {
    L,
    name: p.fullName.trim(),
    title: p.jobTitle.trim(),
    photo: p.photo,
    contacts: contacts(p, L),
    summary: cv.summary,
    experience: cv.experience.map((x) => ({
      id: x.id,
      title: x.role.trim(),
      subtitle: join([x.company, x.city]),
      dates: formatRange(x.start, x.end, x.current, L),
      body: x.description,
    })),
    education: cv.education.map((x) => ({
      id: x.id,
      title: x.degree.trim(),
      subtitle: join([x.school, x.city]),
      dates: formatRange(x.start, x.end, x.current, L),
      body: x.description,
    })),
    projects: cv.projects.map((x) => ({
      id: x.id,
      title: x.name.trim(),
      subtitle: x.role.trim(),
      dates: "",
      body: x.description,
      link: x.link.trim() ? { text: displayUrl(x.link), href: hrefFor(x.link) } : undefined,
    })),
    certificates: cv.certificates.map((x) => ({
      id: x.id,
      title: x.name.trim(),
      subtitle: x.issuer.trim(),
      dates: formatMonth(x.date, L),
      body: "",
      link: x.link.trim() ? { text: displayUrl(x.link), href: hrefFor(x.link) } : undefined,
    })),
    skills: cv.skills.map((s) => ({ id: s.id, name: s.name.trim() })),
    languages: cv.languages.map((l) => ({ id: l.id, name: l.name.trim(), level: l.level, levelText: L.levels[l.level] })),
  };
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

interface EntryStyles {
  entry: Style;
  head: Style;
  title: Style;
  dates: Style;
  subtitle: Style;
  link: Style;
  body: Style;
  bullet: Style;
}

function Body({ text, s, P }: { text: string; s: EntryStyles; P: Primitives }) {
  const { View, Text } = P;
  const blocks = parseText(text);
  if (!blocks.length) return null;
  return (
    <View style={s.body}>
      {blocks.map((b, i) =>
        b.kind === "bullet" ? (
          <View key={i} style={{ flexDirection: "row", marginTop: i ? 1.5 : 0 }}>
            <Text style={s.bullet}>{"•"}</Text>
            <Text style={{ flex: 1 }}>{b.text}</Text>
          </View>
        ) : (
          <Text key={i} style={{ marginTop: i ? 2.5 : 0 }}>
            {b.text}
          </Text>
        ),
      )}
    </View>
  );
}

function Entries({ items, s, P }: { items: Entry[]; s: EntryStyles; P: Primitives }) {
  const { View, Text, Link } = P;
  return (
    <>
      {items.map((e, i) => (
        <View key={e.id} style={[s.entry, i === items.length - 1 ? { marginBottom: 0 } : undefined]} wrap={false}>
          {(e.title || e.dates) && (
            <View style={s.head}>
              <Text style={s.title}>{e.title}</Text>
              {e.dates ? <Text style={s.dates}>{e.dates}</Text> : null}
            </View>
          )}
          {(e.subtitle || e.link) && (
            // Separate runs in a wrapping row: react-pdf inserts a stray hyphen
            // when a line breaks right after an inline "·" separator.
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {e.subtitle ? <Text style={[s.subtitle, e.link ? { marginRight: 10 } : undefined]}>{e.subtitle}</Text> : null}
              {e.link ? (
                <Text style={s.subtitle}>
                  <Link src={e.link.href} style={s.link}>
                    {e.link.text}
                  </Link>
                </Text>
              ) : null}
            </View>
          )}
          <Body text={e.body} s={s} P={P} />
        </View>
      ))}
    </>
  );
}

/** Contact details as separate items in a wrapping row, spaced rather than dot-separated. */
function ContactLine({ items, P, style, linkStyle }: { items: Contact[]; P: Primitives; style: Style; linkStyle: Style }) {
  const { View, Text, Link } = P;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", ...style }}>
      {items.map((c) => (
        <Text key={c.key} style={{ marginRight: 14 }}>
          {c.href ? (
            <Link src={c.href} style={linkStyle}>
              {c.value}
            </Link>
          ) : (
            c.value
          )}
        </Text>
      ))}
    </View>
  );
}

type SectionKey = "summary" | "experience" | "education" | "projects" | "skills" | "languages" | "certificates";
const ORDER: SectionKey[] = ["summary", "experience", "education", "projects", "skills", "languages", "certificates"];

function hasSection(d: Prepared, key: SectionKey): boolean {
  return key === "summary" ? !!d.summary : d[key].length > 0;
}

/* ------------------------------------------------------------------ */
/* Classic                                                             */
/* ------------------------------------------------------------------ */

const classic = {
  page: { fontFamily: FONT, fontSize: 9.6, color: INK, lineHeight: 1.42, paddingTop: 38, paddingBottom: 34, paddingHorizontal: 48 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  photo: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  name: { fontSize: 23, fontWeight: 700, color: NAVY, lineHeight: 1.15, letterSpacing: -0.2 },
  title: { fontSize: 11, fontWeight: 500, color: BLUE, marginTop: 3 },
  contacts: { fontSize: 8.6, color: MUTED, marginTop: 7, lineHeight: 1.5 },
  link: { color: MUTED, textDecoration: "none" },
  section: { marginTop: 12 },
  headingWrap: { borderBottomWidth: 0.8, borderBottomColor: RULE, borderBottomStyle: "solid", paddingBottom: 3.5, marginBottom: 7 },
  heading: { fontSize: 9, fontWeight: 700, color: NAVY, letterSpacing: 0.4, textTransform: "uppercase" },
  entries: {
    entry: { marginBottom: 8 },
    head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    title: { flex: 1, fontSize: 10, fontWeight: 600, color: INK, paddingRight: 10 },
    dates: { fontSize: 8.6, color: MUTED, flexShrink: 0, paddingTop: 1 },
    subtitle: { fontSize: 9.2, color: MUTED, marginTop: 0.5 },
    link: { color: BLUE, textDecoration: "none" },
    body: { marginTop: 3 },
    bullet: { width: 10, color: FAINT },
  },
} satisfies Record<string, Style | EntryStyles>;

function Classic({ d, P }: { d: Prepared; P: Primitives }) {
  const { Page, View, Text, Image } = P;
  const s = classic;

  const section = (key: SectionKey, title: string, content: ReactNode) => (
    <View key={key} style={s.section}>
      <View style={s.headingWrap} minPresenceAhead={40}>
        <Text style={s.heading}>{title}</Text>
      </View>
      {content}
    </View>
  );

  const render: Record<SectionKey, () => ReactNode> = {
    summary: () => section("summary", d.L.summary, <Body text={d.summary} s={s.entries} P={P} />),
    experience: () => section("experience", d.L.experience, <Entries items={d.experience} s={s.entries} P={P} />),
    education: () => section("education", d.L.education, <Entries items={d.education} s={s.entries} P={P} />),
    projects: () => section("projects", d.L.projects, <Entries items={d.projects} s={s.entries} P={P} />),
    certificates: () => section("certificates", d.L.certificates, <Entries items={d.certificates} s={s.entries} P={P} />),
    skills: () => section("skills", d.L.skills, <Text>{d.skills.map((x) => x.name).join(", ")}</Text>),
    languages: () =>
      section(
        "languages",
        d.L.languages,
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {d.languages.map((l) => (
            <Text key={l.id} style={{ width: "50%", marginBottom: 2 }}>
              <Text style={{ fontWeight: 600 }}>{l.name}</Text>
              <Text style={{ color: MUTED }}>{` — ${l.levelText}`}</Text>
            </Text>
          ))}
        </View>,
      ),
  };

  return (
    <Page style={s.page}>
      {(d.name || d.title || d.contacts.length > 0 || d.photo) && (
        <View style={s.header}>
          {d.photo ? <Image src={d.photo} style={s.photo} /> : null}
          <View style={{ flex: 1 }}>
            {d.name ? <Text style={s.name}>{d.name}</Text> : null}
            {d.title ? <Text style={s.title}>{d.title}</Text> : null}
            {d.contacts.length > 0 && <ContactLine items={d.contacts} P={P} style={s.contacts} linkStyle={s.link} />}
          </View>
        </View>
      )}
      {ORDER.filter((k) => hasSection(d, k)).map((k) => render[k]())}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Modern                                                              */
/* ------------------------------------------------------------------ */

const PAD_X = 44;
const PAD_Y = 36;

const modern = {
  page: { fontFamily: FONT, fontSize: 9.5, color: INK, lineHeight: 1.42, paddingTop: PAD_Y, paddingBottom: PAD_Y, paddingHorizontal: PAD_X },
  band: {
    marginTop: -PAD_Y,
    marginHorizontal: -PAD_X,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: PAD_X,
    backgroundColor: NAVY,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  photo: { width: 72, height: 72, borderRadius: 36, marginRight: 18, borderWidth: 2, borderColor: "#FFFFFF", borderStyle: "solid" },
  name: { fontSize: 25, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15, letterSpacing: -0.3 },
  title: { fontSize: 11.5, fontWeight: 500, color: "#A9C1FF", marginTop: 3 },
  contacts: { fontSize: 8.6, color: "#D3DDF5", marginTop: 9, lineHeight: 1.5 },
  link: { color: "#D3DDF5", textDecoration: "none" },
  section: { marginTop: 12 },
  headingRow: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  bar: { width: 3, height: 12, backgroundColor: BLUE, borderRadius: 1, marginRight: 7 },
  heading: { fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: -0.1 },
  chip: {
    fontSize: 8.6,
    color: NAVY,
    backgroundColor: "#EEF3FF",
    borderWidth: 0.75,
    borderColor: "#C9D7F7",
    borderStyle: "solid",
    borderRadius: 3,
    paddingVertical: 2.5,
    paddingHorizontal: 7,
    marginRight: 5,
    marginBottom: 5,
  },
  entries: {
    entry: { marginBottom: 8 },
    head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    title: { flex: 1, fontSize: 10, fontWeight: 600, color: INK, paddingRight: 10 },
    dates: { fontSize: 8.6, color: MUTED, flexShrink: 0, paddingTop: 1 },
    subtitle: { fontSize: 9.2, fontWeight: 500, color: BLUE, marginTop: 0.5 },
    link: { color: BLUE, textDecoration: "none" },
    body: { marginTop: 3, color: "#2B3547" },
    bullet: { width: 10, color: BLUE },
  },
} satisfies Record<string, Style | EntryStyles>;

const LEVEL_DOTS: Record<LevelId, number> = { native: 5, c2: 5, c1: 4, b2: 3, b1: 2, a2: 1, a1: 1 };

function Modern({ d, P }: { d: Prepared; P: Primitives }) {
  const { Page, View, Text, Image } = P;
  const s = modern;

  const section = (key: SectionKey, title: string, content: ReactNode) => (
    <View key={key} style={s.section}>
      <View style={s.headingRow} minPresenceAhead={40}>
        <View style={s.bar} />
        <Text style={s.heading}>{title}</Text>
      </View>
      {content}
    </View>
  );

  const render: Record<SectionKey, () => ReactNode> = {
    summary: () => section("summary", d.L.summary, <Body text={d.summary} s={s.entries} P={P} />),
    experience: () => section("experience", d.L.experience, <Entries items={d.experience} s={s.entries} P={P} />),
    education: () => section("education", d.L.education, <Entries items={d.education} s={s.entries} P={P} />),
    projects: () => section("projects", d.L.projects, <Entries items={d.projects} s={s.entries} P={P} />),
    certificates: () => section("certificates", d.L.certificates, <Entries items={d.certificates} s={s.entries} P={P} />),
    skills: () =>
      section(
        "skills",
        d.L.skills,
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: -5 }}>
          {d.skills.map((x) => (
            <Text key={x.id} style={s.chip}>
              {x.name}
            </Text>
          ))}
        </View>,
      ),
    languages: () =>
      section(
        "languages",
        d.L.languages,
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {d.languages.map((l) => (
            <View key={l.id} style={{ width: "33.33%", paddingRight: 16, marginBottom: 6 }} wrap={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: 600, flex: 1 }}>{l.name}</Text>
                <View style={{ flexDirection: "row" }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: 9,
                        height: 3,
                        borderRadius: 1.5,
                        marginLeft: 2,
                        backgroundColor: i < LEVEL_DOTS[l.level] ? BLUE : "#DCE3F0",
                      }}
                    />
                  ))}
                </View>
              </View>
              <Text style={{ color: MUTED, fontSize: 8.6 }}>{l.levelText}</Text>
            </View>
          ))}
        </View>,
      ),
  };

  return (
    <Page style={s.page}>
      <View style={s.band}>
        {d.photo ? <Image src={d.photo} style={s.photo} /> : null}
        <View style={{ flex: 1 }}>
          {d.name ? <Text style={s.name}>{d.name}</Text> : null}
          {d.title ? <Text style={s.title}>{d.title}</Text> : null}
          {d.contacts.length > 0 && <ContactLine items={d.contacts} P={P} style={s.contacts} linkStyle={s.link} />}
        </View>
      </View>
      {ORDER.filter((k) => hasSection(d, k)).map((k) => render[k]())}
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/* Minimal                                                             */
/* ------------------------------------------------------------------ */

const minimal = {
  page: { fontFamily: FONT, fontSize: 9.4, color: INK, lineHeight: 1.45, paddingTop: 44, paddingBottom: 38, paddingHorizontal: 46 },
  name: { fontSize: 22, fontWeight: 500, color: INK, lineHeight: 1.15, letterSpacing: -0.3 },
  title: { fontSize: 10.5, color: MUTED, marginTop: 4 },
  photo: { width: 58, height: 58, borderRadius: 4, marginLeft: 16 },
  contactGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 14 },
  contactCell: { marginRight: 22, marginBottom: 7, maxWidth: "100%" },
  contactLabel: { fontSize: 7, fontWeight: 600, color: FAINT, letterSpacing: 0.3, textTransform: "uppercase", lineHeight: 1.3 },
  contactValue: { fontSize: 8.8, color: INK, textDecoration: "none" },
  section: {
    flexDirection: "row",
    borderTopWidth: 0.6,
    borderTopColor: "#E3E7EE",
    borderTopStyle: "solid",
    paddingTop: 10,
    marginTop: 10,
  },
  heading: {
    width: 92,
    flexShrink: 0,
    paddingRight: 10,
    paddingTop: 1.6,
    fontSize: 7.4,
    fontWeight: 600,
    color: FAINT,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    lineHeight: 1.35,
  },
  entries: {
    entry: { marginBottom: 8 },
    head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    title: { flex: 1, fontSize: 9.8, fontWeight: 600, color: INK, paddingRight: 10 },
    dates: { fontSize: 8.4, color: FAINT, flexShrink: 0, paddingTop: 1 },
    subtitle: { fontSize: 9, color: MUTED },
    link: { color: MUTED, textDecoration: "none" },
    body: { marginTop: 3, color: "#333B4D" },
    bullet: { width: 9, color: FAINT },
  },
} satisfies Record<string, Style | EntryStyles>;

function Minimal({ d, P }: { d: Prepared; P: Primitives }) {
  const { Page, View, Text, Image, Link } = P;
  const s = minimal;

  const section = (key: SectionKey, title: string, content: ReactNode) => (
    <View key={key} style={s.section} wrap={key !== "experience" && key !== "projects" ? false : undefined}>
      <Text style={s.heading} minPresenceAhead={40}>
        {title}
      </Text>
      <View style={{ flex: 1 }}>{content}</View>
    </View>
  );

  const render: Record<SectionKey, () => ReactNode> = {
    summary: () => section("summary", d.L.summary, <Body text={d.summary} s={s.entries} P={P} />),
    experience: () => section("experience", d.L.experience, <Entries items={d.experience} s={s.entries} P={P} />),
    education: () => section("education", d.L.education, <Entries items={d.education} s={s.entries} P={P} />),
    projects: () => section("projects", d.L.projects, <Entries items={d.projects} s={s.entries} P={P} />),
    certificates: () => section("certificates", d.L.certificates, <Entries items={d.certificates} s={s.entries} P={P} />),
    skills: () => section("skills", d.L.skills, <Text>{d.skills.map((x) => x.name).join(", ")}</Text>),
    languages: () =>
      section(
        "languages",
        d.L.languages,
        <View>
          {d.languages.map((l) => (
            <Text key={l.id} style={{ marginBottom: 1.5 }}>
              <Text style={{ fontWeight: 600 }}>{l.name}</Text>
              <Text style={{ color: MUTED }}>{`  ${l.levelText}`}</Text>
            </Text>
          ))}
        </View>,
      ),
  };

  return (
    <Page style={s.page}>
      {(d.name || d.title || d.photo) && (
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            {d.name ? <Text style={s.name}>{d.name}</Text> : null}
            {d.title ? <Text style={s.title}>{d.title}</Text> : null}
          </View>
          {d.photo ? <Image src={d.photo} style={s.photo} /> : null}
        </View>
      )}
      {d.contacts.length > 0 && (
        <View style={s.contactGrid}>
          {d.contacts.map((c) => (
            <View key={c.key} style={s.contactCell}>
              <Text style={s.contactLabel}>{c.label}</Text>
              {c.href ? (
                <Link src={c.href} style={s.contactValue}>
                  {c.value}
                </Link>
              ) : (
                <Text style={s.contactValue}>{c.value}</Text>
              )}
            </View>
          ))}
        </View>
      )}
      {ORDER.filter((k) => hasSection(d, k)).map((k) => render[k]())}
    </Page>
  );
}

/* ------------------------------------------------------------------ */

export function CvTemplate({ doc, P }: { doc: CvDoc; P: Primitives }) {
  const d = prepare(doc);
  switch (doc.template) {
    case "modern":
      return <Modern d={d} P={P} />;
    case "minimal":
      return <Minimal d={d} P={P} />;
    default:
      return <Classic d={d} P={P} />;
  }
}

export function documentTitle(doc: CvDoc): string {
  const L = LABELS[doc.lang];
  const name = doc.cv.personal.fullName.trim();
  return name ? `${name} — ${L.cv}` : L.cv;
}
