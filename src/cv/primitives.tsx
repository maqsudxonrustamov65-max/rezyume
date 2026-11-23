"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";

/**
 * The CV templates are written once against these primitives and rendered
 * twice: as HTML for the live preview and with @react-pdf/renderer for the PDF.
 * Styles use react-pdf conventions: numbers are points, flexbox layout,
 * views stack vertically by default.
 */
export type Style = Record<string, string | number | undefined>;
export type StyleProp = Style | (Style | false | null | undefined)[] | undefined;

export interface ViewProps {
  style?: StyleProp;
  children?: ReactNode;
  wrap?: boolean;
  minPresenceAhead?: number;
}

export interface TextProps {
  style?: StyleProp;
  children?: ReactNode;
  minPresenceAhead?: number;
}

export interface LinkProps {
  src: string;
  style?: StyleProp;
  children?: ReactNode;
}

export interface ImageProps {
  src: string;
  style?: StyleProp;
}

export interface PageProps {
  style?: StyleProp;
  children?: ReactNode;
}

export interface Primitives {
  Page: (p: PageProps) => ReactNode;
  View: (p: ViewProps) => ReactNode;
  Text: (p: TextProps) => ReactNode;
  Link: (p: LinkProps) => ReactNode;
  Image: (p: ImageProps) => ReactNode;
}

/* ------------------------------------------------------------------ */
/* HTML implementation                                                 */
/* ------------------------------------------------------------------ */

/** A4 in points. */
export const A4 = { width: 595.28, height: 841.89 };

const LENGTH_KEYS = new Set([
  "fontSize",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "top",
  "left",
  "right",
  "bottom",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRadius",
  "letterSpacing",
  "flexBasis",
]);

function flatten(style: StyleProp): Style {
  if (!style) return {};
  if (!Array.isArray(style)) return style;
  return Object.assign({}, ...style.filter(Boolean));
}

/** Convert react-pdf style conventions to CSS. */
export function toCss(style: StyleProp): CSSProperties {
  const s = flatten(style);
  const css: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(s)) {
    if (value === undefined) continue;
    const v = typeof value === "number" && LENGTH_KEYS.has(key) ? `${value}pt` : value;
    if (key === "marginHorizontal") {
      css.marginLeft = css.marginRight = typeof value === "number" ? `${value}pt` : value;
    } else if (key === "marginVertical") {
      css.marginTop = css.marginBottom = typeof value === "number" ? `${value}pt` : value;
    } else if (key === "paddingHorizontal") {
      css.paddingLeft = css.paddingRight = typeof value === "number" ? `${value}pt` : value;
    } else if (key === "paddingVertical") {
      css.paddingTop = css.paddingBottom = typeof value === "number" ? `${value}pt` : value;
    } else if (key === "fontFamily") {
      css.fontFamily = `"${value}", sans-serif`;
    } else {
      css[key] = v;
    }
  }
  return css as CSSProperties;
}

const InText = createContext(false);

function HtmlView({ style, children }: ViewProps) {
  return <div style={{ display: "flex", flexDirection: "column", minWidth: 0, ...toCss(style) }}>{children}</div>;
}

function HtmlText({ style, children }: TextProps) {
  const nested = useContext(InText);
  const css = toCss(style);
  if (nested) return <span style={css}>{children}</span>;
  return (
    <InText.Provider value={true}>
      <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", ...css }}>{children}</div>
    </InText.Provider>
  );
}

function HtmlLink({ src, style, children }: LinkProps) {
  const nested = useContext(InText);
  const a = (
    <a href={src} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none", ...toCss(style) }}>
      {children}
    </a>
  );
  return nested ? a : <InText.Provider value={true}>{a}</InText.Provider>;
}

function HtmlImage({ src, style }: ImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" style={{ display: "block", objectFit: "cover", ...toCss(style) }} />;
}

function HtmlPage({ style, children }: PageProps) {
  return (
    <div
      className="cv-page"
      style={{
        position: "relative",
        width: `${A4.width}pt`,
        minHeight: `${A4.height}pt`,
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        ...toCss(style),
      }}
    >
      {children}
    </div>
  );
}

export const htmlPrimitives: Primitives = {
  Page: HtmlPage,
  View: HtmlView,
  Text: HtmlText,
  Link: HtmlLink,
  Image: HtmlImage,
};
