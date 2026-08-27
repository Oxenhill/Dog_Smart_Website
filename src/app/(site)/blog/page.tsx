import Image from "next/image";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/client";
import { POSTS_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import type { Post, SiteSettings } from "@/sanity/lib/types";

export const metadata = {
  title: "Blog | Dog Smart Training & Behaviour",
  description: "Notes, guidance and stories from Dog Smart Training & Behaviour.",
};

const FALLBACK_SETTINGS: Pick<SiteSettings, "blogPageEyebrow" | "blogPageHeading"> = {
  blogPageEyebrow: "Blog",
  blogPageHeading: "Notes from the family",
};

export default async function BlogIndexPage() {
  const [settings, posts] = await Promise.all([
    sanityFetch<Pick<SiteSettings, "blogPageEyebrow" | "blogPageHeading">>(SITE_SETTINGS_QUERY, {}, FALLBACK_SETTINGS),
    sanityFetch<Post[]>(POSTS_QUERY, {}, []),
  ]);

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">{settings.blogPageEyebrow || "Blog"}</p>
          <h1>{settings.blogPageHeading || "Notes from the family"}</h1>
          <p className="lede">Thoughts on training, behaviour, and life with the Dog Smart dogs.</p>
        </div>
      </section>

      <div className="container">
        {posts.length > 0 ? (
          <div className="course-grid">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} className="course-card" key={post._id}>
                {post.coverImage?.asset?.url ? (
                  <div className="photo-frame" style={{ aspectRatio: "16/10", borderRadius: "var(--radius-lg)" }}>
                    <Image src={post.coverImage.asset.url} alt="" fill sizes="(max-width: 760px) 100vw, 340px" />
                  </div>
                ) : null}
                <h3>{post.title}</h3>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>New posts are on their way</h2>
            <p>
              We&rsquo;re just getting the blog started — check back soon, or follow us on{" "}
              <a href="https://www.facebook.com/dogsmarttraining">Facebook</a> and{" "}
              <a href="https://www.instagram.com/dogsmart_training_behaviour">Instagram</a> in the meantime.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
