# 📚 The Maths Notebook

An interactive mathematics notebook covering the New Zealand Years 6–8 mathematics curriculum.

The notebook is designed to help students understand mathematical concepts through simple explanations, worked examples, visual learning, and interactive practice.

The book is a genuine multi-page static site: a cover page, table of contents, 24 chapter pages (one
per topic), a Practice Book, a Progress page and an About page — plain HTML/CSS/JavaScript, no
frameworks, no backend, no build step. Runs entirely in the browser; progress saves to this device only.

## Running locally

```bash
node tools/dev-server.mjs        # http://127.0.0.1:8000/
```

No npm install needed — the dev server is a small dependency-free Node script.

## Project structure

```
index.html, contents.html, practice.html, progress.html, about.html   (top-level pages)
topics/<id>.html          24 chapter pages, one per curriculum topic
css/styles.css            shared styles
js/
  toc-data.js              generated topic index (do not hand-edit)
  progress-store.js        localStorage progress (XP, streak, badges, bookmarks, answers)
  nav.js                   shared sidebar (search, active-page highlight)
  topic-interactions.js    mark-answer / reveal / tabs / collapse, on every chapter page
  quiz-engine.js           seeded question generators + SVG figures, for the 6 "dynamic" chapters
  practice-book.js         Practice Book question generators (tables/squares/mental)
_source/                  archived copy of the original single-page prototype
tools/
  generate-book.mjs        regenerates all 24 chapter pages + cover/contents/about from _source/
  validate-book.mjs        structural check over the generated output
  dev-server.mjs           local static server
```

Six chapters (Coordinates & Graphs, Angles, Shapes, Transformations, Pythagoras, Circles) generate
fresh randomised practice questions client-side each time their stored seed changes (i.e. after
Reset); the other 18 use a fixed, pre-written question bank baked directly into their page.

To regenerate the 24 chapter pages (e.g. after editing `_source/original-single-page.html`):

```bash
node tools/generate-book.mjs
node tools/validate-book.mjs
```

## Features

- 📖 Covers the New Zealand Years 6–8 mathematics curriculum
- 🎯 Interactive practice questions
- ✅ Instant answer checking
- 📝 Step-by-step worked solutions
- 📚 Concept-first learning approach
- 📊 Progress tracking
- 📱 Responsive design for desktop and mobile
- ⚡ Fast, lightweight and browser-based

## Topics Covered

- Whole Numbers
- Fractions
- Decimals
- Percentages
- Ratios and Proportions
- Integers
- Algebra
- Equations
- Geometry
- Measurement
- Statistics
- Probability

## Current Status

This project is an evolving interactive mathematics notebook.

The current focus is on creating high-quality learning material that is simple, engaging, and easy for students to use.

Future versions may introduce additional interactive features and improvements while keeping the notebook lightweight and easy to access.

---

*"Understanding mathematics should feel rewarding, not intimidating."*