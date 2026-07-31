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

/** Words too common in biology questions to carry signal. */
const STOP = new Set([
  "the", "a", "an", "of", "in", "on", "at", "to", "for", "and", "or", "is",
  "are", "was", "were", "be", "been", "this", "that", "these", "those", "it",
  "its", "as", "by", "with", "from", "which", "what", "how", "why", "state",
  "give", "explain", "describe", "define", "list", "name", "calculate",
  "determine", "show", "your", "you", "my", "answer", "question", "marks",
  "mark", "following", "above", "below", "figure", "table", "shows", "shown",
  "if", "then", "than", "there", "their", "has", "have", "will", "can", "not",
]);

export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
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
      let bestPartScore = 0;

      for (const part of q.parts) {
        const terms = [
          ...new Set(tokenise(`${q.intro ?? ""} ${part.prompt}`)),
        ];
        if (terms.length === 0) continue;
        const hits = terms.filter((t) => studentTerms.has(t)).length;
        bestPartScore = Math.max(bestPartScore, hits / terms.length);
      }

      if (!best || bestPartScore > best.score) {
        best = {
          question: q,
          chapterEn: chapter.en,
          chapterNumber: chapter.number,
          score: bestPartScore,
        };
      }
    }
  }

  // Below this the "match" is coincidental shared vocabulary, and marking
  // against the wrong scheme is worse than not marking at all.
  return best && best.score >= 0.35 ? best : null;
}

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
export function searchNotes(text: string, limit = 3): NoteMatch[] {
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
      scored.push({ section, score: score / Math.sqrt(terms.length), matchedTerms });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
