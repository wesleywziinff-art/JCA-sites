# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing website for **JCA**, an automotive styling / detailing shop based in **Atlanta, Georgia (USA)**.

Core services to represent on the site:

- Vinyl wrap
- Window tint
- Chrome delete

Multi-page static site, deployed on **Vercel**.

## Structure

```
index.html          Home — hero slider, services, about split, feature band, stats, gallery preview
about.html          Story, stats, 4-step process, feature band, service area
services.html       Three anchored service rows (#wrap, #tint, #chrome-delete), process, FAQ
gallery.html        Filterable mosaic + lightbox
contact.html        Info cards, quote form, hours, map
assets/css/style.css   Single stylesheet, numbered sections, all tokens in :root at the top
assets/js/main.js      Single script, one IIFE per feature, each bails if its markup is absent
assets/img/            SVG placeholders — every photo here is meant to be replaced
images/                Real photography (JPEG). Three service photos shared by services.html
                       (detail rows) and index.html (cards), plus the three hero slides.
```

Images live in two folders right now: `assets/img/` holds the generated SVG placeholders, `images/` holds real photos. `images/` was requested by name; consolidating the two is still open.

Source photos arrive as ~2 MB PNGs and must be converted, not renamed — there is no build step to optimize them. JPEG quality 82 via `System.Drawing` takes them to ~180 KB (90% smaller). Give every `<img>` explicit `width`/`height` so the box is reserved before the file loads.

Never put `loading="lazy"` on a hero carousel slide. Inactive slides are `visibility: hidden`, so the browser defers the fetch indefinitely and the slide rotates in blank. All three hero images load eagerly (~330 KB total); only slide 1 carries `fetchpriority="high"`.

Header, footer and the `<head>` block are duplicated across the five pages by design (no build step, no includes). **Any change to nav, footer or meta must be applied to all five files.** Each page marks its own nav item with `class="is-active"` and `aria-current="page"`.

`<html>` carries a `js` class set by an inline script in every `<head>`. Scroll-reveal styles are scoped to `.js .reveal` so content is never stuck at `opacity: 0` when JavaScript fails — keep that scoping if you touch section 17 of the stylesheet.

## Typography scale

Headings use `clamp(<rem floor>, <rem base> + <vw>, <rem cap>)` — a linear curve, not raw `vw`. Raw `vw` was the original approach and it broke: the home headline hit 80px inside a 640px column and wrapped to four lines.

Two constraints drive the numbers, and both must be re-checked if the hero copy changes:

- **The cap** is bound by the column. In the 720px `.hero__copy`, the headline wraps past 76px, so it is capped at 68px.
- **The floor** is bound by the longest line. `text-transform: uppercase` makes "DONE TO THE MILLIMETER" need ~9.1x the font size in width — at a 320px viewport only 284px remains after gutters, so the floor is 28px.

When measuring, note that canvas `measureText` ignores both `text-transform` and `letter-spacing` and will read low. Measure with a hidden `white-space: nowrap` span that inherits the real computed style.

Every auto-fit grid wraps its track minimum in `min(<track>, 100%)`. Without it a 320px track minimum overflows the 284px available on a small phone, and `body { overflow-x: hidden }` clips it silently instead of showing a scrollbar.

## Design system

Monochrome, taken from the JCA wordmark: near-black surfaces, white text, and a **chrome/silver gradient** (`--chrome`) as the accent — it replaces the red of the visual reference and echoes the chrome delete service. Retheme by editing `:root` in `assets/css/style.css`; nothing hardcodes a hex outside that block.

Display type is Barlow Condensed (heavy, italic, uppercase) over Barlow for body copy, loaded from Google Fonts via `<link>`. Both have local fallback stacks — the layout survives if the CDN is blocked.

## Placeholders that must be replaced before launch

All of these are fake and repeated across the five pages:

- Email `info@jcaatlanta.com`
- Address `1234 Example Ave NW, Atlanta, GA 30318`
- Hours Mon–Fri 9–6, Sat 10–4, Sun closed
- Stat figures (900+ vehicles, 10 yrs, 48h turnaround)
- Every image in `assets/img/` — generated SVG placeholders, not photography. `service-wrap.svg`, `service-tint.svg` and `service-chrome.svg` are now orphaned (nothing references them) and can be deleted.

**Photography renders in full color.** No stylesheet rule applies `filter: grayscale` to images anywhere — that was removed after it kept re-surfacing section by section (it lived in four separate component rules, not one global one). Hover on a photo scales it (`transform: scale`), never recolors it. Keep it that way: a new image slot should need no filter override to look right.

Anything overlaid directly on a photo needs its contrast re-checked when a placeholder is swapped for a real image. The `.card__index` numerals used `mix-blend-mode: overlay`, which read acceptably over mid-grey placeholders but fell to ~1.5:1 over the near-black photos; they now use solid white with a shadow instead.
- `assets/img/jca-logo.svg` and `favicon.svg` — overwrite with the official export, keeping the filenames

Georgia window tint VLT limits are described in general terms on `services.html` on purpose; verify current state law before stating specific percentages.

## Stack constraints

- **Plain HTML + CSS + JavaScript.** No framework (no React/Next/Vue) and no build step.
- Multi-page: each page is its own `.html` file, not a SPA with client-side routing.
- Do not introduce npm dependencies, bundlers, or preprocessors (Sass, PostCSS) without asking first — the "no build step" choice is deliberate.
- Third-party libraries, if genuinely needed, come in via CDN `<script>` / `<link>` tags.

## Content language

**All site-facing content is `en-US`** — copy, headings, button labels, form labels, `alt` text, `<title>`, and meta descriptions. Set `<html lang="en">`.

The user communicates in Portuguese; the website does not. Never let pt-BR text reach the page output.

## Local development

**Node is not installed on this machine** — `npx serve`, `npx vercel dev` and `npx vercel --prod` all fail with `spawn npx ENOENT` until Node.js is installed. Python is not available either (the `python` on PATH is the Microsoft Store stub).

Until then, the site is fully browsable by opening `index.html` directly in a browser: everything is relative paths, and no `fetch`/XHR is used, so `file://` works.

To serve over HTTP without Node, a PowerShell `HttpListener` script does the job:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Once Node is installed, the normal flow applies:

```bash
npx serve .
```

## Deploy

Vercel, from this directory as a static site. Requires Node.

```bash
npx vercel --prod
```

There is no `vercel.json` yet. Add one only when the project actually needs redirects, clean URLs, headers, or serverless functions.

## Contact form — Supabase

The `contact.html` form POSTs to a Supabase table, `contact_submissions`. Everything lives in the `contactForm` IIFE in `assets/js/main.js`: client-side validation, the project URL, the publishable key, and the `fetch` call.

**No client library.** A single INSERT does not justify pulling `@supabase/supabase-js` from a CDN into a site that otherwise ships zero JS dependencies. The call is a plain `fetch` to `/rest/v1/contact_submissions` with `apikey`, `Authorization: Bearer`, and `Prefer: return=minimal` headers.

The publishable key is **meant to be public** — it is what protects nothing on its own. Security comes from Row Level Security on the table: the `anon` role has an INSERT policy and no SELECT/UPDATE/DELETE policy, plus an explicit `revoke all` / `grant insert`. That key cannot read a single row. Do not "hide" the key or move it to a build-time variable expecting a security gain; there is none in a static site.

Submission has three states, all driven by `setStatus()`: pending (button disabled, "Sending..."), `.is-ok` (form cleared, white left border), `.is-error` (red left border, tells the visitor to call). Network failures and non-2xx responses both land in the error path and log to the console.

## Local business context

**JCA is a mobile service with no fixed shop.** Installers travel to the customer and work in the customer's own garage, anywhere in the metro Atlanta area. The site was originally written around a physical shop and swept clean of that language later, so treat any of the following as a regression: "our shop", "indoor/closed bay", "in house", "installed in house", "visit the shop", "shop hours", "drop-off", or a street address in the footer. The footer advertises a **service area**, not a location, which is also what Google Business Profile expects from a service-area business.

JCA serves a single metro area, so the site is a local-business page, not a national storefront:

- Keep the Atlanta, GA service area, hours, and phone number consistent everywhere they appear.
- Give each service (wrap, tint, chrome delete) enough room to stand on its own rather than collapsing them into one generic "services" blurb.
- Vehicle work is visual — the layout should assume real before/after photography, and images need `alt` text and sensible sizing/compression since there is no build pipeline to optimize them.
