// tools/validate-book.mjs
// Dependency-free structural check over the generated site: confirms all 24 topic pages exist, every
// prev/next link resolves, dynamic-topic placeholders are present, and no unresolved template
// artifacts (undefined/[object Object]/NaN) leaked into the output. Run: node tools/validate-book.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOPICS_DIR = path.join(ROOT, 'topics');
const DYNAMIC_IDS = new Set(['graphs', 'angles', 'shapes', 'transformations', 'pythagoras', 'circles']);

const errors = [];
const fail = (f, m) => errors.push(`[${f}] ${m}`);

function run() {
  const tocPath = path.join(ROOT, 'js', 'toc-data.js');
  if (!fs.existsSync(tocPath)) { fail('js/toc-data.js', 'missing — run tools/generate-book.mjs first'); report(); return; }
  const tocSrc = fs.readFileSync(tocPath, 'utf-8');
  const match = tocSrc.match(/window\.TOC_STRANDS\s*=\s*(\[[\s\S]*\]);/);
  if (!match) { fail('js/toc-data.js', 'could not parse TOC_STRANDS'); report(); return; }
  const strands = JSON.parse(match[1]);
  const allTopics = strands.flatMap((s) => s.topics);
  console.log(`Found ${allTopics.length} topics across ${strands.length} strands.`);

  allTopics.forEach((t, i) => {
    const file = path.join(TOPICS_DIR, `${t.id}.html`);
    if (!fs.existsSync(file)) { fail(`${t.id}.html`, 'file missing'); return; }
    const html = fs.readFileSync(file, 'utf-8');

    // Look for leaked JS values in interpolation-shaped contexts, not the English word "undefined"
    // in genuine prose (e.g. "a vertical line has an undefined gradient").
    if (/>\s*undefined\s*<|"undefined"|\[object Object\]|>\s*NaN\s*<|:\s*NaN\b/.test(html)) {
      fail(`${t.id}.html`, 'contains a template artifact (undefined/[object Object]/NaN)');
    }
    if (!html.includes(`id="${t.id}"`)) fail(`${t.id}.html`, 'missing topic section id');
    if (!html.includes('js/topic-interactions.js')) fail(`${t.id}.html`, 'missing topic-interactions.js include');

    if (DYNAMIC_IDS.has(t.id)) {
      for (const ph of ['dyn-worked', 'dyn-tabs', 'dyn-panes', 'dyn-assignment']) {
        if (!html.includes(`id="${ph}"`)) fail(`${t.id}.html`, `missing dynamic placeholder #${ph}`);
      }
      if (!html.includes('js/quiz-engine.js')) fail(`${t.id}.html`, 'dynamic topic missing quiz-engine.js include');
      if (!html.includes('renderDynamicTopic')) fail(`${t.id}.html`, 'missing renderDynamicTopic() call');
    } else {
      const exCount = (html.match(/class="ex" data-key=/g) || []).length;
      if (exCount !== 30) fail(`${t.id}.html`, `expected 30 static exercises, found ${exCount}`);
    }

    if (i > 0) {
      const prev = allTopics[i - 1];
      if (!html.includes(`href="${prev.id}.html"`)) fail(`${t.id}.html`, `missing Previous link to ${prev.id}.html`);
    }
    if (i < allTopics.length - 1) {
      const next = allTopics[i + 1];
      if (!html.includes(`href="${next.id}.html"`)) fail(`${t.id}.html`, `missing Next link to ${next.id}.html`);
    }
  });

  // Cross-check every generated file is listed in the TOC (no orphans) and vice versa.
  const tocIds = new Set(allTopics.map((t) => t.id));
  fs.readdirSync(TOPICS_DIR).filter((f) => f.endsWith('.html')).forEach((f) => {
    const id = f.replace(/\.html$/, '');
    if (!tocIds.has(id)) fail(f, 'generated file not listed in toc-data.js');
  });

  report();
}

function report() {
  if (errors.length) {
    console.log(`\n${errors.length} ERROR(s):`);
    errors.forEach((e) => console.log('  x ' + e));
    process.exit(1);
  }
  console.log('\nAll generated pages valid. ✓');
}

run();
