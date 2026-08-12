/**
 * Deciding what to do with a submission.
 *
 * Lifted out of the grader page so it can be tested directly, and so it can
 * handle more than one question at a time. Concatenating every photo into one
 * blob and matching once meant a student who attached two questions had the
 * second silently discarded — only the best-matching one was ever marked.
 */

import { markQuestion, type QuestionPart, type QuestionResult } from "./marking.ts";
import {
  findQuestionMatch,
  hasAttempt,
  searchNotes,
  selectRelevantParts,
  type NoteMatch,
  type QuestionMatch,
} from "./lookup.ts";
import { findDiagram, isDrawingQuestion, type DiagramAnswer } from "../data/diagrams.ts";

export type Routed =
  | { mode: "graded"; match: QuestionMatch; result: QuestionResult; notes: NoteMatch[] }
  | { mode: "modelAnswer"; match: QuestionMatch; parts: QuestionPart[] }
  | { mode: "diagram"; diagram: DiagramAnswer }
  | { mode: "explained"; notes: NoteMatch[] };

/** One piece of the submission: the typed box, or one attached photo. */
export interface Segment {
  /** Shown above the result — "Typed answer" or the file name. */
  label: string;
  text: string;
}

export interface RoutedSegment {
  /** Every source that contributed, so a question split across two photos
   *  reports both. */
  labels: string[];
  routed: Routed;
}

/** Decide the outcome for a single self-contained piece of text. */
export function routeOne(text: string): Routed {
  // Drawing questions first: nothing here can read a hand-drawn diagram, so
  // scoring one would be guesswork.
  if (isDrawingQuestion(text)) {
    const diagram = findDiagram(text);
    if (diagram) return { mode: "diagram", diagram };
    return { mode: "explained", notes: searchNotes(text, 3) };
  }

  const match = findQuestionMatch(text);
  if (!match) return { mode: "explained", notes: searchNotes(text, 3) };

  const parts = selectRelevantParts(match.question, text);

  // A question with no attempt: marking it reports 0 for every scheme point,
  // which teaches nothing. Show how the marks are awarded instead.
  if (!hasAttempt(match.question, text)) {
    return { mode: "modelAnswer", match, parts };
  }

  const answers: Record<string, string> = {};
  for (const part of parts) answers[part.ref] = text;
  const result = markQuestion(parts, answers);

  // Notes covering the concepts behind the points they missed.
  const missedText = result.parts
    .flatMap((pr) => pr.results.filter((r) => !r.earned))
    .map((r) => `${r.point.text} ${r.missingGroups.flat().join(" ")}`)
    .join(" ");

  return {
    mode: "graded",
    match,
    result,
    notes: missedText.trim() ? searchNotes(missedText, 2, match.chapterNumber) : [],
  };
}

/**
 * Split one block of text where it holds several whole questions.
 *
 * A single photo of a page often covers two or three questions, and routing
 * the page as one unit marked only the best-matching one — the rest were
 * discarded with nothing to show they had been.
 *
 * Splits on top-level numbering ("1.", "2)", "Q3") and on past-year session
 * headers ("PSPM I 2018/2019"). Sub-parts — "(a)", "(ii)" — are deliberately
 * NOT split points; they belong to the question above them.
 *
 * Over-splitting is safe: chunks that turn out to be the same question are
 * merged again by `routeSubmission`.
 */
export function splitIntoQuestions(text: string): string[] {
  const lines = text.split(/\r?\n/);

  const startsQuestion = (line: string) =>
    // "1. In a population…" / "2) In a population…" — a one or two digit
    // number, then a separator, then a space and a letter or bracket. The
    // trailing space matters: it keeps "0.6" and "1.5" out.
    /^\s*(?:q(?:uestion)?\s*)?\d{1,2}\s*[.)]\s+[A-Za-z(]/i.test(line) ||
    /^\s*(?:PSPM|UPS)\s+I{1,3}\s*\d{4}\s*\/\s*\d{4}/i.test(line);

  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (startsQuestion(line) && current.some((l) => l.trim())) {
      blocks.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.some((l) => l.trim())) blocks.push(current);

  const out = blocks.map((b) => b.join("\n")).filter((b) => b.trim().length > 0);
  return out.length > 0 ? out : [text];
}

/** The question a routed segment belongs to, or null when it has none. */
function questionIdOf(routed: Routed): string | null {
  return routed.mode === "graded" || routed.mode === "modelAnswer"
    ? routed.match.question.id
    : null;
}

/**
 * Route every part of a submission, keeping them separate.
 *
 * Segments that turn out to belong to the SAME stored question are merged and
 * re-routed as one: a single question photographed across two pages must be
 * marked as one question, not two half-answers. Everything else stays
 * distinct, so two photos of two questions produce two results.
 */
export function routeSubmission(segments: Segment[]): RoutedSegment[] {
  // Expand first: one photo can hold several whole questions, and routing the
  // page as a unit marked only the best-matching one.
  const usable = segments
    .filter((s) => s.text.trim().length > 0)
    .flatMap((s) =>
      splitIntoQuestions(s.text)
        .filter((t) => t.trim().length > 0)
        .map((t) => ({ label: s.label, text: t })),
    );
  if (usable.length === 0) return [];

  const routed = usable.map((s) => ({ segment: s, routed: routeOne(s.text) }));

  const out: RoutedSegment[] = [];
  let i = 0;

  while (i < routed.length) {
    const id = questionIdOf(routed[i]!.routed);
    let j = i + 1;

    // Only merge on a real question id. Two unmatched segments are two
    // different topics far more often than two halves of one, and merging
    // them would blur both explanations.
    if (id !== null) {
      while (j < routed.length && questionIdOf(routed[j]!.routed) === id) j++;
    }

    if (j - i === 1) {
      out.push({ labels: [routed[i]!.segment.label], routed: routed[i]!.routed });
    } else {
      const group = routed.slice(i, j);
      const merged = group.map((g) => g.segment.text).join("\n\n");
      out.push({
        // Deduped: chunks split out of the SAME photo and merged back would
        // otherwise credit that file once per chunk.
        labels: [...new Set(group.map((g) => g.segment.label))],
        routed: routeOne(merged),
      });
    }
    i = j;
  }

  return out;
}
