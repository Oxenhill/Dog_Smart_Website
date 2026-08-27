@AGENTS.md

# Dog Smart Training & Behaviour — site

Sibling project to `Briarrose_Gundogs` (same owner, same stack, same
Sanity/Vercel account). Built to replace the current Wix site
(dogsmarttrainingbehaviour.co.uk) and, alongside it, the three
non-gundog courses currently on Teachable (Pup Smart, Life Skills,
Behaviour Toolbox). See the Briarrose repo for the proven pattern this
one is deliberately copying: Next.js App Router + Sanity CMS +
Tailwind v4 + Vercel, CMS-editable content, per-page SEO/GEO
(structured data, sitemap, robots.txt, /llms.txt).

Full plan, phases, and cost rationale live in Notion:
"Dog Smart & Briarrose: Off Teachable & Wix".

## Brand

- Primary colour is a vivid orange (~`#F2730E`) taken from the logo —
  NOT blue, despite what the live Wix site's metadata suggested. Logo
  assets are in `public/brand/`.
- Tone: warm, conversational, reassuring — partnership over command.
  Different register from Briarrose's premium/country-estate feel;
  don't just reskin Briarrose's copy style.
- Tagline (from the current site): "Real-life training, honest
  behaviour support, and a community built on understanding dogs — not
  just managing them."
- Fonts: Fraunces (display, warm serif) + Inter (UI/body). Swapped
  from an earlier Fredoka choice after Oliver's feedback that the v1
  homepage looked "tacky" and "generic AI" — Fredoka's bubbly rounded
  shapes read as a SaaS-template default rather than professional. If
  changing the display font again, note Fraunces is a variable font:
  `weight` must stay `"variable"` in `next/font/google` (a fixed-weight
  array breaks the `axes` option with a Turbopack module-not-found
  error).

## Site structure (from current Wix nav — confirm before treating as final)

About Us · Services (puppy / general / gundog / behaviour) · Online
Learning (courses — new) · Blog · FAQ · Contact · Book Now (links out
to the external booking app, not a page on this site).

## External systems this site links to, not replaces

- **Booking**: "Dog Smart Training & Behaviour Booking App" (Base44) —
  handles class bookings for both Dog Smart and Briarrose.
- **Behaviour consults**: Harmony Companion V4 (Base44) — separate
  from the general booking app.
- Neither of these gets rebuilt here. This site should link out to
  them, the same way the current Wix site does.

## Planned AI chatbot

Site needs a chat widget that answers FAQs and actively routes
enquiries toward booking (general booking app for classes, Harmony V4
for behaviour consults). Not yet built — architecture still to be
decided (likely a Next.js API route calling the Claude API, grounded
in the site's own Sanity content, with a clear path to hand off to the
booking app rather than trying to book directly itself).

## Status

Sanity is fully wired up: project `778sos5n` (org `o8mabou8r`, same
org as Briarrose), dataset `production`, CORS origins for
localhost:3000/3333 and the production Vercel URL, an Editor write
token. Content model built: `siteSettings` + `familyProfile`
singletons, `service` (with a CMS pricing-visibility toggle), `course`
(modules/lessons — the built-in online learning area), `dog`,
`testimonial`, `faqItem`, `post`, `policy`, `galleryItem`. Studio is
live at `/studio` once deployed. Env vars are set in both `.env.local`
(gitignored) and Vercel (Production/Preview/Development).

Homepage is designed and built (see "Homepage design pass" and
"Homepage design pass v2" below). Sanity now holds real, non-fabricated
seed content — not an empty schema: 9 `dog` documents (6 current +
Briar/Sam as legacy + a minimal Lenny stub), the `familyProfile` and
`siteSettings` singletons, and 4 `service` documents, all with real
photos pulled from the live Wix site and uploaded as Sanity image
assets. Everything is still editable by Oliver via `/studio` — the
seed just means the homepage now shows real content instead of
fallback copy. Still to build: the other page templates (About,
Services, FAQ, Contact, Blog, Online Learning), the AI chatbot, and
the Facebook/Google review-sync + AI placement engine (see "Reviews"
below — deliberately deferred).

## Homepage design pass (27 Aug 2026)

Phase 1 scope: homepage only, redesigned to move it from an 8-year-old
Wix look to something that reads as 2026 while keeping the existing
"Dog Smart family" warmth. Applied the `modern-web-guidance` skill's
css-layout, accessibility, navigation-drawer and forms guides rather
than building ad hoc.

- **Colour**: kept the real logo orange as the core brand colour but
  replaced flat `--brand` usage on text/buttons with an accessible
  tiered scale (`--brand-600/700/800`) — the original single orange
  only hit ~2.9:1 contrast, failing WCAG AA. Every text/background
  pairing on the page was checked against AA (4.5:1 body, 3:1
  large/UI) before being finalised.
- **Mobile navigation**: the placeholder's mobile nav was fully
  broken (links just `display:none` below 900px with no replacement).
  Replaced with `src/components/site/MobileNav.tsx`, a proper
  navigation drawer: Popover API (`popover="manual"`) promoted to the
  top layer, a horizontal scroll-snap track driving open/close via
  native browser gestures, `IntersectionObserver` as the single
  source of truth for open/closed state, `inert` on `<main>` while
  open, and a scroll-driven backdrop fade gated behind
  `@supports (animation-timeline: scroll())` with a plain CSS/JS
  fallback for browsers without it.
- **Content**: homepage copy comes from `content-audit/README.md` and
  the `siteSettings` schema's own `initialValue`s — no lorem ipsum, no
  invented testimonials. Sections: hero with trust badges, force-free
  promise band, services grid (4 real services), founding story
  (Oliver + Becs, 2018), "Meet the Family" (all 7 real dogs, monogram
  avatars since no photos exist yet), a testimonials-or-trust-stats
  band (real Sanity testimonials if any are `featured && approved`,
  otherwise honest stats — never fabricated quotes), and a booking CTA
  band. All booking CTAs read from `siteSettings.classBookingUrl` /
  `behaviourBookingUrl` and fall back to `#book` until those are
  populated.
- **New files**: `src/sanity/lib/types.ts` and `queries.ts` (GROQ for
  siteSettings/services/dogs/testimonials, feeding the existing
  `sanityFetch` fallback helper), `src/components/site/MobileNav.tsx`.
  `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx` and
  `src/app/globals.css` were substantially rewritten, not patched.
- **Known-fixed bug**: the sticky header originally used a
  90%-opacity background relying on `backdrop-filter: blur()` to stay
  legible. When blur doesn't render, page content shows through
  sharply behind the header text — caught by loading the live deploy
  and visually scrolling it. Fixed by defaulting the header to a fully
  opaque background and only applying the translucent + blurred
  version inside `@supports (backdrop-filter: blur(1px))`.
- **Scope discipline**: About/Services/FAQ/Contact/Blog pages were
  deliberately *not* built in this pass, even though the nav links to
  them — Oliver asked for the homepage design language to be reviewed
  and approved before anything else gets built on top of it.

## Homepage design pass v2 (27 Aug 2026)

Oliver's review of the v1 pass: "tacky", "not enough class", "generic
AI", "doesn't have the personal touches my original site has". Root
cause, found by comparing the built page against the real live Wix
site: v1 was a recognisable AI-SaaS-landing-page template (badge-row
hero, icon-card grid, gradient blob, monogram avatars, bubbly Fredoka
font, testimonials genericised into a stats band) instead of an
adaptation of Dog Smart's real structure, voice and photography. Full
rewrite, not a patch:

- **Real photography, not icons/monograms**: every dog, founder and
  service section now uses a real photo pulled from the live Wix site
  (resized via Wix's own CDN convention —
  `/v1/fit/w_<W>,h_<H>,q_85/file.jpg` — to keep files small) and
  re-uploaded as a Sanity image asset. New `.photo-frame` CSS utility
  (`src/app/globals.css`) applies the translucent brand-colour
  gradient + `mix-blend-mode: multiply` overlay that's the visual
  signature of Oliver's own site, and unifies photos of varying
  quality into one cohesive look. All images are swappable by Oliver
  in the CMS — nothing is hardcoded.
- **Contextual testimonials**: `testimonial.relatedService` (new
  reference field, `src/sanity/schemaTypes/testimonial.ts`) lets a
  review be pinned under the specific service it's about instead of
  only appearing in a general reviews band. Oliver doesn't do this on
  the current site but wants it. No real testimonial data exists yet
  (never fabricate) — the UI slot is built and will show real reviews
  once Oliver adds them in the Studio.
- **Reviews pipeline — designed for it, build later**: Oliver's real
  reviews come from Google, Facebook and word-of-mouth (which he wants
  to phase out). `testimonial.source` already models the review's
  origin; an eventual Facebook/Google sync + AI engine that
  auto-classifies which service a review belongs to is explicitly
  future work — only the data model landed in this pass.
- **Legacy dogs**: new `dog.legacy` boolean
  (`src/sanity/schemaTypes/dog.ts`) distinguishes current family dogs
  from those who've passed away. Briar and Sam are seeded as legacy
  dogs (Briar is the namesake of "Briarrose") and rendered in a
  separate sepia-toned in-memoriam block. Lenny — real but not on the
  current Wix site — was confirmed directly with Oliver rather than
  guessed, and seeded as a minimal CMS stub for him to fill in.
- **Typography**: Fredoka → Fraunces (see Brand section above for the
  variable-font gotcha this swap ran into on deploy).
- **Structure**: hero is now a full-bleed real photo (no badge row);
  services are alternating photo/text rows instead of an icon-card
  grid; a founding-story section carries Oliver and Becs's real photos,
  bios and credentials; the accreditation strip uses the real
  Victoria Stilwell Academy / Illis ABC / Family Dog Mediator / UK Dog
  Training Charter logos (grayscale until hover) instead of generic
  badges.
- **Content seeding**: `.seed/upload-images.cjs` and
  `.seed/seed-content.cjs` (kept in the repo for reuse — read the
  write token from `.env.local`, never hardcode it) populated Sanity
  directly via its HTTP asset-upload and mutate APIs (the Sanity CLI
  isn't usable from the bridged device shell). Re-run these if content
  ever needs re-seeding from scratch.
- **Scope discipline unchanged**: still homepage-only. About/Services/
  FAQ/Contact/Blog pages were not built in this pass.

## Operational notes (27 Aug 2026)

- **Pushing**: local git has no credential helper configured in the
  bridged dev environment, so `git push` fails there. The GitKraken
  plugin's `git_push` (targeting the real `C:\dev\...` path, not the
  bridged mount path) works and is authenticated — use that to push.
  The GitHub Copilot MCP connection is read-only (`push_files` fails
  with 403) — don't rely on it for writes.
- **Vercel**: project `dog-smart-website` exists, linked to this repo,
  auto-deploys on push to `main`. First deploy succeeded.
- **Sanity**: CLI auth isn't visible from this bridged environment
  (bridge's `$HOME` isn't Oliver's real one), so the project, dataset,
  CORS origins and API token were all created by driving
  sanity.io/manage directly via browser automation instead — same
  approach used for Briarrose. Project `778sos5n`, org `o8mabou8r`.
  Schema lives in `src/sanity/schemaTypes/`, Studio route at
  `src/app/studio/[[...tool]]`. To add more content types or edit
  fields, edit those files then push — no CLI needed.
- **Pricing**: Oliver's call, not mine — he leans toward showing it
  (most other dog trainers hide theirs, he'd rather not). Build the
  pricing fields as CMS-editable with a visibility toggle, defaulted
  to visible, rather than hardcoding a decision either way.
- **Large file transfer to the device**: for files too big to pass
  through the device shell reliably in one go (e.g. `globals.css`),
  `SendUserFile` on the cloud-side copy followed by
  `device_commit_files` (with the real `C:\dev\...` Windows path as
  `devicePath`) is far more reliable than base64-chunking through
  `device_bash` heredocs — use it first for anything over a few KB.
