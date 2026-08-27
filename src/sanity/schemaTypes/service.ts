import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Services',
  type: 'document',
  description:
    'Powers the "Services" page and each individual service page (Puppy Support, General Dog Training, Gundog Training, Behaviour Support). Pricing entered here only shows publicly when "Show pricing on the site?" is switched on in Site Settings.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'summary', title: 'Short summary (used in cards/listings)', type: 'text', rows: 3 }),
    defineField({
      name: 'icon',
      title: 'Icon keyword (optional)',
      type: 'string',
      description: 'A short keyword (e.g. "puppy", "gundog", "behaviour") used to pick a matching icon on the front end.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown at the top of this service’s own page, displayed landscape.',
    }),
    defineField({
      name: 'body',
      title: 'Full description',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'pricingTiers',
      title: 'Pricing',
      type: 'array',
      description: 'Only shown publicly if "Show pricing on the site?" is ON in Site Settings.',
      of: [
        {
          type: 'object',
          name: 'pricingTier',
          fields: [
            defineField({ name: 'label', title: 'Label (e.g. "Initial Consultation")', type: 'string' }),
            defineField({ name: 'price', title: 'Price (e.g. "£110")', type: 'string' }),
            defineField({ name: 'period', title: 'Period (e.g. "per session", "per month")', type: 'string' }),
            defineField({ name: 'description', title: 'Description (optional)', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'label', subtitle: 'price' } },
        },
      ],
    }),
    defineField({
      name: 'bookingLinkOverride',
      title: 'Booking link override (optional)',
      type: 'url',
      description:
        'Leave blank to use the correct default from Site Settings automatically (class booking for training services, Harmony Companion for Behaviour Support). Only set this if this specific service needs to link somewhere different.',
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'summary', media: 'heroImage' } },
})
