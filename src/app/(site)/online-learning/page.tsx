import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/client";
import { COURSES_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { CourseSummary, SiteSettings } from "@/sanity/lib/types";

export const metadata = {
  title: "Online Learning | Dog Smart Training & Behaviour",
  description: "Online course material from Dog Smart Training & Behaviour, included as part of our training packages.",
};

const FALLBACK_SETTINGS: Pick<
  SiteSettings,
  "coursesPageEyebrow" | "coursesPageHeading" | "coursesPageBody" | "onlineLearningUrl" | "briarroseGundogsUrl"
> = {
  coursesPageEyebrow: "Online Learning",
  coursesPageHeading: "Learning that comes with your package",
  coursesPageBody:
    "Our online courses aren't sold on their own — they're included as supporting material for clients on one of our training packages. If you already have a package with us, your course access lives on our current learning platform below.",
  onlineLearningUrl: "https://online.dogsmarttrainingbehaviour.co.uk",
  briarroseGundogsUrl: "https://briarrosegundogs.co.uk",
};

// Real course names, confirmed directly by Oliver — support material for
// clients on a training package, not sold as standalone products. Never
// invent curriculum detail beyond what's confirmed.
const KNOWN_COURSES = [
  { title: "Pup Smart", note: "Puppy foundations, mostly video with supporting written material — included with Puppy Support packages." },
  { title: "Life Skills", note: "Everyday manners and real-life training for adolescent and adult dogs — included with General Dog Training packages." },
  { title: "Behaviour Toolbox", note: "Support for reactivity, over-arousal and regulation — included with Behaviour Support packages." },
];

export default async function OnlineLearningPage() {
  const [settings, courses] = await Promise.all([
    sanityFetch<
      Pick<SiteSettings, "coursesPageEyebrow" | "coursesPageHeading" | "coursesPageBody" | "onlineLearningUrl" | "briarroseGundogsUrl">
    >(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    sanityFetch<CourseSummary[]>(COURSES_QUERY, {}, []),
  ]);

  const externalUrl =
    settings.onlineLearningUrl && settings.onlineLearningUrl.startsWith("http")
      ? settings.onlineLearningUrl
      : "https://online.dogsmarttrainingbehaviour.co.uk";
  const briarroseUrl = settings.briarroseGundogsUrl || "https://briarrosegundogs.co.uk";

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">{settings.coursesPageEyebrow || "Online Learning"}</p>
          <h1>{settings.coursesPageHeading || "Learning that comes with your package"}</h1>
          <p className="lede">{settings.coursesPageBody}</p>
        </div>
      </section>

      <div className="container">
        {courses.length > 0 ? (
          <div className="course-grid">
            {courses.map((course) => (
              <Link href={`/online-learning/${course.slug}`} className="course-card" key={course._id}>
                {course.coverImage?.asset?.url ? (
                  <div className="photo-frame" style={{ aspectRatio: "16/10", borderRadius: "var(--radius-lg)" }}>
                    <Image src={course.coverImage.asset.url} alt="" fill sizes="(max-width: 760px) 100vw, 340px" />
                  </div>
                ) : null}
                <h3>{course.title}</h3>
                {course.summary ? <p>{course.summary}</p> : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="course-grid">
            {KNOWN_COURSES.map((course) => (
              <div className="course-card" key={course.title}>
                <span className="status-tag">Included with a package</span>
                <h3>{course.title}</h3>
                <p>{course.note}</p>
              </div>
            ))}

            <a href={briarroseUrl} className="course-card">
              <span className="status-tag">Hosted at Briarrose Gundogs</span>
              <h3>Gundog Course</h3>
              <p>
                Our online gundog course has moved to Briarrose Gundogs — our sister site and the home of all our
                gundog training and support.
              </p>
            </a>
          </div>
        )}

        <div className="empty-state">
          <h2>Already have a package with us?</h2>
          <p>Your course material lives on our current learning platform — log in there to pick up where you left off.</p>
          <a href={externalUrl} className="pill solid">
            Go to the Learning Platform
          </a>
        </div>
      </div>

      <section className="cta-band on-dark" id="book">
        <div className="container-narrow">
          <p className="eyebrow">Not on a Package Yet?</p>
          <h2>Book a real-life training session first</h2>
          <p>Course material comes as part of a training package — get started with a session and we'll take it from there.</p>
          <div className="actions">
            <a href="/services" className="pill solid on-dark lg">
              Explore Services
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
