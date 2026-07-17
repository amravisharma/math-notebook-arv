// tools/lesson-content.mjs
//
// Expanded "Read the Chapter" content for every topic — replaces the original (quite thin) t.lesson
// prose with a fuller explanation: a clear definition (as a short bullet list, not just a sentence),
// plus 3 real-world worked scenarios per topic so a learner sees the idea applied in different
// contexts, not just the abstract rule. Kept as its own file (same pattern as STATIC_MODELS in
// generate-book.mjs) so this large block of authored content doesn't bloat the build script.
//
// Applied in generate-book.mjs's applyContentFixes(): `t.lesson = LESSON_EXPANSIONS[t.id] || t.lesson`.
// Every existing CSS class (.term, .hl, .kbox, .why-style callouts) is reused; two new ones were
// added to css/styles.css for this: `.def-list` (a clean bulleted definition list) and
// `.rw-examples`/`.rw-card` (a grid of real-world scenario cards, tinted like the existing
// `.hf-sec.realworld` section so the "this is a real example" cue is visually consistent).

// A small pie-chart SVG, reused for any topic where "slices of a whole" is the clearest visual
// (ratios, fractions, percentages, probability, circles all lean on the same picture).
export function pizzaSVG(total, coloredCount, opts) {
  opts = opts || {};
  const cx = 62, cy = 62, r = 54;
  const colorA = opts.colorA || '#E4572E', colorB = opts.colorB || '#FCE7B8';
  let paths = '';
  for (let i = 0; i < total; i++) {
    const a0 = (i / total) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
    const x0 = (cx + r * Math.cos(a0)).toFixed(1), y0 = (cy + r * Math.sin(a0)).toFixed(1);
    const x1 = (cx + r * Math.cos(a1)).toFixed(1), y1 = (cy + r * Math.sin(a1)).toFixed(1);
    const fill = i < coloredCount ? colorA : colorB;
    paths += `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z" fill="${fill}" stroke="#fff" stroke-width="1.5"/>`;
  }
  return `<svg viewBox="0 0 124 124" width="124" height="124" role="img" aria-label="A pizza cut into ${total} slices, ${coloredCount} of one topping and ${total - coloredCount} of the other">${paths}</svg>`;
}

export const LESSON_EXPANSIONS = {

  conversions: `
<p>The metric system runs on <span class="hl">powers of ten</span>: prefixes like kilo-, centi- and milli- just slide the decimal point.</p>
<ul class="def-list">
  <li>1 km = 1000 m, 1 m = 100 cm &mdash; converting to a <em>smaller</em> unit gives a <em>bigger</em> number.</li>
  <li>A <span class="term">rate</span> combines two different kinds of unit, like speed (distance per time) or a price per kilogram.</li>
  <li>speed = distance &divide; time, which rearranges to distance = speed &times; time, or time = distance &divide; speed.</li>
  <li>Always make units match before calculating &mdash; mixing minutes with hours, or cm with m, is the classic slip.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Speed relationship</span><span class="formula">speed = distance &divide; time (rearranges three ways)</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#127859; Following a recipe</span>
    <p>A recipe needs 250 ml of milk, but your jug is marked in litres. Since 1 L = 1000 ml, 250 ml = <b>0.25 L</b> &mdash; converting first avoids pouring the wrong amount.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#9992;&#65039; Planning a road trip</span>
    <p>A trip is 360 km at 90 km/h. Time = distance &divide; speed = 360 &divide; 90 = <b>4 hours</b> &mdash; but only once both are already in matching units.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128138; Reading a medicine dose</span>
    <p>A label says 5 mg per kg of body weight. For a 20 kg child, that's 5 &times; 20 = <b>100 mg</b> &mdash; mixing up mg and g here could mean a dose 1000 times too strong.</p>
  </div>
</div>`,

  statistics: `
<p>Statistics summarise a whole set of data with a single number. There are three "averages", and picking the right one is itself a skill.</p>
<ul class="def-list">
  <li>The <span class="term">mean</span> is the "fair share" average: add every value, then divide by how many values there are.</li>
  <li>The <span class="term">median</span> is the middle value once the data is placed in order.</li>
  <li>The <span class="term">mode</span> is the value that appears most often.</li>
  <li>The <span class="term">range</span> (max &minus; min) describes how spread out the data is, not where its centre lies.</li>
  <li>The mean uses every value, so one huge outlier can drag it away from what's typical &mdash; the median ignores outliers and is often a fairer summary.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Centre &amp; spread</span><span class="formula">mean = fair share (sum &divide; count)<br>median = middle<br>mode = most common<br>range = max &minus; min</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#127968; Average house prices</span>
    <p>In a street of 9 houses worth about $600,000 each, one mansion sells for $5,000,000. The <b>mean</b> price jumps, making the street look expensive &mdash; the <b>median</b> (the middle house) still shows the true typical price.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127951; A batting average</span>
    <p>A batter scores 20, 35, 15, 100, 30. The <b>mean</b> (40) is pulled up by the one big 100; the <b>median</b> (30) better reflects a typical innings.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128094; Shoe sizes in a class</span>
    <p>The <b>mode</b> (most common size) tells a shop which size to stock the most of &mdash; the mean shoe size might come out as 7.3, a size that doesn't even exist.</p>
  </div>
</div>`,

  probability: `
<p>Probability measures how likely an event is, on a scale from <span class="hl">0 (impossible) to 1 (certain)</span>.</p>
<ul class="def-list">
  <li>The <span class="term">sample space</span> is the full list of equally likely outcomes for an experiment &mdash; get this list right before calculating anything.</li>
  <li>For equally likely outcomes: <span class="term">P(event) = favourable outcomes &divide; total outcomes</span>.</li>
  <li>The complement rule: P(not A) = 1 &minus; P(A) &mdash; this often turns a hard "at least one" question into an easy one.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Core formulas</span><span class="formula">P(event) = favourable &divide; total<br>P(not A) = 1 &minus; P(A)</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#127922; Rolling two dice</span>
    <p>Wanting a total of 7: the sample space has 6&times;6 = 36 equally likely outcomes, and 6 of them make 7. So P(total = 7) = 6&frasl;36 = <b>1&frasl;6</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127780;&#65039; Reading a weather forecast</span>
    <p>A forecast gives a 30% chance of rain. P(rain) = 0.3, so P(no rain) = 1 &minus; 0.3 = <b>0.7</b> &mdash; more likely than not, but rain is still a real possibility.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#129689; Tossing two coins</span>
    <p>It's tempting to guess 3 outcomes (0, 1 or 2 heads). The true sample space has 4: HH, HT, TH, TT &mdash; so "exactly one head" is 2&frasl;4 = <b>1&frasl;2</b>, not 1&frasl;3.</p>
  </div>
</div>`,

  transformations: `
<p>Translations, reflections and rotations are <span class="term">rigid motions</span>: they slide, flip or turn a shape while keeping every length and angle the same, so the image is <span class="hl">congruent</span> to the original.</p>
<ul class="def-list">
  <li><span class="term">Enlargement</span> is different &mdash; it resizes a shape from a centre point by a scale factor k, producing a shape that is <span class="term">similar</span> (same angles, proportional sides) but not the same size.</li>
  <li>An enlargement multiplies every length by the scale factor k.</li>
  <li>Area does <em>not</em> scale by k &mdash; it scales by <span class="hl">k&sup2;</span>.</li>
  <li>Double every side of a shape (scale factor 2) and its area becomes <b>4 times</b> bigger (2&sup2;), not 2 times.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Enlargement</span><span class="formula">lengths &times; k &rarr; shape is SIMILAR<br>area &times; k&sup2;</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#127918; Video game characters</span>
    <p>A game character flips to face left instead of right &mdash; a <b>reflection</b>. It slides across the screen &mdash; a <b>translation</b>. Its size never changes in either move, only its position or facing direction.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128424;&#65039; Enlarging on a photocopier</span>
    <p>A photocopier enlarges a photo by 150% (scale factor 1.5). Every length grows by 1.5&times;, but the paper's area grows by 1.5&sup2; = <b>2.25&times;</b>, not 1.5&times;.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#129513; Wallpaper patterns</span>
    <p>A repeating wallpaper pattern is built entirely from translations &mdash; sliding the same motif sideways and down, no resizing or flipping needed, to tile the whole wall.</p>
  </div>
</div>`,

  pythagoras: `
<p>In a <span class="hl">right-angled</span> triangle, the side opposite the right angle &mdash; the longest side &mdash; is the <span class="term">hypotenuse</span>.</p>
<ul class="def-list">
  <li><span class="term">Pythagoras' theorem</span>: a&sup2; + b&sup2; = c&sup2;, where c is the hypotenuse and a, b are the two shorter sides.</li>
  <li>The <span class="term">converse</span> also works: if a&sup2; + b&sup2; = c&sup2; is true for a triangle's three sides, that triangle must have a right angle &mdash; the theorem can <em>test</em> a triangle, not just measure one.</li>
  <li>Whole-number sets like <span class="hl teal">3-4-5</span> and 5-12-13 satisfy the rule exactly and are worth recognising instantly.</li>
  <li>The rule only works for right-angled triangles, and c must always be the longest side, opposite the right angle.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Theorem &amp; converse</span><span class="formula">a&sup2; + b&sup2; = c&sup2;<br>and if a&sup2;+b&sup2;=c&sup2;, the angle IS right</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#129692; Setting up a ladder</span>
    <p>A 5 m ladder leans against a wall with its base 3 m from the wall. It reaches &radic;(5&sup2; &minus; 3&sup2;) = <b>4 m</b> up the wall &mdash; a 3-4-5 triangle.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128250; A TV's screen size</span>
    <p>A TV advertised as "55 inches" means the <em>diagonal</em> of the screen (the hypotenuse) is 55 inches &mdash; not its width or height, which form the two shorter sides.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128208; Checking a corner is square</span>
    <p>Builders mark 3 m along one wall and 4 m along the other from a corner. If the diagonal between those marks measures exactly <b>5 m</b>, the corner is a true right angle.</p>
  </div>
</div>`,

  circles: `
<p>A circle is the set of all points a fixed distance &mdash; the <span class="term">radius</span> &mdash; from a centre point. The <span class="term">diameter</span> is twice the radius.</p>
<ul class="def-list">
  <li><span class="hl">&pi;</span> (pi) is the ratio of a circle's circumference to its diameter &mdash; about 3.14 &mdash; and this ratio is exactly the same for every circle, no matter its size.</li>
  <li><span class="term">Circumference</span> (distance around) = &pi;d = 2&pi;r.</li>
  <li><span class="term">Area</span> (space inside) = &pi;r&sup2; &mdash; always check whether a problem gives the radius or the diameter before substituting.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Formulas</span><span class="formula">C = &pi;d = 2&pi;r<br>A = &pi;r&sup2;</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128692; A bike wheel</span>
    <p>A bike wheel has a 66 cm diameter. Every full turn rolls the bike forward one circumference: &pi; &times; 66 &asymp; <b>207 cm</b>, just over 2 metres per turn.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127829; Comparing pizza deals</span>
    <p>A small pizza (20 cm across) costs $10; a large (30 cm across) costs $18. Area scales with r&sup2;, so the large has (15&divide;10)&sup2; = <b>2.25&times;</b> the area for only 1.8&times; the price &mdash; better value.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127939; A running track's lanes</span>
    <p>A 400 m track's lanes are curved. Runners in outer lanes start further forward, because a bigger radius means a bigger circumference (C = 2&pi;r) to cover the same number of laps fairly.</p>
  </div>
</div>`,

  'perimeter-area': `
<p><span class="term">Perimeter</span> is a one-dimensional length around the edge of a shape; <span class="term">area</span> is a two-dimensional covering, counted in <span class="hl">unit squares</span>.</p>
<ul class="def-list">
  <li>Key area formulas: rectangle = length &times; width; triangle = &frac12; &times; base &times; height (exactly half its surrounding rectangle); parallelogram = base &times; height.</li>
  <li>A <span class="term">compound shape</span> (made of simpler shapes joined together) is found by splitting it into rectangles and triangles, then adding or subtracting their areas.</li>
  <li>Perimeter and area measure genuinely different things &mdash; a shape can have a bigger perimeter but a <em>smaller</em> area than another shape.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Key areas</span><span class="formula">rectangle = l &times; w<br>triangle = &frac12; &times; b &times; h<br>parallelogram = b &times; h</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128679; Fencing a garden</span>
    <p>A rectangular garden is 8 m by 5 m. Fencing needs the <b>perimeter</b>: 2 &times; (8+5) = <b>26 m</b> of fence.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#129529; Carpeting a room</span>
    <p>A room is 4 m by 3.5 m. Carpet needed is the <b>area</b>: 4 &times; 3.5 = <b>14 m&sup2;</b> &mdash; carpet is bought by area, not by the length of the walls.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128204; Two paddocks, same fence</span>
    <p>A 10 m &times; 10 m paddock has perimeter 40 m and area 100 m&sup2;. An 18 m &times; 2 m paddock also has perimeter 40 m, but only <b>36 m&sup2;</b> &mdash; the same fencing can enclose very different areas.</p>
  </div>
</div>`,

  volume: `
<p><span class="term">Volume</span> measures how much space a 3-D solid fills, in <span class="hl">cubic</span> units; <span class="term">surface area</span> is the total area of all its flat faces.</p>
<ul class="def-list">
  <li>For any prism (including a cuboid), volume = base area &times; height &mdash; how many unit cubes tile the base, times how many layers stack up.</li>
  <li>Surface area is the material needed to wrap or cover a solid completely &mdash; the sum of every face's area.</li>
  <li>Scaling a 3-D shape affects volume differently to area: double every edge of a cube and its volume becomes <b>8 times</b> bigger (2&sup3;), not 2 times.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Prism &amp; capacity</span><span class="formula">V = base area &times; height<br>1 litre = 1000 cm&sup3;</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128031; Filling a fish tank</span>
    <p>A tank is 60 &times; 30 &times; 40 cm: volume = 72,000 cm&sup3;. Since 1000 cm&sup3; = 1 litre, that's <b>72 litres</b> of water to fill it.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128230; A shipping box</span>
    <p>A box is 50 &times; 40 &times; 30 cm (60,000 cm&sup3;). Doubling every dimension to 100 &times; 80 &times; 60 cm doesn't just double the volume &mdash; it makes it <b>8 times</b> bigger (480,000 cm&sup3;).</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127873; Wrapping a gift</span>
    <p>Wrapping paper needed is the box's <b>surface area</b> (every face added up); how much it can hold is its <b>volume</b> &mdash; two different questions about the very same box.</p>
  </div>
</div>`,

  equations: `
<p>An equation asserts that two expressions name the <span class="hl">same number</span>. Picture a <span class="term">balance scale</span>: the two sides weigh the same, and your job is to isolate the unknown without ever tipping it.</p>
<ul class="def-list">
  <li>Solving means finding the value of the unknown that keeps both sides equal.</li>
  <li>Every step must be a "legal move": add, subtract, multiply or divide <span class="hl">both sides equally</span> so the balance stays true.</li>
  <li>To undo an operation, apply its opposite (its <span class="term">inverse</span>) &mdash; undo in the reverse order to how the expression was built.</li>
  <li>Always check your answer by substituting it back into the original equation &mdash; both sides should come out equal.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Legal moves</span><span class="formula">do the SAME thing to both sides<br>undo operations in reverse</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128179; Saving for a skateboard</span>
    <p>You have $35 saved and want a $95 skateboard, saving $12 a week: 35 + 12w = 95 &rarr; 12w = 60 &rarr; <b>w = 5 weeks</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127777;&#65039; Temperature conversion</span>
    <p>F = 1.8C + 32. If today is 68&deg;F: 1.8C + 32 = 68 &rarr; 1.8C = 36 &rarr; <b>C = 20&deg;C</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127909; Movie tickets</span>
    <p>A group booking costs an $8 fee plus $14 per ticket. If the total was $92: 8 + 14t = 92 &rarr; 14t = 84 &rarr; <b>t = 6 tickets</b>.</p>
  </div>
</div>`,

  inequalities: `
<p>An <span class="term">inequality</span> (&gt;, &lt;, &ge;, &le;) describes a whole <span class="hl">range</span> of solutions, not a single value &mdash; a region of the number line rather than a point.</p>
<ul class="def-list">
  <li>Solve an inequality with the same legal moves as an equation, with <b>one exception</b>: multiplying or dividing both sides by a <span class="hl">negative</span> number flips the inequality sign.</li>
  <li>A strict inequality (&lt;, &gt;) uses an open circle on a number line &mdash; the endpoint itself is not included.</li>
  <li>&le; or &ge; uses a closed, filled circle &mdash; the endpoint itself is included.</li>
  <li>Many real limits are ranges, not single numbers: a maximum, a minimum, or an allowed band of values.</li>
</ul>
<div class="kbox"><span class="kbox-tag">The exception</span><span class="formula">&times; or &divide; by a NEGATIVE &rarr; reverse the inequality sign</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128663; A speed limit sign</span>
    <p>A sign reads "speed &le; 50 km/h". Any speed from 0 up to <em>and including</em> 50 is legal &mdash; not only exactly 50.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127905; A rollercoaster height rule</span>
    <p>A ride requires height &ge; 120 cm. A rider exactly 120 cm tall is allowed on; someone even 1 cm shorter is turned away.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127871; A party snack budget</span>
    <p>You have $150 for snacks at $6 each: 6n &le; 150 &rarr; n &le; 25. You can buy <b>up to 25 items</b> without going over budget.</p>
  </div>
</div>`,

  graphs: `
<p>The <span class="hl">coordinate plane</span> locates every point with an ordered pair (x, y): across first (x), then up (y).</p>
<ul class="def-list">
  <li>A straight-line graph is the picture of every (x, y) pair that makes a linear equation true &mdash; points on the line satisfy it, points off it don't.</li>
  <li>In <span class="term">y = mx + c</span>: m is the <span class="term">gradient</span> (steepness) &mdash; how much y climbs for every step of x, or rise &divide; run.</li>
  <li>c is the <span class="term">y-intercept</span> &mdash; where the line crosses the y-axis.</li>
  <li>Lines with the same gradient are parallel &mdash; they climb at the same rate but cross the y-axis at different points.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Line equation</span><span class="formula">y = mx + c<br>m = gradient = rise &divide; run<br>c = y-intercept</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128241; Comparing phone plans</span>
    <p>Plan A costs y = 20 (a flat fee, no per-GB charge). Plan B costs y = 5g + 5. Graphing both lines shows exactly where B becomes cheaper or pricier as data use (g) grows.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128692; A cyclist's distance-time graph</span>
    <p>A cyclist's distance from home is graphed against time. A steeper line means faster travel (a bigger gradient); a flat, horizontal section means the cyclist has stopped.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128506;&#65039; A treasure map</span>
    <p>A map marks treasure at (4, 3) &mdash; 4 steps east, then 3 steps north from the corner. Every map, game and GPS app is really a coordinate plane in disguise.</p>
  </div>
</div>`,

  angles: `
<p>An angle measures the amount of <span class="hl">rotation</span> (turn) between two rays, in degrees.</p>
<ul class="def-list">
  <li>Two angles are <span class="term">complementary</span> if they add to 90&deg;; they are <span class="term">supplementary</span> if they add to 180&deg;.</li>
  <li>Angles on a straight line always add to 180&deg;; angles all the way around a point always add to 360&deg;.</li>
  <li>The angles inside any triangle always add to 180&deg;.</li>
  <li>When a line crosses a pair of parallel lines: corresponding ("F") angles are equal, alternate ("Z") angles are equal, and co-interior ("C") angles add to 180&deg;.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Key facts</span><span class="formula">straight line = 180&deg;<br>point = 360&deg;<br>triangle = 180&deg;<br>vertical angles equal</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#129466; A skate ramp</span>
    <p>A ramp meets flat ground at 25&deg;. Since angles on a straight line add to 180&deg;, the angle on the other side is 180&deg; &minus; 25&deg; = <b>155&deg;</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127968; A roof's pitch</span>
    <p>A symmetric roof's two slopes meet at 110&deg; at the peak. Each slope meets the flat ceiling at (180&deg; &minus; 110&deg;) &divide; 2 = <b>35&deg;</b>, using the triangle angle-sum rule.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#129517; A ship's bearing</span>
    <p>A ship sails on a bearing of 60&deg;, then turns to a bearing of 150&deg; &mdash; a turn of 150&deg; &minus; 60&deg; = <b>90&deg;</b>, a quarter-turn to the right.</p>
  </div>
</div>`,

  shapes: `
<p>Triangles are named by their sides (equilateral: all equal; isosceles: two equal; scalene: none equal) or by having a right angle.</p>
<ul class="def-list">
  <li>Quadrilaterals form a <span class="hl">nested family</span>: a square is a special rectangle, which is a special parallelogram &mdash; a special case keeps all of its parent shape's properties.</li>
  <li>The interior angles of any polygon add up to <span class="term">(n &minus; 2) &times; 180&deg;</span>, where n is the number of sides.</li>
  <li>This works because any polygon can be split into (n &minus; 2) triangles from one corner, and each triangle carries 180&deg;.</li>
  <li>In a <span class="term">regular</span> polygon every side and angle is equal, so each interior angle is the total divided by n.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Angle sums</span><span class="formula">interior = (n &minus; 2) &times; 180&deg;<br>exterior angles always total 360&deg;</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128721; A stop sign</span>
    <p>A stop sign is a regular octagon (8 sides). Interior angles total (8&minus;2)&times;180&deg; = 1080&deg;, so each angle is 1080&deg; &divide; 8 = <b>135&deg;</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128029; A honeycomb</span>
    <p>Bees build honeycomb from regular hexagons because a hexagon's 120&deg; angles let them tile a flat surface with no gaps &mdash; only triangles, squares and hexagons can do this alone.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127959;&#65039; A roof truss</span>
    <p>A triangular roof truss stays rigid, while a plain quadrilateral frame can collapse sideways &mdash; triangles keep a fixed shape, which is why builders brace structures with them.</p>
  </div>
</div>`,

  operations: `
<p>Order of operations is a <span class="hl">convention for reading</span>, not a law of nature — we agree on it so an expression like 6 + 4 &times; 3 has exactly one meaning for everyone.</p>
<ul class="def-list">
  <li><span class="term">BEDMAS</span> sets the order: Brackets, Exponents, Division/Multiplication (left to right), Addition/Subtraction (left to right).</li>
  <li>&times; and &divide; rank equally, and + and &minus; rank equally. When operations tie in rank, work strictly <span class="hl">left to right</span>.</li>
  <li>Brackets are always done first, no matter what operation is written inside them.</li>
  <li>Spreadsheets, calculators and computer code all follow BEDMAS exactly &mdash; get the order wrong in one formula and every total after it is wrong too.</li>
</ul>
<div class="kbox"><span class="kbox-tag">The order</span><span class="formula">Brackets &rarr; Exponents &rarr; &times;, &divide; <span class="muted">(left to right)</span> &rarr; +, &minus; <span class="muted">(left to right)</span></span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#129380; Splitting a restaurant bill</span>
    <p>3 mains at $12 each, plus a $6 shared dessert: 3 &times; 12 + 6 = 36 + 6 = <b>$42</b>.</p>
    <p>Not 3 &times; (12 + 6) = $54 &mdash; the multiplication happens before the addition unless brackets say otherwise.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128241; Phone data plan</span>
    <p>A plan costs $20 base plus $5 per extra GB. For 3 extra GB: 20 + 5 &times; 3 = 20 + 15 = <b>$35</b>. The 5 &times; 3 is worked out before the $20 is added on.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128290; A spreadsheet formula</span>
    <p>A cell contains <code>=10+2*5</code>. It shows <b>20</b>, not 60 &mdash; computers follow BEDMAS exactly, doing 2&times;5 first, then adding 10.</p>
  </div>
</div>`,

  factors: `
<p>A <span class="term">factor</span> divides a whole number exactly, with no remainder; a <span class="term">multiple</span> is a number you land on when counting up in that number's times table.</p>
<ul class="def-list">
  <li>A <span class="term">prime</span> number has exactly two factors: 1 and itself. 1 is <em>not</em> prime, because it only has one factor.</li>
  <li>Every whole number bigger than 1 breaks down into prime factors in exactly one way &mdash; its unique "atomic" fingerprint.</li>
  <li><span class="hl">HCF</span> (Highest Common Factor) is the largest number that divides two numbers exactly.</li>
  <li><span class="hl">LCM</span> (Lowest Common Multiple) is the smallest number that both numbers divide into exactly.</li>
</ul>
<div class="kbox"><span class="kbox-tag">From prime factors</span><span class="formula">HCF = primes in BOTH<br>LCM = highest power of EACH<br>HCF &times; LCM = the two numbers multiplied</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128652; Bus timetables</span>
    <p>Bus A leaves every 12 minutes, Bus B every 15 minutes. They next leave together after the <b>LCM of 12 and 15 = 60 minutes</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127852; Packing party bags</span>
    <p>You have 24 lollies and 36 chocolates to pack into identical bags with nothing left over. The most bags you can make is the <b>HCF of 24 and 36 = 12</b> (2 lollies + 3 chocolates each).</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#129521; Tiling a floor</span>
    <p>A floor is 24 tiles by 18 tiles. The largest square block pattern that fits evenly uses the <b>HCF of 24 and 18 = 6</b>.</p>
  </div>
</div>`,

  powers: `
<p>An <span class="term">exponent</span> (or index) counts how many times the <span class="term">base</span> is multiplied by itself: 2&sup3; = 2&times;2&times;2 (which is <em>not</em> 2&times;3).</p>
<ul class="def-list">
  <li>Index law: when multiplying powers with the same base, add the exponents &mdash; a&#8319; &times; a&#7480; = a&#8319;&#8314;&#7480;.</li>
  <li>A <span class="hl">square root</span> undoes squaring &mdash; it asks "what number, multiplied by itself, gives this value?"</li>
  <li>Any base to the power 0 equals 1 (a&#8304; = 1) &mdash; a direct result of the same product rule.</li>
  <li><span class="hl teal">Scientific notation</span> writes very large or very small numbers compactly, as a value between 1 and 10 multiplied by a power of 10.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Index laws</span><span class="formula">a&#8319; &times; a&#7480; = a&#8319;&#8314;&#7480;<br>(a&#8319;)&#7480; = a&#8319;&#7480;<br>a&#8304; = 1</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#129440; Bacteria doubling</span>
    <p>A bacteria colony doubles every hour, starting from 1 cell. After 10 hours there are 2&#185;&#8304; = <b>1024 cells</b> &mdash; powers describe repeated doubling far faster than adding.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128190; Phone storage</span>
    <p>A phone has 128 GB of storage. 128 = 2&#8311;. Computer storage sizes (kilo, mega, giga) are built from powers of 2 and powers of 1000.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127756; Distance to the Sun</span>
    <p>The Sun is about 150,000,000 km from Earth. In scientific notation that's <b>1.5 &times; 10&#8312; km</b> &mdash; far easier to read and compare than counting zeros.</p>
  </div>
</div>`,

  patterns: `
<p>A <span class="term">sequence</span> is an ordered list of numbers built by a rule; each number is a <span class="term">term</span>, and its position in the list is n.</p>
<ul class="def-list">
  <li>A <span class="term">term-to-term rule</span> tells you how to get the next term from the one before it, e.g. "add 4".</li>
  <li>A <span class="term">position-to-term rule</span> (the nth-term rule) lets you jump straight to any term &mdash; like the 100th &mdash; without listing every term before it.</li>
  <li>The common difference in a linear sequence becomes the coefficient of n; a constant then shifts the rule to match the real first term.</li>
  <li>Not every pattern grows by a constant amount &mdash; square numbers and triangular numbers grow by a changing amount each step.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Two rules</span><span class="formula">term-to-term: add the common difference<br>position-to-term: nth term = d &times; n + adjust</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#127917; Theatre seating</span>
    <p>Row 1 has 10 seats, and each row behind has 4 more: 10, 14, 18, 22&hellip; The nth-term rule is 4n + 6, so row 20 has 4&times;20+6 = <b>86 seats</b> &mdash; no need to count every row in between.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128176; Loan repayments</span>
    <p>A loan balance drops the same amount each month: $2000, $1800, $1600&hellip; The term-to-term rule (subtract 200) predicts next month, but the nth-term rule predicts <b>any</b> month instantly.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127959;&#65039; A growing tiled border</span>
    <p>A tiled border around a growing pool needs 8, 12, 16, 20&hellip; tiles. Spotting the nth-term rule 4n + 4 tells you exactly how many tiles any size pool needs, without building a model first.</p>
  </div>
</div>`,

  expressions: `
<p>A <span class="term">variable</span> is a letter standing in for a number that is unknown or can change.</p>
<ul class="def-list">
  <li>A <span class="term">term</span> is one piece of an expression, like 3x; the number in front (3) is its <span class="term">coefficient</span>.</li>
  <li>Only <span class="hl">like terms</span> &mdash; terms with exactly the same letter part &mdash; can be combined: 3x + 5x = 8x, but 3x + 2y cannot be simplified further.</li>
  <li><span class="term">Expanding</span> a bracket means multiplying every term inside it by what's outside: a(b + c) = ab + ac.</li>
  <li>Two expressions are equivalent if they give the same value for every number substituted in &mdash; a fact you can spot-check by trying a number in both.</li>
</ul>
<div class="kbox"><span class="kbox-tag">The engine: distributive property</span><span class="formula">a(b + c) = ab + ac &nbsp;(expanding &mdash; and, reversed, factoring)</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128241; Phone data plan</span>
    <p>A plan costs $20 base plus $5 per GB used. The cost for g GB is the expression <b>20 + 5g</b>. Using 6 GB: 20 + 5&times;6 = <b>$50</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128661; Taxi fare</span>
    <p>A taxi charges a $4 flagfall plus $2 per kilometre: <b>4 + 2k</b>. A 9 km trip costs 4 + 2&times;9 = <b>$22</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127818; Packing lunchboxes</span>
    <p>Packing x apples, and 4 more bananas than apples, means total fruit is x + (x + 4) = <b>2x + 4</b> &mdash; collecting the two like terms (x and x) into 2x.</p>
  </div>
</div>`,

  'place-value': `
<p>Our number system is <span class="hl">base ten</span> and <span class="term">positional</span>: a numeral's value is the sum of each digit multiplied by the value of its place.</p>
<ul class="def-list">
  <li>Each digit's value depends on where it sits. Moving one place left multiplies that digit's value by <span class="hl">10</span>.</li>
  <li>A number's total value is the sum of digit &times; place value (its <span class="term">expanded form</span>): 4073 = 4&times;1000 + 0&times;100 + 7&times;10 + 3.</li>
  <li>Zero is not "nothing" &mdash; it is a placeholder that holds a column open so the other digits keep their correct value.</li>
  <li>To round, look only at the digit just past the place you are keeping: 5 or more rounds up, anything less stays the same.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Definition</span><span class="formula">value = &Sigma; (digit &times; place value)<br>each place is 10&times; the one on its right</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128181; Reading a price tag</span>
    <p>$1,000 and $100 look almost alike on a receipt &mdash; but one extra zero makes the first price <b>ten times</b> as much money.</p>
    <p>A cash register, a bank app and a price tag all depend on place value to keep prices honest.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128663; Car odometer</span>
    <p>A car's odometer reads <b>45,000 km</b>. After a 10 km trip it reads <b>45,010 km</b>.</p>
    <p>Only the tens and ones digits changed &mdash; the ten-thousands, thousands and hundreds digits kept their value untouched.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127758; A city's population</span>
    <p>A town of <b>84,000</b> people grows to <b>840,000</b>. That is not "a couple more digits" &mdash; it is exactly <b>ten times</b> bigger, because every digit shifted one place to the left.</p>
  </div>
</div>`,

  decimals: `
<p>Decimals are simply fractions whose denominators are <span class="hl">powers of ten</span>, so place value flows smoothly rightward into tenths, hundredths, thousandths.</p>
<ul class="def-list">
  <li>A decimal names a precise point on the number line, just like a fraction &mdash; 0.75 is exactly the same point as 3&frasl;4.</li>
  <li>To <span class="term">add or subtract</span> decimals, line up the decimal points so you combine same-size parts: tenths with tenths, hundredths with hundredths.</li>
  <li>To <span class="term">multiply</span> decimals, count the total decimal places in both numbers &mdash; the answer needs that many decimal places.</li>
  <li>More digits does not mean a bigger number. Compare by place value: 0.5 is bigger than 0.45, even though 0.45 has more digits.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Two rules, one reason</span><span class="formula">+ , &minus; : line up the points<br>&times; : count decimal places<br>&divide; : scale to clear the divisor</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#128181; Supermarket receipt</span>
    <p>Milk $3.99 + Bread $4.50. Line up the points: <b>$3.99 + $4.50 = $8.49</b>.</p>
    <p>Misalign the points by mistake and you could be out by whole dollars, not just cents.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127939; Race times</span>
    <p>Two sprinters finish in <b>10.58 s</b> and <b>10.6 s</b>. Since 10.6 = 10.60, and 60 hundredths is more than 58 hundredths, the second time is actually <em>slower</em> &mdash; despite "10.6" looking like the smaller number.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128207; Measuring a plank</span>
    <p>A plank measures <b>1.75 m</b>. Cutting off <b>0.40 m</b>: line up the points, 1.75 &minus; 0.40 = <b>1.35 m</b> remains.</p>
  </div>
</div>`,

  fractions: `
<p>A fraction is a <span class="hl">number</span>, not just a slice of pizza &mdash; it marks an exact point on the number line and also means "numerator &divide; denominator".</p>
<ul class="def-list">
  <li>The <span class="term">denominator</span> names the size of each equal part; the <span class="term">numerator</span> counts how many of those parts you have.</li>
  <li>Multiplying or dividing the top and bottom by the same number gives an <span class="term">equivalent fraction</span> &mdash; the same point on the number line, with a new name.</li>
  <li>You can only add or subtract fractions once the parts are the same size &mdash; that means finding a common denominator first.</li>
  <li>Dividing by a fraction asks "how many of these fit?" &mdash; which is why dividing by a fraction means flipping it and multiplying (its reciprocal).</li>
</ul>
<div class="kbox"><span class="kbox-tag">The engine</span><span class="formula">Equivalent: &times;/&divide; top &amp; bottom alike<br>Add: same-size parts first<br>Multiply: across<br>Divide: &times; the reciprocal</span></div>
<div class="rw-examples">
  <div class="rw-card">
    ${pizzaSVG(4, 3)}
    <span class="rw-tag">&#127829; Sharing a pizza</span>
    <p>A pizza is cut into 4 equal slices. Eating 3 of them means you have eaten <b>3&frasl;4</b> of the pizza &mdash; 3 parts out of 4 equal parts.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127856; Halving a recipe</span>
    <p>A cookie recipe needs 3&frasl;4 cup of sugar. Halving the whole recipe means multiplying every fraction by 1&frasl;2: 3&frasl;4 &times; 1&frasl;2 = <b>3&frasl;8 cup</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128336; Telling the time</span>
    <p>"Quarter past" the hour is 1&frasl;4 of 60 minutes = <b>15 minutes</b>. "Half past" is 1&frasl;2 of 60 = <b>30 minutes</b>.</p>
  </div>
</div>`,

  percentages: `
<p>"Per cent" means <span class="hl">per hundred</span> &mdash; a percentage is a fraction locked to a denominator of 100, so it converts freely between forms.</p>
<ul class="def-list">
  <li>25% = 25&frasl;100 = 0.25 = 1&frasl;4 &mdash; the same amount, written three different ways.</li>
  <li>To find a percentage of an amount: <span class="hl">(percent &divide; 100) &times; amount</span>.</li>
  <li>A percentage is always taken <em>of</em> a particular amount, called the base. Change the base, and the same percentage becomes a different actual amount.</li>
  <li>Percentage changes do not simply add: a 10% rise followed by a 10% fall does <em>not</em> return you to the start, because the second 10% is of a different amount.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Core moves</span><span class="formula">% of amount = (% &divide; 100) &times; amount<br>change is measured against the ORIGINAL</span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#127991;&#65039; Shop sale</span>
    <p>An $80 jacket is 25% off. 25% of 80 = (25&divide;100)&times;80 = <b>$20 off</b>, so it now costs <b>$60</b>.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127869;&#65039; Restaurant tip</span>
    <p>A $45 bill, 10% tip: 10% of $45 = <b>$4.50</b>. Knowing 10% (just divide by 10) makes any tip or discount easy to estimate in your head.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128200;&#128201; Rise then fall</span>
    <p>A $100 item rises 10% to $110, then falls 10%. 10% of $110 = $11, so it drops to <b>$99</b> &mdash; not back to $100, because the second 10% was taken of a bigger number.</p>
  </div>
</div>`,

  integers: `
<p>Integers extend the number line to the left of zero: &hellip;&minus;3, &minus;2, &minus;1, 0, 1, 2, 3&hellip;</p>
<ul class="def-list">
  <li>Every number has an <span class="term">opposite</span> the same distance from zero; its <span class="term">absolute value</span> is that distance, ignoring the sign.</li>
  <li>Adding is movement along the number line: add a positive number by moving right, add a negative number by moving <span class="hl">left</span>.</li>
  <li><span class="term">Subtracting</span> a number means adding its opposite &mdash; that is why subtracting a negative makes a number bigger.</li>
  <li>When multiplying: same signs give a <span class="hl">positive</span> answer, different signs give a <span class="hl">negative</span> answer.</li>
</ul>
<div class="kbox"><span class="kbox-tag">Sign rules (with reason)</span><span class="formula">subtracting = adding the opposite<br>same signs give a <b>positive</b><br>different signs give a <b>negative</b></span></div>
<div class="rw-examples">
  <div class="rw-card">
    <span class="rw-tag">&#127777;&#65039; Morning temperature</span>
    <p>The forecast says <b>&minus;5&deg;C</b> this morning, warming to <b>3&deg;C</b> by afternoon. That is a rise of 3 &minus; (&minus;5) = <b>8&deg;C</b>, even though one of the numbers is negative.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127974; Bank balance</span>
    <p>You have $100 in your account and spend $150. Your balance becomes 100 &minus; 150 = <b>&minus;$50</b> &mdash; you are overdrawn, meaning you owe the bank money.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127754; Below sea level</span>
    <p>A submarine dives to 250 m below sea level, written <b>&minus;250 m</b>. It then rises 100 m: &minus;250 + 100 = <b>&minus;150 m</b> &mdash; still below sea level, but closer to the surface.</p>
  </div>
</div>`,

  ratios: `
<p>A <span class="term">ratio</span> is used to compare the sizes of two or more quantities measured in the same units. A <span class="term">rate</span> compares two <em>different</em> kinds of quantity, like dollars per kilogram or kilometres per hour.</p>
<ul class="def-list">
  <li>A ratio of <span class="hl">5 : 6</span> means that for every 5 of the first quantity, there are 6 of the second quantity.</li>
  <li>A ratio can also be written as a fraction of the whole. In the ratio 5 : 6 there are 5 + 6 = 11 parts altogether, so the first quantity is <span class="hl">5&frasl;11</span> of the total and the second is <span class="hl">6&frasl;11</span> of the total.</li>
  <li>Ratios can be simplified exactly like fractions &mdash; divide every part by the same number. e.g. 10 : 12 simplifies to <span class="hl">5 : 6</span> (divide both by 2).</li>
  <li>To share an amount in a given ratio, add the parts first, divide to find the value of <em>one</em> part, then multiply for each share (the <span class="term">unitary method</span>).</li>
</ul>
<div class="kbox"><span class="kbox-tag">Unitary method</span><span class="formula">total &divide; (sum of parts) = one part &rarr; multiply for each share</span></div>
<div class="rw-examples">
  <div class="rw-card">
    ${pizzaSVG(8, 3)}
    <span class="rw-tag">&#127829; Pizza night</span>
    <p>A pizza is cut into 8 equal slices. 3 have pepperoni, 5 are plain. The ratio of pepperoni to plain is <b>3 : 5</b>.</p>
    <p>That does <em>not</em> mean pepperoni is 3&frasl;5 of the pizza &mdash; there are 3 + 5 = 8 slices total, so pepperoni is 3&frasl;8 of the whole pizza. Ratio compares the two toppings to each other; fraction-of-whole compares one topping to the total.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#127912; Mixing paint</span>
    <p>A mural needs blue and white paint in the ratio 2 : 3. For every 2 tins of blue, you need 3 tins of white.</p>
    <p>Used 6 tins of blue? That's double 2, so you need double 3 = <b>9 tins of white</b> to keep the same shade.</p>
  </div>
  <div class="rw-card">
    <span class="rw-tag">&#128176; Splitting chore money</span>
    <p>Two siblings share $40 for chores in the ratio 3 : 5.</p>
    <p>3 + 5 = 8 parts. $40 &divide; 8 = $5 per part. So they get 3 &times; $5 = <b>$15</b> and 5 &times; $5 = <b>$25</b>.</p>
  </div>
</div>`,

};
