// tests/helpers.mjs
//
// Loads the REAL browser runtime files (js/topic-interactions.js, js/quiz-engine.js) into a
// node:vm sandbox and returns their public API, so tests exercise exactly what ships to the
// browser rather than a re-implementation that could silently drift from the real logic.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// topic-interactions.js's IIFE bails immediately (`if (!topicId) return;`) unless
// window.CURRENT_TOPIC_ID is truthy, and calls document.addEventListener('DOMContentLoaded', ...)
// at the end to register (not run) its click/keydown handlers — a no-op stub is enough since that
// callback never fires in this sandbox. window.ProgressStore is only dereferenced inside that
// unfired callback, so an empty stub is sufficient here too.
export function loadTopicEngine() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'topic-interactions.js'), 'utf-8');
  const sandbox = {
    window: { CURRENT_TOPIC_ID: 'test-topic', ProgressStore: {}, TOPIC_CHECK: {} },
    document: { addEventListener() {}, querySelectorAll: () => [], querySelector: () => null },
    localStorage: { getItem: () => null },
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'js/topic-interactions.js' });
  if (!sandbox.window.TopicEngine) throw new Error('topic-interactions.js did not expose window.TopicEngine — sandbox stub mismatch?');
  return sandbox.window.TopicEngine;
}

// quiz-engine.js's IIFE runs unconditionally and assigns window.QuizEngine (GEN, formatHint, etc.)
// with no early-return guard, so a bare document/window stub is enough.
export function loadQuizEngine() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'quiz-engine.js'), 'utf-8');
  const sandbox = {
    window: {},
    document: { getElementById: () => null, addEventListener() {} },
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'js/quiz-engine.js' });
  if (!sandbox.window.QuizEngine) throw new Error('quiz-engine.js did not expose window.QuizEngine — sandbox stub mismatch?');
  return sandbox.window.QuizEngine;
}

// Mulberry32 PRNG, verbatim copy of quiz-engine.js's own generator (used by tests that need to
// drive GEN.<topic>.<tier>(r) directly with a reproducible seed).
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stripTags(html) { return String(html).replace(/<[^>]+>/g, ''); }
