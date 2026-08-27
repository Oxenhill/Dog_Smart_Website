import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/client";
import {
  FAMILY_DOGS_QUERY,
  FAMILY_PROFILE_QUERY,
  FEATURED_TESTIMONIALS_QUERY,
  SERVICES_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import type {
  FamilyDog,
  FamilyProfile,
  PortableTextBlock,
  Service,
  SiteSettings,
  Testimonial,
} from "@/sanity/lib/types";
import { dataset, projectId } from "@/sanity/env";

// Real accreditation marks (Victoria Stilwell Academy, Illis ABC, Family Dog
// Mediator, UK Dog Training Charter) pulled from the live Wix site and
// uploaded into Sanity's asset store — referenced by asset id here since
// there's no dedicated schema field for them yet. If Oliver wants to swap
// or add to these later they can move into a proper siteSettings field;
// for now this keeps them real rather than generic.
const CREDENTIAL_LOGOS = [
  { id: "0f8645b6492d5873894e85fb36b19bcb3f1ff236-300x300.jpg", alt: "Victoria Stilwell Academy" },
  { id: "c89caa8e5c5750a814d438e1ec87de1e24c556d7-400x88.png", alt: "Illis ABC" },
  { id: "966f64c0341275321da95b10785c7d479f12a5fb-300x300.jpg", alt: "Family Dog Mediator" },
  { id: "42a2b21cf7a5ec16d24dbadafafb12010e5765c4-282x300.jpg", alt: "UK Dog Training Charter" },
];

function credentialUrl(assetFile: string) {
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetFile}`;
}

// Mirrors the real content now seeded into Sanity (see .seed/seed-content.cjs)
// so the page still reads correctly, with the same real facts, even if
// Sanity is briefly unreachable. Images have no local fallback — if
// Sanity can't be reached there's simply no photo, handled gracefully
// below, since these photos are meant to live in and be managed from
// the CMS, not hardcoded into the repo.
const FALLBACK_SETTINGS: SiteSettings = {
  businessName: "Dog Smart Training & Behaviour",
  familyTagline: "We're Not Just a Training Service — We're a Family",
  heroEyebrow: "Sevenoaks, Kent",
  heroHeadline: "Every Dog is Different. So Is Every Owner.",
  heroSubhead:
    "Real-life training, honest behaviour support, and a community built on understanding dogs — not just managing them.",
  familyEyebrow: "The Dog Smart Family",
  familyHeadline: "We're Not Just a Training Service — We're a Family",
  familyBody:
    "At Dog Smart, we don't just work with dogs — we walk alongside their humans too. Our clients become part of a growing community, one that values honesty, patience, and the belief that learning should feel safe.",
  ctaEyebrow: "Not Sure Where to Start?",
  ctaHeadline: "Book a 1-on-1 Training Session Today",
  ctaBody: "Take your time. Read, explore, ask questions. When you're ready — we're here.",
  email: "trainers@dogsmarttrainingbehaviour.co.uk",
  addressLocality: "Sevenoaks",
  addressRegion: "Kent",
  coverageArea: "Serving Sevenoaks, Tunbridge Wells and the surrounding Kent villages",
  classBookingUrl: "https://booking.dogsmarttrainingbehaviour.co.uk/",
  behaviourBookingUrl: null,
  onlineLearningUrl: "https://online.dogsmarttrainingbehaviour.co.uk",
  socialLinks: [
    { platform: "Facebook", url: "https://www.facebook.com/dogsmarttraining" },
    { platform: "Instagram", url: "https://www.instagram.com/dogsmart_training_behaviour" },
  ],
  footerText: "© Dog Smart Training & Behaviour",
  showPricingSitewide: true,
};

const FALLBACK_SERVICES: Service[] = [
  {
    _id: "puppy-support",
    title: "Puppy Support",
    slug: "puppy-support",
    icon: "puppy",
    summary:
      "Expert 1:1 guidance through those early weeks — socialisation, sleep, settling, and building good habits from day one.",
  },
  {
    _id: "general-dog-training",
    title: "General Dog Training",
    slug: "general-dog-training",
    icon: "general",
    summary:
      "From real-life manners to reliable recall — calm, force-free training that builds behaviour that actually lasts.",
  },
  {
    _id: "gundog-training",
    title: "Gundog Training",
    slug: "gundog-training",
    icon: "gundog",
    summary:
      "Specialist gundog work in Sevenoaks for working and high-drive pet breeds alike, force-free from first retrieve onward.",
  },
  {
    _id: "behaviour-support",
    title: "Behaviour Support",
    slug: "behaviour-support",
    icon: "behaviour",
    summary:
      "Calm, professional support for dogs struggling with reactivity, regulation or fear — helping you both move forward.",
  },
];

const SERVICE_INTROS: Record<string, string> = {
  "puppy-support": "Maybe you've just brought home a puppy and want to start things right.",
  "general-dog-training": "From real-life manners to specialist gundog skills, we'll help you build behaviour that lasts.",
  "gundog-training": "Maybe you're looking for guidance with a lively, high-drive gundog.",
  "behaviour-support": "Maybe you're feeling overwhelmed by your dog's behaviour and don't know what to do next.",
};

const FALLBACK_DOGS: FamilyDog[] = [
  { _id: "briar", name: "Briar", bio: "Our first dog, and the one who taught us more than any other — with us for fourteen wonderful years before we said goodbye in August 2022. His legacy shaped everything we do, right down to the name behind Briarrose Gundogs.", legacy: true },
  { _id: "sam", name: "Sam", bio: "Our first Many Tears rescue, and the dog who taught us what it takes to support a reactive dog. We lost him to cancer in 2017, aged just ten.", legacy: true },
  { _id: "percy", name: "Percy", breed: "Cavalier / Cocker / Pug cross", bio: "Our have-a-go hero — gundog work, agility, scent work and tracking, always giving 150%.", legacy: false },
  { _id: "teak", name: "Teak", breed: "HPR", bio: "Our hunter — mountains of energy, drawn to man-trailing and scent work.", legacy: false },
  { _id: "harry", name: "Harry", breed: "English Springer Spaniel", bio: "Mad as a box of frogs and born to work — completed his first shooting season in 2022/23.", legacy: false },
  { _id: "jimmy", name: "Jimmy", breed: "Collie", bio: "Our first collie, joined the family in July 2022 and is progressing nicely through his agility foundations.", legacy: false },
  { _id: "ron", name: "Ron", breed: "English Springer Spaniel", bio: "Came to us as an emergency foster — still building confidence, with a wonderful nose on him.", legacy: false },
  { _id: "willow", name: "Willow", breed: "Spaniel", bio: "The only lady of the household — Crufts Novice Agility Cup runner-up, 2017.", legacy: false },
  { _id: "lenny", name: "Lenny", legacy: false },
];

const FALLBACK_FAMILY_PROFILE: FamilyProfile = {
  oliverName: "Oliver",
  oliverBio: [
    { _type: "block", children: [{ text: "VSA graduate (2018), with further study through Illis ABC, Suzanne Clothier's CARAT programme, and Family Dog Mediator training under Kim Brophey. Gundogs — especially Vizslas — are his particular passion." }] },
  ],
  oliverCredentials: [
    "VSA-Certified Dog Trainer (VSA-CDT)",
    "Illis ABC — Animal Emotion & Advanced Animal Training",
    "CARAT graduate — Suzanne Clothier",
    "Family Dog Mediator — Kim Brophey",
  ],
  becsName: "Becs",
  becsBio: [
    { _type: "block", children: [{ text: "A Registered Veterinary Nurse since 2004 and now Practice Manager at Sandhole Veterinary Practice, Becs runs our Puppy School and Youth Club classes and trains Willow and Percy in agility." }] },
  ],
};

function blocksToParagraphs(blocks?: PortableTextBlock[] | null): string[] {
  if (!blocks) return [];
  return blocks
    .map((b) => (b.children || []).map((c) => c.text || "").join(""))
    .filter((text) => text.trim().length > 0);
}

export default async function HomePage() {
  const [settings, services, dogs, testimonials, familyProfile] = await Promise.all([
    sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    sanityFetch<Service[]>(SERVICES_QUERY, {}, FALLBACK_SERVICES),
    sanityFetch<FamilyDog[]>(FAMILY_DOGS_QUERY, {}, FALLBACK_DOGS),
    sanityFetch<Testimonial[]>(FEATURED_TESTIMONIALS_QUERY, {}, []),
    sanityFetch<FamilyProfile>(FAMILY_PROFILE_QUERY, {}, FALLBACK_FAMILY_PROFILE),
  ]);

  const bookHref = settings.classBookingUrl || "#book";
  const coursesHref = settings.onlineLearningUrl || "/online-learning";
  const behaviourHref = settings.behaviourBookingUrl || bookHref;

  const currentDogs = dogs.filter((d) => !d.legacy);
  const legacyDogs = dogs.filter((d) => d.legacy);

  const testimonialsByService = new Map<string, Testimonial[]>();
  const generalTestimonials: Testimonial[] = [];
  for (const t of testimonials) {
    if (t.relatedService?.slug) {
      const list = testimonialsByService.get(t.relatedService.slug) || [];
      list.push(t);
      testimonialsByService.set(t.relatedService.slug, list);
    } else {
      generalTestimonials.push(t);
    }
  }

  const oliverParagraphs = blocksToParagraphs(familyProfile.oliverBio);
  const becsParagraphs = blocksToParagraphs(familyProfile.becsBio);
  const trainingPromiseParagraphs = blocksToParagraphs(familyProfile.trainingPromise);
  const promiseQuote =
    trainingPromiseParagraphs[0] ||
    "We are committed to training animals without the use of fear or intimidation, using modern, force-free scientific principles — every dog, every time.";

  return (
    <>
      {/* ---------------------------------------------------------------
          Hero — real photo, real established copy, no badge row.
          --------------------------------------------------------------- */}
      <section className="hero on-dark">
        <div className="hero-media">
          {settings.heroImage?.asset?.url ? (
            <Image
              src={settings.heroImage.asset.url}
              alt="Oliver and Becs with the Dog Smart family of dogs"
              fill
              priority
              sizes="100vw"
            />
          ) : null}
        </div>
        <div className="container">
          <div className="hero-inner">
            {settings.heroEyebrow ? <p className="eyebrow">{settings.heroEyebrow}</p> : null}
            <h1>{settings.heroHeadline}</h1>
            {settings.heroSubhead ? <p className="lead">{settings.heroSubhead}</p> : null}
            <div className="actions">
              <a href={bookHref} className="pill solid lg">
                Book Now
              </a>
              <a href={coursesHref} className="pill on-dark lg">
                Explore Online Courses
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Lede — "every dog is different", in Oliver's own real voice.
          --------------------------------------------------------------- */}
      <section className="lede-section">
        <div className="container-narrow">
          <p className="lede-lead">People come to us for different reasons — and that&rsquo;s exactly how it should be.</p>
          <p>
            Maybe you&rsquo;re looking for guidance with a lively gundog. Maybe you&rsquo;ve just brought home a puppy
            and want to start things right. Maybe you&rsquo;re feeling overwhelmed by your dog&rsquo;s behaviour and
            don&rsquo;t know what to do next.
          </p>
          <p>Wherever you&rsquo;re at — we&rsquo;ll meet you there.</p>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Services — alternating photo/text rows, real photos per
          service, a contextual real testimonial where one exists.
          --------------------------------------------------------------- */}
      <section className="services-section">
        <div className="container">
          <div className="list-head">
            <p className="eyebrow">Start Your Journey</p>
            <h2>Choose the path that fits how you&rsquo;re feeling</h2>
          </div>

          <div className="service-rows">
            {services.map((service) => {
              const matched = testimonialsByService.get(service.slug)?.[0];
              return (
                <article className="service-row" key={service._id}>
                  <div className="service-photo photo-frame">
                    {service.heroImage?.asset?.url ? (
                      <Image
                        src={service.heroImage.asset.url}
                        alt=""
                        fill
                        sizes="(max-width: 760px) 100vw, 40vw"
                      />
                    ) : null}
                  </div>
                  <div className="service-copy">
                    <p className="eyebrow">{service.title}</p>
                    <h3>{SERVICE_INTROS[service.slug] || service.title}</h3>
                    {service.summary ? <p>{service.summary}</p> : null}
                    {matched ? (
                      <div className="service-quote">
                        <div>
                          <p>&ldquo;{matched.quote}&rdquo;</p>
                          <cite>
                            — {matched.clientName || "A Dog Smart client"}
                            {matched.dogName ? ` & ${matched.dogName}` : ""}
                          </cite>
                        </div>
                      </div>
                    ) : null}
                    <div className="actions">
                      <a href={`/services/${service.slug}`} className="pill solid">
                        Explore {service.title}
                      </a>
                      <a href={service.slug === "behaviour-support" ? behaviourHref : bookHref} className="pill">
                        {service.slug === "behaviour-support" ? "Book a Consult" : "Book Now"}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Force-free promise — real pull-quote + real accreditation.
          --------------------------------------------------------------- */}
      <section className="promise-section">
        <div className="container-narrow">
          <p className="eyebrow">Our Promise</p>
          <blockquote>&ldquo;{promiseQuote}&rdquo;</blockquote>
          <div className="credential-strip">
            {CREDENTIAL_LOGOS.map((logo) => (
              <img key={logo.id} src={credentialUrl(logo.id)} alt={logo.alt} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Founding story — real Oliver + Becs photos and bios.
          --------------------------------------------------------------- */}
      <section className="story-section">
        <div className="container">
          <div className="story-head">
            <p className="eyebrow">Since 2018</p>
            <h2>{familyProfile.introHeadline || settings.familyHeadline}</h2>
          </div>
          <div className="founders">
            <div className="founder">
              <div className="founder-photo photo-frame">
                {familyProfile.oliverPhoto?.asset?.url ? (
                  <Image src={familyProfile.oliverPhoto.asset.url} alt={familyProfile.oliverName || "Oliver"} fill sizes="(max-width: 760px) 100vw, 25vw" />
                ) : null}
              </div>
              <h3>{familyProfile.oliverName || "Oliver"}</h3>
              {oliverParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {familyProfile.oliverCredentials && familyProfile.oliverCredentials.length > 0 ? (
                <ul className="founder-credentials">
                  {familyProfile.oliverCredentials.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="founder">
              <div className="founder-photo photo-frame">
                {familyProfile.becsPhoto?.asset?.url ? (
                  <Image src={familyProfile.becsPhoto.asset.url} alt={familyProfile.becsName || "Becs"} fill sizes="(max-width: 760px) 100vw, 25vw" />
                ) : null}
              </div>
              <h3>{familyProfile.becsName || "Becs"}</h3>
              {becsParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Meet the family — real dog photos; Briar & Sam kept separate
          as a quiet in-memoriam block.
          --------------------------------------------------------------- */}
      <section className="family-section">
        <div className="container">
          <div className="family-head">
            <p className="eyebrow">{settings.familyEyebrow || "The Dog Smart Family"}</p>
            <h2>Meet the Family</h2>
          </div>
          <div className="dog-grid">
            {currentDogs.map((dog) => (
              <div className="dog-card" key={dog._id}>
                {dog.photo?.asset?.url ? (
                  <div className="dog-photo photo-frame">
                    <Image src={dog.photo.asset.url} alt={dog.name} fill sizes="(max-width: 760px) 45vw, 200px" />
                  </div>
                ) : (
                  <div className="dog-photo is-empty">
                    <span>Photo coming soon</span>
                  </div>
                )}
                <h3>{dog.name}</h3>
                {dog.breed ? <p>{dog.breed}</p> : null}
              </div>
            ))}
          </div>

          {legacyDogs.length > 0 ? (
            <div className="legacy-block">
              <div className="legacy-head">
                <p className="eyebrow">Always Part of the Family</p>
                <p>The dogs who came before, and who shaped everything Dog Smart is today.</p>
              </div>
              <div className="legacy-grid">
                {legacyDogs.map((dog) => (
                  <div className="legacy-card" key={dog._id}>
                    {dog.photo?.asset?.url ? (
                      <div className="legacy-photo photo-frame">
                        <Image src={dog.photo.asset.url} alt={dog.name} fill sizes="88px" />
                      </div>
                    ) : (
                      <div className="legacy-photo dog-photo is-empty" />
                    )}
                    <div>
                      <h4>{dog.name}</h4>
                      {dog.bio ? <p>{dog.bio}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Reviews — real featured testimonials if any exist yet, plus
          honest links to actual Google/Facebook reviews. Never
          fabricated.
          --------------------------------------------------------------- */}
      <section className="reviews-section">
        <div className="container-narrow">
          <p className="eyebrow" style={{ textAlign: "center", display: "block" }}>
            What Clients Say
          </p>
          {generalTestimonials.length > 0 ? (
            <div className="quote-grid">
              {generalTestimonials.map((t) => (
                <div className="quote-card" key={t._id}>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <cite>
                    — {t.clientName || "A Dog Smart client"}
                    {t.dogName ? ` & ${t.dogName}` : ""}
                  </cite>
                </div>
              ))}
            </div>
          ) : null}
          <div className="review-links">
            <p>Read real, verified reviews from clients across Sevenoaks, Tunbridge Wells and Kent:</p>
            <a href="https://g.co/kgs/yW62gJx" className="pill">
              Google Reviews
            </a>
            <a href="https://www.facebook.com/dogsmarttraining" className="pill">
              Facebook Reviews
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          CTA band
          --------------------------------------------------------------- */}
      <section className="cta-band on-dark" id="book">
        <div className="container-narrow">
          <p className="eyebrow">{settings.ctaEyebrow}</p>
          <h2>{settings.ctaHeadline}</h2>
          {settings.ctaBody ? <p>{settings.ctaBody}</p> : null}
          <div className="actions">
            <a href={bookHref} className="pill solid on-dark lg">
              Book a Class
            </a>
            <a
              href={settings.email ? `mailto:${settings.email}` : bookHref}
              className="pill on-dark lg"
            >
              Ask a Question
            </a>
          </div>
          <a href={behaviourHref} className="secondary-link">
            Struggling with a behaviour concern? Book a one-to-one consult instead
          </a>
        </div>
      </section>
    </>
  );
}
