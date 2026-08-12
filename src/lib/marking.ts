/**
 * Offline marking engine.
 *
 * There is no AI here and no network call. A student's answer is matched
 * against the mark points of the official KPM scheme stored in the question
 * bank, using the scheme's own rules:
 *
 *   - a point has one or more REQUIREMENT GROUPS; every group must be hit
 *   - within a group, any listed alternative counts — this is the scheme's
 *     "/" and "//" notation ("P: M / Mitosis / Mitotic phase")
 *   - `anyOf` caps how many points can be earned, i.e. the scheme's "Any 2"
 *
 * KNOWN LIMIT, by design: this recognises wording, not meaning. A student who
 * expresses a correct idea in terms the scheme does not list will be marked
 * down. Every alternative a lecturer would accept has to be written into the
 * bank. That is the price of running with no API.
 */

export interface SchemePoint {
  /** The scheme line itself — shown to the student as the model answer. */
  text: string;
  marks: number;
  /** Every group must match. Within a group, any one alternative suffices. */
  require: string[][];
}

export interface QuestionPart {
  ref: string;
  prompt: string;
  marks: number;
  points: SchemePoint[];
  /** Scheme "Any 2" / "Any 3" — the most points that can be credited. */
  anyOf?: number;
  note?: string;
}

/**
 * Fold the many ways students write the same thing into one form:
 * superscripts, carets, curly quotes, punctuation, spacing.
 * Digits and decimal points survive — "0.64" must stay matchable.
 */
export function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[²₂]/g, "2")
    .replace(/[³]/g, "3")
    .replace(/\^/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[×✕]/g, "x")
    .replace(/[−–—]/g, "-")
    .replace(/[^a-z0-9.\-+/'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Two matching strategies, chosen by what the alternative looks like.
 *
 * BOUNDED — anything containing a digit ("0.4", "g1", "42"), or a one-or-two
 * letter token ("m", "bb"). These need edges, or "0.4" would also match inside
 * "0.45" and "m" would match every word containing the letter m.
 * The edges deliberately allow adjacent punctuation, because students write
 * "p = 0.4." with a full stop — an earlier version required whitespace and
 * silently withheld that mark.
 *
 * SUBSTRING — longer words and phrases. The bank stores stems like "replicat"
 * and "synthesi" so that replicated/replication/synthesised all count, which
 * only works without a trailing boundary.
 */
function containsAlternative(haystack: string, alternative: string): boolean {
  const needle = normalise(alternative);
  if (!needle) return false;

  const hasDigit = /\d/.test(needle);
  const isTinyWord = needle.length <= 2;

  if (hasDigit || isTinyWord) {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Not preceded by a letter/digit/dot (blocks "10.4" matching "0.4"),
    // not followed by a letter/digit (blocks "0.45" matching "0.4").
    return new RegExp(`(?<![a-z0-9.])${escaped}(?![a-z0-9])`).test(haystack);
  }

  return haystack.includes(needle);
}

export interface PointResult {
  point: SchemePoint;
  earned: boolean;
  /** Groups the student failed to satisfy — the missing keywords. */
  missingGroups: string[][];
  /** Alternatives the student did hit, for positive feedback. */
  matched: string[];
}

export interface PartResult {
  part: QuestionPart;
  results: PointResult[];
  awarded: number;
  maximum: number;
  cappedByAnyOf: boolean;
}

export function markPart(part: QuestionPart, answer: string): PartResult {
  const hay = normalise(answer);

  const results: PointResult[] = part.points.map((point) => {
    const missingGroups: string[][] = [];
    const matched: string[] = [];

    for (const group of point.require) {
      const hit = group.find((alt) => containsAlternative(hay, alt));
      if (hit) matched.push(hit);
      else missingGroups.push(group);
    }

    return { point, earned: missingGroups.length === 0, missingGroups, matched };
  });

  // Apply the "Any 2" cap, crediting the student's HIGHEST-VALUE earned
  // points first.
  //
  // Crediting in scheme order short-changed them: an essay part worth "any 2
  // similarities (1 mark) + any 3 differences (2 marks)" caps at 5 points, and
  // taking the first five listed gave 3 one-mark similarities before the
  // two-mark differences — 7 out of 8 for a complete answer.
  let awarded = 0;
  let creditedPoints = 0;
  let cappedByAnyOf = false;
  const cap = part.anyOf ?? Infinity;

  const earned = results
    .filter((r) => r.earned)
    .sort((a, b) => b.point.marks - a.point.marks);

  for (const r of earned) {
    if (creditedPoints >= cap) {
      cappedByAnyOf = true;
      break;
    }
    awarded += r.point.marks;
    creditedPoints += 1;
  }

  // Never exceed the stated allocation, whatever the point values sum to.
  awarded = Math.min(awarded, part.marks);

  return { part, results, awarded, maximum: part.marks, cappedByAnyOf };
}

export interface QuestionResult {
  parts: PartResult[];
  awarded: number;
  maximum: number;
}

export function markQuestion(
  parts: QuestionPart[],
  answers: Record<string, string>,
): QuestionResult {
  const results = parts.map((p) => markPart(p, answers[p.ref] ?? ""));
  return {
    parts: results,
    awarded: results.reduce((s, r) => s + r.awarded, 0),
    maximum: results.reduce((s, r) => s + r.maximum, 0),
  };
}
