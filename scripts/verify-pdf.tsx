/**
 * Renders the example CV to PDF in every template and language, then extracts
 * the text back out with pdf.js to prove it is real, selectable text with the
 * right characters (Cyrillic, Uzbek oʻ / gʻ) and the right headings.
 *
 *   npm run test:pdf        → writes test-output/*.pdf and prints a report
 */
import fs from "node:fs";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { LABELS } from "../src/cv/i18n";
import { CvPdfDocument, registerFonts } from "../src/cv/pdf";
import { newId } from "../src/cv/model";
import { sampleCv } from "../src/cv/samples";
import { testPhoto } from "./test-photo";
import { LANGS, TEMPLATES, type CvDoc, type Lang } from "../src/cv/types";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "test-output");
fs.mkdirSync(outDir, { recursive: true });
const fontDir = path.join(root, "public", "fonts");

async function extractText(buf: Buffer): Promise<{ text: string; pages: number }> {
  const pdfDoc = await getDocument({ data: new Uint8Array(buf), disableFontFace: true, useSystemFonts: false }).promise;
  let text = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if ("str" in item) text += item.str + (item.hasEOL ? "\n" : " ");
    }
  }
  return { text, pages: pdfDoc.numPages };
}

const norm = (s: string) => s.replace(/\s+/g, " ").toLocaleLowerCase();

/** Phrases that must survive the round trip, per language. */
function expectations(lang: Lang): string[] {
  const L = LABELS[lang];
  const common = [
    L.summary,
    L.experience,
    L.education,
    L.projects,
    L.skills,
    L.languages,
    L.certificates,
    L.levels.native,
    L.levels.c1,
    `${L.months[2]} 2022 – ${L.present}`,
    "t.me/aziza_codes",
    "aziza.karimova@example.com",
    "+998 90 123 45 67",
  ];
  const specific: Record<Lang, string[]> = {
    en: ["Aziza Karimova", "Senior Frontend Developer", "Tashkent, Uzbekistan"],
    // oʻ and gʻ use U+02BB, the tutuq belgisi uses U+02BC.
    uz: ["Aziza Karimova", "Katta frontend dasturchi", "Toshkent, Oʻzbekiston", "bogʻliq", "eʼtibor"],
    ru: ["Азиза Каримова", "Старший фронтенд-разработчик", "Ташкент, Узбекистан", "четырёх"],
  };
  return [...common, ...specific[lang]];
}

async function main() {
  const photo = testPhoto();
  const rows: string[] = [];
  let failures = 0;

  for (const template of TEMPLATES) {
    for (const lang of LANGS) {
      const cv = sampleCv(lang, newId);
      cv.personal.photo = photo;
      const doc: CvDoc = { cv, template, lang };

      registerFonts(fontDir); // fresh font instances for every PDF, as in the app
      const buf = await renderToBuffer(<CvPdfDocument doc={doc} />);
      const file = path.join(outDir, `cv-${template}-${lang}.pdf`);
      fs.writeFileSync(file, buf);

      const { text, pages } = await extractText(buf);
      const haystack = norm(text);
      const missing = expectations(lang).filter((p) => !haystack.includes(norm(p)));

      const raw = buf.toString("latin1");
      const embeddedInter = (raw.match(/\/BaseFont\s*\/[A-Z]{6}\+Inter[^\s/]*/g) ?? []).length;
      const helvetica = /\/BaseFont\s*\/Helvetica/.test(raw);
      const hasImage = /\/Subtype\s*\/Image/.test(raw);
      const replacement = text.includes("�");
      // react-pdf adds a hyphen when a line breaks after an inline "·"; templates avoid that.
      const strayHyphen = /·-/.test(text);

      const problems = [
        missing.length ? `missing text: ${missing.join(" | ")}` : "",
        embeddedInter === 0 ? "Inter is not embedded" : "",
        helvetica ? "falls back to Helvetica" : "",
        hasImage ? "" : "photo missing",
        replacement ? "contains U+FFFD replacement characters" : "",
        strayHyphen ? "stray hyphen after a separator" : "",
        // The example CV is meant to fit on one page in every template.
        pages !== 1 ? `example runs to ${pages} pages` : "",
      ].filter(Boolean);

      if (problems.length) failures++;
      rows.push(
        `${problems.length ? "FAIL" : "PASS"}  ${template.padEnd(8)} ${lang}  pages=${pages}  ` +
          `size=${(buf.length / 1024).toFixed(0)}KB  interFonts=${embeddedInter}  photo=${hasImage}` +
          problems.map((p) => `\n      ${p}`).join(""),
      );
      fs.writeFileSync(path.join(outDir, `cv-${template}-${lang}.txt`), text);
    }
  }

  console.log(rows.join("\n"));
  console.log(failures ? `\n${failures} of 9 failed` : "\nAll 9 PDFs passed.");
  process.exitCode = failures ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
