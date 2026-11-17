Copy everything below the line and paste it into Claude, ChatGPT or Gemini, in the same chat
where you built your game if you can.

----------

Help me get my game ready for a public community gallery. I am a beginner, so use plain words
and keep replies short. Ask me the questions below ONE AT A TIME and wait for each answer.

1. What is my game called? (60 characters or fewer.)
2. Is it (a) a game you see and tap, (b) a game an AI hosts, or (c) a small tool instead of a game?
3. Write one sentence that makes someone want to play it (160 characters or fewer). Offer me
   three options and let me pick or edit.
4. Who is it for, in a few words? (Optional.)
5. Do I want credit? Ask about each one separately, and remind me that each is optional and
   will be public on the web forever: my name as I want it shown; my LinkedIn profile address
   (it must start https://www.linkedin.com/in/ with nothing after my name); a photo of me. If I
   want a photo, tell me to use a screenshot of it, not the original file.
6. If I said yes to any credit, ask me to confirm: "I am OK with this being public, forever."

Then do three things:

A. Suggest a folder name: my game's name in lowercase letters and numbers joined by hyphens.

B. Write my about.md in ONE code block, exactly in this shape (leave a line blank after the
   colon if I said no to it; write yes after public_credit_ok only if I confirmed in question 6):

---
title:
kind:            (web for a see-and-tap game, prompt for an AI-hosted game, tool for a tool)
tagline:
players:
made_by:
linkedin:
headshot:        (the photo's file name, like headshot.jpg, if I am adding one)
public_credit_ok:
---
(One or two sentences on what my players got stuck on and what I changed.)

   Remove the words in brackets from the final version.

C. Check my game against these rules and tell me plainly if anything breaks one. If it does,
   give me a fixed version:
   - Everything is in ONE file. It loads nothing from other websites: no outside scripts,
     fonts, images or styles. Two exceptions: Chart.js 4.4.1 or Three.js r159, loaded with the
     exact script line in ADD-YOUR-GAME.md and nothing else.
   - It collects nothing and sends nothing anywhere: no fetch, no forms that send answers, no
     sign-ins, no saving anything to a server.
   - It saves nothing at all, not even in the browser (no localStorage, sessionStorage or
     indexedDB). The gallery runs every game in a sealed box where saving is switched off.
   - It uses no pop-up boxes (no alert, confirm or prompt), opens no new windows, and never
     sends the player to another page or website. It has no links to other websites.
   - There are NO passwords, API keys, access tokens or anything secret anywhere in it. This
     gallery is public, forever.
   - Nothing about real people, and nothing from my work.
   - It works on a phone: big things to tap, nothing that only works with a mouse.
   - The file is named game.html (see-and-tap), prompt.md (AI-hosted) or tool.html (tool).
