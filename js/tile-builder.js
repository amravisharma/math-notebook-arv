/* js/tile-builder.js
   A reusable, GRADED drag-and-drop answer widget: the learner builds an answer by placing tiles
   into slots interleaved with fixed text (e.g. "__n __ __ and __" for a pattern rule + its 10th
   term), rather than typing it free-form. Unlike js/explore.js's card-sort widget (which is
   UNGRADED practice, never wired to marking), this widget writes its assembled answer straight
   into the SAME <input class="ans-input"> element the free-text flow already uses, then does
   nothing else — topic-interactions.js's existing markbtn click handler, isCorrect()/accept[]
   check, ProgressStore.recordAnswer(), and restoreAnswers()'s self-healing re-mark all work for a
   tile-built answer with ZERO changes, because as far as that pipeline is concerned it's just a
   string in an input.

   Interaction model, matching js/explore.js's buildSort(): native <button type="button"> tiles,
   click-to-select then click-a-slot-to-place — accessible by default (buttons respond to
   Enter/Space, no native HTML5 draggable/dragstart needed). Pointer-drag is layered on top as a
   progressive enhancement calling the exact same place() function, so both paths stay in sync.

   spec = {
     slots:    [{id, kind}, ...]                       // kind gates which tiles fit which slot
     tiles:    [{id, label, value, kind}, ...]          // the shuffled pool (real values + decoys)
     template: [{text} | {slot: id}, ...]               // fixed text and slot placeholders, in order
   }
   The assembled answer is built directly from `template` (fixed text verbatim, each slot replaced
   by its filled tile's `value`) rather than a custom assemble() function, deliberately — `spec` is
   JSON-serialized into a `data-spec` HTML attribute at build time, and a function can't survive
   that round-trip. Keeping the whole spec plain-data-only is what makes this widget reusable for a
   different question shape (e.g. an equation-builder) with zero code changes: a new call site only
   ever needs a new template/slots/tiles data shape, never a widget-side code change. */
(function () {
  'use strict';

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  window.TileBuilder = {
    // host: the container to build into. input: the <input class="ans-input"> to keep in sync.
    mount: function (host, input, spec) {
      var slotEls = {}, filled = {}, selected = null;
      var pool = el('div', 'tb-pool');
      var frame = el('div', 'tb-frame');

      spec.template.forEach(function (part) {
        if (part.text !== undefined) { frame.appendChild(el('span', 'tb-text', part.text)); return; }
        var slotSpec = spec.slots.filter(function (s) { return s.id === part.slot; })[0];
        var slotEl = el('button', 'tb-slot');
        slotEl.type = 'button';
        slotEl.dataset.slot = part.slot;
        slotEl.dataset.kind = slotSpec.kind;
        slotEl.setAttribute('aria-label', 'Answer slot');
        slotEl.textContent = '?';
        slotEls[part.slot] = slotEl;
        frame.appendChild(slotEl);
      });

      function assemble() {
        return spec.template.map(function (part) {
          if (part.text !== undefined) return part.text;
          return filled[part.slot] ? filled[part.slot].value : '';
        }).join('');
      }
      function sync() {
        var allFilled = spec.slots.every(function (s) { return filled[s.id] !== undefined; });
        input.value = allFilled ? assemble() : '';
      }

      function returnTileToPool(tile) {
        tile.el.classList.remove('tb-placed'); tile.el.disabled = false;
        pool.appendChild(tile.el);
      }

      function place(tile, slotId) {
        var slotEl = slotEls[slotId];
        if (slotEl.dataset.kind !== tile.kind) return false;
        if (filled[slotId] !== undefined) { returnTileToPool(filled[slotId].tile); }
        filled[slotId] = { value: tile.value, tile: tile };
        slotEl.textContent = tile.label;
        slotEl.classList.add('tb-filled');
        tile.el.classList.add('tb-placed'); tile.el.disabled = true;
        sync();
        return true;
      }

      function unplace(slotId) {
        if (filled[slotId] === undefined) return;
        returnTileToPool(filled[slotId].tile);
        delete filled[slotId];
        slotEls[slotId].textContent = '?';
        slotEls[slotId].classList.remove('tb-filled');
        sync();
      }

      function selectTile(tile) {
        if (selected) selected.el.classList.remove('tb-selected');
        selected = (selected === tile) ? null : tile;
        if (selected) selected.el.classList.add('tb-selected');
      }

      var tiles = shuffle(spec.tiles).map(function (t) {
        var tileEl = el('button', 'tb-tile', t.label);
        tileEl.type = 'button';
        tileEl.dataset.kind = t.kind;
        var tile = { id: t.id, label: t.label, value: t.value, kind: t.kind, el: tileEl };

        tileEl.addEventListener('click', function () { selectTile(tile); });

        // Progressive enhancement: pointer-drag calls the same place(), baseline click-to-select
        // still works underneath (a drag shorter than the 4px threshold falls through as a click).
        tileEl.addEventListener('pointerdown', function (e) {
          if (tileEl.disabled) return;
          var startX = e.clientX, startY = e.clientY, dragging = false;
          function onMove(ev) {
            if (!dragging && (Math.abs(ev.clientX - startX) > 4 || Math.abs(ev.clientY - startY) > 4)) { dragging = true; tileEl.classList.add('tb-dragging'); }
            if (dragging) tileEl.style.transform = 'translate(' + (ev.clientX - startX) + 'px,' + (ev.clientY - startY) + 'px)';
          }
          function onUp(ev) {
            document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp);
            tileEl.classList.remove('tb-dragging'); tileEl.style.transform = '';
            if (!dragging) return;
            var under = document.elementFromPoint(ev.clientX, ev.clientY);
            var slotEl = under && under.closest && under.closest('.tb-slot');
            if (slotEl) place(tile, slotEl.dataset.slot);
          }
          document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp);
        });

        pool.appendChild(tileEl);
        return tile;
      });

      Object.keys(slotEls).forEach(function (slotId) {
        slotEls[slotId].addEventListener('click', function () {
          // A selected tile always wins first: clicking ANY slot (filled or not) swaps it in —
          // place() already evicts whatever tile currently occupies that slot back to the pool.
          // Only with nothing selected does clicking a filled slot fall back to "tap to remove".
          if (selected) { if (place(selected, slotId)) { selected.el.classList.remove('tb-selected'); selected = null; } return; }
          if (filled[slotId] !== undefined) unplace(slotId);
        });
      });

      host.appendChild(frame);
      host.appendChild(pool);
    }
  };

  // Auto-discovers every `.tile-builder[data-spec]` on the page and mounts it, mirroring how
  // js/explore.js self-bootstraps on DOMContentLoaded. Registered AFTER topic-interactions.js's own
  // DOMContentLoaded listener runs (this script is loaded after it — see generate-book.mjs's
  // per-page script order), so restoreAnswers() has already set .ans-input's value for any
  // previously-answered question by the time this runs.
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.tile-builder[data-spec]').forEach(function (host) {
      var spec;
      try { spec = JSON.parse(host.dataset.spec); } catch (err) { return; }
      var attempt = host.closest('.attempt');
      var input = attempt && attempt.querySelector('.ans-input');
      var exCard = host.closest('.ex');
      var toggle = exCard && exCard.querySelector('.tb-toggle');
      if (!input) return;

      // Already answered on a previous visit (restoreAnswers() already set input.value/readOnly) —
      // show the plain, now-readonly input rather than reconstructing tile positions from the
      // stored string (a v2 nicety, not required: the answer is still visible and correct either
      // way, just not re-editable via tiles on this visit).
      if (input.value) {
        host.style.display = 'none';
        if (toggle) toggle.style.display = 'none';
        input.hidden = false;
        return;
      }

      TileBuilder.mount(host, input, spec);

      if (toggle) {
        var usingTiles = true;
        toggle.addEventListener('click', function () {
          usingTiles = !usingTiles;
          host.style.display = usingTiles ? '' : 'none';
          input.hidden = usingTiles;
          toggle.innerHTML = usingTiles ? '&#8987; Prefer to type your answer?' : '&#127919; Use the tile builder instead?';
          if (!usingTiles) input.focus();
        });
      }
    });
  });
})();
