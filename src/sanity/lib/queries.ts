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
  briarroseGundogsUrl,
  socialLinks,
  footerText,
  showPricingSitewide,
  aboutPageEyebrow,
  aboutPageHeading,
  aboutPageBody,
  servicesPageEyebrow,
  servicesPageHeading,
  servicesPageBody,
  coursesPageEyebrow,
  coursesPageHeading,
  coursesPageBody,
  galleryPageEyebrow,
  galleryPageHeading,
  reviewsPageEyebrow,
  reviewsPageHeading,
  blogPageEyebrow,
  blogPageHeading,
  faqPageEyebrow,
  faqPageHeading,
  contactPageEyebrow,
  contactPageHeading,
  enquiryNotificationEmail
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
  becsPhoto ${IMAGE_PROJECTION},
  additionalTeam[]{
    name,
    role,
    bio,
    photo ${IMAGE_PROJECTION}
  }
}`;

export const SERVICE_BY_SLUG_QUERY = `*[_type == "service" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  icon,
  heroImage ${IMAGE_PROJECTION},
  "body": body[]{
    ...,
    _type == "image" => { "asset": asset->{url, metadata{dimensions}} }
  },
  pricingTiers,
  bookingLinkOverride
}`;

export const APPROVED_TESTIMONIALS_QUERY = `*[_type == "testimonial" && approved == true] | order(order asc){
  _id,
  quote,
  clientName,
  location,
  dogName,
  source,
  relatedService->{ _id, title, "slug": slug.current }
}`;

export const FAQ_ITEMS_QUERY = `*[_type == "faqItem"] | order(order asc){
  _id,
  question,
  answer,
  category,
  order
}`;

export const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage ${IMAGE_PROJECTION},
  authorName,
  publishedAt,
  tags
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage ${IMAGE_PROJECTION},
  "body": body[]{
    ...,
    _type == "image" => { "asset": asset->{url, metadata{dimensions}} }
  },
  authorName,
  publishedAt,
  tags
}`;

export const COURSES_QUERY = `*[_type == "course" && published == true] | order(order asc){
  _id,
  title,
  "slug": slug.current,
  summary,
  coverImage ${IMAGE_PROJECTION},
  price,
  entitlementKey,
  "moduleCount": count(modules),
  "lessonCount": count(modules[].lessons[])
}`;

export const COURSE_BY_SLUG_QUERY = `*[_type == "course" && slug.current == $slug && published == true][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  coverImage ${IMAGE_PROJECTION},
  entitlementKey,
  description[]{
    ...,
    _type == "image" => { "asset": asset->{url, metadata{dimensions}} }
  },
  price,
  modules[]{
    _key,
    title,
    summary,
    lessons[]{
      _key,
      title,
      durationMinutes,
      isFreePreview,
      content[]{
        _key,
        _type,
        _type == "videoBlock" => {
          title,
          provider,
          cloudflareVideoId,
          externalUrl,
          posterImage ${IMAGE_PROJECTION}
        },
        _type == "textBlock" => {
          content[]{
            ...,
            _type == "image" => { "asset": asset->{url, metadata{dimensions}} }
          }
        },
        _type == "pdfBlock" => {
          title,
          "fileUrl": file.asset->url,
          "fileName": file.asset->originalFilename
        },
        _type == "youtubeEmbedBlock" => {
          title,
          url
        },
        _type == "imageSlideBlock" => {
          caption,
          image ${IMAGE_PROJECTION}
        }
      }
    }
  }
}`;
