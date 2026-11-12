/**
 * The short, personal explanation at the head of "Why you lost those marks".
 *
 * Pasting the lecturer's notes on their own left the student to work out what
 * the notes had to do with their answer. This compares what they actually
 * wrote with the scheme points they missed and says so in one or two
 * sentences: the KPM keywords they used, the ones they left out, and the
 * scheme point those keywords carry.
 *
 * Built from the marking result alone — no API, no model — so it is
 * deterministic and works offline like the rest of the grader.
 */

import { normalise, type PartResult, type PointResult } from "./marking.ts";

export type FeedbackLang = "en" | "bm";

const WORD_CHAR = /[A-Za-z0-9\-]/;
const MAX_KEYWORDS = 3;
const MAX_POINTS = 2;
const MAX_QUOTE = 90;

/**
 * The whole word in `text` that a bank alternative matched. The bank stores
 * stems — "replicat", "synthesi" — and the student should see their own word,
 * "replicated", not the stem. Null when the alternative is not in the text.
 */
export function wordFor(text: string, alternative: string): string | null {
  const needle = normalise(alternative.replace(/^=/, ""));
  if (!needle) return null;
  const pattern = needle
    .split(" ")
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\s\\-]+");
  const m = new RegExp(pattern, "i").exec(text);
  if (!m) return null;
  let start = m.index;
  let end = m.index + m[0].length;
  while (start > 0 && WORD_CHAR.test(text[start - 1]!)) start--;
  while (end < text.length && WORD_CHAR.test(text[end]!)) end++;
  const word = text.slice(start, end).replace(/^-+|-+$/g, "");
  // A runaway match (hyphen-joined chain) reads worse than the plain stem.
  return word && word.length <= 40 ? word : needle;
}

/** "Mitosis" → "mitosis" mid-sentence; "EcoRI", "G1", "DNA" stay as written. */
function midSentence(word: string): string {
  return /^[A-Z][^A-Z0-9]*$/.test(word) ? word[0]!.toLowerCase() + word.slice(1) : word;
}

/** The most readable name for a keyword group the student failed to use. */
function keywordFor(group: string[], pointText: string): string {
  for (const alt of group) {
    const w = wordFor(labelled(pointText).body, alt);
    if (w) return midSentence(w);
  }
  const clean = group.map((a) => a.replace(/^=/, ""));
  return clean.find((a) => a.length >= 4) ?? clean[0] ?? "";
}

/**
 * Figure-label schemes write "Q: G1 / Gap 1" — the answer for label Q. Quoting
 * that whole line after naming "G1" says the same thing twice, so the label is
 * split off and named instead.
 */
function labelled(text: string): { label: string | null; body: string } {
  const m = /^\s*([A-Z]{1,2}|[IVX]{1,4})\s*:\s*(.+)$/.exec(text);
  return m ? { label: m[1]!, body: m[2]! } : { label: null, body: text };
}

function uniq(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((x) => {
    const k = x.toLowerCase();
    if (!x || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function quote(s: string): string {
  return `“${s}”`;
}

function list(items: string[], lang: FeedbackLang): string {
  const q = items.map(quote);
  const and = lang === "bm" ? "dan" : "and";
  if (q.length <= 1) return q.join("");
  return `${q.slice(0, -1).join(", ")} ${and} ${q[q.length - 1]}`;
}

/** A scheme line short enough to sit inside a sentence. */
function shortPoint(text: string): string {
  const t = text.trim().replace(/[.;]+$/, "");
  if (t.length <= MAX_QUOTE) return t;
  const cut = t.slice(0, MAX_QUOTE);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 40))}…`;
}

/**
 * One or two sentences on why this part lost marks, or null when it lost none.
 *
 * @param answer   everything the student submitted for the question
 * @param question the question's own wording (intro + prompt) — keywords the
 *                 student only repeated from the question are not praised
 */
export function explainLostMarks(
  pr: PartResult,
  answer: string,
  question: string,
  lang: FeedbackLang,
): string | null {
  if (pr.awarded >= pr.maximum) return null;
  const missed = pr.results.filter((r) => !r.earned);
  if (missed.length === 0) return null;

  const ref = pr.part.ref;
  const score = `${pr.awarded}/${pr.maximum}`;
  const questionNorm = normalise(question);
  const ownWords = (r: PointResult) =>
    r.matched
      .filter((alt) => !questionNorm.includes(normalise(alt.replace(/^=/, ""))))
      .map((alt) => wordFor(answer, alt))
      .filter((w): w is string => !!w);

  // Near misses first — a point where the student had part of the idea is the
  // most useful thing to point at — then the highest-value points.
  const near = missed.filter((r) => ownWords(r).length > 0);
  const rest = missed
    .filter((r) => ownWords(r).length === 0)
    .sort((a, b) => b.point.marks - a.point.marks);
  const ordered = [...near, ...rest];

  const earnedCount = pr.results.filter((r) => r.earned).length;
  const anyOf = pr.part.anyOf;
  const needed = anyOf ? Math.max(1, anyOf - earnedCount) : ordered.length;
  const cited = ordered.slice(0, Math.min(MAX_POINTS, needed));

  const wrote = uniq(pr.results.flatMap(ownWords)).slice(0, MAX_KEYWORDS);
  const missing = uniq(
    cited.flatMap((r) => r.missingGroups.map((g) => keywordFor(g, r.point.text))),
  ).slice(0, MAX_KEYWORDS);

  // A calculation's missing "keywords" are numbers from the working.
  const numeric = missing.length > 0 && missing.every((m) => /^[\d.\s/=x×+\-]+$/.test(m));
  const noun = (n: number) =>
    lang === "bm"
      ? numeric
        ? "nilai"
        : "kata kunci KPM"
      : numeric
        ? n === 1
          ? "value"
          : "values"
        : n === 1
          ? "KPM keyword"
          : "KPM keywords";

  // Sentence 1 — the score, what they used, what they left out.
  let first: string;
  if (lang === "bm") {
    first =
      wrote.length > 0
        ? `Bagi ${ref}, anda memperoleh ${score}: anda menggunakan ${list(wrote, lang)} dengan betul, tetapi terlepas ${noun(missing.length)} ${list(missing, lang)}.`
        : `Bagi ${ref}, anda memperoleh ${score}: jawapan anda tidak mengandungi ${noun(2)} yang dicari oleh skema, seperti ${list(missing, lang)}.`;
  } else {
    first =
      wrote.length > 0
        ? `In ${ref} you scored ${score}: you correctly used ${list(wrote, lang)}, but missed the ${noun(missing.length)} ${list(missing, lang)}.`
        : `In ${ref} you scored ${score}: your answer did not include the ${noun(2)} the scheme looks for, such as ${list(missing, lang)}.`;
  }

  // Sentence 2 — the biological concept behind those keywords.
  const top = cited[0]!;
  const topOwn = uniq(ownWords(top));
  const and = lang === "bm" ? "dan" : "and";
  const join2 = (xs: string[]) => (xs.length > 1 ? `${xs[0]} ${and} ${xs[1]}` : xs[0]!);
  const parsed = cited.map((r) => labelled(r.point.text));
  const pointList = join2(parsed.map((p) => quote(shortPoint(p.body))));
  const labels = parsed.every((p) => p.label) ? parsed.map((p) => p.label!) : null;
  const extra = anyOf ? 0 : Math.max(0, ordered.length - cited.length);
  const topParsed = labelled(top.point.text);

  let second: string;
  if (topOwn.length > 0) {
    const where = topParsed.label
      ? lang === "bm"
        ? ` bagi label ${topParsed.label}`
        : ` for label ${topParsed.label}`
      : "";
    second =
      lang === "bm"
        ? `Menyebut ${list(topOwn, lang)} sahaja tidak mencukupi: isi skema${where} ialah ${quote(shortPoint(topParsed.body))}.`
        : `Naming ${list(topOwn, lang)} alone was not enough: the scheme point${where} is ${quote(shortPoint(topParsed.body))}.`;
  } else if (labels) {
    const more =
      extra > 0
        ? lang === "bm"
          ? `, serta ${extra} label lain yang disenaraikan di atas`
          : `, plus ${extra} more label${extra === 1 ? "" : "s"} listed above`
        : "";
    second =
      lang === "bm"
        ? `Itulah jawapan yang dikehendaki bagi label ${join2(labels)}${more}.`
        : `${labels.length === 1 ? "That is the answer" : "Those are the answers"} expected for label${labels.length === 1 ? "" : "s"} ${join2(labels)}${more}.`;
  } else if (anyOf) {
    second =
      lang === "bm"
        ? `Bahagian ini menerima mana-mana ${anyOf} isi dan anda memberi ${earnedCount}, jadi tambah isi seperti ${pointList}.`
        : `This part accepts any ${anyOf} points and you gave ${earnedCount}, so add points such as ${pointList}.`;
  } else if (lang === "bm") {
    second = `${numeric ? "Nilai itu datang daripada langkah skema" : "Kata kunci itu membawa isi skema"} ${pointList}${extra > 0 ? `, serta ${extra} isi lain yang disenaraikan di atas` : ""}.`;
  } else {
    const lead = numeric
      ? `${missing.length === 1 ? "That value comes" : "Those values come"} from the working step${cited.length === 1 ? "" : "s"}`
      : `${missing.length === 1 ? "That keyword carries" : "Those keywords carry"} the scheme point${cited.length === 1 ? "" : "s"}`;
    second = `${lead} ${pointList}${extra > 0 ? `, plus ${extra} more point${extra === 1 ? "" : "s"} listed above` : ""}.`;
  }

  return `${first} ${second}`;
}
