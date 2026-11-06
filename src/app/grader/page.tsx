"use client";

import { useEffect, useRef, useState } from "react";
import { AnimalCell, DnaHelix, PlantCell } from "@/components/BioArt";
import { useI18n } from "@/lib/i18n";
import { LOW_CONFIDENCE, recogniseImages } from "@/lib/ocr";
import { routeSubmission, type Routed, type RoutedSegment } from "@/lib/route";

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
  /** Set when this one image failed; other pages still return. */
  ocrError?: string;
}

type Outcome =
  /** One entry per question found — a submission can hold several. */
  | { mode: "results"; items: RoutedSegment[] }
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
        // Sequential, sharing one worker. One worker per image meant two
        // attachments exhausted memory and the whole submission failed.
        const results = await recogniseImages(
          images.map((att) => ({ file: att.file, name: att.name })),
          (p) =>
            setProgress(
              `${p.file}: ${p.status}${
                p.progress !== null ? ` ${Math.round(p.progress * 100)}%` : ""
              }`,
            ),
        );

        // Results come back in the order submitted, so pair them by index —
        // two photos can share a file name.
        const byId = new Map(images.map((att, i) => [att.id, results[i]]));
        scanned = files.map((f) => {
          const hit = byId.get(f.id);
          return hit
            ? {
                ...f,
                ocrText: hit.text,
                ocrConfidence: hit.confidence,
                ocrError: hit.error,
              }
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

    // Each source stays its own segment. Concatenating them into one blob and
    // matching once meant a student who attached two questions only ever got
    // the first one marked — the second was silently dropped.
    const segments = [
      { label: t("typedAnswer"), text: text.trim() },
      ...scanned.map((f) => ({ label: f.name, text: f.ocrText ?? "" })),
    ];

    const items = routeSubmission(segments);
    setOutcome(items.length === 0 ? { mode: "empty" } : { mode: "results", items });
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
      {/* Several questions marked at once: the combined score comes first,
          before any individual result. */}
      {outcome?.mode === "results" && <OverallScore items={outcome.items} />}

      {outcome?.mode === "results" &&
        outcome.items.map((item, i) => (
          <ResultCard key={i} item={item} index={i} total={outcome.items.length} />
        ))}
    </div>
  );
}

/**
 * The FIGURE or TABLE a structured question refers to.
 *
 * The scans are black line art on white, so they get a white plate — on the
 * dark theme they would otherwise be black-on-near-black and invisible.
 */
function QuestionFigure({
  src,
  intro,
  extra,
}: {
  src?: string;
  intro?: string;
  /** Figures introduced inside sub-parts, e.g. "(b) FIGURE 12 shows…". */
  extra?: string[];
}) {
  const figures = [src, ...(extra ?? [])].filter(Boolean) as string[];
  if (!intro && figures.length === 0) return null;
  return (
    <div>
      {intro && (
        <p className="rounded-xl bg-teal-700/5 px-4 py-3 text-sm leading-relaxed text-[#14343f]/85 dark:bg-white/5 dark:text-slate-200">
          {intro}
        </p>
      )}
      {figures.map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f}
          src={f}
          alt="Figure for this question"
          className="mx-auto mt-3 max-h-80 w-auto max-w-full rounded-xl bg-white p-3"
        />
      ))}
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

/**
 * One question's result.
 *
 * A submission can contain several — two photos of two different questions
 * produce two of these. The source labels are shown only when there is more
 * than one, so a single typed answer stays uncluttered.
 */
function ResultCard({
  item,
  index,
  total,
}: {
  item: RoutedSegment;
  index: number;
  total: number;
}) {
  const { lang, t } = useI18n();
  const routed: Routed = item.routed;

  return (
    <div className="space-y-2">
      {total > 1 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-bold text-white">
            {index + 1} / {total}
          </span>
          <span className="text-xs font-medium text-[#14343f]/70 dark:text-slate-300">
            {item.labels.join("  +  ")}
          </span>
        </div>
      )}
      {routed.mode === "graded" && (
        <section className="overflow-hidden rounded-3xl border border-teal-700/15 bg-white/95 shadow-xl backdrop-blur dark:border-white/20 dark:bg-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {t("resultTitle")}
              </h2>
              <p className="text-[11px] text-teal-100">
                {t("markedAgainst")}: {t("pickChapter")} {routed.match.chapterNumber} ·{" "}
                {routed.match.question.session} · Q{routed.match.question.number}
              </p>
            </div>
            <span className="rounded-full bg-white/25 px-4 py-1.5 text-base font-bold text-white">
              {routed.result.awarded} / {routed.result.maximum}
            </span>
          </div>

          <div className="space-y-6 px-6 py-5">
            {/* Score and mark allocation first — the student's first question
                is "how did I do", and it used to be answered by a small pill
                in the header with the full-marks message at the very bottom. */}
            <ScoreSummary
              awarded={routed.result.awarded}
              maximum={routed.result.maximum}
              rows={routed.result.parts.map((pr) => ({
                ref: pr.part.ref,
                prompt: pr.part.prompt,
                awarded: pr.awarded,
                maximum: pr.maximum,
              }))}
            />

            <QuestionFigure
              src={routed.match.question.figure}
              extra={routed.match.question.extraFigures}
              intro={routed.match.question.intro}
            />

            <h3 className="border-t border-teal-700/15 pt-5 text-xs font-bold uppercase tracking-wider text-teal-700 dark:border-white/15 dark:text-teal-200">
              {t("detailTitle")}
            </h3>
            {routed.result.parts.map((pr) => (
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

            {/* Why the lost marks were lost — the lecturer's own material on
                the concepts behind the missed scheme points. */}
            {routed.notes.length > 0 && (
              <div className="border-t border-teal-700/15 pt-5 dark:border-white/15">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
                  {t("whyTitle")}
                </h3>
                <p className="mt-1 text-xs text-[#14343f]/75 dark:text-slate-300">
                  {t("whySubtitle")}
                </p>

                <div className="mt-3 space-y-4">
                  {routed.notes.map((n, i) => (
                    <article
                      key={i}
                      className="rounded-2xl border border-teal-700/15 bg-teal-700/5 p-4 dark:border-white/15 dark:bg-white/5"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
                        {t("pickChapter")} {n.section.chapter} ·{" "}
                        {lang === "bm" ? n.section.chapterBm : n.section.chapterEn}
                      </p>
                      <h4 className="mt-1 text-sm font-bold text-[#14343f] dark:text-white">
                        {n.section.outcome}
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {n.section.content.slice(0, 6).map((c, ci) => (
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Question only: show how the marks are awarded ─────────── */}
      {routed.mode === "modelAnswer" && (
        <section className="overflow-hidden rounded-3xl border border-teal-700/15 bg-white/95 shadow-xl backdrop-blur dark:border-white/20 dark:bg-white/10">
          <div className="bg-gradient-to-r from-[#14343f] to-teal-800 px-6 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {t("modelTitle")}
            </h2>
            <p className="text-[11px] text-teal-100">
              {t("markedAgainst")}: {routed.match.question.session} · Q
              {routed.match.question.number} — {t("modelSubtitle")}
            </p>
          </div>

          <div className="space-y-6 px-6 py-5">
            <ScoreSummary
              maximum={routed.parts.reduce((n, p) => n + p.marks, 0)}
              rows={routed.parts.map((p) => ({ ref: p.ref, prompt: p.prompt, maximum: p.marks }))}
            />
            <QuestionFigure
              src={routed.match.question.figure}
              extra={routed.match.question.extraFigures}
              intro={routed.match.question.intro}
            />
            {routed.parts.map((part) => (
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

      {/* ── Drawing question: answer with the diagram ─────────────── */}
      {routed.mode === "diagram" && (
        <section className="overflow-hidden rounded-3xl border border-teal-700/15 bg-white/95 shadow-xl backdrop-blur dark:border-white/20 dark:bg-white/10">
          <div className="bg-gradient-to-r from-[#14343f] to-teal-800 px-6 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {t("diagramTitle")}
            </h2>
            <p className="text-[11px] text-teal-100">{t("diagramSubtitle")}</p>
          </div>

          <div className="space-y-5 px-6 py-5">
            <h3 className="text-base font-bold text-[#14343f] dark:text-white">
              {lang === "bm" ? routed.diagram.titleBm : routed.diagram.title}
              <span className="ml-2 rounded-full bg-teal-700/15 px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:bg-white/15 dark:text-teal-100">
                {t("pickChapter")} {routed.diagram.chapter}
              </span>
            </h3>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={routed.diagram.image}
              alt={routed.diagram.title}
              className="w-full rounded-2xl bg-white p-3"
            />

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
                {t("diagramLabels")}
              </h4>
              <ul className="mt-2 space-y-1.5">
                {routed.diagram.labels.map((l, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-lg bg-emerald-400/10 px-3 py-2 text-sm text-[#14343f] dark:text-slate-100"
                  >
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      ✓
                    </span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-teal-700/15 bg-teal-700/5 p-4 dark:border-white/15 dark:bg-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
                {t("diagramGuidance")}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[#14343f]/90 dark:text-slate-100">
                {lang === "bm"
                  ? routed.diagram.guidanceBm
                  : routed.diagram.guidance}
              </p>
            </div>

            <p className="rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3 text-xs text-amber-900 dark:text-amber-100">
              ⚠️ {t("diagramCannotMark")}
            </p>
          </div>
        </section>
      )}

      {/* ── Case 2: explained from lecturer notes ─────────────────── */}
      {routed.mode === "explained" && (
        <section className="overflow-hidden rounded-3xl border border-teal-700/15 bg-white/95 shadow-xl backdrop-blur dark:border-white/20 dark:bg-white/10">
          <div className="bg-gradient-to-r from-[#14343f] to-teal-800 px-6 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {t("explainTitle")}
            </h2>
            <p className="text-[11px] text-teal-100">{t("explainSubtitle")}</p>
          </div>

          <div className="space-y-5 px-6 py-5">
            {routed.notes.length === 0 ? (
              <p className="text-sm text-[#14343f]/80 dark:text-slate-200">
                {t("explainNothing")}
              </p>
            ) : (
              routed.notes.map((n, i) => (
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

interface AllocationRow {
  ref: string;
  prompt: string;
  /** Absent when the question was submitted without an answer. */
  awarded?: number;
  maximum: number;
}

/**
 * The first thing in every result: the score, how far it is from full marks,
 * and how the marks split across the parts. With no `awarded` it shows the
 * allocation alone — what each part is worth — for a question submitted
 * without an answer.
 */
function ScoreSummary({
  rows,
  awarded,
  maximum,
}: {
  rows: AllocationRow[];
  awarded?: number;
  maximum: number;
}) {
  const { t } = useI18n();
  const graded = awarded !== undefined;
  const pct = graded && maximum > 0 ? Math.round((awarded / maximum) * 100) : 0;
  const full = graded && awarded === maximum;

  return (
    <div className="rounded-2xl border border-teal-700/15 bg-gradient-to-br from-teal-50 to-white p-5 dark:border-white/15 dark:from-white/10 dark:to-white/5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
            {graded ? t("finalScore") : t("marksAvailable")}
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-[#14343f] dark:text-white">
            {graded ? (
              <>
                {awarded}
                <span className="text-2xl text-[#14343f]/50 dark:text-slate-400"> / {maximum}</span>
              </>
            ) : (
              maximum
            )}
          </p>
        </div>
        {graded && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              full
                ? "bg-emerald-500 text-white"
                : pct >= 50
                  ? "bg-teal-700 text-white"
                  : "bg-coral-500 text-white"
            }`}
          >
            {pct}%
          </span>
        )}
      </div>

      {graded && (
        <>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-teal-700/10 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${full ? "bg-emerald-500" : pct >= 50 ? "bg-teal-600" : "bg-coral-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p
            className={`mt-3 text-sm font-medium ${
              full ? "text-emerald-800 dark:text-emerald-200" : "text-[#14343f]/80 dark:text-slate-200"
            }`}
          >
            {full
              ? t("fullMarksNote")
              : t("marksLostNote", { lost: maximum - awarded, max: maximum })}
          </p>
        </>
      )}

      <h4 className="mt-4 text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-200">
        {t("markAllocation")}
      </h4>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-[#14343f]/60 dark:text-slate-400">
              <th className="py-1 pr-3 font-semibold">{t("partColumn")}</th>
              <th className="py-1 pr-3 font-semibold" />
              <th className="py-1 text-right font-semibold">{t("marksColumn")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const rowFull = r.awarded !== undefined && r.awarded === r.maximum;
              const rowZero = r.awarded === 0;
              return (
                <tr key={r.ref} className="border-t border-teal-700/10 dark:border-white/10">
                  <td className="py-1.5 pr-3 align-top font-bold text-teal-700 dark:text-teal-200">
                    {r.ref}
                  </td>
                  <td className="py-1.5 pr-3 align-top text-[#14343f]/80 dark:text-slate-300">
                    <span className="line-clamp-2">{r.prompt}</span>
                  </td>
                  <td
                    className={`whitespace-nowrap py-1.5 text-right align-top font-bold ${
                      rowFull
                        ? "text-emerald-700 dark:text-emerald-300"
                        : rowZero
                          ? "text-coral-700 dark:text-coral-300"
                          : "text-[#14343f] dark:text-white"
                    }`}
                  >
                    {r.awarded !== undefined ? `${r.awarded} / ${r.maximum}` : `[${r.maximum}]`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Combined total when one submission held several questions. */
function OverallScore({ items }: { items: RoutedSegment[] }) {
  const { t } = useI18n();
  const graded = items.flatMap((i) => (i.routed.mode === "graded" ? [i.routed.result] : []));
  if (graded.length < 2) return null;

  const awarded = graded.reduce((n, r) => n + r.awarded, 0);
  const maximum = graded.reduce((n, r) => n + r.maximum, 0);
  const pct = maximum > 0 ? Math.round((awarded / maximum) * 100) : 0;

  return (
    <section className="rounded-3xl bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-5 text-white shadow-xl">
      <p className="text-xs font-bold uppercase tracking-wider text-teal-100">
        {t("overallScore", { count: graded.length })}
      </p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-4xl font-bold tracking-tight">
          {awarded}
          <span className="text-2xl text-teal-100"> / {maximum}</span>
        </p>
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">{pct}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}
