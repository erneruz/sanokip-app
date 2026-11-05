// src/pages/admin/ServiceEditor.jsx
import { useState, useRef } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import {
  createService,
  updateService,
  uploadServiceImage,
} from '../../services/servicesService'
import { normalizeHtml, htmlToPlainText } from '../../utils/richText'

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

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

export default function ServiceEditor({ service, serviceLines, onClose, onSaved }) {
  const isEditing = !!service
  const imageInputRef = useRef(null)

  const [form, setForm] = useState({
    name: service?.name ?? '',
    description: service?.description ?? '',
    service_line_id: service?.service_line_id ?? serviceLines[0]?.id ?? '',
    image_url: service?.image_url ?? '',
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(service?.image_url ?? null)
  const [imageError, setImageError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function pickImage(file) {
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError(
        `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Please choose an image under 2 MB.`
      )
      return
    }

    setImageError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleImageInputChange(e) {
    pickImage(e.target.files?.[0])
    e.target.value = ''
  }

  function handleImageDrop(e) {
    e.preventDefault()
    setDragActive(false)
    pickImage(e.dataTransfer.files?.[0])
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setImageError(null)
    setForm((prev) => ({ ...prev, image_url: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (imageFile && imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError('Please choose an image under 2 MB before saving.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      let imageUrl = form.image_url

      if (imageFile) {
        imageUrl = await uploadServiceImage(imageFile)
      }

      const payload = {
        name: form.name.trim(),
        // ← fixed from the start: Quill saves every space as &nbsp;, which has no
        // line-wrap point and overflows text containers — normalize before saving
        description: normalizeHtml(form.description),
        service_line_id: form.service_line_id,
        image_url: imageUrl || null,
      }

      if (!payload.name) {
        throw new Error('Title is required.')
      }
      if (!payload.service_line_id) {
        throw new Error('Please choose a category.')
      }

      if (isEditing) {
        await updateService(service.id, payload)
      } else {
        await createService(payload)
      }

      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-[#1B5E4F] focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]/20'

  const descriptionLength = htmlToPlainText(form.description).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
              <IconWrench className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Service' : 'New Service'}
              </h2>
              <p className="truncate text-xs text-gray-500">
                {isEditing ? 'Update the details and save your changes.' : 'Add a service under an existing category.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {error && (
            <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Picture */}
          <div>
            <FieldLabel icon={IconImage}>Picture</FieldLabel>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleImageDrop}
              onClick={() => !imagePreview && imageInputRef.current?.click()}
              className={
                'mt-2 overflow-hidden rounded-xl border-2 border-dashed transition ' +
                (dragActive
                  ? 'border-[#1B5E4F] bg-[#EAF5F1]'
                  : 'border-gray-300 bg-gray-50 hover:border-[#1B5E4F]/60 hover:bg-[#EAF5F1]/50')
              }
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageInputChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative h-40 w-full sm:h-44">
                  <img src={imagePreview} alt="Service preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent p-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        imageInputRef.current?.click()
                      }}
                      className="cursor-pointer rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/75"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage()
                      }}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                      aria-label="Remove image"
                      title="Remove"
                    >
                      <IconX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex cursor-pointer flex-col items-center justify-center gap-2 px-4 py-8 text-center sm:px-6 sm:py-10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF5F1] text-[#1B5E4F]">
                    <IconUpload className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium text-gray-700">
                    Drag & drop an image here, or <span className="text-[#1B5E4F] underline">browse</span>
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, or WEBP — maximum 2 MB</p>
                </div>
              )}
            </div>
            {imageError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                <IconAlertCircle className="h-3.5 w-3.5 shrink-0" />
                {imageError}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <FieldLabel icon={IconTag}>Title of the service</FieldLabel>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={inputClass}
              placeholder="e.g. Base Maps"
              required
            />
          </div>

          {/* Category */}
          <div>
            <FieldLabel icon={IconLayers}>Category</FieldLabel>
            <select
              value={form.service_line_id}
              onChange={(e) => updateField('service_line_id', e.target.value)}
              className={`${inputClass} bg-white`}
              required
            >
              {serviceLines.length === 0 && <option value="">No categories yet</option>}
              {serviceLines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <FieldLabel icon={IconAlignLeft}>Description</FieldLabel>
            {/* ← added: overflow-x-auto safety net so the Quill toolbar scrolls instead
                of breaking layout on a narrow phone */}
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-gray-300 shadow-sm focus-within:border-[#1B5E4F] focus-within:ring-2 focus-within:ring-[#1B5E4F]/20">
              <ReactQuill
                theme="snow"
                value={form.description}
                onChange={(value) => updateField('description', value)}
                modules={QUILL_MODULES}
                placeholder="Describe the service — what it covers, how it's delivered, and who it's for."
                className="min-w-[260px] [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[160px]"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              {descriptionLength} characters — shown with full formatting on the public page.
            </p>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1B5E4F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
          >
            {saving ? (
              <>
                <IconSpinner className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <IconCheckCircle className="h-4 w-4" />
                {isEditing ? 'Save changes' : 'Create service'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function IconWrench(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26" />
    </svg>
  )
}
function IconTag(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
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
function IconImage(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5l4.72-4.72a1.5 1.5 0 012.12 0l2.72 2.72m0 0l2.47-2.47a1.5 1.5 0 012.12 0L21 16.5M3 7.5h18M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5m-18 0v9A1.5 1.5 0 004.5 18h15a1.5 1.5 0 001.5-1.5v-9"
      />
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
function IconX(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
function IconCheckCircle(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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