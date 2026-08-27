import Image from "next/image";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import { POST_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import type { Post } from "@/sanity/lib/types";
import PortableTextBody from "@/components/site/PortableTextBody";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await sanityFetch<Post | null>(POST_BY_SLUG_QUERY, { slug }, null);
  if (!post) return {};
  return { title: `${post.title} | Dog Smart Blog`, description: post.excerpt || undefined };
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await sanityFetch<Post | null>(POST_BY_SLUG_QUERY, { slug }, null);
  if (!post) notFound();

  return (
    <>
      <section className="page-header">
        <div className="container-narrow">
          <p className="eyebrow">
            {post.authorName || "Dog Smart Training & Behaviour"}
            {formatDate(post.publishedAt) ? ` · ${formatDate(post.publishedAt)}` : ""}
          </p>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="lede">{post.excerpt}</p> : null}
        </div>
      </section>

      {post.coverImage?.asset?.url ? (
        <section className="container">
          <div className="service-hero photo-frame">
            <Image src={post.coverImage.asset.url} alt="" fill sizes="100vw" priority />
          </div>
        </section>
      ) : null}

      <div className="container-narrow" style={{ paddingBlock: "48px 88px" }}>
        <PortableTextBody value={post.body} />
      </div>
    </>
  );
}
