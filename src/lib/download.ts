import { fileName } from "@/cv/model";
import type { CvDoc } from "@/cv/types";

/** Loads the PDF renderer on demand (it is large) so the editor opens fast. */
export const loadPdfModule = () => import("@/cv/pdf");

export async function downloadPdf(doc: CvDoc): Promise<void> {
  const { renderPdfBlob } = await loadPdfModule();
  const blob = await renderPdfBlob(doc, `${window.location.origin}/fonts`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName(doc);
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
