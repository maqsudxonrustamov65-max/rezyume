# Rezyume

A free CV builder that runs entirely in the browser. Fill in a form, watch a live A4 preview update as you type, switch between three templates and three CV languages, and download a clean PDF that applicant tracking systems can read.

**Live app: https://rezyume-hazel.vercel.app**

Built with Next.js, TypeScript, Tailwind CSS and [@react-pdf/renderer](https://react-pdf.org). There is no backend and no account; your CV is saved in your browser's localStorage.

## Features

- **Split screen editor**: form on the left, live A4 preview on the right. On phones, switch between **Edit** and **Preview** tabs.
- **Sections**: personal details (with an optional photo), summary, experience, education, projects, skills, languages with levels, and certificates.
- **Drag to reorder** items within any section (using the handle on each item, or long-press a skill chip on touch screens). Removing an item can be undone.
- **Three templates**: Classic, Modern and Minimal, switchable instantly.
- **CV language**: English, Oʻzbekcha or Русский. Changes every heading, label, month name, language level and "Present".
- **Fill example** loads a realistic sample CV in the selected language.
- **Auto-save** to localStorage, so nothing is lost on refresh.
- **PDF export** with real, selectable text. Inter is embedded with full Latin and Cyrillic coverage, including the Uzbek letters oʻ, gʻ (U+02BB) and the tutuq belgisi ʼ (U+02BC).

## How it works

The three templates are written once (`src/cv/templates.tsx`) against a tiny set of primitives (Page, View, Text, Link, Image). The live preview renders them as HTML (`src/cv/primitives.tsx`) and the download renders them with react-pdf (`src/cv/pdf.tsx`), so the preview and the PDF share one layout. Both use the same Inter font files from `public/fonts`.

## Running it

Requires Node.js 22.18 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run test:pdf   # renders all 9 template x language PDFs and checks their text
npm run typecheck
npm run build
```

`npm run test:pdf` writes the PDFs to `test-output/` and checks that each one has selectable text with every localized heading, Cyrillic and Uzbek characters intact, Inter embedded (no fallback font), the photo included, and the example fitting on one page.

## Deploying to Vercel

Import the repository in Vercel. It is detected as a Next.js app; no environment variables or settings are needed.

## Fonts

Inter is licensed under the SIL Open Font License; see `public/fonts/OFL.txt`.
