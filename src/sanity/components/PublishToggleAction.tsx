import { useDocumentOperation } from 'sanity'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { Icon } from '@sanity/icons'

/**
 * One-click "Publish live" / "Take offline" toggle for `course` documents.
 *
 * Why this exists: a course only actually shows on the real site once BOTH
 * of two separate things are true — (1) Studio's own native document is
 * published (not sitting only as an unsaved draft), and (2) this schema's
 * own `published` checkbox is on (see course.ts) — the flag the site's
 * queries actually filter on. Those are two different systems that happen
 * to share the word "publish", and asking Oliver to keep both in sync by
 * hand (tick the box, then remember to also hit Studio's own green Publish
 * button below) is exactly the kind of clunkiness he's already flagged.
 *
 * This action collapses both into one button, in the primary position at
 * the top of the document: flip the `published` field AND commit the
 * document live, in the same click. Studio's own Publish/Unpublish/Delete
 * actions are left in place (in the "…" menu) for anyone who wants them,
 * but this is the one Oliver needs day to day to bring a course up or take
 * it down.
 */
export const PublishToggleAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type, draft, published } = props
  const { patch, publish } = useDocumentOperation(id, type)

  // Whichever version is currently being edited (an in-progress draft takes
  // priority over the already-published copy) is what decides the label —
  // that's what Oliver is looking at right now.
  const current = (draft ?? published) as { published?: boolean } | null
  const isLive = current?.published === true

  return {
    label: isLive ? 'Take offline' : 'Publish live',
    icon: () => <Icon symbol={isLive ? 'eye-closed' : 'eye-open'} />,
    tone: isLive ? 'critical' : 'positive',
    onHandle: () => {
      patch.execute([{ set: { published: !isLive } }])
      // Commit that change — and anything else pending on this draft —
      // straight to the live document. Without this, the tick would only
      // update the draft, and the real site (which only ever reads the
      // published copy) wouldn't see it until someone separately hit
      // Studio's own Publish button too.
      if (!publish.disabled) publish.execute()
      props.onComplete()
    },
  }
}
