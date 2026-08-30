import { Label, Stack, Text } from '@sanity/ui'
import { randomKey } from '../keys'
import { BlurTextField } from '../FieldEditors'
import type { BuilderTextBlock, PortableTextBlock } from '../types'

/**
 * Simplified text editor: one paragraph per line, round-tripped through
 * Portable Text's block/span shape. This is the deliberate fallback the
 * course-builder brief called out as acceptable if a full
 * @portabletext/editor integration proved too deep a rabbit hole to ship
 * safely — see the report to Oliver. It reads back cleanly (every existing
 * paragraph becomes one line) and writes back cleanly (every line becomes
 * one paragraph block), but it can't do bold/italic/links/headings/lists —
 * only plain paragraphs. Existing richer text content (from native Studio
 * editing) still round-trips as plain text if edited here: any marks or
 * non-"normal" block styles on it are dropped once re-saved through this
 * editor, so avoid using it on a lesson's text block that already has
 * bold/links/headings you want to keep — edit those via the native Studio
 * document editor instead, which this tool doesn't replace.
 */
export function TextBlockEditor({
  block,
  onSetField,
}: {
  block: BuilderTextBlock
  onSetField: (field: string, value: unknown) => void
}) {
  const lines = (block.content ?? [])
    .map((b) => (b.children ?? []).map((c) => c.text).join(''))
    .join('\n')

  const commit = (nextLines: string) => {
    const blocks: PortableTextBlock[] = nextLines
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => ({
        _key: randomKey(),
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [{ _key: randomKey(), _type: 'span', text: line, marks: [] }],
      }))
    onSetField('content', blocks)
  }

  return (
    <Stack gap={2}>
      <Label size={1}>Text (one paragraph per line)</Label>
      <BlurTextField value={lines} onCommit={commit} placeholder="Write each paragraph on its own line…" multiline rows={10} />
      <Text size={0} muted>
        Plain paragraphs only — no bold/italic/links/lists. For richer formatting, edit this lesson&apos;s text block from
        the native Studio document editor instead.
      </Text>
    </Stack>
  )
}
