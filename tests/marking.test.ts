import { markQuestion, markPart } from "../src/lib/marking.ts";
import { findStructured, CHAPTERS } from "../src/data/bank.ts";

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

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
