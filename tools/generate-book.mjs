// tools/generate-book.mjs
//
// Builds the multi-page "book" site from the original single-page prototype
// (_source/original-single-page.html). Not part of the running site — a one-time/repeatable Node
// generator, run whenever the source content changes. Extracts the CURRICULUM (topic data) and CH
// (Head-First chapter content: hooks, goals, vocab, discovery, mistakes, retrieval, summary) objects
// by running that exact, already-reviewed JS snippet in a sandboxed vm context (safe: it is
// first-party trusted content, not external/untrusted input), then renders one static HTML page per
// topic plus the shared shell. Preserves every educational sentence verbatim — only restructures
// delivery into separate pages, fixes the window.storage bug (-> localStorage), and adds Bookmarks.
//
// Usage: node tools/generate-book.mjs

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, '_source', 'original-single-page.html');
const TOPICS_DIR = path.join(ROOT, 'topics');

// --- 1. Extract CURRICULUM + CH by executing the trusted data-definition slice of the source ---

function extractDataSlice(html) {
  const start = html.indexOf('const CURRICULUM = ');
  const end = html.indexOf('function sectionInner(t,group){');
  if (start === -1 || end === -1) throw new Error('Could not locate CURRICULUM/CH data slice in source.');
  return html.slice(start, end);
}

function loadData() {
  const html = fs.readFileSync(SRC, 'utf-8');
  const slice = extractDataSlice(html);
  // Only `const nav=document.getElementById(...)` at the top of the slice touches the DOM; nothing
  // else in this pure-data range needs it, so a harmless stub is enough.
  const sandbox = { document: { getElementById: () => null } };
  vm.createContext(sandbox);
  // Top-level const/let bindings from vm.runInContext don't reliably show up as own-properties of
  // the sandbox object across Node versions, so explicitly copy them onto globalThis at the end.
  vm.runInContext(slice + '\nglobalThis.CURRICULUM=CURRICULUM;globalThis.CH=CH;globalThis.ORDER=ORDER;', sandbox, { filename: 'curriculum-data.js' });
  return { CURRICULUM: sandbox.CURRICULUM, CH: sandbox.CH, ORDER: sandbox.ORDER };
}

// --- 2. Fixed (non-random) intro figures for the 6 dynamic topics, baked at build time ---

function quadrantChart() {
  const S = 250, pad = 30, c = S / 2, u = (c - pad) / 5; let g = '';
  for (let i = -5; i <= 5; i++) { g += `<line class="fig-g" x1="${c + i * u}" y1="${pad}" x2="${c + i * u}" y2="${S - pad}"/><line class="fig-g" x1="${pad}" y1="${c - i * u}" x2="${S - pad}" y2="${c - i * u}"/>`; }
  g += `<line class="fig-ax" x1="${pad}" y1="${c}" x2="${S - pad}" y2="${c}"/><line class="fig-ax" x1="${c}" y1="${pad}" x2="${c}" y2="${S - pad}"/>`;
  g += `<text class="fig-txt soft" x="${S - pad + 2}" y="${c + 13}">x</text><text class="fig-txt soft" x="${c + 5}" y="${pad}">y</text>`;
  const o = (c - pad) / 2, q = (x, y, rom, sign) => `<text class="fig-txt" text-anchor="middle" x="${x}" y="${y - 3}">${rom}</text><text class="fig-txt soft" text-anchor="middle" x="${x}" y="${y + 14}">${sign}</text>`;
  g += q(c + o, c - o, 'I', '(+, +)') + q(c - o, c - o, 'II', '(&minus;, +)') + q(c - o, c + o, 'III', '(&minus;, &minus;)') + q(c + o, c + o, 'IV', '(+, &minus;)');
  return `<svg class="viz" viewBox="0 0 ${S} ${S}" width="250" role="img" aria-label="four quadrants">${g}</svg>`;
}
function straightAngle(a) {
  const W = 230, H = 118, ox = W / 2, oy = 88, len = 95, rad = a * Math.PI / 180;
  let g = `<line class="fig-ax" x1="${ox - len}" y1="${oy}" x2="${ox + len}" y2="${oy}"/>`;
  g += `<line class="fig-line" x1="${ox}" y1="${oy}" x2="${(ox + len * Math.cos(rad)).toFixed(1)}" y2="${(oy - len * Math.sin(rad)).toFixed(1)}"/>`;
  g += `<circle class="fig-pt" cx="${ox}" cy="${oy}" r="3"/>`;
  const la = a / 2 * Math.PI / 180, lx = ((180 + a) / 2) * Math.PI / 180;
  g += `<text class="fig-txt ang" text-anchor="middle" x="${(ox + 48 * Math.cos(la)).toFixed(1)}" y="${(oy - 48 * Math.sin(la) + 4).toFixed(1)}">${a}&deg;</text>`;
  g += `<text class="fig-txt ang" text-anchor="middle" x="${(ox + 48 * Math.cos(lx)).toFixed(1)}" y="${(oy - 48 * Math.sin(lx) + 4).toFixed(1)}">x</text>`;
  return `<svg class="viz" viewBox="0 0 ${W} ${H}" width="220" role="img" aria-label="angles on a straight line">${g}</svg>`;
}
function miniPoly(cx, cy, r, n, label) { const pts = []; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`); } return `<polygon class="fig-shape" points="${pts.join(' ')}"/><text class="fig-txt soft" text-anchor="middle" x="${cx}" y="${cy + r + 17}">${label}</text>`; }
function polyRow() { return `<svg class="viz" viewBox="0 0 300 125" width="285" role="img" aria-label="polygons">${miniPoly(55, 58, 40, 3, 'triangle')}${miniPoly(150, 58, 40, 4, 'quadrilateral')}${miniPoly(245, 58, 40, 5, 'pentagon')}</svg>`; }
function coordPlane(R, pts, opts) {
  opts = opts || {}; const S = 210, pad = 18, c = S / 2, u = (c - pad) / R;
  const X = v => +(c + v * u).toFixed(1), Y = v => +(c - v * u).toFixed(1);
  let g = `<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--brand)"/></marker></defs>`;
  for (let i = -R; i <= R; i++) g += `<line class="fig-g" x1="${X(i)}" y1="${pad}" x2="${X(i)}" y2="${S - pad}"/><line class="fig-g" x1="${pad}" y1="${Y(i)}" x2="${S - pad}" y2="${Y(i)}"/>`;
  g += `<line class="fig-ax" x1="${pad}" y1="${c}" x2="${S - pad}" y2="${c}"/><line class="fig-ax" x1="${c}" y1="${pad}" x2="${c}" y2="${S - pad}"/>`;
  g += `<text class="fig-txt soft" x="${S - pad + 1}" y="${c + 13}">x</text><text class="fig-txt soft" x="${c + 5}" y="${pad}">y</text>`;
  (opts.arrows || []).forEach(a => { g += `<line class="fig-arr" x1="${X(a.x1)}" y1="${Y(a.y1)}" x2="${X(a.x2)}" y2="${Y(a.y2)}" marker-end="url(#ah)"/>`; });
  pts.forEach(p => { g += `<circle class="fig-pt${p.hollow ? ' hollow' : ''}" cx="${X(p.x)}" cy="${Y(p.y)}" r="4.5"/>`; if (p.label) g += `<text class="fig-txt" x="${X(p.x) + 7}" y="${Y(p.y) - 6}">${p.label}</text>`; });
  return `<svg class="viz" viewBox="0 0 ${S} ${S}" width="215" height="215" role="img" aria-label="coordinate grid">${g}</svg>`;
}
function rightTri(aL, bL, cL) {
  const W = 230, H = 175, ox = 36, oy = 142, aw = 150, bh = 100;
  let g = `<polygon class="fig-shape" points="${ox},${oy} ${ox + aw},${oy} ${ox},${oy - bh}"/>`;
  g += `<path class="fig-ra" d="M${ox + 14},${oy} L${ox + 14},${oy - 14} L${ox},${oy - 14}"/>`;
  g += `<text class="fig-txt" text-anchor="middle" x="${ox + aw / 2}" y="${oy + 18}">${aL}</text>`;
  g += `<text class="fig-txt" text-anchor="end" x="${ox - 6}" y="${oy - bh / 2 + 4}">${bL}</text>`;
  g += `<text class="fig-txt" text-anchor="start" x="${ox + aw / 2 + 6}" y="${oy - bh / 2 - 4}">${cL}</text>`;
  return `<svg class="viz" viewBox="0 0 ${W} ${H}" width="225" role="img" aria-label="right-angled triangle">${g}</svg>`;
}
function circleFig(label, kind) {
  const S = 170, c = S / 2, R = 58;
  let g = `<circle class="fig-shape" cx="${c}" cy="${c}" r="${R}"/><circle class="fig-pt" cx="${c}" cy="${c}" r="3"/>`;
  if (kind === 'd') g += `<line class="fig-line" x1="${c - R}" y1="${c}" x2="${c + R}" y2="${c}"/><text class="fig-txt" text-anchor="middle" x="${c}" y="${c - 7}">${label}</text>`;
  else g += `<line class="fig-line" x1="${c}" y1="${c}" x2="${c + R}" y2="${c}"/><text class="fig-txt" text-anchor="middle" x="${c + R / 2}" y="${c - 7}">${label}</text>`;
  return `<svg class="viz" viewBox="0 0 ${S} ${S}" width="165" role="img" aria-label="circle">${g}</svg>`;
}
const INTRO_FIG = {
  graphs: quadrantChart, angles: () => straightAngle(125), shapes: polyRow,
  transformations: () => coordPlane(6, [{ x: -3, y: 1, label: 'A' }, { x: 1, y: 1, label: "A'", hollow: true }], { arrows: [{ x1: -3, y1: 1, x2: 1, y2: 1 }] }),
  pythagoras: () => rightTri('a', 'b', 'c'), circles: () => circleFig('r', 'r')
};
const INTRO_CAP = {
  graphs: 'The axes split the plane into four quadrants. A point&rsquo;s signs (x, y) decide which one it lands in.',
  angles: 'Angles on a straight line always add to 180&deg;; angles around a point add to 360&deg;.',
  shapes: 'Polygons are named by their number of sides. Interior angles sum to (n &minus; 2) &times; 180&deg;.',
  transformations: 'A translation slides every point by the same amount &mdash; here (x, y) each shift right by 4.',
  pythagoras: 'In a right-angled triangle, a&sup2; + b&sup2; = c&sup2;, where c is the hypotenuse (opposite the right angle).',
  circles: 'r = radius, d = 2r. Circumference = 2&pi;r, Area = &pi;r&sup2;.'
};
const DYNAMIC_IDS = new Set(['graphs', 'angles', 'shapes', 'transformations', 'pythagoras', 'circles']);

// The 18 static topics' answers have no author-supplied `accept` array (unlike the 6 dynamic
// topics' generated questions), so mark-answer always showed a neutral "answered" state, never
// highlighting a wrong answer. Deriving accept=[strippedAnswer] from the already-authored `ans`
// field lets the same tolerant isCorrect()/normAns() matching (unit-stripping, numeric tolerance,
// comma/whitespace-insensitive) grade these too. ~97% of the 720 answers are a single clean value;
// a handful of multi-part answers (e.g. "$18 and $27") may occasionally mismatch on odd phrasing —
// the same trade-off the dynamic topics already accept.
function stripTags(html) { return String(html).replace(/<[^>]+>/g, '').trim(); }

// --- 2b. Visual models for the static topics the review found had none. Hand-authored, simple,
// reusing the same .fig-*/.viz classes the dynamic topics' generated figures already use, so they
// read as one consistent visual language rather than a bolted-on addition. ---

const STATIC_MODELS = {
  operations: `<div class="cap">Order of operations &mdash; same level: work left to right</div>
    <svg class="viz" viewBox="0 0 260 150" width="260" role="img" aria-label="BEDMAS priority order, brackets first">
      <rect class="fig-shape" x="10" y="8" width="240" height="26" rx="7"/><text class="fig-txt" x="130" y="26" text-anchor="middle">Brackets</text>
      <line class="fig-arr" x1="130" y1="34" x2="130" y2="44" marker-end="url(#dArrow)"/>
      <rect class="fig-shape" x="30" y="46" width="200" height="26" rx="7"/><text class="fig-txt" x="130" y="64" text-anchor="middle">Exponents</text>
      <line class="fig-arr" x1="130" y1="72" x2="130" y2="82" marker-end="url(#dArrow)"/>
      <rect class="fig-shape" x="50" y="84" width="160" height="26" rx="7"/><text class="fig-txt" x="130" y="102" text-anchor="middle">&times; and &divide;</text>
      <line class="fig-arr" x1="130" y1="110" x2="130" y2="120" marker-end="url(#dArrow)"/>
      <rect class="fig-shape" x="70" y="122" width="120" height="26" rx="7"/><text class="fig-txt" x="130" y="140" text-anchor="middle">+ and &minus;</text>
      <defs><marker id="dArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--ink-soft)"/></marker></defs>
    </svg>`,

  factors: `<div class="cap">Factor tree for 36</div>
    <svg class="viz" viewBox="0 0 220 170" width="220" role="img" aria-label="Factor tree showing 36 broken into prime factors 2, 2, 3, 3">
      <line class="fig-line" x1="110" y1="20" x2="60" y2="60"/><line class="fig-line" x1="110" y1="20" x2="160" y2="60"/>
      <line class="fig-line" x1="60" y1="70" x2="35" y2="110"/><line class="fig-line" x1="60" y1="70" x2="85" y2="110"/>
      <line class="fig-line" x1="160" y1="70" x2="135" y2="110"/><line class="fig-line" x1="160" y1="70" x2="185" y2="110"/>
      <circle class="fig-pt" cx="110" cy="20" r="16"/><text class="fig-txt" x="110" y="25" text-anchor="middle" style="fill:#fff">36</text>
      <circle class="fig-shape" cx="60" cy="65" r="15"/><text class="fig-txt" x="60" y="70" text-anchor="middle">6</text>
      <circle class="fig-shape" cx="160" cy="65" r="15"/><text class="fig-txt" x="160" y="70" text-anchor="middle">6</text>
      <circle class="fig-shape" cx="35" cy="120" r="14"/><text class="fig-txt" x="35" y="125" text-anchor="middle">2</text>
      <circle class="fig-shape" cx="85" cy="120" r="14"/><text class="fig-txt" x="85" y="125" text-anchor="middle">3</text>
      <circle class="fig-shape" cx="135" cy="120" r="14"/><text class="fig-txt" x="135" y="125" text-anchor="middle">2</text>
      <circle class="fig-shape" cx="185" cy="120" r="14"/><text class="fig-txt" x="185" y="125" text-anchor="middle">3</text>
      <text class="fig-txt soft" x="110" y="158" text-anchor="middle">36 = 2 &times; 2 &times; 3 &times; 3</text>
    </svg>`,

  percentages: `<div class="cap">25% of a hundred square</div>
    <svg class="viz" viewBox="0 0 210 210" width="180" role="img" aria-label="A ten by ten grid with 25 of the 100 small squares shaded">
      ${(() => { let g = ''; for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) { const shaded = r < 3 ? (r < 2 ? true : c < 5) : false; g += `<rect x="${c * 20 + 5}" y="${r * 20 + 5}" width="18" height="18" fill="${shaded ? 'var(--brand)' : 'none'}" stroke="var(--grid)"/>`; } return g; })()}
    </svg>
    <div class="pvexp">25 of 100 squares shaded = 25%</div>`,

  ratios: `<div class="cap">Ratio 2 : 3 as a bar model</div>
    <svg class="viz" viewBox="0 0 260 90" width="260" role="img" aria-label="A bar split into 2 blue parts and 3 gold parts, showing a 2 to 3 ratio">
      <rect x="10" y="10" width="52" height="34" fill="var(--brand)"/><rect x="62" y="10" width="52" height="34" fill="var(--brand)"/>
      <rect x="114" y="10" width="52" height="34" fill="var(--marigold)"/><rect x="166" y="10" width="52" height="34" fill="var(--marigold)"/><rect x="218" y="10" width="32" height="34" fill="var(--marigold)"/>
      <text class="fig-txt soft" x="10" y="66" text-anchor="start">2 parts</text><text class="fig-txt soft" x="250" y="66" text-anchor="end">3 parts</text>
    </svg>`,

  powers: `<div class="cap">2&sup3; as repeated multiplication</div>
    <svg class="viz" viewBox="0 0 260 70" width="260" role="img" aria-label="2 cubed shown as 2 times 2 times 2 equals 8">
      <rect class="fig-shape" x="10" y="10" width="40" height="40" rx="8"/><text class="fig-txt" x="30" y="35" text-anchor="middle">2</text>
      <text class="fig-txt soft" x="60" y="35" text-anchor="middle">&times;</text>
      <rect class="fig-shape" x="72" y="10" width="40" height="40" rx="8"/><text class="fig-txt" x="92" y="35" text-anchor="middle">2</text>
      <text class="fig-txt soft" x="122" y="35" text-anchor="middle">&times;</text>
      <rect class="fig-shape" x="134" y="10" width="40" height="40" rx="8"/><text class="fig-txt" x="154" y="35" text-anchor="middle">2</text>
      <text class="fig-txt soft" x="192" y="35" text-anchor="middle">=</text>
      <rect x="206" y="10" width="46" height="40" rx="8" fill="var(--easy-bg)" stroke="var(--easy)"/><text class="fig-txt" x="229" y="35" text-anchor="middle" style="fill:var(--easy)">8</text>
    </svg>`,

  patterns: `<div class="cap">Position &rarr; term, common difference +4</div>
    <svg class="viz" viewBox="0 0 260 90" width="260" role="img" aria-label="Table of sequence positions 1 to 4 against terms 3, 7, 11, 15 with a plus 4 arrow between each">
      ${[3, 7, 11, 15].map((v, i) => `<rect class="fig-shape" x="${10 + i * 62}" y="30" width="46" height="34" rx="6"/><text class="fig-txt" x="${33 + i * 62}" y="52" text-anchor="middle">${v}</text><text class="fig-txt soft" x="${33 + i * 62}" y="20" text-anchor="middle">n=${i + 1}</text>`).join('')}
      ${[0, 1, 2].map(i => `<text class="fig-txt ang" x="${68 + i * 62}" y="52" text-anchor="middle">+4</text>`).join('')}
    </svg>`,

  expressions: `<div class="cap">Algebra tiles for 3x + 2</div>
    <svg class="viz" viewBox="0 0 270 70" width="270" role="img" aria-label="Three long x tiles and two small unit tiles representing the expression 3x plus 2">
      ${[0, 1, 2].map(i => `<rect class="fig-shape" x="${10 + i * 46}" y="10" width="38" height="18" rx="4"/><text class="fig-txt" x="${29 + i * 46}" y="24" text-anchor="middle" style="font-size:11px">x</text>`).join('')}
      ${[0, 1].map(i => `<rect class="fig-shape" x="${152 + i * 26}" y="10" width="18" height="18" rx="4"/><text class="fig-txt" x="${161 + i * 26}" y="24" text-anchor="middle" style="font-size:11px">1</text>`).join('')}
      <text class="fig-txt soft" x="135" y="52" text-anchor="middle">3 lots of x, plus 2 units = 3x + 2</text>
    </svg>`,

  equations: `<div class="cap">A balance scale: x + 4 = 10</div>
    <svg class="viz" viewBox="0 0 240 145" width="240" role="img" aria-label="A balance scale, level, with x plus 4 on the left pan and 10 on the right pan">
      <line class="fig-ax" x1="120" y1="20" x2="120" y2="55"/>
      <line class="fig-line" x1="30" y1="55" x2="210" y2="55"/>
      <line class="fig-line" x1="45" y1="55" x2="45" y2="80"/><line class="fig-line" x1="20" y1="80" x2="70" y2="80"/>
      <line class="fig-line" x1="195" y1="55" x2="195" y2="80"/><line class="fig-line" x1="170" y1="80" x2="220" y2="80"/>
      <circle class="fig-pt" cx="120" cy="18" r="4"/>
      <text class="fig-txt" x="45" y="100" text-anchor="middle">x + 4</text>
      <text class="fig-txt" x="195" y="100" text-anchor="middle">10</text>
      <text class="fig-txt soft" x="120" y="118" text-anchor="middle" style="font-size:11px">Balanced: whatever you do</text>
      <text class="fig-txt soft" x="120" y="132" text-anchor="middle" style="font-size:11px">to one side, do to the other</text>
    </svg>`,

  inequalities: `<div class="cap">x &gt; 4 on a number line</div>
    <svg class="viz" viewBox="0 0 260 60" width="260" role="img" aria-label="Number line from 1 to 7 with an open circle at 4 and the line shaded to the right, showing x greater than 4">
      <line class="fig-ax" x1="15" y1="30" x2="245" y2="30"/>
      ${[1, 2, 3, 4, 5, 6, 7].map((n, i) => `<line class="fig-g" x1="${15 + i * 38}" y1="25" x2="${15 + i * 38}" y2="35"/><text class="fig-txt soft" x="${15 + i * 38}" y="48" text-anchor="middle" style="font-size:10px">${n}</text>`).join('')}
      <line class="fig-line" x1="${15 + 3 * 38}" y1="30" x2="245" y2="30" style="stroke-width:4"/>
      <circle cx="${15 + 3 * 38}" cy="30" r="6" fill="var(--paper)" stroke="var(--brand)" stroke-width="2.5"/>
      <line class="fig-arr" x1="230" y1="30" x2="245" y2="30" marker-end="url(#iArrow)"/>
      <defs><marker id="iArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--brand)"/></marker></defs>
    </svg>`,

  volume: `<div class="cap">2 &times; 3 &times; 2 cuboid, built layer by layer</div>
    <svg class="viz" viewBox="0 0 200 150" width="200" role="img" aria-label="Two layers of a 3 by 2 grid of unit cubes stacked to show volume">
      ${[0, 1].map(layer => Array.from({ length: 6 }, (_, i) => { const c = i % 3, r = Math.floor(i / 3); const ox = 30 + c * 34 - layer * 6; const oy = 90 - r * 30 - layer * 34; return `<rect x="${ox}" y="${oy}" width="30" height="26" fill="rgba(59,76,168,.12)" stroke="var(--brand)"/>`; }).join('')).join('')}
      <text class="fig-txt soft" x="100" y="130" text-anchor="middle">2 layers of 3&times;2</text>
      <text class="fig-txt soft" x="100" y="144" text-anchor="middle">= 12 unit cubes</text>
    </svg>`,

  conversions: `<div class="cap">Metric ladder &mdash; each step is &times;10</div>
    <svg class="viz" viewBox="0 0 260 70" width="260" role="img" aria-label="km to m to cm to mm, each connected by a times 10 arrow">
      ${['km', 'm', 'cm', 'mm'].map((u, i) => `<rect class="fig-shape" x="${10 + i * 62}" y="15" width="46" height="30" rx="7"/><text class="fig-txt" x="${33 + i * 62}" y="35" text-anchor="middle">${u}</text>`).join('')}
      ${[0, 1, 2].map(i => `<line class="fig-arr" x1="${58 + i * 62}" y1="30" x2="${68 + i * 62}" y2="30" marker-end="url(#cArrow)"/><text class="fig-txt soft" x="${63 + i * 62}" y="18" text-anchor="middle" style="font-size:10px">&times;10</text>`).join('')}
      <defs><marker id="cArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="var(--ink-soft)"/></marker></defs>
    </svg>`,

  statistics: `<div class="cap">Dot plot for 2, 3, 3, 10 &mdash; the 10 pulls the mean up</div>
    <svg class="viz" viewBox="0 0 260 70" width="260" role="img" aria-label="Dot plot showing values 2, 3, 3 and 10 on a number line, with the mean marked between 4 and 5">
      <line class="fig-ax" x1="15" y1="45" x2="245" y2="45"/>
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => `<line class="fig-g" x1="${15 + i * 23}" y1="40" x2="${15 + i * 23}" y2="50"/>`).join('')}
      <circle class="fig-pt" cx="${15 + 1 * 23}" cy="35" r="5"/>
      <circle class="fig-pt" cx="${15 + 2 * 23}" cy="35" r="5"/><circle class="fig-pt" cx="${15 + 2 * 23}" cy="23" r="5"/>
      <circle class="fig-pt" cx="${15 + 9 * 23}" cy="35" r="5"/>
      <text class="fig-txt ang" x="${15 + 3.5 * 23}" y="62" text-anchor="middle" style="font-size:10.5px">mean = 4.5</text>
    </svg>`,

  probability: `<div class="cap">Sample space for two coin tosses</div>
    <svg class="viz" viewBox="-15 0 205 190" width="205" role="img" aria-label="A two by two grid showing the four equally likely outcomes HH, HT, TH, TT for tossing two coins">
      <line class="fig-ax" x1="55" y1="20" x2="55" y2="170"/><line class="fig-ax" x1="55" y1="20" x2="180" y2="20"/>
      <text class="fig-txt soft" x="90" y="12" text-anchor="middle">coin 2</text><text class="fig-txt soft" x="15" y="98" text-anchor="middle">coin 1</text>
      <text class="fig-txt" x="90" y="33" text-anchor="middle">H</text><text class="fig-txt" x="150" y="33" text-anchor="middle">T</text>
      <text class="fig-txt" x="40" y="65" text-anchor="middle">H</text><text class="fig-txt" x="40" y="140" text-anchor="middle">T</text>
      <rect class="fig-shape" x="60" y="45" width="60" height="40"/><text class="fig-txt" x="90" y="70" text-anchor="middle">HH</text>
      <rect class="fig-shape" x="120" y="45" width="60" height="40"/><text class="fig-txt" x="150" y="70" text-anchor="middle">HT</text>
      <rect class="fig-shape" x="60" y="120" width="60" height="40"/><text class="fig-txt" x="90" y="145" text-anchor="middle">TH</text>
      <rect class="fig-shape" x="120" y="120" width="60" height="40"/><text class="fig-txt" x="150" y="145" text-anchor="middle">TT</text>
    </svg>`
};

// --- 2c. Content fixes from the educational review — see the review report for the reasoning
// behind each change. Applied as a patch over the loaded data rather than editing the archived
// source file, so every change here is visible, versioned and reversible in one place. ---

function applyContentFixes(CURRICULUM, CH) {
  const byId = {};
  CURRICULUM.forEach((g) => g.topics.forEach((t) => { byId[t.id] = t; }));

  // Decimals: fix #1 — an ordering question listed 3 numbers but two were identical (0.7 and 0.7),
  // so the answer key silently dropped one. Made the third value genuinely distinct. Both the
  // question and its answer wrap all three numbers in a single <span class="m">, so patch that
  // whole run of text rather than each number separately.
  const dec = byId.decimals;
  const dupQ = dec.easy.find((e) => e.q.includes('0.7, 0.67, 0.7'));
  if (dupQ) {
    dupQ.q = dupQ.q.replace('0.7, 0.67, 0.7', '0.7, 0.67, 0.72');
    dupQ.steps = dupQ.steps.map((s) => s.replace('0.67, 0.7', '0.67, 0.7, 0.72'));
    dupQ.ans = dupQ.ans.replace('0.67, 0.7', '0.67, 0.7, 0.72');
  }
  // Decimals: fix #2 — "Round 12.45 to 1 decimal place" was answered 12.4, contradicting the
  // notebook's own "5 or more rounds up" rule (12.45 rounds to 12.5). Corrected the answer key.
  const roundQ = dec.easy.find((e) => e.q.includes('12.45'));
  if (roundQ) {
    roundQ.steps = roundQ.steps.map((s) => s.replace('12.4', '12.5'));
    roundQ.ans = roundQ.ans.replace('12.4', '12.5');
  }

  // Fractions: the review found no misconception check for dividing fractions (only addition is
  // covered), and no mixed-number question anywhere in the bank. Extend the Watch Out with the
  // division error, and swap the least-distinctive Hard question for a mixed-number one.
  const frac = byId.fractions;
  frac.watchout += ' And when dividing, flip the second fraction before multiplying — dividing straight across gives the wrong answer.';
  // The Hard tier's final question (1/2 + 1/3 + 1/6, using nested .frac/.n/.d spans rather than
  // plain "1/2" text) is the least distinctive of the 10 — replace it with a mixed-number question,
  // since the review found none anywhere in this chapter despite mixed numbers being common in
  // real assessments. Keeps the tier at exactly 10 questions.
  const mixedFrac = (n, d) => `<span class="frac"><span class="n">${n}</span><span class="d">${d}</span></span>`;
  frac.hard[frac.hard.length - 1] = {
    q: `Work out 1&frac12; + ${mixedFrac(2, 3)} (a mixed number plus a fraction).`,
    steps: [
      `Convert 1&frac12; to an improper fraction: ${mixedFrac(3, 2)}.`,
      `Common denominator of 2 and 3 is 6: ${mixedFrac(3, 2)} = ${mixedFrac(9, 6)}, ${mixedFrac(2, 3)} = ${mixedFrac(4, 6)}.`,
      `Add: ${mixedFrac(9, 6)} + ${mixedFrac(4, 6)} = ${mixedFrac(13, 6)} = 2${mixedFrac(1, 6)}.`
    ],
    ans: `2${mixedFrac(1, 6)}`
  };

  // Probability: "sample space" is used in the Lesson prose but was never added to Vocabulary, and
  // the AND/OR combination rule used in the Hard-tier dice questions was only ever demonstrated
  // through worked steps, never stated as an explicit rule.
  const prob = CH.probability;
  if (prob && prob.vocab && !prob.vocab.some((v) => v[0] === 'sample space')) {
    prob.vocab.push(['sample space', 'the full list of equally likely outcomes for an experiment']);
  }
  if (prob) {
    prob.summary = prob.summary || [];
    if (!prob.summary.some((s) => s.includes('AND') || s.includes('OR'))) {
      prob.summary.push('For combined events: AND means multiply the probabilities, OR means add them');
    }
  }

  // Pythagoras: tell the learner directly that the numbers refresh on reset — a genuine strength
  // (prevents rote memorisation) the chapter never actually told the student about.
  const pyth = CH.pythagoras;
  if (pyth && pyth.hook && !pyth.hook.includes('fresh numbers')) {
    pyth.hook += ' (Reset your progress any time for a fresh set of numbers to practise on.)';
  }

  // Perimeter & Area: the original grid-diagram's caption sat only 4px below the grid's bottom edge
  // (viewBox height 90, grid ends at y=82, caption baseline at y=86) — the caption's own text visibly
  // overlapped the bottom row of the grid. Give it real clearance below the grid instead.
  const pa = byId['perimeter-area'];
  if (pa && pa.model && pa.model.includes('viewBox="0 0 170 90"')) {
    pa.model = pa.model.replace('viewBox="0 0 170 90"', 'viewBox="0 0 170 100"').replace('<text x="85" y="86"', '<text x="85" y="96"');
  }
}

// --- 3. Shared page shell ---

function pageShell({ title, active, bodyHtml, root, extraScripts }) {
  root = root || '';
  extraScripts = extraScripts || [];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} &middot; The Maths Notebook</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Nunito:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${root}css/styles.css">
<script>window.SITE_ROOT=${JSON.stringify(root)};${active ? `window.CURRENT_TOPIC_ID=${JSON.stringify(active)};` : ''}</script>
</head>
<body>
<div class="wrap">
  <header class="topbar">
    <a class="brandmark" href="${root}index.html">
      <div class="glyph">&#8721;</div>
      <div><h1>The Maths Notebook</h1><p>Years 6 &ndash; 8 &middot; NZ</p></div>
    </a>
    <nav class="topnav" id="nav"></nav>
    <button class="navtoggle" id="navtoggle" aria-label="Open menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
  </header>
  <main class="main">
    <div class="inner">
${bodyHtml}
    </div>
  </main>
</div>
<script src="${root}js/toc-data.js"></script>
<script src="${root}js/progress-store.js"></script>
<script src="${root}js/nav.js"></script>
${extraScripts.map(s => `<script src="${root}${s}"></script>`).join('\n')}
</body>
</html>
`;
}

// --- 4. Chapter (topic) page body, mirroring the original sectionInner() ---

function renderChapterBody(t, group, prev, next) {
  const c = t.__ch || {};
  const dynamic = DYNAMIC_IDS.has(t.id);
  const staticCheck = {};
  const lessonHtml = t.lesson || `<p>${t.idea}</p>`;

  const road = [];
  const addRoad = (key, label, show) => { if (show) road.push(`<button class="hf-jump" type="button" data-target="${key}"><span class="dot"></span><span>${label}</span></button>`); };
  const intro = INTRO_FIG[t.id] ? `<figure class="figwrap intro">${INTRO_FIG[t.id]()}<figcaption class="figcap">${INTRO_CAP[t.id] || ''}</figcaption></figure>` : '';
  const model = t.model || STATIC_MODELS[t.id] || '';
  addRoad('goals', 'Goals', c.goals);
  addRoad('discovery', 'Discover', c.discovery);
  addRoad('vocab', 'Vocabulary', c.vocab);
  addRoad('explain', 'Explanation', true);
  addRoad('visual', 'Visual model', intro || model);
  addRoad('examples', 'Examples', true);
  addRoad('practice', 'Practice', true);
  addRoad('assignment', 'Assignment', true);
  addRoad('retrieval', 'Retrieval', c.retrieval);
  const roadmap = road.length ? `<div class="hf-roadmap" aria-label="Chapter sections">${road.join('')}</div>` : '';
  const visualParts = [intro, model ? `<div class="model">${model}</div>` : ''].filter(Boolean).join('');

  const S = [];
  if (c.hook) S.push(`<div class="hf-hook"><span class="hf-spark">&#10022;</span><span>${c.hook}</span></div>`);
  if (roadmap) S.push(roadmap);
  if (c.goals) S.push(`<section class="hf-sec goals" data-section="goals"><div class="hf-tag">&#127919; By the end you can</div><ul class="hf-goals">${c.goals.map(g => `<li>${g}</li>`).join('')}</ul></section>`);
  if (c.prereq) S.push(`<section class="hf-sec prereq" data-section="prereq"><div class="hf-tag">&#9989; Before you start</div><ul class="hf-list">${c.prereq.map(p => `<li>${p}</li>`).join('')}</ul></section>`);
  if (c.discovery) S.push(`<section class="hf-sec discovery" data-section="discovery"><div class="hf-tag">&#128302; Discover &mdash; predict first</div><p>${c.discovery.prompt}</p><button class="hf-reveal">Reveal</button><div class="hf-hidden"><p>${c.discovery.answer}</p></div></section>`);
  // Vocabulary now renders BEFORE the explanation: new terms used in the Lesson prose are defined
  // here first, instead of a strictly-linear reader meeting the word before its formal definition.
  if (c.vocab) S.push(`<section class="hf-sec vocab" data-section="vocab"><div class="hf-tag">&#128218; Key words</div><dl class="hf-vocab">${c.vocab.map(v => `<div class="vrow"><dt>${v[0]}</dt><dd>${v[1]}</dd></div>`).join('')}</dl></section>`);
  S.push(`<section class="hf-sec explain" data-section="explain"><div class="hf-tag">&#128214; Read the chapter</div><p class="hf-sub">${t.idea}</p><div class="lesson">${lessonHtml}</div>${t.why ? `<div class="why">${t.why}</div>` : ''}${t.watchout ? `<div class="watchout"><span class="wtag">&#9888; Watch out</span>${t.watchout}</div>` : ''}</section>`);
  if (visualParts) S.push(`<section class="hf-sec visual" data-section="visual"><div class="hf-tag">&#128202; Visual model</div><p class="hf-sub">Use the diagram before calculating. The visual should make the structure easier to see.</p>${visualParts}</section>`);

  if (dynamic) {
    S.push(`<section class="hf-sec worked" data-section="examples"><div class="hf-tag">&#9998; Worked examples across scenarios</div><p class="hf-sub">Read these like a teacher modelling the method: one basic case, one mixed case, and one harder transfer case.</p><div id="dyn-worked">Loading&hellip;</div></section>`);
    S.push(`<section class="hf-sec practice" data-section="practice"><div class="hf-tag">&#9997;&#65039; Guided and independent practice</div><p class="hf-sub">Work up through Easy &rarr; Medium &rarr; Hard. Type an answer and press Mark; the full solution unlocks after each attempt.</p><div class="tabs" id="dyn-tabs"></div><div id="dyn-panes"></div></section>`);
    S.push(`<section class="hf-sec assignment" data-section="assignment"><div class="hf-tag">&#128221; Assignment work</div><p class="hf-sub">Do these on paper after the guided practice. They mix fluency, reasoning, application, challenge and reflection question types.</p><div class="assignment-grid" id="dyn-assignment"></div><div class="assignment-part"><h4>Part D - Explain and create</h4><ul><li>Write a short paragraph explaining the main idea of ${t.name} in your own words.</li><li>Create one new ${t.name} question, solve it, and show the checking step.</li><li>Describe one mistake a student might make and how to fix it.</li></ul></div></section>`);
  } else {
    const LEVELS = [['Easy', 'easy'], ['Medium', 'medium'], ['Hard', 'hard']];
    const tabs = LEVELS.map(([lbl, key], i) => `<button class="tab ${i === 0 ? 'on' : ''}" data-lv="${lbl}">${lbl}<span class="n">${(t[key] || []).length}</span></button>`).join('');
    const panes = LEVELS.map(([lbl, key], i) => {
      const cards = (t[key] || []).map((e, idx) => {
        const kkey = `${t.id}|${key}|${idx}`;
        staticCheck[kkey] = [stripTags(e.ans)];
        return `<div class="ex" data-key="${kkey}" data-tid="${t.id}">
          <div class="ex-top"><span class="num">${idx + 1}</span><div class="q">${e.q}</div></div>
          ${e.fig ? `<div class="figwrap">${e.fig}</div>` : ''}
          <div class="attempt">
            <input class="ans-input" type="text" placeholder="Write your answer here&hellip;" aria-label="Your answer">
            <button class="markbtn">&#10003; Mark answer</button>
            <button class="reveal locked">&#128274; Show solution</button>
          </div>
          <div class="sol">
            <div class="your-answer"><span class="lbl">Your answer</span><span class="txt"></span></div>
            <div class="lead">Approach</div>
            <p class="approach">${t.approach}</p>
            <div class="lead">Working, step by step</div>
            <ol class="steps">${e.steps.map(st => `<li>${st}</li>`).join('')}</ol>
            <div class="answer"><span class="tag">Answer</span><span class="val">${e.ans}</span></div>
            <div class="checktip"><b>Check it:</b> ${t.check}</div>
          </div>
        </div>`;
      }).join('');
      return `<div class="pane ${i === 0 ? 'on' : ''}" data-lv="${lbl}">${cards}</div>`;
    }).join('');
    const workedSamples = [['Easy', 'Core skill', (t.easy || [])[0]], ['Medium', 'Mixed method', (t.medium || [])[0]], ['Hard', 'Challenge scenario', (t.hard || [])[0]]].filter(x => x[2]);
    if (workedSamples.length) {
      S.push(`<section class="hf-sec worked" data-section="examples"><div class="hf-tag">&#9998; Worked examples across scenarios</div>
        <p class="hf-sub">Read these like a teacher modelling the method: one basic case, one mixed case, and one harder transfer case.</p>
        <div class="example-grid">${workedSamples.map(([lv, label, e]) => `<article class="we-card ${lv.toLowerCase()}">
          <div class="we-card-head"><span class="level">${lv}</span><span>${label}</span></div>
          <div class="we-q">${e.q}</div>${e.fig ? `<div class="figwrap">${e.fig}</div>` : ''}
          <ol class="steps">${e.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          <div class="answer"><span class="tag">Answer</span><span class="val">${e.ans}</span></div>
        </article>`).join('')}</div></section>`);
    }
    S.push(`<section class="hf-sec practice" data-section="practice"><div class="hf-tag">&#9997;&#65039; Guided and independent practice</div><p class="hf-sub">Work up through Easy &rarr; Medium &rarr; Hard. Type an answer and press Mark; the full solution unlocks after each attempt.</p><div class="tabs">${tabs}</div>${panes}</section>`);
    const assignmentItems = (items, start, count) => (items || []).slice(start, start + count).map(e => `<li>${e.q}</li>`).join('');
    const part = (title, items, type = 'ol') => items ? `<div class="assignment-part"><h4>${title}</h4><${type}>${items}</${type}></div>` : '';
    S.push(`<section class="hf-sec assignment" data-section="assignment"><div class="hf-tag">&#128221; Assignment work</div>
      <p class="hf-sub">Do these on paper after the guided practice. They mix fluency, reasoning, application, challenge and reflection question types.</p>
      <div class="assignment-grid">${[
        part('Part A - Fluency', assignmentItems(t.easy, 1, 4)),
        part('Part B - Method and reasoning', assignmentItems(t.medium, 1, 3)),
        part('Part C - Application and challenge', assignmentItems(t.hard, 1, 3)),
        part('Part D - Explain and create', `<li>Write a short paragraph explaining the main idea of ${t.name} in your own words.</li><li>Create one new ${t.name} question, solve it, and show the checking step.</li><li>Describe one mistake a student might make and how to fix it.</li>`, 'ul')
      ].join('')}</div></section>`);
  }

  if (c.mistake) S.push(`<section class="hf-sec mistake" data-section="misconception"><div class="hf-tag">&#128373;&#65039; Mistake detective</div><p class="hf-sub">Diagnose the misconception, then reveal the cause and intervention.</p><div class="mis-q">${c.mistake.wrong}</div><button class="hf-reveal">Reveal diagnosis</button><div class="hf-hidden"><div class="mis-grid"><div class="mis-item"><span>Cause</span><p>${c.mistake.error}</p></div><div class="mis-item"><span>Diagnostic question</span><p>What rule or representation would show why this answer cannot be right?</p></div><div class="mis-item"><span>Intervention</span><p>${c.mistake.fix}</p></div></div></div></section>`);
  if (c.realworld) S.push(`<section class="hf-sec realworld" data-section="realworld"><div class="hf-tag">&#127757; In the real world</div><p>${c.realworld}</p></section>`);
  if (c.reflect) S.push(`<section class="hf-sec reflect" data-section="reflect"><div class="hf-tag">&#129504; Reflect</div><ul class="hf-check">${c.reflect.map(r => `<li><label><input type="checkbox"> <span>${r}</span></label></li>`).join('')}</ul></section>`);
  if (c.retrieval) S.push(`<section class="hf-sec retrieval" data-section="retrieval"><div class="hf-tag">&#9889; Quick recall</div><p class="hf-sub">Answer in your head, then reveal.</p><ol class="hf-retr">${c.retrieval.map(qa => `<li><span class="rq">${qa[0]}</span> <button class="hf-reveal mini">Show</button><span class="hf-hidden ra">${qa[1]}</span></li>`).join('')}</ol></section>`);
  if (c.summary) S.push(`<section class="hf-sec summary" data-section="summary"><div class="hf-tag">&#127793; In a nutshell</div><ul class="hf-sum">${c.summary.map(s => `<li>${s}</li>`).join('')}</ul></section>`);
  S.push(`<div class="hf-next">${prev ? `<a class="hf-navlink prev" href="${prev.id}.html"><span class="dir">&larr; Previous</span><span class="nm">${prev.name}</span></a>` : '<span></span>'}${next ? `<a class="hf-navlink next" href="${next.id}.html"><span class="dir">Next &rarr;</span><span class="nm">${next.name}</span></a>` : '<span></span>'}</div>`);

  const practiceCount = (t.easy || []).length + (t.medium || []).length + (t.hard || []).length;
  const chapterStats = `<div class="chapter-meta">
    <div class="chapter-stat"><b>Chapter flow</b>Discover, explain, practise, reflect</div>
    <div class="chapter-stat"><b>3 worked scenarios</b>Easy, medium and hard methods</div>
    <div class="chapter-stat"><b>${practiceCount || 30} interactive questions</b>Guided to independent practice</div>
    <div class="chapter-stat"><b>Assignment set</b>Fluency, reasoning, application</div>
  </div>`;

  const html = `<section class="topic" id="${t.id}" style="--tcol:${group.color}">
  <div class="topic-head">
    <span class="topic-strand">${group.strand}</span>
    <div class="topic-titles"><h3>${t.name}</h3><span class="year">${t.year}</span></div>
    <span class="topic-prog" data-tid="${t.id}">0 / 30</span>
    <button class="bookmark-btn" type="button">&#9734; Bookmark this chapter</button>
  </div>
  ${chapterStats}
  ${S.join('\n  ')}
</section>`;
  return { html, checkMap: staticCheck };
}

// --- 5. Cover / Contents / About pages ---

function renderCoverPage() {
  return `<div class="cover">
  <div class="glyph-big">&#8721;</div>
  <p class="tag">Years 6&ndash;8 &middot; NZ Curriculum</p>
  <h1>Understand the <mark>why</mark>, then master the <mark>how</mark>.</h1>
  <p>A digital mathematics book covering the New Zealand Years 6&ndash;8 curriculum: 24 chapters across
  Number, Algebra, Geometry, Measurement, and Statistics &amp; Probability &mdash; each with a full
  explanation, worked examples, guided practice, and quick revision.</p>
  <div class="cover-actions">
    <a class="btn primary" href="contents.html">Start Reading</a>
    <a class="btn" href="practice.html">Practice Book</a>
    <a class="btn" href="progress.html">My Progress</a>
  </div>
  <div class="cover-links">
    <a href="contents.html">Table of Contents</a>
    <a href="about.html">About this book</a>
  </div>
</div>`;
}

function renderContentsPage(strands) {
  const groups = strands.map((g) => `<div class="toc-strand" style="--strand:${g.color}">
    <h3>${g.strand}</h3>
    <div class="toc-grid">${g.topics.map((t, i) => `<a class="toc-card" href="topics/${t.id}.html" data-tid="${t.id}" data-search="${(t.name + ' ' + t.idea).toLowerCase()}">
        <span class="toc-num">${i + 1}</span>
        <span><span class="toc-name">${t.name}</span><br><span class="toc-year">${t.year}</span></span>
      </a>`).join('')}</div>
  </div>`).join('\n');
  return `<h1 style="font-family:'Bricolage Grotesque';font-size:28px;margin:0 0 4px">Table of Contents</h1>
<p class="hero p" style="margin-bottom:14px">24 chapters, grouped by strand. A solid number means every question in that chapter has been answered.</p>
<div class="toc-search">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
  <input id="toc-search-input" type="text" placeholder="Search a topic&hellip;" aria-label="Search topics">
</div>
${groups}
<p class="muted" id="toc-empty" style="display:none;color:var(--ink-soft)">No topics match that search.</p>
<script>
(function(){
  if(window.ProgressStore){
    document.querySelectorAll('.toc-card').forEach(function(a){
      var n = window.ProgressStore.topicAnsweredCount(a.dataset.tid);
      a.classList.toggle('done', n >= window.ProgressStore.QUESTIONS_PER_TOPIC);
    });
  }
  var input = document.getElementById('toc-search-input');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.toc-card'));
  var strandsEl = Array.prototype.slice.call(document.querySelectorAll('.toc-strand'));
  input.addEventListener('input', function(){
    var q = input.value.trim().toLowerCase();
    var anyVisible = false;
    cards.forEach(function(c){
      var show = !q || c.dataset.search.indexOf(q) !== -1;
      c.style.display = show ? '' : 'none';
      if (show) anyVisible = true;
    });
    strandsEl.forEach(function(g){
      var any = Array.prototype.some.call(g.querySelectorAll('.toc-card'), function(c){ return c.style.display !== 'none'; });
      g.style.display = any ? '' : 'none';
    });
    document.getElementById('toc-empty').style.display = anyVisible ? 'none' : 'block';
  });
})();
</script>`;
}

function renderAboutPage() {
  return `<h1 style="font-family:'Bricolage Grotesque';font-size:28px;margin:0 0 14px">About The Maths Notebook</h1>
<div class="lesson" style="max-width:70ch">
  <p>The Maths Notebook is an interactive mathematics book covering the New Zealand Years 6&ndash;8
  mathematics curriculum. It is designed to help students understand mathematical concepts through
  simple explanations, worked examples, visual models, and interactive practice &mdash; concept-first,
  not just answers.</p>
  <p><b>Topics covered:</b> Whole Numbers, Fractions, Decimals, Percentages, Ratios and Proportions,
  Integers, Algebra, Equations, Geometry, Measurement, Statistics and Probability &mdash; 24 chapters
  in total, each with a full worked-example bank of 30 practice questions.</p>
  <p><b>How each chapter works:</b> a hook to spark curiosity, learning goals, a predict-first discovery
  prompt, the full explanation, key vocabulary, a visual model, worked examples across Easy/Medium/Hard,
  guided and independent practice with instant marking, an assignment set, a common-mistake diagnosis,
  a real-world connection, a reflection checklist, and quick-recall retrieval questions.</p>
  <p><b>Technology:</b> plain HTML5, CSS3 and modern JavaScript &mdash; no frameworks, no backend, no
  build step. Progress is saved only in your browser's local storage on this device.</p>
  <p><i>&ldquo;Understanding mathematics should feel rewarding, not intimidating.&rdquo;</i></p>
</div>`;
}

// --- 6. Build ---

function run() {
  const { CURRICULUM, CH, ORDER } = loadData();
  applyContentFixes(CURRICULUM, CH);
  const ORDER_IDX = {}; ORDER.forEach((o, i) => (ORDER_IDX[o.id] = i));

  fs.mkdirSync(TOPICS_DIR, { recursive: true });

  const tocStrands = [];
  let count = 0;

  for (const group of CURRICULUM) {
    const tocGroup = { strand: group.strand, color: group.color, topics: [] };
    for (const t of group.topics) {
      t.__ch = CH[t.id] || {};
      const idx = ORDER_IDX[t.id];
      const prev = idx > 0 ? ORDER[idx - 1] : null;
      const next = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;
      const { html: body, checkMap } = renderChapterBody(t, group, prev, next);
      const scripts = DYNAMIC_IDS.has(t.id)
        ? ['js/quiz-engine.js', 'js/topic-interactions.js']
        : ['js/topic-interactions.js'];
      const html = pageShell({ title: t.name, active: t.id, root: '../', bodyHtml: body, extraScripts: scripts });
      // Static topics' answers get an accept[] derived from their authored `ans` text (see
      // stripTags/staticCheck above), merged into the same window.TOPIC_CHECK the dynamic topics'
      // quiz-engine.js populates, so mark-answer highlights correct/wrong everywhere, not just on
      // the 6 generator topics.
      let finalHtml = html.replace('</body>', `<script>window.TOPIC_CHECK=Object.assign(window.TOPIC_CHECK||{}, ${JSON.stringify(checkMap)});</script>\n</body>`);
      if (DYNAMIC_IDS.has(t.id)) {
        finalHtml = finalHtml.replace('</body>', `<script>window.QuizEngine && window.QuizEngine.renderDynamicTopic(${JSON.stringify(t.id)}, ${JSON.stringify(t.approach)}, ${JSON.stringify(t.check)});</script>\n</body>`);
      }
      fs.writeFileSync(path.join(TOPICS_DIR, `${t.id}.html`), finalHtml, 'utf-8');
      tocGroup.topics.push({ id: t.id, name: t.name, year: t.year, idea: t.idea.replace(/<[^>]+>/g, '') });
      count++;
    }
    tocStrands.push(tocGroup);
  }

  const tocJs = `/* js/toc-data.js — generated by tools/generate-book.mjs. Do not edit by hand. */\nwindow.TOC_STRANDS = ${JSON.stringify(tocStrands, null, 2)};\n`;
  fs.writeFileSync(path.join(ROOT, 'js', 'toc-data.js'), tocJs, 'utf-8');

  fs.writeFileSync(path.join(ROOT, 'index.html'),
    pageShell({ title: 'Cover', root: '', bodyHtml: renderCoverPage() }), 'utf-8');
  fs.writeFileSync(path.join(ROOT, 'contents.html'),
    pageShell({ title: 'Contents', root: '', bodyHtml: renderContentsPage(tocStrands) }), 'utf-8');
  fs.writeFileSync(path.join(ROOT, 'about.html'),
    pageShell({ title: 'About', root: '', bodyHtml: renderAboutPage() }), 'utf-8');

  console.log(`Generated ${count} chapter pages into ${TOPICS_DIR}`);
  console.log(`Wrote js/toc-data.js (${tocStrands.length} strands)`);
  console.log('Wrote index.html, contents.html, about.html');
}

run();
