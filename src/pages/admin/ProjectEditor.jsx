// src/pages/admin/ProjectEditor.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  description: '', // ← changed: was summary
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
  completed: 'bg-gray-900 text-white',
  ongoing: 'bg-blue-600 text-white',
  upcoming: 'bg-gray-100 text-gray-700',
}

export default function ProjectEditor() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyProject)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEditing) return
    getProjectById(id).then((project) => {
      setForm({
        title: project.title ?? '',
        description: project.description ?? '', // ← changed: was project.summary
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

  async function handleImageUpload(e) {
    const file = e.target.files[0]
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
      description: form.description, // ← changed: was summary: form.summary
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">{isEditing ? 'Edit Project' : 'New Project'}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {/* ── changed: Summary → Description, with guidance on paragraph breaks ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={8}
            required
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Write the full project description here. Leave a blank line between paragraphs — this is how they'll be separated on the project's detail view."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-400">
            Shown trimmed on the project card; shown in full, with paragraph spacing, when someone opens the project.
          </p>
        </div>
        {/* ──────────────────────────────────────────────────────────────────── */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => updateField('start_date', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={form.end_date}
              min={form.start_date || undefined}
              onChange={(e) => updateField('end_date', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-gray-400">Leave blank if the project is ongoing with no set end date.</p>
          </div>
        </div>

        {previewStatus && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            Status will be:
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[previewStatus]}`}>
              {STATUS_LABELS[previewStatus]}
            </span>
            <span className="text-xs text-gray-400">(calculated automatically from the dates)</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="e.g. Kigali, Rwanda"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Image</label>
          {form.image_url && (
            <img src={form.image_url} alt="Preview" className="mt-2 h-40 w-auto rounded-md object-cover" />
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" />
          {uploadingImage && <p className="mt-1 text-sm text-gray-500">Uploading…</p>}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => updateField('featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Feature this project on the Projects page
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="cursor-pointer rounded-md bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Project'}
        </button>
      </form>
    </main>
  )
}