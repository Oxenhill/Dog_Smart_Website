import { sanityFetch } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";

export const metadata = {
  title: "Contact | Dog Smart Training & Behaviour",
  description: "Get in touch with Dog Smart Training & Behaviour — Sevenoaks, Tunbridge Wells and the surrounding Kent villages.",
};

const FALLBACK_SETTINGS: SiteSettings = {
  businessName: "Dog Smart Training & Behaviour",
  familyTagline: "We're Not Just a Training Service — We're a Family",
  phone: "07725672320",
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
  contactPageEyebrow: "Get in Touch",
  contactPageHeading: "Let's talk about your dog",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const [settings, params] = await Promise.all([
    sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    searchParams,
  ]);

  const sent = params?.sent === "1";
  const error = params?.error === "1";

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">{settings.contactPageEyebrow || "Get in Touch"}</p>
          <h1>{settings.contactPageHeading || "Let's talk about your dog"}</h1>
          <p className="lede">
            Whatever stage you&rsquo;re at, we reply to every enquiry personally — usually within a day or two.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="contact-layout">
          <div className="contact-info">
            <h2>Reach us directly</h2>

            {settings.phone ? (
              <div className="contact-detail">
                <span className="label">Phone</span>
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`}>{settings.phone}</a>
              </div>
            ) : null}

            {settings.email ? (
              <div className="contact-detail">
                <span className="label">Email</span>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </div>
            ) : null}

            {settings.coverageArea ? (
              <div className="contact-detail">
                <span className="label">Where we train</span>
                <p>{settings.coverageArea}</p>
              </div>
            ) : null}

            {settings.socialLinks && settings.socialLinks.length > 0 ? (
              <div className="contact-detail">
                <span className="label">Follow along</span>
                <p>
                  {settings.socialLinks.map((link, i) => (
                    <span key={link.platform}>
                      {i > 0 ? " · " : ""}
                      <a href={link.url}>{link.platform}</a>
                    </span>
                  ))}
                </p>
              </div>
            ) : null}

            <div className="contact-detail">
              <span className="label">Ready to book?</span>
              <div className="contact-booking-links">
                <a href={settings.classBookingUrl || "#"} className="pill">
                  Book a Class or Session
                </a>
                <a href={settings.behaviourBookingUrl || settings.classBookingUrl || "#"} className="pill">
                  Book a Behaviour Consult
                </a>
              </div>
            </div>
          </div>

          <form className="contact-form" action="/api/enquiry" method="POST" noValidate>
            <h2>Send us a message</h2>
            <p>Tell us a bit about you and your dog — we&rsquo;ll get back to you personally.</p>

            {sent ? (
              <p className="form-notice success" role="status">
                Thanks — your message is on its way to us. We&rsquo;ll reply personally soon.
              </p>
            ) : null}
            {error ? (
              <p className="form-notice" style={{ background: "#fce8e6", color: "#8c1d18" }} role="alert">
                Something went wrong sending that — please try again, or email us directly at{" "}
                {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : "trainers@dogsmarttrainingbehaviour.co.uk"}.
              </p>
            ) : null}

            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="visually-hidden">Your details</legend>

              {/* Honeypot — hidden from real visitors, left in the tab order for bots */}
              <div className="visually-hidden" aria-hidden="true">
                <label htmlFor="website">Leave this field empty</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="field">
                <label htmlFor="name">Your name</label>
                <input type="text" id="name" name="name" autoComplete="name" required aria-describedby="name-error" />
                <span id="name-error" className="error-msg">
                  Please tell us your name.
                </span>
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" autoComplete="email" required aria-describedby="email-error" />
                <span id="email-error" className="error-msg">
                  Please enter a valid email address.
                </span>
              </div>

              <div className="field">
                <label htmlFor="phone">
                  Phone <span className="optional">(optional)</span>
                </label>
                <input type="tel" id="phone" name="phone" autoComplete="tel" />
              </div>

              <div className="field">
                <label htmlFor="topic">What&rsquo;s this about?</label>
                <select id="topic" name="topic" defaultValue="">
                  <option value="" disabled>
                    Choose one…
                  </option>
                  <option>Puppy Support</option>
                  <option>General Dog Training</option>
                  <option>Gundog Training</option>
                  <option>Behaviour Support</option>
                  <option>Online Learning</option>
                  <option>Something else</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="message">Tell us about your dog</label>
                <textarea id="message" name="message" required aria-describedby="message-error" />
                <span id="message-error" className="error-msg">
                  Please add a short message so we know how to help.
                </span>
              </div>
            </fieldset>

            <button type="submit" className="pill solid lg">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
