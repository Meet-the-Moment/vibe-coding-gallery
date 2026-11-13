// Shared by check.mjs and build.mjs. No dependencies: plain Node 18+.
// Reads every folder in games/, parses its about.md, and checks it against the gallery rules.
// Every rule here protects either the players (nothing collected, nothing sent anywhere) or
// the makers (nothing secret in a public repo, credit only with consent).

import { readdirSync, readFileSync, statSync, lstatSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = dirname(fileURLToPath(import.meta.url));
export const GAMES_DIR = join(ROOT, 'games');
export const KINDS = { web: 'game.html', prompt: 'prompt.md', tool: 'tool.html' };
const ALLOWED_EXT = new Set(['.html', '.md', '.jpg', '.jpeg', '.png', '.webp']);
const HEADSHOT_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FOLDER_BYTES = 3 * 1024 * 1024;
const MAX_HEADSHOT_BYTES = 500 * 1024;
const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%.]+\/?$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KNOWN_FIELDS = new Set(['title', 'kind', 'tagline', 'players', 'made_by', 'linkedin', 'headshot', 'public_credit_ok']);
const TEMPLATE_BODY = 'Anything you write below this line shows';

// Things that look like secrets. A match blocks the whole submission.
const SECRET_PATTERNS = [
  [/sk-[A-Za-z0-9_\-]{16,}/, 'an API key (sk-...)'],
  [/sk-ant-[A-Za-z0-9_\-]{10,}/, 'an Anthropic API key'],
  [/AIza[0-9A-Za-z_\-]{30,}/, 'a Google API key'],
  [/AKIA[0-9A-Z]{16}/, 'an AWS access key'],
  [/gh[pousr]_[A-Za-z0-9]{30,}/, 'a GitHub token'],
  [/xox[abprs]-[A-Za-z0-9\-]{10,}/, 'a Slack token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a private key'],
  [/eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{10,}/, 'a login token (JWT)'],
  [/\b(api[_-]?key|apikey|secret|password|passwd|access[_-]?token)\s*[:=]\s*["'][^"'\s]{6,}["']/i, 'a password or key written into the code'],
];

// Things a game in this gallery must not do. It must collect nothing and send nothing anywhere.
const NETWORK_PATTERNS = [
  [/\bfetch\s*\(/, 'fetch(...) sends or loads data over the internet'],
  [/XMLHttpRequest/, 'XMLHttpRequest sends or loads data over the internet'],
  [/new\s+WebSocket\s*\(/, 'a WebSocket connects to a server'],
  [/sendBeacon\s*\(/, 'sendBeacon sends data to a server'],
  [/new\s+EventSource\s*\(/, 'EventSource connects to a server'],
  [/<form[^>]*\baction\s*=/i, 'a form that sends its answers somewhere'],
  [/<(script|link|img|iframe|audio|video|source|embed|object)\b[^>]*\b(src|href)\s*=\s*["']?\s*(https?:)?\/\//i, 'it loads something from another website (put everything inside the one file)'],
  [/@import\s+url\(\s*["']?(https?:)?\/\//i, 'it loads a style from another website'],
  [/\b(window|document|top|parent|self)?\.?location\s*(\.href)?\s*=(?!=)|\blocation\.(assign|replace)\s*\(/, 'it sends the player to another page. A game stays on its own page'],
  [/<meta[^>]*http-equiv\s*=\s*["']?refresh/i, 'it sends the player to another page automatically'],
  [/\bwindow\.open\s*\(/, 'it opens another window'],
  [/\b(RTCPeerConnection|webkitRTCPeerConnection|RTCDataChannel)\b/, 'it opens a direct connection to other computers'],
  [/<link[^>]*\brel\s*=\s*["']?[^"'>]*\b(dns-prefetch|preconnect|prefetch|prerender|preload)\b/i, 'it tells the browser to contact another website ahead of time'],
  [/\b(alert|confirm|prompt)\s*\(/, 'it uses a pop-up box (alert, confirm or prompt). The gallery switches those off, so show the message on the page instead'],
  [/<a\b[^>]*\bhref\s*=\s*["']?\s*(https?:)?\/\//i, 'it has a link to another website. Take the link out (put your name and LinkedIn in about.md instead)'],
  [/\b(localStorage|sessionStorage|indexedDB)\b/, 'it saves things in the browser. The gallery runs every game in a sealed box where saving is switched off, so the game would break there. Take the saving out'],
];

// Photo metadata can include GPS location and camera details. FAILS CLOSED: anything this code
// cannot fully read counts as "has metadata". Plain byte parsing, no dependencies.
// - JPEG: any EXIF (APP1 "Exif") or IPTC (APP13) segment; any XMP (APP1) mentioning GPS;
//   a file whose headers do not run cleanly to the image data.
// - PNG: any eXIf chunk; any text chunk (tEXt, iTXt, zTXt) mentioning GPS; a broken chunk list.
// - WebP: any EXIF chunk; any XMP chunk mentioning GPS; a broken chunk list.
// Ordinary screenshots carry harmless text (for example "Screenshot") and pass.
const GPS_RE = /gps/i;

// Returns the full readable text of a PNG text chunk (keyword included), decompressing it if
// needed, or null if it cannot be read or is a hex-encoded "Raw profile" (which can carry a whole
// EXIF block). null means "treat as unsafe".
function pngText(type, data) {
  const nul = data.indexOf(0);
  if (nul < 0) return null;
  const keyword = data.toString('latin1', 0, nul);
  if (/^raw profile/i.test(keyword)) return null;
  try {
    if (type === 'tEXt') return data.toString('latin1');
    if (type === 'zTXt') return keyword + ' ' + inflateSync(data.subarray(nul + 2)).toString('latin1');
    // iTXt: keyword \0 compression-flag method language \0 translated-keyword \0 text
    const flag = data[nul + 1];
    const langEnd = data.indexOf(0, nul + 3);
    const transEnd = langEnd < 0 ? -1 : data.indexOf(0, langEnd + 1);
    if (transEnd < 0) return null;
    const body = data.subarray(transEnd + 1);
    return keyword + ' ' + (flag ? inflateSync(body) : body).toString('latin1');
  } catch {
    return null;
  }
}
function hasPhotoMetadata(buf) {
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 4 <= buf.length) {
      if (buf[i] !== 0xff) return true;                  // not a marker where one must be
      const marker = buf[i + 1];
      if (marker === 0xda) return false;                  // reached the image data cleanly
      if (marker === 0xd9) return true;                   // ended before any image data
      if (marker === 0xff) { i += 1; continue; }          // padding byte
      const len = buf.readUInt16BE(i + 2);
      if (len < 2 || i + 2 + len > buf.length) return true;
      const seg = buf.subarray(i + 4, i + 2 + len);
      if (marker === 0xe1) {
        if (seg.toString('latin1', 0, 4) === 'Exif') return true;
        if (GPS_RE.test(seg.toString('latin1'))) return true;
      }
      if (marker === 0xed) return true;                   // APP13: IPTC / Photoshop data
      i += 2 + len;
    }
    return true;                                          // ran out of file before image data
  }
  if (buf.length > 8 && buf.toString('latin1', 1, 4) === 'PNG') {
    let i = 8;
    while (i + 8 <= buf.length) {
      const len = buf.readUInt32BE(i);
      const type = buf.toString('latin1', i + 4, i + 8);
      if (i + 12 + len > buf.length) return true;
      if (type === 'eXIf') return true;
      if (['tEXt', 'iTXt', 'zTXt'].includes(type)) {
        const text = pngText(type, buf.subarray(i + 8, i + 8 + len));
        if (text === null || GPS_RE.test(text)) return true;   // unreadable counts as unsafe
      }
      if (type === 'IEND') return false;
      i += 12 + len;
    }
    return true;
  }
  if (buf.length > 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
    let i = 12;
    while (i + 8 <= buf.length) {
      const type = buf.toString('latin1', i, i + 4);
      const len = buf.readUInt32LE(i + 4);
      if (i + 8 + len > buf.length) return true;
      if (type === 'EXIF') return true;
      if (type === 'XMP ' && GPS_RE.test(buf.toString('latin1', i + 8, i + 8 + len))) return true;
      i += 8 + len + (len % 2);
    }
    return false;
  }
  return true;                                            // not a format we can read: refuse
}

export function parseAbout(text) {
  const m = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  const fields = {};
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i < 1) continue;
    const key = line.slice(0, i).trim().toLowerCase();
    let value = line.slice(i + 1).trim();
    if (/^#/.test(value)) value = '';
    value = value.replace(/^["']|["']$/g, '').trim();
    fields[key] = value;
  }
  return { fields, body: m[2].trim() };
}

// lstat, never stat: a symbolic link in a pull request could otherwise point the build at any
// file on the build machine and publish it. Links are rejected below before anything is read.
function folderBytes(dir) {
  let total = 0;
  for (const f of readdirSync(dir)) {
    const s = lstatSync(join(dir, f));
    if (s.isFile()) total += s.size;
  }
  return total;
}

// Returns { games: [...valid games], problems: [{ game, message }] }.
// Folders starting with "_" (the template) are skipped.
export function loadGames() {
  const games = [];
  const problems = [];
  const add = (game, message) => problems.push({ game, message });

  for (const slug of readdirSync(GAMES_DIR).sort()) {
    const dir = join(GAMES_DIR, slug);
    const dirStat = lstatSync(dir);
    if (slug === '_template' || slug.startsWith('.')) continue;
    if (dirStat.isSymbolicLink()) { add(slug, 'This is a link, not a real folder. Add a real folder.'); continue; }
    if (!dirStat.isDirectory()) continue;
    const before = problems.length;

    if (!SLUG_RE.test(slug)) add(slug, 'The folder name must be lowercase letters and numbers joined by hyphens, like my-holiday-trivia.');

    const files = readdirSync(dir);
    let unsafe = false;
    for (const f of files) {
      const s = lstatSync(join(dir, f));
      if (s.isSymbolicLink() || (!s.isFile() && !s.isDirectory())) { add(slug, `Remove "${f}". It is a link or special file, not a normal file.`); unsafe = true; continue; }
      if (s.isDirectory()) { add(slug, `Remove the folder "${f}". A game folder holds files only.`); continue; }
      if (!ALLOWED_EXT.has(extname(f).toLowerCase())) add(slug, `Remove "${f}". Only .html, .md, .jpg, .png and .webp files are allowed.`);
    }
    if (unsafe) continue;   // read nothing from a folder that contains links
    if (folderBytes(dir) > MAX_FOLDER_BYTES) add(slug, 'The folder is bigger than 3 MB. Make the photo smaller, or remove files you do not need.');

    const aboutPath = join(dir, 'about.md');
    if (!existsSync(aboutPath)) { add(slug, 'Add an about.md file (copy the one from games/_template).'); continue; }
    const about = parseAbout(readFileSync(aboutPath, 'utf8'));
    if (!about) { add(slug, 'about.md must start and end its top section with a line of three dashes: ---'); continue; }
    const a = about.fields;
    for (const k of Object.keys(a)) if (!KNOWN_FIELDS.has(k)) add(slug, `about.md: "${k}" is not a field the gallery uses. Remove that line.`);
    if (about.body.includes(TEMPLATE_BODY)) add(slug, 'about.md: replace the sample sentence under the second --- line with your own words, or delete it.');

    if (!a.title) add(slug, 'about.md: fill in the title.');
    else if (a.title.length > 60) add(slug, 'about.md: the title is longer than 60 characters.');
    if (!a.tagline) add(slug, 'about.md: fill in the tagline (one sentence).');
    else if (a.tagline.length > 160) add(slug, 'about.md: the tagline is longer than 160 characters.');
    if (a.players && a.players.length > 80) add(slug, 'about.md: "players" is longer than 80 characters.');

    const kind = (a.kind || '').toLowerCase();
    if (!KINDS[kind]) add(slug, 'about.md: kind must be exactly one of: web, prompt, tool.');
    else if (!files.includes(KINDS[kind])) add(slug, `This is a "${kind}" entry, so the folder needs a file named ${KINDS[kind]}.`);

    if (a.made_by && a.made_by.length > 60) add(slug, 'about.md: made_by is longer than 60 characters.');
    if (a.linkedin && !LINKEDIN_RE.test(a.linkedin)) add(slug, 'about.md: linkedin must be your profile address, starting https://www.linkedin.com/in/ and with nothing after your name (remove everything from a ? onward).');
    if (a.headshot) {
      const hp = join(dir, a.headshot);
      if (!files.includes(a.headshot)) add(slug, `about.md names the photo "${a.headshot}", but there is no file with that name in the folder.`);
      else if (!HEADSHOT_EXT.has(extname(a.headshot).toLowerCase())) add(slug, 'The photo must be a .jpg, .png or .webp file.');
      else if (statSync(hp).size > MAX_HEADSHOT_BYTES) add(slug, 'The photo is bigger than 500 KB. Make it smaller.');
      else if (hasPhotoMetadata(readFileSync(hp))) add(slug, 'The photo carries hidden details from the camera (which can include where it was taken). Take a screenshot of your photo and use the screenshot instead.');
    }
    const givesCredit = Boolean(a.made_by || a.linkedin || a.headshot);
    if (givesCredit && (a.public_credit_ok || '').toLowerCase() !== 'yes') {
      add(slug, 'about.md: you filled in credit (name, LinkedIn or photo), so public_credit_ok must say yes. If you do not want it public, leave those lines blank.');
    }

    // Secrets: checked in every text file in the folder.
    for (const f of files.filter((f) => ['.html', '.md'].includes(extname(f).toLowerCase()))) {
      const text = readFileSync(join(dir, f), 'utf8');
      for (const [re, what] of SECRET_PATTERNS) {
        if (re.test(text)) add(slug, `${f} seems to contain ${what}. Never put passwords, API keys or access tokens in this repo: it is public, forever. Remove it, and if it was a real key, cancel that key now.`);
      }
    }
    // Network: checked in the playable file only.
    if (kind === 'web' || kind === 'tool') {
      const f = KINDS[kind];
      if (files.includes(f)) {
        const text = readFileSync(join(dir, f), 'utf8');
        for (const [re, what] of NETWORK_PATTERNS) {
          if (re.test(text)) add(slug, `${f}: ${what}. Games in this gallery collect nothing and send nothing anywhere.`);
        }
      }
    }

    // The computed values go LAST so nothing in about.md can override slug, dir, kind or files
    // (a field like "slug: ../x" would otherwise write the game outside the sandbox).
    if (problems.length === before) games.push({ ...a, slug, dir, kind, files, body: about.body });
  }
  return { games, problems };
}
