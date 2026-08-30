import { Box, Card, Label, Stack, Text } from '@sanity/ui'
import { BlurNumberField, BlurTextField, InlineSwitchField } from './FieldEditors'
import type { BuilderLesson, BuilderModule } from './types'

/**
 * Inline field editing for whichever module or lesson is currently
 * selected in the tree — title, module summary, lesson duration, free
 * preview toggle. Each field patches on blur/change (see FieldEditors.tsx)
 * rather than needing a separate manual save step.
 */
export function ModuleDetailsPanel({
  module: mod,
  onSetField,
}: {
  module: BuilderModule
  onSetField: (field: 'title' | 'summary', value: string) => void
}) {
  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack gap={4}>
        <Text size={1} weight="semibold">
          Module
        </Text>
        <Stack gap={2}>
          <Label size={1}>Title</Label>
          <BlurTextField value={mod.title ?? ''} onCommit={(v) => onSetField('title', v)} placeholder="Module title" />
        </Stack>
        <Stack gap={2}>
          <Label size={1}>Summary (optional)</Label>
          <BlurTextField
            value={mod.summary ?? ''}
            onCommit={(v) => onSetField('summary', v)}
            placeholder="What this module covers"
            multiline
          />
        </Stack>
      </Stack>
    </Card>
  )
}

export function LessonDetailsPanel({
  lesson,
  onSetField,
}: {
  lesson: BuilderLesson
  onSetField: (field: 'title' | 'durationMinutes' | 'isFreePreview', value: string | number | boolean | undefined) => void
}) {
  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack gap={4}>
        <Text size={1} weight="semibold">
          Lesson
        </Text>
        <Stack gap={2}>
          <Label size={1}>Title</Label>
          <BlurTextField value={lesson.title ?? ''} onCommit={(v) => onSetField('title', v)} placeholder="Lesson title" />
        </Stack>
        <Box style={{ maxWidth: 160 }}>
          <Stack gap={2}>
            <Label size={1}>Duration (minutes)</Label>
            <BlurNumberField
              value={lesson.durationMinutes}
              onCommit={(v) => onSetField('durationMinutes', v)}
              placeholder="e.g. 12"
            />
          </Stack>
        </Box>
        <InlineSwitchField
          checked={Boolean(lesson.isFreePreview)}
          onCommit={(checked) => onSetField('isFreePreview', checked)}
          label="Free preview lesson (viewable without being entitled)"
        />
      </Stack>
    </Card>
  )
}
