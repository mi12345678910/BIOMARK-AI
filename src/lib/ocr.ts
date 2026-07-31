/**
 * Optical character recognition for uploaded photos.
 *
 * Runs entirely in the browser via tesseract.js — no API key and no server.
 * The text it extracts is fed into exactly the same routing as typed input:
 * matched against the marking-scheme bank, or used to search lecturer notes.
 *
 * ── WHAT TO EXPECT ──────────────────────────────────────────────────────────
 * Tesseract is an OCR engine, not a handwriting model. In practice:
 *
 *   • Photographs of PRINTED text (a question paper, a textbook page,
 *     a typed answer) read well.
 *   • NEAT block capitals read passably.
 *   • Ordinary joined-up handwriting reads poorly, often badly enough that
 *     keyword matching fails and the student is under-marked.
 *
 * Because of that the UI always shows the extracted text back to the student
 * before it is used, so a bad read is visible rather than silently costing
 * marks. Never present an OCR result as if it were certain.
 *
 * The engine downloads its language data (~15 MB) from a CDN on first use and
 * caches it, so the very first scan needs a network connection.
 */

export interface OcrProgress {
  file: string;
  status: string;
  /** 0–1, or null while the stage has no measurable progress. */
  progress: number | null;
}

export interface OcrResult {
  file: string;
  text: string;
  /** Tesseract's own 0–100 confidence for the page. */
  confidence: number;
}

/**
 * Recognises one image. Imported lazily so the ~2 MB worker bundle is only
 * fetched when a student actually attaches a photo.
 */
export async function recogniseImage(
  file: File | Blob,
  fileName: string,
  onProgress?: (p: OcrProgress) => void,
): Promise<OcrResult> {
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) =>
      onProgress?.({
        file: fileName,
        status: m.status,
        progress: typeof m.progress === "number" ? m.progress : null,
      }),
  });

  try {
    const { data } = await worker.recognize(file);
    return {
      file: fileName,
      text: (data.text ?? "").replace(/\s+\n/g, "\n").trim(),
      confidence: data.confidence ?? 0,
    };
  } finally {
    // Always terminate: a leaked worker keeps a WebAssembly heap alive.
    await worker.terminate();
  }
}

/** Confidence below this is unreliable enough to warn the student about. */
export const LOW_CONFIDENCE = 70;
