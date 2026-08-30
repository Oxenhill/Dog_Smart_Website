import { useState } from 'react'
import type { SanityClient } from 'sanity'
import { Label, Stack, Text } from '@sanity/ui'
import { BlurTextField, InlineSwitchField } from '../FieldEditors'
import type { BuilderPdfBlock } from '../types'

export function PdfBlockEditor({
  client,
  block,
  onSetField,
}: {
  client: SanityClient
  block: BuilderPdfBlock
  onSetField: (field: string, value: unknown) => void
}) {
  const [uploading, setUploading] = useState(false)

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const asset = await client.assets.upload('file', file, { filename: file.name })
      onSetField('file', { _type: 'file', asset: { _type: 'reference', _ref: asset._id } })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Label size={1}>Title</Label>
        <BlurTextField value={block.title ?? ''} onCommit={(v) => onSetField('title', v)} placeholder="Handout title" />
      </Stack>

      <Stack gap={2}>
        <Label size={1}>PDF file</Label>
        {block.fileUrl ? (
          <Text size={1}>
            <a href={block.fileUrl} target="_blank" rel="noreferrer">
              {block.fileName || 'Current PDF'}
            </a>
          </Text>
        ) : (
          <Text size={1} muted>
            No file uploaded yet.
          </Text>
        )}
        <input type="file" accept="application/pdf" onChange={onFileSelected} disabled={uploading} />
        {uploading ? <Text size={0} muted>Uploading…</Text> : null}
      </Stack>

      <InlineSwitchField
        checked={Boolean(block.preventDownload)}
        onCommit={(checked) => onSetField('preventDownload', checked)}
        label="Hide the download link (view-only)"
      />
    </Stack>
  )
}
