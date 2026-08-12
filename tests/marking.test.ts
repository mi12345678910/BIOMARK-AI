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
const { findQuestionMatch, searchNotes, tokenise } = await import("../src/lib/lookup.ts");

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

// "State the Hardy-Weinberg Principle" appears verbatim in 20 of the 53
// stored prompts, so no paper can be singled out — but every one of them
// carries the same prose scheme point, so answering from any is correct.
// Matching here is right; what must not happen is a DATA-bearing scheme
// ("p = 1 − 0.37 = 0.63") being served to a query with no data in it.
check(
  "a definition question shared across papers is still answerable",
  findQuestionMatch(
    "State the Hardy-Weinberg Principle. List TWO conditions for this principle to be achieved.",
  ) !== null,
  true,
);
check(
  "a generic instruction never gets a data-specific scheme",
  findQuestionMatch("Calculate the frequency of the dominant allele in a population"),
  null,
);

// Two sub-parts submitted together should both be marked — quoted with the
// data that identifies the paper.
const twoParts =
  "In a randomly breeding population of mice, black coat (H) is dominant to white coat (h). " +
  "In the population, 36% have white coats. Calculate the phenotype frequency of black coat mice. " +
  "In a human population, the frequency of recessive individuals for extra-long eyelashes is 90 per 1000. " +
  "What percentage of this population carries the recessive allele but displays the short-eyelash phenotype?";
const hw = findQuestionMatch(twoParts)!;
check("two-part paste still identifies the paper", hw?.question.id, "c5-ups2-2005");
const bothRefs = selectRelevantParts(hw.question, twoParts).map((p) => p.ref);
check("two sub-parts asked -> both marked", bothRefs, ["(b)", "(c)"]);

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

// ── Anything that refers to a visual must supply it ───────────────────────
//
// A question reading "FIGURE 1 shows a cell cycle" or "the pedigree below"
// cannot be answered without the artwork. This catches the case where a
// question is transcribed but its figure is forgotten.
const VISUAL =
  /figure|diagram|pedigree|graph|punnett|shown below|below shows|the figure/i;

const missingVisual: string[] = [];

for (const ch of CHAPTERS) {
  for (const q of ch.mcq) {
    if (VISUAL.test(q.stem) && !q.figure) missingVisual.push(`mcq ${q.id}`);
  }
  for (const s of ch.structured) {
    const refersToVisual =
      VISUAL.test(s.intro ?? "") || s.parts.some((p) => VISUAL.test(p.prompt));
    if (refersToVisual && !s.figure) missingVisual.push(`structured ${s.id}`);
  }
}
if (missingVisual.length)
  console.log(`  ! refers to a visual but has none: ${missingVisual.join(", ")}`);
check("every question referring to a visual supplies it", missingVisual.length, 0);

// And every referenced file must actually be on disk.
const fs = await import("node:fs");
const allPaths = [
  ...CHAPTERS.flatMap((c) => c.mcq).flatMap((q) =>
    [q.figure, q.optionsFigure].filter(Boolean),
  ),
  ...CHAPTERS.flatMap((c) => c.structured).map((s) => s.figure).filter(Boolean),
] as string[];
const absent = allPaths.filter((p) => !fs.existsSync(`public${p}`));
if (absent.length) console.log(`  ! missing files: ${absent.join(", ")}`);
check("every referenced figure file exists on disk", absent.length, 0);
check("figures wired up", allPaths.length, 10);

// No orphans: every bundled file must be referenced by a question.
const onDisk = fs.readdirSync("public/figures").map((f) => `/figures/${f}`);
const orphans = onDisk.filter((f) => !allPaths.includes(f));
if (orphans.length) console.log(`  ! unreferenced: ${orphans.join(", ")}`);
check("no unreferenced figure files", orphans.length, 0);

// ── Drawing questions are answered, never marked ──────────────────────────
const { isDrawingQuestion, findDiagram, DIAGRAMS } = await import(
  "../src/data/diagrams.ts"
);

check(
  "draw request is detected",
  isDrawingQuestion("Draw and label the stages of meiosis I"),
  true,
);
check(
  "label request is detected",
  isDrawingQuestion("Label the sub-stages of prophase I"),
  true,
);
check("BM: lukiskan is detected", isDrawingQuestion("Lukiskan kitar sel"), true);

// A supplied figure is NOT a drawing request and must still be marked.
check(
  "'FIGURE 1 shows...' is not a drawing question",
  isDrawingQuestion("FIGURE 1 shows a cell cycle. Name phase P."),
  false,
);
check(
  "a calculation is not a drawing question",
  isDrawingQuestion(
    "In a population of mice 36% have white coats. Calculate the phenotype frequency.",
  ),
  false,
);

// The right diagram must come back.
check(
  "meiosis I request resolves to the meiosis I diagram",
  findDiagram("Draw and label the stages of meiosis I")?.id,
  "meiosis-1-stages",
);
check(
  "prophase I sub-stages resolve correctly",
  findDiagram("Draw the sub-stages of prophase I showing chiasmata")?.id,
  "prophase-1-substages",
);
check(
  "cell cycle request resolves correctly",
  findDiagram("Draw the cell cycle and label G1, S and G2")?.id,
  "cell-cycle",
);
check(
  "unknown drawing topic returns nothing",
  findDiagram("Draw the structure of a kangaroo"),
  null,
);

// Chapters 6 and 9 must route as precisely as Chapter 3.
const routing: [string, string][] = [
  ["Draw and label the replication fork showing the enzymes", "dna-replication-fork"],
  ["Sketch the lagging strand and label the Okazaki fragments", "dna-replication-lagging"],
  ["Draw a labelled diagram of transcription", "transcription"],
  ["Draw a mature mRNA showing the 5 cap and poly-A tail", "mrna-processing"],
  ["Draw and label the elongation cycle of translation", "translation-elongation"],
  ["Draw how a tRNA is charged by its synthetase", "trna-charging"],
  ["Draw the genetic code table", "genetic-code"],
  ["Draw and label the structure of a flower", "flower-structure"],
  ["Label the parts of the carpel", "flower-structure"],
  ["Draw and label the embryo sac", "plant-life-cycle"],
  ["Lukiskan struktur bunga dan labelkan bahagiannya", "flower-structure"],
];
const misrouted = routing.filter(([q, want]) => findDiagram(q)?.id !== want);
if (misrouted.length)
  misrouted.forEach(([q, want]) =>
    console.log(`  ! "${q}" -> ${findDiagram(q)?.id ?? "none"} (wanted ${want})`),
  );
check("Ch6 and Ch9 drawing topics route correctly", misrouted.length, 0);

check(
  "diagram coverage spans chapters 3, 6 and 9",
  [...new Set(DIAGRAMS.map((d) => d.chapter))].sort((a, b) => a - b),
  [3, 6, 9],
);

// Every diagram entry must be complete and its image bundled.
const badDiagrams = DIAGRAMS.filter(
  (d) =>
    d.labels.length < 2 ||
    !d.guidance ||
    !d.guidanceBm ||
    !d.image.startsWith("/diagrams/") ||
    !fs.existsSync(`public${d.image}`),
);
if (badDiagrams.length)
  console.log(`  ! incomplete diagrams: ${badDiagrams.map((d) => d.id).join(", ")}`);
check("every diagram answer is complete with a bundled image", badDiagrams.length, 0);

const diagramOrphans = fs
  .readdirSync("public/diagrams")
  .map((f) => `/diagrams/${f}`)
  .filter((f) => !DIAGRAMS.some((d) => d.image === f));
check("no unreferenced diagram files", diagramOrphans.length, 0);

// ── Custom questions must not trigger a canned mark scheme ────────────────
//
// The bug: weak keyword overlap ("frequency", "allele", "population") matched
// a past-year prompt and returned its scheme, so a student asking their own
// question got a canned answer to someone else's.
const CUSTOM_QUESTIONS = [
  "Explain why the frequency of the recessive allele stays constant in a large population",
  "Calculate the frequency of heterozygous individuals in a population of butterflies",
  "Explain the importance of DNA replication before cell division",
  "Describe how crossing over produces genetic variation",
  "Explain the difference between mitosis and meiosis",
  "What is the importance of the S phase in the cell cycle?",
  "How does non-disjunction cause Down syndrome?",
  "Why is meiosis important for sexual reproduction?",
  "What are the stages of the cell cycle?",
  "Describe the events in prophase I of meiosis",
  "What happens during transcription?",
  "Explain how the lac operon works",
  "What is the role of DNA ligase?",
];
const falsePositives = CUSTOM_QUESTIONS.filter((q) => findQuestionMatch(q));
if (falsePositives.length)
  falsePositives.forEach((q) =>
    console.log(`  ! "${q}" -> ${findQuestionMatch(q)!.question.id}`),
  );
check("custom questions are never given a canned scheme", falsePositives.length, 0);

// Every custom question must still get something useful back.
const unhelped = CUSTOM_QUESTIONS.filter((q) => searchNotes(q, 3).length === 0);
check("every custom question gets notes instead", unhelped.length, 0);

// ── Real past-year questions must still be recognised ─────────────────────
const REAL_QUESTIONS = [
  "In a randomly breeding population of mice, black coat (H) is dominant to white coat (h). In the population, 36% have white coats. Calculate the phenotype frequency of black coat mice.",
  "In a population, 14% of babies are born with albinism. Calculate the frequency of the recessive allele.",
  "In a population of 1000 snails that mate randomly, 800 are grey. Calculate the dominant and recessive allele frequencies.",
  "In a population of mice the allele for yellow fur E is dominant over grey fur e. 16% have grey fur. Calculate the frequency of yellow and grey fur alleles.",
  "In the population of 700 hamsters, 543 have black fur. Calculate the genotype frequency of heterozygous hamsters.",
  "One in 3600 persons inherits Tay-Sachs disease. Calculate the percentage of dominant homozygous.",
  "In a population of 6000 wolves, 26 are albino. Calculate the allele frequencies for A and a.",
  "Thalassemia major is homozygous recessive. In a population of 12750, two individuals suffer from thalassemia major. Determine the frequencies of the dominant and recessive alleles.",
  "In a population of 13000 wild chickens, 16% have short legs. How many are heterozygotes if the population increases to 15000?",
  "A farmer has 2000 cows, 1500 brown coated. Calculate the frequency for the dominant and recessive alleles.",
  "In a population of 2000 fruit flies, 320 have ebony body. Calculate the frequencies of E and e alleles.",
  "In a population of 10000, 2 individuals were born with severe anaemia. Determine the frequency of the dominant and recessive alleles.",
];
const missed = REAL_QUESTIONS.filter((q) => !findQuestionMatch(q));
if (missed.length) missed.forEach((q) => console.log(`  ! missed: ${q.slice(0, 70)}`));
check("real past-year questions are still matched", missed.length, 0);

// Thousands separators: the bank prints "12,750", students type "12750".
check(
  "comma-separated numbers tokenise the same either way",
  tokenise("a population of 12,750 individuals").includes("12750"),
  true,
);
check(
  "space-separated numbers too",
  tokenise("increases to 15 000").includes("15000"),
  true,
);

// ── End-to-end: question + answer must actually be marked ─────────────────
//
// The regression that prompted these: pasting a real question with an answer
// stopped producing marks. Three separate causes — the paper wasn't matched,
// the wrong sub-part was chosen, or the answer wasn't recognised as an
// attempt. This walks the whole route the app takes.
function route(text: string) {
  const m = findQuestionMatch(text);
  if (!m) return { mode: "notes" as const };
  const parts = selectRelevantParts(m.question, text);
  if (!hasAttempt(m.question, text))
    return { mode: "model" as const, id: m.question.id, refs: parts.map((p) => p.ref) };
  const answers: Record<string, string> = {};
  for (const p of parts) answers[p.ref] = text;
  const r = markQuestion(parts, answers);
  return {
    mode: "graded" as const,
    id: m.question.id,
    refs: parts.map((p) => p.ref),
    awarded: r.awarded,
    maximum: r.maximum,
  };
}

const FIG1 = "FIGURE 1 shows a cell cycle with phases P Q R and Mitosis. ";
const MICE =
  "In a randomly breeding population of mice, black coat (H) is dominant to white coat (h). In the population, 36% have white coats. Calculate the phenotype frequency of black coat mice. ";

check(
  "question + one-word answer is graded, not shown a model answer",
  route(`${FIG1}Name phase P. My answer: interphase`),
  { mode: "graded", id: "c3-pspm1-2018", refs: ["(a)(i)"], awarded: 1, maximum: 1 },
);

// Single-letter labels: "phase P" and "phase R" both tokenise to ["phase"],
// so answering one was marked against both and scored 1/4.
check(
  "only the labelled part asked about is marked",
  route(
    `${FIG1}Explain the importance of phase R. My answer: DNA is replicated so daughter cells maintain the same chromosome number, doubling the genome`,
  ).refs,
  ["(a)(iii)"],
);

check(
  "question + partial answer scores partial marks",
  route(`${MICE}My answer: q = 0.6, p = 0.4, black coat = p2 = 0.16`),
  { mode: "graded", id: "c5-ups2-2005", refs: ["(b)"], awarded: 2, maximum: 3 },
);

// No number or species to anchor on, but near-verbatim wording.
check(
  "a definition question with an answer is still graded",
  route(
    "State the Hardy-Weinberg Principle. List TWO conditions for this principle to be achieved. Answer: In genetic equilibrium the allele and genotype frequencies remain constant. No mutation, no migration.",
  ).mode,
  "graded",
);

check(
  "figure question with an answer is graded against the right paper",
  route(
    "FIGURE 2 shows the stages of the cell cycle labelled P Q R and S. Name the stages labelled P Q R and S. My answer: P is mitosis, Q is G1, R is S phase, S is G2",
  ).id,
  "c3-pspm1-2012",
);

// Question with no answer must never be marked 0.
check("question alone gets a model answer", route(`${MICE}`).mode, "model");
check(
  "thousands separators don't fake an attempt",
  route(
    "Thalassemia major is homozygous recessive. In a population of 12750, two individuals suffer from thalassemia major. Determine the frequencies of the dominant and recessive alleles.",
  ).mode,
  "model",
);

// Figure-dependent questions must not be handed to a generic query.
check(
  "generic query never gets a figure question's scheme",
  route("What are the stages of the cell cycle?").mode,
  "notes",
);

// ── A photographed multi-part question must be marked in full ─────────────
//
// OCR garbles prose ("mce", "whte", "eyeIashes") but leaves the "(a)/(b)/(c)"
// markers intact. Coverage scoring alone therefore dropped the later parts:
// a whole question photographed was marked out of 6 instead of 10, and on a
// poorer scan only part (a) survived.
const OCR_MULTIPART = [
  "UPS Il 2005/2006",
  "1. (a) (i)  State the Hardy-Weinberg Principle. [1 mark]",
  "In a population in genetic equilibrium the allele and genotype frequencies remain constant",
  "(ii) List TWO conditions for this principle to be achieved. [2 marks]",
  "No mutation.  No migration.",
  "(b) In a randomly breeding populaton of mce, black coat (H) is dominant to whte coat (h).",
  "ln the populaton, 36% have whte coats. Calculate the phenotype frequences of black coat mce. [3 marks]",
  "q2 = 0.36  q = 0.6  p = 0.4  black = p2 + 2pq = 0.64",
  "(c) ln a human populaton, the frequency of recessve indviduals for extra-Iong eyeIashes is 90 per 1000.",
  "q2 = 0.09  q = 0.3  p = 0.7  2pq x 100 = 42%",
].join("\n");

const ocrRoute = route(OCR_MULTIPART);
check(
  "every sub-part of a photographed question is marked",
  ocrRoute.mode === "graded" ? ocrRoute.refs : ocrRoute.mode,
  ["(a)(i)", "(a)(ii)", "(b)", "(c)"],
);
check(
  "it is marked out of the full question total",
  ocrRoute.mode === "graded" ? ocrRoute.maximum : 0,
  10,
);
check(
  "a correct scanned answer still scores full marks",
  ocrRoute.mode === "graded" ? ocrRoute.awarded : 0,
  10,
);

// Papers print "(a) (i) … (ii) …" — the parent letter appears once, so the
// second sub-part never occurs as a literal "(a)(ii)".
check(
  "a bare (ii) under an earlier (a) still selects (a)(ii)",
  selectRelevantParts(
    findStructured("c5-ups2-2005")!.q,
    "1. (a)(i) State the Hardy-Weinberg Principle. (ii) List TWO conditions.",
  ).map((p) => p.ref),
  ["(a)(i)", "(a)(ii)"],
);

// A bare "(b)" must not drag in "(b)(i)" and "(b)(ii)" as well.
check(
  "nested refs are selected without their siblings",
  selectRelevantParts(
    findStructured("c5-ups2-2006")!.q,
    "In a population, 14% of babies are born with albinism. (b)(i) Calculate the frequency of the recessive allele. Answer: q = 0.37",
  ).map((p) => p.ref),
  ["(b)(i)"],
);

// Question numbering is not the student's working.
check(
  "leading question numbers don't fake an attempt",
  route(
    "1. (a)(i) State the Hardy-Weinberg Principle. (ii) List TWO conditions. (b) 36% have white coats, calculate phenotype frequency of black coat mice. (c) 90 per 1000 extra-long eyelashes.",
  ).mode,
  "model",
);

// Submissions with no labels must still fall back to term coverage.
check(
  "unlabelled single-part answers still work",
  route(
    "In a randomly breeding population of mice 36% have white coats. Calculate the phenotype frequency of black coat mice. Answer: q = 0.6, p = 0.4, 0.64",
  ).refs,
  ["(b)"],
);

// ── Several photos must produce several results ───────────────────────────
//
// Every attachment used to be concatenated into one blob and matched once, so
// a student who photographed two questions had the second silently discarded
// — only the best-matching one was ever marked.
const { routeSubmission } = await import("../src/lib/route.ts");

const MICE_A =
  "In a randomly breeding population of mice, black coat (H) is dominant to white coat (h). In the population, 36% have white coats. Calculate the phenotype frequency of black coat mice. Answer: q = 0.6, p = 0.4, black = p2 + 2pq = 0.64";
const WOLVES =
  "In a population of 6000 wolves, 26 are albino. Calculate the allele frequencies for A and a. Answer: q2 = 0.004, q = 0.063, p = 0.937";
const SNAILS =
  "In a population of 1000 snails that mate randomly, 800 are grey. Calculate the dominant and recessive allele frequencies. Answer: q2 = 0.2, q = 0.447, p = 0.553";

const summarise = (segs: { label: string; text: string }[]) =>
  routeSubmission(segs).map((it) =>
    it.routed.mode === "graded"
      ? `${it.routed.match.question.id}:${it.routed.result.awarded}/${it.routed.result.maximum}`
      : it.routed.mode,
  );

check(
  "two photos of two questions give two marked results",
  summarise([
    { label: "typed", text: "" },
    { label: "p1.jpg", text: MICE_A },
    { label: "p2.jpg", text: WOLVES },
  ]),
  ["c5-ups2-2005:3/3", "c5-pspm1-2023:4/4"],
);

check(
  "three photos give three results",
  summarise([
    { label: "typed", text: "" },
    { label: "a.jpg", text: MICE_A },
    { label: "b.jpg", text: WOLVES },
    { label: "c.jpg", text: SNAILS },
  ]).length,
  3,
);

check(
  "typed text and a photo are separate questions",
  summarise([
    { label: "typed", text: MICE_A },
    { label: "x.jpg", text: WOLVES },
  ]),
  ["c5-ups2-2005:3/3", "c5-pspm1-2023:4/4"],
);

// One question spread over two pages must stay ONE result, not two halves.
const merged = routeSubmission([
  { label: "typed", text: "" },
  {
    label: "p1.jpg",
    text: "1. (a)(i) State the Hardy-Weinberg Principle. Answer: allele and genotype frequencies remain constant in genetic equilibrium. (ii) List TWO conditions. Answer: no mutation, no migration.",
  },
  {
    label: "p2.jpg",
    text: "(b) In a randomly breeding population of mice, 36% have white coats. Calculate the phenotype frequency of black coat mice. Answer: q = 0.6, p = 0.4, 0.64",
  },
]);
check("one question across two pages stays one result", merged.length, 1);
check("both pages are credited as the source", merged[0]?.labels, [
  "p1.jpg",
  "p2.jpg",
]);
check(
  "and all its sub-parts are marked together",
  merged[0]?.routed.mode === "graded"
    ? merged[0].routed.result.parts.map((p) => p.part.ref)
    : [],
  ["(a)(i)", "(a)(ii)", "(b)"],
);

// Empty segments must not create empty result cards.
check(
  "blank segments are ignored",
  routeSubmission([
    { label: "typed", text: "   " },
    { label: "a.jpg", text: "" },
    { label: "b.jpg", text: MICE_A },
  ]).length,
  1,
);

// ── One photo holding several questions ───────────────────────────────────
//
// A page often carries two or three whole questions. Routing the photo as one
// unit marked only the best-matching one and dropped the rest.
const twoOnAPage = [
  "1.  In a randomly breeding population of mice, black coat (H) is dominant to white coat (h).",
  "    In the population, 36% have white coats. Calculate the phenotype frequency of black coat mice. [3 marks]",
  "    Answer: q = 0.6, p = 0.4, black coat = p2 + 2pq = 0.64",
  "",
  "2.  In a population of 6000 wolves, 26 are albino. Calculate the allele frequencies for A and a. [4 marks]",
  "    Answer: q2 = 0.004, q = 0.063, p = 0.937",
].join("\n");

check(
  "two questions on one page give two marked results",
  summarise([{ label: "page.jpg", text: twoOnAPage }]),
  ["c5-ups2-2005:3/3", "c5-pspm1-2023:4/4"],
);

check(
  "past-year session headers also separate questions",
  summarise([
    {
      label: "scan.jpg",
      text: [
        "UPS II 2005/2006",
        "In a randomly breeding population of mice 36% have white coats. Calculate the phenotype frequency of black coat mice. Answer: q = 0.6, p = 0.4, 0.64",
        "PSPM I 2023/2024",
        "In a population of 6000 wolves, 26 are albino. Calculate the allele frequencies for A and a. Answer: q = 0.063, p = 0.937",
      ].join("\n"),
    },
  ]).length,
  2,
);

// Sub-parts belong to the question above them and must never be split off.
const multiPart = routeSubmission([
  {
    label: "p.jpg",
    text: [
      "1. (a)(i) State the Hardy-Weinberg Principle. Answer: allele and genotype frequencies remain constant in genetic equilibrium.",
      "   (ii) List TWO conditions. Answer: no mutation, no migration.",
      "   (b) In a randomly breeding population of mice, 36% have white coats. Calculate the phenotype frequency of black coat mice. Answer: q = 0.6, p = 0.4, 0.64",
    ].join("\n"),
  },
]);
check("a multi-part question is not split into pieces", multiPart.length, 1);
check(
  "its sub-parts are all marked together",
  multiPart[0]?.routed.mode === "graded"
    ? multiPart[0].routed.result.awarded
    : -1,
  6,
);

// Working lines starting with a decimal must not look like question numbers.
check(
  "decimal working does not split a question",
  routeSubmission([
    {
      label: "d.jpg",
      text: [
        "In a randomly breeding population of mice 36% have white coats. Calculate the phenotype frequency of black coat mice.",
        "0.36 is q squared",
        "0.6 is q",
        "0.64 is the answer",
      ].join("\n"),
    },
  ]).length,
  1,
);

// A photo split internally must be credited once, not once per chunk.
check(
  "a merged photo is credited once",
  routeSubmission([
    {
      label: "p.jpg",
      text: "1. State the Hardy-Weinberg Principle. Answer: allele and genotype frequencies remain constant in genetic equilibrium.\n2. List TWO conditions. Answer: no mutation, no migration.",
    },
  ])[0]?.labels,
  ["p.jpg"],
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
