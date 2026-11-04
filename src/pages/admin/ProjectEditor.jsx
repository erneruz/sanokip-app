// src/pages/admin/ProjectEditor.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import {
  getProjectById,
  createProject,
  updateProject,
  uploadProjectImage,
} from '../../services/projectsService'
import { computeProjectStatus } from '../../utils/projectStatus'
import { slugify } from '../../utils/slugify'

const emptyProject = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  location: '',
  featured: false,
  image_url: null,
}

const STATUS_LABELS = {
  completed: 'Completed',
  ongoing: 'Ongoing',
  upcoming: 'Upcoming',
}

const STATUS_STYLES = {
  completed: 'bg-[#1B5E4F] text-white',
  ongoing: 'bg-blue-600 text-white',
  upcoming: 'bg-gray-100 text-gray-700',
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

export default function ProjectEditor() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const imageInputRef = useRef(null)

  const [form, setForm] = useState(emptyProject)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!isEditing) return
    getProjectById(id).then((project) => {
      setForm({
        title: project.title ?? '',
        description: project.description ?? '',
        start_date: project.start_date ?? '',
        end_date: project.end_date ?? '',
        location: project.location ?? '',
        featured: project.featured ?? false,
        image_url: project.image_url ?? null,
      })
    })
  }, [id, isEditing])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function uploadImageFile(file) {
    if (!file) return
    setUploadingImage(true)
    setError(null)
    try {
      const url = await uploadProjectImage(file)
      updateField('image_url', url)
    } catch (err) {
      console.error('Image upload failed:', err)
      setError('Image upload failed. Please check your connection and try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  function handleImageDrop(e) {
    e.preventDefault()
    setDragActive(false)
    uploadImageFile(e.dataTransfer.files?.[0])
  }

  const previewStatus = form.start_date
    ? computeProjectStatus(form.start_date, form.end_date || null)
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const status = computeProjectStatus(form.start_date, form.end_date || null)
    const year = form.start_date ? new Date(form.start_date).getFullYear().toString() : ''

    const payload = {
      title: form.title,
      description: form.description,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      location: form.location,
      featured: form.featured,
      image_url: form.image_url,
      slug: slugify(form.title),
      status,
      year,
    }

    try {
      if (isEditing) {
        await updateProject(id, payload)
      } else {
        await createProject(payload)
      }
      navigate('/admin/projects')
    } catch (err) {
      console.error('Save failed:', err)
      setError('Unable to save this project. Please try again.')
      setSaving(false)
    }
  }

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-[#1B5E4F] focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]/20'

  return (
    <main className="px-16 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-3.5 border-b border-gray-200 pb-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
            <IconFolder className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {isEditing ? 'Edit Project' : 'New Project'}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-gray-500">
              {isEditing
                ? 'Update the details below and save — changes reflect on the Projects page right away.'
                : 'Add a field project to showcase Peakstar\'s work — status is calculated automatically from the dates.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <FieldLabel icon={IconDocument}>Title</FieldLabel>
            <input
              type="text"
              required
              placeholder="e.g. Agricultural Land Suitability & GIS Analysis"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={inputClass}
            />

            <div className="mt-5">
              <FieldLabel icon={IconAlignLeft}>Description</FieldLabel>
              <div className="mt-1.5 overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-[#1B5E4F] focus-within:ring-2 focus-within:ring-[#1B5E4F]/20">
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={(value) => updateField('description', value)}
                  modules={QUILL_MODULES}
                  placeholder="Write the full project description here — this shows in full, with real formatting, when someone opens the project."
                  className="[&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[160px]"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Shown trimmed on the project card; shown in full, with your formatting, when someone opens the project.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel icon={IconCalendar}>Start Date</FieldLabel>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(e) => updateField('start_date', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel icon={IconCalendar}>End Date</FieldLabel>
                <input
                  type="date"
                  value={form.end_date}
                  min={form.start_date || undefined}
                  onChange={(e) => updateField('end_date', e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-gray-400">Leave blank if the project is ongoing with no set end date.</p>
              </div>
            </div>

            {previewStatus && (
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
                <IconSparkle className="h-4 w-4 shrink-0 text-gray-400" />
                Status will be:
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[previewStatus]}`}>
                  {STATUS_LABELS[previewStatus]}
                </span>
                <span className="text-xs text-gray-400">(calculated automatically from the dates)</span>
              </div>
            )}

            <div className="mt-5">
              <FieldLabel icon={IconMapPin}>Location</FieldLabel>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g. Kigali, Rwanda"
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <FieldLabel icon={IconImage}>Project Image</FieldLabel>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleImageDrop}
              onClick={() => !uploadingImage && imageInputRef.current?.click()}
              className={
                'mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed text-center transition ' +
                (dragActive
                  ? 'border-[#1B5E4F] bg-[#EAF5F1]'
                  : 'border-gray-300 bg-gray-50 hover:border-[#1B5E4F]/60 hover:bg-[#EAF5F1]/50')
              }
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => uploadImageFile(e.target.files?.[0])}
                className="hidden"
              />

              {form.image_url ? (
                <div className="relative w-full">
                  <img src={form.image_url} alt="Project preview" className="h-56 w-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-3">
                    <span className="rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                      {uploadingImage ? 'Uploading…' : 'Drop or click to replace'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateField('image_url', null)
                        if (imageInputRef.current) imageInputRef.current.value = ''
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                      aria-label="Remove image"
                      title="Remove"
                    >
                      <IconX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 px-6 py-10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF5F1] text-[#1B5E4F]">
                    {uploadingImage ? (
                      <IconSpinner className="h-5 w-5 animate-spin" />
                    ) : (
                      <IconImage className="h-5 w-5" />
                    )}
                  </span>
                  <p className="text-sm font-medium text-gray-700">
                    {uploadingImage ? (
                      'Uploading…'
                    ) : (
                      <>Drag & drop an image here, or <span className="text-[#1B5E4F] underline">browse</span></>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, or WEBP — shown as the project's cover image</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <FieldLabel icon={IconStar}>Visibility</FieldLabel>
            <button
              type="button"
              onClick={() => updateField('featured', !form.featured)}
              className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:bg-gray-50"
            >
              <span>
                <span className="block text-sm font-medium text-gray-900">Feature this project</span>
                <span className="block text-xs text-gray-500">Shown in the highlighted section of the Projects page</span>
              </span>
              <span
                className={
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ' +
                  (form.featured ? 'bg-[#1B5E4F]' : 'bg-gray-300')
                }
              >
                <span
                  className={
                    'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition ' +
                    (form.featured ? 'translate-x-6' : 'translate-x-1')
                  }
                />
              </span>
            </button>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <IconAlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <IconSpinner className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <IconCheckCircle className="h-4 w-4" />
                  {isEditing ? 'Save Changes' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

function IconFolder(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />
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
function IconAlignLeft(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
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
function IconMapPin(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function IconImage(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
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
function IconStar(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconSparkle(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
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