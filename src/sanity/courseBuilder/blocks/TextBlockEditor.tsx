import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Box, Button, Flex, Text } from '@sanity/ui'
import {
  EditorProvider,
  PortableTextEditable,
  PortableTextEditor,
  useEditor,
  useEditorSelector,
  usePortableTextEditor,
  usePortableTextEditorSelection,
} from '@portabletext/editor'
import { randomKey } from '../keys'
import { richTextSchemaDefinition } from '../richTextSchema'
import type { BuilderTextBlock, PortableTextBlock } from '../types'

/**
 * Real rich text editing for a lesson's text block — bold, italic,
 * underline, bulleted/numbered lists and links — built directly on
 * @portabletext/editor, the same engine Sanity Studio's own native block
 * editor uses under the hood. Replaces the earlier one-paragraph-per-line
 * plain textarea (see this file's git history), which was a deliberate,
 * disclosed simplification that could only produce flat paragraphs and
 * silently dropped any richer formatting already on a block when re-saved.
 *
 * Edits are debounced and written back as a full portable-text array via
 * `onSetField('content', ...)`, same as every other field in this tool —
 * see patches.ts. The schema here (richTextSchema.ts) must stay in sync
 * with the `content` field's own block config in
 * src/sanity/schemaTypes/course.ts, or content could look different (or
 * lose formatting) depending which editor last touched it.
 */
export function TextBlockEditor({
  block,
  onSetField,
}: {
  block: BuilderTextBlock
  onSetField: (field: string, value: unknown) => void
}) {
  return (
    <Box>
      <EditorProvider
        initialConfig={{
          schemaDefinition: richTextSchemaDefinition,
          initialValue: block.content && block.content.length > 0 ? block.content : undefined,
          keyGenerator: randomKey,
        }}
      >
        <Toolbar />
        <Box
          style={{
            border: '1px solid var(--card-border-color)',
            borderTop: 'none',
            borderRadius: '0 0 3px 3px',
            padding: '10px 12px',
            minHeight: 160,
          }}
        >
          <PortableTextEditable
            style={{ minHeight: 140, outline: 'none' }}
            renderDecorator={(props) => {
              // `value` here is the plain decorator name string (e.g.
              // "strong"), not an object — see @portabletext/editor's
              // RenderSpan, which iterates decorator *names* and only
              // looks up the schema type separately as `schemaType`.
              if (props.value === 'strong') return <strong>{props.children}</strong>
              if (props.value === 'em') return <em>{props.children}</em>
              if (props.value === 'underline') return <span style={{ textDecoration: 'underline' }}>{props.children}</span>
              return props.children
            }}
            renderAnnotation={(props) => {
              // Unlike decorators, an annotation's `value` is the actual
              // markDef data (so we can read `href`); `schemaType.name`
              // is what identifies which annotation type it is.
              if (props.schemaType.name === 'link') {
                const href = (props.value as { href?: string })?.href
                return (
                  <span style={{ textDecoration: 'underline', color: 'var(--card-link-fg-color, #2276fc)' }} title={href}>
                    {props.children}
                  </span>
                )
              }
              return props.children
            }}
            renderListItem={(props) => (
              <div
                style={{
                  display: 'list-item',
                  listStyleType: props.value === 'number' ? 'decimal' : 'disc',
                  marginLeft: '1.4em',
                }}
              >
                {props.children}
              </div>
            )}
            renderStyle={(props) => <div style={{ marginBottom: 8 }}>{props.children}</div>}
          />
        </Box>
        <SyncOut onChange={(value) => onSetField('content', value)} />
      </EditorProvider>
      <Text size={0} muted style={{ marginTop: 6, display: 'block' }}>
        Bold, italic, underline, lists and links — the same formatting Studio&apos;s own text editor supports.
      </Text>
    </Box>
  )
}

function Toolbar() {
  const editor = usePortableTextEditor()
  // Subscribing to selection is what makes the active/inactive button
  // states (bold pressed while the caret sits in bold text, etc.) update
  // as the caret and selection move — without this the toolbar would only
  // re-render when the document's content itself changes.
  usePortableTextEditorSelection()

  const markButton = (mark: string, label: string, style?: CSSProperties) => (
    <Button
      key={mark}
      mode="bleed"
      padding={2}
      fontSize={1}
      text={label}
      style={style}
      selected={PortableTextEditor.isMarkActive(editor, mark)}
      onMouseDown={(e) => {
        e.preventDefault()
        PortableTextEditor.toggleMark(editor, mark)
      }}
    />
  )

  const listButton = (list: string, label: string) => (
    <Button
      key={list}
      mode="bleed"
      padding={2}
      fontSize={1}
      text={label}
      selected={PortableTextEditor.hasListStyle(editor, list)}
      onMouseDown={(e) => {
        e.preventDefault()
        PortableTextEditor.toggleList(editor, list)
      }}
    />
  )

  const linkActive = PortableTextEditor.isAnnotationActive(editor, 'link')

  return (
    <Flex
      gap={1}
      padding={1}
      style={{
        border: '1px solid var(--card-border-color)',
        borderBottom: 'none',
        borderRadius: '3px 3px 0 0',
      }}
    >
      {markButton('strong', 'B', { fontWeight: 700 })}
      {markButton('em', 'I', { fontStyle: 'italic' })}
      {markButton('underline', 'U', { textDecoration: 'underline' })}
      {listButton('bullet', '• List')}
      {listButton('number', '1. List')}
      <Button
        mode="bleed"
        padding={2}
        fontSize={1}
        text={linkActive ? 'Unlink' : 'Link'}
        selected={linkActive}
        onMouseDown={(e) => {
          e.preventDefault()
          if (linkActive) {
            PortableTextEditor.removeAnnotation(editor, { name: 'link' })
            return
          }
          const href = window.prompt('Link URL (include https://)')
          if (!href) return
          PortableTextEditor.addAnnotation(editor, { name: 'link' }, { href })
        }}
      />
    </Flex>
  )
}

/**
 * Debounced write-back: watches the editor's live value and, ~600ms after
 * it stops changing, patches it onto the document — the same debounce
 * pattern CourseBuilderTool.tsx already uses for reload-after-mutation.
 * Skips the very first value it sees (the editor's own initial snapshot)
 * so opening a block never fires a no-op patch.
 */
function SyncOut({ onChange }: { onChange: (value: PortableTextBlock[]) => void }) {
  const editor = useEditor()
  const value = useEditorSelector(editor, (snapshot) => snapshot.context.value)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange((value ?? []) as PortableTextBlock[])
    }, 600)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // Only the live `value` should retrigger this — `onChange` is a fresh
    // closure every render and doesn't need to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return null
}
