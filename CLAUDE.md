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
- Fonts: Fredoka (display, rounded — matches the logo's rounded dog
  mark) + Inter (UI/body). First-pass choice, not yet confirmed with
  Oliver — check before treating as final.

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

Still to build: the actual page templates that query this content
(currently only the placeholder homepage exists), the online-learning
UI, the AI chatbot, and populating real content into the Studio
(everything above is schema, not data yet — Oliver or Claude still
needs to fill it in via /studio).

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
