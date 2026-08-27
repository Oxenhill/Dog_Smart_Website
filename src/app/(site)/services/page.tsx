import Image from "next/image";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/client";
import { SERVICES_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { Service, SiteSettings } from "@/sanity/lib/types";

export const metadata = {
  title: "Services | Dog Smart Training & Behaviour",
  description:
    "Puppy Support, General Dog Training, Gundog Training and Behaviour Support — force-free 1:1 training in Sevenoaks, Kent.",
};

const FALLBACK_SETTINGS: Pick<SiteSettings, "servicesPageEyebrow" | "servicesPageHeading" | "servicesPageBody"> = {
  servicesPageEyebrow: "Services",
  servicesPageHeading: "Training built around your dog",
  servicesPageBody:
    "Every dog and every owner is different — that's why we don't run one-size-fits-all classes. Choose the path that fits how you're feeling right now.",
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

export default async function ServicesIndexPage() {
  const [settings, services] = await Promise.all([
    sanityFetch<Pick<SiteSettings, "servicesPageEyebrow" | "servicesPageHeading" | "servicesPageBody">>(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    sanityFetch<Service[]>(SERVICES_QUERY, {}, FALLBACK_SERVICES),
  ]);

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">{settings.servicesPageEyebrow || "Services"}</p>
          <h1>{settings.servicesPageHeading || "Training built around your dog"}</h1>
          {settings.servicesPageBody ? <p className="lede">{settings.servicesPageBody}</p> : null}
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="service-rows">
            {services.map((service) => (
              <Link href={`/services/${service.slug}`} className="service-row-link" key={service._id}>
                <article className="service-row">
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
                    <h3>{service.title}</h3>
                    {service.summary ? <p>{service.summary}</p> : null}
                    <span className="pill">Learn more about {service.title}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band on-dark" id="book">
        <div className="container-narrow">
          <p className="eyebrow">Not Sure Which Fits?</p>
          <h2>Tell us about your dog</h2>
          <p>Every enquiry gets a personal reply — we'll point you toward the right service.</p>
          <div className="actions">
            <a href="/contact" className="pill solid on-dark lg">
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
