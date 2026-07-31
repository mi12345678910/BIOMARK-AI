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
