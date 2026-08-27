import { type SchemaTypeDefinition } from 'sanity'

import siteSettings from './siteSettings'
import familyProfile from './familyProfile'
import dog from './dog'
import service from './service'
import course from './course'
import testimonial from './testimonial'
import galleryItem from './galleryItem'
import post from './post'
import policy from './policy'
import faqItem from './faqItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    siteSettings,
    familyProfile,
    service,
    course,
    dog,
    testimonial,
    galleryItem,
    post,
    policy,
    faqItem,
  ],
}
