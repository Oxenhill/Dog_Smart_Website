import { useState } from 'react'
import type { SanityClient } from 'sanity'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AddIcon, DragHandleIcon, TrashIcon } from './icons'
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { Menu, MenuButton, MenuItem } from '@sanity/ui/menu'
import { VideoBlockEditor } from './blocks/VideoBlockEditor'
import { TextBlockEditor } from './blocks/TextBlockEditor'
import { PdfBlockEditor } from './blocks/PdfBlockEditor'
import { YoutubeBlockEditor } from './blocks/YoutubeBlockEditor'
import { ImageSlideBlockEditor } from './blocks/ImageSlideBlockEditor'
import { CONTENT_BLOCK_TYPE_LABELS } from './types'
import type { BuilderContentBlock, BuilderContentBlockType } from './types'

/**
 * A lesson's content — video/text/PDF/YouTube-link/slide-image blocks —
 * editable and reorderable in one place, each writing patches directly to
 * that lesson's `content` array. This is the part of the brief that makes
 * it "everything, one screen" rather than the lighter structure-only
 * option Oliver didn't pick.
 */
export function ContentBlockList({
  client,
  blocks,
  onReorder,
  onAdd,
  onDelete,
  onSetField,
}: {
  client: SanityClient
  blocks: BuilderContentBlock[]
  onReorder: (blockKey: string, blockSnapshot: BuilderContentBlock, beforeKey: string | null) => void
  onAdd: (type: BuilderContentBlockType) => void
  onDelete: (blockKey: string) => void
  onSetField: (blockKey: string, field: string, value: unknown) => void
}) {
  const [local, setLocal] = useState(blocks)
  const [dragging, setDragging] = useState(false)

  // Same render-phase resync pattern as CourseTree.tsx: pick up the live
  // `blocks` prop unless a drag is in progress, without an effect.
  const [syncedBlocks, setSyncedBlocks] = useState(blocks)
  if (!dragging && syncedBlocks !== blocks) {
    setSyncedBlocks(blocks)
    setLocal(blocks)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = local.findIndex((b) => b._key === active.id)
    const newIndex = local.findIndex((b) => b._key === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(local, oldIndex, newIndex)
    setLocal(reordered)
    const movedIndex = reordered.findIndex((b) => b._key === active.id)
    const beforeKey = reordered[movedIndex + 1]?._key ?? null
    onReorder(String(active.id), reordered[movedIndex], beforeKey)
  }

  return (
    <Stack gap={4}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={local.map((b) => b._key)} strategy={verticalListSortingStrategy}>
          <Stack gap={3}>
            {local.map((block) => (
              <BlockCard
                key={block._key}
                client={client}
                block={block}
                onDelete={() => onDelete(block._key)}
                onSetField={(field, value) => onSetField(block._key, field, value)}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>

      {local.length === 0 ? (
        <Text size={1} muted>
          No content yet — add a block below.
        </Text>
      ) : null}

      <MenuButton
        id="add-content-block"
        button={<Button icon={AddIcon} text="Add content block" mode="ghost" />}
        menu={
          <Menu>
            {(Object.entries(CONTENT_BLOCK_TYPE_LABELS) as [BuilderContentBlockType, string][]).map(([type, label]) => (
              <MenuItem key={type} text={label} onClick={() => onAdd(type)} />
            ))}
          </Menu>
        }
      />
    </Stack>
  )
}

function BlockCard({
  client,
  block,
  onDelete,
  onSetField,
}: {
  client: SanityClient
  block: BuilderContentBlock
  onDelete: () => void
  onSetField: (field: string, value: unknown) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block._key })

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      padding={3}
      radius={2}
      shadow={1}
    >
      <Flex align="flex-start" gap={2} marginBottom={3}>
        <Box {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', paddingTop: 2 }}>
          <DragHandleIcon />
        </Box>
        <Box flex={1}>
          <Text size={1} weight="semibold">
            {CONTENT_BLOCK_TYPE_LABELS[block._type]}
          </Text>
        </Box>
        <Button
          icon={TrashIcon}
          mode="bleed"
          tone="critical"
          padding={2}
          onClick={() => {
            if (window.confirm('Remove this block?')) onDelete()
          }}
        />
      </Flex>

      <Box paddingLeft={4}>
        {block._type === 'videoBlock' ? <VideoBlockEditor client={client} block={block} onSetField={onSetField} /> : null}
        {block._type === 'textBlock' ? <TextBlockEditor block={block} onSetField={onSetField} /> : null}
        {block._type === 'pdfBlock' ? <PdfBlockEditor client={client} block={block} onSetField={onSetField} /> : null}
        {block._type === 'youtubeEmbedBlock' ? <YoutubeBlockEditor block={block} onSetField={onSetField} /> : null}
        {block._type === 'imageSlideBlock' ? (
          <ImageSlideBlockEditor client={client} block={block} onSetField={onSetField} />
        ) : null}
      </Box>
    </Card>
  )
}
