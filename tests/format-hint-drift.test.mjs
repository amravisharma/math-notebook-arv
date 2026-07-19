// tests/format-hint-drift.test.mjs
//
// tools/format-hint.mjs (Node/ESM, used at build time for the 18 static topics) and the hand-kept
// ES5 copy inside js/quiz-engine.js (used at runtime for the 6 dynamic topics) implement the SAME
// algorithm in two separate files with no code sharing between them. This test makes any drift
// between the two a loud, immediate failure instead of a silent runtime mismatch.

import test from 'node:test';
import assert from 'node:assert/strict';
import { formatHint as nodeFormatHint } from '../tools/format-hint.mjs';
import { loadQuizEngine } from './helpers.mjs';

const { formatHint: browserFormatHint } = loadQuizEngine();

const FIXTURES = [
  '3n + 2', '4n − 2', '−3x + 12', 'x + 8', '8 + 6n', '3x² + 2x', '3(2x + 3)',
  'x = 5', 'x = 12', 'y=x+3', 'y=-x', 'SA = 96 cm²', '2 : 3', '2/3', '3/4', '1 5/12', '(3, 4)', '(−3, 5)',
  '$45', '45 km/h', '15cm', '16th', '−10 m', 'B', '20', 'equilateral', 'yes', 'no',
  '18 and 27', '9 and −9', '3n + 2 and 32', '$15 and $25', '2, 5, 10',
  'P = 16 cm, A = 16 cm²', '10 factors, not prime', '30 km/h; 3 h 20 min',
  'mode 7, range 5', 'mean 6, median 6', 'mode', 'median',
  'x > 4', 'x ≤ 6', 'less than 6 km', '90%', '15% increase',
  '2 × 2 × 3 × 7', '4000 + 70 + 2', '4.5 × 10⁴', 'a⁸', '3³ (27 > 16)',
  '4th value', '750 g for $6.30', '100 000 L', '49 000',
];

test('format-hint.mjs and quiz-engine.js\'s copy agree on every fixture', () => {
  FIXTURES.forEach((f) => {
    assert.equal(browserFormatHint(f), nodeFormatHint(f), `mismatch for ${JSON.stringify(f)}`);
  });
});
