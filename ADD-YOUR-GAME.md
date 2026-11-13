# Add your game to the gallery

You will copy this project to your own GitHub account, add one folder for your game, and ask
us to bring it in. That last step is called a **pull request**. Everything happens in your web
browser. Nothing to install.

**Rather not use GitHub for this?** That is fine. Send your game file and your answers to the
questions in `PROMPT-FOR-YOUR-AI.md` to us in MTM Together, and we will add it for you.

## Before you start: this repo is PUBLIC

Anyone on the internet can read every file in it, and every old version of every file,
forever. Deleting something later does not remove it, and that is true even if your pull
request is never accepted.

**Never put passwords, API keys, access tokens, or anything sensitive in your folder.**
Nothing about real people, and nothing from work. Your game must collect nothing, save
nothing (not even in the browser), and send nothing anywhere. The gallery checks for this and
will not publish a game that breaks it.

**Your GitHub username is public on your pull request**, whatever you choose for credit below.

**Hide your email address first.** On GitHub, open Settings, then Emails, and tick **Keep my
email addresses private**. If you skip this, the email address on your GitHub account can be
saved, publicly and permanently, with your changes.

## What goes in your folder

One folder, named after your game: lowercase letters and numbers joined by hyphens, like
`holiday-trivia-showdown`. Inside it:

| File | What it is |
|---|---|
| `about.md` | Your game's name, one-sentence description and (optional) credit. Copy the text of `games/_template/about.md`. |
| `game.html` | **If your game is one you see and tap.** The whole game in one file. |
| `prompt.md` | **If your game is one an AI hosts.** The whole prompt. |
| `tool.html` | **If you built a small tool instead of a game.** The whole tool in one file. |
| A photo (optional) | A `.jpg`, `.png` or `.webp` under 500 KB. **Use a screenshot of your photo, not the original file**: phone photos can carry hidden details such as where they were taken, and the gallery will turn those away. |

**Credit on the gallery is your choice.** Your name, your LinkedIn link and your photo are all
optional. If you add any of them, you must write `public_credit_ok: yes` in `about.md`. Leave
them all blank and your card says "Made by a Vibe Coding builder". Only add credit for yourself,
never for someone else.

Easiest way to make the folder: paste `PROMPT-FOR-YOUR-AI.md` into your AI tool. It asks you a
few questions, writes `about.md` for you, and checks your game against the rules.

## The steps

1. Sign in to GitHub, and hide your email address (see above).
2. Open the gallery repo and click **Fork** (top right), then **Create fork**. You now have
   your own copy.
3. In your copy, open the `games` folder. Click **Add file**, then **Create new file**.
4. In the name box, type your folder name, a slash, and `about.md`, like
   `holiday-trivia-showdown/about.md`. The slash makes the folder.
5. Paste in your `about.md`. Click **Commit changes**.
6. Open your new folder. Click **Add file**, then **Upload files**, and drag in your game file
   (and your photo, if you are adding one). Click **Commit changes**.
7. Go back to the top of your copy. GitHub shows a bar saying your copy has changes. Click
   **Contribute**, then **Open pull request**.
8. Fill in your game's name and what your players got stuck on, then click
   **Create pull request**. Now tick the checkboxes on the page that opens.
9. Change only your own folder. A pull request that changes anything else will not be accepted.

## What happens next

- Joshua, Kim or Faith from Meet the Moment takes a look, then lets a robot build a **preview**: a copy
  of the gallery with your game in it. Its link appears in your pull request. This can take a
  day, so do not worry if nothing happens straight away.
- Open the preview on your phone and play your game. Then tick the last checkbox.
- If the build fails, the details say what to fix in plain words. Fix it in your copy, and tell
  us in the pull request.
- We may ask for a change, then **merge** it. A few minutes later your game is live in the
  gallery, with your name on it if you chose that.
- **Changed your mind later?** Ask us and we take your game or your credit off the site. It
  stays in the repo's history and in any copies people made, because that is how GitHub works.

Stuck? Ask at Ask us Anything (Tuesdays, 4:30 PM ET) or in MTM Together.
