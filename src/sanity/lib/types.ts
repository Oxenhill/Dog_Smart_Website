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

  socialLinks?: SocialLink[] | null;
  footerText?: string | null;
  showPricingSitewide?: boolean;
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
  style?: string;
  children?: { text?: string }[];
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
}
