import { useState } from 'react'
import type { SanityClient } from 'sanity'
import { Box, Label, Stack, Text } from '@sanity/ui'
import { BlurTextField } from '../FieldEditors'
import type { BuilderImageSlideBlock } from '../types'

export function ImageSlideBlockEditor({
  client,
  block,
  onSetField,
}: {
  client: SanityClient
  block: BuilderImageSlideBlock
  onSetField: (field: string, value: unknown) => void
}) {
  const [uploading, setUploading] = useState(false)

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const asset = await client.assets.upload('image', file, { filename: file.name })
      onSetField('image', { _type: 'image', asset: { _type: 'reference', _ref: asset._id } })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Label size={1}>Image</Label>
        {block.imageUrl ? (
          <Box>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.imageUrl} alt="" style={{ maxWidth: 260, borderRadius: 4 }} />
          </Box>
        ) : (
          <Text size={1} muted>
            No image uploaded yet.
          </Text>
        )}
        <input type="file" accept="image/*" onChange={onFileSelected} disabled={uploading} />
        {uploading ? <Text size={0} muted>Uploading…</Text> : null}
      </Stack>
      <Stack gap={2}>
        <Label size={1}>Caption (optional)</Label>
        <BlurTextField value={block.caption ?? ''} onCommit={(v) => onSetField('caption', v)} placeholder="Caption" />
      </Stack>
    </Stack>
  )
}
