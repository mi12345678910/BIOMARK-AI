"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders a Mermaid diagram emitted by Claude.
 *
 * Three things this has to survive, because the input is model output:
 *
 *  1. **Invalid syntax.** `mermaid.parse` throws rather than returning false,
 *     so every call is wrapped. On failure we show the raw code instead of an
 *     empty box — a student can still read it, and it makes the bug obvious.
 *  2. **Streaming.** While the grader streams, a fenced block arrives one
 *     fragment at a time and is invalid for most of its life. We debounce and
 *     simply keep the last good render until a newer one parses.
 *  3. **Theme.** Mermaid bakes colours in at render time, so a light/dark
 *     switch has to trigger a full re-render, not just a CSS swap.
 */

let mermaidReady: Promise<typeof import("mermaid").default> | null = null;

function loadMermaid(dark: boolean) {
  // Re-initialise on theme change; the import itself is cached by the bundler.
  mermaidReady = import("mermaid").then((mod) => {
    mod.default.initialize({
      startOnLoad: false,
      securityLevel: "strict", // no click handlers, no raw HTML from model output
      theme: dark ? "dark" : "base",
      themeVariables: dark
        ? {
            primaryColor: "#064e3b",
            primaryTextColor: "#d1fae5",
            primaryBorderColor: "#10b981",
            lineColor: "#34d399",
            secondaryColor: "#1e293b",
            tertiaryColor: "#0f172a",
            fontSize: "14px",
          }
        : {
            primaryColor: "#d1fae5",
            primaryTextColor: "#064e3b",
            primaryBorderColor: "#059669",
            lineColor: "#047857",
            secondaryColor: "#f1f5f9",
            tertiaryColor: "#ffffff",
            fontSize: "14px",
          },
      flowchart: { curve: "basis", htmlLabels: false },
    });
    return mod.default;
  });
  return mermaidReady;
}

export default function MermaidRenderer({ code }: { code: string }) {
  const reactId = useId();
  const domId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);
  const lastGoodSvg = useRef<string>("");

  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const read = () =>
      setDark(
        document.documentElement.classList.contains("dark") || mq.matches,
      );
    read();
    mq.addEventListener("change", read);
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      mq.removeEventListener("change", read);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const trimmed = code.trim();
    if (!trimmed) return;

    // Debounce: during streaming this fires on every chunk.
    const timer = setTimeout(async () => {
      try {
        const mermaid = await loadMermaid(dark);
        if (cancelled) return;

        // parse() throws on invalid input rather than returning a boolean.
        await mermaid.parse(trimmed);
        const { svg: rendered } = await mermaid.render(domId, trimmed);
        if (cancelled) return;

        lastGoodSvg.current = rendered;
        setSvg(rendered);
        setFailed(false);
      } catch {
        if (cancelled) return;
        // Keep the previous good diagram if we have one — mid-stream fragments
        // are expected to be invalid and shouldn't blank the view.
        if (lastGoodSvg.current) {
          setSvg(lastGoodSvg.current);
        } else {
          setFailed(true);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, dark, domId]);

  if (failed) {
    return (
      <figure className="my-4">
        <pre className="overflow-x-auto rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
          <code>{code.trim()}</code>
        </pre>
        <figcaption className="mt-1 text-xs text-amber-700 dark:text-amber-400">
          Diagram could not be rendered — showing the raw Mermaid source.
        </figcaption>
      </figure>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 flex h-28 animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
        Drawing diagram…
      </div>
    );
  }

  return (
    <figure className="my-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Mermaid output is generated from model text under securityLevel:"strict",
          which strips scripts and event handlers before it reaches us. */}
      <div
        className="mermaid-svg flex min-w-fit justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}
