"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type Language = "en" | "bm";

const STRINGS = {
  en: {
    brand: "BioMark AI",
    tagline: "KPM Matriculation Biology · PSPM standard",
    navHome: "Home",
    navGrader: "Auto-Grader",
    navQuiz: "Topic Quiz",
    langLabel: "Language",

    // Split so "(Revision)" can be styled on its own; the comma follows the
    // badge rather than the word "Biology".
    heroTitleA: "Matriculation Biology",
    heroRevision: "(Revision)",
    heroTitleB: "marked in seconds.",
    heroBody:
      "Real past-year PSPM questions, marked against the official KPM scheme. Write your answer and see which keyword earned or cost you each mark — instantly, and with no account to create.",
    heroCtaGrade: "Mark my answer",
    heroCtaQuiz: "Practise a topic",

    cardGraderTitle: "Auto-Grader",
    cardGraderBody:
      "Answer a past-year structured question and get a point-by-point breakdown against the official scheme.",
    cardQuizTitle: "Interactive Quiz",
    cardQuizBody:
      "Work through real PSPM multiple-choice questions with the answer and explanation after each one.",
    cardCta: "Start",

    featureGradeTitle: "Marks the way PSPM does",
    featureGradeBody:
      "Scheme alternatives, Any-2 caps, decimal-place rules — the conventions a real examiner applies, applied here.",
    featureKeywordTitle: "Keyword-level feedback",
    featureKeywordBody:
      "Matriculation marks hinge on precise terms. Every missing keyword is named, with the model answer beside it.",
    featureDiagramTitle: "Diagrams, drawn",
    featureDiagramBody:
      "Cell cycles, meiosis, Krebs, replication forks — rendered as real diagrams, not described in prose.",

    syllabusTitle: "Semester 1 & 2 · Structured, Objective, Essay, Drawing",
    syllabusBody:
      "Cell Division · Genetic Inheritance · Population Genetics · Expression of Biological Information · Mutation · Recombinant DNA Technology · Reproduction & Development · and every Semester 2 chapter.",

    graderTitle: "Type it or photograph it.",
    graderSubtitle:
      "Paste your question and answer, or attach photos of your work. You will get grading and an explanation built from your lecturer's notes.",
    pasteBoxTitle: "Your question and answer",
    pasteBoxPlaceholder:
      "Type or paste your question here, then your answer below it.\n\nYou can also attach a photo instead — this box can stay empty.",
    attachPhoto: "Attach a photo or PDF",
    dropOrPaste: "…or drag a photo of your handwritten answer straight in",
    advancedScheme: "Have the official marking scheme? Add it (optional)",
    pastePlaceholderScheme: "Paste the official marking scheme here…",
    gradeButton: "Mark my answer",
    grading: "Marking…",
    clearButton: "Clear",
    needInput: "Paste a question or an answer first.",
    resultTitle: "Result",
    stopButton: "Stop",

    quizTitle: "Topic Quiz",
    quizSubtitle:
      "Pick a chapter and practise. Answers are marked against Matriculation keyword standards as you go.",
    semesterLabel: "Semester",
    sem1: "Semester 1",
    sem2: "Semester 2",
    topicLabel: "Topic",
    subtopicLabel: "Subtopic",
    allSubtopics: "All subtopics",
    modeLabel: "Question mode",
    modeMcq: "Multiple choice",
    modeShort: "Short answer",
    modeMixed: "Mixed",
    countLabel: "Questions",
    generateButton: "Generate quiz",
    generating: "Generating…",
    questionOf: "Question {n} of {total}",
    marksLabel: "marks",
    yourAnswer: "Your answer",
    shortPlaceholder: "Write your answer using the correct Matriculation terms…",
    checkButton: "Check answer",
    checking: "Checking…",
    nextButton: "Next question",
    restartButton: "New quiz",
    scoreLabel: "Score",
    correct: "Correct",
    incorrect: "Incorrect",
    partial: "Partially correct",
    keywordsFound: "Keywords found",
    keywordsMissed: "Keywords missed",
    modelAnswer: "Model answer",
    quizComplete: "Quiz complete",
    finalScore: "Final score",

    scanning: "Reading your photos…",
    ocrHeading: "Text read from your photos",
    ocrCaveat:
      "This is what the scanner extracted. Printed text reads well; handwriting often doesn't. If it looks wrong, retype your answer in the box above and mark again.",
    ocrLow: "— low confidence, check this",
    ocrEmpty: "(nothing readable found in this image)",
    ocrFailed: "Could not read the photos.",

    diagramTitle: "Diagram answer",
    diagramSubtitle:
      "This is a drawing question, so here is the diagram and what earns the marks.",
    diagramLabels: "Labels the examiner expects",
    diagramGuidance: "How the marks are awarded",
    diagramCannotMark:
      "Drawings can't be marked here — nothing in this app can read a hand-drawn diagram. Compare your own drawing against the labels above.",

    optionsAreDiagrams: "The options for this question are diagrams — A, B, C, D from left to right.",

    whyTitle: "Why you lost those marks",
    whySubtitle:
      "From your lecturer's notes, on the exact concepts behind the scheme points you missed.",
    fullMarksNote: "Full marks — every scheme point covered. Nothing missed.",

    modelTitle: "How this question is marked",
    modelSubtitle: "you submitted the question without an answer",
    modelHint:
      "Each box is one scheme point and what it is worth. The tags are the keywords an examiner looks for. Write your own answer covering these, then submit again to be marked.",

    explainTitle: "Explanation from your lecturer's notes",
    explainSubtitle:
      "This question isn't in the marking-scheme bank, so no marks are awarded — here is the relevant material instead.",
    explainNothing:
      "Nothing in the lecture notes matched closely enough. Try naming the topic directly, e.g. \"meiosis prophase I\" or \"Hardy-Weinberg\".",

    pickChapter: "Chapter",
    pickQuestion: "Past-year question",
    schemeBadge: "Official KPM scheme",
    noStructured: "No structured questions in the bank for this chapter yet.",
    markedAgainst: "Marked against",
    pointEarned: "Earned",
    pointMissed: "Missed",
    missingKeywords: "Missing keywords",
    youWrote: "You matched",
    schemeLine: "Scheme point",
    totalScore: "Total",
    cappedNote: "Capped by the scheme's “Any N” rule.",
    errorTitle: "Something went wrong",
    retry: "Try again",
  },

  bm: {
    brand: "BioMark AI",
    tagline: "Biologi Matrikulasi KPM · Standard PSPM",
    navHome: "Utama",
    navGrader: "Penanda Auto",
    navQuiz: "Kuiz Topik",
    langLabel: "Bahasa",

    heroTitleA: "Biologi Matrikulasi",
    heroRevision: "(Ulang Kaji)",
    heroTitleB: "ditanda dalam beberapa saat.",
    heroBody:
      "Soalan sebenar tahun lepas PSPM, ditanda mengikut skema rasmi KPM. Tulis jawapan anda dan lihat kata kunci yang memberi atau menghilangkan setiap markah — serta-merta, tanpa perlu daftar akaun.",
    heroCtaGrade: "Tanda jawapan saya",
    heroCtaQuiz: "Latih satu topik",

    cardGraderTitle: "Penanda Auto",
    cardGraderBody:
      "Jawab soalan berstruktur tahun lepas dan dapatkan pecahan markah mata demi mata mengikut skema rasmi.",
    cardQuizTitle: "Kuiz Interaktif",
    cardQuizBody:
      "Selesaikan soalan aneka pilihan PSPM sebenar dengan jawapan dan penerangan selepas setiap satu.",
    cardCta: "Mula",

    featureGradeTitle: "Menanda seperti PSPM",
    featureGradeBody:
      "Alternatif skema, had Any-2, peraturan titik perpuluhan — konvensyen yang digunakan pemeriksa sebenar, digunakan di sini.",
    featureKeywordTitle: "Maklum balas aras kata kunci",
    featureKeywordBody:
      "Markah Matrikulasi bergantung pada istilah tepat. Setiap kata kunci yang tertinggal dinamakan, dengan jawapan model di sebelahnya.",
    featureDiagramTitle: "Rajah, dilukis",
    featureDiagramBody:
      "Kitar sel, meiosis, Krebs, garpu replikasi — dilukis sebagai rajah sebenar, bukan diterangkan dalam ayat.",

    syllabusTitle: "Semester 1 & 2 · Berstruktur, Objektif, Esei, Lukisan",
    syllabusBody:
      "Pembahagian Sel · Pewarisan Genetik · Genetik Populasi · Ekspresi Maklumat Biologi · Mutasi · Teknologi DNA Rekombinan · Pembiakan & Perkembangan · dan setiap bab Semester 2.",

    graderTitle: "Taip atau ambil foto.",
    graderSubtitle:
      "Tampal soalan dan jawapan anda, atau lampirkan foto kerja anda. Anda akan mendapat pemarkahan dan penerangan daripada nota pensyarah anda.",
    pasteBoxTitle: "Soalan dan jawapan anda",
    pasteBoxPlaceholder:
      "Taip atau tampal soalan anda di sini, kemudian jawapan anda di bawahnya.\n\nAnda juga boleh lampirkan foto sahaja — kotak ini boleh dibiarkan kosong.",
    attachPhoto: "Lampirkan foto atau PDF",
    dropOrPaste: "…atau seret foto jawapan tulisan tangan anda terus ke sini",
    advancedScheme: "Ada skema jawapan rasmi? Tambah di sini (pilihan)",
    pastePlaceholderScheme: "Tampal skema jawapan rasmi di sini…",
    gradeButton: "Tanda jawapan saya",
    grading: "Menanda…",
    clearButton: "Kosongkan",
    needInput: "Tampal soalan atau jawapan dahulu.",
    resultTitle: "Keputusan",
    stopButton: "Berhenti",

    quizTitle: "Kuiz Topik",
    quizSubtitle:
      "Pilih satu bab dan berlatih. Jawapan ditanda mengikut standard kata kunci Matrikulasi.",
    semesterLabel: "Semester",
    sem1: "Semester 1",
    sem2: "Semester 2",
    topicLabel: "Topik",
    subtopicLabel: "Subtopik",
    allSubtopics: "Semua subtopik",
    modeLabel: "Mod soalan",
    modeMcq: "Aneka pilihan",
    modeShort: "Jawapan pendek",
    modeMixed: "Campuran",
    countLabel: "Bilangan soalan",
    generateButton: "Jana kuiz",
    generating: "Menjana…",
    questionOf: "Soalan {n} daripada {total}",
    marksLabel: "markah",
    yourAnswer: "Jawapan anda",
    shortPlaceholder: "Tulis jawapan anda menggunakan istilah Matrikulasi yang betul…",
    checkButton: "Semak jawapan",
    checking: "Menyemak…",
    nextButton: "Soalan seterusnya",
    restartButton: "Kuiz baharu",
    scoreLabel: "Markah",
    correct: "Betul",
    incorrect: "Salah",
    partial: "Betul sebahagian",
    keywordsFound: "Kata kunci dijumpai",
    keywordsMissed: "Kata kunci tertinggal",
    modelAnswer: "Jawapan model",
    quizComplete: "Kuiz selesai",
    finalScore: "Markah akhir",

    scanning: "Membaca foto anda…",
    ocrHeading: "Teks yang dibaca daripada foto anda",
    ocrCaveat:
      "Ini teks yang berjaya diimbas. Teks bercetak dibaca dengan baik; tulisan tangan selalunya tidak. Jika ia kelihatan salah, taip semula jawapan anda di kotak di atas dan tanda sekali lagi.",
    ocrLow: "— keyakinan rendah, sila semak",
    ocrEmpty: "(tiada teks boleh dibaca dalam imej ini)",
    ocrFailed: "Tidak dapat membaca foto.",

    diagramTitle: "Jawapan rajah",
    diagramSubtitle:
      "Ini soalan lukisan, jadi berikut ialah rajah dan perkara yang mendapat markah.",
    diagramLabels: "Label yang dijangka pemeriksa",
    diagramGuidance: "Bagaimana markah diberi",
    diagramCannotMark:
      "Lukisan tidak boleh ditanda di sini — tiada apa dalam aplikasi ini yang boleh membaca rajah tulisan tangan. Bandingkan lukisan anda dengan label di atas.",

    optionsAreDiagrams: "Pilihan bagi soalan ini ialah rajah — A, B, C, D dari kiri ke kanan.",

    whyTitle: "Mengapa markah itu hilang",
    whySubtitle:
      "Daripada nota pensyarah anda, tentang konsep tepat di sebalik mata skema yang tertinggal.",
    fullMarksNote: "Markah penuh — semua mata skema dipenuhi. Tiada yang tertinggal.",

    modelTitle: "Bagaimana soalan ini ditanda",
    modelSubtitle: "anda hantar soalan tanpa jawapan",
    modelHint:
      "Setiap kotak ialah satu mata skema dan nilainya. Tag ialah kata kunci yang dicari pemeriksa. Tulis jawapan anda sendiri yang merangkumi semua ini, kemudian hantar semula untuk ditanda.",

    explainTitle: "Penerangan daripada nota pensyarah anda",
    explainSubtitle:
      "Soalan ini tiada dalam bank skema pemarkahan, jadi tiada markah diberi — berikut ialah bahan berkaitan.",
    explainNothing:
      "Tiada dalam nota kuliah yang cukup sepadan. Cuba namakan topik secara terus, contohnya \"profasa I meiosis\" atau \"Hardy-Weinberg\".",

    pickChapter: "Bab",
    pickQuestion: "Soalan tahun lepas",
    schemeBadge: "Skema rasmi KPM",
    noStructured: "Belum ada soalan berstruktur dalam bank untuk bab ini.",
    markedAgainst: "Ditanda mengikut",
    pointEarned: "Diperoleh",
    pointMissed: "Tertinggal",
    missingKeywords: "Kata kunci tertinggal",
    youWrote: "Anda padankan",
    schemeLine: "Mata skema",
    totalScore: "Jumlah",
    cappedNote: "Dihadkan oleh peraturan “Any N” skema.",
    errorTitle: "Ada yang tidak kena",
    retry: "Cuba lagi",
  },
} as const;

export type StringKey = keyof (typeof STRINGS)["en"];

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "biomark-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  // Restore the saved choice after hydration so server and client markup match.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "bm") setLangState(saved);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l === "bm" ? "ms" : "en";
  };

  const t = (key: StringKey, vars?: Record<string, string | number>) => {
    let out: string = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replaceAll(`{${k}}`, String(v));
      }
    }
    return out;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}
