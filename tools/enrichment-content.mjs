// tools/enrichment-content.mjs
//
// Per-topic enrichment content adapted from four well-regarded curricula, added at the user's
// request ("accommodate the best from these resources"):
//
//   NOTICE_WONDER — Illustrative Mathematics' "Notice and Wonder" warm-up routine: an open scene
//     with the two low-stakes prompts, BEFORE the directed Discover prediction. Sample noticings/
//     wonderings sit behind a reveal so the learner looks first.
//   GO_FURTHER — NRICH's low-threshold-high-ceiling open investigations: everyone can start, no
//     one can completely finish. One accessible prompt + one ceiling-raising extension each.
//   MENTAL_TIPS — Math Mammoth's explicit mental-calculation strategies, one per topic, shown in
//     the Read-the-Chapter section.
//   CPA_PANELS — Singapore Math's Concrete → Pictorial → Abstract progression, for the four topics
//     where a bar model is the classic bridge (fractions, ratios, percentages, equations).
//
// All static HTML strings consumed by tools/generate-book.mjs (same pattern as lesson-content.mjs).

// Each entry: { scene, notice: [..], wonder: [..] }
export const NOTICE_WONDER = {
  'place-value': {
    scene: 'Three price tags in the same shop window: <b>$404</b>, <b>$440</b> and <b>$44</b>.',
    notice: ['All three use only the digits 4 and 0', 'The same digit 4 is worth $400, $40 or $4 depending on where it stands'],
    wonder: ['Why does moving a digit one place change its value?', 'What exactly is the 0 doing in $404?']
  },
  operations: {
    scene: 'Two students type <b>6 + 4 &times; 3</b> into two different calculators. One shows <b>30</b>, the other shows <b>18</b>.',
    notice: ['Exactly the same keys were pressed', 'One calculator added first; the other multiplied first'],
    wonder: ['Which answer is right — and who decides?', 'How does a machine know what to do first?']
  },
  factors: {
    scene: '12 chocolates can be boxed as 1&times;12, 2&times;6 or 3&times;4. But 13 chocolates? Only 1&times;13.',
    notice: ['12 makes several neat rectangles', '13 makes just one long strip'],
    wonder: ['Which other numbers behave like 13?', 'Is there a biggest number that only makes one rectangle?']
  },
  fractions: {
    scene: 'Two identical pizzas. One is cut into 4 big slices, the other into 8 thin ones. You take 1 big slice; your friend takes 2 thin ones.',
    notice: ['The slices are different sizes and counts', 'You both ate exactly the same amount of pizza'],
    wonder: ['How many eighths would match 3 of the big quarters?', 'Which different-looking fractions are secretly the same number?']
  },
  decimals: {
    scene: 'A 100&nbsp;m sprint final finishes: <b>10.58</b>, <b>10.6</b>, <b>10.549</b> seconds.',
    notice: ['The times differ only after the decimal point', '10.6 is written shortest but is not the smallest'],
    wonder: ['How do you order them fairly?', 'Does writing 10.6 as 10.60 change anything?']
  },
  percentages: {
    scene: 'The same $80 jacket in two shops: one sign says <b>&ldquo;25% off&rdquo;</b>, the other says <b>&ldquo;$20 off&rdquo;</b>.',
    notice: ['Both discounts turn out identical on this jacket', 'One is written as a rate, the other as an amount'],
    wonder: ['Would they still match on a $60 jacket?', 'What is 25% actually <em>of</em>?']
  },
  ratios: {
    scene: 'A cordial bottle says: <b>mix 1 part cordial with 4 parts water</b>. No litres, no cups — just &ldquo;parts&rdquo;.',
    notice: ['No actual amounts are given, only a relationship', 'Whatever a &ldquo;part&rdquo; is, the drink is 5 parts altogether'],
    wonder: ['How much cordial goes in a 1-litre jug?', 'Why does doubling both amounts keep the taste the same?']
  },
  integers: {
    scene: 'A lift panel reads 3, 2, 1, G, &minus;1, &minus;2. A weather app reads &minus;5&deg; overnight, 3&deg; at lunch.',
    notice: ['Numbers keep going below zero and below the ground floor', 'G behaves like a zero'],
    wonder: ['How big is the jump from &minus;5&deg; to 3&deg;?', 'What could subtracting a negative number possibly mean?']
  },
  powers: {
    scene: 'Fold a sheet of paper in half, again, and again — 5 folds. The layers count 2, 4, 8, 16, 32.',
    notice: ['Each fold doubles the layers', 'The growth gets faster every step'],
    wonder: ['How many layers after 10 folds?', 'Why can almost nobody fold paper more than 7 times?']
  },
  patterns: {
    scene: 'A theatre&rsquo;s rows hold 10 seats, then 14, then 18, then 22&hellip;',
    notice: ['Each row gains exactly 4 seats', 'The first row starts at 10, not 4'],
    wonder: ['How many seats in row 50 — without listing 50 rows?', 'Is there a rule that jumps straight from the row number to the seat count?']
  },
  expressions: {
    scene: 'A taxi meter shows <b>$4.00</b> the moment you sit down, then climbs <b>$2</b> for every kilometre.',
    notice: ['Part of the cost is fixed, part keeps changing', 'The fare is predictable if you know the distance'],
    wonder: ['How could you write the fare for <em>any</em> distance?', 'How do you write &ldquo;double a number, then add 3&rdquo; in symbols?']
  },
  equations: {
    scene: 'A balance scale sits perfectly level: a sealed bag plus 4 identical coins on the left, 10 of the same coins on the right.',
    notice: ['Level pans mean the two sides weigh the same', 'The bag&rsquo;s weight is unknown but fixed'],
    wonder: ['How many coins&rsquo; worth is inside the bag?', 'Which moves could you make without tipping the scale?']
  },
  inequalities: {
    scene: 'A rollercoaster sign: <b>&ldquo;You must be at least 120 cm tall to ride.&rdquo;</b>',
    notice: ['Many different heights are allowed — not one exact height', 'Exactly 120 cm counts as allowed'],
    wonder: ['How would you write &ldquo;at least 120&rdquo; in symbols?', 'Is there an upper limit hiding in the rule?']
  },
  graphs: {
    scene: 'A running app draws a distance&ndash;time graph: a steep start, a flat stretch in the middle, a gentle finish.',
    notice: ['The line&rsquo;s steepness keeps changing', 'The flat part means the distance stopped growing'],
    wonder: ['What does steepness measure?', 'Where was the runner fastest — and how can you tell without numbers?']
  },
  angles: {
    scene: 'Open a pair of scissors slowly. Four angles form at the pivot — two grow while the other two shrink.',
    notice: ['The angles opposite each other stay equal', 'Neighbouring angles seem to trade: one gains what the other loses'],
    wonder: ['Do the four angles always total the same amount?', 'What do two neighbouring angles add up to?']
  },
  shapes: {
    scene: 'Square tiles cover a floor perfectly. Regular pentagon tiles always leave gaps, no matter how you turn them.',
    notice: ['Square corners meet snugly around a point', 'Pentagon corners never quite fit'],
    wonder: ['What must corner angles satisfy to meet with no gap?', 'Why do bees build with hexagons?']
  },
  transformations: {
    scene: 'Pinch-zoom a photo to exactly double its size. It looks the same — just bigger — and suddenly needs four times the screen.',
    notice: ['The shape and proportions never changed', 'Doubling the size quadrupled the space it covers'],
    wonder: ['Why 4 times and not 2 times?', 'Which changes leave a shape completely unchanged in size?']
  },
  pythagoras: {
    scene: 'A builder marks 3 m along one wall and 4 m along the other, then measures between the marks: exactly <b>5 m</b>. &ldquo;Corner&rsquo;s square,&rdquo; she says.',
    notice: ['3, 4 and 5 are all whole numbers', 'The diagonal measurement was used to <em>test</em> the corner'],
    wonder: ['9 + 16 = 25 — coincidence?', 'Would 5 and 12 metres give another whole-number diagonal?']
  },
  circles: {
    scene: 'Wrap string around any tin, then across its middle. The around-string is always a bit more than 3 times the across-string — every tin, every size.',
    notice: ['The ratio never changes with the tin&rsquo;s size', 'It&rsquo;s always &ldquo;3 and a bit&rdquo;'],
    wonder: ['What exactly is that &ldquo;3 and a bit&rdquo; number?', 'Does it hold for a giant Ferris wheel too?']
  },
  'perimeter-area': {
    scene: 'Two paddocks each use exactly 40 m of fence: one is 10&times;10, the other 18&times;2.',
    notice: ['Both use identical amounts of fence', 'The space inside is wildly different: 100 m&sup2; vs 36 m&sup2;'],
    wonder: ['Which shape gives the most space for a fixed fence?', 'Can a shape&rsquo;s perimeter grow while its area shrinks?']
  },
  volume: {
    scene: 'A tall thin glass and a short wide tumbler both claim <b>300 ml</b> on the label.',
    notice: ['Completely different shapes, same capacity', 'Height alone clearly doesn&rsquo;t decide how much fits'],
    wonder: ['What is a millilitre actually counting?', 'How could you check the labels without pouring?']
  },
  conversions: {
    scene: 'A recipe says 250 ml, the jug is marked in litres, and a road sign just says <b>100</b> — 100 <em>what</em>?',
    notice: ['The same amount can wear many unit names', 'A number without its unit is almost meaningless'],
    wonder: ['How do you switch units without changing the amount?', 'Why is it &times;1000 between some units and &times;100 between others?']
  },
  statistics: {
    scene: 'A street has nine $600,000 houses and one $5,000,000 mansion. An ad claims: <b>&ldquo;average price over $1 million!&rdquo;</b>',
    notice: ['Not a single ordinary house costs $1 million', 'One mansion drags the figure up on its own'],
    wonder: ['Is the ad lying, or using a legal trick?', 'What number would honestly represent a typical house?']
  },
  probability: {
    scene: 'The weather app said <b>30% chance of rain</b>. It didn&rsquo;t rain. Your friend says the app was wrong.',
    notice: ['30% is not a promise of rain — or of dryness', 'One day can&rsquo;t prove a percentage right or wrong'],
    wonder: ['What is the app actually claiming?', 'How could you test the app&rsquo;s honesty over a whole month?']
  }
};

// Each entry: { prompt, extension } — low floor, high ceiling.
export const GO_FURTHER = {
  'place-value': {
    prompt: 'Using the digits 1, 2, 3 and 4 exactly once each, make the biggest possible 4-digit number, the smallest, and then a <em>pair</em> of 4-digit numbers whose difference is as small as you can manage.',
    extension: 'Swap the 1 for a 0 and repeat — what changes? Then convince someone your smallest difference really is the smallest possible.'
  },
  operations: {
    prompt: 'Using exactly four 4s and any operations you like — for example (4 + 4) &divide; 4 + 4 = 6 — try to make every whole number from 1 to 20.',
    extension: 'Which target is hardest? Design a &ldquo;four 3s&rdquo; version and find which targets become impossible.'
  },
  factors: {
    prompt: 'Hunt for numbers with exactly <em>three</em> factors (no more, no fewer). Find several and describe what they have in common.',
    extension: 'Now exactly five factors. Which kind of number always has an odd number of factors — and why must that be?'
  },
  fractions: {
    prompt: 'The ancient Egyptians only used fractions with 1 on top. Write 5&frasl;6 as a sum of <em>different</em> unit fractions (start with 1&frasl;2 + 1&frasl;3).',
    extension: 'Try 4&frasl;5, then 4&frasl;13. Do you think every fraction less than 1 can be written this way?'
  },
  decimals: {
    prompt: 'Find a decimal between 0.4 and 0.5. Now find one between 0.44 and 0.45. Keep going as long as you can.',
    extension: 'Can you <em>always</em> squeeze another decimal between two different decimals? How many fit? What does that say about the number line?'
  },
  percentages: {
    prompt: 'A shop raises all prices by 20%, then advertises a &ldquo;20% off everything&rdquo; sale. Investigate what happens to a $100 item. Cheaper, dearer, or back to the start?',
    extension: 'Find the single percentage change that equals +30% followed by &minus;30%. Does the order of the two changes ever matter?'
  },
  ratios: {
    prompt: 'Paint A is blue and white mixed 1 : 2. Paint B is blue and white mixed 2 : 3. Mix one cup of A with one cup of B — what is the blue : white ratio now?',
    extension: 'By mixing different amounts of A and B, which blue : white ratios can you reach? Which are impossible, no matter what?'
  },
  integers: {
    prompt: 'Place the nine integers &minus;4, &minus;3, &minus;2, &minus;1, 0, 1, 2, 3, 4 in a 3&times;3 grid so every row, column and diagonal sums to 0.',
    extension: 'What other target sums are possible with nine consecutive integers? Which nine integers would give row-sums of 15?'
  },
  powers: {
    prompt: '2&sup1;&#8304; = 1024, which is very close to 1000. Use that lucky fact to estimate 2&sup2;&#8304; and 2&sup3;&#8304; without multiplying everything out.',
    extension: 'Roughly how many digits does 2&sup1;&#8304;&#8304; have? Track how the little &ldquo;1024 vs 1000&rdquo; error grows as you go.'
  },
  patterns: {
    prompt: 'Everyone in a room shakes hands with everyone else exactly once. Count the handshakes for 2, 3, 4 and 5 people. What&rsquo;s going on?',
    extension: 'Find a rule for n people, and explain why these &ldquo;triangle numbers&rdquo; also count the dots in triangular stacks.'
  },
  expressions: {
    prompt: 'Try this on someone: think of a number, double it, add 6, halve the result, subtract your starting number. The answer is always 3 — check it, then use algebra to explain why.',
    extension: 'Design your own trick that always lands on 7, and prove it works for every starting number.'
  },
  equations: {
    prompt: 'Two numbers have a sum of 20 and a difference of 6. Find them — then find a method that isn&rsquo;t just guessing.',
    extension: 'For sum s and difference d, write the general solution. When is a whole-number answer impossible?'
  },
  inequalities: {
    prompt: 'A rectangle has whole-number sides and a perimeter less than 20. Investigate which areas are possible.',
    extension: 'What is the biggest achievable area? Predict the answer for perimeter less than P, then test your prediction.'
  },
  graphs: {
    prompt: 'Plot y = 2x + 1 and y = x + 3 on the same grid. Where do they cross — and what does that crossing point <em>mean</em>?',
    extension: 'When do two lines never cross at all? Design three lines that form a triangle with (0, 0) trapped inside.'
  },
  angles: {
    prompt: 'Which regular polygons can tile a floor alone, with no gaps? Test the triangle, square, pentagon and hexagon using their interior angles.',
    extension: 'Which <em>pairs</em> of regular polygons tile together (octagons and squares, say)? What must the angles meeting at a point always satisfy?'
  },
  shapes: {
    prompt: 'On a 3&times;3 grid of dots, how many genuinely different triangles can you draw (corners on dots)? Decide what &ldquo;different&rdquo; should mean before you count.',
    extension: 'Now count quadrilaterals. Does your answer change if reflections count as &ldquo;the same&rdquo;?'
  },
  transformations: {
    prompt: 'Which capital letters look unchanged in a mirror? Which look unchanged after a half-turn? Sort the whole alphabet.',
    extension: 'Design a logo that survives <em>both</em> a mirror flip and a half-turn. What&rsquo;s geometrically special about O, H, I and X?'
  },
  pythagoras: {
    prompt: 'Find every right-angled triangle with whole-number sides in which one of the short sides is 12.',
    extension: 'Every odd number from 3 up starts a triple: 3-4-5, 5-12-13, 7-24-25&hellip; Spot the pattern in the two larger numbers and predict the triple that starts with 9.'
  },
  circles: {
    prompt: 'A goat is tied by a 5 m rope to the outside corner of a 4 m &times; 4 m shed. Sketch the region it can graze, then find its area.',
    extension: 'Lengthen the rope to 10 m — it now wraps around corners. How many circle-pieces make up the grazing area now?'
  },
  'perimeter-area': {
    prompt: 'You have 36 m of fence. List every whole-number rectangle you could enclose, and find which has the most area.',
    extension: 'Can any non-rectangular shape beat your best rectangle? What changes if one side of the paddock is a wall needing no fence?'
  },
  volume: {
    prompt: 'A 3&times;3&times;3 cube is painted on the outside, then cut into 27 unit cubes. How many little cubes have paint on 3 faces? 2? 1? 0?',
    extension: 'Answer for an n&times;n&times;n cube with four formulas — then check your formulas add up to exactly n&sup3;.'
  },
  conversions: {
    prompt: 'You stroll at about 1.2 metres per second. Estimate your speed in km/h, and how long you&rsquo;d need to walk 100 km.',
    extension: 'A snail manages 1 mm per second. How far is that per year, in km? List every assumption your answer quietly relies on.'
  },
  statistics: {
    prompt: 'Invent a data set of five whole numbers with mean 10 and median 7.',
    extension: 'Now demand mean 10, median 7, mode 5 <em>and</em> range 20 simultaneously. Which combinations of the four are impossible, and why?'
  },
  probability: {
    prompt: 'Roll two dice and add them. Which total should win most often? Predict first, then check by listing all 36 outcomes.',
    extension: 'Design a fair betting game for totals 2&ndash;12 where rarer totals pay more. Then investigate the <em>difference</em> of two dice instead.'
  }
};

// One explicit mental-calculation strategy per topic.
export const MENTAL_TIPS = {
  'place-value': 'To multiply by 10, don&rsquo;t &ldquo;add a zero&rdquo; &mdash; shift every digit one place left. It works for decimals too: 3.5 &times; 10 = 35, not 3.50.',
  operations: 'Scan the whole expression before touching it: brackets? exponents? Then make one left-to-right sweep for &times; and &divide;, and a final sweep for + and &minus;.',
  factors: 'Divisibility at a glance: ends in an even digit &rarr; &divide;2 works; digit-sum divisible by 3 &rarr; &divide;3 works; ends in 0 or 5 &rarr; &divide;5 works.',
  fractions: 'To compare two fractions fast, cross-multiply: for 3&frasl;5 vs 5&frasl;8, compare 3&times;8 = 24 with 5&times;5 = 25 &mdash; so 5&frasl;8 is bigger.',
  decimals: 'Use money as your model: 0.5 is 50 cents and 0.45 is 45 cents &mdash; suddenly it&rsquo;s obvious which is bigger.',
  percentages: 'Build everything from 10% (just divide by 10): 35% = three 10%s plus half of one. Bonus: a% of b always equals b% of a, so 8% of 25 = 25% of 8 = 2.',
  ratios: 'Always add the parts first. Sharing in 2 : 3? Say &ldquo;5 parts&rdquo; before anything else, find one part, then multiply up.',
  integers: 'Read &ldquo;&minus; (&minus;&hellip;&rdquo; as a plus: 5 &minus; (&minus;3) = 5 + 3 = 8. Taking away a debt leaves you richer.',
  powers: 'Memorise the squares up to 15&sup2; and the cubes 2&sup3;, 3&sup3;, 4&sup3;, 5&sup3; &mdash; most root questions are just these facts run backwards.',
  patterns: 'Difference &times; n, then adjust: a sequence rising by 4 starting at 10 is 4n + 6. Always test your rule on term 1 before trusting it.',
  expressions: 'Substitute with invisible brackets: x = &minus;2 in 3x&sup2; means 3 &times; (&minus;2)&sup2; = 12 &mdash; not &minus;12.',
  equations: 'Undo in reverse order, like taking off shoes before socks: if the equation was built by &ldquo;&times;3 then +5&rdquo;, solve by &ldquo;&minus;5 then &divide;3&rdquo;.',
  inequalities: 'Solve exactly like an equation, but say aloud &ldquo;flip the sign if I multiply or divide by a negative&rdquo; at every step.',
  graphs: 'Read the gradient as &ldquo;for every 1 step right, m steps up&rdquo;. Plot the intercept c first, then walk the gradient.',
  angles: 'Almost everything is 180 or 360: straight line 180&deg;, triangle 180&deg;, around a point 360&deg;, quadrilateral 360&deg;. Subtract what you already know.',
  shapes: 'For regular polygons, go via the exterior angle: it&rsquo;s always 360&deg; &divide; n, and the interior is just 180&deg; minus that.',
  transformations: 'Scale factor k: lengths &times;k, areas &times;k&sup2;, volumes &times;k&sup3; &mdash; one, two, three dimensions.',
  pythagoras: 'Spot 3-4-5 in disguise: 6-8-10, 9-12-15, 30-40-50. If two sides fit the pattern, the third is free &mdash; no squaring needed.',
  circles: 'Estimate with &pi; &asymp; 3 first: radius 10 gives C &asymp; 60 and A &asymp; 300. Then nudge both up a little for the real answer.',
  'perimeter-area': 'Rectangle perimeter in your head: add length and width once, then double. 8 by 5 &rarr; 13, doubled &rarr; 26.',
  volume: 'Count one layer, then stack: a 3 &times; 4 base is 12 cubes, so 5 layers make 60. Base &times; height, always.',
  conversions: 'Converting to a smaller unit? Expect a bigger number. Metres to centimetres must give <em>more</em> centimetres (&times;100), never fewer.',
  statistics: 'Mean without a calculator: guess a central value, then average the leftovers. For 48, 52, 53, 47 guess 50: differences &minus;2, +2, +3, &minus;3 cancel &rarr; mean 50.',
  probability: 'For &ldquo;at least one&hellip;&rdquo;, go through the back door: find the chance of <em>none</em>, then subtract from 1.'
};

// Singapore-style Concrete → Pictorial → Abstract strips for the four classic bar-model topics.
const bar = (cells, colors, w = 220, h = 34) => {
  const cw = (w - 4) / cells.length;
  return `<svg class="viz" viewBox="0 0 ${w} ${h + 20}" width="${w}" role="img" aria-label="bar model">` +
    cells.map((label, i) =>
      `<rect x="${2 + i * cw}" y="2" width="${cw}" height="${h}" fill="${colors[i]}" stroke="#8A90A8" stroke-width="1"/>` +
      (label ? `<text x="${2 + i * cw + cw / 2}" y="${2 + h / 2 + 4}" text-anchor="middle" font-family="Space Mono" font-size="12" font-weight="700" fill="#20263F">${label}</text>` : '')
    ).join('') + `</svg>`;
};
const B = '#C7D0F2', Y = '#FCE7B8', G = '#CDEBD9', W = '#FFFFFF';

export const CPA_PANELS = {
  fractions: `<div class="cpa-strip">
    <div class="cpa-panel"><span class="cpa-lbl">1 &middot; Concrete</span><div class="cpa-big">&#127851;&#127851;&#127851;&#11036;</div><p>3 of a chocolate bar&rsquo;s 4 squares are eaten.</p></div>
    <div class="cpa-panel"><span class="cpa-lbl">2 &middot; Pictorial</span>${bar(['', '', '', ''], [B, B, B, W])}<p>A bar cut into 4 equal parts, 3 shaded.</p></div>
    <div class="cpa-panel"><span class="cpa-lbl">3 &middot; Abstract</span><div class="cpa-big">&frac34; = 0.75</div><p>Numerator 3, denominator 4 &mdash; three of four equal parts.</p></div>
  </div>`,
  ratios: `<div class="cpa-strip">
    <div class="cpa-panel"><span class="cpa-lbl">1 &middot; Concrete</span><div class="cpa-big">&#128309;&#128309;&nbsp;&#128993;&#128993;&#128993;</div><p>2 blue marbles for every 3 yellow marbles.</p></div>
    <div class="cpa-panel"><span class="cpa-lbl">2 &middot; Pictorial</span>${bar(['', '', '', '', ''], [B, B, Y, Y, Y])}<p>5 equal parts: 2 blue, 3 yellow.</p></div>
    <div class="cpa-panel"><span class="cpa-lbl">3 &middot; Abstract</span><div class="cpa-big">2 : 3</div><p>5 parts in total &mdash; blue is 2&frasl;5 of the whole, yellow is 3&frasl;5.</p></div>
  </div>`,
  percentages: `<div class="cpa-strip">
    <div class="cpa-panel"><span class="cpa-lbl">1 &middot; Concrete</span><div class="cpa-big">&#129384; 25 of 100</div><p>25 of the 100 squares of a chocolate block are eaten.</p></div>
    <div class="cpa-panel"><span class="cpa-lbl">2 &middot; Pictorial</span>${bar(['25', '', '', ''], [G, W, W, W])}<p>A bar of 100 split into quarters &mdash; one quarter shaded.</p></div>
    <div class="cpa-panel"><span class="cpa-lbl">3 &middot; Abstract</span><div class="cpa-big">25% = 0.25 = &frac14;</div><p>&ldquo;Per cent&rdquo; locks the denominator to 100.</p></div>
  </div>`,
  equations: `<div class="cpa-strip">
    <div class="cpa-panel"><span class="cpa-lbl">1 &middot; Concrete</span><div class="cpa-big">&#9878;&#65039; bag + 4 = 10</div><p>A level scale: a bag and 4 coins balance 10 coins.</p></div>
    <div class="cpa-panel"><span class="cpa-lbl">2 &middot; Pictorial</span>${bar(['x', '4'], [Y, B], 150)}${bar(['10'], [G], 150)}<p>The x-bar plus a 4-bar must match the 10-bar.</p></div>
    <div class="cpa-panel"><span class="cpa-lbl">3 &middot; Abstract</span><div class="cpa-big">x + 4 = 10</div><p>Subtract 4 from both sides: x = 6.</p></div>
  </div>`
};
