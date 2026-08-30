import { useCallback, useEffect, useRef, useState } from 'react'
import { useClient } from 'sanity'
import { Box, Card, Flex, Select, Spinner, Stack, Text } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { apiVersion } from '../env'
import { COURSE_LIST_QUERY } from './queries'
import { useCourseDocument } from './useCourseDocument'
import { CourseTree } from './CourseTree'
import { ModuleDetailsPanel, LessonDetailsPanel } from './DetailsPanel'
import { ContentBlockList } from './ContentBlockList'
import { PreviewPane } from './PreviewPane'
import * as patches from './patches'
import type { BuilderContentBlockType, BuilderLesson, BuilderModule, CourseListItem } from './types'

type Selection = { moduleKey: string; lessonKey: string | null } | null

/**
 * The Course Builder tool: pick a course, then build it — drag-and-drop
 * structure, inline field editing, full content-block editing, and a live
 * preview, all on one screen. See patches.ts for the narrow `_key`-based
 * patch strategy every mutation here uses, and useCourseDocument.ts for how
 * the document stays in sync with the real dataset.
 *
 * Registered as a Studio tool in sanity.config.ts. Sanity calls this
 * component with no props of consequence to us (it's not passed via a
 * route param — see the `tool` prop type — so course selection lives in
 * this component's own state rather than the URL).
 */
export function CourseBuilderTool() {
  const client = useClient({ apiVersion })
  const toast = useToast()

  const [courses, setCourses] = useState<CourseListItem[] | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { course, loading, error, refetch } = useCourseDocument(client, courseId)

  useEffect(() => {
    let cancelled = false
    client.fetch<CourseListItem[]>(COURSE_LIST_QUERY).then((list) => {
      if (cancelled) return
      setCourses(list)
      if (list.length === 1) setCourseId(list[0]._id)
    })
    return () => {
      cancelled = true
    }
  }, [client])

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current)
    reloadTimer.current = setTimeout(() => setReloadToken((n) => n + 1), 700)
  }, [])

  useEffect(() => {
    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current)
    }
  }, [])

  const run = useCallback(
    async (action: () => Promise<unknown>, failureMessage: string) => {
      try {
        await action()
        scheduleReload()
      } catch (err) {
        toast.push({
          status: 'error',
          title: failureMessage,
          description: err instanceof Error ? err.message : undefined,
        })
        refetch()
      }
    },
    [scheduleReload, toast, refetch]
  )

  const modules = course?.modules ?? []
  const selectedModule = selection ? modules.find((m) => m._key === selection.moduleKey) ?? null : null
  const selectedLesson =
    selection?.lessonKey && selectedModule ? selectedModule.lessons?.find((l) => l._key === selection.lessonKey) ?? null : null

  if (!courses) {
    return (
      <Flex height="fill" align="center" justify="center">
        <Spinner muted />
      </Flex>
    )
  }

  if (courses.length === 0) {
    return (
      <Flex height="fill" align="center" justify="center" padding={4}>
        <Text muted>No course documents exist yet — create one from the main content list first.</Text>
      </Flex>
    )
  }

  const docId = course?._id ?? null

  return (
    <Flex direction="column" height="fill">
      <Card padding={3} borderBottom>
        <Flex align="center" gap={3}>
          <Text size={1} weight="semibold">
            Course:
          </Text>
          <Box style={{ minWidth: 280 }}>
            <Select
              value={courseId ?? ''}
              onChange={(e) => {
                setCourseId(e.currentTarget.value || null)
                setSelection(null)
              }}
            >
              <option value="" disabled>
                Select a course…
              </option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} {c.published === false ? '(draft)' : ''}
                </option>
              ))}
            </Select>
          </Box>
          {loading ? <Spinner muted /> : null}
          {error ? (
            <Text size={1} style={{ color: 'var(--card-critical-fg-color, #c00)' }}>
              {error}
            </Text>
          ) : null}
        </Flex>
      </Card>

      {!course ? (
        <Flex flex={1} align="center" justify="center">
          <Text muted size={1}>
            {courseId ? 'Loading…' : 'Pick a course above to start building.'}
          </Text>
        </Flex>
      ) : (
        <Flex flex={1} style={{ minHeight: 0 }}>
          <Box style={{ width: 340, minWidth: 340, overflowY: 'auto', borderRight: '1px solid var(--card-border-color)' }}>
            <CourseTree
              modules={modules}
              selectedModuleKey={selection?.moduleKey ?? null}
              selectedLessonKey={selection?.lessonKey ?? null}
              onSelectModule={(moduleKey) => setSelection({ moduleKey, lessonKey: null })}
              onSelectLesson={(moduleKey, lessonKey) => setSelection({ moduleKey, lessonKey })}
              onAddModule={() => {
                run(async () => {
                  const key = await patches.addModule(client, docId!)
                  setSelection({ moduleKey: key, lessonKey: null })
                }, 'Could not add module')
              }}
              onDeleteModule={(moduleKey) => {
                if (selection?.moduleKey === moduleKey) setSelection(null)
                run(() => patches.deleteModule(client, docId!, moduleKey), 'Could not delete module')
              }}
              onAddLesson={(moduleKey) => {
                run(async () => {
                  const key = await patches.addLesson(client, docId!, moduleKey)
                  setSelection({ moduleKey, lessonKey: key })
                }, 'Could not add lesson')
              }}
              onDeleteLesson={(moduleKey, lessonKey) => {
                if (selection?.moduleKey === moduleKey && selection.lessonKey === lessonKey) {
                  setSelection({ moduleKey, lessonKey: null })
                }
                run(() => patches.deleteLesson(client, docId!, moduleKey, lessonKey), 'Could not delete lesson')
              }}
              onReorderModules={(moduleSnapshot: BuilderModule, beforeKey) => {
                run(
                  () => patches.moveModule(client, docId!, moduleSnapshot._key, moduleSnapshot, beforeKey),
                  'Could not reorder modules'
                )
              }}
              onMoveLesson={(lessonSnapshot: BuilderLesson, fromModuleKey, toModuleKey, beforeKey) => {
                if (selection?.lessonKey === lessonSnapshot._key) {
                  setSelection({ moduleKey: toModuleKey, lessonKey: lessonSnapshot._key })
                }
                run(
                  () =>
                    patches.moveLesson(client, docId!, fromModuleKey, lessonSnapshot._key, lessonSnapshot, toModuleKey, beforeKey),
                  'Could not move lesson'
                )
              }}
            />
          </Box>

          <Box style={{ width: 420, minWidth: 420, overflowY: 'auto', borderRight: '1px solid var(--card-border-color)' }} padding={3}>
            {!selectedModule ? (
              <Text muted size={1}>
                Select a module or lesson on the left to edit it here.
              </Text>
            ) : selectedLesson ? (
              <Stack gap={4}>
                <LessonDetailsPanel
                  lesson={selectedLesson}
                  onSetField={(field, value) =>
                    run(
                      () => patches.setLessonField(client, docId!, selectedModule._key, selectedLesson._key, field, value),
                      'Could not save lesson field'
                    )
                  }
                />
                <ContentBlockList
                  client={client}
                  blocks={selectedLesson.content ?? []}
                  onAdd={(type: BuilderContentBlockType) =>
                    run(
                      () => patches.addContentBlock(client, docId!, selectedModule._key, selectedLesson._key, type),
                      'Could not add block'
                    )
                  }
                  onDelete={(blockKey) =>
                    run(
                      () => patches.deleteContentBlock(client, docId!, selectedModule._key, selectedLesson._key, blockKey),
                      'Could not delete block'
                    )
                  }
                  onReorder={(blockKey, blockSnapshot, beforeKey) =>
                    run(
                      () =>
                        patches.moveContentBlock(
                          client,
                          docId!,
                          selectedModule._key,
                          selectedLesson._key,
                          blockKey,
                          blockSnapshot,
                          beforeKey
                        ),
                      'Could not reorder blocks'
                    )
                  }
                  onSetField={(blockKey, field, value) =>
                    run(
                      () =>
                        patches.setContentBlockField(
                          client,
                          docId!,
                          selectedModule._key,
                          selectedLesson._key,
                          blockKey,
                          field,
                          value
                        ),
                      'Could not save block field'
                    )
                  }
                />
              </Stack>
            ) : (
              <ModuleDetailsPanel
                module={selectedModule}
                onSetField={(field, value) =>
                  run(() => patches.setModuleField(client, docId!, selectedModule._key, field, value), 'Could not save module field')
                }
              />
            )}
          </Box>

          <Box flex={1} style={{ minWidth: 0 }}>
            <PreviewPane
              slug={course.slug}
              anchor={selectedLesson ? `lesson-${selectedLesson._key}` : selectedModule ? `module-${selectedModule._key}` : null}
              reloadToken={reloadToken}
            />
          </Box>
        </Flex>
      )}
    </Flex>
  )
}
