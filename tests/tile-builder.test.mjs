// tests/tile-builder.test.mjs
//
// Exercises the REAL js/tile-builder.js against a minimal (but real, not stubbed) DOM shim: actual
// classList/className sync, actual parent-child appendChild/remove, actual addEventListener/
// dispatchEvent — enough to simulate genuine click sequences (select a tile, place it in a slot,
// undo, swap) and read back what the widget actually writes into the answer input. The assembled
// string is then checked against the REAL marking engine (js/topic-interactions.js), closing the
// loop from "tiles clicked" to "graded correct/wrong" exactly as it works on the live page.
//
// No real browser was available to drive this pilot visually — see the final report for that
// limitation. This is the most rigorous verification available without one, and it did catch two
// real bugs before ship: a shim gap aside, the swap-in-one-click interaction bug in tile-builder.js
// itself (clicking an already-filled slot while a different tile was selected silently unplaced
// instead of swapping) and the parseFloat-truncation marking bug (see marking.test.mjs) — both
// fixed as a direct result of writing this test.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadTopicEngine } from './helpers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function makeClassList() {
  const set = new Set();
  return {
    add: (...c) => c.forEach((x) => set.add(x)),
    remove: (...c) => c.forEach((x) => set.delete(x)),
    toggle: (c, force) => { if (force === undefined) { set.has(c) ? set.delete(c) : set.add(c); } else if (force) set.add(c); else set.delete(c); },
    contains: (c) => set.has(c),
    get _set() { return set; },
  };
}
function makeNode(tag) {
  const listeners = {};
  const node = {
    tagName: (tag || 'div').toUpperCase(), children: [], parentNode: null, dataset: {}, style: {},
    disabled: false, hidden: false, _text: '', _html: '', type: '',
    get textContent() { return this._text; }, set textContent(v) { this._text = String(v); this.children = []; },
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
    classList: null,
    appendChild(child) { if (child.parentNode) child.parentNode.remove.call(child); child.parentNode = this; this.children.push(child); return child; },
    remove() { if (this.parentNode) { const i = this.parentNode.children.indexOf(this); if (i >= 0) this.parentNode.children.splice(i, 1); this.parentNode = null; } },
    addEventListener(t, f) { (listeners[t] = listeners[t] || []).push(f); },
    dispatchEvent(e) { (listeners[e.type] || []).forEach((f) => f(e)); return true; },
    click() { this.dispatchEvent({ type: 'click', target: this }); },
    setAttribute() {},
  };
  node.classList = makeClassList();
  Object.defineProperty(node, 'className', {
    get() { return [...this.classList._set].join(' '); },
    set(v) { this.classList._set.clear(); String(v).split(/\s+/).filter(Boolean).forEach((c) => this.classList._set.add(c)); },
  });
  return node;
}

function loadTileBuilder() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'tile-builder.js'), 'utf-8');
  const sandbox = { window: {}, document: { createElement: (t) => makeNode(t), addEventListener: () => {}, querySelectorAll: () => [] }, console };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'js/tile-builder.js' });
  return sandbox.window.TileBuilder;
}

const TileBuilder = loadTileBuilder();
const { isCorrect } = loadTopicEngine();
const html = fs.readFileSync(path.join(ROOT, 'topics', 'patterns.html'), 'utf-8');
const acceptMap = JSON.parse(html.match(/window\.TOPIC_CHECK=Object\.assign\(window\.TOPIC_CHECK\|\|\{\}, (\{.*?\})\);/s)[1]);

function mountAndPlace(spec, placements) {
  const host = makeNode('div'), input = makeNode('input');
  TileBuilder.mount(host, input, spec);
  const frame = host.children[0], pool = host.children[1];
  const slots = {};
  frame.children.forEach((c) => { if (c.dataset.slot) slots[c.dataset.slot] = c; });
  function place(label, kind, slotId) {
    const tile = pool.children.find((t) => t.innerHTML === label && t.dataset.kind === kind);
    if (!tile) throw new Error(`tile not found: ${label}/${kind}`);
    tile.click(); slots[slotId].click();
  }
  placements.forEach((p) => place(p[0], p[1], p[2]));
  return { host, input, slots, pool };
}

function getSpec(key) {
  const re = new RegExp(`data-key="${key.replace(/\|/g, '\\|')}"[\\s\\S]*?data-spec='([^']*)'`);
  return JSON.parse(html.match(re)[1]);
}

test('placing the correct tiles assembles the exact accept string and marks correct (all 10 items)', () => {
  for (let idx = 0; idx < 10; idx++) {
    const key = `patterns|medium|${idx}`;
    const accept = acceptMap[key];
    const spec = getSpec(key);
    const m = accept[0].match(/(-?\d+)n\s*([+−-])\s*(\d+)\s+and\s+(\d+)/);
    const [, coeff, sign, cons, term] = m;
    const { input } = mountAndPlace(spec, [[coeff, 'coeff', 'coeff'], [sign, 'sign', 'sign'], [cons, 'const', 'const'], [term, 'term', 'term']]);
    assert.equal(input.value, accept[0], key);
    assert.equal(isCorrect(input.value, accept), true, key);
  }
});

test('a wrong-sign tile combination assembles a genuinely different string and marks wrong (all 10 items)', () => {
  for (let idx = 0; idx < 10; idx++) {
    const key = `patterns|medium|${idx}`;
    const accept = acceptMap[key];
    const spec = getSpec(key);
    const m = accept[0].match(/(-?\d+)n\s*([+−-])\s*(\d+)\s+and\s+(\d+)/);
    const [, coeff, sign, cons, term] = m;
    const wrongSign = sign === '+' ? '−' : '+';
    const { input } = mountAndPlace(spec, [[coeff, 'coeff', 'coeff'], [wrongSign, 'sign', 'sign'], [cons, 'const', 'const'], [term, 'term', 'term']]);
    assert.notEqual(input.value, accept[0], key);
    assert.equal(isCorrect(input.value, accept), false, key);
  }
});

test('input stays empty until every slot is filled', () => {
  const spec = getSpec('patterns|medium|0');
  const { input, slots, pool } = mountAndPlace(getSpec('patterns|medium|0'), []);
  const coeffTile = pool.children.find((t) => t.dataset.kind === 'coeff');
  coeffTile.click(); slots.coeff.click();
  assert.equal(input.value, '');
});

test('tapping a filled slot with nothing selected removes that tile (undo) and returns it to the pool', () => {
  const spec = getSpec('patterns|medium|0');
  const { input, slots, pool } = mountAndPlace(spec, [['3', 'coeff', 'coeff'], ['+', 'sign', 'sign'], ['2', 'const', 'const'], ['32', 'term', 'term']]);
  assert.equal(input.value, '3n + 2 and 32');
  slots.term.click();
  assert.equal(input.value, '');
  const termTile = pool.children.find((t) => t.innerHTML === '32' && t.dataset.kind === 'term');
  assert.equal(termTile.classList.contains('tb-placed'), false);
});

test('regression: selecting a new tile and clicking an already-filled slot swaps it in one click', () => {
  // Previously the slot's click handler checked "is this slot filled?" before "is a tile
  // selected?", so clicking a filled slot with a different tile selected just unplaced the old
  // tile and ignored the selection — the user had to click twice to swap.
  const spec = getSpec('patterns|medium|0');
  const { input, slots, pool } = mountAndPlace(spec, [['3', 'coeff', 'coeff'], ['+', 'sign', 'sign'], ['2', 'const', 'const'], ['32', 'term', 'term']]);
  assert.equal(input.value, '3n + 2 and 32');
  const fourTile = pool.children.find((t) => t.innerHTML === '4' && t.dataset.kind === 'coeff');
  fourTile.click();       // select the "4" tile
  slots.coeff.click();    // click the ALREADY-FILLED coeff slot (currently holds "3")
  assert.equal(input.value, '4n + 2 and 32', 'one click should swap 3 -> 4, not just unplace 3');
  const threeTile = pool.children.find((t) => t.innerHTML === '3' && t.dataset.kind === 'coeff');
  assert.equal(threeTile.classList.contains('tb-placed'), false, 'the displaced tile returns to the pool');
});
