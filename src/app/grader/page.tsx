"use client";

import { useMemo, useState } from "react";
import { AnimalCell, DnaHelix, PlantCell } from "@/components/BioArt";
import { useI18n } from "@/lib/i18n";
import { CHAPTERS, findChapter } from "@/data/bank";
import { markQuestion, type QuestionResult } from "@/lib/marking";

export default function GraderPage() {
  const { lang, t } = useI18n();

  const [chapterId, setChapterId] = useState(
    CHAPTERS.find((c) => c.structured.length > 0)!.id,
  );
  const chapter = findChapter(chapterId)!;

  const [questionId, setQuestionId] = useState(
    chapter.structured[0]?.id ?? "",
  );
  const question = useMemo(
    () => chapter.structured.find((s) => s.id === questionId),
    [chapter, questionId],
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuestionResult | null>(null);

  function switchChapter(id: string) {
    const next = findChapter(id)!;
    setChapterId(id);
    setQuestionId(next.structured[0]?.id ?? "");
    setAnswers({});
    setResult(null);
  }

  function switchQuestion(id: string) {
    setQuestionId(id);
    setAnswers({});
    setResult(null);
  }

  function mark() {
    if (!question) return;
    setResult(markQuestion(question.parts, answers));
  }

  const anyAnswer = Object.values(answers).some((a) => a.trim());

  return (
    <div className="relative space-y-7">
      <PlantCell className="bio-float pointer-events-none absolute -left-40 top-24 hidden w-36 opacity-60 xl:block" />
      <AnimalCell className="bio-float-slow pointer-events-none absolute -right-40 top-80 hidden w-40 opacity-60 xl:block" />

      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-600/25 bg-white/70 px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-sm backdrop-blur dark:border-teal-400/25 dark:bg-white/5 dark:text-teal-200">
          <DnaHelix className="h-4 w-2.5" />
          {t("schemeBadge")}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#14343f] sm:text-4xl dark:text-white">
          {t("graderTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#14343f]/70 dark:text-slate-300">
          {t("graderSubtitle")}
        </p>
      </header>

      {/* Pickers */}
      <section className="grid gap-4 rounded-3xl border border-teal-700/15 bg-white/85 p-5 backdrop-blur sm:grid-cols-2 dark:border-white/10 dark:bg-white/5">
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#14343f]/75 dark:text-slate-300">
            {t("pickChapter")}
          </label>
          <select
            value={chapterId}
            onChange={(e) => switchChapter(e.target.value)}
            className={selectClass}
          >
            {CHAPTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number}. {lang === "bm" ? c.bm : c.en}
                {c.structured.length === 0 ? " —" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[#14343f]/75 dark:text-slate-300">
            {t("pickQuestion")}
          </label>
          <select
            value={questionId}
            onChange={(e) => switchQuestion(e.target.value)}
            disabled={chapter.structured.length === 0}
            className={selectClass}
          >
            {chapter.structured.map((s) => (
              <option key={s.id} value={s.id}>
                {s.session} · Q{s.number}
              </option>
            ))}
          </select>
        </div>
      </section>

      {chapter.structured.length === 0 && (
        <p className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4 text-sm text-amber-800 dark:text-amber-200">
          {t("noStructured")}
        </p>
      )}

      {/* Question + answer boxes */}
      {question && (
        <section className="overflow-hidden rounded-3xl border-2 border-teal-700/15 bg-white/85 shadow-xl shadow-teal-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-3">
            <span className="flex gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full bg-coral-400" />
              <i className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <i className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </span>
            <span className="ml-2 text-xs font-semibold tracking-wide text-white/90">
              {question.session} · Q{question.number}
            </span>
          </div>

          <div className="space-y-5 px-6 py-5">
            {question.intro && (
              <p className="rounded-xl bg-teal-700/5 px-4 py-3 text-sm leading-relaxed text-[#14343f]/80 dark:bg-white/5 dark:text-slate-300">
                {question.intro}
              </p>
            )}

            {question.parts.map((part) => (
              <div key={part.ref}>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-teal-700 dark:text-teal-300">
                    {part.ref}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-[#14343f] dark:text-slate-200">
                    {part.prompt}
                  </p>
                  <span className="shrink-0 rounded-full bg-teal-700/10 px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:bg-white/10 dark:text-teal-200">
                    [{part.marks}]
                  </span>
                </div>
                {part.note && (
                  <p className="mt-1 text-xs italic text-[#14343f]/45 dark:text-slate-500">
                    {part.note}
                  </p>
                )}
                <textarea
                  value={answers[part.ref] ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [part.ref]: e.target.value }))
                  }
                  rows={3}
                  placeholder={t("shortPlaceholder")}
                  className="mt-2 w-full resize-y rounded-xl border border-teal-700/15 bg-white px-4 py-3 text-sm text-[#14343f] outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                />
              </div>
            ))}

            <div className="flex gap-3 border-t border-teal-700/10 pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={mark}
                disabled={!anyAnswer}
                className="rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-coral-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {t("gradeButton")}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({});
                    setResult(null);
                  }}
                  className="rounded-xl border border-teal-700/20 px-5 py-2.5 text-sm font-medium text-teal-800 transition hover:bg-teal-50 dark:border-white/15 dark:text-teal-100 dark:hover:bg-white/10"
                >
                  {t("clearButton")}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="overflow-hidden rounded-3xl border border-teal-700/15 bg-white/90 shadow-xl shadow-teal-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {t("resultTitle")}
            </h2>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white">
              {result.awarded} / {result.maximum}
            </span>
          </div>

          <div className="space-y-6 px-6 py-5">
            {result.parts.map((pr) => (
              <div key={pr.part.ref}>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-teal-700 dark:text-teal-300">
                    {pr.part.ref}
                  </span>
                  <span className="ml-auto text-sm font-bold text-[#14343f] dark:text-white">
                    {pr.awarded} / {pr.maximum}
                  </span>
                </div>

                <ul className="mt-2 space-y-2">
                  {pr.results.map((r, i) => (
                    <li
                      key={i}
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        r.earned
                          ? "border-emerald-400/40 bg-emerald-400/10"
                          : "border-coral-400/40 bg-coral-400/10"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold">
                          {r.earned ? "✓" : "✕"}
                        </span>
                        <div className="flex-1">
                          <p className="leading-relaxed text-[#14343f] dark:text-slate-200">
                            {r.point.text}
                          </p>
                          <p className="mt-1 text-xs font-semibold">
                            {r.earned ? (
                              <span className="text-emerald-700 dark:text-emerald-300">
                                [{r.point.marks}M] {t("pointEarned")}
                              </span>
                            ) : (
                              <span className="text-coral-600 dark:text-coral-300">
                                [0M] {t("pointMissed")}
                              </span>
                            )}
                          </p>

                          {!r.earned && r.missingGroups.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[#14343f]/50 dark:text-slate-400">
                                {t("missingKeywords")}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {r.missingGroups.map((g, gi) => (
                                  <span
                                    key={gi}
                                    className="rounded-md bg-coral-500/20 px-2 py-0.5 text-xs font-medium text-coral-700 dark:text-coral-200"
                                  >
                                    {g.slice(0, 3).join(" / ")}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {pr.cappedByAnyOf && (
                  <p className="mt-2 text-xs italic text-[#14343f]/50 dark:text-slate-500">
                    {t("cappedNote")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const selectClass =
  "w-full rounded-xl border border-teal-700/20 bg-white px-3 py-2.5 text-sm text-[#14343f] outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-100";
