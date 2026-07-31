"use client";

import { useEffect, useRef, useState } from "react";
import { AnimalCell, DnaHelix, PlantCell } from "@/components/BioArt";
import { useI18n } from "@/lib/i18n";
import { markQuestion, type QuestionResult } from "@/lib/marking";
import {
  findQuestionMatch,
  hasAttempt,
  searchNotes,
  selectRelevantParts,
  type NoteMatch,
  type QuestionMatch,
} from "@/lib/lookup";
import type { QuestionPart } from "@/lib/marking";
import { LOW_CONFIDENCE, recogniseImage } from "@/lib/ocr";

interface Attachment {
  id: string;
  name: string;
  size: number;
  /** Kept so the file can be handed to the OCR worker on submit. */
  file: File;
  /** Object URL for images; null for non-image files (PDF, docx). */
  preview: string | null;
  /** Filled in after OCR runs. */
  ocrText?: string;
  ocrConfidence?: number;
}

type Outcome =
  | { mode: "graded"; match: QuestionMatch; result: QuestionResult }
  /** Question submitted with no attempt — show how the marks are awarded. */
  | { mode: "modelAnswer"; match: QuestionMatch; parts: QuestionPart[] }
  | { mode: "explained"; notes: NoteMatch[] }
  | { mode: "ocrFailed"; message: string }
  | { mode: "empty" };

export default function GraderPage() {
  const { lang, t } = useI18n();

  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Object URLs leak until revoked; clear them when the component unmounts.
  useEffect(() => {
    return () => {
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const added: Attachment[] = Array.from(list).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((f) => [...f, ...added]);
  }

  function removeFile(id: string) {
    setFiles((f) => {
      const target = f.find((x) => x.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return f.filter((x) => x.id !== id);
    });
  }

  async function submit() {
    const images = files.filter((f) => f.preview);

    if (!text.trim() && images.length === 0) {
      setOutcome({ mode: "empty" });
      return;
    }

    // Read any attached photos first, so their text joins the submission.
    let scanned = files;
    if (images.length > 0) {
      setBusy(true);
      setOutcome(null);
      try {
        const results = await Promise.all(
          images.map(async (att) => {
            const r = await recogniseImage(att.file, att.name, (p) =>
              setProgress(
                `${p.file}: ${p.status}${
                  p.progress !== null ? ` ${Math.round(p.progress * 100)}%` : ""
                }`,
              ),
            );
            return { id: att.id, ...r };
          }),
        );
        scanned = files.map((f) => {
          const hit = results.find((r) => r.id === f.id);
          return hit
            ? { ...f, ocrText: hit.text, ocrConfidence: hit.confidence }
            : f;
        });
        setFiles(scanned);
      } catch (err) {
        setBusy(false);
        setProgress("");
        setOutcome({ mode: "ocrFailed", message: (err as Error).message });
        return;
      }
      setBusy(false);
      setProgress("");
    }

    // Typed text plus everything read out of the photos.
    const combined = [
      text.trim(),
      ...scanned.map((f) => f.ocrText ?? "").filter(Boolean),
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!combined.trim()) {
      setOutcome({ mode: "empty" });
      return;
    }

    const match = findQuestionMatch(combined);
    if (match) {
      // Mark ONLY the parts the student actually asked about. Marking every
      // part of the stored question scored them against work they never
      // attempted and made one answer look like several.
      const parts = selectRelevantParts(match.question, combined);

      // Question submitted with no attempt: marking it would report 0 for
      // every scheme point, which tells the student nothing. Show the model
      // answer and the mark allocation instead.
      if (!hasAttempt(match.question, combined)) {
        setOutcome({ mode: "modelAnswer", match, parts });
        return;
      }

      const answers: Record<string, string> = {};
      for (const part of parts) answers[part.ref] = combined;
      setOutcome({
        mode: "graded",
        match,
        result: markQuestion(parts, answers),
      });
      return;
    }

    // Case 2 — explain from the lecturer's notes.
    setOutcome({ mode: "explained", notes: searchNotes(combined, 3) });
  }

  const canSubmit = text.trim().length > 0 || files.some((f) => f.preview);

  return (
    <div className="relative space-y-7">
      <PlantCell className="bio-float pointer-events-none absolute -left-40 top-24 hidden w-36 opacity-60 xl:block" />
      <AnimalCell className="bio-float-slow pointer-events-none absolute -right-40 top-80 hidden w-40 opacity-60 xl:block" />

      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-600/25 bg-white/70 px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-sm backdrop-blur dark:border-teal-400/25 dark:bg-white/10 dark:text-teal-100">
          <DnaHelix className="h-4 w-2.5" />
          {t("schemeBadge")}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#14343f] sm:text-4xl dark:text-white">
          {t("graderTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#14343f]/75 dark:text-slate-200">
          {t("graderSubtitle")}
        </p>
      </header>

      {/* ── Unified input ─────────────────────────────────────────── */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`overflow-hidden rounded-3xl border-2 bg-white/90 shadow-xl shadow-teal-900/5 backdrop-blur transition dark:bg-white/10 ${
          dragging
            ? "border-teal-500 ring-4 ring-teal-500/20"
            : "border-teal-700/15 dark:border-white/20"
        }`}
      >
        <div className="flex items-center gap-2 bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-3">
          <span className="flex gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-coral-400" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          <span className="ml-2 text-xs font-semibold tracking-wide text-white">
            {t("pasteBoxTitle")}
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={t("pasteBoxPlaceholder")}
          className="w-full resize-y bg-transparent px-6 py-5 text-[15px] leading-relaxed text-[#14343f] outline-none placeholder:text-[#14343f]/45 dark:text-slate-50 dark:placeholder:text-slate-400"
        />

        {/* Attachment thumbnails */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-3 px-6 pb-4">
            {files.map((f) => (
              <div
                key={f.id}
                className="group relative overflow-hidden rounded-xl border border-teal-700/20 bg-white shadow-sm dark:border-white/20 dark:bg-white/10"
              >
                {f.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.preview}
                    alt={f.name}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <div className="grid h-24 w-24 place-items-center text-3xl">
                    📄
                  </div>
                )}
                <p className="max-w-24 truncate px-2 py-1 text-[10px] text-[#14343f]/80 dark:text-slate-200">
                  {f.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  aria-label={`Remove ${f.name}`}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-coral-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-teal-700/10 px-5 py-4 dark:border-white/15">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="rounded-xl border border-teal-700/25 bg-white px-4 py-2 text-xs font-semibold text-teal-800 transition hover:border-teal-600 hover:bg-teal-50 dark:border-white/25 dark:bg-white/10 dark:text-teal-100 dark:hover:bg-white/20"
          >
            📎 {t("attachPhoto")}
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <span className="hidden text-xs text-[#14343f]/70 sm:inline dark:text-slate-300">
            {t("dropOrPaste")}
          </span>

          <div className="ml-auto flex gap-2">
            {outcome && (
              <button
                type="button"
                onClick={() => {
                  setText("");
                  files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
                  setFiles([]);
                  setOutcome(null);
                }}
                className="rounded-xl border border-teal-700/25 px-4 py-2.5 text-sm font-medium text-teal-800 transition hover:bg-teal-50 dark:border-white/25 dark:text-teal-100 dark:hover:bg-white/10"
              >
                {t("clearButton")}
              </button>
            )}
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!canSubmit || busy}
              className="rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-coral-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {busy ? t("scanning") : t("gradeButton")}
            </button>
          </div>
        </div>
      </section>

      {busy && (
        <p className="rounded-2xl border border-teal-500/40 bg-teal-500/15 px-5 py-4 text-sm text-teal-900 dark:text-teal-100">
          <span className="inline-block animate-pulse">◐</span> {t("scanning")}
          {progress && (
            <span className="ml-2 font-mono text-xs opacity-80">{progress}</span>
          )}
        </p>
      )}

      {/* What the OCR actually read — always shown, so a bad scan is visible
          rather than silently costing the student marks. */}
      {files.some((f) => f.ocrText !== undefined) && (
        <section className="rounded-2xl border border-amber-400/50 bg-amber-400/10 px-5 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-100">
            {t("ocrHeading")}
          </h3>
          <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-100/90">
            {t("ocrCaveat")}
          </p>
          {files
            .filter((f) => f.ocrText !== undefined)
            .map((f) => (
              <div key={f.id} className="mt-3">
                <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-100">
                  {f.name}
                  {typeof f.ocrConfidence === "number" && (
                    <span
                      className={
                        f.ocrConfidence < LOW_CONFIDENCE
                          ? " text-coral-700 dark:text-coral-300"
                          : " text-emerald-800 dark:text-emerald-200"
                      }
                    >
                      {" "}
                      · {Math.round(f.ocrConfidence)}%{" "}
                      {f.ocrConfidence < LOW_CONFIDENCE ? t("ocrLow") : ""}
                    </span>
                  )}
                </p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-white/70 p-3 font-mono text-[11px] leading-relaxed text-[#14343f] dark:bg-black/30 dark:text-slate-100">
                  {f.ocrText?.trim() || t("ocrEmpty")}
                </pre>
              </div>
            ))}
        </section>
      )}

      {outcome?.mode === "ocrFailed" && (
        <p className="rounded-2xl border border-coral-400/50 bg-coral-400/15 px-5 py-4 text-sm text-coral-900 dark:text-coral-100">
          {t("ocrFailed")} {outcome.message}
        </p>
      )}

      {outcome?.mode === "empty" && (
        <p className="rounded-2xl border border-coral-400/50 bg-coral-400/15 px-5 py-4 text-sm text-coral-900 dark:text-coral-100">
          {t("needInput")}
        </p>
      )}

      {/* ── Case 1: graded against the scheme ─────────────────────── */}
      {outcome?.mode === "graded" && (
        <section className="overflow-hidden rounded-3xl border border-teal-700/15 bg-white/95 shadow-xl backdrop-blur dark:border-white/20 dark:bg-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {t("resultTitle")}
              </h2>
              <p className="text-[11px] text-teal-100">
                {t("markedAgainst")}: {t("pickChapter")} {outcome.match.chapterNumber} ·{" "}
                {outcome.match.question.session} · Q{outcome.match.question.number}
              </p>
            </div>
            <span className="rounded-full bg-white/25 px-4 py-1.5 text-base font-bold text-white">
              {outcome.result.awarded} / {outcome.result.maximum}
            </span>
          </div>

          <div className="space-y-6 px-6 py-5">
            {outcome.result.parts.map((pr) => (
              <div key={pr.part.ref}>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-teal-700 dark:text-teal-200">
                    {pr.part.ref}
                  </span>
                  <p className="flex-1 text-sm text-[#14343f]/85 dark:text-slate-200">
                    {pr.part.prompt}
                  </p>
                  <span className="shrink-0 text-sm font-bold text-[#14343f] dark:text-white">
                    {pr.awarded}/{pr.maximum}
                  </span>
                </div>

                <ul className="mt-2 space-y-2">
                  {pr.results.map((r, i) => (
                    <li
                      key={i}
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        r.earned
                          ? "border-emerald-400/50 bg-emerald-400/15"
                          : "border-coral-400/50 bg-coral-400/15"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-[#14343f] dark:text-white">
                          {r.earned ? "✓" : "✕"}
                        </span>
                        <div className="flex-1">
                          <p className="leading-relaxed text-[#14343f] dark:text-slate-100">
                            {r.point.text}
                          </p>
                          <p className="mt-1 text-xs font-bold">
                            {r.earned ? (
                              <span className="text-emerald-800 dark:text-emerald-200">
                                [{r.point.marks}M] {t("pointEarned")}
                              </span>
                            ) : (
                              <span className="text-coral-800 dark:text-coral-200">
                                [0M] {t("pointMissed")}
                              </span>
                            )}
                          </p>

                          {r.matched.length > 0 && (
                            <KeywordRow
                              label={t("youWrote")}
                              items={r.matched}
                              tone="found"
                            />
                          )}
                          {!r.earned && r.missingGroups.length > 0 && (
                            <KeywordRow
                              label={t("missingKeywords")}
                              items={r.missingGroups.map((g) => g.slice(0, 3).join(" / "))}
                              tone="missed"
                            />
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {pr.cappedByAnyOf && (
                  <p className="mt-2 text-xs italic text-[#14343f]/70 dark:text-slate-300">
                    {t("cappedNote")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Question only: show how the marks are awarded ─────────── */}
      {outcome?.mode === "modelAnswer" && (
        <section className="overflow-hidden rounded-3xl border border-teal-700/15 bg-white/95 shadow-xl backdrop-blur dark:border-white/20 dark:bg-white/10">
          <div className="bg-gradient-to-r from-[#14343f] to-teal-800 px-6 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {t("modelTitle")}
            </h2>
            <p className="text-[11px] text-teal-100">
              {t("markedAgainst")}: {outcome.match.question.session} · Q
              {outcome.match.question.number} — {t("modelSubtitle")}
            </p>
          </div>

          <div className="space-y-6 px-6 py-5">
            {outcome.parts.map((part) => (
              <div key={part.ref}>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-teal-700 dark:text-teal-200">
                    {part.ref}
                  </span>
                  <p className="flex-1 text-sm text-[#14343f]/85 dark:text-slate-200">
                    {part.prompt}
                  </p>
                  <span className="shrink-0 rounded-full bg-teal-700/15 px-2.5 py-0.5 text-xs font-bold text-teal-800 dark:bg-white/15 dark:text-teal-100">
                    [{part.marks}]
                  </span>
                </div>

                {part.note && (
                  <p className="mt-1 text-xs italic text-[#14343f]/70 dark:text-slate-300">
                    {part.note}
                  </p>
                )}

                <ol className="mt-3 space-y-2">
                  {part.points.map((p, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                          {p.marks}M
                        </span>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed text-[#14343f] dark:text-slate-100">
                            {p.text}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {p.require.map((group, gi) => (
                              <span
                                key={gi}
                                className="rounded-md bg-teal-700/15 px-2 py-0.5 text-xs font-medium text-teal-900 dark:bg-white/15 dark:text-teal-50"
                              >
                                {group.slice(0, 3).join(" / ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            <p className="rounded-xl bg-teal-700/5 px-4 py-3 text-xs text-[#14343f]/80 dark:bg-white/5 dark:text-slate-300">
              {t("modelHint")}
            </p>
          </div>
        </section>
      )}

      {/* ── Case 2: explained from lecturer notes ─────────────────── */}
      {outcome?.mode === "explained" && (
        <section className="overflow-hidden rounded-3xl border border-teal-700/15 bg-white/95 shadow-xl backdrop-blur dark:border-white/20 dark:bg-white/10">
          <div className="bg-gradient-to-r from-[#14343f] to-teal-800 px-6 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {t("explainTitle")}
            </h2>
            <p className="text-[11px] text-teal-100">{t("explainSubtitle")}</p>
          </div>

          <div className="space-y-5 px-6 py-5">
            {outcome.notes.length === 0 ? (
              <p className="text-sm text-[#14343f]/80 dark:text-slate-200">
                {t("explainNothing")}
              </p>
            ) : (
              outcome.notes.map((n, i) => (
                <article
                  key={i}
                  className="rounded-2xl border border-teal-700/15 bg-teal-700/5 p-4 dark:border-white/15 dark:bg-white/5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
                    {t("pickChapter")} {n.section.chapter} ·{" "}
                    {lang === "bm" ? n.section.chapterBm : n.section.chapterEn}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-[#14343f] dark:text-white">
                    {n.section.outcome}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {n.section.content.map((c, ci) => (
                      <li
                        key={ci}
                        className="flex gap-2 text-sm leading-relaxed text-[#14343f]/90 dark:text-slate-100"
                      >
                        <span className="text-teal-600 dark:text-teal-300">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function KeywordRow({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "found" | "missed";
}) {
  return (
    <div className="mt-2">
      <p
        className={`text-[11px] font-bold uppercase tracking-wider ${
          tone === "found"
            ? "text-emerald-800 dark:text-emerald-200"
            : "text-coral-800 dark:text-coral-200"
        }`}
      >
        {label}
      </p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.map((k, i) => (
          <span
            key={i}
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              tone === "found"
                ? "bg-emerald-500/30 text-emerald-950 dark:text-emerald-50"
                : "bg-coral-500/30 text-coral-950 dark:text-coral-50"
            }`}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
