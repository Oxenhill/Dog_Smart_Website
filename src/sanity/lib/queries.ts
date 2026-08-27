// GROQ queries shared between the homepage and site chrome. Kept as
// plain strings (not the `groq` template tag) to avoid adding an import
// that isn't otherwise needed.

const IMAGE_PROJECTION = `{
  asset->{ url, metadata{ dimensions } },
  hotspot
}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  businessName,
  familyTagline,
  heroEyebrow,
  heroHeadline,
  heroSubhead,
  heroImage ${IMAGE_PROJECTION},
  familyEyebrow,
  familyHeadline,
  familyBody,
  ctaEyebrow,
  ctaHeadline,
  ctaBody,
  phone,
  email,
  addressLocality,
  addressRegion,
  coverageArea,
  classBookingUrl,
  behaviourBookingUrl,
  onlineLearningUrl,
  socialLinks,
  footerText,
  showPricingSitewide
}`;

export const SERVICES_QUERY = `*[_type == "service"] | order(order asc){
  _id,
  title,
  "slug": slug.current,
  summary,
  icon,
  heroImage ${IMAGE_PROJECTION}
}`;

export const FAMILY_DOGS_QUERY = `*[_type == "dog"] | order(order asc){
  _id,
  name,
  breed,
  bio,
  legacy,
  photo ${IMAGE_PROJECTION}
}`;

export const FEATURED_TESTIMONIALS_QUERY = `*[_type == "testimonial" && approved == true && featured == true] | order(order asc){
  _id,
  quote,
  clientName,
  location,
  dogName,
  source,
  relatedService->{ _id, title, "slug": slug.current }
}`;

export const FAMILY_PROFILE_QUERY = `*[_type == "familyProfile"][0]{
  introHeadline,
  story,
  trainingPromise,
  oliverName,
  oliverBio,
  oliverCredentials,
  oliverPhoto ${IMAGE_PROJECTION},
  becsName,
  becsBio,
  becsPhoto ${IMAGE_PROJECTION}
}`;
