// src/components/RichTextEditor.jsx
import { useEffect } from 'react'
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

function ToolbarButton({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`cursor-pointer px-2 py-1 rounded text-sm font-medium transition-colors
        ${active ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function ToolbarSelect({ value, onChange, options, title, className = '' }) {
  return (
    <select
      title={title}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-sm border border-gray-300 rounded px-1.5 py-1 bg-white text-gray-700 ${className}`}
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
  return <div className="w-px self-stretch bg-gray-300 mx-1" />
}

export default function RichTextEditor({ value, onChange, onImageUpload }) {
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
    <div className="rounded-md border border-gray-300 overflow-hidden">
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
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 p-2">
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
          className="w-28"
        />

        <ToolbarSelect
          title="Font size"
          value={editor.getAttributes('textStyle').fontSize || ''}
          onChange={(val) =>
            val ? editor.chain().focus().setFontSize(val).run() : editor.chain().focus().unsetFontSize().run()
          }
          options={FONT_SIZES}
          className="w-20"
        />

        <Divider />

        <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        <label title="Text color" className="flex items-center gap-1 px-1 cursor-pointer">
          <span className="text-sm">A</span>
          <input
            type="color"
            className="h-6 w-6 p-0 border-0 cursor-pointer"
            value={editor.getAttributes('textStyle').color || '#000000'}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>
        <label title="Highlight" className="flex items-center gap-1 px-1 cursor-pointer">
          <span className="text-sm">🖍</span>
          <input
            type="color"
            className="h-6 w-6 p-0 border-0 cursor-pointer"
            defaultValue="#fff59d"
            onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
          />
        </label>
        <ToolbarButton
          label="Clear formatting"
          onClick={() => editor.chain().focus().unsetAllMarks().unsetHighlight().run()}
        >
          Clear
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          ≡L
        </ToolbarButton>
        <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          ≡C
        </ToolbarButton>
        <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          ≡R
        </ToolbarButton>
        <ToolbarButton label="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          ≡J
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          " Quote
        </ToolbarButton>
        <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {'</>'}
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
          Link
        </ToolbarButton>
        <label
          className={`px-2 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 ${
            onImageUpload ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
          }`}
        >
          Image
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
          Table
        </ToolbarButton>
        <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </ToolbarButton>
      </div>

      {/* Table tools: only shown while the cursor is inside a table */}
      {inTable && (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 px-2 py-1.5">
          <span className="mr-1 text-xs text-gray-500">Table:</span>
          <ToolbarButton label="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}>
            + Row
          </ToolbarButton>
          <ToolbarButton label="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            + Column
          </ToolbarButton>
          <ToolbarButton label="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
            − Row
          </ToolbarButton>
          <ToolbarButton label="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
            − Column
          </ToolbarButton>
          <ToolbarButton label="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
            Header row
          </ToolbarButton>
          <ToolbarButton label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
            Delete table
          </ToolbarButton>
        </div>
      )}

      {/* Editable content area */}
      <EditorContent editor={editor} />
    </div>
  )
}
