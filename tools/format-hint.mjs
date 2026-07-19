// tools/format-hint.mjs
//
// Derives a short "Format: e.g. ..." hint from an authored accept[] value, so a learner sees the
// SHAPE of an expected answer without ever seeing the real one. EVERY accept value gets a hint, no
// exceptions -- even a bare number or a bare word ("31", "equilateral") falls through to a generic
// structural fallback (genericFallback()) rather than showing nothing, so the hint line is always
// present for visual/pedagogical consistency across every practice item.
//
// Every placeholder below is a fixed constant, never derived from the real answer's magnitude — the
// only real information ever reflected back is a structural fact (which variable letter is used,
// whether a $ sign or a colon belongs), never a number that could coincide with the actual answer.
// Since this curriculum's real answers are still small integers, a fixed placeholder CAN
// coincidentally equal one by chance (e.g. equations|hard|5's real answer happens to be "x = 12") —
// formatHint()'s outer wrapper detects that exact coincidence and retries with a different
// placeholder rotation rather than silently leaking.
//
// This file is the Node/build-time copy, used by generate-book.mjs for the 18 static topics (whose
// accept[] is known at build time). js/quiz-engine.js carries a second, ES5 copy of the same two
// functions for the 6 dynamic topics (whose accept[] is only known at runtime, after the seeded
// generator has run) — see tests/format-hint.test.mjs, which checks the two copies agree on a
// shared fixture list so they can't silently drift apart.

// Parses a SIMPLE linear expression "±A·letter ±B" (degree ≤ 1, one variable) into
// {coeff, cons, letter}, or null if the string isn't shaped like one. Kept in lock-step with the
// identically-named function in js/topic-interactions.js (same algorithm, verified by the shared
// fixture test) — deliberately not a full CAS, see that file's comment for the exact scope.
export function parseLinearExpr(raw) {
  let s = String(raw).toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '');
  if (!s || /[²³]/.test(s)) return null;
  if (s[0] !== '+' && s[0] !== '-') s = '+' + s;
  const terms = s.match(/[+-][^+-]+/g);
  if (!terms) return null;
  let coeff = 0, cons = 0, letter = null;
  for (const t of terms) {
    const sign = t[0] === '-' ? -1 : 1, body = t.slice(1);
    const mv = body.match(/^(\d*\.?\d*)([a-z])$/);
    if (mv) {
      if (letter && letter !== mv[2]) return null;
      letter = mv[2];
      coeff += sign * (mv[1] === '' ? 1 : parseFloat(mv[1]));
      continue;
    }
    const mn = body.match(/^\d*\.?\d+$/);
    if (mn) { cons += sign * parseFloat(body); continue; }
    return null;
  }
  return { coeff, cons, letter, termCount: terms.length };
}

// A small rotation of visually-distinct fixed constants, so two compound parts that hit the SAME
// classifier (e.g. two currency values, "$15 and $25") don't render an identical placeholder that
// looks like it's claiming the two real values are equal. `index` cycles through this list; the
// single-value call sites (index 0) always see the first, original constant, so no non-compound
// hint's wording changes from before this was added. Also doubles as the retry rotation formatHint's
// outer wrapper uses when a placeholder coincidentally matches the real answer (see below).
const N = [12, 9, 15, 6];

// All the actual shape-recognition, given a pre-normalised `raw` string and a resolved placeholder
// index. Returns a hint string or null. Never called directly from outside this file — formatHint()
// below normalises the input, handles compound splitting, and retries on accidental collision with
// the real answer before handing back to callers.
function formatHintCore(raw, index) {
  const n = N[index % N.length];
  let m;

  // Equation-shaped parts already distinguish themselves by their own letter/label (P vs A, x vs
  // y), so unlike currency/unit they don't need index-varied numbers to avoid looking "equal" —
  // but DO still need the shared `n` rotation so the outer wrapper's collision retry can change it.
  if ((m = raw.match(/^([a-z]{1,3})\s*=\s*-?\d/i))) return `${m[1]} = ${n}`;             // equation (incl. short labels like SA, HCF)

  // Line equation "y = mx + c" (RHS is a linear expression WITH a letter — distinct from the bare
  // "letter = number" case just above, which the digit-first `-?\d` requirement already excludes).
  if ((m = raw.match(/^([a-z]{1,3})\s*=\s*(.+)$/i))) {
    const linRhs = parseLinearExpr(m[2]);
    if (linRhs && linRhs.letter) return `${m[1]} = 2${linRhs.letter} + ${n}`;
  }

  // Inequality "x > 4", "x <= 6" — preserves the real comparison symbol (a structural fact, like the
  // equation's letter), varies only the number.
  if ((m = raw.match(/^([a-z]{1,3})\s*(>=|<=|≥|≤|>|<)\s*-?\d/i))) return `${m[1]} ${m[2]} ${n}`;

  // Ratio / mixed number / fraction / scientific notation / letter-exponent / "power (comparison)":
  // each rotates through a small set of varied examples (like the N constants) rather than one
  // fixed literal — a single fixed string CAN coincidentally equal a real answer (e.g. a real
  // fraction answer of exactly "3/4"), and without variation the outer retry loop has nothing to
  // change, so it would exhaust all attempts and fall back to no hint instead of a different one.
  const RATIOS = ['5 : 2', '3 : 7', '4 : 9', '7 : 3'];
  const MIXED = ['2 1/3', '1 3/5', '3 2/7', '4 1/4'];
  const FRACS = ['3/4', '2/5', '5/8', '1/6'];
  const SCI = ['2.5 × 10³', '4.1 × 10⁴', '6.3 × 10²', '8.2 × 10⁵'];
  const LETEXP = ['a⁵', 'a⁴', 'a⁶', 'a⁷'];
  const PCOMP = ['2⁴ (16 > 9)', '3² (9 > 4)', '2⁵ (32 > 25)', '4² (16 > 9)'];
  if (/^\d+(\.\d+)?\s*:\s*\d+(\.\d+)?$/.test(raw)) return RATIOS[index % RATIOS.length];       // ratio
  if (/^\d+\s+\d+\/\d+$/.test(raw)) return MIXED[index % MIXED.length];                        // mixed number
  if (/^\d+\/\d+$/.test(raw)) return FRACS[index % FRACS.length];                              // fraction
  if (/^\$\d/.test(raw)) return `$${n}`;                                                       // currency

  // Scientific / standard form "4.5 × 10⁴".
  if (/^\d+(\.\d+)?\s*[×x]\s*10[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/i.test(raw)) return SCI[index % SCI.length];

  // Multiplication chain (prime factorisation) "2 × 2 × 3 × 7" — matches the real TERM COUNT (a
  // structural fact) with fixed placeholder primes, never the real factors themselves.
  if (/^\d+(\s*[×x]\s*\d+)+$/i.test(raw)) {
    const count = raw.split(/[×x]/i).length;
    const PRIMES = [2, 3, 5, 7, 11, 13];
    return Array.from({ length: count }, (_, i) => PRIMES[i % PRIMES.length]).join(' × ');
  }

  // Plain-digit "+" chain (place-value expanded form) "4000 + 70 + 2" — pure numbers only, no
  // letter, so this can never collide with a real linear expression (checked below, which always
  // needs a letter).
  if (/^\d+(\.\d+)?(\s*\+\s*\d+(\.\d+)?)+$/.test(raw)) {
    const count = raw.split(/\+/).length;
    return Array.from({ length: count }, (_, i) => N[(index + i) % N.length]).join(' + ');
  }

  // "power (comparison)" — narrow shape used to justify which of two powers is bigger, e.g.
  // "3³ (27 > 16)". Requires a SPACE before "(" so it can never match a factored expression like
  // "3(2x + 3)" (no space there) — verified against the one other parenthesised accept value site-wide.
  if (/^\d+[²³⁴⁵⁶⁷⁸⁹]?\s+\(\d+\s*[<>]\s*\d+\)$/.test(raw)) return PCOMP[index % PCOMP.length];

  // termCount >= 2 excludes bare single-letter/single-unit answers (a multiple-choice-style label
  // like "B", or a unit-suffixed value like "−10 m") from being mistaken for algebra — every
  // genuine algebraic-expression accept in this curriculum has both a coefficient AND a constant
  // term (verified against the live data), so a lone term is never actually the "expression" shape.
  const lin = parseLinearExpr(raw);
  if (lin && lin.letter && lin.termCount >= 2) {
    const coeffPart = (lin.coeff < 0 ? `−4${lin.letter}` : `4${lin.letter}`);
    const consPart = lin.cons < 0 ? ' − 1' : ' + 1';
    return coeffPart + consPart;                                                         // linear expression
  }

  // Number + unit — the leading number is either a plain contiguous digit run ("3000 m") or a
  // digit-grouped one ("100 000 L"; note the grouping ALTERNATIVE requires a real separator, so it
  // never steals a bite out of a plain run the way `\d{1,3}(?:[ ,]\d{3})*` alone would). A trailing
  // "%" is a valid unit character too ("90%"). Preserves whichever spacing the original used (m[2])
  // — "16th" has none, "45 km/h" has one — so an ordinal doesn't grow a spurious space.
  if ((m = raw.match(/^-?(?:\d{1,3}(?:[ ,]\d{3})+|\d+)(\.\d+)?(\s*)([a-zA-Z°²³%/]+)$/))) return `${n}${m[2]}${m[3]}`;

  // "N% word" — a percentage change with a direction word, e.g. "15% increase". The word is a
  // structural label (like an equation's letter), kept verbatim; only the number varies.
  if ((m = raw.match(/^-?\d+(\.\d+)?%\s+([a-z]+)$/i))) return `${n}% ${m[2]}`;

  // A known comparison PHRASE + number + unit ("less than 6 km") — a bounded set of common
  // inequality wordings, checked before the single-word "label number unit" case below since its
  // label regex (one word only) can never match a two-word phrase like "less than" anyway.
  if ((m = raw.match(/^(less than|more than|at least|at most|greater than)\s+-?\d+(\.\d+)?(\s*)([a-zA-Z°²³]+)$/i))) return `${m[1]} ${n}${m[3]}${m[4]}`;

  // "label number unit" ("width 6 cm") — distinct from the plain "label number" case below (which
  // requires nothing after the number) and from "number unit" above (which requires the number
  // first). Preserves the original spacing before the unit (m[3]).
  if ((m = raw.match(/^([a-z]+)\s+-?\d+(\.\d+)?(\s*)([a-zA-Z°²³]+)$/i))) return `${m[1]} ${n}${m[3]}${m[4]}`;

  // A word LABEL followed by a number ("mode 7", "mean 6") — distinct from "number + unit" above
  // (label comes first here) and common in statistics answers. The marking engine's own normParts
  // strips bare-letter tokens as filler, so "mode 7, range 5" and "7, 5" mark identically — but a
  // learner has no way to know that without a hint. Keep the real word (it's a structural label,
  // like the equation letter above, not the answer's value) and vary only the number.
  if ((m = raw.match(/^([a-z]+)\s+-?\d+(\.\d+)?$/i))) return `${m[1]} ${n}`;              // label + number

  // Ordinal + word ("4th value") — the ordinal suffix and trailing word are structural, the number varies.
  if ((m = raw.match(/^-?\d+(st|nd|rd|th)\s+([a-z]+)$/i))) return `${n}${m[1].toLowerCase()} ${m[2]}`;

  // Letter + superscript exponent ("a⁸").
  if (/^[a-z][⁰¹²³⁴⁵⁶⁷⁸⁹]+$/i.test(raw)) return LETEXP[index % LETEXP.length];

  // "quantity unit for $price" (ratios best-buy answers) "750 g for $6.30" — two distinct numbers
  // (n and the NEXT rotation) so the quantity and the price don't render as visibly equal.
  if ((m = raw.match(/^-?\d+(\.\d+)?\s*([a-zA-Z]+)\s+for\s+\$-?\d+(\.\d+)?$/i))) {
    return `${n} ${m[2]} for $${N[(index + 1) % N.length]}`;
  }

  // Duration "3 h 20 min".
  if ((m = raw.match(/^-?\d+(\.\d+)?\s*h\s+-?\d+(\.\d+)?\s*min$/i))) {
    return `${n} h ${N[(index + 1) % N.length]} min`;
  }

  // Degree-2 (two-term) expression "3x² + 2x" — out of the linear-expr classifier's scope (marking
  // is exact-match-only here, see marking.test.mjs), but still needs a shape-preserving hint: same
  // letter, same power, fixed placeholder coefficients.
  if ((m = raw.match(/^-?\d*([a-z])²\s*([+\-−])\s*-?\d*([a-z])$/i)) && m[1].toLowerCase() === m[3].toLowerCase()) {
    return `4${m[1]}² + 3${m[1]}`;
  }

  // Factored linear expression "3(2x + 3)" — same reasoning as above.
  if ((m = raw.match(/^-?\d+\(\s*-?\d*([a-z])\s*[+\-−]\s*\d+\s*\)$/i))) {
    return `4(3${m[1]} + 2)`;
  }

  return genericFallback(raw, index);
}

// Last-resort fallback so EVERY item shows a hint, even ones with no real format ambiguity: a bare
// number gets a placeholder number (consistent with every numeric shape above); "yes"/"no" gets the
// opposite (impossible to coincide, by construction); a single letter (a statistics "A or B" style
// answer) gets a different letter (same reasoning). Anything else that's just prose (a single word
// like "median", or a short phrase like "not prime") gets a STRUCTURAL description rather than a
// fabricated word — a fake concrete word could read as a specific (wrong) suggested answer in a way
// a generic phrase never does.
function genericFallback(raw, index) {
  const n = N[index % N.length];
  // Tolerates digit-grouping ("49 000") the same way the number+unit branch above does, so a bare
  // grouped number falls into the number placeholder, not the word/phrase fallback below.
  if (/^-?(?:\d{1,3}(?:[ ,]\d{3})+|\d+)(\.\d+)?$/.test(raw)) return String(n);
  if (/^yes$/i.test(raw)) return 'no';
  if (/^no$/i.test(raw)) return 'yes';
  if (/^[a-z]$/i.test(raw)) {
    const LETTERS = ['A', 'B', 'C', 'D'];
    return LETTERS.find((l) => l.toLowerCase() !== raw.toLowerCase());
  }
  return raw.trim().split(/\s+/).length === 1 ? 'one word' : 'a few words';
}

// Joins hint parts the way natural English lists would ("A and B"; "A, B and C"), regardless of
// which separator the real compound answer used — normAns/normParts treat comma, semicolon and
// "and" as equivalent separators for marking purposes, so the hint doesn't need to reproduce the
// real one exactly.
function naturalJoin(parts) {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

// Returns a hint string (no leading "e.g."/"Format:" — callers add that framing). Every accept value
// gets one, no exceptions — a bare number or bare word falls all the way through to
// genericFallback(), so the "Format: e.g. ..." line is always present rather than only for shapes
// with obvious format ambiguity. `index` (default 0) is only used internally when recursing over a
// compound answer's parts. Only returns null if acceptRaw itself is falsy (no real answer to hint at all).
export function formatHint(acceptRaw, index = 0) {
  if (!acceptRaw) return null;
  const raw = String(acceptRaw).trim().replace(/[−–—]/g, '-');   // normalise minus/en/em dash to ASCII "-"

  // Coordinate pairs contain an internal comma ("(3, 4)") that must NOT be treated as a compound
  // separator — checked first, before any compound splitting, so it's never torn in two.
  if (/^\(\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*\)$/.test(raw)) return '(1, 2)';

  // Compound "A and B" / "A; B" / "A, B" (matching the marking engine's own normParts separators, so
  // a comma-joined answer like "P = 16 cm, A = 16 cm²" is recognised as two parts, not one). Each
  // part is hinted independently with its own position index (so two same-shaped parts, e.g. two
  // currency values, don't render an identical, misleadingly-equal placeholder) and then joined --
  // every part always gets SOME hint now (down to genericFallback), so there's nothing to bail out of.
  const compoundParts = raw.split(/\s+and\s+|[,;]\s*/i);
  if (compoundParts.length > 1) {
    return naturalJoin(compoundParts.map((p, i) => formatHint(p, i)));
  }

  // Single (non-compound) shape: try up to N.length placeholder rotations, only retrying if the
  // computed hint happens to coincide EXACTLY with the real answer — this curriculum's answers are
  // small integers, so a fixed placeholder occasionally lands on the real value by chance (e.g.
  // equations|hard|5's real answer is literally "x = 12"). A shape that isn't recognised at all
  // (null) never benefits from retrying, so it returns immediately.
  for (let attempt = 0; attempt < N.length; attempt++) {
    const hint = formatHintCore(raw, index + attempt);
    if (!hint || hint.toLowerCase() !== raw.toLowerCase()) return hint;
  }
  return null;   // every rotation coincidentally matched the real answer -- fail safe, no hint shown
}
