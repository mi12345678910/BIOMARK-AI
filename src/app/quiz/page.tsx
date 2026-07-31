"use client";

import { useMemo, useState } from "react";
import { DnaHelix } from "@/components/BioArt";
import { useI18n } from "@/lib/i18n";
import { CHAPTERS, findChapter, type Mcq } from "@/data/bank";

/** Fisher-Yates, so a re-run of the same chapter isn't the same order. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export default function QuizPage() {
  const { lang, t } = useI18n();

  const [chapterId, setChapterId] = useState(CHAPTERS[0].id);
  const chapter = findChapter(chapterId)!;

  const [deck, setDeck] = useState<Mcq[]>(() => shuffle(CHAPTERS[0].mcq));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const current = deck[index];
  const finished = index >= deck.length;

  function restart(id = chapterId) {
    const next = findChapter(id)!;
    setChapterId(id);
    setDeck(shuffle(next.mcq));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setAnsweredCount(0);
  }

  function choose(letter: string) {
    if (picked) return;
    setPicked(letter);
    setAnsweredCount((c) => c + 1);
    if (letter === current!.answer.trim().charAt(0)) setScore((s) => s + 1);
  }

  const pct = useMemo(
    () => (answeredCount ? Math.round((score / answeredCount) * 100) : 0),
    [score, answeredCount],
  );

  return (
    <div className="space-y-7">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-600/25 bg-white/70 px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-sm backdrop-blur dark:border-teal-400/25 dark:bg-white/5 dark:text-teal-200">
          <DnaHelix className="h-4 w-2.5" />
          {t("schemeBadge")}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#14343f] sm:text-4xl dark:text-white">
          {t("quizTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#14343f]/70 dark:text-slate-300">
          {t("quizSubtitle")}
        </p>
      </header>

      <section className="flex flex-wrap items-end gap-4 rounded-3xl border border-teal-700/15 bg-white/85 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="min-w-56 flex-1">
          <label className="mb-1 block text-xs font-semibold text-[#14343f]/75 dark:text-slate-300">
            {t("pickChapter")}
          </label>
          <select
            value={chapterId}
            onChange={(e) => restart(e.target.value)}
            className="w-full rounded-xl border border-teal-700/20 bg-white px-3 py-2.5 text-sm text-[#14343f] outline-none focus:border-teal-500 dark:border-white/15 dark:bg-white/5 dark:text-slate-100"
          >
            {CHAPTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number}. {lang === "bm" ? c.bm : c.en} ({c.mcq.length})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => restart()}
          className="rounded-xl border border-teal-700/20 px-5 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 dark:border-white/15 dark:text-teal-100 dark:hover:bg-white/10"
        >
          {t("restartButton")}
        </button>

        <span className="ml-auto text-sm font-medium text-[#14343f]/70 dark:text-slate-300">
          {t("scoreLabel")}:{" "}
          <span className="font-bold text-teal-700 dark:text-teal-300">
            {score}/{answeredCount}
          </span>
        </span>
      </section>

      {current && (
        <section className="rounded-3xl border border-teal-700/15 bg-white/90 p-6 shadow-xl shadow-teal-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-teal-700 dark:text-teal-300">
              {t("questionOf", { n: index + 1, total: deck.length })}
            </span>
            <span className="rounded-full bg-teal-700/10 px-2.5 py-1 text-teal-800 dark:bg-white/10 dark:text-teal-200">
              1 {t("marksLabel")}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-[#14343f] dark:text-slate-100">
            {current.stem}
          </p>

          {/* Diagram belonging to the stem. Scans are black line art on white,
              so they need a white plate to stay readable in dark mode. */}
          {current.figure && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.figure}
              alt="Figure for this question"
              className="mx-auto mt-4 max-h-56 w-auto max-w-full rounded-xl bg-white p-3"
            />
          )}

          {/* Options printed as diagrams rather than words. The strip shows
              A B C D in order, matching the buttons underneath. */}
          {current.optionsFigure && (
            <figure className="mt-4">
              <img
                // eslint-disable-next-line @next/next/no-img-element
                src={current.optionsFigure}
                alt="Answer options A, B, C and D"
                className="w-full rounded-xl bg-white p-3"
              />
              <figcaption className="mt-1 text-center text-xs text-[#14343f]/70 dark:text-slate-300">
                {t("optionsAreDiagrams")}
              </figcaption>
            </figure>
          )}

          <div
            className={
              current.optionsFigure
                ? "mt-4 grid grid-cols-4 gap-2"
                : "mt-4 space-y-2"
            }
          >
            {current.options.map((opt) => {
              const letter = opt.trim().charAt(0).toUpperCase();
              const isAnswer = letter === current.answer.trim().charAt(0);
              const isPicked = picked === letter;

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={!!picked}
                  onClick={() => choose(letter)}
                  className={`block w-full rounded-xl border px-4 py-3 text-sm transition ${
                    current.optionsFigure
                      ? "text-center font-bold"
                      : "text-left"
                  } ${
                    picked && isAnswer
                      ? "border-emerald-500 bg-emerald-400/15 font-semibold"
                      : picked && isPicked
                        ? "border-coral-500 bg-coral-400/15"
                        : "border-teal-700/15 hover:border-teal-500 hover:bg-teal-50/60 dark:border-white/10 dark:hover:bg-white/10"
                  } ${picked ? "cursor-default" : "cursor-pointer"} text-[#14343f] dark:text-slate-200`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {picked && (
            <div className="mt-5 rounded-2xl border border-teal-700/15 bg-teal-700/5 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-[#14343f] dark:text-white">
                {picked === current.answer.trim().charAt(0)
                  ? `✓ ${t("correct")}`
                  : `✕ ${t("incorrect")} — ${current.answer}`}
              </p>
              {current.explain && (
                <p className="mt-2 text-sm leading-relaxed text-[#14343f]/75 dark:text-slate-300">
                  {current.explain}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setIndex((i) => i + 1);
                  setPicked(null);
                }}
                className="mt-4 rounded-xl bg-[#14343f] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-125 dark:bg-white dark:text-[#14343f]"
              >
                {index + 1 < deck.length ? t("nextButton") : t("quizComplete")}
              </button>
            </div>
          )}
        </section>
      )}

      {finished && (
        <section className="rounded-3xl border border-teal-700/20 bg-gradient-to-br from-teal-700 to-teal-600 p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-100/80">
            {t("quizComplete")}
          </p>
          <p className="mt-3 text-5xl font-bold text-white">
            {score}
            <span className="text-teal-200/60">/{deck.length}</span>
          </p>
          <p className="mt-2 text-sm text-teal-100/80">
            {t("finalScore")} · {pct}%
          </p>
          <button
            type="button"
            onClick={() => restart()}
            className="mt-6 rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-105"
          >
            {t("restartButton")}
          </button>
        </section>
      )}
    </div>
  );
}
