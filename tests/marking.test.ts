import { markQuestion, markPart } from "../src/lib/marking.ts";
import { findStructured, CHAPTERS } from "../src/data/bank.ts";
import { NOTES as NOTES_ALL } from "../src/data/notes.ts";

let pass = 0;
let fail = 0;
function check(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
  ok ? pass++ : fail++;
}

const c5 = findStructured("c5-ups2-2005")!;

// ── The known case: partial answer should score 2/3 ────────────────────────
const partB = c5.q.parts.find((p) => p.ref === "(b)")!;
check(
  "Ch5 (b) partial answer (omits heterozygotes)",
  markPart(partB, "q2 = 0.36 so q = 0.6. p = 1 - 0.6 = 0.4. Black coat = p2 = 0.16").awarded,
  2,
);
check(
  "Ch5 (b) full answer",
  markPart(partB, "q = 0.6, p = 0.4, black coat = p2 + 2pq = 0.64").awarded,
  3,
);
check("Ch5 (b) empty answer", markPart(partB, "").awarded, 0);

// ── Superscript / caret normalisation ──────────────────────────────────────
check(
  "superscript ² is normalised",
  markPart(partB, "q² = 0.36, q = 0.6, p = 0.4, answer 0.64").awarded,
  3,
);
check(
  "caret notation q^2 works",
  markPart(partB, "q^2 = 0.36, q = 0.6, p = 0.4, = 0.64").awarded,
  3,
);

// ── "Any 2" cap ────────────────────────────────────────────────────────────
const partAii = c5.q.parts.find((p) => p.ref === "(a)(ii)")!;
check(
  "Any-2 cap: student lists FOUR valid conditions, capped at 2",
  markPart(partAii, "no mutation, no migration, random mating, large population").awarded,
  2,
);
check(
  "Any-2: one condition only",
  markPart(partAii, "there must be no mutation").awarded,
  1,
);

// ── Scheme "/" alternatives ────────────────────────────────────────────────
const c3 = findStructured("c3-pspm1-2012")!;
const partA = c3.q.parts.find((p) => p.ref === "(a)")!;
check(
  "scheme alternatives: 'mitotic phase' accepted for P",
  markPart(partA, "P is the mitotic phase, Q is gap 1, R is S phase, S is gap 2").awarded,
  4,
);
check(
  "scheme alternatives: bare 'mitosis' also accepted",
  markPart(partA, "P mitosis, Q G1, R synthesis, S G2").awarded,
  4,
);

// ── Short-token word boundary (the 'm' problem) ────────────────────────────
check(
  "short tokens don't match inside other words",
  markPart(partA, "the membrane moves").awarded,
  0,
);

// ── Whole-question totals ──────────────────────────────────────────────────
const whole = markQuestion(c5.q.parts, {
  "(a)(i)": "In genetic equilibrium the allele and genotype frequencies remain constant across generations",
  "(a)(ii)": "no mutation, no migration",
  "(b)": "q = 0.6, p = 0.4, = 0.64",
  "(c)": "q2 = 0.09, q = 0.3, p = 0.7, 42%",
});
check("whole question maximum", whole.maximum, 10);
check("whole question full marks", whole.awarded, 10);

// ── Bank integrity: every MCQ answer must be one of its options ────────────
let bad = 0;
for (const ch of CHAPTERS) {
  for (const q of ch.mcq) {
    const letters = q.options.map((o) => o.trim().charAt(0).toUpperCase());
    const ans = q.answer.trim().charAt(0).toUpperCase();
    if (!letters.includes(ans)) {
      console.log(`  ! ${q.id}: answer ${q.answer} not among ${letters.join(",")}`);
      bad++;
    }
  }
}
check("every MCQ answer maps to a real option", bad, 0);
check(
  "MCQ counts (Ch3/Ch4/Ch5)",
  CHAPTERS.map((c) => c.mcq.length),
  [10, 14, 7],
);

// ── Bank integrity: a perfect answer must score full marks ────────────────
//
// Feeding every scheme point's own text back in as the student's answer is a
// strong check on the `require` keyword lists: if a keyword is misspelled or
// refers to a term the scheme line doesn't actually contain, the point cannot
// be earned and this test catches it. Runs across every part in the bank.
const brokenParts: string[] = [];
for (const ch of CHAPTERS) {
  for (const q of ch.structured) {
    for (const part of q.parts) {
      const perfect = part.points.map((p) => p.text).join(". ");
      const r = markPart(part, perfect);
      if (r.awarded !== r.maximum) {
        brokenParts.push(
          `${q.id} ${part.ref} scored ${r.awarded}/${r.maximum} — unearned: ` +
            r.results
              .filter((x) => !x.earned)
              .map((x) => x.missingGroups.map((g) => g[0]).join("+"))
              .join(" | "),
        );
      }
    }
  }
}
if (brokenParts.length) brokenParts.forEach((b) => console.log(`  ! ${b}`));
check("every part reaches full marks on a perfect answer", brokenParts.length, 0);

// ── Bank size, so accidental deletions are noticed ────────────────────────
check(
  "structured question counts (Ch3/Ch4/Ch5)",
  CHAPTERS.map((c) => c.structured.length),
  [2, 0, 15],
);

// ── Case 1 / Case 2 routing ───────────────────────────────────────────────
const { findQuestionMatch, searchNotes } = await import("../src/lib/lookup.ts");

// A student pasting a real bank question should be routed to grading.
const hit = findQuestionMatch(
  "In a randomly breeding population of mice, black coat (H) is dominant to white coat (h). In the population, 36% have white coats. Calculate the phenotype frequency of black coat mice. My answer: q = 0.6, p = 0.4",
);
check("Case 1: real bank question is matched", hit?.question.id, "c5-ups2-2005");

// Something on-syllabus but NOT in the bank must NOT be force-matched.
check(
  "Case 2: unbanked question is not falsely matched",
  findQuestionMatch(
    "Explain how the lac operon is regulated in the presence of lactose and describe the role of the repressor protein",
  ),
  null,
);
check(
  "Case 2: vague text is not falsely matched",
  findQuestionMatch("what is biology"),
  null,
);

// Notes fallback must surface the right chapter.
const lac = searchNotes("lac operon repressor lactose regulation", 3);
check("notes: lac operon resolves to Chapter 6", lac[0]?.section.chapter, 6);

const meiosis = searchNotes("prophase I leptotene zygotene pachytene chiasmata", 3);
check("notes: prophase I resolves to Chapter 3", meiosis[0]?.section.chapter, 3);

const mutation = searchNotes("base substitution missense nonsense frameshift", 3);
check("notes: mutation types resolve to Chapter 7", mutation[0]?.section.chapter, 7);

check("notes: gibberish returns nothing", searchNotes("zzzz qqqq", 3).length, 0);

// Every note section must carry usable content.
const emptyNotes = NOTES_ALL.filter(
  (n) => n.content.length < 2 || n.outcome.trim().length < 5,
);
check("notes: every section has an outcome and content", emptyNotes.length, 0);

// ── Only the parts the student asked about get marked ─────────────────────
const { selectRelevantParts } = await import("../src/lib/lookup.ts");

const onePart =
  "In a randomly breeding population of mice, black coat H is dominant to white coat h. 36% have white coats. Calculate the phenotype frequency of black coat mice. My answer: q = 0.6, p = 0.4, black = 0.64";
const mice = findQuestionMatch(onePart)!;
const chosen = selectRelevantParts(mice.question, onePart);

check("one question asked -> one part marked", chosen.length, 1);
check("the correct part is chosen", chosen[0]?.ref, "(b)");

const scoped = markQuestion(chosen, { [chosen[0].ref]: onePart });
check("a fully correct single answer scores full marks", scoped.awarded, 3);
check("maximum reflects only what was asked", scoped.maximum, 3);

// Two sub-parts submitted together should both be marked.
const twoParts =
  "State the Hardy-Weinberg Principle. List TWO conditions for this principle to be achieved. " +
  "In genetic equilibrium the allele and genotype frequencies remain constant. No mutation, no migration.";
const hw = findQuestionMatch(twoParts)!;
const bothRefs = selectRelevantParts(hw.question, twoParts).map((p) => p.ref);
check("two sub-parts asked -> both marked", bothRefs, ["(a)(i)", "(a)(ii)"]);

// The placeholder is a hint, not payload: it must never reach the marker.
check(
  "placeholder text is not treated as a question",
  findQuestionMatch(
    "Type or paste your question here, then your answer below it. You can also attach a photo instead.",
  ),
  null,
);

// ── Question-only submissions must never be marked 0 ──────────────────────
const { hasAttempt } = await import("../src/lib/lookup.ts");

const questionOnly =
  "In a randomly breeding population of mice, black coat (H) is dominant to white coat (h). In the population, 36% have white coats. Calculate the phenotype frequency of black coat mice.";
const qOnlyMatch = findQuestionMatch(questionOnly)!;
check(
  "question pasted alone is NOT treated as an attempt",
  hasAttempt(qOnlyMatch.question, questionOnly),
  false,
);

// Same question plus working — that IS an attempt.
check(
  "question + numeric working IS an attempt",
  hasAttempt(qOnlyMatch.question, `${questionOnly} q = 0.6, p = 0.4, black = 0.64`),
  true,
);

// A purely numeric answer must still register: tokenise drops decimals, so
// this relies on the separate numeric check.
check(
  "bare numeric answer counts as an attempt",
  hasAttempt(qOnlyMatch.question, `${questionOnly} 0.6 0.4 0.64`),
  true,
);

// Prose answer with no new numbers must also register.
check(
  "prose answer counts as an attempt",
  hasAttempt(
    qOnlyMatch.question,
    `${questionOnly} The heterozygous carriers must also be included when counting the dominant phenotype.`,
  ),
  true,
);

// The question-only path must still identify the right parts to explain.
check(
  "question-only still resolves the right part",
  selectRelevantParts(qOnlyMatch.question, questionOnly).map((p) => p.ref),
  ["(b)"],
);

// ── Wrong answers get an explanation, and it stays on topic ───────────────
const wrong =
  "In a randomly breeding population of mice, black coat (H) is dominant to white coat (h). 36% have white coats. Calculate the phenotype frequency of black coat mice. My answer: q = 0.6, p = 0.4, black coat = p2 = 0.16";
const wrongMatch = findQuestionMatch(wrong)!;
const wrongParts = selectRelevantParts(wrongMatch.question, wrong);
const wrongResult = markQuestion(wrongParts, { [wrongParts[0].ref]: wrong });

check("partially wrong answer is still marked", wrongResult.awarded, 2);

const missedPoints = wrongResult.parts.flatMap((pr) =>
  pr.results.filter((r) => !r.earned),
);
check("the wrong point is identified", missedPoints.length, 1);

const explanation = searchNotes(
  missedPoints
    .map((r) => `${r.point.text} ${r.missingGroups.flat().join(" ")}`)
    .join(" "),
  2,
  wrongMatch.chapterNumber,
);
check("a wrong answer yields explanatory notes", explanation.length > 0, true);
check(
  "explanation stays in the right chapter",
  [...new Set(explanation.map((n) => n.section.chapter))],
  [5],
);

// Weak trailing matches must be dropped rather than padded to the limit.
const focused = searchNotes("leptotene zygotene pachytene chiasmata", 3);
check(
  "weak matches are filtered out, not padded",
  [...new Set(focused.map((n) => n.section.chapter))],
  [3],
);

// A fully correct answer needs no explanation section.
const rightResult = markQuestion(wrongParts, {
  [wrongParts[0].ref]:
    "q = 0.6, p = 0.4, genotype frequency for black coat = p2 + 2pq = 0.64",
});
check(
  "a full-marks answer leaves nothing to explain",
  rightResult.parts.flatMap((pr) => pr.results.filter((r) => !r.earned)).length,
  0,
);

// ── Every MCQ option must be readable ─────────────────────────────────────
//
// Three Chapter 3 questions print their options as chromosome DIAGRAMS, so
// their `options` are bare letters. Rendering those alone gave students empty
// buttons with nothing to choose between. A letter-only option is therefore
// only acceptable when the question also supplies an optionsFigure.
const unreadable: string[] = [];
for (const ch of CHAPTERS) {
  for (const q of ch.mcq) {
    const wordless = q.options.every(
      (o) => o.replace(/^[A-D][.)]?\s*/, "").trim().length === 0,
    );
    if (wordless && !q.optionsFigure) unreadable.push(q.id);
  }
}
if (unreadable.length) console.log(`  ! no readable options: ${unreadable.join(", ")}`);
check("every MCQ has readable options or an options figure", unreadable.length, 0);

// The figure-based ones must actually point at bundled files.
const figureQs = CHAPTERS.flatMap((c) => c.mcq).filter((q) => q.optionsFigure);
check("figure-option questions found", figureQs.length, 3);
check(
  "all figure paths are under /figures",
  figureQs.every(
    (q) =>
      q.optionsFigure!.startsWith("/figures/") &&
      (!q.figure || q.figure.startsWith("/figures/")),
  ),
  true,
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
