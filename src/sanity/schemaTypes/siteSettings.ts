import { defineField, defineType } from 'sanity'

/**
 * Singleton document holding site-wide copy, contact details, booking
 * links, the pricing-visibility toggle, and per-page headers. Edit this
 * once, it updates everywhere it's used.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'hero', title: 'Homepage: Hero' },
    { name: 'family', title: 'Homepage: The Dog Smart Family' },
    { name: 'cta', title: 'Homepage: Booking Banner' },
    { name: 'contact', title: 'Contact Details' },
    { name: 'booking', title: 'Booking Links' },
    { name: 'social', title: 'Social Links' },
    { name: 'footer', title: 'Footer' },
    { name: 'pricing', title: 'Pricing Visibility' },
    { name: 'pageHeaders', title: 'Page Headers' },
    { name: 'seo', title: 'Branding & SEO' },
  ],
  fieldsets: [
    { name: 'aboutPage', title: 'About / Family Page (/about)', options: { collapsible: true, collapsed: true } },
    { name: 'servicesPage', title: 'Services Page (/services)', options: { collapsible: true, collapsed: true } },
    { name: 'coursesPage', title: 'Online Learning Page (/online-learning)', options: { collapsible: true, collapsed: true } },
    { name: 'galleryPage', title: 'Gallery Page (/gallery)', options: { collapsible: true, collapsed: true } },
    { name: 'reviewsPage', title: 'Reviews Page (/reviews)', options: { collapsible: true, collapsed: true } },
    { name: 'blogPage', title: 'Blog Page (/blog)', options: { collapsible: true, collapsed: true } },
    { name: 'faqPage', title: 'FAQ Page (/faq)', options: { collapsible: true, collapsed: true } },
    { name: 'contactPage', title: 'Contact Page (/contact)', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: 'businessName',
      title: 'Business name',
      type: 'string',
      group: 'general',
      initialValue: 'Dog Smart Training & Behaviour',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'familyTagline',
      title: '"The Dog Smart Family" tagline',
      type: 'string',
      group: 'general',
      description: 'The core promise line used across the site — e.g. in the header strip, About page and footer.',
      initialValue: "We're Not Just a Training Service — We're a Family",
    }),

    // --- Homepage: Hero ---------------------------------------------------
    defineField({
      name: 'heroEyebrow',
      title: 'Small label above the headline',
      type: 'string',
      group: 'hero',
      initialValue: 'Sevenoaks, Kent',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      initialValue: 'Real-life training. Honest behaviour support.',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Supporting line',
      type: 'text',
      rows: 3,
      group: 'hero',
      initialValue:
        'A community built on understanding dogs — not just managing them. Force-free training and behaviour support for you and your dog, from puppyhood onwards.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero photo (optional)',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
    }),

    // --- Homepage: Family --------------------------------------------------
    defineField({
      name: 'familyEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'family',
      initialValue: 'The Dog Smart Family',
    }),
    defineField({
      name: 'familyHeadline',
      title: 'Heading',
      type: 'string',
      group: 'family',
      initialValue: "We're Not Just a Training Service — We're a Family",
    }),
    defineField({
      name: 'familyBody',
      title: 'Body copy',
      type: 'text',
      rows: 4,
      group: 'family',
      initialValue:
        'Founded by Oliver and Becs in 2018, Dog Smart is built around force-free, understanding-led training — for every dog and every family that joins us.',
    }),

    // --- Homepage: CTA -------------------------------------------------------
    defineField({
      name: 'ctaEyebrow',
      title: 'Small label above the headline',
      type: 'string',
      group: 'cta',
      initialValue: 'Get Started',
    }),
    defineField({
      name: 'ctaHeadline',
      title: 'Headline',
      type: 'string',
      group: 'cta',
      initialValue: "Let's get to know your dog.",
    }),
    defineField({
      name: 'ctaBody',
      title: 'Supporting line',
      type: 'text',
      rows: 2,
      group: 'cta',
      initialValue: 'Book a class, a consult, or just ask us a question — we reply to every enquiry personally.',
    }),

    // --- Contact -----------------------------------------------------------
    defineField({ name: 'phone', title: 'Phone number', type: 'string', group: 'contact' }),
    defineField({ name: 'email', title: 'Email address', type: 'string', group: 'contact', initialValue: 'trainers@dogsmarttrainingbehaviour.co.uk' }),
    defineField({
      name: 'enquiryNotificationEmail',
      title: 'Where enquiries are sent',
      type: 'string',
      group: 'contact',
      description: 'Leave empty to use the Email address above instead.',
    }),
    defineField({ name: 'addressLocality', title: 'Town / locality', type: 'string', group: 'contact', initialValue: 'Sevenoaks' }),
    defineField({ name: 'addressRegion', title: 'County', type: 'string', group: 'contact', initialValue: 'Kent' }),
    defineField({
      name: 'coverageArea',
      title: 'Coverage area description',
      type: 'string',
      group: 'contact',
      initialValue: 'Covering Sevenoaks and the surrounding Kent villages',
    }),

    // --- Booking links -------------------------------------------------------
    defineField({
      name: 'classBookingUrl',
      title: 'Class & general booking link (Base44 app)',
      type: 'url',
      group: 'booking',
      description: 'Where "Book Now" buttons for puppy/general/gundog classes send people.',
    }),
    defineField({
      name: 'behaviourBookingUrl',
      title: 'Behaviour consult booking link (Harmony Companion app)',
      type: 'url',
      group: 'booking',
      description: 'Where behaviour-support enquiries and "Book a Consult" buttons send people.',
    }),
    defineField({
      name: 'onlineLearningUrl',
      title: 'Online learning area URL',
      type: 'string',
      group: 'booking',
      description: 'Usually just "/online-learning" — the built-in courses area on this site.',
      initialValue: '/online-learning',
    }),
    defineField({
      name: 'briarroseGundogsUrl',
      title: 'Briarrose Gundogs URL',
      type: 'url',
      group: 'booking',
      description: 'Our sister site — the home of our gundog training and the gundog online course. Linked from the Gundog Training service page and Online Learning.',
      initialValue: 'https://briarrosegundogs.co.uk',
    }),

    // --- Social --------------------------------------------------------------
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'social',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({ name: 'platform', type: 'string', options: { list: ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'X'] } }),
            defineField({ name: 'url', type: 'url' }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        },
      ],
    }),

    // --- Footer ----------------------------------------------------------
    defineField({ name: 'footerText', title: 'Footer small print', type: 'string', group: 'footer', initialValue: '© Dog Smart Training & Behaviour' }),

    // --- Pricing visibility --------------------------------------------------
    defineField({
      name: 'showPricingSitewide',
      title: 'Show pricing on the site?',
      type: 'boolean',
      group: 'pricing',
      initialValue: true,
      description:
        'Master switch. When ON, prices entered on Service pages are shown publicly. When OFF, pricing is hidden everywhere and visitors are directed to enquire instead — nothing needs to be deleted, just flip this back on any time.',
    }),

    // --- Page headers ----------------------------------------------------
    defineField({ name: 'aboutPageEyebrow', title: 'About page — small label', type: 'string', group: 'pageHeaders', fieldset: 'aboutPage', initialValue: 'About Us' }),
    defineField({ name: 'aboutPageHeading', title: 'About page — headline', type: 'string', group: 'pageHeaders', fieldset: 'aboutPage', initialValue: 'The Dog Smart Family' }),
    defineField({ name: 'aboutPageBody', title: 'About page — supporting line', type: 'text', rows: 2, group: 'pageHeaders', fieldset: 'aboutPage' }),

    defineField({ name: 'servicesPageEyebrow', title: 'Services page — small label', type: 'string', group: 'pageHeaders', fieldset: 'servicesPage', initialValue: 'Services' }),
    defineField({ name: 'servicesPageHeading', title: 'Services page — headline', type: 'string', group: 'pageHeaders', fieldset: 'servicesPage', initialValue: 'Training built around your dog' }),
    defineField({ name: 'servicesPageBody', title: 'Services page — supporting line', type: 'text', rows: 2, group: 'pageHeaders', fieldset: 'servicesPage' }),

    defineField({ name: 'coursesPageEyebrow', title: 'Online Learning page — small label', type: 'string', group: 'pageHeaders', fieldset: 'coursesPage', initialValue: 'Online Learning' }),
    defineField({ name: 'coursesPageHeading', title: 'Online Learning page — headline', type: 'string', group: 'pageHeaders', fieldset: 'coursesPage', initialValue: 'Learn at your own pace' }),
    defineField({ name: 'coursesPageBody', title: 'Online Learning page — supporting line', type: 'text', rows: 2, group: 'pageHeaders', fieldset: 'coursesPage' }),

    defineField({ name: 'galleryPageEyebrow', title: 'Gallery page — small label', type: 'string', group: 'pageHeaders', fieldset: 'galleryPage', initialValue: 'Gallery' }),
    defineField({ name: 'galleryPageHeading', title: 'Gallery page — headline', type: 'string', group: 'pageHeaders', fieldset: 'galleryPage', initialValue: 'Life in the Dog Smart family' }),

    defineField({ name: 'reviewsPageEyebrow', title: 'Reviews page — small label', type: 'string', group: 'pageHeaders', fieldset: 'reviewsPage', initialValue: 'Reviews' }),
    defineField({ name: 'reviewsPageHeading', title: 'Reviews page — headline', type: 'string', group: 'pageHeaders', fieldset: 'reviewsPage', initialValue: 'What families say' }),

    defineField({ name: 'blogPageEyebrow', title: 'Blog page — small label', type: 'string', group: 'pageHeaders', fieldset: 'blogPage', initialValue: 'Blog' }),
    defineField({ name: 'blogPageHeading', title: 'Blog page — headline', type: 'string', group: 'pageHeaders', fieldset: 'blogPage', initialValue: 'Notes from the family' }),

    defineField({ name: 'faqPageEyebrow', title: 'FAQ page — small label', type: 'string', group: 'pageHeaders', fieldset: 'faqPage', initialValue: 'FAQ' }),
    defineField({ name: 'faqPageHeading', title: 'FAQ page — headline', type: 'string', group: 'pageHeaders', fieldset: 'faqPage', initialValue: 'Common questions' }),

    defineField({ name: 'contactPageEyebrow', title: 'Contact page — small label', type: 'string', group: 'pageHeaders', fieldset: 'contactPage', initialValue: 'Get in Touch' }),
    defineField({ name: 'contactPageHeading', title: 'Contact page — headline', type: 'string', group: 'pageHeaders', fieldset: 'contactPage', initialValue: "Let's talk about your dog" }),

    // --- Branding & SEO -----------------------------------------------------
    defineField({ name: 'logo', title: 'Logo', type: 'image', options: { hotspot: true }, group: 'seo' }),
    defineField({ name: 'ogImage', title: 'Default social-share image', type: 'image', options: { hotspot: true }, group: 'seo' }),
    defineField({ name: 'seoDefaultTitle', title: 'Default page title', type: 'string', group: 'seo' }),
    defineField({ name: 'seoDefaultDescription', title: 'Default meta description', type: 'text', rows: 3, group: 'seo' }),
  ],
  preview: { prepare() { return { title: 'Site Settings' } } },
})
