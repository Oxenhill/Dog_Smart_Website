import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/client";
import { COURSES_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { CourseSummary, SiteSettings } from "@/sanity/lib/types";

export const metadata = {
  title: "Online Learning | Dog Smart Training & Behaviour",
  description: "Self-paced online courses from Dog Smart Training & Behaviour, moving here from Teachable.",
};

const FALLBACK_SETTINGS: Pick<SiteSettings, "coursesPageEyebrow" | "coursesPageHeading" | "coursesPageBody" | "onlineLearningUrl"> = {
  coursesPageEyebrow: "Online Learning",
  coursesPageHeading: "Learn at your own pace",
  coursesPageBody: "Our self-paced courses are moving here from our current course platform — in the meantime, they're still available to buy right now.",
  onlineLearningUrl: "https://online.dogsmarttrainingbehaviour.co.uk",
};

// Real course names, confirmed directly by Oliver — currently hosted on
// Teachable and being migrated here module by module. Never invent
// curriculum detail beyond what's confirmed; these show as "moving here
// soon" until each course is actually built out in Sanity.
const KNOWN_COURSES = [
  { title: "Pup Smart", note: "Puppy foundations, mostly video with supporting written material." },
  { title: "Life Skills", note: "Everyday manners and real-life training for adolescent and adult dogs." },
  { title: "Behaviour Toolbox", note: "Support for reactivity, over-arousal and regulation." },
  { title: "Force Free Beginners Gundog Course", note: "Gundog fundamentals, force-free from the first retrieve." },
];

export default async function OnlineLearningPage() {
  const [settings, courses] = await Promise.all([
    sanityFetch<Pick<SiteSettings, "coursesPageEyebrow" | "coursesPageHeading" | "coursesPageBody" | "onlineLearningUrl">>(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    sanityFetch<CourseSummary[]>(COURSES_QUERY, {}, []),
  ]);

  const externalUrl = settings.onlineLearningUrl && settings.onlineLearningUrl.startsWith("http")
    ? settings.onlineLearningUrl
    : "https://online.dogsmarttrainingbehaviour.co.uk";

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">{settings.coursesPageEyebrow || "Online Learning"}</p>
          <h1>{settings.coursesPageHeading || "Learn at your own pace"}</h1>
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
                {course.price ? <p style={{ fontWeight: 600, color: "var(--brand-800)" }}>{course.price}</p> : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="course-grid">
            {KNOWN_COURSES.map((course) => (
              <div className="course-card" key={course.title}>
                <span className="status-tag">Moving here soon</span>
                <h3>{course.title}</h3>
                <p>{course.note}</p>
              </div>
            ))}
          </div>
        )}

        <div className="empty-state">
          <h2>Available right now</h2>
          <p>
            While we build our courses out here, all of them are still available to buy on our current course
            platform.
          </p>
          <a href={externalUrl} className="pill solid">
            Visit Our Course Platform
          </a>
        </div>
      </div>

      <section className="cta-band on-dark" id="book">
        <div className="container-narrow">
          <p className="eyebrow">Prefer 1:1 Support?</p>
          <h2>Book a real-life training session instead</h2>
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
