import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@/sanity/lib/types";

// Shared rich-text renderer for service/post/course body copy. Keeps
// long-form content in the same voice as the rest of the site (Fraunces
// headings, real photos in .photo-frame) instead of the library's plain
// default styling.
interface BodyImageValue {
  alt?: string;
  asset?: { url: string; metadata?: { dimensions?: { width: number; height: number } } | null } | null;
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: BodyImageValue }) => {
      const url = value?.asset?.url;
      if (!url) return null;
      return (
        <div className="body-photo photo-frame">
          <Image
            src={url}
            alt={value.alt || ""}
            width={value.asset?.metadata?.dimensions?.width || 1200}
            height={value.asset?.metadata?.dimensions?.height || 800}
            sizes="(max-width: 760px) 100vw, 700px"
          />
        </div>
      );
    },
  },
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="body-list">{children}</ul>,
    number: ({ children }) => <ol className="body-list">{children}</ol>,
  },
  marks: {
    // @portabletext/react's built-in defaults already handle strong/em/
    // underline — only the custom `link` annotation (added for the Course
    // Builder's rich text editor) needs a component here.
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href;
      if (!href) return <>{children}</>;
      const isExternal = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          style={{ color: "inherit", textDecoration: "underline" }}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export default function PortableTextBody({
  value,
  className,
}: {
  value?: PortableTextBlock[] | null;
  className?: string;
}) {
  if (!value || value.length === 0) return null;
  return (
    <div className={`prose${className ? ` ${className}` : ""}`}>
      <PortableText value={value as never} components={components} />
    </div>
  );
}
