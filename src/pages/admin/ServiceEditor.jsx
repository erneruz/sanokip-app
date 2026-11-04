// src/pages/admin/ServiceEditor.jsx
import { useState } from 'react'
import {
  createService,
  updateService,
  uploadServiceImage,
} from '../../services/servicesService'

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

export default function ServiceEditor({ service, serviceLines, onClose, onSaved }) {
  const isEditing = !!service

  const [form, setForm] = useState({
    name: service?.name ?? '',
    description: service?.description ?? '',
    service_line_id: service?.service_line_id ?? serviceLines[0]?.id ?? '',
    image_url: service?.image_url ?? '',
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(service?.image_url ?? null)
  const [imageError, setImageError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError(
        `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Please choose an image under 2 MB.`
      )
      e.target.value = ''
      return
    }

    setImageError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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
        description: form.description.trim(),
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Service' : 'New Service'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Picture */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Picture
            </label>

            {imagePreview ? (
              <div className="relative mb-3 overflow-hidden rounded-md h-40">
                <img
                  src={imagePreview}
                  alt="Service preview"
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    setImageError(null)
                    setForm({ ...form, image_url: '' })
                  }}
                  className="absolute flex items-center justify-center w-7 h-7 text-gray-700 bg-white rounded-full shadow top-2 right-2 hover:text-red-600"
                  aria-label="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center mb-3 bg-gray-50 border border-dashed border-gray-300 rounded-md h-40">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5l4.72-4.72a1.5 1.5 0 012.12 0l2.72 2.72m0 0l2.47-2.47a1.5 1.5 0 012.12 0L21 16.5M3 7.5h18M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5m-18 0v9A1.5 1.5 0 004.5 18h15a1.5 1.5 0 001.5-1.5v-9"
                  />
                </svg>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="mt-1 text-xs text-gray-400">Maximum file size: 2 MB.</p>
            {imageError && (
              <p className="mt-1 text-xs font-medium text-red-600">{imageError}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Title of the service
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
              placeholder="e.g. Base Maps"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={form.service_line_id}
              onChange={(e) => setForm({ ...form, service_line_id: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 leading-relaxed border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-[#1B5E4F]"
              placeholder="Describe the service — what it covers, how it's delivered, and who it's for. Leave a blank line between paragraphs."
            />
            <p className="mt-1 text-xs text-gray-400">
              {form.description?.length ?? 0} characters — line breaks and blank lines are preserved on the public page.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 bg-[#1B5E4F] hover:bg-[#154A3F]"
            >
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}