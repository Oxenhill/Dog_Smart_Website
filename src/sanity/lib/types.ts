// Minimal projections of the Sanity schema types used by the homepage
// and shared site chrome. Deliberately partial — only the fields the
// front end actually queries — rather than mirroring the full schema.

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SanityImageRef {
  asset: {
    url: string;
    metadata?: { dimensions?: { width: number; height: number } } | null;
  };
  hotspot?: { x: number; y: number } | null;
}

export interface SiteSettings {
  businessName: string;
  familyTagline: string;

  heroEyebrow?: string | null;
  heroHeadline?: string | null;
  heroSubhead?: string | null;
  heroImage?: SanityImageRef | null;

  familyEyebrow?: string | null;
  familyHeadline?: string | null;
  familyBody?: string | null;

  ctaEyebrow?: string | null;
  ctaHeadline?: string | null;
  ctaBody?: string | null;

  phone?: string | null;
  email?: string | null;
  addressLocality?: string | null;
  addressRegion?: string | null;
  coverageArea?: string | null;

  classBookingUrl?: string | null;
  behaviourBookingUrl?: string | null;
  onlineLearningUrl?: string | null;
  briarroseGundogsUrl?: string | null;

  socialLinks?: SocialLink[] | null;
  footerText?: string | null;
  showPricingSitewide?: boolean;

  aboutPageEyebrow?: string | null;
  aboutPageHeading?: string | null;
  aboutPageBody?: string | null;
  servicesPageEyebrow?: string | null;
  servicesPageHeading?: string | null;
  servicesPageBody?: string | null;
  coursesPageEyebrow?: string | null;
  coursesPageHeading?: string | null;
  coursesPageBody?: string | null;
  galleryPageEyebrow?: string | null;
  galleryPageHeading?: string | null;
  reviewsPageEyebrow?: string | null;
  reviewsPageHeading?: string | null;
  blogPageEyebrow?: string | null;
  blogPageHeading?: string | null;
  faqPageEyebrow?: string | null;
  faqPageHeading?: string | null;
  contactPageEyebrow?: string | null;
  contactPageHeading?: string | null;
  enquiryNotificationEmail?: string | null;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  summary?: string | null;
  icon?: string | null;
  heroImage?: SanityImageRef | null;
}

export interface FamilyDog {
  _id: string;
  name: string;
  breed?: string | null;
  bio?: string | null;
  photo?: SanityImageRef | null;
  legacy?: boolean;
}

export interface Testimonial {
  _id: string;
  quote: string;
  clientName?: string | null;
  location?: string | null;
  dogName?: string | null;
  source?: string | null;
  relatedService?: { _id: string; title: string; slug: string } | null;
}

export interface PortableTextBlock {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: { _type?: string; text?: string; marks?: string[] }[];
  markDefs?: { _key: string; _type: string; href?: string }[];
  asset?: { url: string; metadata?: { dimensions?: { width: number; height: number } } | null } | null;
}

export interface FamilyProfile {
  introHeadline?: string | null;
  story?: PortableTextBlock[] | null;
  trainingPromise?: PortableTextBlock[] | null;
  oliverName?: string | null;
  oliverBio?: PortableTextBlock[] | null;
  oliverCredentials?: string[] | null;
  oliverPhoto?: SanityImageRef | null;
  becsName?: string | null;
  becsBio?: PortableTextBlock[] | null;
  becsPhoto?: SanityImageRef | null;
  additionalTeam?: TeamMember[] | null;
}

export interface TeamMember {
  name: string;
  role?: string | null;
  bio?: PortableTextBlock[] | null;
  photo?: SanityImageRef | null;
}

export interface PricingTier {
  label?: string | null;
  price?: string | null;
  period?: string | null;
  description?: string | null;
}

export interface ServiceDetail extends Service {
  body?: PortableTextBlock[] | null;
  pricingTiers?: PricingTier[] | null;
  bookingLinkOverride?: string | null;
}

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category?: string | null;
  order?: number;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: SanityImageRef | null;
  body?: PortableTextBlock[] | null;
  authorName?: string | null;
  publishedAt?: string | null;
  tags?: string[] | null;
}

export interface CourseSummary {
  _id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: SanityImageRef | null;
  price?: string | null;
  entitlementKey?: string | null;
  moduleCount?: number;
  lessonCount?: number;
}

export interface CourseLessonVideoBlock {
  _key: string;
  _type: "videoBlock";
  title?: string | null;
  provider?: "cloudflare_stream" | "external_url" | null;
  cloudflareVideoId?: string | null;
  externalUrl?: string | null;
  posterImage?: SanityImageRef | null;
}

export interface CourseLessonTextBlock {
  _key: string;
  _type: "textBlock";
  content?: PortableTextBlock[] | null;
}

export interface CourseLessonPdfBlock {
  _key: string;
  _type: "pdfBlock";
  title?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
}

export interface CourseLessonYoutubeBlock {
  _key: string;
  _type: "youtubeEmbedBlock";
  title?: string | null;
  url?: string | null;
}

export interface CourseLessonImageSlideBlock {
  _key: string;
  _type: "imageSlideBlock";
  caption?: string | null;
  image?: SanityImageRef | null;
}

export type CourseLessonContentBlock =
  | CourseLessonVideoBlock
  | CourseLessonTextBlock
  | CourseLessonPdfBlock
  | CourseLessonYoutubeBlock
  | CourseLessonImageSlideBlock;

export interface CourseLesson {
  _key: string;
  title: string;
  durationMinutes?: number | null;
  isFreePreview?: boolean;
  content?: CourseLessonContentBlock[] | null;
}

export interface CourseModule {
  _key: string;
  title: string;
  summary?: string | null;
  lessons?: CourseLesson[] | null;
}

export interface CourseDetail extends CourseSummary {
  description?: PortableTextBlock[] | null;
  modules?: CourseModule[] | null;
}
