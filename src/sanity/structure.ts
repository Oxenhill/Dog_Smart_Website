import type { StructureResolver } from 'sanity/structure'

// Pins the two singletons (Site Settings, About/Family Page) to the top of
// the Studio sidebar as single editable documents rather than lists.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('About Page (The Dog Smart Family)')
        .id('familyProfile')
        .child(S.document().schemaType('familyProfile').documentId('familyProfile')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !['siteSettings', 'familyProfile'].includes(item.getId() ?? '')
      ),
    ])
