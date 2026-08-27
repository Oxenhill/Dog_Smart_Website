// GROQ queries shared between the homepage and site chrome. Kept as
// plain strings (not the `groq` template tag) to avoid adding an import
// that isn't otherwise needed.

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  businessName,
  familyTagline,
  heroEyebrow,
  heroHeadline,
  heroSubhead,
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
  icon
}`;

export const FAMILY_DOGS_QUERY = `*[_type == "dog"] | order(order asc){
  _id,
  name,
  breed,
  bio
}`;

export const FEATURED_TESTIMONIALS_QUERY = `*[_type == "testimonial" && approved == true && featured == true] | order(order asc){
  _id,
  quote,
  clientName,
  location,
  dogName
}`;
