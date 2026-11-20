# The Vibe Coding gallery

A published gallery of games (and a few small tools) built by members of
[MTM Together](https://together.mtm.now) in **Vibe Coding for Nonprofits**, a joint course from
Whole Whale and [Meet the Moment](https://mtm.now), fall 2026.

**Want your game here?** Read [ADD-YOUR-GAME.md](ADD-YOUR-GAME.md).

## The name is up for a vote

The gallery has three looks, each with its own name: **Vibe Coding Arcade**, **MTM Together
Game Gallery**, and **Party Games: Community Edition**. Participants vote in Session 2
(11/20/2026). Until then the page shows a picker, and `?look=arcade`, `?look=gallery` or
`?look=party` opens one directly. After the vote, set `DEFAULT_LOOK` and `SHOW_PICKER` at the
top of `build.mjs`.

## How it works

| Part | What it does |
|---|---|
| `games/<name>/` | One folder per game: `about.md` plus `game.html`, `prompt.md` or `tool.html`, and an optional photo. `_template` is the starter. |
| `lib.mjs` | The rules: required fields, file types and sizes, no links or special files, credit only with consent, no secrets, no network calls, no saving, nothing loaded from other sites except the two pinned libraries (see below). |
| `check.mjs` | `node check.mjs` runs the rules and says in plain words what to fix. |
| `build.mjs` | `node build.mjs` runs the same rules, then builds the site into `dist/`. It refuses to build if any game breaks a rule. |
| `netlify.toml` | Build settings and security headers, a second layer behind the wrappers below. |

**How games are contained.** A maker's file is never served as a page of its own. `build.mjs`
puts it inside a frame with `sandbox="allow-scripts allow-forms"` on a wrapper page under `/play/`, and
writes a strict policy into that page. The game gets a sealed origin: it cannot read or change
the gallery or another game, save anything, open pop-ups, submit forms, move the player's page,
send data, or send its own frame to another address. Tested 11/13/2026 with a deliberately
hostile game and no server headers: every one of those attempts was blocked. Prompt pages are
under `/prompts/`.

No dependencies: plain Node 18 or later. Games may load only the pinned libraries listed in
`PINNED_LIBRARIES` in `lib.mjs`; the same URLs are allowed in the `/play/` policies in `build.mjs`
and `netlify.toml`, and `build.mjs` stops if the `netlify.toml` copy drifts from the list. A game
that uses one makes the player's browser fetch that file from jsDelivr, which sees the player's IP
address; the gallery footer says so. Such a game also stops working if jsDelivr is down.

## Rules for maintainers

**A pull request can change any file, including `build.mjs`, `lib.mjs` and `netlify.toml`.**
The rules check only protects us from honest mistakes. Against a pull request that rewrites the
rules themselves, the protection is these settings and this review, so set them up before the
link is shared and check them again before Session 4.

**Settings to have in place.** Checked 11/17/2026 by a maintainer without admin access: `main`
is protected, squash merge is the only merge type, and CODEOWNERS is in place. The Netlify
settings, the branch protection details and the Actions setting need an admin to confirm.
- **Netlify, untrusted deploys policy: "Require approval"** (Project configuration > Developer
  settings > Continuous deployment). Never "Build without restrictions". Pull requests from
  forks then wait for a maintainer before anything builds.
- **Netlify: no environment variables, build plugins or extensions** on this site, and check the
  team for shared ones. Safest is a Netlify team that holds only this site.
- **Netlify: automatic deletion of deploy previews** when a pull request closes.
- **GitHub: branch protection on `main`**: pull request required, one approving review from a
  code owner, no force pushes. Squash merge only.
- **GitHub: Actions off** for this repo (it uses none).
- **GitHub: `.github/CODEOWNERS`** makes Joshua, Kim and Faith the owners of everything, so a
  merge needs an approval from one of them.

**Before approving a preview build or a merge:**
1. Open **Files changed**. Approve only if every path is inside ONE `games/<name>/` folder, and
   that folder is new or belongs to the person opening the pull request. Approving a build is
   running their code on our Netlify account: treat it that way.
2. Open the game file and read it. Look for anything that pretends to be a sign-in page or asks
   for a password, email or personal detail. The sandbox stops it sending anything, but a person
   could still be fooled into typing something. Turn those away.
3. If the pull request adds credit (name, LinkedIn, photo), check that the person credited is
   the person opening the pull request, and that the consent boxes are ticked.

**If someone asks to be removed:** delete their folder in a new pull request and merge it. Tell
them plainly that it stays in the repo's history and in any forks.

Each game belongs to the person who made it. The gallery code is © Meet the Moment.

---
Built by Meet the Moment · [mtm.now](https://mtm.now)
