import { SECTIONS } from "../data/faqs";

// Keyword search over the property guidelines.
// This is where a real language model or search service would plug in later:
// keep the same return shapes and the screens won't need to change.
//
//   search(question)    -> [{ section, score }]   every guideline that matches, best first
//   retrieve(question)  -> { top, related } | null   best guideline plus up to two related ones

// Words that carry no meaning for matching.
const STOP = new Set(
  ("a an the i my me is are am was be do does did can could would should will to of in on at for and or it its this that there " +
    "when where what how which who with from about have has any you your our we if so but not no yes please need want know tell get got " +
    "make use using allowed allow policy rule rules unit apartment building resident residents tenant go up out off into over").split(" ")
);

function stem(w) {
  if (w.length > 4) w = w.replace(/(ing|ed|es)$/, "");
  if (w.length > 3 && /[^s]s$/.test(w)) w = w.slice(0, -1);
  return w;
}

function tokens(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w && !STOP.has(w))
    .map(stem);
}

const toSet = (text) => new Set(tokens(text));

// Build the index once.
const INDEX = SECTIONS.map((section) => ({
  section,
  kw: new Set(section.kw.flatMap((k) => tokens(k))),
  title: toSet(section.title),
  questions: toSet(section.questions.join(" ")),
  weak: toSet([section.answer, ...section.points, section.body].join(" ")),
}));

export function search(question) {
  const words = [...new Set(tokens(question))];
  if (!words.length) return [];

  const scored = INDEX.map(({ section, kw, title, questions, weak }) => {
    let score = 0;
    let strong = 0;
    for (const w of words) {
      const s = kw.has(w) ? 3 : title.has(w) ? 2 : questions.has(w) ? 1 : 0;
      strong += s;
      score += s;
      if (weak.has(w)) score += 0.1; // tie-breaker only. Never counts as a match on its own.
    }
    return { section, score, strong };
  })
    .filter((x) => x.strong > 0)
    .sort((a, b) => b.score - a.score || a.section.n - b.section.n);

  return scored.map(({ section, score }) => ({ section, score }));
}

export function retrieve(question) {
  const found = search(question);
  if (!found.length) return null;
  return { top: found[0].section, related: found.slice(1).filter((x) => x.score >= 2).slice(0, 2).map((x) => x.section) };
}

export function sourceLine(s) {
  return `Property Guidelines · Section ${s.n} · ${s.title} · Updated ${s.updated}`;
}
