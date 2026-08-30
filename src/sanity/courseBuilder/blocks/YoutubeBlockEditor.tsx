import { Label, Stack } from '@sanity/ui'
import { BlurTextField } from '../FieldEditors'
import type { BuilderYoutubeBlock } from '../types'

export function YoutubeBlockEditor({
  block,
  onSetField,
}: {
  block: BuilderYoutubeBlock
  onSetField: (field: string, value: unknown) => void
}) {
  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Label size={1}>Title (optional)</Label>
        <BlurTextField value={block.title ?? ''} onCommit={(v) => onSetField('title', v)} placeholder="Video title" />
      </Stack>
      <Stack gap={2}>
        <Label size={1}>Video URL</Label>
        <BlurTextField
          value={block.url ?? ''}
          onCommit={(v) => onSetField('url', v)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </Stack>
    </Stack>
  )
}
