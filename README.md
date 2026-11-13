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
| `lib.mjs` | The rules: required fields, file types and sizes, credit only with consent, no secrets, no network calls, nothing loaded from other sites. |
| `check.mjs` | `node check.mjs` runs the rules and says in plain words what to fix. |
| `build.mjs` | `node build.mjs` runs the same rules, then builds the site into `dist/`. It refuses to build if any game breaks a rule. |
| `netlify.toml` | Build settings, plus headers that stop any game from contacting another site, whatever is in its file. |

No dependencies: plain Node 18 or later.

## Rules for maintainers

- **This repo is public.** Never commit passwords, API keys, tokens or anything sensitive, and
  never add environment variables or secrets to its Netlify site: pull request previews run
  code from people outside MTM.
- Every merge needs a review from Joshua or Kim. `main` is protected.
- Each game belongs to the person who made it. The gallery code is © Meet the Moment.

---
Built by Meet the Moment · [mtm.now](https://mtm.now)
