// src/components/RichTextEditor.jsx
import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

// ---- Custom font-size extension (Tiptap has no official one) ----
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
]

const FONT_SIZES = [
  { label: 'Default', value: '' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '40', value: '40px' },
]

// ← changed: icon-only button, with a title tooltip, instead of plain text/letters
function ToolbarButton({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded transition-colors
        ${active ? 'bg-[#1B5E4F] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

// ← added: icon + short label, for less-common actions (table controls) where a
// bare icon would be ambiguous
function ToolbarActionButton({ onClick, label, icon: Icon, tone = 'default' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex shrink-0 cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
        tone === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function ToolbarSelect({ value, onChange, options, title, className = '' }) {
  return (
    <select
      title={title}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer rounded border border-gray-300 bg-white px-1.5 py-1 text-sm text-gray-700 ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.label} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function Divider() {
  return <div className="mx-0.5 w-px self-stretch bg-gray-300" />
}

export default function RichTextEditor({ value, onChange, onImageUpload }) {
  const [sourceMode, setSourceMode] = useState(false) // ← added
  const [sourceDraft, setSourceDraft] = useState('') // ← added
  const [fullscreen, setFullscreen] = useState(false) // ← added

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        // Reuses the same `prose` styling your published posts use,
        // so the editor preview matches the live page.
        class: 'prose max-w-none min-h-[350px] px-4 py-3 focus:outline-none',
      },
    },
  })

  // The post is loaded asynchronously when editing, so `value` changes after the
  // editor is created. Push external changes into the editor (without echoing
  // them back through onUpdate).
  useEffect(() => {
    if (!editor) return
    if ((value || '') !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  if (!editor) return null

  async function handleImagePick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !onImageUpload) return
    try {
      const url = await onImageUpload(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      console.error('Image upload failed:', err)
    }
  }

  function setLink() {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  // ← added: enter/apply/cancel for the raw-HTML source view
  function openSourceMode() {
    setSourceDraft(editor.getHTML())
    setSourceMode(true)
  }
  function applySource() {
    editor.commands.setContent(sourceDraft || '', true)
    setSourceMode(false)
  }
  function cancelSource() {
    setSourceMode(false)
  }

  const currentParagraphType = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
    ? 'h3'
    : editor.isActive('heading', { level: 4 })
    ? 'h4'
    : 'p'

  function handleParagraphTypeChange(val) {
    if (val === 'p') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = Number(val.replace('h', ''))
      editor.chain().focus().setHeading({ level }).run()
    }
  }

  const inTable = editor.isActive('table')

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-hidden bg-white'
          : 'overflow-hidden rounded-md border border-gray-300'
      }
    >
      {/* Minimal table styling so tables are visible inside the editor */}
      <style>{`
        .ProseMirror table { border-collapse: collapse; width: 100%; table-layout: fixed; margin: 1em 0; }
        .ProseMirror th, .ProseMirror td { border: 1px solid #d1d5db; padding: 6px 10px; vertical-align: top; position: relative; }
        .ProseMirror th { background: #f3f4f6; font-weight: 600; text-align: left; }
        .ProseMirror .selectedCell::after { content: ''; position: absolute; inset: 0; background: rgba(59, 130, 246, 0.15); pointer-events: none; }
        .ProseMirror .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; background: #3b82f6; pointer-events: none; }
        .ProseMirror.resize-cursor { cursor: col-resize; }
        .ProseMirror img { max-width: 100%; height: auto; }
        .ProseMirror img.ProseMirror-selectednode { outline: 2px solid #3b82f6; }
        .ProseMirror code { background: #f3f4f6; border-radius: 4px; padding: 0.15em 0.4em; font-size: 0.9em; }
        .ProseMirror pre code { background: none; padding: 0; }
      `}</style>

      {/* Toolbar — hidden while in HTML source mode, replaced by a minimal Apply/Cancel bar */}
      {!sourceMode ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 p-1.5 sm:p-2">
          <ToolbarSelect
            title="Paragraph style"
            value={currentParagraphType}
            onChange={handleParagraphTypeChange}
            options={[
              { label: 'Paragraph', value: 'p' },
              { label: 'Heading 1', value: 'h1' },
              { label: 'Heading 2', value: 'h2' },
              { label: 'Heading 3', value: 'h3' },
              { label: 'Heading 4', value: 'h4' },
            ]}
          />

          <ToolbarSelect
            title="Font family"
            value={editor.getAttributes('textStyle').fontFamily || ''}
            onChange={(val) =>
              val
                ? editor.chain().focus().setFontFamily(val).run()
                : editor.chain().focus().unsetFontFamily().run()
            }
            options={FONT_FAMILIES}
            className="w-24 sm:w-28"
          />

          <ToolbarSelect
            title="Font size"
            value={editor.getAttributes('textStyle').fontSize || ''}
            onChange={(val) =>
              val ? editor.chain().focus().setFontSize(val).run() : editor.chain().focus().unsetFontSize().run()
            }
            options={FONT_SIZES}
            className="w-16 sm:w-20"
          />

          <Divider />

          <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <IconBold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <IconItalic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <IconUnderline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <IconStrike className="h-4 w-4" />
          </ToolbarButton>
          {/* ← added: inline code mark — the extension was already loaded via
              StarterKit, it just had no toolbar button before */}
          <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <IconCode className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <label title="Text color" className="flex cursor-pointer items-center gap-1 px-1">
            <IconPalette className="h-4 w-4 text-gray-600" />
            <input
              type="color"
              className="h-6 w-6 cursor-pointer border-0 p-0"
              value={editor.getAttributes('textStyle').color || '#000000'}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            />
          </label>
          <label title="Highlight" className="flex cursor-pointer items-center gap-1 px-1">
            <IconHighlighter className="h-4 w-4 text-gray-600" />
            <input
              type="color"
              className="h-6 w-6 cursor-pointer border-0 p-0"
              defaultValue="#fff59d"
              onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
            />
          </label>
          <ToolbarButton
            label="Clear formatting"
            onClick={() => editor.chain().focus().unsetAllMarks().unsetHighlight().run()}
          >
            <IconEraser className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <IconAlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <IconAlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <IconAlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
            <IconAlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <IconListBullet className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <IconListNumber className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <IconQuote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <IconTerminal className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
            <IconLink className="h-4 w-4" />
          </ToolbarButton>
          <label
            title="Insert image"
            className={`flex h-8 w-8 items-center justify-center rounded text-gray-700 hover:bg-gray-100 ${
              onImageUpload ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
            }`}
          >
            <IconImage className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!onImageUpload}
              onChange={handleImagePick}
            />
          </label>
          <ToolbarButton
            label="Insert table"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <IconTable className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <IconMinus className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
            <IconUndo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
            <IconRedo className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* ← added: view/edit raw HTML */}
          <ToolbarButton label="View / edit HTML" onClick={openSourceMode}>
            <IconCodeXml className="h-4 w-4" />
          </ToolbarButton>
          {/* ← added: distraction-free fullscreen writing */}
          <ToolbarButton label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} active={fullscreen} onClick={() => setFullscreen((v) => !v)}>
            {fullscreen ? <IconMinimize className="h-4 w-4" /> : <IconMaximize className="h-4 w-4" />}
          </ToolbarButton>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 border-b border-gray-300 bg-gray-50 p-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <IconCodeXml className="h-4 w-4 text-[#1B5E4F]" />
            Editing raw HTML
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={cancelSource}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              <IconX className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={applySource}
              className="flex cursor-pointer items-center gap-1 rounded-md bg-[#1B5E4F] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#154A3F]"
            >
              <IconCheck className="h-3.5 w-3.5" />
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Table tools: only shown while the cursor is inside a table, and not in source mode */}
      {inTable && !sourceMode && (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 px-2 py-1.5">
          <span className="mr-1 text-xs text-gray-500">Table:</span>
          <ToolbarActionButton label="Add row" icon={IconRowPlus} onClick={() => editor.chain().focus().addRowAfter().run()} />
          <ToolbarActionButton label="Add column" icon={IconColumnPlus} onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <ToolbarActionButton label="Delete row" icon={IconRowMinus} onClick={() => editor.chain().focus().deleteRow().run()} />
          <ToolbarActionButton label="Delete column" icon={IconColumnMinus} onClick={() => editor.chain().focus().deleteColumn().run()} />
          <ToolbarActionButton label="Header row" icon={IconHeaderRow} onClick={() => editor.chain().focus().toggleHeaderRow().run()} />
          <ToolbarActionButton label="Delete table" icon={IconTrash} tone="danger" onClick={() => editor.chain().focus().deleteTable().run()} />
        </div>
      )}

      {/* Editable content area — swaps to a raw HTML textarea in source mode */}
      {sourceMode ? (
        <textarea
          value={sourceDraft}
          onChange={(e) => setSourceDraft(e.target.value)}
          spellCheck={false}
          className={`w-full resize-none border-0 bg-gray-900 p-4 font-mono text-sm text-gray-100 outline-none ${
            fullscreen ? 'flex-1' : 'min-h-[350px]'
          }`}
        />
      ) : (
        <div className={fullscreen ? 'flex-1 overflow-y-auto' : ''}>
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  )
}

function IconBold(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
    </svg>
  )
}
function IconItalic(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  )
}
function IconUnderline(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3v7a6 6 0 0 0 12 0V3" /><line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  )
}
function IconStrike(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M16 6c-.5-1.5-2-2.5-4-2.5-2.5 0-4.5 1.3-4.5 3.2 0 1.6 1.2 2.4 3 2.8" />
      <path d="M8 18c.5 1.5 2.2 2.5 4.3 2.5 2.5 0 4.5-1.3 4.5-3.3 0-1-.5-1.8-1.5-2.4" />
    </svg>
  )
}
function IconCode(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
function IconTerminal(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}
function IconCodeXml(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 16 22 12 18 8" /><polyline points="6 8 2 12 6 16" /><line x1="14.5" y1="4" x2="9.5" y2="20" />
    </svg>
  )
}
function IconPalette(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2a10 9 0 1 0 0 18c1 0 1.5-.5 1.5-1.5 0-.5-.3-.9-.5-1.3-.2-.4-.5-.8-.5-1.2 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-5-4.5-7.5-9-7.5Z" />
    </svg>
  )
}
function IconHighlighter(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 11-6 6v3h3l6-6" /><path d="m22 2-7.5 7.5L17 12l7.5-7.5z" /><path d="m14.5 9.5 3 3" />
    </svg>
  )
}
function IconEraser(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l5.7 5.7a1 1 0 0 1 0 1.4L13 18" />
      <path d="M22 21H7" /><path d="m5 11 9 9" />
    </svg>
  )
}
function IconAlignLeft(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  )
}
function IconAlignCenter(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  )
}
function IconAlignRight(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  )
}
function IconAlignJustify(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" />
    </svg>
  )
}
function IconListBullet(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconListNumber(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="6" x2="20" y2="6" /><line x1="10" y1="12" x2="20" y2="12" /><line x1="10" y1="18" x2="20" y2="18" />
      <text x="2" y="8.5" fontSize="6" fill="currentColor" stroke="none">1</text>
      <text x="2" y="14.5" fontSize="6" fill="currentColor" stroke="none">2</text>
      <text x="2" y="20.5" fontSize="6" fill="currentColor" stroke="none">3</text>
    </svg>
  )
}
function IconQuote(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.83v-6.83H4.5a2.67 2.67 0 0 1 2.67-2.67Z" />
      <path d="M17.17 6A5.17 5.17 0 0 0 12 11.17V18h6.83v-6.83H14.5a2.67 2.67 0 0 1 2.67-2.67Z" />
    </svg>
  )
}
function IconLink(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  )
}
function IconImage(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
  )
}
function IconTable(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  )
}
function IconMinus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconUndo(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10h10a5 5 0 0 1 0 10H8" /><polyline points="7 5 3 10 7 15" />
    </svg>
  )
}
function IconRedo(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10H11a5 5 0 0 0 0 10h5" /><polyline points="17 5 21 10 17 15" />
    </svg>
  )
}
function IconMaximize(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}
function IconMinimize(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M8 21v-3a2 2 0 0 0-2-2H3M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  )
}
function IconCheck(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconX(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IconRowPlus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="6" rx="1" /><path d="M12 15v6M9 18h6" />
    </svg>
  )
}
function IconColumnPlus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="6" height="18" rx="1" /><path d="M17 9v6M14 12h6" />
    </svg>
  )
}
function IconRowMinus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="6" rx="1" /><path d="M9 18h6" />
    </svg>
  )
}
function IconColumnMinus(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="6" height="18" rx="1" /><path d="M14 12h6" />
    </svg>
  )
}
function IconHeaderRow(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 9h18" fill="currentColor" />
      <rect x="3" y="3" width="18" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
    </svg>
  )
}
function IconTrash(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}