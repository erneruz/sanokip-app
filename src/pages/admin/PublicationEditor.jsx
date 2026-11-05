// src/pages/admin/PublicationEditor.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import {
  getPublicationById,
  createPublication,
  updatePublication,
  uploadPublicationFile,
  removePublicationFile,
} from '../../services/publicationsService'
import {
  PUBLICATION_CATEGORIES,
  ACCEPTED_FILE_TYPES,
  getCategory,
} from '../../constants/publications'

const emptyForm = {
  title: '',
  description: '',
  category: '',
  subtype: '',
  authors: '',
  publication_date: new Date().toISOString().slice(0, 10),
  status: 'draft',
}

const FILE_TYPES = {
  pdf: { color: '#DC2626', label: 'PDF' },
  doc: { color: '#2563EB', label: 'DOC' },
  docx: { color: '#2563EB', label: 'DOCX' },
  xls: { color: '#15803D', label: 'XLS' },
  xlsx: { color: '#15803D', label: 'XLSX' },
  ppt: { color: '#D97706', label: 'PPT' },
  pptx: { color: '#D97706', label: 'PPTX' },
  csv: { color: '#15803D', label: 'CSV' },
  txt: { color: '#64748B', label: 'TXT' },
  zip: { color: '#9333EA', label: 'ZIP' },
  json: { color: '#D97706', label: 'JSON' },
  geojson: { color: '#D97706', label: 'GEOJSON' },
  kml: { color: '#0891B2', label: 'KML' },
  kmz: { color: '#0891B2', label: 'KMZ' },
}

function getFileMeta(name) {
  const ext = (name?.split('.').pop() || '').toLowerCase()
  return FILE_TYPES[ext] || { color: '#64748B', label: ext ? ext.toUpperCase() : 'FILE' }
}

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
}

function FieldLabel({ icon: Icon, children }) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
      <Icon className="h-4 w-4 text-[#1B5E4F]" />
      {children}
    </label>
  )
}

export default function PublicationEditor() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [existingFile, setExistingFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!isEditing) return
    getPublicationById(id)
      .then((p) => {
        setForm({
          title: p.title ?? '',
          description: p.description ?? '',
          category: p.category ?? '',
          subtype: p.subtype ?? '',
          authors: p.authors ?? '',
          publication_date: p.publication_date ?? '',
          status: p.status ?? 'draft',
        })
        setExistingFile({ file_name: p.file_name, file_path: p.file_path })
      })
      .catch((err) => {
        console.error('Failed to load publication:', err)
        setError('Unable to load this publication.')
      })
  }, [id, isEditing])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleCategoryChange(value) {
    setForm((prev) => ({ ...prev, category: value, subtype: '' }))
  }

  function pickFile(selected) {
    if (!selected) return
    setFile(selected)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!isEditing && !file) {
      setError('Please choose a file to upload.')
      return
    }

    setSaving(true)
    let uploaded = null

    try {
      if (file) uploaded = await uploadPublicationFile(file)

      const payload = {
        ...form,
        subtype: form.subtype || null,
        publication_date: form.publication_date || null,
        ...(uploaded || {}),
      }

      if (isEditing) {
        await updatePublication(id, payload)
        if (uploaded && existingFile?.file_path) {
          await removePublicationFile(existingFile.file_path)
        }
      } else {
        await createPublication(payload)
      }

      navigate('/admin/publications')
    } catch (err) {
      console.error('Save failed:', err)
      if (uploaded) await removePublicationFile(uploaded.file_path)
      setError('Unable to save this publication. Please try again.')
      setSaving(false)
    }
  }

  const subtypes = getCategory(form.category)?.subtypes ?? []
  const inputClass =
    'mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-[#1B5E4F] focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]/20'

  const activeFileName = file?.name ?? existingFile?.file_name ?? null
  const activeFileMeta = activeFileName ? getFileMeta(activeFileName) : null

  return (
    // ← changed: padding scales down on small screens instead of fixed px-16 py-12
    <main className="px-4 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-3.5 border-b border-gray-200 pb-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
            <IconBook className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {isEditing ? 'Edit Publication' : 'New Publication'}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-gray-500">
              {isEditing
                ? "Update the details below and save — changes go live as soon as you publish."
                : 'Add a report, paper, or reference document for clients and the public to find.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-7">
          {/* ← changed: card padding scales down on small screens (p-4) up to the previous p-6 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <FieldLabel icon={IconDocument}>Title</FieldLabel>
            <input
              type="text"
              required
              placeholder="e.g. National Spatial Data Infrastructure Strategy 2026"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={inputClass}
            />

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel icon={IconTag}>Category</FieldLabel>
                <select
                  required
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>Select a category</option>
                  {PUBLICATION_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel icon={IconLayers}>Type</FieldLabel>
                <select
                  value={form.subtype}
                  onChange={(e) => updateField('subtype', e.target.value)}
                  disabled={!form.category}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
                >
                  <option value="">— None —</option>
                  {subtypes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel icon={IconAlignLeft}>Description</FieldLabel>
              {/* ← added: overflow-x-auto safety net so the Quill toolbar scrolls
                  horizontally instead of breaking layout on very narrow phones */}
              <div className="mt-1.5 overflow-x-auto rounded-lg border border-gray-300 shadow-sm focus-within:border-[#1B5E4F] focus-within:ring-2 focus-within:ring-[#1B5E4F]/20">
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={(value) => updateField('description', value)}
                  modules={QUILL_MODULES}
                  placeholder="Give readers a short, clear summary of what this document covers…"
                  className="min-w-[280px] [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[140px]"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel icon={IconUser}>Authors / Organization</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Infrastructure"
                  value={form.authors}
                  onChange={(e) => updateField('authors', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel icon={IconCalendar}>Publication date</FieldLabel>
                <input
                  type="date"
                  value={form.publication_date}
                  onChange={(e) => updateField('publication_date', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ← changed: card padding scales down on small screens */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <FieldLabel icon={IconUpload}>Document File</FieldLabel>

            {/* ← changed: dropzone padding tightens on small screens (px-4 py-6) up to the
                previous px-6 py-8, so it doesn't eat the whole screen on a phone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={
                'mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition sm:px-6 sm:py-8 ' +
                (dragActive
                  ? 'border-[#1B5E4F] bg-[#EAF5F1]'
                  : 'border-gray-300 bg-gray-50 hover:border-[#1B5E4F]/60 hover:bg-[#EAF5F1]/50')
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={(e) => pickFile(e.target.files?.[0])}
                className="hidden"
              />

              {activeFileName ? (
                <>
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${activeFileMeta.color}1A` }}
                  >
                    <IconFile className="h-5 w-5" style={{ color: activeFileMeta.color }} />
                  </span>
                  <p className="max-w-full truncate text-sm font-medium text-gray-900">{activeFileName}</p>
                  <p className="text-xs text-gray-500">
                    {file ? 'Ready to upload' : 'Current file — drop or click to replace'}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                      if (!isEditing) setExistingFile(null)
                    }}
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <IconX className="h-3 w-3" />
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF5F1] text-[#1B5E4F]">
                    <IconUpload className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium text-gray-700">
                    Drag & drop a file here, or <span className="text-[#1B5E4F] underline">browse</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, Word, Excel, CSV, PowerPoint, TXT, ZIP, JSON, GeoJSON, KML/KMZ
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ← changed: card padding scales down on small screens */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <FieldLabel icon={IconFlag}>Status</FieldLabel>
            <div className="mt-2 inline-flex w-full rounded-lg bg-gray-100 p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => updateField('status', 'draft')}
                className={
                  form.status === 'draft'
                    ? 'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-white px-4 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition sm:flex-none'
                    : 'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700 sm:flex-none'
                }
              >
                <IconEdit className="h-3.5 w-3.5" />
                Draft
              </button>
              <button
                type="button"
                onClick={() => updateField('status', 'published')}
                className={
                  form.status === 'published'
                    ? 'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#1B5E4F] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition sm:flex-none'
                    : 'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700 sm:flex-none'
                }
              >
                <IconCheckCircle className="h-3.5 w-3.5" />
                Published
              </button>
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <IconAlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            {/* ← changed: full-width on mobile for an easier tap target, auto-width from sm: up */}
            <button
              type="submit"
              disabled={saving}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? (
                <>
                  <IconSpinner className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <IconCheckCircle className="h-4 w-4" />
                  {isEditing ? 'Save Changes' : 'Publish'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

function IconBook(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  )
}
function IconDocument(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}
function IconTag(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.17L4 3a1 1 0 0 0-1 1l.17 5.59a2 2 0 0 0 .66 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83Z" />
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconLayers(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
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
function IconUser(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IconCalendar(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconUpload(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
function IconFile(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}
function IconX(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function IconFlag(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}
function IconEdit(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}
function IconCheckCircle(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
function IconAlertCircle(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function IconSpinner(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M12 2a10 10 0 1 0 10 10" />
    </svg>
  )
}