/**
 * Bahasa Melayu text for every MCQ in the bank, keyed by question id.
 *
 * Convention (set by the user): Bahasa Melayu with the important scientific
 * term in brackets — "penggantian bes (base substitution)". The bracketed
 * English stays because PSPM marks the English keyword. Terms follow the BM
 * wording printed on the KMJ papers themselves wherever they give one: enzim
 * pembatasan, mRNA jenis liar, mutasi senyap, tumbuhan steril / subur,
 * koloni bakteria, gen insulin manusia.
 *
 * Only wording lives here. Answers, figures and ids stay in the English bank,
 * so a translation can never change which option is correct. Options keep
 * their "A." … "D." prefixes in the same order — enforced by a test.
 */

import type { Mcq } from "./bank.ts";

export interface McqText {
  stem: string;
  options: string[];
  explain?: string;
}

const t = (stem: string, options: string[], explain?: string): McqText =>
  explain ? { stem, options, explain } : { stem, options };

const LETTERS = ["A", "B", "C", "D"];

export const MCQ_BM: Record<string, McqText> = {
  /* ── Bab 3: Pembahagian Sel ─────────────────────────────────────────── */
  c3q1: t(
    "Replikasi DNA (DNA replication) berlaku…",
    ["A. di antara fasa-fasa gap dalam interfasa (interphase).", "B. sejurus sebelum profasa (prophase) mitosis.", "C. semasa profasa mitosis.", "D. semasa profasa meiosis."],
    "DNA direplikasi dalam fasa S, yang terletak di antara G1 dan G2 — dua fasa gap dalam interfasa.",
  ),
  c3q2: t(
    "Apakah yang berlaku semasa replikasi dalam fasa S kitaran sel (cell cycle)?",
    ["A. Bilangan kromatid (chromatid) berganda.", "B. Bilangan kromosom berganda.", "C. Bilangan kromosom homolog (homologous chromosomes) berganda.", "D. Jumlah tenaga dalam mitokondria berganda."],
    "Setiap kromosom menjadi dua kromatid beradik (sister chromatids). Bilangan kromosom tidak berubah — hanya bilangan kromatid yang berganda.",
  ),
  c3q3: t(
    "Sebuah sel mempunyai separuh daripada jumlah DNA berbanding sebahagian sel lain dalam tisu yang aktif bermitosis. Sel itu berkemungkinan besar berada dalam…",
    ["A. G1", "B. G2", "C. Metafasa (metaphase)", "D. Anafasa (anaphase)"],
    "G1 berlaku sebelum fasa S, jadi DNA belum direplikasi — separuh daripada jumlah dalam sel G2, metafasa atau anafasa.",
  ),
  c3q4: t(
    "Mitosis melibatkan peringkat-peringkat berikut.\n\n1 Kromosom tersusun di plat khatulistiwa (equatorial plate)\n2 Sampul nukleus terbentuk dan pembahagian sitoplasma bermula\n3 Kromosom menjadi kelihatan dan gelendong (spindle) terbentuk\n4 Kromatid beradik bergerak ke kutub bertentangan sel\n\nApakah nama yang betul bagi peringkat-peringkat ini?",
    ["A. Profasa / Anafasa / Metafasa / Telofasa", "B. Profasa / Telofasa / Metafasa / Anafasa", "C. Metafasa / Anafasa / Profasa / Telofasa", "D. Metafasa / Telofasa / Profasa / Anafasa"],
    "1 = metafasa (plat khatulistiwa), 2 = telofasa (sampul nukleus terbentuk semula), 3 = profasa (kromosom memendek dan menebal, gelendong terbentuk), 4 = anafasa (kromatid berpisah).",
  ),
  c3q5: t(
    "Rajah di bawah menunjukkan ukuran yang diambil sepanjang satu kitaran sel mitosis. Peringkat mitosis manakah yang berlaku semasa X, dan ukuran manakah yang diwakili oleh lengkung 1 dan 2?",
    ["A. Metafasa — lengkung 1 / lengkung 2", "B. Metafasa — lengkung 2 / lengkung 1", "C. Anafasa — lengkung 1 / lengkung 2", "D. Anafasa — lengkung 2 / lengkung 1"],
    "Pada X, jarak sentromer ke kutub berkurang manakala jarak pemisahan kromatid beradik bertambah — ciri anafasa.",
  ),
  c3q6: t(
    "Rajah menunjukkan kromosom sebuah sel sebelum peringkat metafasa mitosis. Pilihan manakah yang menunjukkan kromosom setiap sel pada telofasa (telophase)?",
    LETTERS,
    "Pada telofasa setiap sel anak menerima kromosom berkromatid tunggal, dengan bilangan kromosom yang sama seperti sel induk.",
  ),
  c3q7: t(
    "Rajah menunjukkan anafasa mitosis. Rajah manakah yang menunjukkan anafasa I semasa meiosis dalam organisma yang sama?",
    LETTERS,
    "Dalam anafasa I, kromosom homolog berpisah manakala kromatid beradik masih bercantum — jadi setiap kutub menerima separuh bilangan kromosom, masih sebagai kromosom dua kromatid.",
  ),
  c3q8: t(
    "Rajah menunjukkan sebuah sel pada anafasa I meiosis. Rajah manakah yang menunjukkan gamet normal yang boleh dihasilkan daripada sel ini?",
    LETTERS,
    "Gamet adalah haploid dengan kromosom berkromatid tunggal, selepas meiosis II memisahkan kromatid beradik.",
  ),
  c3q9: t(
    "Bagaimanakah pembahagian meiosis kedua berbeza daripada mitosis? Dalam pembahagian meiosis kedua…",
    ["A. Kiasma (chiasmata) terbentuk di antara kromatid bivalen.", "B. Setiap kromosom bereplikasi membentuk dua kromatid semasa metafasa.", "C. Pertukaran bahan genetik berlaku di antara kromatid.", "D. Kromatid yang berpisah daripada satu pasangan berbeza secara genetik."],
    "Pindah silang (crossing over) dalam profasa I menyebabkan kromatid beradik yang berpisah dalam meiosis II tidak lagi seiras secara genetik — berbeza daripada mitosis.",
  ),
  c3q10: t(
    "Antara pernyataan berikut tentang meiosis, yang manakah betul?\n\nI. Meiosis mengurangkan separuh jumlah DNA.\nII. Meiosis membolehkan pembiakan seks.\nIII. Meiosis menghasilkan kepelbagaian genetik pada anak.\nIV. Pembahagian meiosis pertama pada eukariot serupa dengan mitosis.\nV. Meiosis pada eukariot tinggi berlaku dalam sel somatik dan gamet.",
    ["A. I, II dan IV", "B. I, II dan III", "C. II, III dan V", "D. II, III dan IV"],
    "IV salah — meiosis II yang menyerupai mitosis, bukan meiosis I. V salah — meiosis hanya berlaku dalam sel germa (germ cells), bukan sel somatik.",
  ),

  /* ── Bab 4: Pewarisan Genetik ───────────────────────────────────────── */
  c4q1: t(
    "Kacukan uji (testcross) ialah kacukan…",
    ["A. antara anak dengan induknya.", "B. antara dua bentuk yang tidak diketahui untuk menentukan genotip masing-masing.", "C. antara hibrid F1 dengan individu homozigot resesif (homozygous recessive).", "D. antara dua bentuk baka tulen untuk menentukan bentuk gen yang dominan."],
    "Kacukan uji memasangkan individu yang genotipnya tidak diketahui dengan individu homozigot resesif, jadi fenotip anak terus mendedahkan genotip tersebut.",
  ),
  c4q2: t(
    "Pernyataan manakah yang benar bagi sepasang kromosom homolog (homologous chromosomes)?\n\nI. Setiap satu mengandungi bilangan gen yang sama.\nII. Setiap satu mengandungi jujukan gen yang sama.\nIII. Setiap satu mengandungi jenis alel yang sama.\nIV. Sentromer terletak pada kedudukan yang sama pada setiap satu.",
    ["A. I, II dan III", "B. I, II dan IV", "C. I, III dan IV", "D. I, II, III dan IV"],
    "III salah — kromosom homolog membawa gen yang sama tetapi mungkin membawa alel (alleles) yang berbeza bagi gen tersebut.",
  ),
  c4q3: t(
    "Pengawanan dua tumbuhan menghasilkan nisbah fenotip 1:1 dalam progeni F1. Apakah genotip induk bagi kacukan ini?",
    ["A. Aa x Aa", "B. Aa x aa", "C. AA x aa", "D. AA x AA"],
    "Aa × aa ialah kacukan uji (testcross), menghasilkan 1 Aa : 1 aa — nisbah fenotip 1:1.",
  ),
  c4q4: t(
    "Sebatang tumbuhan berbunga ungu dan tinggi dikacukkan dengan tumbuhan homozigot berbunga putih dan rendah (dwarf). Progeni F1: ungu/tinggi 53, putih/tinggi 49, ungu/rendah 53, putih/rendah 47. Menggunakan P untuk ungu dan T untuk tinggi, tentukan genotip induk yang ungu dan tinggi.",
    ["A. PPTT", "B. PPTt", "C. PpTt", "D. PpTT"],
    "Nisbah lebih kurang 1:1:1:1 daripada kacukan dengan resesif berganda ialah ciri kacukan uji dihibrid (dihybrid testcross) — induk yang tidak diketahui ialah PpTt.",
  ),
  c4q5: t(
    "Jika gen A dan gen B terletak pada kromosom yang berlainan, kacukan manakah yang akan menghasilkan progeni bergenotip AaBb?\n\nI. Aabb × aaBb\nII. AaBB × Aabb\nIII. aaBB × AABb\nIV. aabb × AaBb",
    ["A. I, II dan III", "B. I, II dan IV", "C. I, III dan IV", "D. I, II, III dan IV"],
    "Keempat-empat kacukan boleh menghasilkan anak AaBb.",
  ),
  c4q6: t(
    "Pada terung, batang perang dominan terhadap batang hijau dan buah ungu dominan terhadap buah putih. Dua tumbuhan heterozigot (heterozygous) bagi kedua-dua ciri dikacukkan. Apakah nisbah jangkaan progeni yang berbatang perang dan berbuah putih?",
    ["A. 1/16", "B. 3/16", "C. 4/16", "D. 6/16"],
    "Kacukan dihibrid (dihybrid cross) memberi 9:3:3:1. Batang perang (dominan) dengan buah putih (resesif) ialah kelas 3/16.",
  ),
  c4q7: t(
    "Pada Drosophila, badan hitam (ebony) adalah resesif (e) dan kelabu dominan (e⁺); sayap vestigial adalah resesif (vg) dan normal dominan (vg⁺). Kacukan dua heterozigot berbadan kelabu dan bersayap normal menghasilkan 128 anak. Berapakah bilangan anak F1 yang berbadan kelabu dengan sayap vestigial?",
    ["A. 8", "B. 24", "C. 32", "D. 72"],
    "Kelabu (dominan) dengan vestigial (resesif) ialah 3/16. 3/16 × 128 = 24.",
  ),
  c4q8: t(
    "Pada lembu, warna kot roan terdapat pada anak heterozigot (Rr) hasil kacukan homozigot merah (RR) dan putih (rr). Apabila dua lembu roan dikacukkan, progeninya ialah 1 merah : 2 roan : 1 putih. Kacukan manakah yang boleh menghasilkan peratusan lembu roan yang paling tinggi?",
    ["A. merah x putih", "B. roan x roan", "C. putih x roan", "D. merah x roan"],
    "RR × rr menghasilkan 100% Rr — semuanya roan. Roan × roan hanya menghasilkan 50%.",
  ),
  c4q9: t(
    "Pada lobak, panjang = LL, sfera = ll, bujur = Ll; merah = RR, putih = rr, ungu = Rr. Apakah nisbah fenotip hasil kacukan lobak putih bujur dengan lobak merah bujur?",
    ["A. ungu panjang 1, ungu bujur 1, ungu sfera 2", "B. merah panjang 1, merah bujur 2, merah sfera 1", "C. merah panjang 1, ungu bujur 2, merah sfera 1", "D. ungu panjang 1, ungu bujur 2, ungu sfera 1"],
    "rr × RR menghasilkan semua Rr (ungu). Ll × Ll menghasilkan 1 panjang : 2 bujur : 1 sfera. Kedua-dua gen menunjukkan dominan tidak lengkap (incomplete dominance).",
  ),
  c4q10: t(
    "Poligen (polygenes) ialah…",
    ["A. Kedua-dua alel yang memberi pengaruh separa dalam keadaan heterozigot.", "B. Kedua-dua alel dalam heterozigot adalah dominan dan diekspresikan sepenuhnya dalam fenotip.", "C. Lebih daripada dua bentuk alternatif bagi satu gen yang menduduki lokus yang sama.", "D. Lebih daripada dua gen yang menduduki lokus berbeza tetapi mengawal ciri yang sama."],
    "Pewarisan poligen bermaksud beberapa gen pada lokus berbeza menyumbang secara tambahan kepada satu ciri selanjar. Pilihan C menerangkan alel berbilang (multiple alleles).",
  ),
  c4q11: t(
    "Pada kucing peliharaan, gen bagi bulu kuning dan hitam ialah pasangan alel kodominan (codominant) yang terangkai seks (sex-linked); heterozigotnya bercorak tempurung (tortoiseshell). Kucing jantan hitam dikawankan dengan betina tortoiseshell. Apakah nisbah fenotip dan jantina jangkaan bagi anak-anaknya?",
    ["A. Jantan 1 hitam : 1 tortoiseshell / Betina 1 hitam : 1 tortoiseshell", "B. Jantan 1 hitam : 1 kuning / Betina 1 hitam : 1 tortoiseshell", "C. Jantan 1 hitam : 1 kuning / Betina 1 hitam : 1 kuning", "D. Jantan 1 hitam / Betina 1 hitam : 1 kuning : 1 tortoiseshell"],
    "Jantan mewarisi satu X daripada ibu, jadi sama ada hitam atau kuning. Betina menerima X hitam daripada bapa serta salah satu X ibu, jadi hitam atau tortoiseshell.",
  ),
  c4q12: t(
    "Pada Drosophila, jantan ialah jantina heterogametik. Alel mata putih adalah resesif dan terangkai seks (sex-linked). Seekor betina heterozigot pada lokus ini dikawankan dengan jantan normal. Mata putih akan terdapat pada…",
    ["A. semua anak.", "B. semua anak jantan tetapi tiada anak betina.", "C. tiada anak betina dan 50% anak jantan.", "D. tiada anak jantan dan 50% anak betina."],
    "Anak jantan menerima X tunggal daripada ibu pembawa (carrier), jadi separuh bermata putih. Anak betina juga menerima X normal daripada bapa, jadi tiada yang menunjukkan ciri itu.",
  ),
  c4q13: t(
    "Salasilah (pedigree) di bawah menunjukkan pewarisan hemofilia dalam sebuah keluarga. Apakah genotip individu 7?",
    ["A. XᴴXᴴ", "B. XᴴY", "C. XᴴXʰ", "D. XʰXʰ"],
    "Individu 7 ialah perempuan yang normal secara fenotip dengan anak lelaki yang berpenyakit, jadi dia mesti seorang pembawa (carrier) — XᴴXʰ.",
  ),
  c4q14: t(
    "Dalam peta kromosom linear, jarak antara empat lokus ialah: a–b 10 cM, b–c 4 cM, a–d 3 cM, a–c 6 cM. Apakah nilai pindah silang (crossover value) antara c dan d?",
    ["A. 4 – 12%", "B. 3 – 6%", "C. 9%", "D. 3%"],
    "Susunan pada kromosom ialah a–d 3, a–c 6, jadi d–c = 6 − 3 = 3 cM… skema menerima C (dan menandakan D sebagai alternatif pada sesetengah tahun). Semak dengan pensyarah anda.",
  ),

  /* ── Bab 5: Genetik Populasi ────────────────────────────────────────── */
  c5q1: t(
    "Dalam satu populasi manusia, 75% boleh menggulung lidah. Individu yang tidak boleh menggulung lidah adalah homozigot resesif. Apakah frekuensi alel resesif (recessive allele frequency)?",
    ["A. 0.05", "B. 0.25", "C. 0.50", "D. 0.70"],
    "Bukan penggulung = 25%, jadi q² = 0.25 dan q = √0.25 = 0.50.",
  ),
  c5q2: t(
    "Jika frekuensi alel resesif ialah 30%, berapakah peratusan pembawa heterozigot (heterozygous carriers)?",
    ["A. 9", "B. 27", "C. 42", "D. 60"],
    "q = 0.3, p = 0.7. 2pq = 2(0.7)(0.3) = 0.42 = 42%.",
  ),
  c5q3: t(
    "Jika 1.0% daripada populasi menghidap anemia sel sabit (sickle cell anaemia), berapakah peratusan genotip heterozigot?",
    ["A. 1", "B. 9", "C. 18", "D. 81"],
    "q² = 0.01, q = 0.1, p = 0.9. 2pq = 2(0.9)(0.1) = 0.18 = 18%.",
  ),
  c5q4: t(
    "Daripada 400 orang di sebuah pulau Pasifik, 16 orang homozigot resesif bagi satu ciri yang hanya mempunyai dua alel dalam populasi itu. Bilangan individu heterozigot ialah…",
    ["A. 32", "B. 64", "C. 128", "D. 256"],
    "q² = 16/400 = 0.04, q = 0.2, p = 0.8. 2pq = 0.32; 0.32 × 400 = 128.",
  ),
  c5q5: t(
    "Dengan andaian keseimbangan Hardy-Weinberg (Hardy-Weinberg equilibrium), 21% populasi adalah homozigot dominan, 50% heterozigot dan 29% homozigot resesif. Berapakah peratusan generasi seterusnya yang dijangka homozigot resesif?",
    ["A. 21%", "B. 29%", "C. 42%", "D. 50%"],
    "Dalam keseimbangan, frekuensi genotip kekal malar dari satu generasi ke generasi seterusnya, jadi ia kekal 29%.",
  ),
  c5q6: t(
    "Antara berikut, yang manakah TIDAK berlaku jika sesebuah populasi ingin mengekalkan keseimbangan frekuensi alel?",
    ["A. Orang ramai meninggalkan sesebuah negara dan berpindah ke negara lain.", "B. Penyakit menghapuskan sebahagian besar sekumpulan rusa.", "C. Tikus hitam yang besar menjadi jantan pilihan dalam satu populasi tikus.", "D. Semua di atas adalah betul."],
    "Ketiga-tiganya melanggar syarat Hardy-Weinberg — A ialah migrasi (migration), B ialah pengurangan saiz populasi yang drastik, C ialah pengawanan tidak rawak (non-random mating).",
  ),
  c5q7: t(
    "Imigrasi individu ke dalam populasi yang berada dalam keseimbangan Hardy-Weinberg TIDAK akan mengganggu keseimbangan itu jika…",
    ["A. mereka datang dalam bilangan yang besar.", "B. mereka telah melepasi umur pembiakan.", "C. mereka mengawan secara rawak dalam populasi baharu.", "D. bilangan betina dan jantan adalah sama."],
    "Individu yang telah melepasi umur pembiakan tidak menyumbang alel kepada generasi seterusnya, jadi kumpulan gen (gene pool) tidak berubah.",
  ),

  /* ── Bab 6: Pengekspresan Maklumat Biologi ─────────────────────────── */
  c6q1: t(
    "Dalam analisis komposisi nukleotida DNA untuk melihat bes yang sama kepekatannya, yang manakah benar?",
    ["A. A = C", "B. A = G dan C = T", "C. A + C = G + T", "D. A + T = G + C"],
    "A berpasangan dengan T dan G dengan C, jadi A = T dan G = C. Apabila dijumlahkan, A + C mesti sama dengan G + T.",
  ),
  c6q2: t(
    "Antara berikut, yang manakah paling tepat menerangkan aliran maklumat genetik dalam sel?",
    ["A. RNA → DNA → protein → ciri", "B. DNA → RNA → ciri → protein", "C. DNA → RNA → protein → ciri", "D. DNA → protein → RNA → ciri"],
    "DNA ditranskripsi (transcribed) kepada RNA, RNA ditranslasi (translated) kepada protein, dan protein menghasilkan ciri tersebut.",
  ),
  c6q3: t(
    "Pengekspresan gen (gene expression) berlaku apabila",
    ["A. gen ditranskripsikan", "B. mRNA disintesis", "C. protein disintesis", "D. protein represor melekat pada operator operon"],
    "Sesuatu gen diekspresikan apabila produknya — protein — dihasilkan. Transkripsi sahaja hanyalah langkah pertama.",
  ),
  c6q4: t(
    "Fungsi utama DNA ligase ialah untuk…",
    ["A. melekatkan nukleotida bebas pada rantai yang sedang memanjang.", "B. menyingkirkan bes yang mungkin telah disisipkan dengan betul.", "C. memotong dua bebenang molekul DNA sebelum replikasi.", "D. mencantumkan regangan nukleotida pendek yang baharu menjadi satu bebenang yang berterusan."],
    "DNA ligase mencantumkan serpihan Okazaki (Okazaki fragments) menjadi bebenang berterusan dengan membentuk ikatan fosfodiester (phosphodiester bonds).",
  ),
  c6q5: t(
    "Peristiwa berikut berlaku dalam replikasi DNA. 1 — ikatan antara bes komplementari terputus; 2 — ikatan antara bes komplementari terbentuk; 3 — molekul DNA terurai lilitannya; 4 — bebenang bertentangan berpisah; 5 — ikatan gula-fosfat terbentuk; 6 — nukleotida bebas berpasangan dengan nukleotida komplementari pada setiap bebenang. Apakah urutan peristiwa ini?",
    ["A. 1, 3, 6, 4, 2, 5", "B. 3, 1, 4, 6, 2, 5", "C. 3, 6, 1, 4, 5, 2", "D. 4, 3, 1, 6, 5, 2"],
    "Heliks terurai, ikatan hidrogen terputus, bebenang berpisah, nukleotida berpasangan, pasangan bes terikat, kemudian tulang belakang gula-fosfat terbentuk.",
  ),
  c6q6: t(
    "Rajah manakah yang menunjukkan pasangan nukleotida RNA dengan nukleotida DNA?",
    LETTERS,
    "RNA mengandungi urasil (uracil), yang berpasangan dengan adenina pada DNA. RNA tidak pernah mengandungi timina (thymine).",
  ),
  c6q7: t(
    "Dalam transkripsi (transcription)… I. RNA utusan (mRNA) dihasilkan. II. promoter diperlukan supaya RNA polimerase boleh terikat pada DNA. III. enzim khusus yang dipanggil RNA polimerase (RNA polymerase) diperlukan. IV. beberapa molekul mRNA dihasilkan menggunakan jujukan DNA yang sama sebagai templat.",
    ["A. I, II, III", "B. I, II dan IV", "C. II, III dan IV", "D. I, II, III, IV"],
    "Keempat-empatnya benar — satu gen boleh ditranskripsi berkali-kali.",
  ),
  c6q8: t(
    "Berikut ialah peringkat-peringkat dalam sintesis protein. 1 — pergerakan mRNA dari nukleus ke sitoplasma; 2 — pencantuman molekul asid amino yang bersebelahan; 3 — transkripsi mRNA daripada templat DNA; 4 — pembentukan rantai polipeptida; 5 — perlekatan bebenang mRNA pada ribosom. Apakah urutan peringkat-peringkat ini?",
    ["A. 1, 3, 2, 5, 4", "B. 1, 5, 3, 4, 2", "C. 3, 1, 5, 2, 4", "D. 3, 4, 1, 2, 5"],
    "Transkripsi, eksport ke sitoplasma, perlekatan pada ribosom, ikatan peptida, kemudian rantai yang lengkap.",
  ),
  c6q9: t(
    "Antikodon (anticodon) ialah jujukan bes bernitrogen pada…",
    ["A. bebenang DNA komplementari yang mengekod satu asid amino.", "B. bebenang mRNA komplementari yang mengekod satu asid amino.", "C. molekul tRNA di tapak perlekatan asid amino.", "D. molekul tRNA yang berpasangan secara komplementari dengan jujukan bes yang sepadan pada mRNA."],
    "Antikodon ialah gelung tiga bes pada tRNA yang berpasangan dengan kodon (codon) mRNA.",
  ),
  c6q10: t(
    "Jadual menunjukkan antikodon bagi beberapa tRNA yang membawa asid amino tertentu. Sebahagian jujukan mRNA yang dihasilkan selepas transkripsi gen bagi satu polipeptida ialah 5'GCA GCG UAC UCC3'. Apakah jujukan asid amino yang betul apabila mRNA ini ditranslasi?",
    ["A. ala-ala-tyr-ser", "B. ala-ala-tyr-thr", "C. arg-arg-met-arg", "D. arg-arg-met-thr"],
    "Antikodon yang berpasangan dengan GCA, GCG, UAC, UCC ialah CGU, CGC, AUG, AGG — ala, ala, tyr, ser.",
  ),
  c6q11: t(
    "Insulin ialah protein yang mengandungi 51 asid amino, termasuk 17 daripada 20 jenis asid amino yang biasa terdapat dalam protein. Berapakah bilangan minimum jenis molekul tRNA yang terlibat dalam sintesis insulin?",
    ["A. 3", "B. 17", "C. 20", "D. 51"],
    "Sekurang-kurangnya satu jenis tRNA diperlukan bagi setiap jenis asid amino yang digunakan — 17.",
  ),
  c6q12: t(
    "Berbanding ribosom tunggal, poliribosom (polyribosome), iaitu kompleks ribosom, meningkatkan kecekapan sintesis protein. Bagaimanakah hal ini dicapai?",
    ["A. Molekul protein yang berbeza boleh dihasilkan serentak.", "B. Setiap salinan molekul mRNA boleh dihasilkan dengan lebih cepat.", "C. Lebih daripada satu salinan molekul mRNA boleh dibaca pada masa yang sama.", "D. Banyak salinan protein yang sama boleh dihasilkan serentak daripada satu molekul mRNA."],
    "Beberapa ribosom mentranslasi mRNA yang sama serentak, menghasilkan banyak salinan satu polipeptida.",
  ),
  c6q13: t(
    "Dalam operon laktosa (lactose operon), kedua-dua gen P dan Q melalui proses transkripsi. Gen Q hanya boleh ditranskripsi dengan kehadiran laktosa dan pada masa yang sama produk gen P dibebaskan daripada R. Antara berikut, yang manakah benar tentang gen P, Q dan R?",
    ["A. P: gen pengawal atur (regulatory gene), Q: gen struktur (structural gene), R: gen operator", "B. P: gen struktur, Q: gen operator, R: gen pengawal atur", "C. P: gen operator, Q: gen struktur, R: gen pengawal atur", "D. P: gen promoter, Q: gen pengawal atur, R: gen operator"],
    "P menghasilkan represor (gen pengawal atur), yang dibebaskan daripada R (operator), membolehkan Q (gen struktur) ditranskripsi.",
  ),
  c6q14: t(
    "Pernyataan manakah yang benar tentang operon laktosa dengan kehadiran laktosa? I. Gen pengawal atur menghasilkan molekul represor (repressor) yang aktif. II. Alolaktosa (allolactose) terikat pada molekul represor. III. Molekul represor yang tidak aktif terikat pada promoter. IV. RNA polimerase terikat pada operator. V. Transkripsi gen struktur berlaku.",
    ["A. I, II dan III", "B. I, II dan V", "C. I, III dan IV", "D. I, II, IV dan V"],
    "Represor dihasilkan dalam bentuk aktif, alolaktosa menyahaktifkannya, dan gen struktur ditranskripsi. RNA polimerase terikat pada promoter, bukan operator.",
  ),
  c6q15: t(
    "Pernyataan manakah yang benar tentang Escherichia coli yang gen pengawal aturnya telah mengalami mutasi?",
    ["A. Hanya β-galaktosidase (β-galactosidase) dihasilkan.", "B. Represor yang dihasilkan terikat pada gen operator.", "C. RNA polimerase tidak dapat terikat pada gen promoter.", "D. E. coli menghasilkan β-galaktosidase, permease dan transasetilase secara berterusan."],
    "Tanpa represor yang berfungsi, tiada yang menghalang operator, jadi ketiga-tiga enzim dihasilkan sepanjang masa.",
  ),

  /* ── Bab 7: Mutasi ──────────────────────────────────────────────────── */
  c7q1: t(
    "Hidroksilamina (hydroxylamine) ialah sejenis mutagen. Ia menukar bes sitosina kepada sejenis sebatian yang boleh berpasangan dengan bes adenina. Rawatan sampel DNA dengan hidroksilamina akan menyebabkan mutasi melalui",
    ["A. penghapusan (deletion) satu bes.", "B. penyisipan (insertion) satu bes.", "C. penyongsangan (inversion) satu bes.", "D. penggantian (substitution) satu bes."],
    "Sitosina yang diubah berpasangan dengan adenina, jadi pada replikasi berikutnya pasangan C–G menjadi T–A — satu bes diganti dengan bes lain.",
  ),
  c7q2: t(
    "Dalam anemia sel sabit (sickle cell anaemia)…",
    ["A. asid glutamik diganti dengan valina pada rantai β-polipeptida.", "B. asid glutamik diganti dengan valina pada rantai α-polipeptida.", "C. valina diganti dengan asid glutamik pada rantai β-polipeptida.", "D. valina diganti dengan asid glutamik pada rantai α-polipeptida."],
    "GAG menjadi GUG dalam gen β-globin, jadi asid glutamik (glutamic acid) diganti dengan valina (valine) pada rantai β.",
  ),
  c7q3: t(
    "Penyisipan atau penghapusan pasangan bes dalam kod genetik akan menyebabkan mutasi anjakan bingkai (frameshift mutation) kecuali jika bilangan pasangan bes yang disisipkan atau dihapuskan ialah…",
    ["A. satu", "B. dua", "C. tiga", "D. sepuluh"],
    "Kodon dibaca tiga bes sekali, jadi menambah atau membuang bes sebanyak satu kodon lengkap mengekalkan bingkai bacaan (reading frame).",
  ),
  c7q4: t(
    "Antara perubahan berikut pada kodon AUUGCC, yang manakah paling serius?",
    ["A. AUCGCC", "B. AUUGCA", "C. AUUCCCGCC", "D. AUUUGCC"],
    "Satu bes yang disisipkan mengubah bingkai bacaan dan setiap kodon selepasnya. A dan B ialah penggantian senyap (silent substitution); C menyisipkan satu kodon lengkap.",
  ),
  c7q5: t(
    "Jadual di bawah menunjukkan jenis mutasi dan contohnya. Antara berikut, yang manakah betul tentang jenis mutasi dan contohnya?",
    ["A. I – (a), II – (c), III – (b), IV – (d)", "B. I – (d), II – (a), III – (c), IV – (b)", "C. I – (b), II – (c), III – (a), IV – (d)", "D. I – (c), II – (d), III – (a), IV – (b)"],
    "Anemia sel sabit ialah penggantian bes, sindrom Down ialah aneuploidi (aneuploidy), cri du chat ialah penghapusan kromosom, talasemia ialah penghapusan bes.",
  ),
  c7q6: t(
    "Rajah di bawah menunjukkan kromosom homolog semasa sinapsis (synapsis) dalam profasa I meiosis. Apakah jenis mutasi kromosom yang berlaku?",
    ["A. penghapusan (deletion).", "B. penyongsangan (inversion).", "C. penggandaan (duplication).", "D. translokasi (translocation)."],
    "Gelung terbentuk kerana satu homolog mempunyai segmen yang tersusun terbalik — penyongsangan — jadi ia berpintal untuk berpasangan gen demi gen.",
  ),
  c7q7: t(
    "Antara berikut, yang manakah paling tepat menerangkan jenis mutasi yang berlaku dalam RAJAH di bawah?",
    [
      "A. Segmen kromosom DEF digandakan, terlerai dan bercantum pada kromosom 2 manakala segmen kromosom IJKL bertranslokasi ke kromosom 1 membentuk kromosom 2 yang lebih panjang.",
      "B. Segmen kromosom DEF terlerai, berputar 180° dan bercantum dengan kromosom 2 manakala segmen JKL terlerai, berputar 180° dan bercantum dengan kromosom 1 membentuk dua kromosom yang lebih pendek.",
      "C. Segmen kromosom DEF terlerai dan bertranslokasi ke kromosom 2 manakala segmen JKL terlerai dan bertranslokasi ke kromosom 1 tanpa mengubah panjang kromosom asal.",
      "D. Segmen kromosom DEF disisipkan ke dalam kromosom 2 manakala segmen IJKL disisipkan ke dalam kromosom 1 tanpa mengubah panjang kromosom asal.",
    ],
    "Segmen ditukar antara dua kromosom bukan homolog — translokasi salingan (reciprocal translocation).",
  ),
  c7q8: t(
    "Pernyataan manakah yang benar tentang aneuploidi (aneuploidy)? I. Bilangan kromosom lebih daripada 2n. II. Bilangan kromosom kurang daripada 2n. III. Monosomi ialah salah satu contoh aneuploidi. IV. Tak disjungsi (nondisjunction) kromosom homolog boleh menyebabkan aneuploidi.",
    ["A. I sahaja", "B. II dan III", "C. I, II dan III", "D. I, II, III dan IV"],
    "Aneuploidi ialah penambahan atau kehilangan kromosom secara individu (2n+1, 2n−1), dan tak disjungsi ialah penyebabnya.",
  ),
  c7q9: t(
    "Pilih pernyataan yang betul tentang sindrom Down (Down syndrome). I. Satu salinan tambahan kromosom 16 melekat pada kromosom 21. II. Ia sering berlaku akibat tak disjungsi. III. Ia biasanya mempunyai tiga salinan kromosom 21. IV. Cirinya termasuk muka yang lebar dan rata serta kelopak mata yang condong.",
    ["A. II dan IV", "B. I, II dan IV", "C. II, III dan IV", "D. I, II, III dan IV"],
    "Sindrom Down ialah trisomi 21 (trisomy 21), biasanya akibat tak disjungsi. Pernyataan I salah.",
  ),
  c7q10: t(
    "RAJAH di bawah menunjukkan sel manusia yang mengalami tak disjungsi (nondisjunction) kromosom seks semasa meiosis II. Tentukan DUA jenis gamet yang mungkin dihasilkan.",
    ["A. n = 22 + X, n = 22 + XY", "B. n = 22 + XX, n = 22 + YY", "C. n = 22 + YY, n = 22 + X0", "D. n = 22 + 0, n = 22 + XY"],
    "X dan Y berpisah secara normal dalam meiosis I; apabila kromatid beradik gagal berpisah dalam meiosis II, gamet membawa XX atau YY.",
  ),
  c7q11: t(
    "Antara berikut, yang manakah boleh menyebabkan poliploidi (polyploidy)? I. Rawatan dengan kolkisina (colchicine). II. Pindah silang. III. Penggabungan bebas kromosom (independent assortment). IV. Gentian gelendong (spindle fibre) tidak terbentuk.",
    ["A. I dan II", "B. I dan IV", "C. II dan III", "D. II dan IV"],
    "Kolkisina menghalang pembentukan gelendong, jadi set kromosom yang lengkap kekal dalam satu sel dan bilangannya berganda.",
  ),
  c7q12: t(
    "Penghibridan (hybridisation) tumbuhan A (2n=16) dengan tumbuhan B (2n=20) menghasilkan tumbuhan C yang steril. Penggandaan kromosom dalam tumbuhan C menghasilkan tumbuhan D. Berapakah bilangan kromosom dalam tumbuhan C dan D?",
    ["A. C=18, D=36", "B. C=36, D=36", "C. C=36, D=72", "D. C=72, D=72"],
    "C menerima n = 8 + 10 = 18. Penggandaan menghasilkan D = 36.",
  ),

  /* ── Bab 8: Teknologi DNA Rekombinan ────────────────────────────────── */
  c8q1: t(
    "Matlamat kejuruteraan genetik (genetic engineering) ialah untuk?",
    ["A. Menghapuskan kerintangan antibiotik dalam bakteria.", "B. Memencilkan plasmid penyebab penyakit.", "C. Memindahkan gen virus.", "D. Mengubah suai sel untuk membetulkan kecacatan atau menghasilkan produk yang dikehendaki."],
    "Kejuruteraan genetik mengubah DNA sesuatu organisma untuk membetulkan kecacatan atau menghasilkan produk berguna seperti insulin.",
  ),
  c8q2: t(
    "Alat utama dalam teknologi DNA rekombinan (recombinant DNA technology) termasuk I. enzim helikase II. enzim pembatasan (restriction enzyme) III. plasmid IV. enzim ligase",
    ["A. I dan II", "B. I, II dan III", "C. II, III dan IV", "D. I, II, III dan IV"],
    "Enzim pembatasan memotong, plasmid membawa, ligase mencantumkan. Helikase terlibat dalam replikasi, bukan dalam peralatan pengklonan.",
  ),
  c8q3: t(
    "Enzim pembatasan (restriction enzymes) I. sering menghasilkan potongan berperingkat (staggered cuts) pada DNA yang berguna dalam penyambungan gen. II. seperti kebanyakan enzim, sangat spesifik dalam tindakannya. III. ialah mekanisme pertahanan semula jadi yang berevolusi dalam bakteria untuk melawan bakteriofaj. IV. digunakan bersama ligase dan plasmid untuk menghasilkan perpustakaan DNA (DNA library).",
    ["A. I dan II", "B. I, II dan III", "C. I, II dan IV", "D. I, II, III dan IV"],
    "Keempat-empatnya benar.",
  ),
  c8q4: t(
    "RAJAH 1 menunjukkan jujukan palindrom (palindromic sequence) X, Y dan Z. Kenal pasti jenis enzim pembatasan yang mengecam jujukan palindrom ini.",
    [
      "A. X: EcoRI dan SmaI; Y: EcoRI sahaja; Z: SmaI sahaja",
      "B. X: EcoRI dan SmaI; Y: SmaI sahaja; Z: EcoRI sahaja",
      "C. X: EcoRI dan SmaI; Y: EcoRI dan SmaI; Z: SmaI sahaja",
      "D. X: SmaI sahaja; Y: EcoRI dan SmaI; Z: EcoRI sahaja",
    ],
    "EcoRI mengecam GAATTC dan SmaI mengecam CCCGGG. X mempunyai kedua-duanya; Y hanya CCCGGG; Z hanya GAATTC.",
  ),
  c8q5: t(
    "RAJAH 2 di bawah menunjukkan skema pengklonan gen (gene cloning). Apakah yang diwakili oleh I, II dan III dalam skema di atas?",
    [
      "A. I: EcoRI; II: DNA ligase; III: DNA rekombinan",
      "B. I: DNA rekombinan; II: EcoRI; III: DNA ligase",
      "C. I: DNA ligase; II: EcoRI; III: DNA rekombinan",
      "D. I: DNA ligase; II: DNA rekombinan; III: EcoRI",
    ],
    "Plasmid dibuka dengan enzim pembatasan, serpihan dicantumkan dengan ligase, menghasilkan DNA rekombinan (recombinant DNA).",
  ),
  c8q6: t(
    "Ciri-ciri plasmid termasuk I. terdapat dalam kebanyakan bakteria II. DNA berbentuk bulat III. membawa gen untuk menyahaktifkan antibiotik tertentu IV. mampu bereplikasi secara autonomi, bebas daripada pengaruh kromosom",
    ["A. I, II dan III", "B. I, III dan IV", "C. II, III dan IV", "D. I, II, III dan IV"],
    "Keempat-empatnya menerangkan plasmid.",
  ),
  c8q7: t(
    "Antara berikut, yang manakah kepentingan tindakan enzim pembatasan dalam teknologi DNA rekombinan?",
    ["A. Mengehadkan pengklonan cDNA", "B. Menyatukan kromosom dan plasmid", "C. Memastikan pemotongan jujukan DNA secara rawak", "D. Memastikan hujung serpihan DNA sumber dan DNA plasmid saling berpasangan secara komplementari."],
    "Memotong kedua-duanya dengan enzim yang sama menghasilkan hujung komplementari yang boleh berpasangan.",
  ),
  c8q8: t(
    "\"Adalah wajar menggunakan enzim pembatasan yang menghasilkan 'hujung melekit' (sticky ends) untuk pengklonan\". Pilih jawapan yang BETUL untuk menyokong pernyataan ini.",
    ["A. Untuk memudahkan pengecaman plasmid yang mengandungi sisipan.", "B. Untuk memudahkan pengecaman plasmid yang rintang antibiotik.", "C. Untuk memudahkan penyisipan segmen DNA dari sumber berbeza ke dalam plasmid.", "D. Untuk memudahkan transformasi."],
    "Hujung bebenang tunggal yang komplementari mudah berpasangan, jadi serpihan dari sumber berbeza mudah dicantumkan.",
  ),
  c8q9: t(
    "RAJAH 3 di bawah menunjukkan pengklonan DNA menggunakan plasmid bakteria. Mengapakah penyaringan (screening) perlu dijalankan? I. Terdapat bakteria yang tidak ditransformasi. II. Terdapat bakteria yang tidak mengalami amplifikasi. III. Terdapat bakteria yang ditransformasi dengan plasmid bukan rekombinan.",
    ["A. I dan II sahaja", "B. I dan III sahaja", "C. II dan III sahaja", "D. I, II dan III"],
    "Penyaringan memisahkan bakteria yang membawa plasmid rekombinan daripada yang tiada plasmid dan yang membawa plasmid kosong.",
  ),
  c8q10: t(
    "Semasa prosedur penyaringan, sesetengah E. coli mungkin tidak tumbuh membentuk koloni. Apakah yang mungkin telah berlaku?",
    ["A. DNA sasaran gagal disisipkan ke dalam plasmid.", "B. Transformasi DNA rekombinan berlaku dalam E. coli.", "C. DNA rekombinan tidak dimasukkan ke dalam E. coli.", "D. E. coli tidak rintang terhadap beta-galaktosidase."],
    "Tanpa plasmid, sel tidak mempunyai gen kerintangan antibiotik (antibiotic resistance gene), jadi ia mati pada medium terpilih.",
  ),
  c8q11: t(
    "Oleh sebab ia tidak mengandungi intron, penyelidik lebih gemar menggunakan ______ apabila bekerja dengan gen manusia.",
    ["A. cDNA", "B. DNA yang diklonkan", "C. DNA yang dihibridkan", "D. DNA virus"],
    "cDNA disalin daripada mRNA matang, jadi intron sudah tiada — bakteria tidak dapat menyingkirkan intron melalui penyambungan (splicing).",
  ),
  c8q12: t(
    "cDNA berbeza daripada DNA biasa kerana cDNA disintesis daripada",
    ["A. DNA bebenang tunggal", "B. plasmid", "C. mRNA", "D. DNA bebenang ganda dua"],
    "Transkriptase berbalik (reverse transcriptase) membina cDNA menggunakan mRNA sebagai templat.",
  ),
  c8q13: t(
    "Mengapakah cDNA manusia, dan bukannya DNA asal, digunakan untuk digabungkan dengan vektor plasmid dalam sesetengah proses pengklonan? I. DNA asal mengandungi ekson dan intron. II. cDNA tidak mengandungi intron. III. Bakteria boleh menyingkirkan intron. IV. Bakteria tidak boleh menjalankan proses penyambungan (splicing).",
    ["A. I, II dan III", "B. I, II dan IV", "C. II, III dan IV", "D. I, II, III dan IV"],
    "Bakteria tidak boleh melakukan penyambungan, jadi cDNA tanpa intron digunakan. Pernyataan III salah.",
  ),
  c8q14: t(
    "Kaedah yang digunakan untuk menghasilkan bebenang tunggal DNA",
    ["A. dikenali sebagai amplifikasi.", "B. ialah memanaskan larutan DNA.", "C. menggunakan enzim pembatasan.", "D. memencilkan molekul DNA daripada nukleus."],
    "Pemanasan memutuskan ikatan hidrogen dan menyahasli (denature) DNA menjadi bebenang tunggal, seperti dalam PCR.",
  ),
  c8q15: t(
    "Teknik PCR (tindak balas berantai polimerase, polymerase chain reaction) I. memindahkan minisatelit DNA dari gel agarosa ke membran nilon. II. mengamplifikasi jumlah DNA dalam sampel yang kecil III. memisahkan serpihan minisatelit DNA yang berbeza saiz dan cas IV. mengklonkan DNA secara in vitro",
    ["A. I sahaja", "B. II sahaja", "C. I dan III", "D. II dan IV"],
    "PCR menyalin DNA secara in vitro. I menerangkan pemblotan (blotting) dan III menerangkan elektroforesis gel (gel electrophoresis).",
  ),
  c8q16: t(
    "Antara berikut, yang manakah kegunaan DNA rekombinan? I. Menghasilkan klon biri-biri. II. Menghasilkan tumbuhan dan haiwan penting dalam pertanian yang mempunyai nilai nutrisi yang lebih baik. III. Menghasilkan tumbuhan yang mempunyai gen bakteria untuk memusnahkan serangga perosak. IV. Menghasilkan mikrob yang merembeskan enzim untuk mengatasi masalah tumpahan minyak di laut.",
    ["A. I dan IV", "B. III dan IV", "C. II, III dan IV", "D. I, II, III dan IV"],
    "Pengklonan biri-biri menggunakan pemindahan nukleus (nuclear transfer), bukan DNA rekombinan.",
  ),
};

/**
 * The wording to show for a question in the chosen language. Falls back to the
 * English bank if a translation is missing — never to a blank question.
 */
export function mcqText(q: Mcq, lang: "en" | "bm"): McqText {
  if (lang === "bm") {
    const bm = MCQ_BM[q.id];
    if (bm) return bm;
  }
  return { stem: q.stem, options: q.options, explain: q.explain };
}
