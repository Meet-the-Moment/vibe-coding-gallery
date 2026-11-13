// Run: node build.mjs
// Builds the published gallery into dist/. It refuses to build if any game breaks the rules,
// so a bad pull request shows a failed preview instead of a live problem.
//
// THREE LOOKS (Joshua, 2026-11-13): the audience votes on the gallery's name and look in
// Session 2. Until then the page carries all three and a picker (or ?look=arcade|gallery|party).
// After the vote, set DEFAULT_LOOK to the winner and SHOW_PICKER to false.

import { mkdirSync, rmSync, cpSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { loadGames, ROOT } from './lib.mjs';

const DEFAULT_LOOK = 'arcade';
const SHOW_PICKER = true;

const LOOKS = {
  arcade: { name: 'Vibe Coding Arcade', kicker: 'Insert coin. (It is free.)' },
  gallery: { name: 'MTM Together Game Gallery', kicker: 'Made by our community, for yours' },
  party: { name: 'Party Games: Community Edition', kicker: 'The party gets bigger every time someone builds' },
};

// Policy for the wrapper page around each game, and (by inheritance) the game's frame.
// frame-src 'none' stops the frame being navigated to any other address; connect-src 'none'
// blocks background network calls; no network sources are allowed for scripts, styles, images,
// media or fonts; webrtc 'block' covers direct connections in browsers that support it (the rules
// in lib.mjs also reject WebRTC code, since not every browser honours that directive yet).
const PLAY_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; child-src 'none'; form-action 'none'; base-uri 'none'; object-src 'none'; webrtc 'block'";

const KIND_LABEL ={ web: 'Play in your browser', prompt: 'Prompt game', tool: 'Small tool' };
const KIND_BUTTON = { web: 'Play', prompt: 'Get the prompt', tool: 'Try it' };

const { games, problems } = loadGames();
if (problems.length) {
  console.error(`\nBuild stopped. ${problems.length} thing(s) to fix:\n`);
  for (const p of problems) console.error(`  [${p.game}] ${p.message}`);
  console.error('\nRun "node check.mjs" for the same list.\n');
  process.exit(1);
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const initials = (name) => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '★';
const paragraphs = (text) => esc(text).split(/\n\s*\n/).map((p) => `<p>${p.replace(/\n/g, ' ')}</p>`).join('');

const DIST = join(ROOT, 'dist');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'play'), { recursive: true });
mkdirSync(join(DIST, 'prompts'), { recursive: true });
mkdirSync(join(DIST, 'makers'), { recursive: true });
cpSync(join(ROOT, 'site', 'assets'), join(DIST, 'assets'), { recursive: true });

// Fonts come only from the visitor's own device. No web fonts: loading them from Google would
// send every visitor's address to Google, and the gallery promises it collects nothing.
const SANS = "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const ARCADE = "ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace";
const SERIF = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,'Times New Roman',serif";
const ROUNDED = "ui-rounded,'SF Pro Rounded','Arial Rounded MT Bold','Trebuchet MS',system-ui,sans-serif";

const STYLE = `
:root { --navy:#1c487b; --teal:#1ab1d2; --orange:#f18f38; --pink:#e5498b; --gold:#f4c430; }
* { box-sizing:border-box; }
html, body { margin:0; }
body { font-family:${SANS}; line-height:1.5; min-height:100vh; }
a { color:inherit; }
.wrap { max-width:1100px; margin:0 auto; padding:0 16px; }
header.top { padding:28px 0 18px; }
.brand { display:flex; align-items:center; gap:14px; }
.brand img { width:54px; height:54px; border-radius:12px; }
.kicker { margin:0; font-size:15px; font-weight:600; letter-spacing:.3px; }
h1 { margin:6px 0 4px; line-height:1.1; }
.lede { margin:10px 0 0; max-width:720px; font-size:17px; }
.picker { margin:18px 0 0; display:flex; flex-wrap:wrap; gap:8px; align-items:center; font-size:14px; }
.picker button { font:inherit; font-weight:700; cursor:pointer; border-radius:999px; padding:7px 14px; border:2px solid currentColor; background:transparent; color:inherit; }
.picker button[aria-pressed="true"] { background:var(--orange); border-color:var(--orange); color:#fff; }
.filters { display:flex; flex-wrap:wrap; gap:8px; margin:22px 0 18px; }
.filters button { font:inherit; font-weight:600; cursor:pointer; border-radius:999px; padding:8px 16px; min-height:44px; border:2px solid currentColor; background:transparent; color:inherit; }
.filters button[aria-pressed="true"] { background:currentColor; }
.filters button[aria-pressed="true"] span { filter:invert(1); }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; padding-bottom:30px; }
.card { display:flex; flex-direction:column; border-radius:18px; overflow:hidden; }
.card .band { height:10px; }
.card .inner { padding:16px 18px 18px; display:flex; flex-direction:column; gap:8px; flex:1; }
.badge { align-self:flex-start; font-size:12px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; padding:3px 10px; border-radius:999px; }
.card h2 { margin:2px 0 0; font-size:21px; line-height:1.2; }
.tagline { margin:0; }
.players { margin:0; font-size:14px; opacity:.8; }
.go { margin-top:auto; align-self:flex-start; text-decoration:none; font-weight:700; padding:10px 18px; border-radius:12px; min-height:44px; display:inline-flex; align-items:center; }
.credit { display:flex; align-items:center; gap:10px; padding-top:12px; margin-top:6px; border-top:1px dashed currentColor; font-size:14px; }
.avatar { width:40px; height:40px; border-radius:50%; object-fit:cover; flex:none; display:grid; place-items:center; font-weight:700; font-size:14px; }
.credit a { font-weight:600; }
.empty { padding:30px; text-align:center; border-radius:18px; }
footer { padding:26px 0 40px; font-size:14px; }
footer p { margin:6px 0; }

/* LOOK 1: Vibe Coding Arcade */
[data-look="arcade"] body, body[data-look="arcade"] { background:#0f1e3a; color:#eaf6ff;
  background-image:radial-gradient(circle at 20% 0%, rgba(26,177,210,.25), transparent 45%), radial-gradient(circle at 90% 20%, rgba(229,73,139,.22), transparent 40%); }
body[data-look="arcade"] h1 { font-family:${ARCADE}; font-weight:800; letter-spacing:2px; text-transform:uppercase; font-size:clamp(24px,5vw,44px); color:#fff; text-shadow:0 0 12px var(--teal), 3px 3px 0 var(--pink); }
body[data-look="arcade"] .kicker { color:var(--gold); font-family:${ARCADE}; font-size:13px; text-transform:uppercase; letter-spacing:1.5px; }
body[data-look="arcade"] .card { background:#16284d; border:2px solid var(--teal); box-shadow:0 0 18px rgba(26,177,210,.35); }
body[data-look="arcade"] .card:nth-child(3n+2) { border-color:var(--pink); box-shadow:0 0 18px rgba(229,73,139,.35); }
body[data-look="arcade"] .card:nth-child(3n+3) { border-color:var(--gold); box-shadow:0 0 18px rgba(244,196,48,.3); }
body[data-look="arcade"] .band { background:repeating-linear-gradient(90deg,var(--teal) 0 12px,var(--pink) 12px 24px,var(--gold) 24px 36px); }
body[data-look="arcade"] .badge { background:#0f1e3a; color:var(--gold); border:1px solid var(--gold); }
body[data-look="arcade"] .card h2 { font-family:${ARCADE}; font-weight:800; font-size:17px; line-height:1.35; text-transform:uppercase; letter-spacing:1px; }
body[data-look="arcade"] .go { background:var(--orange); color:#10213f; box-shadow:0 4px 0 #b65d17; }
body[data-look="arcade"] .avatar { background:var(--teal); color:#0f1e3a; }
body[data-look="arcade"] .empty { background:#16284d; }
body[data-look="arcade"] .banner { display:none; }

/* LOOK 2: MTM Together Game Gallery */
body[data-look="gallery"] { background:#fdf8ef; color:#2b3445; }
body[data-look="gallery"] .banner { display:block; width:100%; height:180px; object-fit:cover; object-position:center 38%;
  -webkit-mask-image:linear-gradient(to bottom,#000 60%,transparent); mask-image:linear-gradient(to bottom,#000 60%,transparent); }
body[data-look="gallery"] h1 { font-family:${SERIF}; font-size:clamp(30px,5vw,48px); color:var(--navy); }
body[data-look="gallery"] .kicker { color:#c4651c; }
body[data-look="gallery"] .card { background:#fff; border:2px solid #1a2744; box-shadow:7px 7px 0 #f3d9b8; }
body[data-look="gallery"] .band { background:linear-gradient(90deg,#7fd3e6,#f6c1d6,#f8dc8a); }
body[data-look="gallery"] .badge { background:#e6f6fa; color:var(--navy); }
body[data-look="gallery"] .card h2 { font-family:${SERIF}; color:var(--navy); }
body[data-look="gallery"] .go { background:var(--navy); color:#fff; }
body[data-look="gallery"] .avatar { background:#fdebd5; color:#c4651c; }
body[data-look="gallery"] .filters, body[data-look="gallery"] .picker { color:var(--navy); }
body[data-look="gallery"] .empty { background:#fff; border:2px dashed #c9b79a; }

/* LOOK 3: Party Games: Community Edition */
body[data-look="party"] { background:#fffaf0; color:#2a2440;
  background-image:radial-gradient(var(--pink) 2px,transparent 2.5px),radial-gradient(var(--teal) 2px,transparent 2.5px),radial-gradient(var(--gold) 2.5px,transparent 3px);
  background-size:90px 90px,130px 130px,110px 110px; background-position:0 0,40px 60px,70px 20px; }
body[data-look="party"] h1 { font-family:${ROUNDED}; font-weight:800; font-size:clamp(32px,5.5vw,54px); color:var(--pink); text-shadow:3px 3px 0 var(--gold); }
body[data-look="party"] .kicker { color:var(--teal); font-family:${ROUNDED}; font-weight:700; font-size:17px; }
body[data-look="party"] .card { background:#fff; border-radius:26px; border:3px solid #2a2440; transform:rotate(-0.6deg); }
body[data-look="party"] .card:nth-child(even) { transform:rotate(0.7deg); }
body[data-look="party"] .band { height:16px; background:repeating-linear-gradient(45deg,var(--pink) 0 14px,var(--gold) 14px 28px,var(--teal) 28px 42px); }
body[data-look="party"] .badge { background:var(--gold); color:#2a2440; }
body[data-look="party"] .card h2 { font-family:${ROUNDED}; font-weight:800; font-size:24px; }
body[data-look="party"] .go { background:var(--pink); color:#fff; border-radius:999px; }
body[data-look="party"] .avatar { background:var(--teal); color:#fff; }
body[data-look="party"] .empty { background:#fff; border:3px dashed var(--pink); }
body[data-look="party"] .banner { display:none; }
body[data-look="arcade"] .banner { display:none; }
.banner { display:none; }
@media (prefers-reduced-motion: reduce) { * { transition:none !important; } body[data-look="party"] .card { transform:none; } }
`;

function credit(g) {
  const name = g.made_by || 'A Vibe Coding builder';
  let avatar = `<span class="avatar" aria-hidden="true">${esc(initials(g.made_by))}</span>`;
  if (g.headshot) {
    const out = `${g.slug}${extname(g.headshot).toLowerCase()}`;
    copyFileSync(join(g.dir, g.headshot), join(DIST, 'makers', out));
    avatar = `<img class="avatar" src="makers/${esc(out)}" alt="Photo of ${esc(name)}" loading="lazy" width="40" height="40">`;
  }
  const who = g.linkedin
    ? `<a href="${esc(g.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(name)}</a> <span aria-hidden="true">· LinkedIn</span>`
    : esc(name);
  return `<div class="credit">${avatar}<div>Made by ${who}</div></div>`;
}

function card(g) {
  return `<article class="card" data-kind="${esc(g.kind)}">
  <div class="band"></div>
  <div class="inner">
    <span class="badge">${esc(KIND_LABEL[g.kind])}</span>
    <h2>${esc(g.title)}</h2>
    <p class="tagline">${esc(g.tagline)}</p>
    ${g.players ? `<p class="players">For: ${esc(g.players)}</p>` : ''}
    <a class="go" href="${g.kind === 'prompt' ? 'prompts' : 'play'}/${esc(g.slug)}/">${esc(KIND_BUTTON[g.kind])}</a>
    ${credit(g)}
  </div>
</article>`;
}

function pageShell({ title, description, body, depth = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="${depth}assets/favicon-32.png">
<link rel="apple-touch-icon" href="${depth}assets/apple-touch-icon.png">
<style>${STYLE}</style>
</head>
${body}
</html>`;
}

const LOOK_SCRIPT = `<script>
(function () {
  var looks = ${JSON.stringify(Object.fromEntries(Object.entries(LOOKS).map(([k, v]) => [k, v])))};
  var fallback = ${JSON.stringify(DEFAULT_LOOK)};
  function apply(look) {
    if (!looks[look]) look = fallback;
    document.body.setAttribute('data-look', look);
    document.querySelectorAll('[data-name]').forEach(function (el) { el.textContent = looks[look].name; });
    document.querySelectorAll('[data-kicker]').forEach(function (el) { el.textContent = looks[look].kicker; });
    if (document.body.dataset.page === 'gallery') document.title = looks[look].name;
    document.querySelectorAll('.picker button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.look === look)); });
    try { localStorage.setItem('gallery-look', look); } catch (e) {}
  }
  var q = new URLSearchParams(location.search).get('look');
  var saved = null; try { saved = localStorage.getItem('gallery-look'); } catch (e) {}
  apply(q || saved || fallback);
  document.querySelectorAll('.picker button').forEach(function (b) {
    b.addEventListener('click', function () { apply(b.dataset.look); history.replaceState(null, '', '?look=' + b.dataset.look); });
  });
  document.querySelectorAll('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var k = b.dataset.kind;
      document.querySelectorAll('.card').forEach(function (c) { c.hidden = !(k === 'all' || c.dataset.kind === k); });
    });
  });
})();
</script>`;

// ---- Gallery page ----
const counts = { web: 0, prompt: 0, tool: 0 };
for (const g of games) counts[g.kind]++;
const filterButtons = [['all', `Everything (${games.length})`], ['web', `Play in your browser (${counts.web})`], ['prompt', `Prompt games (${counts.prompt})`], ['tool', `Small tools (${counts.tool})`]]
  .filter(([k]) => k === 'all' || counts[k] > 0)
  .map(([k, label], i) => `<button type="button" data-kind="${k}" aria-pressed="${i === 0}"><span>${esc(label)}</span></button>`).join('');

const picker = SHOW_PICKER
  ? `<div class="picker" role="group" aria-label="Pick a look"><strong>Vote preview, pick a look:</strong>${Object.entries(LOOKS)
      .map(([k, v], i) => `<button type="button" data-look="${k}" aria-pressed="false">${i + 1}. ${esc(v.name)}</button>`).join('')}</div>`
  : '';

const galleryBody = `<body data-look="${DEFAULT_LOOK}" data-page="gallery">
<img class="banner" src="assets/banner.jpg" alt="" width="1600" height="436">
<div class="wrap">
  <header class="top">
    <div class="brand"><img src="assets/together-mark.png" alt="MTM Together" width="54" height="54"><p class="kicker" data-kicker>${esc(LOOKS[DEFAULT_LOOK].kicker)}</p></div>
    <h1 data-name>${esc(LOOKS[DEFAULT_LOOK].name)}</h1>
    <p class="lede">Games (and a few small tools) built by members of MTM Together in Vibe Coding for Nonprofits, from Whole Whale and Meet the Moment. Every one was built with AI by someone who is not a developer, then played, fixed and played again.</p>
    ${picker}
  </header>
  <nav class="filters" aria-label="Show">${filterButtons}</nav>
  <main class="grid">
    ${games.length ? games.map(card).join('\n') : '<p class="empty">The first games arrive soon.</p>'}
  </main>
  <footer>
    <p><strong>Nothing here collects anything about anyone.</strong> Every game runs in your browser and sends nothing anywhere.</p>
    <p>Each game belongs to the person who made it. Built for MTM Together by <a href="https://mtm.now">Meet the Moment</a>.</p>
  </footer>
</div>
${LOOK_SCRIPT}
</body>`;

writeFileSync(join(DIST, 'index.html'), pageShell({ title: LOOKS[DEFAULT_LOOK].name, description: 'Games built with AI by MTM Together members in Vibe Coding for Nonprofits.', body: galleryBody }));

// ---- One folder per game ----
for (const g of games) {
  if (g.kind === 'web' || g.kind === 'tool') {
    // The maker's file is never served as a page of its own. It runs inside a frame on a wrapper
    // page the gallery writes, and the sandbox is written INTO the wrapper, so it holds however
    // the address is spelled and whatever the server headers do:
    // - sandbox="allow-scripts allow-forms": the game gets a sealed origin of its own. It cannot
    //   read or change the gallery or another game, save anything, open pop-ups or alert boxes,
    //   or move the player's page anywhere. allow-forms only lets on-page form handlers run;
    //   form-action 'none' still stops any form sending its answers anywhere.
    // - the wrapper's Content-Security-Policy (inherited by the frame) blocks background network
    //   calls and outside resources, and stops the frame being sent to any other address.
    // The rules in lib.mjs are the polite warning before this; this is the safety net.
    const out = join(DIST, 'play', g.slug);
    mkdirSync(out, { recursive: true });
    const game = readFileSync(join(g.dir, g.kind === 'web' ? 'game.html' : 'tool.html'), 'utf8');
    const wrapper = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${esc(PLAY_CSP)}">
<title>${esc(g.title)}</title>
<style>html,body{margin:0;height:100%;background:#fff}iframe{display:block;border:0;width:100%;height:100vh;height:100dvh}</style>
</head>
<body>
<iframe title="${esc(g.title)}" sandbox="allow-scripts allow-forms" referrerpolicy="no-referrer" srcdoc="${esc(game)}"></iframe>
</body>
</html>`;
    writeFileSync(join(out, 'index.html'), wrapper);
    continue;
  }
  const out = join(DIST, 'prompts', g.slug);
  mkdirSync(out, { recursive: true });
  // Prompt games get a page with the prompt and a Copy button.
  const prompt = readFileSync(join(g.dir, 'prompt.md'), 'utf8').trim();
  const body = `<body data-look="${DEFAULT_LOOK}">
<div class="wrap">
  <header class="top">
    <p class="kicker"><a href="../../">← Back to <span data-name>${esc(LOOKS[DEFAULT_LOOK].name)}</span></a></p>
    <h1>${esc(g.title)}</h1>
    <p class="lede">${esc(g.tagline)}</p>
  </header>
  <main class="card" style="margin-bottom:24px">
    <div class="band"></div>
    <div class="inner">
      <span class="badge">Prompt game</span>
      <p>Copy everything in the box, paste it into a new chat in Claude, ChatGPT or Gemini, and play.</p>
      <button type="button" class="go" id="copy" style="border:0;cursor:pointer;font:inherit;font-weight:700">Copy the prompt</button>
      <pre id="prompt" style="white-space:pre-wrap;word-wrap:break-word;background:rgba(127,127,127,.12);padding:14px;border-radius:12px;font-size:14px;max-height:60vh;overflow:auto">${esc(prompt)}</pre>
      ${g.body ? `<div>${paragraphs(g.body)}</div>` : ''}
      ${credit(g).replace('src="makers/', 'src="../../makers/')}
    </div>
  </main>
</div>
${LOOK_SCRIPT}
<script>
document.getElementById('copy').addEventListener('click', function () {
  var b = this, t = document.getElementById('prompt').textContent;
  function done(ok) { b.textContent = ok ? 'Copied' : 'Select the text and copy it'; setTimeout(function () { b.textContent = 'Copy the prompt'; }, 2000); }
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(false); }); else done(false);
});
</script>
</body>`;
  writeFileSync(join(out, 'index.html'), pageShell({ title: g.title, description: g.tagline, body, depth: '../../' }));
}

console.log(`Built dist/ with ${games.length} game(s). Default look: ${DEFAULT_LOOK}. Picker: ${SHOW_PICKER ? 'on' : 'off'}.`);
