# vincentchu.xyz

Personal site for Vincent Chu, live at **https://www.vincentchu.xyz**.

It is a static site: plain HTML, CSS and JavaScript files with no framework, no build step and no backend. The browser downloads the files as they sit in this repo.

## From a push to a visitor's screen

```
git push to main
      │
      ├──► Vercel copies the repo and serves it at www.vincentchu.xyz   (the live site)
      │
      └──► GitHub Pages builds its own copy, but only uses it to redirect
           21vincentchu.github.io ──► www.vincentchu.xyz
```

- **Vercel is the host.** The domain's DNS points at Vercel, so every visitor is served by it. `vincentchu.xyz` without `www` redirects to the `www` address.
- **GitHub Pages is a leftover redirect.** It still builds on each push, but the `CNAME` file makes `21vincentchu.github.io` forward to the custom domain, which lands on Vercel. Vercel does not read from GitHub Pages; the two only share the repo.
- **Nothing is configured in the repo.** There is no `vercel.json`; the project and domain settings live in the Vercel dashboard.

## What happens when a page loads

1. **The browser requests a page**, for example `/experience.html`. Each page is its own complete HTML file, so moving between pages is a normal full page load.
2. **The `<head>` runs first.** It starts Google Analytics and Vercel Analytics, loads the stylesheets, and checks whether this is the first page of the visit.
3. **The intro plays once per visit.** On the first page, a loading screen with the VC logo and a percentage counter runs for about 1.5 seconds. Later pages in the same browser tab skip it and show the nav immediately.
4. **`script.js` wires up the page.** The same script runs on every page and turns on whatever that page contains: the clock, the mobile menu, scroll animations, the custom cursor and so on.
5. **Data is fetched last.** Parts of the site are filled in from JSON files after the page is on screen (see below).

## Where the content comes from

Most content is written directly in the HTML files. Three parts are loaded from data files so they can change without touching a page:

| Data file | Fills in | How it gets updated |
|---|---|---|
| `vocab.json` | Word of the day on the home page | Edited by hand |
| `music.json` | On Rotation and listening stats on the Fun page | `api/update_spotify.py` pulls it from Spotify |
| `images/photos/photos.json` | Photo gallery on the Fun page | `scripts/build_photos.py` resizes photos and writes it |

Both scripts are run by hand on a laptop, and the files they write are committed like any other change. The live site never talks to Spotify or runs any Python.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Home: intro, rotating profile photos, word of the day |
| `experience.html` | Work history as a horizontal timeline |
| `education.html` | Education and research papers |
| `projects.html` | Project cards |
| `photos.html` | "Fun": photos, On Rotation, listening stats |
| `home/` | A private-use dashboard at `/home/`, separate from the rest of the site |

## Components

**On every page**

- **Nav bar**: logo, page links, resume PDF, social links, and a live clock showing St. Louis time.
- **Copy email**: clicking the envelope copies the email address instead of opening a mail app.
- **Scroll effects**: a progress bar along the top, sections that fade in as they scroll into view, and a back-to-top button.
- **Custom cursor**: a dot and trailing ring that react to links and buttons, on devices with a mouse.
- **Footer note**: "Rebuilt X days ago", worked out from when the page was last deployed.

**Home**

- **Word of the day**: picks one word from `vocab.json` based on the date, so everyone sees the same word that day. The shuffle button deals the others.

**Experience**

- **Timeline carousel**: job cards in a horizontal track that moves by mouse wheel, drag, arrow buttons, or the dots on the timeline. Cards expand to show details.

**Education and Projects**

- **Paper viewer and image lightbox**: papers open as page images, and images enlarge in an overlay.

**Fun**

- **Section tabs**: Photos, On Rotation and Listening Stats show one at a time. The open tab is stored in the URL, so it can be linked to.
- **Photo gallery**: filter by category, switch between a horizontal strip and a grid, and click a photo to open it full size. The chosen view is remembered in the browser.
- **On Rotation**: rows of top artists and tracks from the last four weeks, linking to Spotify.
- **Listening stats**: tiles and charts (genres, artist popularity, release years, artists climbing and fading), drawn in the browser from `music.json`.

**Dashboard (`/home/`)**

- Clock, St. Louis weather from wttr.in, a to-do list and notes with folders. The to-dos and notes are saved only in the browser they were typed in; nothing is sent anywhere.

## Changing things

- **Edit a page**: change the HTML and push.
- **Edit a script or stylesheet**: also bump its `?v=` number in the HTML (for example `script.js?v=29`), otherwise returning visitors may keep the old cached copy.
- **Preview locally**: run `python3 -m http.server 5500` in the repo and open `http://127.0.0.1:5500`. Opening the files directly will not load the JSON data.
- **Refresh music**: `cd api && python3 update_spotify.py`, then commit `music.json`. Needs Spotify credentials in `PersonalWebsite/.env`.
- **Add photos**: drop originals in `images/actualphotos/`, run `python3 scripts/build_photos.py`, set categories in `photos.json`, then commit.
