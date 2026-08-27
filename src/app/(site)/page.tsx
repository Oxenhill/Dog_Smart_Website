import { sanityFetch } from "@/sanity/lib/client";
import {
  FAMILY_DOGS_QUERY,
  FEATURED_TESTIMONIALS_QUERY,
  SERVICES_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import type { FamilyDog, Service, SiteSettings, Testimonial } from "@/sanity/lib/types";

// Mirrors the siteSettings schema's initialValue defaults — see
// src/app/(site)/layout.tsx for the matching note.
const FALLBACK_SETTINGS: SiteSettings = {
  businessName: "Dog Smart Training & Behaviour",
  familyTagline: "We're Not Just a Training Service — We're a Family",
  heroEyebrow: "Sevenoaks, Kent",
  heroHeadline: "Real-life training. Honest behaviour support.",
  heroSubhead:
    "A community built on understanding dogs — not just managing them. Force-free training and behaviour support for you and your dog, from puppyhood onwards.",
  familyEyebrow: "The Dog Smart Family",
  familyHeadline: "We're Not Just a Training Service — We're a Family",
  familyBody:
    "Founded by Oliver and Becs in 2018, Dog Smart is built around force-free, understanding-led training — for every dog and every family that joins us.",
  ctaEyebrow: "Get Started",
  ctaHeadline: "Let's get to know your dog.",
  ctaBody: "Book a class, a consult, or just ask us a question — we reply to every enquiry personally.",
  phone: null,
  email: "trainers@dogsmarttrainingbehaviour.co.uk",
  classBookingUrl: null,
  behaviourBookingUrl: null,
  onlineLearningUrl: "/online-learning",
};

// Real service copy, drawn from the live Wix site's content audit
// (content-audit/README.md) and the current service line-up. Order
// matches the confirmed site map. Replace via Sanity Studio → Services.
const FALLBACK_SERVICES: Service[] = [
  {
    _id: "fallback-puppy",
    title: "Puppy Support",
    slug: "puppy-support",
    summary:
      "Force-free foundations for the first year — socialisation, confidence and the basics that set you both up for life together.",
    icon: "puppy",
  },
  {
    _id: "fallback-general",
    title: "General Dog Training",
    slug: "general-dog-training",
    summary: "Manners and reliable everyday behaviour, taught around Sevenoaks and the Kent villages nearby.",
    icon: "training",
  },
  {
    _id: "fallback-gundog",
    title: "Gundog Training",
    slug: "gundog-training",
    summary: "From first retrieves to steady fieldwork groundwork — force-free training for high-drive gundog breeds.",
    icon: "gundog",
  },
  {
    _id: "fallback-behaviour",
    title: "Behaviour Support",
    slug: "behaviour-support",
    summary: "One-to-one support for reactivity, fear and anxiety-based behaviour, delivered with patience — never punishment.",
    icon: "behaviour",
  },
];

// Real dogs, real facts — from the content audit's /family pull. Where a
// dog's specific story hasn't been written up yet, the line stays warm
// but general rather than inventing detail. Replace via Studio → Family
// Dogs once photos and full bios are ready.
const FALLBACK_DOGS: FamilyDog[] = [
  { _id: "fallback-lenny", name: "Lenny", bio: "One of the resident test-and-approval team — every class gets the Lenny nose of approval." },
  { _id: "fallback-percy", name: "Percy", breed: "Working Cocker Spaniel", bio: "Our resident have-a-go hero — first in the water, first over the fence." },
  { _id: "fallback-willow", name: "Willow", bio: "Keeps the household honest and the training bar high." },
  { _id: "fallback-teak", name: "Teak", breed: "HPR", bio: "Our tracking and scent-work specialist — proof that training adapts around whatever health story a dog brings with it." },
  { _id: "fallback-harry", name: "Harry", breed: "English Springer", bio: "Had his first shooting season in 2022/23, putting his gundog training to work in the field." },
  { _id: "fallback-ron", name: "Ron", bio: "A rescue who came to us working through separation-related anxiety and arousal — living proof force-free behaviour work gets real results." },
  { _id: "fallback-jim", name: "Jim", breed: "Collie", bio: "Becs' agility partner, and the family's resident overachiever." },
];

const DOG_AVATAR_COLORS = ["var(--brand-700)", "var(--moss)", "var(--brand)", "var(--brand-800)"];

const PROMISE_ITEMS = [
  "No aversive tools, ever",
  "Reward-based, relationship-first methods",
  "Accountable to recognised training bodies",
  "VSA (Victoria Stilwell Academy) graduate-led",
];

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ServiceIcon({ icon }: { icon?: string | null }) {
  if (icon === "behaviour") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  if (icon === "gundog") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  // "puppy" and "training" (and any unrecognised keyword) share a paw mark.
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
      <circle cx="12" cy="16" r="5" />
      <circle cx="5" cy="8" r="2.3" />
      <circle cx="10.5" cy="4.3" r="2.3" />
      <circle cx="15.5" cy="4.3" r="2.3" />
      <circle cx="19" cy="8" r="2.3" />
    </svg>
  );
}

export default async function HomePage() {
  const [settings, services, dogs, testimonials] = await Promise.all([
    sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    sanityFetch<Service[]>(SERVICES_QUERY, {}, FALLBACK_SERVICES),
    sanityFetch<FamilyDog[]>(FAMILY_DOGS_QUERY, {}, FALLBACK_DOGS),
    sanityFetch<Testimonial[]>(FEATURED_TESTIMONIALS_QUERY, {}, []),
  ]);

  const bookHref = settings.classBookingUrl || "#book";
  const coursesHref = settings.onlineLearningUrl || "/online-learning";
  const behaviourHref = settings.behaviourBookingUrl || "#book";
  const emailHref = settings.email ? `mailto:${settings.email}` : "#book";

  return (
    <>
      {/* Hero — trust chips first (this is the top design priority: read
          as credible and caring before anything else), then the real,
          already-established tagline copy. */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="badge-row">
            <span className="badge">
              <CheckIcon />
              Force-free, always
            </span>
            <span className="badge">
              <CheckIcon />
              Est. 2018
            </span>
            <span className="badge">
              <CheckIcon />
              VSA graduate-led
            </span>
          </div>
          <span className="eyebrow">{settings.heroEyebrow}</span>
          <h1>{settings.heroHeadline}</h1>
          <p className="lead">{settings.heroSubhead}</p>
          <div className="actions">
            <a href={bookHref} className="pill solid lg">
              Book Now
            </a>
            <a href={coursesHref} className="pill lg">
              Explore Online Courses
            </a>
          </div>
        </div>
      </section>

      {/* Force-free promise — the core trust signal, made explicit
          rather than left implied. */}
      <section className="promise-band">
        <div className="container promise-grid">
          <div className="promise-copy">
            <span className="eyebrow">Our Promise</span>
            <h2>Force-free. Every dog, every time.</h2>
            <p>
              No choke chains, no shock collars, no intimidation — just reward-based methods that build trust
              instead of fear. It’s not a marketing line, it’s the only way we train.
            </p>
          </div>
          <ul className="promise-list">
            {PROMISE_ITEMS.map((item) => (
              <li key={item}>
                <span className="icon-check">
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services */}
      <section className="list-section container">
        <div className="list-head">
          <span className="eyebrow">What We Offer</span>
          <h2>Support for every stage</h2>
          <p>From puppy foundations to specialist gundog and behaviour work — all built around the same force-free promise.</p>
        </div>
        <div className="card-grid">
          {services.map((service) => (
            <div className="card" key={service._id}>
              <span className="card-icon">
                <ServiceIcon icon={service.icon} />
              </span>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* "The Dog Smart family" — the established brand language,
          anchoring the story rather than appearing once as a slogan. */}
      <section className="story-band container">
        <div className="story-grid">
          <div className="story-panel" aria-hidden="true" />
          <div className="story-copy">
            <span className="eyebrow">{settings.familyEyebrow}</span>
            <p className="family-quote">{settings.familyHeadline}</p>
            <p>
              Dog Smart started in 2018, when Oliver — a Victoria Stilwell Academy graduate — and his wife Becs
              decided Sevenoaks needed a different kind of dog training: force-free, relationship-first, and
              genuinely personal.
            </p>
            <p>
              Becs works in the veterinary profession and runs our Agility sessions; between the two of them (and a
              very full house of family dogs) Dog Smart has grown into exactly what the name says — a family, not
              just a training service.
            </p>
            <ul className="credentials">
              <li>VSA (Victoria Stilwell Academy) Graduate</li>
              <li>Force-Free &amp; Reward-Based</li>
              <li>Est. 2018 · Sevenoaks, Kent</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Meet the family (dogs) */}
      <section className="family-strip">
        <div className="container">
          <div className="list-head">
            <span className="eyebrow">Meet the Family</span>
            <h2>Seven dogs, one very full house</h2>
            <p>Every class, consult and course is shaped by living with these seven — real dogs, real quirks, real training in action.</p>
          </div>
          <div className="dog-grid">
            {dogs.map((dog, index) => (
              <div className="dog-card" key={dog._id}>
                <span
                  className="dog-avatar"
                  style={{ background: DOG_AVATAR_COLORS[index % DOG_AVATAR_COLORS.length] }}
                  aria-hidden="true"
                >
                  {dog.name.charAt(0)}
                </span>
                <h3>{dog.name}</h3>
                {dog.breed ? <span className="breed">{dog.breed}</span> : null}
                <p>{dog.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real testimonials once they're in Sanity (Studio → Reviews,
          "Feature on homepage" switched on); until then, verifiable
          facts stand in rather than invented quotes. */}
      {testimonials.length > 0 ? (
        <section className="trust-band container">
          <div className="list-head">
            <span className="eyebrow">What Families Say</span>
            <h2>Real words from real Dog Smart families</h2>
          </div>
          <div className="quote-grid">
            {testimonials.map((testimonial) => (
              <div className="quote-card" key={testimonial._id}>
                <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
                <cite>
                  — {testimonial.clientName || "Dog Smart client"}
                  {testimonial.dogName ? ` & ${testimonial.dogName}` : ""}
                  {testimonial.location ? `, ${testimonial.location}` : ""}
                </cite>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="trust-band container">
          <div className="stats-grid">
            <div className="stat">
              <strong>2018</strong>
              <span>Founded in Sevenoaks</span>
            </div>
            <div className="stat">
              <strong>100%</strong>
              <span>Force-free methods</span>
            </div>
            <div className="stat">
              <strong>7</strong>
              <span>Family dogs (and counting)</span>
            </div>
            <div className="stat">
              <strong>VSA</strong>
              <span>Graduate-led training</span>
            </div>
          </div>
        </section>
      )}

      {/* CTA / booking band */}
      <section className="cta-band on-dark" id="book">
        <div className="container">
          <span className="eyebrow">{settings.ctaEyebrow}</span>
          <h2>{settings.ctaHeadline}</h2>
          <p>{settings.ctaBody}</p>
          <div className="actions">
            <a href={bookHref} className="pill solid on-dark lg">
              Book a Class
            </a>
            <a href={emailHref} className="pill on-dark lg">
              Ask a Question
            </a>
          </div>
          <a href={behaviourHref} className="secondary-link">
            Behaviour concern? Book a one-to-one consult instead
          </a>
        </div>
      </section>
    </>
  );
}
