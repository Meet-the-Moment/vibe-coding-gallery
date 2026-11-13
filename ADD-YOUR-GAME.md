# Add your game to the gallery

You will copy this project to your own GitHub account, add one folder for your game, and ask
us to bring it in. That last step is called a **pull request**. Everything happens in your web
browser. Nothing to install.

## Before you start: this repo is PUBLIC

Anyone on the internet can read every file in it, and every old version of every file,
forever. Deleting something later does not remove it.

**Never put passwords, API keys, access tokens, or anything sensitive in your folder.**
Nothing about real people, and nothing from work. Your game must collect nothing and send
nothing anywhere. The gallery checks for this and will not publish a game that breaks it.

## What goes in your folder

One folder, named after your game: lowercase letters and numbers joined by hyphens, like
`holiday-trivia-showdown`. Inside it:

| File | What it is |
|---|---|
| `about.md` | Your game's name, one-sentence description and (optional) credit. Copy it from `games/_template/about.md`. |
| `game.html` | **If your game is one you see and tap.** The whole game in one file. |
| `prompt.md` | **If your game is one an AI hosts.** The whole prompt. |
| `tool.html` | **If you built a small tool instead of a game.** The whole tool in one file. |
| A photo (optional) | A `.jpg`, `.png` or `.webp` under 500 KB, if you want your face on your card. |

**Credit is your choice.** Your name, your LinkedIn link and your photo are all optional.
If you add any of them, you must write `public_credit_ok: yes` in `about.md`. Leave them all
blank and your card says "Made by a Vibe Coding builder".

Easiest way to make the folder: paste `PROMPT-FOR-YOUR-AI.md` into your AI tool. It asks you a
few questions and writes `about.md` for you.

## The steps

1. Sign in to GitHub.
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
8. Fill in the boxes the form asks for, tick the checkboxes, and click **Create pull request**.

## What happens next

- A robot builds a **preview** of the gallery with your game in it, and posts the link in your
  pull request. Open it on your phone. If the build fails, the details say what to fix in
  plain words. Fix it in your copy, and the preview rebuilds.
- Joshua or Kim from Meet the Moment reviews it, may ask for a change, and then **merges** it.
  A few minutes later your game is live in the gallery, with your name on it if you chose that.

Stuck? Ask at Ask us Anything (Tuesdays, 4:30 PM ET) or in MTM Together.
