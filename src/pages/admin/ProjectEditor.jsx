// src/pages/admin/ProjectEditor.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getProjectById,
  createProject,
  updateProject,
  uploadProjectImage,
} from '../../services/projectsService'
import { slugify } from '../../utils/slugify'

const emptyProject = {
  title: '',
  summary: '',
  status: 'ongoing',
  location: '',
  year: '',
  featured: false,
  image_url: null,
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
        summary: project.summary ?? '',
        status: project.status ?? 'ongoing',
        location: project.location ?? '',
        year: project.year ?? '',
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
    try {
      const url = await uploadProjectImage(file)
      updateField('image_url', url)
    } catch (err) {
      console.error('Image upload failed:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      slug: slugify(form.title),
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Summary</label>
          <textarea
            rows={4}
            required
            value={form.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="text"
              value={form.year}
              onChange={(e) => updateField('year', e.target.value)}
              placeholder="e.g. 2026"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

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