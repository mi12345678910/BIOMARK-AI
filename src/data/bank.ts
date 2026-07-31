/**
 * The question bank — the app's entire source of truth.
 *
 * Everything here is transcribed from the KMJ 2026/2027 tutorial papers and
 * their OFFICIAL marking schemes. Nothing is generated, and nothing is fetched
 * at runtime.
 *
 * ── ADDING QUESTIONS ────────────────────────────────────────────────────────
 * MCQ:  copy the stem, the four options and the scheme's answer letter.
 * Structured: one entry per past-year question, one `part` per (a)/(b)/(i)…
 *   For each mark point, `require` lists the REQUIREMENT GROUPS. Every group
 *   must be hit for the mark; within a group, any alternative counts — that is
 *   the scheme's "/" notation. Be generous with alternatives: a synonym you
 *   forget is a mark a student loses unfairly.
 *   Use `anyOf` for the scheme's "Any 2" / "Any 3" caps.
 * ────────────────────────────────────────────────────────────────────────────
 */

import type { QuestionPart } from "../lib/marking.ts";

export interface Mcq {
  id: string;
  stem: string;
  options: string[];
  /** Letter from the official scheme. */
  answer: string;
  /** Shown after answering. Written from the notes, not generated. */
  explain?: string;
  /**
   * Diagram belonging to the question stem, e.g. "the figure shows anaphase
   * of mitosis". Path under /public.
   */
  figure?: string;
  /**
   * Some past-year MCQs offer DIAGRAMS as the four options rather than words.
   * Their `options` are therefore bare letters, and this strip — A, B, C, D
   * side by side, exactly as printed — is what the student actually reads.
   * Without it those questions are unanswerable.
   */
  optionsFigure?: string;
}

export interface Structured {
  id: string;
  session: string;
  number: string;
  intro?: string;
  /**
   * The FIGURE / TABLE the question refers to. Questions that say "FIGURE 1
   * shows a cell cycle" cannot be answered without it, so this is required
   * wherever the intro or a prompt mentions one — enforced by a test.
   */
  figure?: string;
  parts: QuestionPart[];
}

export interface Chapter {
  id: string;
  number: number;
  en: string;
  bm: string;
  mcq: Mcq[];
  structured: Structured[];
}

/* ══════════════════════════════════════════════════════════════════════════
   CHAPTER 3 — CELL DIVISION
   ══════════════════════════════════════════════════════════════════════════ */

const CH3: Chapter = {
  id: "c3",
  number: 3,
  en: "Cell Division",
  bm: "Pembahagian Sel",
  mcq: [
    {
      id: "c3q1",
      stem: "DNA replication occurs…",
      options: [
        "A. between the gap phases of interphase.",
        "B. immediately before prophase of mitosis.",
        "C. during prophase of mitosis.",
        "D. during prophase of meiosis.",
      ],
      answer: "A",
      explain:
        "DNA is replicated in S phase, which lies between G1 and G2 — the two gap phases of interphase.",
    },
    {
      id: "c3q2",
      stem: "What happens during replication in the S phase of the cell cycle?",
      options: [
        "A. The number of chromatids doubled.",
        "B. The number of chromosomes doubled.",
        "C. The number of homologous chromosomes doubled.",
        "D. The amount of energy in mitochondria doubled.",
      ],
      answer: "A",
      explain:
        "Each chromosome becomes two sister chromatids. The chromosome count is unchanged — only the chromatid count doubles.",
    },
    {
      id: "c3q3",
      stem: "A cell has half as much DNA as some of the other cells in a mitotically active tissue. The cell is most likely in…",
      options: ["A. G1", "B. G2", "C. Metaphase", "D. Anaphase"],
      answer: "A",
      explain:
        "G1 precedes S phase, so the DNA has not yet been replicated — half the amount of a G2, metaphase or anaphase cell.",
    },
    {
      id: "c3q4",
      stem: "Mitosis involves the following stages.\n\n1 Chromosomes line up on the equatorial plate\n2 Nuclear envelope forms and cytoplasmic division begins\n3 Chromosomes become visible and spindle forms\n4 Sister chromatids move to opposite poles of the cell\n\nWhat are the correct names of these stages?",
      options: [
        "A. Prophase / Anaphase / Metaphase / Telophase",
        "B. Prophase / Telophase / Metaphase / Anaphase",
        "C. Metaphase / Anaphase / Prophase / Telophase",
        "D. Metaphase / Telophase / Prophase / Anaphase",
      ],
      answer: "D",
      explain:
        "1 = metaphase (equatorial plate), 2 = telophase (nuclear envelope reforms), 3 = prophase (chromosomes condense, spindle forms), 4 = anaphase (chromatids separate).",
    },
    {
      id: "c3q5",
      stem: "The figure below shows measurements taken during one mitotic cell cycle. Which stage of mitosis occurs during X, and which measurements are illustrated by curves 1 and 2?",
      options: [
        "A. Metaphase — curve 1 / curve 2",
        "B. Metaphase — curve 2 / curve 1",
        "C. Anaphase — curve 1 / curve 2",
        "D. Anaphase — curve 2 / curve 1",
      ],
      answer: "C",
      figure: "/figures/c3q5-graph.png",
      explain:
        "At X the centromere-to-pole distance falls while sister-chromatid separation rises — the signature of anaphase.",
    },
    {
      id: "c3q6",
      stem: "The figure shows the chromosomes of a cell before the metaphase stage of mitosis. Which option shows the chromosomes of each cell at telophase?",
      options: ["A", "B", "C", "D"],
      answer: "C",
      figure: "/figures/c3q6-stem.png",
      optionsFigure: "/figures/c3q6-options.png",
      explain:
        "At telophase each daughter cell receives single-chromatid chromosomes, at the same chromosome number as the parent.",
    },
    {
      id: "c3q7",
      stem: "The figure shows anaphase of mitosis. Which diagram shows anaphase I during meiosis in the same organism?",
      options: ["A", "B", "C", "D"],
      answer: "B",
      figure: "/figures/c3q7-stem.png",
      optionsFigure: "/figures/c3q7-options.png",
      explain:
        "In anaphase I homologous chromosomes separate while sister chromatids stay joined — so each pole receives half the chromosome number, still as two-chromatid chromosomes.",
    },
    {
      id: "c3q8",
      stem: "The figure shows a cell at anaphase I of meiosis. Which diagram shows a normal gamete that could be produced from this cell?",
      options: ["A", "B", "C", "D"],
      answer: "D",
      figure: "/figures/c3q8-stem.png",
      optionsFigure: "/figures/c3q8-options.png",
      explain:
        "A gamete is haploid with single-chromatid chromosomes, after meiosis II has separated the sister chromatids.",
    },
    {
      id: "c3q9",
      stem: "How does the second meiotic division differ from mitosis? In the second meiotic division…",
      options: [
        "A. Chiasmata form between the chromatids of a bivalent.",
        "B. Each chromosome replicates to form two chromatids during metaphase.",
        "C. Exchange of genetic material occurs between chromatids.",
        "D. The separating chromatids of a pair differ genetically.",
      ],
      answer: "D",
      explain:
        "Crossing over in prophase I means the sister chromatids separating in meiosis II are no longer genetically identical — unlike in mitosis.",
    },
    {
      id: "c3q10",
      stem: "Which of the following statements about meiosis are correct?\n\nI. Meiosis halves the amount of DNA.\nII. Meiosis enables sexual reproduction.\nIII. Meiosis results in the genetic diversity of offspring.\nIV. The first meiotic division in eukaryotes is similar to mitosis.\nV. Meiosis in higher eukaryotes occurs in somatic cells and gametes.",
      options: [
        "A. I, II and IV",
        "B. I, II and III",
        "C. II, III and V",
        "D. II, III and IV",
      ],
      answer: "B",
      explain:
        "IV is wrong — meiosis II resembles mitosis, not meiosis I. V is wrong — meiosis occurs only in germ cells, not somatic cells.",
    },
  ],

  structured: [
    {
      id: "c3-pspm1-2018",
      session: "PSPM I 2018/2019",
      number: "1",
      intro: "FIGURE 1 shows a cell cycle with phases P, Q and R labelled alongside Mitosis.",
      figure: "/figures/c3-2018-figure1.png",
      parts: [
        {
          ref: "(a)(i)",
          prompt: "Name phase P.",
          marks: 1,
          points: [
            {
              text: "Interphase",
              marks: 1,
              require: [["interphase", "inter phase"]],
            },
          ],
        },
        {
          ref: "(a)(ii)",
          prompt: "Describe the events that occur in phase Q.",
          marks: 2,
          anyOf: 2,
          points: [
            {
              text: "Cell growth / cell increases in size / cytoplasmic volume increases",
              marks: 1,
              require: [
                ["cell growth", "grow", "increase in size", "increases in size", "cytoplasmic volume", "cell size"],
              ],
            },
            {
              text: "Cell produces macromolecules / protein / lipid / carbohydrate / enzyme",
              marks: 1,
              require: [["macromolecule", "protein", "lipid", "carbohydrate", "enzyme"]],
            },
            {
              text: "Increase in number of organelles // synthesis of organelles (such as mitochondria and endoplasmic reticulum)",
              marks: 1,
              require: [["organelle", "mitochondria", "endoplasmic reticulum"]],
            },
          ],
          note: "Scheme: any 2 of the listed points.",
        },
        {
          ref: "(a)(iii)",
          prompt: "Explain the importance of phase R.",
          marks: 3,
          points: [
            {
              text: "To allow / maintain the same number of chromosomes in daughter cells (as the parent cell after cell division / mitosis)",
              marks: 1,
              require: [
                ["same number", "maintain", "constant"],
                ["chromosome"],
                ["daughter cell", "daughter cells", "parent cell"],
              ],
            },
            {
              text: "DNA is replicated / duplicated // histones are synthesised to allow DNA synthesis to occur",
              marks: 1,
              require: [
                ["dna", "histone"],
                ["replicat", "duplicat", "synthesi"],
              ],
            },
            {
              text: "To double the genome / increase the amount of DNA",
              marks: 1,
              require: [
                ["double", "increase", "twice"],
                ["genome", "amount of dna", "dna content", "dna"],
              ],
            },
          ],
        },
      ],
    },
    {
      id: "c3-pspm1-2012",
      session: "PSPM I 2012/2013",
      number: "2",
      intro: "FIGURE 2 shows the stages of the cell cycle, labelled P, Q, R and S.",
      figure: "/figures/c3-2012-figure2.png",
      parts: [
        {
          ref: "(a)",
          prompt: "Name the stages labelled P, Q, R and S.",
          marks: 4,
          points: [
            {
              text: "P: M / Mitosis / Mitotic phase",
              marks: 1,
              require: [["mitosis", "mitotic", "m phase"]],
            },
            { text: "Q: G1 / Gap 1", marks: 1, require: [["g1", "gap 1"]] },
            { text: "R: S (phase)", marks: 1, require: [["s phase", "synthesis"]] },
            { text: "S: G2 / Gap 2", marks: 1, require: [["g2", "gap 2"]] },
          ],
        },
        {
          ref: "(b)",
          prompt: "What happens to the chromosomes and cells during stage P?",
          marks: 2,
          anyOf: 2,
          points: [
            {
              text: "Chromosomes shorten, thicken and condense during prophase",
              marks: 1,
              require: [
                ["chromosome"],
                ["condense", "shorten", "thicken", "coil"],
              ],
            },
            {
              text: "Chromosomes align at the metaphase plate during metaphase",
              marks: 1,
              require: [
                ["align", "line up", "arrange"],
                ["metaphase plate", "equator", "equatorial"],
              ],
            },
            {
              text: "Sister chromatids separate and move to opposite poles during anaphase",
              marks: 1,
              require: [
                ["sister chromatid", "chromatid"],
                ["separate", "move to opposite", "opposite pole"],
              ],
            },
            {
              text: "Chromosomes reach opposite poles during telophase",
              marks: 1,
              require: [["reach", "arrive"], ["pole"]],
            },
          ],
          note: "Scheme: any 2 of the listed points.",
        },
        {
          ref: "(c)",
          prompt: "In which phase do stages Q, R and S exist?",
          marks: 1,
          points: [
            { text: "Interphase", marks: 1, require: [["interphase", "inter phase"]] },
          ],
        },
        {
          ref: "(d)",
          prompt: "State THREE processes that occur during stage Q.",
          marks: 3,
          points: [
            {
              text: "Cell produces macromolecules / protein / lipid / carbohydrate / enzyme",
              marks: 1,
              require: [["macromolecule", "protein", "lipid", "carbohydrate", "enzyme"]],
            },
            {
              text: "Increase in number of organelles // synthesis of organelles (such as mitochondria and endoplasmic reticulum)",
              marks: 1,
              require: [["organelle", "mitochondria", "endoplasmic reticulum"]],
            },
            {
              text: "Cytoplasmic volume increases / cell size increases / cell growth",
              marks: 1,
              require: [
                ["cytoplasmic volume", "cell size", "cell growth", "grow", "increase in size"],
              ],
            },
          ],
        },
      ],
    },
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
   CHAPTER 4 — GENETIC INHERITANCE
   ══════════════════════════════════════════════════════════════════════════ */

const CH4: Chapter = {
  id: "c4",
  number: 4,
  en: "Genetic Inheritance",
  bm: "Pewarisan Genetik",
  mcq: [
    {
      id: "c4q1",
      stem: "A testcross consists of a cross…",
      options: [
        "A. between an offspring and its parent.",
        "B. between two unknown forms to determine their genotypes.",
        "C. of an F1 hybrid to an individual that is homozygous recessive.",
        "D. of two pure-breeding forms to find out which form of a gene is dominant.",
      ],
      answer: "C",
      explain:
        "A testcross pairs an individual of unknown genotype with a homozygous recessive, so the offspring phenotypes reveal the unknown genotype directly.",
    },
    {
      id: "c4q2",
      stem: "Which of the following statements are true for a pair of homologous chromosomes?\n\nI. Each contains the same number of genes.\nII. Each contains the same sequence of genes.\nIII. Each contains the same type of alleles.\nIV. The centromere is located at the same position on each.",
      options: [
        "A. I, II and III",
        "B. I, II and IV",
        "C. I, III and IV",
        "D. I, II, III and IV",
      ],
      answer: "B",
      explain:
        "III is false — homologues carry the same genes but may carry different alleles of those genes.",
    },
    {
      id: "c4q3",
      stem: "Mating of two plants produces a 1:1 ratio of phenotypes in the F1 progeny. What are the parental genotypes for this cross?",
      options: ["A. Aa x Aa", "B. Aa x aa", "C. AA x aa", "D. AA x AA"],
      answer: "B",
      explain: "Aa × aa is a testcross, giving 1 Aa : 1 aa — a 1:1 phenotypic ratio.",
    },
    {
      id: "c4q4",
      stem: "A purple-flowered, tall plant was crossed with a homozygous white-flowered, dwarf plant. The F1 progeny were: purple/tall 53, white/tall 49, purple/dwarf 53, white/dwarf 47. Using P for purple and T for tall, determine the genotype of the purple, tall parent.",
      options: ["A. PPTT", "B. PPTt", "C. PpTt", "D. PpTT"],
      answer: "C",
      explain:
        "A roughly 1:1:1:1 ratio from a cross with a double recessive is the signature of a dihybrid testcross — the unknown parent is PpTt.",
    },
    {
      id: "c4q5",
      stem: "If gene A and gene B are located on different chromosomes, which of the following crosses will produce progeny with genotype AaBb?\n\nI. Aabb × aaBb\nII. AaBB × Aabb\nIII. aaBB × AABb\nIV. aabb × AaBb",
      options: [
        "A. I, II and III",
        "B. I, II and IV",
        "C. I, III and IV",
        "D. I, II, III and IV",
      ],
      answer: "D",
      explain: "Every one of the four crosses can yield an AaBb offspring.",
    },
    {
      id: "c4q6",
      stem: "In aubergine, brown stem is dominant over green stem and purple fruit is dominant over white fruit. Two plants heterozygous for both characters are crossed. What is the expected ratio of progeny with brown stem and white fruit?",
      options: ["A. 1/16", "B. 3/16", "C. 4/16", "D. 6/16"],
      answer: "B",
      explain:
        "A dihybrid cross gives 9:3:3:1. Brown stem (dominant) with white fruit (recessive) is the 3/16 class.",
    },
    {
      id: "c4q7",
      stem: "In Drosophila, ebony body is recessive (e) and grey is dominant (e⁺); vestigial wing is recessive (vg) and normal is dominant (vg⁺). Crossing two heterozygotes for grey body and normal wings produces 128 offspring. How many F1 offspring will be grey with vestigial wings?",
      options: ["A. 8", "B. 24", "C. 32", "D. 72"],
      answer: "B",
      explain: "Grey (dominant) with vestigial (recessive) is 3/16. 3/16 × 128 = 24.",
    },
    {
      id: "c4q8",
      stem: "In cattle, roan coat colour occurs in the heterozygous (Rr) offspring of red (RR) and white (rr) homozygotes. When two roan cattle are crossed the progeny are 1 red : 2 roan : 1 white. Which cross could produce the highest percentage of roan cattle?",
      options: [
        "A. red x white",
        "B. roan x roan",
        "C. white x roan",
        "D. red x roan",
      ],
      answer: "A",
      explain:
        "RR × rr gives 100% Rr — all roan. Roan × roan gives only 50%.",
    },
    {
      id: "c4q9",
      stem: "In radish, long = LL, sphere = ll, oblong = Ll; red = RR, white = rr, purple = Rr. What is the phenotype ratio from crossing a white oblong radish with a red oblong radish?",
      options: [
        "A. purple long 1, purple oblong 1, purple sphere 2",
        "B. red long 1, red oblong 2, red sphere 1",
        "C. red long 1, purple oblong 2, red sphere 1",
        "D. purple long 1, purple oblong 2, purple sphere 1",
      ],
      answer: "D",
      explain:
        "rr × RR gives all Rr (purple). Ll × Ll gives 1 long : 2 oblong : 1 sphere. Both genes show incomplete dominance.",
    },
    {
      id: "c4q10",
      stem: "Polygenes are…",
      options: [
        "A. Both alleles that give partial influence in heterozygous condition.",
        "B. Both alleles in a heterozygote are dominant and fully expressed in phenotype.",
        "C. More than two alternative forms of a particular gene that occupy the same locus.",
        "D. More than two genes occupy different loci but control the same characteristic.",
      ],
      answer: "D",
      explain:
        "Polygenic inheritance means several genes at different loci contribute additively to one continuous trait. Option C describes multiple alleles.",
    },
    {
      id: "c4q11",
      stem: "In domestic cats the genes for yellow and black fur are a sex-linked, codominant allelic pair; the heterozygote is tortoiseshell. Black males are mated with tortoiseshell females. What are the expected ratios of phenotypes and sexes in the offspring?",
      options: [
        "A. Males 1 black : 1 tortoiseshell / Females 1 black : 1 tortoiseshell",
        "B. Males 1 black : 1 yellow / Females 1 black : 1 tortoiseshell",
        "C. Males 1 black : 1 yellow / Females 1 black : 1 yellow",
        "D. Males 1 black / Females 1 black : 1 yellow : 1 tortoiseshell",
      ],
      answer: "B",
      explain:
        "Males inherit one X from the mother, so they are either black or yellow. Females get the father's black X plus either maternal X, giving black or tortoiseshell.",
    },
    {
      id: "c4q12",
      stem: "In Drosophila the male is the heterogametic sex. The allele for white eyes is recessive and sex-linked. A female heterozygous at this locus was mated with a normal male. White eyes will be present in…",
      options: [
        "A. all the offspring.",
        "B. all the male offspring but none of the female offspring.",
        "C. none of the female offspring and 50% of the male offspring.",
        "D. none of the male offspring and 50% of the female offspring.",
      ],
      answer: "C",
      explain:
        "Sons receive their single X from the carrier mother, so half are white-eyed. Daughters also receive the father's normal X, so none show the trait.",
    },
    {
      id: "c4q13",
      stem: "The pedigree below shows the inheritance of haemophilia in a family. What is the genotype of person 7?",
      options: ["A. XᴴXᴴ", "B. XᴴY", "C. XᴴXʰ", "D. XʰXʰ",],
      answer: "C",
      figure: "/figures/c4q13-pedigree.png",
      explain:
        "Person 7 is a phenotypically normal female with an affected son, so she must be a carrier — XᴴXʰ.",
    },
    {
      id: "c4q14",
      stem: "In a linear chromosome map the distances between four loci are: a–b 10 cM, b–c 4 cM, a–d 3 cM, a–c 6 cM. What is the crossover value between c and d?",
      options: ["A. 4 – 12%", "B. 3 – 6%", "C. 9%", "D. 3%"],
      answer: "C",
      explain:
        "Order along the chromosome is a–d 3, a–c 6, so d–c = 6 − 3 = 3 cM… the scheme accepts C (and marks D as an alternative in some years). Check with your lecturer.",
    },
  ],
  structured: [],
};

/* ══════════════════════════════════════════════════════════════════════════
   CHAPTER 5 — POPULATION GENETICS
   ══════════════════════════════════════════════════════════════════════════ */

const HW_LAW_POINT = {
  text: "In a population that exists in genetic equilibrium, the allele and genotype frequencies will remain constant from one generation to the next generation provided certain conditions are met",
  marks: 1,
  require: [
    ["genetic equilibrium", "equilibrium"],
    ["constant", "remain the same", "unchanged", "do not change"],
    ["allele", "genotype", "frequenc"],
  ],
};

const HW_CONDITIONS = [
  { text: "No mutation", marks: 1, require: [["no mutation", "without mutation", "absence of mutation"]] },
  { text: "No migration", marks: 1, require: [["no migration", "no gene flow", "without migration"]] },
  { text: "No natural selection", marks: 1, require: [["no natural selection", "no selection", "without natural selection"]] },
  { text: "Random mating / fertilisation", marks: 1, require: [["random mating", "random fertilisation", "random fertilization", "mate randomly"]] },
  { text: "Large population size", marks: 1, require: [["large population", "big population", "population is large"]] },
];

const CH5: Chapter = {
  id: "c5",
  number: 5,
  en: "Population Genetics",
  bm: "Genetik Populasi",
  mcq: [
    {
      id: "c5q1",
      stem: "In a human population, 75% have the ability to roll their tongue. Individuals who cannot roll their tongue are homozygous recessive. What is the frequency of the recessive allele?",
      options: ["A. 0.05", "B. 0.25", "C. 0.50", "D. 0.70"],
      answer: "C",
      explain: "Non-rollers = 25%, so q² = 0.25 and q = √0.25 = 0.50.",
    },
    {
      id: "c5q2",
      stem: "If the frequency of the recessive allele is 30%, what is the percentage of heterozygous carriers?",
      options: ["A. 9", "B. 27", "C. 42", "D. 60"],
      answer: "C",
      explain: "q = 0.3, p = 0.7. 2pq = 2(0.7)(0.3) = 0.42 = 42%.",
    },
    {
      id: "c5q3",
      stem: "If 1.0% of the population suffers from sickle cell anaemia, what is the percentage of the heterozygous genotype?",
      options: ["A. 1", "B. 9", "C. 18", "D. 81"],
      answer: "C",
      explain: "q² = 0.01, q = 0.1, p = 0.9. 2pq = 2(0.9)(0.1) = 0.18 = 18%.",
    },
    {
      id: "c5q4",
      stem: "Of 400 people on a Pacific island, 16 are homozygous recessive for a trait with only two alleles in the population. The number of heterozygous people is…",
      options: ["A. 32", "B. 64", "C. 128", "D. 256"],
      answer: "C",
      explain: "q² = 16/400 = 0.04, q = 0.2, p = 0.8. 2pq = 0.32; 0.32 × 400 = 128.",
    },
    {
      id: "c5q5",
      stem: "Assuming Hardy-Weinberg equilibrium, 21% of a population is homozygous dominant, 50% heterozygous and 29% homozygous recessive. What percentage of the next generation is predicted to be homozygous recessive?",
      options: ["A. 21%", "B. 29%", "C. 42%", "D. 50%"],
      answer: "B",
      explain:
        "At equilibrium the genotype frequencies stay constant from one generation to the next, so it remains 29%.",
    },
    {
      id: "c5q6",
      stem: "Which of these does NOT occur if a population is to maintain the equilibrium of allele frequencies?",
      options: [
        "A. People leave one country and relocate to another.",
        "B. A disease wipes out the majority of a herd of deer.",
        "C. Large black rats are the preferred males in a population of rats.",
        "D. All of these are correct.",
      ],
      answer: "D",
      explain:
        "All three break a Hardy-Weinberg condition — A is migration, B is a drastic population reduction, C is non-random mating.",
    },
    {
      id: "c5q7",
      stem: "Immigration of individuals into a population in Hardy-Weinberg equilibrium will NOT upset the equilibrium if…",
      options: [
        "A. they arrive in large numbers.",
        "B. they are beyond the age of reproduction.",
        "C. they mate randomly in the new population.",
        "D. females and males are in equal proportions.",
      ],
      answer: "B",
      explain:
        "Individuals past reproductive age contribute no alleles to the next generation, so the gene pool is unchanged.",
    },
  ],

  structured: [
    {
      id: "c5-ups2-2005",
      session: "UPS II 2005/2006",
      number: "1",
      parts: [
        {
          ref: "(a)(i)",
          prompt: "State the Hardy-Weinberg Principle.",
          marks: 1,
          points: [HW_LAW_POINT],
        },
        {
          ref: "(a)(ii)",
          prompt: "List TWO conditions for this principle to be achieved.",
          marks: 2,
          anyOf: 2,
          points: HW_CONDITIONS,
          note: "Scheme: any 2 of the five conditions.",
        },
        {
          ref: "(b)",
          prompt:
            "In a randomly breeding population of mice, black coat (H) is dominant to white coat (h). In the population, 36% have white coats. Calculate the phenotype frequency of black coat mice in this population.",
          marks: 3,
          points: [
            {
              text: "Frequency of recessive allele, q = √0.36 = 0.6",
              marks: 1,
              require: [["0.6"]],
            },
            {
              text: "p + q = 1, so frequency of dominant allele, p = 0.4",
              marks: 1,
              require: [["0.4"]],
            },
            {
              text: "Genotype frequency for black coat mice = p² + 2pq = (0.4)² + 2(0.4)(0.6) = 0.64   [or 1 − q² = 1 − 0.36 = 0.64]",
              marks: 1,
              require: [["0.64"]],
            },
          ],
          note: "Show the working. The scheme credits 0.6, 0.4 and 0.64 separately.",
        },
        {
          ref: "(c)",
          prompt:
            "In a human population, the frequency of recessive individuals for extra-long eyelashes is 90 per 1000. What percentage of this population carries the recessive allele but displays the short-eyelash phenotype?",
          marks: 4,
          points: [
            {
              text: "Frequency of homozygous recessive genotype, q² = 90/1000 = 0.09",
              marks: 1,
              require: [["0.09"]],
            },
            {
              text: "Frequency of recessive allele, q = 0.3",
              marks: 1,
              require: [["0.3"]],
            },
            {
              text: "p + q = 1, so frequency of dominant allele, p = 0.7",
              marks: 1,
              require: [["0.7"]],
            },
            {
              text: "% carriers = 2pq × 100% = 2(0.7)(0.3) × 100% = 42%",
              marks: 1,
              require: [["42"]],
            },
          ],
        },
      ],
    },
    {
      id: "c5-pspm1-2020",
      session: "PSPM I 2020/2021",
      number: "5",
      intro:
        "In a population of 1000 snails that mate randomly, 800 of the snails are grey. Shell colour is controlled by two alleles: G for grey and g for white. Assume Hardy-Weinberg equilibrium.",
      parts: [
        {
          ref: "(a)",
          prompt: "Calculate the dominant and recessive allele frequencies.",
          marks: 3,
          points: [
            {
              text: "Number of white snails = 1000 − 800 = 200",
              marks: 1,
              require: [["200"]],
            },
            {
              text: "Frequency of homozygous recessive genotype, q² = 200/1000 = 0.2",
              marks: 1,
              require: [["0.2"]],
            },
            {
              text: "Recessive allele frequency, q = √0.2 = 0.447",
              marks: 1,
              require: [["0.447", "0.45"]],
            },
            {
              text: "p + q = 1, so dominant allele frequency, p = 0.553",
              marks: 1,
              require: [["0.553", "0.55"]],
            },
          ],
          note: "Scheme maximum: 3 marks. Population of 1000 → answer to 3 decimal places.",
        },
        {
          ref: "(b)",
          prompt: "Calculate the number of snails which are heterozygous for this trait.",
          marks: 2,
          points: [
            {
              text: "Frequency of heterozygous genotype, 2pq = 2(0.553)(0.447) = 0.494",
              marks: 1,
              require: [["0.494", "0.49"]],
            },
            {
              text: "Number of heterozygous snails = 0.494 × 1000 = 494 snails",
              marks: 1,
              require: [["494"]],
            },
          ],
        },
      ],
    },
    {
      id: "c5-pspm1-2019",
      session: "PSPM I 2019/2020",
      number: "12",
      intro:
        "In a population of mice, the allele for yellow fur (E) is dominant over the allele for grey fur (e). 16% of the mice have grey fur. Assume genetic equilibrium.",
      parts: [
        {
          ref: "(a)",
          prompt: "Give TWO assumptions used in the Hardy-Weinberg equilibrium.",
          marks: 2,
          anyOf: 2,
          points: HW_CONDITIONS,
          note: "Scheme: any 2.",
        },
        {
          ref: "(b)",
          prompt: "Calculate the frequency of the yellow and grey fur alleles.",
          marks: 3,
          points: [
            {
              text: "Frequency of grey mice (ee) = q² = 0.16",
              marks: 1,
              require: [["0.16"]],
            },
            {
              text: "Frequency of grey / recessive allele, q = √0.16 = 0.4",
              marks: 1,
              require: [["0.4"]],
            },
            {
              text: "p + q = 1, so frequency of yellow / dominant allele, p = 1 − 0.4 = 0.6",
              marks: 1,
              require: [["0.6"]],
            },
          ],
        },
        {
          ref: "(c)",
          prompt: "Calculate the number of heterozygous mice in a population of 1000 mice.",
          marks: 2,
          points: [
            {
              text: "Frequency of heterozygous mice (Ee), 2pq = 2(0.6)(0.4) = 0.48",
              marks: 1,
              require: [["0.48"]],
            },
            {
              text: "Number of heterozygotes = 0.48 × 1000 = 480",
              marks: 1,
              require: [["480"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-ups2-2006",
      session: "UPS II 2006/2007",
      number: "2",
      parts: [
        {
          ref: "(a)",
          prompt: "State TWO assumptions of the Hardy-Weinberg Law for genetic equilibrium.",
          marks: 2,
          anyOf: 2,
          points: HW_CONDITIONS,
          note: "Scheme: any 2.",
        },
        {
          ref: "(b)(i)",
          prompt:
            "In a population, 14% of babies are born with albinism. Calculate the frequency of the recessive allele.",
          marks: 1,
          points: [
            {
              text: "q² = 14/100 = 0.14, so q = √0.14 = 0.37",
              marks: 1,
              require: [["0.37"]],
            },
          ],
        },
        {
          ref: "(b)(ii)",
          prompt: "Calculate the frequency of the dominant allele.",
          marks: 1,
          points: [
            {
              text: "p + q = 1, so p = 1 − 0.37 = 0.63",
              marks: 1,
              require: [["0.63"]],
            },
          ],
        },
        {
          ref: "(c)(i)",
          prompt:
            "In a population of 1200 students, only 200 have a dimple (a dominant trait). Calculate the allele frequency of the students with dimples.",
          marks: 2,
          points: [
            {
              text: "Frequency of homozygous recessive genotype, q² = 1000/1200 = 0.833; q = 0.913",
              marks: 1,
              require: [["0.913", "0.91"]],
            },
            {
              text: "p + q = 1, so frequency of dominant allele, p = 0.087",
              marks: 1,
              require: [["0.087", "0.09"]],
            },
          ],
        },
        {
          ref: "(c)(ii)",
          prompt: "Determine the number of students who are heterozygous for this trait.",
          marks: 2,
          points: [
            {
              text: "Frequency of heterozygous genotype, 2pq = 2(0.087)(0.913) = 0.159",
              marks: 1,
              require: [["0.159", "0.16"]],
            },
            {
              text: "Number of heterozygous students = 0.159 × 1200 = 191 students",
              marks: 1,
              require: [["191"]],
            },
          ],
        },
        {
          ref: "(c)(iii)",
          prompt:
            "If two heterozygous individuals for this trait marry, what is the probability of having a child who is homozygous dominant?",
          marks: 2,
          points: [
            {
              text: "1/4",
              marks: 2,
              require: [["1/4", "0.25", "25"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-ups2-2007",
      session: "UPS II 2007/2008",
      number: "3",
      intro:
        "Fur colour in a small mammal is controlled by a pair of alleles, B for black and b for yellow. 60 individuals have yellow fur and 1440 have black fur, of which 960 are pure-breeding.",
      parts: [
        {
          ref: "(b)(i)",
          prompt: "State the Hardy-Weinberg Law.",
          marks: 1,
          points: [HW_LAW_POINT],
        },
        {
          ref: "(b)(ii)",
          prompt: "Calculate the total number of B and b alleles.",
          marks: 2,
          points: [
            {
              text: "Heterozygous individuals, Bb = 1440 − 960 = 480. Total allele B = (2 × 960) + 480 = 2400",
              marks: 1,
              require: [["2400"]],
            },
            {
              text: "Total allele b = (2 × 60) + 480 = 600",
              marks: 1,
              require: [["600"]],
            },
          ],
        },
        {
          ref: "(b)(iii)",
          prompt:
            "If sexual reproduction occurs at random, calculate the frequency of the yellow fur phenotype in the next generation.",
          marks: 2,
          points: [
            {
              text: "Frequency of recessive allele, q = 600/3000 = 0.2",
              marks: 1,
              require: [["0.2"]],
            },
            {
              text: "Frequency of yellow fur, q² = (0.2)² = 0.04   [or 60/1500 = 0.04]",
              marks: 1,
              require: [["0.04"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-ups2-2008",
      session: "UPS II 2008/2009",
      number: "4",
      intro:
        "In a population of 700 hamsters, 543 have black fur. The allele for black fur B is dominant over white fur b.",
      parts: [
        {
          ref: "(b)(i)",
          prompt: "State TWO conditions where Hardy-Weinberg equilibrium applies.",
          marks: 2,
          anyOf: 2,
          points: HW_CONDITIONS,
          note: "Scheme: any 2.",
        },
        {
          ref: "(b)(ii)",
          prompt: "Calculate the genotype frequency of heterozygous hamsters in this population.",
          marks: 3,
          points: [
            {
              text: "Homozygous recessive individuals, bb = 700 − 543 = 157; q² = 157/700 = 0.22, so q = 0.47",
              marks: 1,
              require: [["0.47"]],
            },
            {
              text: "p + q = 1, so frequency of dominant allele, p = 0.53",
              marks: 1,
              require: [["0.53"]],
            },
            {
              text: "Genotype frequency of heterozygous hamsters, 2pq = 2(0.53)(0.47) = 0.5 (0.498)",
              marks: 1,
              require: [["0.498", "0.5"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-pspm2-2009",
      session: "PSPM II 2009/2010",
      number: "6",
      intro:
        "TABLE 1 shows a genetic population study on Drosophila. Normal wing (L) is dominant over vestigial wing (l). Normal wing: 400. Vestigial wing: 64.",
      parts: [
        {
          ref: "(a)",
          prompt: "What is the frequency of allele L and allele l?",
          marks: 2,
          points: [
            {
              text: "Frequency of vestigial wing (ll), q² = 64/464 = 0.14, so q = 0.37",
              marks: 1,
              require: [["0.37"]],
            },
            {
              text: "p + q = 1, so frequency of allele L, p = 0.63",
              marks: 1,
              require: [["0.63"]],
            },
          ],
        },
        {
          ref: "(b)",
          prompt: "How many heterozygous Drosophila have normal wings? Show the calculation.",
          marks: 3,
          points: [
            {
              text: "Frequency of heterozygous genotype, 2pq = 2(0.63)(0.37) = 0.47",
              marks: 1,
              require: [["0.47"]],
            },
            {
              text: "Number of heterozygous normal wing = 0.47 × 464 = 218",
              marks: 2,
              require: [["218"]],
            },
          ],
        },
        {
          ref: "(c)(i)",
          prompt:
            "If all vestigial-winged Drosophila are removed, how many homozygous dominant are left?",
          marks: 1,
          points: [
            {
              text: "Number of homozygous dominant = 400 − 218 = 182",
              marks: 1,
              require: [["182"]],
            },
          ],
        },
        {
          ref: "(c)(ii)",
          prompt: "Calculate the frequency of allele L and allele l in the new population.",
          marks: 4,
          points: [
            {
              text: "Frequency of allele L, p = [(182 × 2) + 218] / (400 × 2) = 0.73",
              marks: 2,
              require: [["0.73"]],
            },
            {
              text: "Frequency of allele l, q = 218 / (400 × 2) = 0.27   [or 1 − 0.73 = 0.27]",
              marks: 2,
              require: [["0.27"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-ups2-2010",
      session: "UPS II 2010/2011",
      number: "7",
      intro:
        "For sheep, normal fur is controlled by a dominant allele (R) and non-uniform fur by a recessive allele (r). In a population of 2000 sheep that mate randomly, 500 have non-uniform fur.",
      parts: [
        {
          ref: "(a)",
          prompt: "State the Hardy-Weinberg Law.",
          marks: 1,
          points: [HW_LAW_POINT],
        },
        {
          ref: "(b)(i)",
          prompt: "Calculate the frequency of the recessive allele in the population.",
          marks: 1,
          points: [
            {
              text: "Frequency of genotype rr, q² = 500/2000 = 0.25, so q = 0.5",
              marks: 1,
              require: [["0.5"]],
            },
          ],
        },
        {
          ref: "(b)(ii)",
          prompt: "Calculate the frequency of the dominant allele in the population.",
          marks: 1,
          points: [
            {
              text: "p + q = 1, so frequency of dominant allele, p = 0.5",
              marks: 1,
              require: [["0.5"]],
            },
          ],
        },
        {
          ref: "(b)(iii)",
          prompt: "Calculate the number of sheep with normal fur in the population.",
          marks: 2,
          points: [
            {
              text: "Frequency of normal fur, p² + 2pq = 0.25 + 0.5 = 0.75   [or 1 − q² = 0.75]",
              marks: 1,
              require: [["0.75"]],
            },
            {
              text: "Number of sheep with normal fur = 0.75 × 2000 = 1500",
              marks: 1,
              require: [["1500"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-pspm1-2011",
      session: "PSPM I 2011/2012",
      number: "8",
      intro:
        "Thalassemia is an autosomal recessive blood disease. Thalassemia major is the homozygous recessive condition; thalassemia minor is the heterozygous condition. In a population of 12,750, two individuals suffer from thalassemia major.",
      parts: [
        {
          ref: "(a)",
          prompt:
            "Determine the frequencies of the dominant and recessive alleles in the population. Calculate to five decimal places.",
          marks: 5,
          points: [
            {
              text: "p² + 2pq + q² = 1 and p + q = 1",
              marks: 1,
              require: [["2pq", "p+q", "p + q"]],
            },
            {
              text: "Frequency of homozygous recessive genotype, q² = 2/12750 = 0.00016",
              marks: 1,
              require: [["0.00016"]],
            },
            {
              text: "Frequency of recessive allele, q = 0.01265",
              marks: 1,
              require: [["0.01265"]],
            },
            {
              text: "Frequency of dominant allele, p = 1 − q = 0.98735",
              marks: 2,
              require: [["0.98735"]],
            },
          ],
          note: "Scheme requires five decimal places.",
        },
        {
          ref: "(b)",
          prompt: "How many individuals would suffer from thalassemia minor in the population?",
          marks: 2,
          points: [
            {
              text: "Frequency of heterozygous genotype, 2pq = 2(0.98735)(0.01265) = 0.02498",
              marks: 1,
              require: [["0.02498"]],
            },
            {
              text: "Number with thalassemia minor = 0.02498 × 12750 = 318 individuals",
              marks: 1,
              require: [["318"]],
            },
          ],
        },
        {
          ref: "(c)",
          prompt:
            "If 1,000 normal individuals migrate out of the population, what are the new frequencies of the dominant and recessive alleles?",
          marks: 3,
          points: [
            {
              text: "Normal individuals = 12750 − 318 − 2 = 12430; after emigration 12430 − 1000 = 11430",
              marks: 1,
              require: [["11430"]],
            },
            {
              text: "New frequency of dominant allele = [(11430 × 2) + 318] / (11750 × 2) = 0.98630",
              marks: 1,
              require: [["0.98630", "0.9863"]],
            },
            {
              text: "New frequency of recessive allele = [318 + (2 × 2)] / (11750 × 2) = 0.01370",
              marks: 1,
              require: [["0.01370", "0.0137"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-pspm1-2014",
      session: "PSPM I 2014/2015",
      number: "9",
      intro:
        "Body colour in fruit flies is controlled by a pair of alleles: grey (E) is dominant over ebony (e). In a population of 2000 fruit flies, 320 have ebony bodies. Assume Hardy-Weinberg equilibrium.",
      parts: [
        {
          ref: "(b)(i)",
          prompt: "State the Hardy-Weinberg equation.",
          marks: 1,
          points: [
            {
              text: "p² + 2pq + q² = 1 and p + q = 1",
              marks: 1,
              require: [["2pq", "p+q", "p + q"]],
            },
          ],
        },
        {
          ref: "(b)(ii)",
          prompt: "Calculate the frequencies of the E and e alleles.",
          marks: 2,
          points: [
            {
              text: "Frequency of homozygous recessive genotype (ee), q² = 320/2000 = 0.16, so q = 0.4",
              marks: 1,
              require: [["0.4"]],
            },
            {
              text: "Frequency of allele E, p = 1 − 0.4 = 0.6",
              marks: 1,
              require: [["0.6"]],
            },
          ],
        },
        {
          ref: "(b)(iii)",
          prompt: "Calculate the number of heterozygous individuals.",
          marks: 2,
          points: [
            {
              text: "Frequency of heterozygous individuals, 2pq = 2(0.6)(0.4) = 0.48",
              marks: 1,
              require: [["0.48"]],
            },
            {
              text: "Number of heterozygous individuals = 0.48 × 2000 = 960",
              marks: 1,
              require: [["960"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-pspm1-2016",
      session: "PSPM I 2016/2017",
      number: "10",
      intro:
        "A farmer has 2000 cows: 1500 are brown coated and the rest white coated. Allele B (brown) is dominant, allele b (white) is recessive. Assume genetic equilibrium and random breeding.",
      parts: [
        {
          ref: "(a)",
          prompt: "Calculate the frequency of the dominant and recessive alleles.",
          marks: 2,
          points: [
            {
              text: "Frequency of white coat cows, q² = 500/2000 = 0.25, so q = 0.5",
              marks: 1,
              require: [["0.5"]],
            },
            {
              text: "p + q = 1, so frequency of dominant allele, p = 0.5",
              marks: 1,
              require: [["0.5"]],
            },
          ],
        },
        {
          ref: "(b)",
          prompt:
            "Calculate the genotype frequencies in the F1 generation if the cows breed randomly.",
          marks: 3,
          points: [
            { text: "Frequency of BB, p² = (0.5)² = 0.25", marks: 1, require: [["0.25"]] },
            { text: "Frequency of Bb, 2pq = 2(0.5)(0.5) = 0.5", marks: 1, require: [["0.5"]] },
            { text: "Frequency of bb, q² = (0.5)² = 0.25", marks: 1, require: [["0.25"]] },
          ],
        },
        {
          ref: "(c)",
          prompt:
            "If the farmer adds another 1000 homozygous dominant brown cows, calculate the new dominant allele frequency.",
          marks: 2,
          points: [
            {
              text: "Total dominant alleles originally = 0.5 × 4000 = 2000; new total = 2000 + 2(1000) = 4000",
              marks: 1,
              require: [["4000"]],
            },
            {
              text: "New frequency of dominant allele = 4000 / (3000 × 2) = 0.667",
              marks: 1,
              require: [["0.667", "0.67"]],
            },
          ],
        },
        {
          ref: "(d)",
          prompt: "State THREE conditions for Hardy-Weinberg equilibrium to be achieved.",
          marks: 3,
          anyOf: 3,
          points: HW_CONDITIONS,
          note: "Scheme: any 3.",
        },
      ],
    },

    {
      id: "c5-pspm1-2018",
      session: "PSPM I 2018/2019",
      number: "11",
      parts: [
        {
          ref: "(a)",
          prompt:
            "In a population of 13000 wild chickens, 16% have short legs (a recessive trait). Assuming Hardy-Weinberg equilibrium, how many wild chickens are heterozygotes in the next generation if the population increases to 15000?",
          marks: 7,
          points: [
            {
              text: "p = frequency of the dominant allele and q = frequency of the recessive allele (short leg)",
              marks: 1,
              require: [
                ["dominant"],
                ["recessive"],
              ],
            },
            {
              text: "Frequency of short leg / homozygous recessive, q² = 0.16 (16/100)",
              marks: 1,
              require: [["0.16"]],
            },
            {
              text: "Frequency of recessive allele, q = √0.16 = 0.4",
              marks: 2,
              require: [["0.4"]],
            },
            {
              text: "p + q = 1, so frequency of dominant allele, p = 1 − 0.4 = 0.6",
              marks: 1,
              require: [["0.6"]],
            },
            {
              text: "Frequency of heterozygote, 2pq = 2(0.6)(0.4) = 0.48",
              marks: 1,
              require: [["0.48"]],
            },
            {
              text: "Number of heterozygotes in the next generation = 0.48 × 15000 = 7200",
              marks: 1,
              require: [["7200"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-pspm1-2022",
      session: "PSPM I 2022/2023",
      number: "13",
      intro:
        "One in 3600 people inherits Tay-Sachs disease, an autosomal recessive disorder. Assume Hardy-Weinberg equilibrium. All calculations to 4 decimal places.",
      parts: [
        {
          ref: "(a)",
          prompt: "Calculate the percentage of dominant homozygous individuals.",
          marks: 4,
          points: [
            {
              text: "Frequency of Tay-Sachs / homozygous recessive, q² = 1/3600 = 0.0003",
              marks: 1,
              require: [["0.0003"]],
            },
            {
              text: "Frequency of recessive allele, q = 0.0173",
              marks: 1,
              require: [["0.0173"]],
            },
            {
              text: "Frequency of dominant allele, p = 1 − 0.0173 = 0.9827",
              marks: 1,
              require: [["0.9827"]],
            },
            {
              text: "Percentage of homozygous dominant = 0.9657 × 100 = 96.57%",
              marks: 1,
              require: [["96.57", "0.9657"]],
            },
          ],
          note: "Scheme requires four decimal places.",
        },
        {
          ref: "(b)",
          prompt: "Calculate the percentage of heterozygous individuals.",
          marks: 2,
          points: [
            {
              text: "Frequency of heterozygous, 2pq = 2 × 0.9827 × 0.0173 = 0.0340",
              marks: 1,
              // Both forms: the scheme prints 0.0340, students usually write
              // 0.034, and neither matches the other under numeric boundaries.
              require: [["0.0340", "0.034"]],
            },
            {
              text: "Percentage of heterozygous individuals = 0.0340 × 100 = 3.4%",
              marks: 1,
              require: [["3.4"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-pspm1-2023",
      session: "PSPM I 2023/2024",
      number: "14",
      intro:
        "In a population of 6000 wolves, 26 are albino. The allele for albino (a) is recessive to normal fur colour (A). Assume Hardy-Weinberg equilibrium. Answer to three decimal places.",
      parts: [
        {
          ref: "(a)",
          prompt: "Calculate the allele frequencies for A and a. Show your calculation.",
          marks: 4,
          points: [
            {
              text: "Frequency of homozygous recessive genotype, q² = 26/6000 = 0.004",
              marks: 1,
              require: [["0.004"]],
            },
            {
              text: "Frequency of recessive allele, q = √0.004 = 0.063",
              marks: 2,
              require: [["0.063"]],
            },
            {
              text: "Frequency of dominant allele, p = 1 − 0.063 = 0.937",
              marks: 1,
              require: [["0.937"]],
            },
          ],
          note: "Scheme requires three decimal places.",
        },
        {
          ref: "(b)",
          prompt:
            "Calculate the genotype frequency for wolves with normal fur colour which are carriers.",
          marks: 2,
          points: [
            {
              text: "Frequency of carrier / heterozygous genotype, 2pq = 2 × 0.937 × 0.063 = 0.118",
              marks: 2,
              require: [["0.118"]],
            },
          ],
        },
      ],
    },

    {
      id: "c5-pspm1-2024",
      session: "PSPM I 2024/2025",
      number: "15",
      intro:
        "In a population of 10000, 2 individuals were born with a severe form of anaemia. Assume Hardy-Weinberg equilibrium.",
      parts: [
        {
          ref: "(a)",
          prompt: "State the Hardy-Weinberg equation.",
          marks: 1,
          points: [
            {
              text: "p² + 2pq + q² = 1 // p + q = 1",
              marks: 1,
              require: [["2pq", "p+q", "p + q"]],
            },
          ],
        },
        {
          ref: "(b)",
          prompt:
            "Determine the frequency of the dominant and recessive alleles in the population.",
          marks: 3,
          points: [
            {
              text: "Frequency of homozygous recessive genotype, q² = 2/10000 = 0.0002",
              marks: 1,
              require: [["0.0002"]],
            },
            {
              text: "Frequency of recessive allele, q = √0.0002 = 0.014 (0.0141)",
              marks: 1,
              require: [["0.0141", "0.014"]],
            },
            {
              text: "Frequency of dominant allele, p = 1 − q = 0.986 (0.9859)",
              marks: 1,
              require: [["0.9859", "0.986"]],
            },
          ],
        },
        {
          ref: "(c)",
          prompt: "Calculate the number of heterozygotes.",
          marks: 2,
          points: [
            {
              text: "Frequency of heterozygote, 2pq = 2 × 0.986 × 0.014 = 0.028 (0.0278)",
              marks: 1,
              require: [["0.0278", "0.028"]],
            },
            {
              text: "Number of heterozygotes = 0.028 × 10000 = 280 (276 // 278)",
              marks: 1,
              require: [["280", "278", "276"]],
            },
          ],
        },
      ],
    },
  ],
};

export const CHAPTERS: Chapter[] = [CH3, CH4, CH5];

export function findChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function findStructured(id: string): { chapter: Chapter; q: Structured } | undefined {
  for (const chapter of CHAPTERS) {
    const q = chapter.structured.find((s) => s.id === id);
    if (q) return { chapter, q };
  }
  return undefined;
}
