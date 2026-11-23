import { Document, Font, Image, Link, Page, Text, View, pdf } from "@react-pdf/renderer";
import type { ComponentProps } from "react";
import { LABELS } from "./i18n";
import type { Primitives } from "./primitives";
import { CvTemplate, FONT, documentTitle } from "./templates";
import type { CvDoc } from "./types";

type PdfStyle = ComponentProps<typeof View>["style"];

/** react-pdf implementations of the template primitives. */
const pdfPrimitives: Primitives = {
  Page: ({ style, children }) => (
    <Page size="A4" style={style as PdfStyle}>
      {children}
    </Page>
  ),
  View: ({ style, children, wrap, minPresenceAhead }) => (
    <View style={style as PdfStyle} wrap={wrap} minPresenceAhead={minPresenceAhead}>
      {children}
    </View>
  ),
  Text: ({ style, children, minPresenceAhead }) => (
    <Text style={style as PdfStyle} minPresenceAhead={minPresenceAhead}>
      {children}
    </Text>
  ),
  Link: ({ src, style, children }) => (
    <Link src={src} style={style as PdfStyle}>
      {children}
    </Link>
  ),
  Image: ({ src, style }) => <Image src={src} style={style as PdfStyle} />,
};

/**
 * Registers Inter (Latin, Cyrillic, and the Uzbek ʻ / ʼ letters) for the PDF.
 * `base` is a URL prefix in the browser or a folder path in Node.
 *
 * Call this before every render. fontkit caches glyph objects per font, and
 * when a finished PDF is subset, composite glyphs (in Inter, the comma is built
 * from the apostrophe) put their components in that cache without character
 * mappings. A second PDF made with the same font objects can then lose
 * characters such as ʼ from its text layer and break lines in the wrong place.
 * Dropping and re-registering the family gives each PDF fresh font instances.
 * (Font.clear() would also remove react-pdf's built-in fonts, and Font.reset()
 * does not force a reload, so only our family is removed.)
 */
export function registerFonts(base: string) {
  delete (Font.getRegisteredFonts() as Record<string, unknown>)[FONT];
  Font.register({
    family: FONT,
    fonts: [
      { src: `${base}/Inter-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/Inter-Medium.ttf`, fontWeight: 500 },
      { src: `${base}/Inter-SemiBold.ttf`, fontWeight: 600 },
      { src: `${base}/Inter-Bold.ttf`, fontWeight: 700 },
    ],
  });
  // Never split words with automatic hyphens: CVs read better without them.
  Font.registerHyphenationCallback((word) => [word]);
}

export function CvPdfDocument({ doc }: { doc: CvDoc }) {
  const name = doc.cv.personal.fullName.trim();
  return (
    <Document
      title={documentTitle(doc)}
      author={name || undefined}
      subject={doc.cv.personal.jobTitle.trim() || undefined}
      creator="Rezyume"
      producer="Rezyume"
      language={LABELS[doc.lang].locale}
    >
      <CvTemplate doc={doc} P={pdfPrimitives} />
    </Document>
  );
}

/** Browser: render the CV to a PDF blob. */
export async function renderPdfBlob(doc: CvDoc, fontBase: string): Promise<Blob> {
  registerFonts(fontBase);
  return pdf(<CvPdfDocument doc={doc} />).toBlob();
}
