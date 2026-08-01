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

  // exam and syllabus phrasing — common to every paper, unique to none
  "importance", "important", "significance", "significant",
  "assumption", "assumptions", "condition", "conditions",
  "law", "principle", "principles", "equation", "formula",
  "stage", "stages", "phase", "phases", "step", "steps",
  "event", "events", "occur", "occurs", "occurring",
  "difference", "differences", "similarity", "similarities",
  "role", "roles", "function", "functions", "process", "processes",
  "individual", "individuals", "suffer", "suffering", "suffered",
  "labelled", "labeled", "diagram", "based", "using", "used", "assume",

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
        const identifying = new Set<string>();
        for (const t of [...introTerms, ...tokenise(part.prompt)]) {
          if (weightOf(t) >= DISTINCTIVE_WEIGHT) identifying.add(t);
        }
        if (identifying.size === 0) continue;

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

        // Two independent rare terms minimum. One is never enough: a lone
        // uncommon word ("importance") previously carried a match by itself.
        if (matchedCount < 2 || matchedWeight < MIN_EVIDENCE) continue;

        // And at least one near-unique term — the data that identifies a
        // specific paper: "36", "snails", "12750", "thalassemia".
        //
        // Without this, a generic query ("What are the stages of the cell
        // cycle?") matched a past-year question whose whole vocabulary is
        // syllabus wording, and the student got P/Q/R/S scheme points for a
        // figure they never saw. A student quoting a real paper always
        // reproduces its numbers or species; one asking their own question
        // never does.
        if (!anchored) continue;

        score = Math.max(score, matchedWeight / totalWeight);
      }

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

  const questionTerms = new Set(tokenise(questionText));
  const newWords = new Set(
    tokenise(text).filter((t) => !questionTerms.has(t)),
  );
  if (newWords.size >= 3) return true;

  const numbersIn = (s: string) => s.match(/\d+(?:\.\d+)?/g) ?? [];
  const questionNumbers = new Set(numbersIn(questionText));
  const newNumbers = numbersIn(text).filter((n) => !questionNumbers.has(n));

  return newNumbers.length > 0;
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
export function selectRelevantParts(
  question: Structured,
  text: string,
): QuestionPart[] {
  const studentTerms = new Set(tokenise(text));

  const scored = question.parts.map((part) => {
    const terms = [...new Set(tokenise(part.prompt))];
    const score = terms.length
      ? terms.filter((t) => studentTerms.has(t)).length / terms.length
      : 0;
    return { part, score };
  });

  const top = Math.max(...scored.map((s) => s.score));

  // Nothing resembles any part — fall back to the single closest so the
  // student still gets marked on something rather than on everything.
  if (top < 0.3) {
    const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
    return [best.part];
  }

  // Keep parts close to the best match: this admits a student who answered
  // (a)(i) and (a)(ii) together, without dragging in unrelated parts.
  return scored
    .filter((s) => s.score >= Math.max(0.3, top * 0.6))
    .map((s) => s.part);
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
