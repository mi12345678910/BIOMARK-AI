/**
 * Routing between the two grading modes.
 *
 * CASE 1 — the student's question matches one in the marking-scheme bank.
 *          We can mark it properly, point by point.
 * CASE 2 — no match. We can't award marks honestly, so we fall back to the
 *          lecturer's own notes and explain the concept instead.
 *
 * Both are plain term-overlap search. No model, no network.
 */

import { CHAPTERS, type Structured } from "../data/bank.ts";
import { NOTES, type NoteSection } from "../data/notes.ts";
import type { QuestionPart } from "./marking.ts";

/**
 * Words that carry no power to identify WHICH question is being asked.
 *
 * The second group matters as much as the first. Rarity alone marks a term as
 * identifying, and words like "importance", "assumptions" and "law" happen to
 * appear in only one or two stored prompts — so IDF scored them higher than
 * "mice", and a student asking "what is the importance of the S phase?" was
 * handed the mark scheme for a past-year figure question. They are exam
 * phrasing, not data, and must never anchor a match.
 */
const STOP = new Set([
  // structural
  "the", "a", "an", "of", "in", "on", "at", "to", "for", "and", "or", "is",
  "are", "was", "were", "be", "been", "this", "that", "these", "those", "it",
  "its", "as", "by", "with", "from", "which", "what", "how", "why", "state",
  "give", "explain", "describe", "define", "list", "name", "calculate",
  "determine", "show", "your", "you", "my", "answer", "question", "marks",
  "mark", "following", "above", "below", "figure", "table", "shows", "shown",
  "if", "then", "than", "there", "their", "has", "have", "will", "can", "not",

  // Exam phrasing — words a question is ASKED with, never words that say
  // WHICH question it is. Rarity alone rated these above "mice", so a
  // student asking "what is the importance of the S phase?" was handed a
  // past-year scheme.
  //
  // Deliberately NOT listed: "stage", "phase", "labelled", "event". Those
  // read like phrasing but are the entire identity of the figure questions
  // ("FIGURE 2 shows the stages of the cell cycle, labelled P, Q, R and S").
  // Removing them made one paper indistinguishable from another and the
  // wrong scheme was applied.
  "importance", "important", "significance", "significant",
  "assumption", "assumptions", "condition", "conditions",
  "law", "principle", "principles", "equation", "formula",
  "difference", "differences", "similarity", "similarities",
  "role", "roles", "function", "functions", "process", "processes",
  "individual", "individuals", "suffer", "suffering", "suffered",
  "diagram", "based", "using", "used", "assume",

  // connectives — "during" was scoring as an identifying term and matched
  // "what happens during transcription?" to a cell-cycle question
  "during", "when", "while", "where", "after", "before", "between",
  "each", "both", "also", "such", "does", "happen", "happens", "into",
  "about", "many", "much", "would", "were", "given", "below", "over",
]);

export function tokenise(text: string): string[] {
  return (
    text
      .toLowerCase()
      // Thousands separators first: the bank stores "12,750" and "15 000" as
      // printed, so without this they split into "12"/"750" and never match a
      // student who typed "12750" — losing the very number that identifies
      // the question.
      .replace(/(\d)[,\s](\d{3})\b/g, "$1$2")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
  );
}

/* ── Term weighting ────────────────────────────────────────────────────── */

/**
 * How rare a term is across the whole bank (inverse document frequency).
 *
 * Counting matched terms equally was the bug behind canned schemes hijacking
 * custom questions. Every Population Genetics prompt contains "frequency",
 * "allele", "population" and "recessive", so ANY question on the topic matched
 * two-thirds of a stored prompt and triggered its mark scheme — even though
 * the terms that actually identify it ("albinism", "babies", "14") were absent.
 *
 * Weighting by rarity fixes that: the shared vocabulary counts for almost
 * nothing and the distinctive nouns carry the match.
 */
const IDF: Map<string, number> = (() => {
  const docs: string[][] = [];
  for (const chapter of CHAPTERS) {
    for (const q of chapter.structured) {
      for (const part of q.parts) {
        docs.push([...new Set(tokenise(`${q.intro ?? ""} ${part.prompt}`))]);
      }
    }
  }

  const seenIn = new Map<string, number>();
  for (const doc of docs) {
    for (const term of doc) seenIn.set(term, (seenIn.get(term) ?? 0) + 1);
  }

  const idf = new Map<string, number>();
  for (const [term, count] of seenIn) {
    // Squared, because plain IDF is too flat on a corpus this small: with 53
    // documents "frequency" (in 16) scored 1.30 against "albinism" (in 1) at
    // 4.07 — only 3× apart, so four generic terms outweighed a unique one.
    // Squaring widens that to ~10× and lets the gate below actually separate
    // a real identification from shared topic vocabulary.
    const raw = Math.log(docs.length / count) + 0.1;
    idf.set(term, raw * raw);
  }
  return idf;
})();

/** Unseen terms are maximally distinctive. */
function weightOf(term: string): number {
  const raw = Math.log(60) + 0.1;
  return IDF.get(term) ?? raw * raw;
}

/* ── Case 1 — find a bankable question ─────────────────────────────────── */

export interface QuestionMatch {
  question: Structured;
  chapterEn: string;
  chapterNumber: number;
  /** 0–1. How much of the question's own wording the student reproduced. */
  score: number;
}

/**
 * Scores each stored question by how many of ITS distinctive terms appear in
 * the student's text. Coverage of the question — not of the student's text —
 * because a student may paste a long answer around a short question.
 */
/**
 * Loose text for phrase comparison: lowercase, punctuation gone, single
 * spaces. Keeps every word, unlike `tokenise`.
 */
function flatten(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Did the student quote this prompt more or less word for word?
 *
 * The strongest signal available, and the one that rescues essays. An essay
 * prompt is a plain instruction — "Describe the events of all phases in
 * mitotic cell division" — built from words every question in the chapter
 * shares, so weighted scoring cannot separate them. Worse, the student's own
 * ANSWER names prophase, metaphase and anaphase, which dragged the match
 * towards the anaphase essay instead.
 *
 * Quoting the instruction settles it.
 */
export function quotesPrompt(studentText: string, prompt: string): boolean {
  const p = flatten(prompt);
  // Short prompts ("Name phase P") are not distinctive enough to decide on.
  if (p.length < 25) return false;
  return flatten(studentText).includes(p);
}

/** Character bigrams — the unit of comparison for fuzzy phrase matching. */
function bigrams(input: string): Set<string> {
  const s = flatten(input);
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

/**
 * How much of this phrase's character structure appears in the student's text,
 * 0–1.
 *
 * Containment rather than a symmetric Dice coefficient, because the student's
 * submission is far longer than the prompt — it holds their whole answer — so
 * a symmetric measure would score every real match near zero.
 *
 * Working on character bigrams rather than whole words is what makes this
 * survive OCR: "populaton" still shares most of its bigrams with "population",
 * and "frequences" with "frequencies". Word-level overlap scored those as a
 * total miss.
 */
export function phraseSimilarity(phrase: string, studentText: string): number {
  const a = bigrams(phrase);
  if (a.size === 0) return 0;
  const b = bigrams(studentText);
  let shared = 0;
  for (const g of a) if (b.has(g)) shared += 1;
  return shared / a.size;
}

export function findQuestionMatch(text: string): QuestionMatch | null {
  const studentTerms = new Set(tokenise(text));
  if (studentTerms.size === 0) return null;

  let best: QuestionMatch | null = null;

  for (const chapter of CHAPTERS) {
    for (const q of chapter.structured) {
      // Score each PART separately and keep the best.
      //
      // Scoring the whole question at once was wrong: a student almost always
      // pastes a single part, so their text covers one prompt out of four and
      // the combined score never clears the threshold. The question is a match
      // if ANY of its parts is clearly the one being asked about.
      const introTerms = [...new Set(tokenise(q.intro ?? ""))];

      // Identification rests on DISTINCTIVE terms only — the species, traits
      // and numbers unique to this paper. Shared topic vocabulary ("allele",
      // "frequency", "population") is excluded entirely, because matching on
      // it is exactly what let unrelated questions trigger a mark scheme.
      //
      // Scored per part, with the intro folded into each: pooling every part
      // instead means a student quoting one sub-part covers only a fraction
      // of the question's vocabulary and never matches.
      let score = 0;

      for (const part of q.parts) {
        const allTerms = [...new Set([...introTerms, ...tokenise(part.prompt)])];
        const identifying = new Set(
          allTerms.filter((t) => weightOf(t) >= DISTINCTIVE_WEIGHT),
        );

        // Checked before the verbatim shortcut, not after: "Calculate the
        // frequency of the dominant allele" is quotable word for word but its
        // scheme reads "p = 1 − 0.37 = 0.63", numbers from a population the
        // student never mentioned. A quote must not bypass that.
        const schemeHasData = part.points.some((p) => /\d/.test(p.text));
        if (identifying.size === 0 && schemeHasData) continue;

        // Verbatim quote beats every weighted heuristic below.
        if (quotesPrompt(text, part.prompt)) {
          score = 1;
          continue;
        }

        // No identifying terms at all — "State the Hardy-Weinberg Principle"
        // is the same sentence in 20 papers, so nothing can single one out.
        // Still markable, because all 20 carry the same scheme points, but
        // capped WELL below a genuine identification.
        //
        // Scoring these 1.0 was the single worst bug in the matcher: a
        // two-token generic prompt beat every real question, and 19 of the 60
        // stored parts stopped identifying even themselves — they all
        // collapsed onto the one paper that happened to own such a part.
        if (identifying.size === 0) {
          if (allTerms.length < 2) continue;
          const hits = allTerms.filter((t) => studentTerms.has(t)).length;
          const verbatim = hits / allTerms.length;
          if (verbatim >= VERBATIM_CONFIDENCE) {
            score = Math.max(score, GENERIC_PROMPT_CEILING * verbatim);
          }
          continue;
        }

        let matchedWeight = 0;
        let totalWeight = 0;
        let matchedCount = 0;
        let anchored = false;
        for (const t of identifying) {
          const w = weightOf(t);
          totalWeight += w;
          if (studentTerms.has(t)) {
            matchedWeight += w;
            matchedCount += 1;
            if (w >= ANCHOR_WEIGHT) anchored = true;
          }
        }

        const ratioOfIdentifying = matchedWeight / totalWeight;

        // Two independent rare terms minimum. One is never enough: a lone
        // uncommon word ("importance") previously carried a match by itself.
        if (matchedCount < 2 || matchedWeight < MIN_EVIDENCE) continue;

        // An anchor is a near-unique term — "36", "snails", "12750". Most
        // papers have one, but definition questions ("State the Hardy-Weinberg
        // Principle") genuinely do not, and requiring one rejected them
        // outright: a student pasting a real question with their answer got
        // notes instead of marks.
        //
        // So it is not required on its own. It lets a partial quote through,
        // while a submission without one must instead reproduce nearly all of
        // the question's identifying wording.
        if (!anchored && ratioOfIdentifying < STRICT_CONFIDENCE) continue;

        // Blend the two views of the match.
        //
        // Rare-term coverage alone decides on a handful of words — which
        // question owns "36" and "mice" — and cannot tell two similarly-worded
        // papers apart. Character-bigram similarity reads the phrasing of the
        // whole prompt, so a paper the student actually quoted outranks one
        // that merely shares its numbers, and it degrades gracefully on OCR
        // noise instead of failing outright.
        const phrase = phraseSimilarity(
          `${q.intro ?? ""} ${part.prompt}`.trim(),
          text,
        );
        score = Math.max(score, 0.6 * ratioOfIdentifying + 0.4 * phrase);
      }

      // A question built around a diagram cannot be answered without it.
      // "Name the stages labelled P, Q, R and S" is meaningless unless the
      // student is looking at FIGURE 2 — so a generic query like "what are
      // the stages of the cell cycle?" must not be handed its scheme. Require
      // the student to actually reference the figure.
      if (q.figure && !/\bfigure\b|\brajah\b/i.test(text)) continue;

      if (score > 0 && (!best || score > best.score)) {
        best = {
          question: q,
          chapterEn: chapter.en,
          chapterNumber: chapter.number,
          score,
        };
      }
    }
  }

  // High bar on purpose. Returning a stored mark scheme for a question the
  // student did not ask is worse than not matching at all: they get a canned
  // answer to someone else's question instead of an explanation of their own.
  // Anything below this falls through to the lecturer's notes.
  return best && best.score >= MATCH_CONFIDENCE ? best : null;
}

/**
 * Weighted coverage a submission must reach before its stored mark scheme is
 * used. Raise it to be stricter (more questions explained from notes), lower
 * it to match more past-year papers.
 */
export const MATCH_CONFIDENCE = 0.35;

/**
 * Minimum total rare-term weight a match must rest on.
 *
 * Roughly "the student reproduced at least one or two terms unique to this
 * question" — the numbers, species and traits that identify a specific paper
 * (36%, snails, albinism, eyelashes) rather than the vocabulary every
 * question on the topic shares.
 */
export const MIN_EVIDENCE = 9;

/**
 * Squared-IDF weight at which a term counts as identifying rather than
 * topical. Around here sit the species, traits and numbers unique to one
 * paper; below it the vocabulary every question on the chapter shares.
 */
export const DISTINCTIVE_WEIGHT = 4;

/**
 * Weight at which a term is near-unique to one paper — its data, species or
 * named disease. A match must rest on at least one of these.
 */
export const ANCHOR_WEIGHT = 7;

/**
 * Coverage a submission must reach when it has no anchor term.
 *
 * Definition questions ("State the Hardy-Weinberg Principle") carry no data
 * to anchor on, so they qualify a different way: by reproducing almost all of
 * the question's identifying wording.
 */
export const STRICT_CONFIDENCE = 0.75;

/**
 * Bar for a question that has no identifying terms whatsoever, where the only
 * evidence available is that the student reproduced its wording almost
 * exactly.
 */
export const VERBATIM_CONFIDENCE = 0.9;

/**
 * Ceiling on a question identified only by generic wording.
 *
 * "State the Hardy-Weinberg Principle" appears in 20 papers, so matching it is
 * a guess between them — useful, since they share a scheme, but it must never
 * outrank a paper the student actually identified. Held below
 * MATCH_CONFIDENCE's practical range so any real match wins.
 */
export const GENERIC_PROMPT_CEILING = 0.5;

/** Which stored part best matches a chunk of the student's text. */
export function bestPartFor(
  question: Structured,
  text: string,
): QuestionPart | null {
  const studentTerms = new Set(tokenise(text));
  let best: { part: QuestionPart; score: number } | null = null;

  for (const part of question.parts) {
    const terms = [...new Set(tokenise(part.prompt))];
    if (!terms.length) continue;
    const score = terms.filter((t) => studentTerms.has(t)).length / terms.length;
    if (!best || score > best.score) best = { part, score };
  }
  return best?.part ?? null;
}

/**
 * Did the student actually attempt an answer, or just submit the question?
 *
 * A question pasted (or photographed) on its own must not be marked: every
 * scheme point would fail and the student would be told 0/3 for asking a
 * question. Instead they should be shown how the marks are awarded.
 *
 * Two independent signals of an attempt, either is enough:
 *  - words that are not in the question itself, i.e. they wrote something new
 *  - numbers that are not in the question, i.e. they calculated something
 *
 * The numeric check matters because `tokenise` drops decimals ("0.64" has no
 * token longer than two characters), so a purely numeric answer would
 * otherwise look like no attempt at all.
 */
export function hasAttempt(question: Structured, text: string): boolean {
  const questionText = [
    question.intro ?? "",
    ...question.parts.map((p) => p.prompt),
  ].join(" ");

  // An explicit answer marker with something after it. This is the strongest
  // signal and the only one that catches a one-word answer: "Name phase P. My
  // answer: interphase" adds a single new word, well under any word count,
  // and was being shown a model answer instead of being marked.
  if (/\b(my answer|answer|jawapan(?:\s+saya)?)\s*[:\-–]\s*\S+/i.test(text)) {
    return true;
  }

  const questionTerms = new Set(tokenise(questionText));
  const newWords = new Set(tokenise(text).filter((t) => !questionTerms.has(t)));
  if (newWords.size >= 3) return true;

  // Normalise thousands separators before comparing, exactly as `tokenise`
  // does. Without it the stored "12,750" reads as 12 and 750, so a student
  // pasting "12750" looked like they had calculated something new — and a
  // question with no answer was marked 0.
  const numbersIn = (s: string) =>
    s
      // Question and sub-part numbering is not working out. "1." at the start
      // of a line was counted as a number the student had produced, so a
      // question pasted with its numbering intact looked like an attempt and
      // was marked 0.
      .replace(/^\s*\d+\s*[.)]/gm, " ")
      .replace(/(\d)[,\s](\d{3})\b/g, "$1$2")
      .match(/\d+(?:\.\d+)?/g) ?? [];
  const questionNumbers = new Set(numbersIn(questionText));
  const newNumbers = numbersIn(text).filter((n) => !questionNumbers.has(n));

  return newNumbers.length > 0;
}

/**
 * Single-letter labels tied to what they label — "phase P", "stage Q".
 *
 * `tokenise` drops anything under three characters, so "Name phase P" and
 * "Explain the importance of phase R" both reduce to ["phase"]: identical, and
 * both were marked when a student answered only one. The letter IS the
 * distinction, so it has to be read before tokenising.
 */
function labelsIn(text: string): Set<string> {
  const out = new Set<string>();
  const re = /\b(phase|stage|figure|region|point|label(?:led)?)\s+([a-z0-9])\b/gi;
  for (const m of text.matchAll(re)) {
    out.add(`${m[1].toLowerCase()} ${m[2].toLowerCase()}`);
  }
  return out;
}

/**
 * The parts of a stored question the student actually asked about.
 *
 * A past-year question usually has several parts, and a student submits one of
 * them. Marking all of them scores the student against work they never
 * attempted — a correct single answer came back as 3/10 instead of 3/3, with
 * three unrelated parts listed as failed. Only parts whose wording the student
 * clearly reproduced are marked.
 */
/**
 * Sub-part labels the student's text actually contains — "(a)", "(b)(ii)".
 *
 * These survive OCR far better than prose does: a photographed page comes back
 * with "populaton", "mce" and "eyeIashes", but "(c)" stays "(c)". Coverage
 * scoring alone therefore dropped the later parts of a multi-part question —
 * a whole question photographed was marked out of 6 instead of 10, and with
 * worse scans only part (a) survived.
 */
function partsExplicitlyLabelled(
  question: Structured,
  text: string,
): QuestionPart[] {
  // "(a) (i)" and "(a)(i)" are the same reference.
  const flat = text.toLowerCase().replace(/\s+/g, " ").replace(/\)\s*\(/g, ")(");

  return question.parts.filter((part) => {
    const ref = part.ref.toLowerCase().replace(/\s+/g, "");

    // Nested refs like "(a)(ii)". Papers print the parent letter once and then
    // list the children bare:
    //     1. (a) (i)  State the ...
    //            (ii) List TWO ...
    // so "(a)(ii)" never appears literally and the second sub-part was being
    // dropped from every multi-part submission.
    const nested = ref.match(/^\(([a-z])\)\(([ivx]+)\)$/);
    if (nested) {
      const [, parent, child] = nested;
      if (flat.includes(`(${parent})(${child})`)) return true;
      return flat.includes(`(${parent})`) && flat.includes(`(${child})`);
    }

    const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Negative lookahead so a bare "(b)" doesn't also match "(b)(i)", which
    // would select the parent alongside every one of its children.
    return new RegExp(`${escaped}(?!\\()`).test(flat);
  });
}

export function selectRelevantParts(
  question: Structured,
  text: string,
): QuestionPart[] {
  // If the submission names its sub-parts, trust that over term overlap.
  const labelled = partsExplicitlyLabelled(question, text);
  if (labelled.length > 0) return labelled;

  const studentTerms = new Set(tokenise(text));

  // Prompts quoted word for word are definitely being answered.
  const quoted = new Set(
    question.parts.filter((p) => quotesPrompt(text, p.prompt)),
  );

  const studentLabels = labelsIn(text);

  const scored = question.parts.map((part) => {
    const terms = [...new Set(tokenise(part.prompt))];
    let score = terms.length
      ? terms.filter((t) => studentTerms.has(t)).length / terms.length
      : 0;

    // If both the student and this part name a label, they must be the same
    // one. Without this a student answering "Name phase P" was also marked on
    // "Explain the importance of phase R" and scored 1/4 instead of 1/1.
    const partLabels = labelsIn(part.prompt);
    if (partLabels.size > 0 && studentLabels.size > 0) {
      const shared = [...partLabels].some((l) => studentLabels.has(l));
      if (!shared) score = 0;
    }

    return { part, score };
  });

  const top = Math.max(...scored.map((s) => s.score));

  // Nothing resembles any part — fall back to the single closest so the
  // student still gets marked on something rather than on everything.
  if (top < 0.3 && quoted.size === 0) {
    const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
    return [best.part];
  }

  // Keep parts close to the best match: this admits a student who answered
  // (a)(i) and (a)(ii) together, without dragging in unrelated parts.
  //
  // Quoted parts are unioned in rather than replacing the scored ones. A
  // student who quotes one prompt exactly and paraphrases the next was
  // otherwise marked on the quoted part alone, losing the other.
  return question.parts.filter(
    (part) =>
      quoted.has(part) ||
      scored.some(
        (s) => s.part === part && s.score >= Math.max(0.3, top * 0.6),
      ),
  );
}

/* ── Case 2 — explain from the lecturer's notes ────────────────────────── */

export interface NoteMatch {
  section: NoteSection;
  score: number;
  /** Terms from the student's text that this section covers. */
  matchedTerms: string[];
}

/**
 * Ranks note sections by how many of the student's terms they contain, with
 * the learning-outcome line weighted heavily — a term appearing in the outcome
 * is a much stronger topic signal than one buried in a bullet.
 */
export function searchNotes(
  text: string,
  limit = 3,
  /**
   * When the submission matched a bank question we already know its chapter.
   * Sections from that chapter are strongly preferred — shared vocabulary
   * across chapters (allele, frequency, dominant) otherwise pulls in material
   * from an unrelated topic, which reads as a misunderstanding.
   */
  preferChapter?: number,
): NoteMatch[] {
  const terms = [...new Set(tokenise(text))];
  if (!terms.length) return [];

  const scored: NoteMatch[] = [];

  for (const section of NOTES) {
    const outcome = section.outcome.toLowerCase();
    const body = section.content.join(" ").toLowerCase();

    let score = 0;
    const matchedTerms: string[] = [];

    for (const term of terms) {
      const inOutcome = outcome.includes(term);
      const inBody = body.includes(term);
      if (inOutcome) score += 3;
      else if (inBody) score += 1;
      if (inOutcome || inBody) matchedTerms.push(term);
    }

    if (score > 0) {
      // Normalise so a long section isn't favoured purely for being long.
      let final = score / Math.sqrt(terms.length);
      if (preferChapter !== undefined && section.chapter === preferChapter) {
        final *= 2;
      }
      scored.push({ section, score: final, matchedTerms });
    }
  }

  const ranked = scored.sort((a, b) => b.score - a.score).slice(0, limit);
  if (ranked.length === 0) return ranked;

  // Drop trailing weak matches. Without this, asking for 2 results always
  // returns 2 — the second often being an unrelated chapter that happens to
  // share a common word, which reads as if the app misunderstood the question.
  const top = ranked[0]!.score;
  return ranked.filter((r) => r.score >= top * 0.55);
}
