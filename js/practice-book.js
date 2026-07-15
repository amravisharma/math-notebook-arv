/* js/practice-book.js
   Question generators + quiz runner for the Practice Book (multiplication tables 2-25, squares,
   mental maths) — separate from the chapter-level GEN engine, since these aren't tied to any one
   curriculum topic. Modes: Learn (no timer), Random Practice, Timed Practice, Mixed Practice,
   Weak Area Practice (biased toward topics/tables with more wrong answers on record). */
(function () {
  'use strict';
  var PS = window.ProgressStore;

  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function tableQ(table) {
    var a = table || ri(2, 25), b = ri(1, 12);
    return { area: 'tables', prompt: a + ' &times; ' + b, answer: a * b, hint: (a * (b - 1)) + ' + ' + a };
  }
  function squareQ(reverse) {
    var n = ri(1, 30);
    if (reverse) return { area: 'squares', prompt: '&radic;' + (n * n), answer: n, hint: 'Which number times itself gives ' + (n * n) + '?' };
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

  var MODES = {
    learn: { seconds: 0, label: 'Learn' },
    practice: { seconds: 20, label: 'Practice' },
    timed: { seconds: 8, label: 'Timed' }
  };

  var stage = document.getElementById('pq-stage');
  var session = null;

  function buildSet(area, opts) {
    var n = opts.count || 10, out = [];
    for (var i = 0; i < n; i++) {
      if (area === 'tables') out.push(tableQ(opts.table));
      else if (area === 'squares') out.push(squareQ(opts.reverse !== undefined ? opts.reverse : Math.random() < 0.35));
      else if (area === 'mental') out.push(mentalQ(opts.kind));
      else out.push(pick([tableQ(), squareQ(Math.random() < 0.3), mentalQ()]));
    }
    return out;
  }

  function start(area, modeKey, opts) {
    opts = opts || {};
    var questions = buildSet(area, opts);
    session = { index: 0, correct: 0, mode: MODES[modeKey] || MODES.practice, area: opts.gymArea || area, questions: questions };
    renderQuestion();
  }
  window.PracticeBook = { start: start };

  var timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function renderQuestion() {
    stopTimer();
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

  function recordGymResult(area, correct) {
    var s = PS.load();
    var g = s.gym[area] || { attempts: 0, correct: 0 };
    g.attempts++; if (correct) g.correct++;
    s.gym[area] = g;
    PS.markDailyActive();
    PS.addXp(correct ? 5 : 1);
    PS.save();
  }

  function advance() {
    session.index++;
    if (session.index < session.questions.length) renderQuestion();
    else finish();
  }

  function finish() {
    stopTimer();
    var total = session.questions.length, pct = Math.round((session.correct / total) * 100);
    stage.innerHTML = '<div class="pq-summary"><h3>Session complete</h3><div class="pq-score">' + session.correct + ' / ' + total + '</div>' +
      '<p class="muted" style="color:var(--ink-soft)">' + pct + '% correct</p>' +
      '<div class="mode-row" style="justify-content:center"><button class="btn primary" id="pq-again">Try again</button><button class="btn" id="pq-back">Back to menu</button></div></div>';
    document.getElementById('pq-again').onclick = function () { start(session.questions[0].area, 'practice'); };
    document.getElementById('pq-back').onclick = function () { stage.innerHTML = ''; stage.scrollIntoView({ block: 'start' }); };
  }
})();
