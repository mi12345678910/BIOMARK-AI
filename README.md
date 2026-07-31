# BioMark AI

An AI grading platform for **KPM Matriculation Biology** (PSPM standard). Upload an official marking scheme and a student's answer sheet; get point-by-point marks, keyword-level feedback, model answers, and rendered diagrams — in English or Bahasa Melayu.

Built with Next.js 15 (App Router), React 19, Tailwind CSS v4, Mermaid, and the Anthropic Claude API.

---

## Step A — Project structure

```
biomark-ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx              Root layout, navbar, language provider
│   │   ├── page.tsx                Landing page
│   │   ├── globals.css             Tailwind v4 entry + theme
│   │   ├── grader/
│   │   │   └── page.tsx            Feature 1 — Auto-Grader
│   │   ├── quiz/
│   │   │   └── page.tsx            Feature 2 — Topic Quiz
│   │   └── api/
│   │       ├── grade/route.ts      Streaming grading endpoint
│   │       └── quiz/route.ts       Question generation + short-answer marking
│   ├── components/
│   │   ├── Navbar.tsx              Tabs + EN/BM toggle
│   │   ├── MermaidRenderer.tsx     Safe Mermaid rendering
│   │   ├── Markdown.tsx            Markdown + mermaid fence interception
│   │   └── FileDrop.tsx            Drag-drop / paste upload
│   └── lib/
│       ├── biomark-prompt.ts       ⭐ The grading system prompt
│       ├── topics.ts               ⭐ Syllabus map for the quiz dropdowns
│       ├── i18n.tsx                EN / BM strings + context
│       └── upload.ts               File → API content block
├── .env.example
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

The two files marked ⭐ are the ones you'll actually want to edit: `biomark-prompt.ts` controls how strictly it marks, `topics.ts` controls the chapter list.

---

## Step B — How the Claude integration works

| Concern | Choice | Why |
|---|---|---|
| Model | `claude-opus-5` | Strongest on the multi-step reasoning that scheme-matching needs. |
| Thinking | `{ type: "adaptive" }` | Claude decides depth per question. `budget_tokens` is removed on this model and returns a 400. |
| Effort | `high` grading / `medium` question-writing | Grading accuracy matters more than latency; question writing is well-scoped. |
| Grading transport | **Streaming** | Marking a full script exceeds the non-streaming HTTP timeout. |
| Quiz transport | **Structured outputs** (`output_config.format`) | Guarantees parseable JSON, so the UI never has to regex model prose. |
| Caching | `cache_control: ephemeral` on the system prompt | The prompt is byte-stable, so it caches at ~0.1× on every later request. |
| `max_tokens` | 16 000 (grading) | On Opus 5, `max_tokens` caps thinking **and** response text together — so this bounds latency, not just output length. |

Three things the code handles that are easy to miss:

1. **`stop_reason: "refusal"` is an HTTP 200**, not an exception. Both routes check it explicitly before reading content.
2. **No `temperature` / `top_p` / `top_k`** — these are removed on Opus 5 and return a 400. Tone is steered by the prompt instead.
3. **Structured outputs have no optional fields.** Every key must be in `required`, so fields that don't apply (`options` on a short-answer question) come back as an empty array rather than being absent.

---

## Step C — Local setup, GitHub, and Vercel

### 1. Prerequisite: Node.js

Verified working on **Node v24.18.1 / npm 11.16.0**. Anything from v20 up is fine.

```bash
node -v
```

If that errors, install it and reopen your terminal:

```bash
winget install OpenJS.NodeJS.LTS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set your API key

Create `.env.local` in the project root (it is already gitignored):

```bash
cp .env.example .env.local
```

Then open `.env.local` and replace the placeholder with a real key from [console.anthropic.com](https://console.anthropic.com/settings/keys):

```
ANTHROPIC_API_KEY=sk-ant-api03-your-real-key-here
```

> **Never commit this file.** The key is server-side only — it is read inside `src/app/api/**` and never reaches the browser.

### 4. Run it

```bash
npm run dev
```

Open <http://localhost:3000>.

### 5. Push to GitHub

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit: BioMark AI matriculation biology grader"
```

Create an empty repo on GitHub (no README, no .gitignore — you already have both), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/biomark-ai.git
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

Before pushing, confirm the key is not staged:

```bash
git status --short
```

`.env.local` must **not** appear in that list. If it does, stop and check `.gitignore`.

### 6. Deploy to Vercel

**Via the dashboard (recommended):**

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Click **Import** next to your `biomark-ai` repository.
3. Framework preset auto-detects as **Next.js** — leave the build settings alone.
4. Expand **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your real key
   - Environments: tick **Production**, **Preview**, and **Development**
5. Click **Deploy**.

You'll get a live URL like `https://biomark-ai.vercel.app`. Every later `git push` to `main` redeploys automatically.

**Via the CLI instead:**

```bash
npm i -g vercel
```

```bash
vercel login
```

```bash
vercel env add ANTHROPIC_API_KEY production
```

```bash
vercel --prod
```

### 7. Change the subdomain

Vercel Dashboard → your project → **Settings** → **Domains** → edit the `.vercel.app` entry to claim any unused name, e.g. `biomark-kmj.vercel.app`.

---

## Deployment notes

### Runs on Vercel's free plan — no Pro required

Both routes declare `maxDuration = 60`, the Hobby ceiling. Three things keep grading inside that window:

| Lever | Setting | Effect |
|---|---|---|
| Effort | `medium` instead of `high` | The biggest latency lever. Opus 5 is unusually strong at the lower effort levels, so scheme-matching accuracy holds up. |
| `max_tokens` | 16 000 | Caps thinking *and* text together on Opus 5, so it bounds thinking time as well as output length. |
| Soft deadline | 52 s (`GRADE_TIME_BUDGET_MS`) | The route aborts *itself* just before the platform would, and closes the stream with the marks awarded so far plus an explanation. |

That last one is the part that matters. Without it, hitting the limit means the platform kills the function and the student watches the output stop mid-sentence with no error. With it, they get partial marks and a clear "submit fewer questions" message.

**Reliable submission size on the free plan: one or two structured questions per run.** A full 10-question script will hit the soft deadline. Quiz generation is capped at 8 questions for the same reason.

**If you upgrade to Pro**, raise both limits — no code changes needed beyond the first:

```
# src/app/api/grade/route.ts
export const maxDuration = 300;
```

```
# Vercel → Settings → Environment Variables
GRADE_TIME_BUDGET_MS=290000
QUIZ_TIMEOUT_MS=290000
```

Then switch `output_config: { effort: "medium" }` back to `"high"` in `src/app/api/grade/route.ts` for maximum marking accuracy.

### Other limits

- **Request size.** Uploads are capped at 25 MB client-side, under the API's 32 MB request ceiling. A scanned 40-page PDF can exceed this — split it.
- **Cost.** Every grade is one Opus 5 call. The system prompt is cached, so repeat calls are cheaper, but there is no rate limiting in this codebase — add auth before putting it in front of a whole cohort.

## Verifying it works

1. `npm run dev`, open `/grader`.
2. **Grade mode.** Paste question *and* a deliberately partial answer into the single box:

   > Q: In a population of mice, 36% have white coats (recessive). Calculate the phenotype frequency of black-coated mice. [3 marks]
   >
   > My answer: q² = 0.36 so q = 0.6. p = 0.4. Black coat = p² = 0.16

   Expect **2/3**, the third mark lost for omitting the heterozygotes (`2pq`), plus a diagram. If it returns 3/3, the prompt is too lenient — tighten `biomark-prompt.ts` before trusting it on real scripts.
3. **Explain mode.** Paste the question *alone*, with no answer. Expect no marks — instead a model answer, a mark breakdown, required keywords, and common mistakes.
4. Switch to **BM** in the navbar and repeat: output should be Bahasa Melayu with English terms bracketed.
5. On `/quiz`, generate a Semester 1 · Cell Division quiz and answer one question of each type.

## Disclaimer

BioMark AI grades against the scheme you supply. Where no scheme is supplied it reconstructs one and labels the result **unofficial**. Always confirm final marks against your lecturer's official scheme.
