import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/client";
import { POSTS_QUERY, SERVICES_QUERY } from "@/sanity/lib/queries";
import type { Post, Service } from "@/sanity/lib/types";

const SITE_URL = "https://dog-smart-website.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts] = await Promise.all([
    sanityFetch<Service[]>(SERVICES_QUERY, {}, []),
    sanityFetch<Post[]>(POSTS_QUERY, {}, []),
  ]);

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/online-learning",
    "/blog",
    "/faq",
    "/contact",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: new Date(),
  }));

  const postRoutes = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
  }));

  return [...staticRoutes, ...serviceRoutes, ...postRoutes];
}
