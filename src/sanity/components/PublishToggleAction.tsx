import { useDocumentOperation } from 'sanity'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { Icon } from '@sanity/icons'

/**
 * Two separate one-click actions for `course` documents, replacing the
 * single toggle this file used to export.
 *
 * Why two: the original single toggle always flipped the `published` field
 * AND published the document in one click — great for going live or taking
 * a course down, but it meant there was no way to push an edit to an
 * ALREADY-live course without first taking it offline and republishing
 * (Oliver's own words: "no way to publish changes without taking it
 * offline and republishing"). Splitting into two fixes that:
 *
 * - `PublishChangesAction` (primary button): commits whatever's pending on
 *   the draft straight to the live document, without touching the
 *   `published` field. If the course isn't live yet, its label switches to
 *   "Publish live" and it also flips `published` on — so this one button
 *   still covers first-publish, it just no longer force-toggles a course
 *   that's already live.
 * - `TakeOfflineAction` (secondary — lands in the "…" menu since it's
 *   returned after the primary action): explicitly flips `published` off
 *   and commits that. Disabled while the course isn't live, since there's
 *   nothing to take offline.
 *
 * Both still collapse Studio's own draft/publish model and this schema's
 * `published` checkbox (see course.ts) into one click each, for the same
 * reason the original action did — the real site only reads the published
 * copy's `published` flag, so the two need to move together.
 */
function useIsLive(props: DocumentActionProps) {
  const { draft, published } = props
  // Whichever version is currently being edited (an in-progress draft takes
  // priority over the already-published copy) is what decides the label —
  // that's what Oliver is looking at right now.
  const current = (draft ?? published) as { published?: boolean } | null
  return current?.published === true
}

export const PublishChangesAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type } = props
  const { patch, publish } = useDocumentOperation(id, type)
  const isLive = useIsLive(props)

  return {
    label: isLive ? 'Publish changes' : 'Publish live',
    icon: () => <Icon symbol="eye-open" />,
    tone: 'positive',
    // Once live, respect Studio's own "nothing pending" state so the
    // button doesn't invite a no-op click. Before the first publish,
    // though, `publish.disabled` reflects the state *before* the patch
    // below flips the course on — it must not gate the button here, or a
    // brand-new course could never be published for the first time.
    disabled: isLive ? Boolean(publish.disabled) : false,
    onHandle: () => {
      if (!isLive) patch.execute([{ set: { published: true } }])
      if (!isLive || !publish.disabled) publish.execute()
      props.onComplete()
    },
  }
}

export const TakeOfflineAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { id, type } = props
  const { patch, publish } = useDocumentOperation(id, type)
  const isLive = useIsLive(props)

  return {
    label: 'Take offline',
    icon: () => <Icon symbol="eye-closed" />,
    tone: 'critical',
    disabled: !isLive,
    onHandle: () => {
      patch.execute([{ set: { published: false } }])
      if (!publish.disabled) publish.execute()
      props.onComplete()
    },
  }
}
