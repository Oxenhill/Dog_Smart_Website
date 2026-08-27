// Minimal projections of the Sanity schema types used by the homepage
// and shared site chrome. Deliberately partial — only the fields the
// front end actually queries — rather than mirroring the full schema.

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  businessName: string;
  familyTagline: string;

  heroEyebrow?: string | null;
  heroHeadline?: string | null;
  heroSubhead?: string | null;

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
}

export interface FamilyDog {
  _id: string;
  name: string;
  breed?: string | null;
  bio?: string | null;
}

export interface Testimonial {
  _id: string;
  quote: string;
  clientName?: string | null;
  location?: string | null;
  dogName?: string | null;
}
