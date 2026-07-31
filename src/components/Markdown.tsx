"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidRenderer from "./MermaidRenderer";

/**
 * Renders Claude's grading output.
 *
 * The one non-obvious piece: a ```mermaid fence is intercepted and handed to
 * MermaidRenderer instead of being printed as code. Everything else is normal
 * GitHub-flavoured markdown — the mark-allocation tables need remark-gfm.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="biomark-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children: content, ...rest } = props;
            const match = /language-(\w+)/.exec(className ?? "");
            const text = String(content ?? "");

            if (match?.[1] === "mermaid") {
              return <MermaidRenderer code={text} />;
            }

            // Inline code has no language class and no trailing newline.
            const isBlock = className !== undefined || text.includes("\n");
            if (!isBlock) {
              return (
                <code
                  className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-700 dark:bg-slate-800 dark:text-emerald-300"
                  {...rest}
                >
                  {content}
                </code>
              );
            }

            return (
              <pre className="my-4 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-900">
                <code className={className} {...rest}>
                  {content}
                </code>
              </pre>
            );
          },

          // Wide mark-allocation tables must scroll inside their own box
          // rather than making the whole page scroll sideways.
          table({ children: content }) {
            return (
              <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full border-collapse text-sm">{content}</table>
              </div>
            );
          },
          thead({ children: content }) {
            return (
              <thead className="bg-slate-50 dark:bg-slate-800/60">{content}</thead>
            );
          },
          th({ children: content }) {
            return (
              <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                {content}
              </th>
            );
          },
          td({ children: content }) {
            return (
              <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {content}
              </td>
            );
          },
          blockquote({ children: content }) {
            return (
              <blockquote className="my-4 rounded-r-lg border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                {content}
              </blockquote>
            );
          },
          h1: ({ children: c }) => (
            <h1 className="mt-6 mb-3 text-2xl font-bold tracking-tight text-slate-900 first:mt-0 dark:text-white">
              {c}
            </h1>
          ),
          h2: ({ children: c }) => (
            <h2 className="mt-6 mb-2 border-b border-slate-200 pb-1 text-xl font-semibold text-slate-900 first:mt-0 dark:border-slate-700 dark:text-white">
              {c}
            </h2>
          ),
          h3: ({ children: c }) => (
            <h3 className="mt-5 mb-2 text-base font-semibold text-emerald-700 dark:text-emerald-400">
              {c}
            </h3>
          ),
          p: ({ children: c }) => (
            <p className="my-2 leading-relaxed text-slate-700 dark:text-slate-300">
              {c}
            </p>
          ),
          ul: ({ children: c }) => (
            <ul className="my-2 list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300">
              {c}
            </ul>
          ),
          ol: ({ children: c }) => (
            <ol className="my-2 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-300">
              {c}
            </ol>
          ),
          strong: ({ children: c }) => (
            <strong className="font-semibold text-slate-900 dark:text-white">
              {c}
            </strong>
          ),
          hr: () => <hr className="my-6 border-slate-200 dark:border-slate-700" />,
          a: ({ children: c, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 underline underline-offset-2 hover:text-emerald-500 dark:text-emerald-400"
            >
              {c}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
