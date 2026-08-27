import Link from "next/link";
import Image from "next/image";
import MobileNav from "@/components/site/MobileNav";
import { sanityFetch } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/online-learning", label: "Online Learning" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

// Mirrors the initialValue defaults on the siteSettings schema, so the
// site looks and reads the same whether or not the singleton has been
// created in Studio yet. Once Oliver fills it in, live content takes over.
const FALLBACK_SETTINGS: SiteSettings = {
  businessName: "Dog Smart Training & Behaviour",
  familyTagline: "We're Not Just a Training Service — We're a Family",
  phone: null,
  email: "trainers@dogsmarttrainingbehaviour.co.uk",
  addressLocality: "Sevenoaks",
  addressRegion: "Kent",
  coverageArea: "Covering Sevenoaks and the surrounding Kent villages",
  classBookingUrl: null,
  behaviourBookingUrl: null,
  onlineLearningUrl: "/online-learning",
  socialLinks: [],
  footerText: "© Dog Smart Training & Behaviour",
};

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await sanityFetch<SiteSettings>(
    SITE_SETTINGS_QUERY,
    {},
    FALLBACK_SETTINGS
  );

  const bookHref = settings.classBookingUrl || "#book";
  const year = new Date().getFullYear();

  return (
    <>
      <a href="#content" className="skip-link">
        Skip to main content
      </a>

      <header className="site-nav">
        <div className="container nav-row">
          <Link href="/" className="wordmark">
            <Image
              src="/brand/dog-smart-logo.svg"
              alt="Dog Smart Training & Behaviour — home"
              width={220}
              height={74}
              priority
            />
          </Link>

          <nav className="side" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <a href={bookHref} className="pill solid nav-book">
              Book Now
            </a>
            <MobileNav links={NAV_LINKS} bookHref={bookHref} />
          </div>
        </div>
      </header>

      <main id="content" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="foot-top">
            <div className="foot-brand">
              <span className="wordmark-foot">Dog Smart</span>
              <p>{settings.familyTagline}</p>
            </div>

            <div className="foot-cols">
              <h4>Dog Smart</h4>
              <Link href="/about">About</Link>
              <Link href="/services">Services</Link>
              <Link href="/online-learning">Online Learning</Link>
            </div>

            <div className="foot-cols">
              <h4>Resources</h4>
              <Link href="/blog">Blog</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/contact">Contact</Link>
            </div>

            <div className="foot-contact">
              <h4>Get in touch</h4>
              {settings.phone ? (
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`}>{settings.phone}</a>
              ) : null}
              {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : null}
              {settings.coverageArea ? <p>{settings.coverageArea}</p> : null}
              {settings.socialLinks && settings.socialLinks.length > 0 ? (
                <p>
                  {settings.socialLinks.map((link, index) => (
                    <span key={link.platform}>
                      {index > 0 ? " · " : ""}
                      <a href={link.url}>{link.platform}</a>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          </div>

          <div className="foot-bottom">
            <span>
              {settings.footerText || `© Dog Smart Training & Behaviour`} — {year}
            </span>
            <span>Force-free, always.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
