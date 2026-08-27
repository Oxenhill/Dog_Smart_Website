import { defineField, defineType } from 'sanity'

/**
 * Singleton for the About / "The Dog Smart Family" page — the story of
 * Oliver and Becs, the training philosophy, and credentials.
 */
export default defineType({
  name: 'familyProfile',
  title: 'About Page (The Dog Smart Family)',
  type: 'document',
  description: 'Powers the "About" page (/about) — the family story, training promise and credentials.',
  fields: [
    defineField({ name: 'introHeadline', title: 'Intro headline', type: 'string', initialValue: "We're Not Just a Training Service — We're a Family" }),
    defineField({
      name: 'story',
      title: 'Our story',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
      description: 'The story of how Dog Smart started — Oliver, Becs, and 2018.',
    }),
    defineField({
      name: 'trainingPromise',
      title: 'The training promise (force-free)',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The force-free, no-aversive-tools promise — powers the "Training Promise" section.',
    }),
    defineField({
      name: 'oliverName',
      title: 'Oliver — name',
      type: 'string',
      initialValue: 'Oliver',
    }),
    defineField({
      name: 'oliverBio',
      title: 'Oliver — bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'oliverCredentials',
      title: 'Oliver — qualifications / credentials',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['VSA (Victoria Stilwell Academy) Graduate'],
    }),
    defineField({
      name: 'oliverPhoto',
      title: 'Oliver — photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'becsName',
      title: 'Becs — name',
      type: 'string',
      initialValue: 'Becs',
    }),
    defineField({
      name: 'becsBio',
      title: 'Becs — bio',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Becs’ background (vet profession) and Agility.',
    }),
    defineField({
      name: 'additionalTeam',
      title: 'Additional team members',
      type: 'array',
      description: 'Other real people who help run Dog Smart (e.g. Louise Warman, who assists with group classes and behaviour cases).',
      of: [
        {
          type: 'object',
          name: 'teamMember',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'role', title: 'Role', type: 'string' }),
            defineField({ name: 'bio', title: 'Bio', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
          ],
          preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
        },
      ],
    }),
    defineField({
      name: 'becsPhoto',
      title: 'Becs — photo',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: { prepare() { return { title: 'About Page (The Dog Smart Family)' } } },
})
