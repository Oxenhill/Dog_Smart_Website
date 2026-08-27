export default function HomePage() {
  return (
    <>
      <section className="hero container">
        <span className="eyebrow">Force-free training &amp; behaviour, Kent</span>
        <h1>
          Real-life training, honest behaviour support, and a community
          built on understanding dogs — not just managing them
        </h1>
        <p className="lead">
          Group classes, one-to-one behaviour consults, and self-paced
          online courses — grounded in force-free, relationship-first
          methods.
        </p>
        <div className="actions">
          <a href="#book" className="pill solid">
            Book Now
          </a>
          <a href="/courses" className="pill">
            Explore Online Courses
          </a>
        </div>
      </section>

      <section className="list-section container">
        <div className="list-head">
          <span className="eyebrow">What we offer</span>
          <h2>Support for every stage</h2>
          <p>From puppy foundations to specialist gundog and behaviour work.</p>
        </div>
        <div className="card-grid">
          <div className="card">
            <h3>Puppy Support</h3>
            <p>Early guidance on socialisation and foundational skills.</p>
          </div>
          <div className="card">
            <h3>General Training</h3>
            <p>Manners and reliable everyday behaviour.</p>
          </div>
          <div className="card">
            <h3>Gundog Support</h3>
            <p>Specialist training for high-drive breeds.</p>
          </div>
          <div className="card">
            <h3>Behaviour Support</h3>
            <p>Addressing reactivity, regulation, and fear-based issues.</p>
          </div>
        </div>
      </section>

      <section className="quote-band">
        <div className="container">
          <blockquote>
            &ldquo;Placeholder testimonial — real quotes come from the
            content model once it&apos;s wired up.&rdquo;
          </blockquote>
          <cite>— Placeholder, Dog Smart client</cite>
        </div>
      </section>
    </>
  );
}
