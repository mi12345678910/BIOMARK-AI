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

export interface OcrOutcome extends OcrResult {
  /** Set when this particular image failed; the others still return. */
  error?: string;
}

/**
 * Recognises a batch of images.
 *
 * ONE worker, reused across every image, processed one at a time.
 *
 * The previous version ran `Promise.all` over `recogniseImage`, which spawned
 * a separate worker per photo. Each carries its own ~15 MB WebAssembly heap
 * and fetches the language data, so two or more attachments reliably fell over
 * — the user saw a crash instead of their pages. Sequential reuse also avoids
 * re-downloading the traineddata for every image, which makes a multi-page
 * submission markedly faster.
 *
 * Failures are per-image: one unreadable photo returns an error for itself
 * while every other page still comes back. `Promise.all` rejected the whole
 * batch on the first failure and threw away work that had already succeeded.
 */
export async function recogniseImages(
  items: { file: File | Blob; name: string }[],
  onProgress?: (p: OcrProgress) => void,
): Promise<OcrOutcome[]> {
  if (items.length === 0) return [];

  const { createWorker } = await import("tesseract.js");

  let current = items[0]!.name;
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) =>
      onProgress?.({
        file: current,
        status: m.status,
        progress: typeof m.progress === "number" ? m.progress : null,
      }),
  });

  const out: OcrOutcome[] = [];
  try {
    for (const item of items) {
      current = item.name;
      try {
        const { data } = await worker.recognize(item.file);
        out.push({
          file: item.name,
          text: (data.text ?? "").replace(/\s+\n/g, "\n").trim(),
          confidence: data.confidence ?? 0,
        });
      } catch (err) {
        out.push({
          file: item.name,
          text: "",
          confidence: 0,
          error: (err as Error).message || "could not be read",
        });
      }
    }
  } finally {
    // Always terminate: a leaked worker keeps a WebAssembly heap alive.
    await worker.terminate();
  }

  return out;
}

/** Single-image convenience wrapper. */
export async function recogniseImage(
  file: File | Blob,
  fileName: string,
  onProgress?: (p: OcrProgress) => void,
): Promise<OcrResult> {
  const [only] = await recogniseImages([{ file, name: fileName }], onProgress);
  if (!only) throw new Error("No result returned.");
  if (only.error) throw new Error(only.error);
  return only;
}

/** Confidence below this is unreliable enough to warn the student about. */
export const LOW_CONFIDENCE = 70;
