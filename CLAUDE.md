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

Homepage is designed and built (see "Homepage design pass" below).
Still to build: the other page templates (About, Services, FAQ,
Contact, Blog, Online Learning), the AI chatbot, and populating real
content into the Studio (schema exists but is mostly empty — Oliver or
Claude still needs to fill it in via /studio).

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
