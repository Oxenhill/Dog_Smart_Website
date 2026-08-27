import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dog',
  title: 'Family Dogs',
  type: 'document',
  description: 'Powers the "Family" / dogs section — one entry per dog (e.g. Lenny, Percy, Willow, Teak, Harry, Ron, Jim).',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'breed', title: 'Breed', type: 'string' }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 5 }),
    defineField({
      name: 'photo',
      title: 'Main photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Displayed landscape (4:3) on the Family page grid and this dog’s own section.',
    }),
    defineField({
      name: 'gallery',
      title: 'Additional photos',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'legacy',
      title: 'No longer with us?',
      type: 'boolean',
      initialValue: false,
      description: 'Turn on for a beloved dog who has passed away — shown as a legacy/in-memoriam entry rather than a current family member.',
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'breed', media: 'photo' } },
})
