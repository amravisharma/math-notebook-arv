/* js/practice-book.js
   Question generators + quiz runners for the Practice Book (multiplication tables 2-20, multiplier
   1-10, squares,
   mental maths) — separate from the chapter-level GEN engine, since these aren't tied to any one
   curriculum topic.

   Squares and Tables use a WORKSHEET view: every question in the set is shown at once (randomised
   selection, no repeats) and each is checked individually as you go — there is no one-at-a-time
   "Check, then advance" flow to click through. Learn mode for these two is a plain reference list
   (every square 1-30, or every fact in the chosen times table) with the answers already shown, for
   studying rather than testing. Squares practice only ever asks for the square (n²) — never the
   square root — per request.

   Practice/Timed and Dodging are both worksheet views that differ only in WHICH facts are chosen,
   whether there's a timer, and one extra "Shuffle again" button — renderFactsGrid() is the single
   shared implementation (card markup, per-item checking, timer, finish/summary) that both
   renderWorksheet() and renderDodging() configure and call, so that behavior lives in one place.

   Mental Maths / Mixed / Weak Area keep the original one-question-at-a-time quiz flow, since that
   wasn't asked to change. */
(function () {
  'use strict';
  var PS = window.ProgressStore;

  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // --- question generators ---

  function tableQ(table) {
    var a = table || ri(2, 20), b = ri(1, 10);
    return { area: 'tables', prompt: a + ' &times; ' + b, answer: a * b, hint: (a * (b - 1)) + ' + ' + a };
  }
  // Squares practice only ever tests the square itself (n²) — no square-root/reverse questions.
  function squareQ(n) {
    n = n || ri(1, 30);
    return { area: 'squares', prompt: n + '&sup2;', answer: n * n, hint: n + ' &times; ' + n };
  }
  var MENTAL = {
    addition: function () { var a = ri(10, 99), b = ri(10, 99); return { area: 'mental', prompt: a + ' + ' + b, answer: a + b }; },
    subtraction: function () { var a = ri(20, 99), b = ri(1, a); return { area: 'mental', prompt: a + ' &minus; ' + b, answer: a - b }; },
    multiplication: function () { var a = ri(2, 20), b = ri(2, 12); return { area: 'mental', prompt: a + ' &times; ' + b, answer: a * b }; },
    division: function () { var b = ri(2, 12), ans = ri(2, 12); return { area: 'mental', prompt: (b * ans) + ' &divide; ' + b, answer: ans }; },
    percentages: function () {
      var pct = pick([10, 20, 25, 50, 75]), base = pick([20, 40, 60, 80, 100, 120, 200]);
      return { area: 'mental', prompt: pct + '% of ' + base, answer: (pct / 100) * base };
    }
  };
  function mentalQ(kind) {
    if (kind && MENTAL[kind]) return MENTAL[kind]();
    var keys = Object.keys(MENTAL); return MENTAL[pick(keys)]();
  }

  var stage = document.getElementById('pq-stage');

  // ============================================================
  // Worksheet view (Squares, Tables): every question shown at once.
  // ============================================================

  var WORKSHEET_COUNT = { practice: 12, timed: 16 };
  var WORKSHEET_SECONDS = { practice: 0, timed: 90 };

  function uniqueSquares(n) {
    return shuffle(Array.from({ length: 30 }, function (_, i) { return i + 1; })).slice(0, n).map(squareQ);
  }
  function uniqueTableFacts(n, table) {
    var pairs = [];
    if (table) {
      pairs = shuffle(Array.from({ length: 10 }, function (_, i) { return i + 1; })).slice(0, n).map(function (b) { return [table, b]; });
    } else {
      var seen = {}, guard = 0;
      while (pairs.length < n && guard++ < 500) {
        var a = ri(2, 20), b = ri(1, 10), key = a + 'x' + b;
        if (seen[key]) continue;
        seen[key] = true; pairs.push([a, b]);
      }
    }
    return pairs.map(function (p) { return { area: 'tables', prompt: p[0] + ' &times; ' + p[1], answer: p[0] * p[1] }; });
  }

  function renderReferenceList(area, opts) {
    stage.classList.add('ws-mode');
    var items, title;
    if (area === 'squares') {
      items = Array.from({ length: 30 }, function (_, i) { var n = i + 1; return { left: n + '&sup2;', right: '= ' + (n * n) }; });
      title = 'Squares 1&sup2; to 30&sup2;';
    } else {
      var table = opts.table;
      items = Array.from({ length: 10 }, function (_, i) { var b = i + 1; return { left: table + ' &times; ' + b, right: '= ' + (table * b) }; });
      title = table + ' times table';
    }
    stage.innerHTML =
      '<div class="ws-head"><h3>' + title + '</h3><span class="muted" style="color:var(--ink-soft)">Reference &mdash; study the pattern, no need to answer</span></div>' +
      '<div class="ws-grid">' + items.map(function (it) {
        return '<div class="ws-ref-item"><span class="ws-ref-l">' + it.left + '</span><span class="ws-ref-r">' + it.right + '</span></div>';
      }).join('') + '</div>' +
      '<div class="mode-row" style="margin-top:18px"><button class="btn" id="ws-back">Back to menu</button></div>';
    document.getElementById('ws-back').onclick = closeStage;
  }

  // Single shared implementation for every worksheet-style session (Practice, Timed, Dodging):
  // builds the .ws-grid of .ws-item cards, wires each one's check() logic, runs the optional timer,
  // and builds the finish/summary flow. Per-mode differences (which facts, timer or not, the extra
  // "Shuffle again" button, restart behaviour) are all passed in via `config` rather than
  // reimplemented — see renderWorksheet()/renderDodging() below, the only two callers.
  function renderFactsGrid(config) {
    stage.classList.add('ws-mode');
    var questions = config.questions, seconds = config.seconds || 0;
    var state = { answered: 0, correct: 0, total: questions.length };
    var timerInterval = null;
    var extraButtons = config.extraButtons || [];

    stage.innerHTML =
      '<div class="ws-head"><h3>' + config.title + '</h3>' +
      '<span class="ws-score" id="ws-score">0 / ' + state.total + ' answered</span></div>' +
      (config.subtitle ? '<p class="muted" style="color:var(--ink-soft);margin:-8px 0 14px">' + config.subtitle + '</p>' : '') +
      (seconds ? '<div class="pq-timerbar"><span class="pq-timerfill" id="ws-timerfill" style="width:100%"></span></div>' : '') +
      '<div class="ws-grid" id="ws-grid"></div>' +
      '<div class="mode-row" style="margin-top:18px"><button class="btn primary" id="ws-finish">Finish</button>' +
      extraButtons.map(function (b) { return '<button class="btn" id="' + b.id + '">' + b.label + '</button>'; }).join('') +
      '<button class="btn" id="ws-back">Back to menu</button></div>';

    var grid = document.getElementById('ws-grid');
    var scoreEl = document.getElementById('ws-score');

    questions.forEach(function (q, i) {
      var card = document.createElement('div');
      card.className = 'ws-item';
      card.innerHTML =
        '<span class="ws-prompt">' + q.prompt + '</span>' +
        '<input class="ws-input" type="number" inputmode="decimal" autocomplete="off" aria-label="Answer for ' + q.prompt.replace(/&[a-z]+;/g, ' ') + '">' +
        '<span class="ws-mark" aria-live="polite"></span>';
      grid.appendChild(card);

      var input = card.querySelector('.ws-input'), mark = card.querySelector('.ws-mark');
      var checked = false;
      function check() {
        if (checked || !input.value.trim()) return;
        checked = true;
        var v = parseFloat(input.value);
        var ok = !isNaN(v) && Math.abs(v - q.answer) < 0.001;
        input.readOnly = true;
        card.classList.add(ok ? 'ok' : 'no');
        mark.innerHTML = ok ? '&#10003;' : ('&#10007; ' + q.answer);
        state.answered++; if (ok) state.correct++;
        recordGymResult(q.area, ok);
        scoreEl.textContent = state.correct + ' / ' + state.answered + ' answered (of ' + state.total + ')';
        if (state.answered >= state.total) finish();
      }
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
      input.addEventListener('blur', check);
    });

    if (seconds) {
      var totalMs = seconds * 1000, startT = Date.now();
      var fill = document.getElementById('ws-timerfill');
      timerInterval = setInterval(function () {
        var left = Math.max(0, totalMs - (Date.now() - startT));
        if (fill) fill.style.width = (left / totalMs * 100) + '%';
        if (left <= 0) finish();
      }, 150);
    }

    document.getElementById('ws-finish').onclick = finish;
    document.getElementById('ws-back').onclick = closeStage;
    extraButtons.forEach(function (b) { document.getElementById(b.id).onclick = b.onClick; });

    function finish() {
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      grid.querySelectorAll('.ws-item').forEach(function (card, i) {
        var input = card.querySelector('.ws-input'), mark = card.querySelector('.ws-mark');
        if (!input.readOnly) {
          input.readOnly = true;
          card.classList.add('skip');
          mark.innerHTML = 'Answer: ' + questions[i].answer;
        }
      });
      var pct = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
      var summary = document.createElement('div');
      summary.className = 'ws-summary';
      summary.innerHTML = '<h3>' + config.summaryTitle + '</h3><div class="pq-score">' + state.correct + ' / ' + state.total + '</div>' +
        '<p class="muted" style="color:var(--ink-soft)">' + pct + '% correct of the ' + state.answered + ' you answered</p>' +
        '<div class="mode-row" style="justify-content:center"><button class="btn primary" id="ws-again">' + config.restartLabel + '</button><button class="btn" id="ws-menu">Back to menu</button></div>';
      stage.appendChild(summary);
      document.getElementById('ws-finish').disabled = true;
      extraButtons.forEach(function (b) { document.getElementById(b.id).disabled = true; });
      document.getElementById('ws-again').onclick = config.onRestart;
      document.getElementById('ws-menu').onclick = closeStage;
      summary.scrollIntoView({ block: 'nearest' });
    }
  }

  function renderWorksheet(area, modeKey, opts) {
    opts = opts || {};
    var n = WORKSHEET_COUNT[modeKey] || 12;
    var questions = area === 'squares' ? uniqueSquares(n) : uniqueTableFacts(n, opts.table);
    renderFactsGrid({
      questions: questions,
      seconds: WORKSHEET_SECONDS[modeKey] || 0,
      title: (area === 'squares' ? 'Squares' : 'Tables') + ' &mdash; ' + (modeKey === 'timed' ? 'Timed' : 'Practice'),
      summaryTitle: 'Session complete',
      restartLabel: 'New set',
      onRestart: function () { renderWorksheet(area, modeKey, opts); }
    });
  }

  // Dodging (Squares, Tables): every fact of ONE table (or all 30 squares) shown at once, but in a
  // shuffled, non-sequential order — unlike Learn (in order, answers shown) or Practice/Timed (a
  // random subset mixed across all tables/squares). "Shuffle again" re-draws a fresh random order of
  // the same full fact set for repeat drilling, without touching anything outside this worksheet.
  function renderDodging(area, opts) {
    opts = opts || {};
    var questions = area === 'squares' ? uniqueSquares(30) : uniqueTableFacts(10, opts.table);
    renderFactsGrid({
      questions: questions,
      seconds: 0,
      title: (area === 'squares' ? 'Squares' : (opts.table + ' times table')) + ' &mdash; Dodging',
      subtitle: 'All facts, shuffled out of order &mdash; a true test of recall, not counting.',
      summaryTitle: 'Dodging complete',
      restartLabel: 'Shuffle again',
      extraButtons: [{ id: 'ws-shuffle', label: 'Shuffle again', onClick: function () { renderDodging(area, opts); } }],
      onRestart: function () { renderDodging(area, opts); }
    });
  }

  // Hides the whole stage (not just clearing its content) so a finished session doesn't leave an
  // empty bordered box sitting on the page — the wrapper (not #pq-stage itself, which every render
  // function overwrites via innerHTML) also hosts the fixed "x" close button.
  // Fires whenever the stage closes (any "Back to menu" button, or the page's own "x" close
  // button), regardless of which one triggered it — lets practice.html refresh its accuracy pills
  // and hero stats without polling, via onClose() below.
  var onCloseCallback = null;
  function closeStage() {
    stage.innerHTML = ''; stage.classList.remove('ws-mode');
    var wrap = document.getElementById('stage-wrap');
    if (wrap) wrap.style.display = 'none';
    var anchor = document.querySelector('.inner');
    if (anchor) anchor.scrollIntoView({ block: 'start', behavior: 'smooth' });
    if (onCloseCallback) onCloseCallback();
  }

  // ============================================================
  // One-at-a-time quiz (Mental Maths, Mixed, Weak Area) — unchanged flow.
  // ============================================================

  var MODES = { learn: { seconds: 0, label: 'Learn' }, practice: { seconds: 20, label: 'Practice' }, timed: { seconds: 8, label: 'Timed' } };
  var session = null;
  var timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function buildSet(area, opts) {
    var n = opts.count || 10, out = [];
    for (var i = 0; i < n; i++) {
      if (area === 'mental') out.push(mentalQ(opts.kind));
      else out.push(pick([tableQ(), squareQ(), mentalQ()]));
    }
    return out;
  }

  function startQuiz(area, modeKey, opts) {
    opts = opts || {};
    var questions = buildSet(area, opts);
    session = { index: 0, correct: 0, mode: MODES[modeKey] || MODES.practice, area: opts.gymArea || area, questions: questions };
    renderQuestion();
  }

  function renderQuestion() {
    stopTimer();
    stage.classList.remove('ws-mode');
    var q = session.questions[session.index];
    stage.innerHTML =
      '<div class="pq-meta"><span>Question ' + (session.index + 1) + ' / ' + session.questions.length + '</span><span>' + session.mode.label + '</span></div>' +
      (session.mode.seconds ? '<div class="pq-timerbar"><span class="pq-timerfill" id="pq-timerfill" style="width:100%"></span></div>' : '') +
      '<div class="pq-prompt">' + q.prompt + '</div>' +
      '<input class="pq-input" id="pq-input" type="number" inputmode="decimal" autocomplete="off" aria-label="Your answer">' +
      '<p class="pq-feedback" id="pq-feedback" role="status"></p>' +
      '<div class="mode-row"><button class="btn primary" id="pq-check">Check</button><button class="btn" id="pq-skip">Skip</button></div>';

    var input = document.getElementById('pq-input'), feedback = document.getElementById('pq-feedback');
    input.focus();

    function grade() {
      var v = parseFloat(input.value);
      var ok = !isNaN(v) && Math.abs(v - q.answer) < 0.001;
      if (ok) session.correct++;
      feedback.className = 'pq-feedback ' + (ok ? 'ok' : 'no');
      feedback.innerHTML = ok ? 'Correct!' : ('Answer: ' + q.answer + (q.hint ? ' (' + q.hint + ')' : ''));
      recordGymResult(session.area, ok);
      document.getElementById('pq-check').disabled = true;
      input.readOnly = true;
      setTimeout(advance, ok ? 500 : 1400);
    }
    document.getElementById('pq-check').onclick = grade;
    document.getElementById('pq-skip').onclick = function () { recordGymResult(session.area, false); advance(); };
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') grade(); });

    if (session.mode.seconds) {
      var total = session.mode.seconds * 1000, startT = Date.now();
      var fill = document.getElementById('pq-timerfill');
      timer = setInterval(function () {
        var left = Math.max(0, total - (Date.now() - startT));
        if (fill) fill.style.width = (left / total * 100) + '%';
        if (left <= 0) { stopTimer(); feedback.className = 'pq-feedback no'; feedback.innerHTML = "Time's up! Answer: " + q.answer; recordGymResult(session.area, false); setTimeout(advance, 1200); }
      }, 100);
    }
  }

  function advance() {
    session.index++;
    if (session.index < session.questions.length) renderQuestion();
    else finishQuiz();
  }

  function finishQuiz() {
    stopTimer();
    var total = session.questions.length, pct = Math.round((session.correct / total) * 100);
    stage.innerHTML = '<div class="pq-summary"><h3>Session complete</h3><div class="pq-score">' + session.correct + ' / ' + total + '</div>' +
      '<p class="muted" style="color:var(--ink-soft)">' + pct + '% correct</p>' +
      '<div class="mode-row" style="justify-content:center"><button class="btn primary" id="pq-again">Try again</button><button class="btn" id="pq-back">Back to menu</button></div></div>';
    document.getElementById('pq-again').onclick = function () { startQuiz(session.area, 'practice'); };
    document.getElementById('pq-back').onclick = closeStage;
  }

  // ============================================================

  function recordGymResult(area, correct) {
    var s = PS.load();
    var g = s.gym[area] || { attempts: 0, correct: 0 };
    g.attempts++; if (correct) g.correct++;
    s.gym[area] = g;
    PS.markDailyActive();
    PS.addXp(correct ? 5 : 1);
    PS.save();
  }

  // Returns { attempts, correct, pct } for a gym area, or null if it has no attempts yet — used by
  // the practice-card accuracy pills and by weakestArea() below, instead of each computing its own
  // copy of this from PS.load().gym.
  function computeGymStat(area) {
    var g = PS.load().gym[area] || { attempts: 0, correct: 0 };
    if (!g.attempts) return null;
    return { attempts: g.attempts, correct: g.correct, pct: Math.round((g.correct / g.attempts) * 100) };
  }

  // The gym area with the most wrong answers so far (an area with no attempts counts as 0 wrong) —
  // used both to actually start Weak Area Practice and to show which area it would pick, and why,
  // before the button is even clicked.
  function weakestArea() {
    var areas = ['tables', 'squares', 'mental'];
    return areas.reduce(function (best, a) {
      var g = computeGymStat(a) || { attempts: 0, correct: 0 };
      var bg = computeGymStat(best) || { attempts: 0, correct: 0 };
      return (g.attempts - g.correct) > (bg.attempts - bg.correct) ? a : best;
    }, 'tables');
  }

  // Public entry point used by practice.html. Squares and Tables route to the worksheet view;
  // everything else keeps the original one-at-a-time quiz.
  function start(area, modeKey, opts) {
    opts = opts || {};
    if ((area === 'squares' || area === 'tables') && modeKey === 'learn') { renderReferenceList(area, opts); return; }
    if ((area === 'squares' || area === 'tables') && modeKey === 'dodging') { renderDodging(area, opts); return; }
    if (area === 'squares' || area === 'tables') { renderWorksheet(area, modeKey, opts); return; }
    startQuiz(area, modeKey, opts);
  }
  window.PracticeBook = {
    start: start, close: closeStage, computeGymStat: computeGymStat, weakestArea: weakestArea,
    onClose: function (fn) { onCloseCallback = fn; }
  };
})();
