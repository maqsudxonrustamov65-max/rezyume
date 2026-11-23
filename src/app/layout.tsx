import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rezyume | CV builder",
  description:
    "Build a clean, professional CV with a live A4 preview, three templates, English, Uzbek and Russian labels, and an ATS-friendly PDF download.",
  applicationName: "Rezyume",
  openGraph: {
    title: "Rezyume",
    description: "A free CV builder with live preview and ATS-friendly PDF export in English, Oʻzbekcha and Русский.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
