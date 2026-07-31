"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DnaHelix } from "@/components/BioArt";
import { useI18n } from "@/lib/i18n";

export default function Navbar() {
  const { lang, setLang, t } = useI18n();
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: t("navHome") },
    { href: "/grader", label: t("navGrader") },
    { href: "/quiz", label: t("navQuiz") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-teal-900/10 bg-[#fdf6e8]/85 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1f26]/85">
      <nav className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-500 shadow-sm">
            <DnaHelix className="h-6 w-3.5" />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-base font-bold tracking-tight text-[#14343f] dark:text-white">
              BioMark <span className="text-coral-500">AI</span>
            </span>
            <span className="text-[10px] font-medium text-[#14343f]/65 dark:text-slate-400">
              {t("tagline")}
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-0.5 rounded-2xl border border-teal-900/10 bg-white/60 p-1 dark:border-white/10 dark:bg-white/5">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-[#14343f]/65 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div
          className="flex items-center overflow-hidden rounded-2xl border border-teal-900/15 dark:border-white/15"
          role="group"
          aria-label={t("langLabel")}
        >
          {(["en", "bm"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={`px-3 py-1.5 text-xs font-bold tracking-wide transition ${
                lang === code
                  ? "bg-coral-500 text-white"
                  : "text-[#14343f]/65 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-white/10"
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
