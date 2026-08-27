import Image from "next/image";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import { COURSE_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import type { CourseDetail } from "@/sanity/lib/types";
import PortableTextBody from "@/components/site/PortableTextBody";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await sanityFetch<CourseDetail | null>(COURSE_BY_SLUG_QUERY, { slug }, null);
  if (!course) return {};
  return { title: `${course.title} | Dog Smart Online Learning`, description: course.summary || undefined };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await sanityFetch<CourseDetail | null>(COURSE_BY_SLUG_QUERY, { slug }, null);
  if (!course) notFound();

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">Online Learning</p>
          <h1>{course.title}</h1>
          {course.summary ? <p className="lede">{course.summary}</p> : null}
        </div>
      </section>

      {course.coverImage?.asset?.url ? (
        <section className="container">
          <div className="service-hero photo-frame">
            <Image src={course.coverImage.asset.url} alt="" fill sizes="100vw" priority />
          </div>
        </section>
      ) : null}

      <div className="container">
        <div className="service-detail-layout">
          <div>
            <PortableTextBody value={course.description} />

            {course.modules && course.modules.length > 0 ? (
              <div className="faq-groups" style={{ paddingBlockEnd: 0 }}>
                <div className="faq-category">
                  <h2>Course content</h2>
                  {course.modules.map((mod) => (
                    <details className="disclosure" key={mod._key}>
                      <summary>
                        {mod.title}
                        {mod.lessons ? ` (${mod.lessons.length} lesson${mod.lessons.length === 1 ? "" : "s"})` : ""}
                      </summary>
                      <div className="answer">
                        {mod.summary ? <p>{mod.summary}</p> : null}
                        <ul className="body-list">
                          {(mod.lessons || []).map((lesson) => (
                            <li key={lesson._key}>
                              {lesson.title}
                              {lesson.durationMinutes ? ` — ${lesson.durationMinutes} min` : ""}
                              {lesson.isFreePreview ? " (free preview)" : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="service-sidebar">
            <div className="sidebar-card">
              <h3>{course.price || "Get in touch for pricing"}</h3>
              <a href="/contact" className="pill solid">
                Ask About This Course
              </a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
