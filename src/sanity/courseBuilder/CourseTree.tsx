import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AddIcon, DragHandleIcon, TrashIcon } from './icons'
import { Badge, Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import type { BuilderModule, BuilderLesson } from './types'

/**
 * The structure tree: modules down the page, each expandable to show its
 * lessons, all drag-and-drop — including dragging a lesson out of one
 * module's list into a different module's list, which is the capability
 * native Sanity array editing doesn't have (two separate array contexts,
 * no shared drag source). See CourseBuilderTool.tsx for how the resulting
 * move/reorder calls turn into actual `_key`-based Sanity patches.
 *
 * Keeps its own local mirror of `modules` for instant drag feedback, and
 * resyncs from the `modules` prop (driven by the live document listener in
 * useCourseDocument.ts) whenever it changes and no drag is in progress —
 * so a concurrent edit elsewhere still shows up here.
 */
export function CourseTree({
  modules,
  selectedModuleKey,
  selectedLessonKey,
  onSelectModule,
  onSelectLesson,
  onAddModule,
  onDeleteModule,
  onAddLesson,
  onDeleteLesson,
  onReorderModules,
  onMoveLesson,
}: {
  modules: BuilderModule[]
  selectedModuleKey: string | null
  selectedLessonKey: string | null
  onSelectModule: (moduleKey: string) => void
  onSelectLesson: (moduleKey: string, lessonKey: string) => void
  onAddModule: () => void
  onDeleteModule: (moduleKey: string) => void
  onAddLesson: (moduleKey: string) => void
  onDeleteLesson: (moduleKey: string, lessonKey: string) => void
  onReorderModules: (moduleSnapshot: BuilderModule, beforeKey: string | null) => void
  onMoveLesson: (
    lessonSnapshot: BuilderLesson,
    fromModuleKey: string,
    toModuleKey: string,
    beforeKey: string | null
  ) => void
}) {
  const [localModules, setLocalModules] = useState<BuilderModule[]>(modules)
  const [dragging, setDragging] = useState(false)
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  // Resyncs the local drag-preview mirror from the live `modules` prop
  // whenever it changes — but not while a drag is in progress, so an
  // in-flight drag never gets its preview yanked out from under it by a
  // refetch. Done during render (React's own documented pattern for
  // "adjusting state when a prop changes") rather than in an effect, so
  // this doesn't cost an extra render pass.
  const [syncedModules, setSyncedModules] = useState(modules)
  if (!dragging && syncedModules !== modules) {
    setSyncedModules(modules)
    setLocalModules(modules)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragStart(event: DragStartEvent) {
    setDragging(true)
    const data = event.active.data.current as { type?: string; title?: string } | undefined
    setActiveLabel(data?.title ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false)
    setActiveLabel(null)
    const { active, over } = event
    if (!over) return
    const activeData = active.data.current as
      | { type: 'module'; moduleKey: string }
      | { type: 'lesson'; moduleKey: string; lessonKey: string }
      | undefined
    if (!activeData) return
    const overData = over.data.current as
      | { type: 'module'; moduleKey: string }
      | { type: 'lesson'; moduleKey: string; lessonKey: string }
      | { type: 'module-container'; moduleKey: string }
      | undefined

    if (activeData.type === 'module') {
      if (overData?.type !== 'module' || overData.moduleKey === activeData.moduleKey) return
      const oldIndex = localModules.findIndex((m) => m._key === activeData.moduleKey)
      const newIndex = localModules.findIndex((m) => m._key === overData.moduleKey)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(localModules, oldIndex, newIndex)
      setLocalModules(reordered)
      const movedIndex = reordered.findIndex((m) => m._key === activeData.moduleKey)
      const beforeKey = reordered[movedIndex + 1]?._key ?? null
      const nextKeyBefore = localModules[oldIndex + 1]?._key ?? null
      if (beforeKey === nextKeyBefore) return // no actual position change
      onReorderModules(reordered[movedIndex], beforeKey)
      return
    }

    // Lesson drag — may move within the same module or into a different one.
    const fromModuleKey = activeData.moduleKey
    const lessonKey = activeData.lessonKey
    let toModuleKey: string | null = null
    let overLessonKey: string | null = null
    if (overData?.type === 'lesson') {
      toModuleKey = overData.moduleKey
      overLessonKey = overData.lessonKey
    } else if (overData?.type === 'module-container' || overData?.type === 'module') {
      toModuleKey = overData.moduleKey
    }
    if (!toModuleKey) return

    const fromModule = localModules.find((m) => m._key === fromModuleKey)
    const lesson = fromModule?.lessons?.find((l) => l._key === lessonKey)
    if (!lesson) return

    const originalSiblings = fromModule?.lessons ?? []
    const originalIndex = originalSiblings.findIndex((l) => l._key === lessonKey)
    const originalNextKey = originalSiblings[originalIndex + 1]?._key ?? null

    const withoutLesson = localModules.map((m) =>
      m._key === fromModuleKey ? { ...m, lessons: (m.lessons ?? []).filter((l) => l._key !== lessonKey) } : m
    )
    const destModule = withoutLesson.find((m) => m._key === toModuleKey)
    const destLessons = destModule?.lessons ?? []
    let insertIndex = destLessons.length
    if (overLessonKey) {
      const idx = destLessons.findIndex((l) => l._key === overLessonKey)
      if (idx !== -1) insertIndex = idx
    }
    const newDestLessons = [...destLessons]
    newDestLessons.splice(insertIndex, 0, lesson)
    const beforeKey = newDestLessons[insertIndex + 1]?._key ?? null

    if (fromModuleKey === toModuleKey && beforeKey === originalNextKey) return // no actual position change

    const finalModules = withoutLesson.map((m) => (m._key === toModuleKey ? { ...m, lessons: newDestLessons } : m))
    setLocalModules(finalModules)
    onMoveLesson(lesson, fromModuleKey, toModuleKey, beforeKey)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Stack gap={3} padding={3}>
        <SortableContext items={localModules.map((m) => m._key)} strategy={verticalListSortingStrategy}>
          {localModules.map((mod) => (
            <ModuleRow
              key={mod._key}
              module={mod}
              selected={selectedModuleKey === mod._key && !selectedLessonKey}
              selectedLessonKey={selectedModuleKey === mod._key ? selectedLessonKey : null}
              onSelectModule={onSelectModule}
              onSelectLesson={onSelectLesson}
              onDeleteModule={onDeleteModule}
              onAddLesson={onAddLesson}
              onDeleteLesson={onDeleteLesson}
            />
          ))}
        </SortableContext>
        <Button icon={AddIcon} text="Add module" mode="ghost" onClick={onAddModule} />
      </Stack>
      <DragOverlay>{activeLabel ? <Card padding={2} radius={2} shadow={2} tone="primary"><Text size={1}>{activeLabel}</Text></Card> : null}</DragOverlay>
    </DndContext>
  )
}

function ModuleRow({
  module: mod,
  selected,
  selectedLessonKey,
  onSelectModule,
  onSelectLesson,
  onDeleteModule,
  onAddLesson,
  onDeleteLesson,
}: {
  module: BuilderModule
  selected: boolean
  selectedLessonKey: string | null
  onSelectModule: (moduleKey: string) => void
  onSelectLesson: (moduleKey: string, lessonKey: string) => void
  onDeleteModule: (moduleKey: string) => void
  onAddLesson: (moduleKey: string) => void
  onDeleteLesson: (moduleKey: string, lessonKey: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mod._key,
    data: { type: 'module', moduleKey: mod._key, title: mod.title },
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `module-container-${mod._key}`,
    data: { type: 'module-container', moduleKey: mod._key },
  })

  const lessons = mod.lessons ?? []

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      padding={2}
      radius={2}
      shadow={1}
      tone={selected ? 'primary' : 'default'}
    >
      <Flex align="center" gap={2}>
        <Box {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex' }}>
          <DragHandleIcon />
        </Box>
        <Box flex={1} onClick={() => onSelectModule(mod._key)} style={{ cursor: 'pointer' }}>
          <Text size={1} weight="semibold">
            {mod.title || 'Untitled module'}
          </Text>
          <Text size={0} muted>
            {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
          </Text>
        </Box>
        <Button
          icon={TrashIcon}
          mode="bleed"
          tone="critical"
          padding={2}
          onClick={() => {
            if (window.confirm(`Delete "${mod.title || 'this module'}" and all its lessons?`)) onDeleteModule(mod._key)
          }}
        />
      </Flex>

      <Box ref={setDropRef} marginTop={2} paddingLeft={4} style={{ borderLeft: isOver ? '2px solid var(--card-focus-ring-color, #2276fc)' : '2px solid transparent' }}>
        <SortableContext items={lessons.map((l) => l._key)} strategy={verticalListSortingStrategy}>
          <Stack gap={1}>
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson._key}
                lesson={lesson}
                moduleKey={mod._key}
                selected={selectedLessonKey === lesson._key}
                onSelect={() => onSelectLesson(mod._key, lesson._key)}
                onDelete={() => onDeleteLesson(mod._key, lesson._key)}
              />
            ))}
            {lessons.length === 0 ? (
              <Text size={0} muted style={{ padding: '6px 4px' }}>
                No lessons yet — drag one here, or add below.
              </Text>
            ) : null}
          </Stack>
        </SortableContext>
        <Box marginTop={2}>
          <Button icon={AddIcon} text="Add lesson" mode="bleed" fontSize={1} onClick={() => onAddLesson(mod._key)} />
        </Box>
      </Box>
    </Card>
  )
}

function LessonRow({
  lesson,
  moduleKey,
  selected,
  onSelect,
  onDelete,
}: {
  lesson: BuilderLesson
  moduleKey: string
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson._key,
    data: { type: 'lesson', moduleKey, lessonKey: lesson._key, title: lesson.title },
  })
  const blockCount = lesson.content?.length ?? 0

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      padding={2}
      radius={2}
      tone={selected ? 'primary' : 'transparent'}
    >
      <Flex align="center" gap={2}>
        <Box {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex' }}>
          <DragHandleIcon />
        </Box>
        <Box flex={1} onClick={onSelect} style={{ cursor: 'pointer' }}>
          <Text size={1}>{lesson.title || 'Untitled lesson'}</Text>
          <Flex gap={2} marginTop={1}>
            {lesson.durationMinutes ? (
              <Text size={0} muted>
                {lesson.durationMinutes} min
              </Text>
            ) : null}
            <Text size={0} muted>
              {blockCount} block{blockCount === 1 ? '' : 's'}
            </Text>
            {lesson.isFreePreview ? <Badge tone="positive" fontSize={0}>Free preview</Badge> : null}
          </Flex>
        </Box>
        <Button
          icon={TrashIcon}
          mode="bleed"
          tone="critical"
          padding={2}
          onClick={() => {
            if (window.confirm(`Delete "${lesson.title || 'this lesson'}"?`)) onDelete()
          }}
        />
      </Flex>
    </Card>
  )
}
