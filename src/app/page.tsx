"use client";

import Link from "next/link";
import {
  AnimalCell,
  Brain,
  DnaHelix,
  Flask,
  Microscope,
  PlantCell,
} from "@/components/BioArt";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();

  const features = [
    { Icon: Microscope, title: t("featureGradeTitle"), body: t("featureGradeBody") },
    { Icon: Flask, title: t("featureKeywordTitle"), body: t("featureKeywordBody") },
    { Icon: Brain, title: t("featureDiagramTitle"), body: t("featureDiagramBody") },
  ];

  return (
    <div className="space-y-20 py-6">
      {/* ---------------- Hero ---------------- */}
      <section className="relative">
        <PlantCell className="bio-float pointer-events-none absolute -left-32 top-4 hidden w-44 opacity-70 lg:block xl:-left-44 xl:w-52" />
        <AnimalCell className="bio-float-slow pointer-events-none absolute -right-32 top-20 hidden w-48 opacity-70 lg:block xl:-right-44 xl:w-56" />

        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-600/25 bg-white/70 px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-sm backdrop-blur dark:border-teal-400/25 dark:bg-white/5 dark:text-teal-200">
            <DnaHelix className="h-4 w-2.5" />
            {t("tagline")}
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-[#14343f] sm:text-5xl dark:text-white">
            {t("heroTitleA")}{" "}
            <span className="bg-gradient-to-r from-coral-500 to-coral-400 bg-clip-text text-transparent">
              {t("heroTitleB")}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#14343f]/70 dark:text-slate-300">
            {t("heroBody")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/grader"
              className="rounded-2xl bg-gradient-to-r from-coral-500 to-coral-400 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-coral-500/25 transition hover:brightness-105"
            >
              {t("heroCtaGrade")}
            </Link>
            <Link
              href="/quiz"
              className="rounded-2xl border-2 border-teal-700/20 bg-white/70 px-7 py-3.5 text-sm font-bold text-teal-800 backdrop-blur transition hover:border-teal-600 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-teal-100 dark:hover:bg-white/10"
            >
              {t("heroCtaQuiz")}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Two feature cards, like the mockup ---------------- */}
      <section className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/grader"
          className="group relative overflow-hidden rounded-3xl border border-teal-700/15 bg-gradient-to-br from-teal-700 to-teal-600 p-7 shadow-xl shadow-teal-900/10 transition hover:-translate-y-0.5 hover:shadow-2xl"
        >
          <Microscope className="h-10 w-10 text-white/90" />
          <h2 className="mt-4 text-lg font-bold text-white">
            {t("cardGraderTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            {t("cardGraderBody")}
          </p>
          <span className="mt-4 inline-block text-sm font-bold text-coral-300 transition group-hover:translate-x-1">
            {t("cardCta")} →
          </span>
          <DnaHelix className="pointer-events-none absolute -bottom-8 -right-4 h-40 w-14 opacity-20" />
        </Link>

        <Link
          href="/quiz"
          className="group relative overflow-hidden rounded-3xl border border-coral-400/30 bg-gradient-to-br from-coral-500 to-coral-400 p-7 shadow-xl shadow-coral-500/15 transition hover:-translate-y-0.5 hover:shadow-2xl"
        >
          <Brain className="h-10 w-10 text-white/90" />
          <h2 className="mt-4 text-lg font-bold text-white">
            {t("cardQuizTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            {t("cardQuizBody")}
          </p>
          <span className="mt-4 inline-block text-sm font-bold text-teal-900 transition group-hover:translate-x-1">
            {t("cardCta")} →
          </span>
          <AnimalCell className="pointer-events-none absolute -bottom-10 -right-8 w-36 opacity-20" />
        </Link>
      </section>

      {/* ---------------- Three small features ---------------- */}
      <section className="grid gap-5 sm:grid-cols-3">
        {features.map(({ Icon, title, body }) => (
          <div
            key={title}
            className="rounded-3xl border border-teal-700/12 bg-white/70 p-6 backdrop-blur transition hover:border-teal-600/40 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-teal-700/10 text-teal-700 dark:bg-white/10 dark:text-teal-300">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-sm font-bold text-[#14343f] dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#14343f]/65 dark:text-slate-400">
              {body}
            </p>
          </div>
        ))}
      </section>

      {/* ---------------- Syllabus strip ---------------- */}
      <section className="relative overflow-hidden rounded-3xl border border-teal-700/15 bg-[#14343f] px-8 py-12 text-center">
        <PlantCell className="pointer-events-none absolute -left-10 -top-6 w-32 opacity-15" />
        <AnimalCell className="pointer-events-none absolute -bottom-10 -right-6 w-36 opacity-15" />
        <h2 className="relative text-2xl font-bold tracking-tight text-white">
          {t("syllabusTitle")}
        </h2>
        <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-teal-100/70">
          {t("syllabusBody")}
        </p>
        <Link
          href="/grader"
          className="relative mt-7 inline-block rounded-2xl bg-gradient-to-r from-coral-500 to-coral-400 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-coral-500/25 transition hover:brightness-105"
        >
          {t("heroCtaGrade")}
        </Link>
      </section>
    </div>
  );
}
