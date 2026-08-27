import Image from "next/image";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import {
  APPROVED_TESTIMONIALS_QUERY,
  SERVICES_QUERY,
  SERVICE_BY_SLUG_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import type { PortableTextBlock, Service, ServiceDetail, SiteSettings, Testimonial } from "@/sanity/lib/types";
import PortableTextBody from "@/components/site/PortableTextBody";

function toBlocks(paragraphs: string[]): PortableTextBlock[] {
  return paragraphs.map((text) => ({ _type: "block", style: "normal", children: [{ _type: "span", text }] }));
}

// Real copy pulled directly from the live Wix pages (27 Aug 2026) — used
// only if this service hasn't been seeded in Sanity yet, or Sanity is
// briefly unreachable. Kept short here; the full version lives in Sanity
// (see .seed/seed-content.cjs) where Oliver can edit it.
const FALLBACK_BODY: Record<string, string[]> = {
  "puppy-support": [
    "Confident dogs start with confident beginnings — and that's where I come in. Puppyhood is where everything starts: what your dog learns and feels now lays the foundation for their future.",
    "These aren't just “puppy lessons.” They're a space for exploring your puppy's unique temperament, supporting emotional growth and safe curiosity, calming your worries with a clear plan, and answering real questions based on your home, family and routine.",
    "All sessions are 1:1, held at a secure outdoor venue near Sevenoaks, suitable from 8 weeks old once your vet clears them for the outdoors. No in-home consults — puppies do better in neutral, calm spaces. Some owners book support before the puppy even comes home.",
  ],
  "general-dog-training": [
    "Reward-based, real-world training to help your dog become calm, responsive, and easy to live with. General training is for adolescent and adult dogs who need help with recall and off-lead reliability, loose lead walking, focus and calmness outdoors, manners around people, dogs or distractions, and settling in everyday situations.",
    "“I don't run group classes for general training. Every dog is different — and every owner is too.” One-to-one training lets us focus entirely on your dog and goals, move at your pace rather than the group's, and adjust techniques to suit how you learn.",
    "Most sessions take place at a secure outdoor venue near Sevenoaks, where we can safely work off-lead and introduce appropriate distractions. On-walk training consults are also available on Wednesdays for real-world challenges like recall in the woods or lead frustration locally.",
  ],
  "gundog-training": [
    "Gundog training taps into the natural instincts of hunting breeds — spaniels, retrievers and HPRs — whether they work in the field or not. It channels energy, builds focus, and strengthens communication between dog and handler, bringing balance and better everyday behaviour even for pet gundogs.",
    "At Dog Smart, gundog training isn't an add-on — it's our specialist focus. We use positive, force-free methods tailored to your gundog's personality and breed traits, whether they're a working dog needing structure or a high-energy pet needing guidance.",
    "We offer small group classes (max 4 dogs for beginners), 1:1 gundog training sessions, and Sunday Intermediate Groups (up to 8 dogs) separated by breed — Spaniel Group, Retriever Group, with HPRs joining either depending on style and fit. For dogs who find groups too intense, 1:1 support blends foundational gundog skills with behaviour awareness.",
  ],
  "behaviour-support": [
    "Calm, professional support for dogs experiencing reactivity, overwhelm and poor emotional regulation — dog-to-dog reactivity, nervous or overwhelmed dogs, over-arousal, and dogs struggling to settle, cope or regulate. We use the Harmony Framework, looking at environment, physical comfort, predictability, choice, learning expectations, social dynamics and lifestyle.",
    "We use reward-based methods only — no prong collars, choke chains or electronic collars, ever. This service doesn't cover people-directed aggression or separation-related distress; for those we're happy to point you toward a trusted specialist.",
    "Clients get access to the Harmony Companion App to track progress, view plans and monitor changes over time between sessions.",
  ],
};

const SERVICE_TITLES: Record<string, string> = {
  "puppy-support": "Puppy Support",
  "general-dog-training": "General Dog Training",
  "gundog-training": "Gundog Training",
  "behaviour-support": "Behaviour Support",
};

async function getServices(): Promise<Service[]> {
  return sanityFetch<Service[]>(SERVICES_QUERY, {}, []);
}

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await sanityFetch<ServiceDetail | null>(SERVICE_BY_SLUG_QUERY, { slug }, null);
  if (!service) return {};
  return {
    title: `${service.title} | Dog Smart Training & Behaviour`,
    description: service.summary || undefined,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [service, settings, testimonials] = await Promise.all([
    sanityFetch<ServiceDetail | null>(SERVICE_BY_SLUG_QUERY, { slug }, null),
    sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY, {}, {} as SiteSettings),
    sanityFetch<Testimonial[]>(APPROVED_TESTIMONIALS_QUERY, {}, []),
  ]);

  if (!service && !FALLBACK_BODY[slug]) {
    notFound();
  }

  const title = service?.title || SERVICE_TITLES[slug] || slug;
  const summary = service?.summary;
  const body = service?.body && service.body.length > 0 ? service.body : toBlocks(FALLBACK_BODY[slug] || []);
  const heroUrl = service?.heroImage?.asset?.url;
  const pricingTiers = (service?.pricingTiers || []).filter((t) => t?.label || t?.price);
  const showPricing = settings.showPricingSitewide !== false && pricingTiers.length > 0;

  const bookHref =
    service?.bookingLinkOverride ||
    (slug === "behaviour-support" ? settings.behaviourBookingUrl : settings.classBookingUrl) ||
    settings.classBookingUrl ||
    "/contact";

  const related = testimonials.filter((t) => t.relatedService?.slug === slug);

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">Services</p>
          <h1>{title}</h1>
          {summary ? <p className="lede">{summary}</p> : null}
        </div>
      </section>

      {heroUrl ? (
        <section className="container">
          <div className="service-hero photo-frame">
            <Image src={heroUrl} alt="" fill sizes="100vw" priority />
          </div>
        </section>
      ) : null}

      <div className="container">
        <div className="service-detail-layout">
          <div>
            <PortableTextBody value={body} />

            {related.length > 0 ? (
              <div className="quote-grid" style={{ marginBlockStart: "32px" }}>
                {related.map((t) => (
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
          </div>

          <aside className="service-sidebar">
            <div className="sidebar-card">
              <h3>Ready to get started?</h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem", marginBottom: "4px" }}>
                Every enquiry gets a personal reply from Oliver or Becs.
              </p>
              <a href={bookHref} className="pill solid">
                {slug === "behaviour-support" ? "Book a Consult" : "Book Now"}
              </a>
              <a href="/contact" className="pill">
                Ask a Question First
              </a>
            </div>

            {slug === "gundog-training" ? (
              <div className="sidebar-card">
                <h3>Home of Our Gundog Work</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem", marginBottom: "4px" }}>
                  Our gundog training, groups and online gundog course live on our sister site, Briarrose Gundogs.
                </p>
                <a
                  href={settings.briarroseGundogsUrl || "https://briarrosegundogs.co.uk"}
                  className="pill"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Briarrose Gundogs
                </a>
              </div>
            ) : null}

            {showPricing ? (
              <div className="sidebar-card">
                <h3>Pricing</h3>
                {pricingTiers.map((tier, i) => (
                  <div className="pricing-tier" key={i}>
                    <div>
                      <div className="label">{tier.label}</div>
                      {tier.description ? (
                        <div style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>{tier.description}</div>
                      ) : null}
                    </div>
                    <div className="price">
                      {tier.price}
                      {tier.period ? <div className="period">{tier.period}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sidebar-card">
                <h3>Pricing</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>
                  Get in touch and we&rsquo;ll talk through what&rsquo;s right for your dog.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      <section className="cta-band on-dark" id="book">
        <div className="container-narrow">
          <p className="eyebrow">Start Your Journey</p>
          <h2>Let&rsquo;s talk about {title.toLowerCase()}</h2>
          <div className="actions">
            <a href={bookHref} className="pill solid on-dark lg">
              {slug === "behaviour-support" ? "Book a Consult" : "Book Now"}
            </a>
            <a href="/services" className="pill on-dark lg">
              See All Services
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
