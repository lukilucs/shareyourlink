"use client";

type PdfJsGlobal = {
  GlobalWorkerOptions?: {
    workerSrc?: string;
  };
};

const PDF_WORKER_SRC = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function configurePdfWorker(): void {
  if (typeof window === "undefined") {
    return;
  }

  const pdfjsLib = (window as Window & { pdfjsLib?: PdfJsGlobal }).pdfjsLib;

  if (!pdfjsLib?.GlobalWorkerOptions) {
    return;
  }

  if (pdfjsLib.GlobalWorkerOptions.workerSrc !== PDF_WORKER_SRC) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  }
}
