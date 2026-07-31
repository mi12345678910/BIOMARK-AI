/**
 * Diagram answers.
 *
 * Drawing questions cannot be marked here — reading a hand-drawn biology
 * diagram needs a vision model, and this app has none. Rather than pretend, a
 * drawing question is answered: the student is shown the lecturer's own
 * diagram, the labels an examiner requires, and how the marks are split.
 *
 * The images are taken from the C3–C9 lecture slides, so a student is
 * revising from exactly the figure their lecturer taught from.
 *
 * ── ADDING A DIAGRAM ────────────────────────────────────────────────────────
 * Extract the figure from the notes PDF:
 *   pdfimages -png -f <page> -l <page> "C3 - CELL DIVISION KMJ 2026-2027.pdf" out
 * Drop it in public/diagrams/, then add an entry below. `labels` is the part
 * that matters — in a drawing question the marks are in the labels, not the
 * artistry, so list every label the scheme expects.
 * ────────────────────────────────────────────────────────────────────────────
 */

export interface DiagramAnswer {
  id: string;
  chapter: number;
  /** English title. */
  title: string;
  /** Bahasa Melayu title. */
  titleBm: string;
  /** Terms that should surface this diagram, lowercase. */
  keywords: string[];
  /** Path under /public. */
  image: string;
  /** The labels an examiner awards marks for. */
  labels: string[];
  /** How the marks are usually split for this drawing. */
  guidance: string;
  guidanceBm: string;
}

export const DIAGRAMS: DiagramAnswer[] = [
  {
    id: "cell-cycle",
    chapter: 3,
    title: "The cell cycle",
    titleBm: "Kitar sel",
    keywords: [
      "cell cycle", "kitar sel", "interphase", "interfasa", "g1", "g2",
      "s phase", "gap phase", "cytokinesis", "sitokinesis", "g0",
    ],
    image: "/diagrams/cell-cycle.png",
    labels: [
      "Interphase",
      "G1 (first gap phase)",
      "S phase (DNA replication)",
      "G2 (second gap phase)",
      "M phase / Mitosis",
      "Cytokinesis",
      "G0 (cell cycle arrest)",
    ],
    guidance:
      "One mark per correctly named and correctly positioned phase. The order G1 → S → G2 → M must be right; a correct sequence with one label missing still earns the rest.",
    guidanceBm:
      "Satu markah bagi setiap fasa yang dinamakan dan diletakkan dengan betul. Urutan G1 → S → G2 → M mesti tepat; urutan betul dengan satu label tertinggal masih mendapat markah selebihnya.",
  },
  {
    id: "cell-cycle-checkpoints",
    chapter: 3,
    title: "Cell cycle checkpoints (G1, G2 and M)",
    titleBm: "Pusat pemeriksaan kitar sel (G1, G2 dan M)",
    keywords: [
      "checkpoint", "pusat pemeriksaan", "cell cycle control", "kawalan kitar sel",
      "m checkpoint", "g1 checkpoint", "g2 checkpoint", "cancer", "kanser",
    ],
    image: "/diagrams/cell-cycle-checkpoints.png",
    labels: [
      "G1 checkpoint (restriction point)",
      "G2 checkpoint",
      "M checkpoint (spindle checkpoint)",
      "Prometaphase / Metaphase / Anaphase positions",
    ],
    guidance:
      "Mark the three checkpoints in the correct positions on the cycle. State what each verifies: G1 — cell size and DNA damage; G2 — DNA fully replicated and undamaged; M — all chromosomes attached to the spindle.",
    guidanceBm:
      "Tandakan tiga pusat pemeriksaan pada kedudukan betul. Nyatakan apa yang disemak: G1 — saiz sel dan kerosakan DNA; G2 — DNA lengkap direplikasi; M — semua kromosom melekat pada gentian gelendong.",
  },
  {
    id: "meiosis-1-stages",
    chapter: 3,
    title: "Stages of Meiosis I",
    titleBm: "Peringkat Meiosis I",
    keywords: [
      "meiosis i", "meiosis 1", "prophase i", "metaphase i", "anaphase i",
      "telophase i", "profasa i", "metafasa i", "anafasa i", "telofasa i",
      "homologous", "homolog", "bivalent", "first meiotic division",
    ],
    image: "/diagrams/meiosis-1-stages.png",
    labels: [
      "Prophase I — homologous chromosomes pair, chiasmata form",
      "Metaphase I — bivalents align at the metaphase plate",
      "Anaphase I — homologous chromosomes separate to opposite poles",
      "Telophase I & cytokinesis — two haploid cells form",
      "Nucleus / nuclear envelope",
      "Spindle fibres",
    ],
    guidance:
      "One mark per stage correctly drawn and named. The critical distinction from mitosis: in Anaphase I whole homologous chromosomes separate while sister chromatids stay attached at the centromere. Drawing chromatids separating here loses the mark.",
    guidanceBm:
      "Satu markah bagi setiap peringkat yang dilukis dan dinamakan dengan betul. Perbezaan penting daripada mitosis: dalam Anafasa I kromosom homolog berasingan manakala kromatid adik kekal bercantum pada sentromer.",
  },
  {
    id: "meiosis-2-stages",
    chapter: 3,
    title: "Stages of Meiosis II",
    titleBm: "Peringkat Meiosis II",
    keywords: [
      "meiosis ii", "meiosis 2", "prophase ii", "metaphase ii", "anaphase ii",
      "telophase ii", "profasa ii", "second meiotic division", "haploid",
      "four daughter cells", "empat sel anak", "gamete", "gamet",
    ],
    image: "/diagrams/meiosis-2-stages.png",
    labels: [
      "Prophase II — nuclear envelope disintegrates, spindle forms",
      "Metaphase II — chromosomes align singly at the metaphase plate",
      "Anaphase II — sister chromatids separate",
      "Telophase II & cytokinesis",
      "Four genetically non-identical haploid cells",
    ],
    guidance:
      "One mark per stage. The end product must be drawn as FOUR haploid cells that are genetically different from one another — drawing four identical cells loses that mark, because crossing over in Prophase I made the chromatids non-identical.",
    guidanceBm:
      "Satu markah bagi setiap peringkat. Hasil akhir mesti dilukis sebagai EMPAT sel haploid yang berbeza secara genetik antara satu sama lain.",
  },
  {
    id: "prophase-1-substages",
    chapter: 3,
    title: "Sub-stages of Prophase I",
    titleBm: "Sub-peringkat Profasa I",
    keywords: [
      "leptotene", "zygotene", "pachytene", "diplotene", "diakinesis",
      "leptoten", "zigoten", "pakiten", "diploten", "synaptonemal",
      "sinaptonemal", "chiasma", "chiasmata", "kiasma", "crossing over",
      "pindah silang", "synapsis", "sinapsis",
      // These must be longer than Meiosis I's "prophase i" / "profasa i",
      // or asking for the SUB-stages returns the whole of Meiosis I.
      "sub-stages of prophase", "substages of prophase", "prophase i substage",
      "sub-peringkat profasa", "subperingkat profasa",
    ],
    image: "/diagrams/prophase-1-substages.png",
    labels: [
      "Leptotene — duplicated chromosomes begin to condense",
      "Zygotene — synapsis begins, synaptonemal complex forms",
      "Pachytene — synapsis complete, crossing over occurs",
      "Diplotene — synaptonemal complex disappears, chiasmata visible",
      "Diakinesis — nuclear envelope disintegrates",
      "Bivalent / tetrad",
      "Nuclear envelope",
    ],
    guidance:
      "One mark per sub-stage, named in the correct order. The two that carry the most marks are Pachytene (crossing over) and Diplotene (chiasmata become visible) — name the event, not just the stage.",
    guidanceBm:
      "Satu markah bagi setiap sub-peringkat, dinamakan mengikut urutan betul. Dua yang paling banyak markah ialah Pakiten (pindah silang) dan Diploten (kiasma kelihatan) — namakan peristiwanya, bukan sekadar peringkat.",
  },
  {
    id: "meiosis-overview",
    chapter: 3,
    title: "Meiosis I and II — full sequence",
    titleBm: "Meiosis I dan II — urutan penuh",
    // Deliberately generic-only. "stages of meiosis" was here and is a
    // substring of "stages of meiosis I", so this entry outscored the
    // specific Meiosis I diagram. The overview should win only when the
    // student names no division.
    keywords: [
      "meiosis", "meiotic division", "pembahagian meiosis",
      "whole of meiosis", "meiosis overview",
    ],
    image: "/diagrams/meiosis-overview.png",
    labels: [
      "Prophase I, Metaphase I, Anaphase I, Telophase I (+ cytokinesis)",
      "Prophase II, Metaphase II, Anaphase II, Telophase II (+ cytokinesis)",
      "Homologous chromosomes (maternal and paternal, drawn differently)",
      "Four haploid daughter cells",
    ],
    guidance:
      "Draw both divisions in sequence. Use two colours or shading for maternal and paternal chromosomes so that the reduction from diploid to haploid, and the effect of crossing over, are visible. Examiners award marks for the chromosome behaviour at each stage, not the neatness of the cell outline.",
    guidanceBm:
      "Lukis kedua-dua pembahagian mengikut urutan. Gunakan dua warna untuk kromosom ibu dan bapa supaya pengurangan diploid kepada haploid kelihatan jelas.",
  },
  {
    id: "plant-cytokinesis",
    chapter: 3,
    title: "Cytokinesis in a plant cell (cell plate formation)",
    titleBm: "Sitokinesis dalam sel tumbuhan (pembentukan plat sel)",
    keywords: [
      "cytokinesis", "sitokinesis", "cell plate", "plat sel", "plant cell division",
      "cleavage furrow", "alur pembelahan", "vesicle", "vesikel", "cell wall",
      "dinding sel",
    ],
    image: "/diagrams/plant-cytokinesis.png",
    labels: [
      "Vesicles gathering at the cell midplane",
      "Cell plate forming",
      "New cell wall (from vesicle contents)",
      "New plasma membranes (from vesicle membranes)",
      "Existing cell wall and plasma membrane",
    ],
    guidance:
      "Plant cells form a cell plate from the inside out; they do not form a cleavage furrow. Marks are for the vesicles fusing at the midplane, the cell plate, and the new wall and membranes it becomes.",
    guidanceBm:
      "Sel tumbuhan membentuk plat sel dari dalam ke luar; ia tidak membentuk alur pembelahan. Markah diberi untuk vesikel bergabung di satah tengah, plat sel, serta dinding dan membran baharu.",
  },

  /* ══════════════════════════════════════════════════════════════════════
     CHAPTER 6 — EXPRESSION OF BIOLOGICAL INFORMATION
     ══════════════════════════════════════════════════════════════════════ */

  {
    id: "dna-replication-fork",
    chapter: 6,
    title: "The replication fork and its enzymes",
    titleBm: "Garpu replikasi dan enzimnya",
    keywords: [
      "replication fork", "garpu replikasi", "dna replication", "replikasi dna",
      "helicase", "helikase", "topoisomerase", "topoisomerase",
      "single-strand binding", "dna polymerase", "polimerase dna",
      "leading strand", "lagging strand", "rangkai mendahului",
      "rangkai ketinggalan", "primase", "semiconservative", "semikonservatif",
    ],
    image: "/diagrams/dna-replication-fork.png",
    labels: [
      "Helicase — unwinds the double helix by breaking hydrogen bonds",
      "Single-strand binding protein — stops the strands re-pairing",
      "Topoisomerase — relieves supercoiling ahead of the fork",
      "Primase — synthesises the RNA primer",
      "RNA primer",
      "DNA polymerase III — extends the new strand 5' → 3'",
      "DNA polymerase I — replaces the RNA primer with DNA",
      "DNA ligase — joins Okazaki fragments",
      "Sliding clamp",
      "Leading strand (continuous) and lagging strand (discontinuous)",
      "Okazaki fragments",
      "5' and 3' ends marked on both strands",
    ],
    guidance:
      "Marks are for naming each enzyme AND stating its job — 'helicase' alone usually scores half. The 5' and 3' labels matter: DNA polymerase only adds to a free 3' end, which is the whole reason the lagging strand is discontinuous.",
    guidanceBm:
      "Markah diberi untuk menamakan setiap enzim DAN menyatakan fungsinya — 'helikase' sahaja biasanya mendapat separuh. Label 5' dan 3' penting: polimerase DNA hanya menambah pada hujung 3' bebas.",
  },
  {
    id: "dna-replication-lagging",
    chapter: 6,
    title: "Lagging strand synthesis and Okazaki fragments",
    titleBm: "Sintesis rangkai ketinggalan dan serpihan Okazaki",
    // "okazaki" alone (7 chars) loses to the fork diagram's "lagging strand"
    // (14), so the fuller forms are listed to outweigh it.
    keywords: [
      "okazaki", "okazaki fragment", "okazaki fragments", "serpihan okazaki",
      "lagging strand synthesis", "discontinuous synthesis", "tak selanjar",
      "rna primer", "primer rna", "dna ligase", "ligase dna",
    ],
    image: "/diagrams/dna-replication-lagging.png",
    labels: [
      "Template strand with 5' and 3' ends",
      "RNA primer laid down by primase for each fragment",
      "Okazaki fragment 1, 2, 3 …",
      "DNA polymerase III extending each fragment 5' → 3'",
      "DNA polymerase I replacing primer with DNA",
      "DNA ligase sealing the sugar-phosphate backbone",
    ],
    guidance:
      "Draw the fragments running AWAY from the fork, each with its own primer. The examiner is checking you understand why: polymerase can only work 5' → 3', so on the lagging strand it must restart repeatedly as the fork opens.",
    guidanceBm:
      "Lukis serpihan menjauhi garpu, setiap satu dengan primernya sendiri. Pemeriksa menyemak sama ada anda faham sebabnya: polimerase hanya boleh bekerja 5' → 3'.",
  },
  {
    id: "transcription",
    chapter: 6,
    title: "Transcription — RNA polymerase at work",
    titleBm: "Transkripsi — RNA polimerase",
    keywords: [
      "transcription", "transkripsi", "rna polymerase", "rna polimerase",
      "template strand", "rangkai templat", "nontemplate", "coding strand",
      "promoter", "promoter", "mrna synthesis", "sintesis mrna",
    ],
    image: "/diagrams/transcription.png",
    labels: [
      "RNA polymerase",
      "Template strand of DNA (read 3' → 5')",
      "Non-template / coding strand",
      "RNA nucleotides pairing with the template",
      "Newly made RNA, growing 5' → 3'",
      "Direction of transcription",
    ],
    guidance:
      "The commonest lost mark is labelling the wrong strand as the template. RNA is built 5' → 3', so the template is read 3' → 5'. Show U pairing with A — writing T in the RNA loses the mark.",
    guidanceBm:
      "Markah paling kerap hilang ialah melabel rangkai yang salah sebagai templat. RNA dibina 5' → 3', jadi templat dibaca 3' → 5'. Tunjukkan U berpasangan dengan A.",
  },
  {
    id: "mrna-processing",
    chapter: 6,
    title: "mRNA processing — cap, tail and UTRs",
    titleBm: "Pemprosesan mRNA — kap, ekor dan UTR",
    keywords: [
      "mrna processing", "pemprosesan mrna", "5' cap", "poly-a", "poly a tail",
      "ekor poli-a", "utr", "splicing", "penyambungan", "intron", "exon",
      "ekson", "pre-mrna", "polyadenylation",
    ],
    image: "/diagrams/mrna-processing.png",
    labels: [
      "5' cap — modified guanine nucleotide",
      "5' UTR",
      "Start codon",
      "Protein-coding region",
      "Stop codon",
      "3' UTR",
      "Polyadenylation signal (AAUAAA)",
      "Poly-A tail — 50–250 adenine nucleotides",
    ],
    guidance:
      "Both modifications protect the mRNA from enzymatic degradation and help it leave the nucleus — state the function, not just the name. Note the cap goes on the 5' end and the tail on the 3' end; reversing them loses both marks.",
    guidanceBm:
      "Kedua-dua pengubahsuaian melindungi mRNA daripada degradasi enzim dan membantunya keluar dari nukleus — nyatakan fungsi, bukan sekadar nama. Kap pada hujung 5', ekor pada hujung 3'.",
  },
  {
    id: "translation-elongation",
    chapter: 6,
    title: "Translation — the elongation cycle",
    titleBm: "Translasi — kitaran pemanjangan",
    keywords: [
      "translation", "translasi", "elongation", "pemanjangan", "ribosome",
      "ribosom", "a site", "p site", "e site", "tapak a", "tapak p", "tapak e",
      "peptide bond", "ikatan peptida", "translocation", "translokasi",
      "polypeptide", "polipeptida", "anticodon", "antikodon",
    ],
    image: "/diagrams/translation-elongation.png",
    labels: [
      "Ribosome with E, P and A sites",
      "mRNA with 5' and 3' ends",
      "Codon on mRNA and complementary anticodon on tRNA",
      "Aminoacyl-tRNA entering the A site",
      "Peptide bond formation between P-site and A-site amino acids",
      "Translocation — ribosome moves one codon toward the 3' end",
      "Uncharged tRNA leaving via the E site",
      "GTP used at binding and translocation",
    ],
    guidance:
      "Marks are for the cycle in the right order: codon recognition at A, peptide bond formation, translocation, exit at E. Name the sites — writing 'the ribosome moves along' without E/P/A rarely scores.",
    guidanceBm:
      "Markah diberi untuk kitaran dalam urutan betul: pengecaman kodon di A, pembentukan ikatan peptida, translokasi, keluar di E. Namakan tapak — 'ribosom bergerak' sahaja jarang mendapat markah.",
  },
  {
    id: "trna-charging",
    chapter: 6,
    title: "Charging a tRNA with its amino acid",
    titleBm: "Pengecasan tRNA dengan asid amino",
    keywords: [
      "aminoacyl", "trna synthetase", "sintetase trna", "charging trna",
      "amino acid activation", "pengaktifan asid amino", "trna", "anticodon",
    ],
    image: "/diagrams/trna-charging.png",
    labels: [
      "Amino acid and its specific tRNA entering the synthetase active site",
      "Aminoacyl-tRNA synthetase (one per amino acid)",
      "ATP → AMP + 2Pi supplying the energy",
      "Covalent bond formed between amino acid and tRNA",
      "Anticodon, complementary to the mRNA codon",
      "Charged (aminoacyl) tRNA released",
    ],
    guidance:
      "The specificity mark is the point of this diagram: each synthetase binds only one amino acid and its matching tRNA. Show ATP being used — the bond is energy-requiring.",
    guidanceBm:
      "Markah kekhususan ialah inti rajah ini: setiap sintetase mengikat hanya satu asid amino dan tRNA sepadan. Tunjukkan ATP digunakan.",
  },
  {
    id: "genetic-code",
    chapter: 6,
    title: "The genetic code (codon table)",
    titleBm: "Kod genetik (jadual kodon)",
    keywords: [
      "genetic code", "kod genetik", "codon table", "jadual kodon", "codon",
      "kodon", "start codon", "stop codon", "kodon mula", "kodon henti",
      "aug", "uaa", "uag", "uga", "degenerate", "degenerasi",
    ],
    image: "/diagrams/genetic-code.png",
    labels: [
      "First mRNA base (5' end of codon) — rows",
      "Second mRNA base — columns",
      "Third mRNA base (3' end of codon)",
      "AUG — start codon, also methionine",
      "UAA, UAG, UGA — stop codons",
    ],
    guidance:
      "Read the codon 5' → 3': first base down the left, second across the top, third down the right. Note the code is degenerate — several codons per amino acid — but never ambiguous.",
    guidanceBm:
      "Baca kodon 5' → 3': bes pertama di kiri, kedua di atas, ketiga di kanan. Kod bersifat degenerasi — beberapa kodon bagi satu asid amino — tetapi tidak pernah taksa.",
  },

  /* ══════════════════════════════════════════════════════════════════════
     CHAPTER 9 — REPRODUCTION AND DEVELOPMENT
     ══════════════════════════════════════════════════════════════════════ */

  {
    id: "flower-structure",
    chapter: 9,
    title: "Structure of a flower",
    titleBm: "Struktur bunga",
    keywords: [
      "flower structure", "struktur bunga", "flower", "bunga", "stamen",
      "stamen", "carpel", "karpel", "pistil", "anther", "anter", "filament",
      "filamen", "stigma", "stigma", "style", "stail", "ovary", "ovari",
      "ovule", "ovul", "petal", "kelopak", "sepal", "sepal", "receptacle",
      "reseptakel", "reproductive organ", "organ pembiakan",
    ],
    image: "/diagrams/flower-structure.png",
    labels: [
      "Stamen (male) = Anther + Filament",
      "Anther — produces pollen grains",
      "Filament — supports the anther",
      "Carpel / pistil (female) = Stigma + Style + Ovary",
      "Stigma — receives pollen",
      "Style — pollen tube grows down through it",
      "Ovary — contains the ovules",
      "Ovule — becomes the seed after fertilisation",
      "Petal — attracts pollinators",
      "Sepal — protects the flower bud",
      "Receptacle — the base bearing the floral parts",
    ],
    guidance:
      "Label lines must touch the structure they name. Group the parts correctly: stamen is anther + filament, carpel is stigma + style + ovary — naming a part in the wrong whorl loses the mark even if the word is right.",
    guidanceBm:
      "Garis label mesti menyentuh struktur yang dinamakan. Kumpulkan bahagian dengan betul: stamen ialah anter + filamen, karpel ialah stigma + stail + ovari.",
  },
  {
    id: "plant-life-cycle",
    chapter: 9,
    title: "Alternation of generations, embryo sac and pollen grain",
    titleBm: "Pergiliran generasi, sakus embrio dan butir debunga",
    keywords: [
      "alternation of generations", "pergiliran generasi", "embryo sac",
      "sakus embrio", "pollen grain", "butir debunga", "gametophyte",
      "gametofit", "sporophyte", "sporofit", "megaspore", "megaspora",
      "microspore", "mikrospora", "antipodal", "synergid", "sinergid",
      "polar nuclei", "nukleus polar", "double fertilisation",
      "persenyawaan berganda", "endosperm", "endosperma", "micropyle", "mikropil",
    ],
    image: "/diagrams/plant-life-cycle.png",
    labels: [
      "Sporophyte (2n) and gametophyte (n) generations",
      "Anther → microspore mother cells → microspore (pollen grain)",
      "Ovule → megaspore mother cell → one functional megaspore",
      "Embryo sac: 7-celled, 8-nucleate",
      "Egg cell, 2 synergid cells, 3 antipodal cells, 2 polar nuclei",
      "Integument, micropyle, funiculus (stalk of ovule)",
      "Pollen grain with tube nucleus and 2 sperm nuclei",
      "Double fertilisation: sperm 1 + egg → zygote (2n); sperm 2 + 2 polar nuclei → endosperm (3n)",
    ],
    guidance:
      "The two marks students most often lose: the embryo sac is 7 cells but 8 nuclei (the central cell holds two polar nuclei), and double fertilisation gives a 2n zygote AND a 3n endosperm. State both products.",
    guidanceBm:
      "Dua markah yang paling kerap hilang: sakus embrio ialah 7 sel tetapi 8 nukleus, dan persenyawaan berganda menghasilkan zigot 2n DAN endosperma 3n. Nyatakan kedua-dua hasil.",
  },
];

/** Words that mean the student is being asked to draw, not to explain. */
const DRAWING_VERBS =
  /\b(draw|sketch|label(?:led|ling)?|illustrate|annotate|diagram of|lukis(?:kan)?|labelkan|lakar(?:kan)?|rajah)\b/i;

/**
 * Is this a drawing question?
 *
 * Deliberately narrow: "the figure shows…" is a question WITH a diagram, not a
 * request to draw one, and must still be marked normally.
 */
export function isDrawingQuestion(text: string): boolean {
  if (/\b(figure|table)\s*\d*\s*(shows|below)/i.test(text)) {
    // A supplied figure is only a drawing question if it also asks them to
    // draw or label something themselves.
    return /\b(draw|sketch|label|lukis|labelkan|lakar)\b/i.test(text);
  }
  return DRAWING_VERBS.test(text);
}

/** The diagram answer that best fits what was asked. */
export function findDiagram(text: string): DiagramAnswer | null {
  const hay = text.toLowerCase();
  let best: { diagram: DiagramAnswer; score: number } | null = null;

  for (const diagram of DIAGRAMS) {
    let score = 0;
    for (const kw of diagram.keywords) {
      if (hay.includes(kw)) {
        // Longer keywords are far more specific: "prophase i" should beat
        // a bare "meiosis" that appears in half the entries.
        score += kw.length;
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { diagram, score };
  }

  return best?.diagram ?? null;
}
