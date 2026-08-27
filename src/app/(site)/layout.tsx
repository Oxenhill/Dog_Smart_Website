import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/courses", label: "Online Learning" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="site-nav">
        <div className="container nav-row">
          <Link href="/" className="wordmark">
            <Image
              src="/brand/dog-smart-logo.svg"
              alt="Dog Smart Training & Behaviour"
              width={220}
              height={74}
              priority
            />
          </Link>
          <nav className="side" style={{ justifySelf: "center" }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <a href="#book" className="pill solid" style={{ justifySelf: "end" }}>
            Book Now
          </a>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="foot-cols">
            <div>
              <h4>Dog Smart</h4>
              <Link href="/about">About</Link>
              <Link href="/services">Services</Link>
              <Link href="/courses">Online Learning</Link>
            </div>
            <div>
              <h4>Resources</h4>
              <Link href="/blog">Blog</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div className="foot-bottom">
            © {new Date().getFullYear()} Dog Smart Training & Behaviour
          </div>
        </div>
      </footer>
    </>
  );
}
