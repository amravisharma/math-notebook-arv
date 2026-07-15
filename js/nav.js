/* js/nav.js
   Shared persistent sidebar: page links, chapter list grouped by strand, search-filter, mobile
   toggle, and read-progress ticks. Expects `window.SITE_ROOT` ('' at root, '../' inside topics/)
   and `window.TOC_STRANDS` (from js/toc-data.js) to be set before this script runs. If the current
   page is a topic chapter, `window.CURRENT_TOPIC_ID` marks which nav-link is active. */
(function () {
  'use strict';
  var ROOT = window.SITE_ROOT || '';
  var nav = document.getElementById('nav');
  if (!nav || !window.TOC_STRANDS) return;

  var PAGES = [
    ['index.html', '🏠 Cover'],
    ['contents.html', '📑 Contents'],
    ['practice.html', '✏️ Practice Book'],
    ['progress.html', '📊 Progress'],
    ['about.html', 'ℹ️ About']
  ];
  var pageWrap = document.createElement('div');
  pageWrap.className = 'nav-pages';
  var here = (location.pathname.split('/').pop() || 'index.html');
  PAGES.forEach(function (p) {
    var a = document.createElement('a');
    a.className = 'nav-link'; a.href = ROOT + p[0]; a.textContent = p[1];
    if (here === p[0]) a.classList.add('active');
    pageWrap.appendChild(a);
  });
  nav.appendChild(pageWrap);

  var links = [];
  window.TOC_STRANDS.forEach(function (group) {
    var s = document.createElement('div');
    s.className = 'nav-strand';
    s.style.setProperty('--strand', group.color);
    s.innerHTML = '<div class="label">' + group.strand + '</div>';
    group.topics.forEach(function (t) {
      var a = document.createElement('a');
      a.className = 'nav-link';
      a.href = ROOT + 'topics/' + t.id + '.html';
      a.dataset.id = t.id;
      a.dataset.search = (t.name + ' ' + (t.idea || '')).toLowerCase();
      a.innerHTML = '<span class="tick">✓</span><span class="name">' + t.name + '</span>';
      if (window.CURRENT_TOPIC_ID === t.id) a.classList.add('active');
      s.appendChild(a);
      links.push(a);
    });
    nav.appendChild(s);
  });

  function refreshTicks() {
    if (!window.ProgressStore) return;
    links.forEach(function (a) {
      var id = a.dataset.id; if (!id) return;
      a.classList.toggle('done', window.ProgressStore.topicAnsweredCount(id) >= window.ProgressStore.QUESTIONS_PER_TOPIC);
    });
  }
  refreshTicks();

  var search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      links.forEach(function (l) { if (l.dataset.search) l.style.display = (!q || l.dataset.search.indexOf(q) !== -1) ? '' : 'none'; });
      document.querySelectorAll('.nav-strand').forEach(function (g) {
        var any = Array.prototype.some.call(g.querySelectorAll('.nav-link'), function (l) { return l.style.display !== 'none'; });
        g.style.display = any ? '' : 'none';
      });
    });
  }

  var navtoggle = document.getElementById('navtoggle'), scrim = document.getElementById('scrim');
  if (navtoggle) navtoggle.onclick = function () { document.body.classList.toggle('nav-open'); };
  if (scrim) scrim.onclick = function () { document.body.classList.remove('nav-open'); };
  nav.addEventListener('click', function (e) {
    if (e.target.closest('.nav-link')) document.body.classList.remove('nav-open');
  });

  window.NavBar = { refreshTicks: refreshTicks };
})();
