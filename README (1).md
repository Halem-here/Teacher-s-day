# Teachers' Day website

Files: `index.html` (structure), `style.css` (all themes + animations), `script.js` (logic + effects), `content.js` (names + messages + password hashes).

## Edit a message
Open `content.js`. Each teacher is one block (`naqaab`, `asfandyar`, `solo`, `unknown`).
- `message: [ ... ]` is the personal message, one string per paragraph.
- `thanks` is the final thank-you line, `signoff` is the "from" line.
- `terminal: [ ... ]` is the typed terminal intro. Lines starting with `$ ` appear as typed commands.
- `prompt` (Mr Solo only) is the shell prompt shown on his page.
- Do not change `id`.

## Change a password
Passwords are stored as a SHA-256 hash of `id:password`. To make a new hash (example: teacher `solo`, new password `hello`):

    printf '%s' 'solo:hello' | sha256sum

Paste the 64-character result into that teacher's `hash:` in `content.js`.

## Test locally
Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Deploy (free options)
- **Netlify Drop:** go to app.netlify.com/drop and drag this whole folder in. You get a link in seconds.
- **GitHub Pages:** push the files to a repository, then Settings → Pages → deploy from the `main` branch.
- **Cloudflare Pages / Vercel:** create a project, upload the folder, no build command needed.

## Honest note
The password check runs in the browser, so it is a friendly surprise gate, not real security. Anyone who inspects the page source could read the messages.
