import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import { BioBackdrop } from "@/components/BioArt";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioMark AI — KPM Matriculation Biology Grader",
  description:
    "Grade KPM Matriculation Biology answers against the official PSPM marking scheme. Point-by-point marks, keyword feedback, and rendered diagrams.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <BioBackdrop />
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-10 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-teal-900/10 py-7 text-center text-xs text-[#14343f]/65 dark:border-white/10 dark:text-slate-300">
            BioMark AI · Marks are indicative — always confirm against your
            lecturer&rsquo;s official scheme
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
