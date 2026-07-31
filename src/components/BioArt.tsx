/**
 * Hand-built biology illustrations, as inline SVG.
 *
 * Inline rather than image files on purpose: no network fetch, no CDN, they
 * inherit the page's colour tokens, and they stay crisp at any size. Each one
 * is decorative, so they carry aria-hidden and no title.
 */

type ArtProps = { className?: string };

/* ------------------------------------------------------------------ */
/* Plant cell — thick wall, big central vacuole, chloroplasts          */
/* ------------------------------------------------------------------ */

export function PlantCell({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 220 260" className={className} aria-hidden="true">
      {/* cell wall */}
      <rect
        x="6"
        y="6"
        width="208"
        height="248"
        rx="30"
        className="fill-emerald-200/70 stroke-emerald-700/60 dark:fill-emerald-900/50 dark:stroke-emerald-500/50"
        strokeWidth="3"
      />
      {/* membrane */}
      <rect
        x="18"
        y="18"
        width="184"
        height="224"
        rx="24"
        className="fill-emerald-50 stroke-emerald-600/50 dark:fill-slate-900 dark:stroke-emerald-600/40"
        strokeWidth="2"
      />
      {/* central vacuole */}
      <ellipse
        cx="112"
        cy="128"
        rx="62"
        ry="82"
        className="fill-sky-200/60 stroke-sky-500/50 dark:fill-sky-900/40 dark:stroke-sky-500/40"
        strokeWidth="2.5"
      />
      {/* nucleus */}
      <circle
        cx="58"
        cy="86"
        r="26"
        className="fill-violet-300/80 stroke-violet-600/60 dark:fill-violet-800/60 dark:stroke-violet-400/50"
        strokeWidth="2.5"
      />
      <circle cx="58" cy="86" r="10" className="fill-violet-600/70 dark:fill-violet-300/60" />

      {/* chloroplasts */}
      {[
        [52, 176, -22],
        [104, 224, 8],
        [166, 190, 34],
        [172, 78, -12],
        [120, 40, 16],
      ].map(([cx, cy, rot], i) => (
        <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse
            cx={cx}
            cy={cy}
            rx="20"
            ry="11"
            className="fill-green-400/80 stroke-green-700/70 dark:fill-green-600/60 dark:stroke-green-300/50"
            strokeWidth="2"
          />
          {[-9, -3, 3, 9].map((dx) => (
            <line
              key={dx}
              x1={cx + dx}
              y1={cy - 5}
              x2={cx + dx}
              y2={cy + 5}
              className="stroke-green-800/60 dark:stroke-green-200/50"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}

      {/* mitochondrion */}
      <g transform="rotate(-18 62 132)">
        <ellipse
          cx="62"
          cy="132"
          rx="17"
          ry="9"
          className="fill-rose-300/80 stroke-rose-600/60 dark:fill-rose-800/50 dark:stroke-rose-400/50"
          strokeWidth="2"
        />
        <path
          d="M50 132 q4 -5 8 0 q4 5 8 0 q4 -5 8 0"
          className="stroke-rose-700/60 dark:stroke-rose-300/50"
          strokeWidth="1.6"
          fill="none"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Animal cell — round, nucleus, ER, golgi, mitochondria               */
/* ------------------------------------------------------------------ */

export function AnimalCell({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <circle
        cx="120"
        cy="120"
        r="112"
        className="fill-amber-100/80 stroke-amber-600/50 dark:fill-slate-900 dark:stroke-amber-500/40"
        strokeWidth="3"
      />
      <circle
        cx="120"
        cy="120"
        r="104"
        className="fill-transparent stroke-amber-500/30 dark:stroke-amber-400/20"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />

      {/* nucleus + nucleolus */}
      <circle
        cx="112"
        cy="112"
        r="42"
        className="fill-rose-200/85 stroke-rose-500/60 dark:fill-rose-900/50 dark:stroke-rose-400/50"
        strokeWidth="2.5"
      />
      <circle cx="112" cy="112" r="16" className="fill-rose-500/70 dark:fill-rose-300/60" />

      {/* rough ER */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M46 ${150 + i * 13} q22 -13 44 0 q22 13 44 0`}
          className="stroke-teal-600/70 dark:stroke-teal-400/60"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      ))}

      {/* golgi */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M150 ${52 + i * 11} q20 -9 40 ${i * 1.5}`}
          className="stroke-yellow-600/80 dark:stroke-yellow-400/60"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ))}

      {/* mitochondria */}
      {[
        [62, 74, -28],
        [178, 138, 22],
        [128, 196, -8],
      ].map(([cx, cy, rot], i) => (
        <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse
            cx={cx}
            cy={cy}
            rx="22"
            ry="12"
            className="fill-orange-300/85 stroke-orange-700/60 dark:fill-orange-800/50 dark:stroke-orange-400/50"
            strokeWidth="2"
          />
          <path
            d={`M${cx - 15} ${cy} q5 -6 10 0 q5 6 10 0 q5 -6 10 0`}
            className="stroke-orange-800/60 dark:stroke-orange-200/50"
            strokeWidth="1.8"
            fill="none"
          />
        </g>
      ))}

      {/* vesicles */}
      {[
        [176, 84, 7],
        [196, 104, 5],
        [70, 178, 6],
      ].map(([cx, cy, r], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          className="fill-sky-300/80 stroke-sky-600/50 dark:fill-sky-800/50 dark:stroke-sky-400/40"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* DNA double helix                                                     */
/* ------------------------------------------------------------------ */

export function DnaHelix({ className = "" }: ArtProps) {
  const rungs = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    const y = 10 + t * 260;
    const phase = t * Math.PI * 3;
    const x1 = 50 + Math.sin(phase) * 34;
    const x2 = 50 - Math.sin(phase) * 34;
    return { y, x1, x2, key: i };
  });

  return (
    <svg viewBox="0 0 100 280" className={className} aria-hidden="true">
      <path
        d="M50 10 C 84 55, 16 100, 50 145 C 84 190, 16 235, 50 275"
        className="stroke-teal-600 dark:stroke-teal-400"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 10 C 16 55, 84 100, 50 145 C 16 190, 84 235, 50 275"
        className="stroke-rose-500 dark:stroke-rose-400"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {rungs.map(({ y, x1, x2, key }) => (
        <line
          key={key}
          x1={x1}
          y1={y}
          x2={x2}
          y2={y}
          className="stroke-amber-500/70 dark:stroke-amber-300/60"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Small inline glyphs for feature cards                                */
/* ------------------------------------------------------------------ */

export function Microscope({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <path
        d="M18 40h20M14 40h2M24 8l8 5-7 11-8-5 7-11Z"
        className="stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 24c-6 3-8 10-5 16h18c4-7 1-15-5-18"
        className="stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="12" r="2" className="fill-current" />
    </svg>
  );
}

export function Flask({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <path
        d="M19 6v13L9 36a4 4 0 0 0 3.5 6h23A4 4 0 0 0 39 36L29 19V6"
        className="stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 6h16" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M13.5 30h21"
        className="stroke-current opacity-50"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="35" r="2" className="fill-current opacity-60" />
      <circle cx="28" cy="37" r="1.5" className="fill-current opacity-60" />
    </svg>
  );
}

export function Brain({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <path
        d="M24 10v28M24 12a6 6 0 0 0-11-3 5 5 0 0 0-4 8 5 5 0 0 0 1 8 6 6 0 0 0 8 6 6 6 0 0 0 6 2M24 12a6 6 0 0 1 11-3 5 5 0 0 1 4 8 5 5 0 0 1-1 8 6 6 0 0 1-8 6 6 6 0 0 1-6 2"
        className="stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page-level decorative background                                     */
/* ------------------------------------------------------------------ */

/** Soft blurred blobs + a faint hex grid, fixed behind all content. */
export function BioBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl dark:bg-teal-800/20" />
      <div className="absolute -right-24 top-32 h-96 w-96 rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-900/20" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-900/15" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] dark:opacity-[0.08]">
        <defs>
          <pattern id="cells" width="56" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M28 2 L52 15 L52 41 L28 54 L4 41 L4 15 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cells)" className="text-teal-900" />
      </svg>
    </div>
  );
}
