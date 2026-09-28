import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function PublicationEditor() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [existingFile, setExistingFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
        // Replaced the file? Remove the old one.
        if (uploaded && existingFile?.file_path) {
          await removePublicationFile(existingFile.file_path)
        }
      } else {
        await createPublication(payload)
      }

      navigate('/admin/publications')
    } catch (err) {
      console.error('Save failed:', err)
      // Clean up the just-uploaded file if the database save failed
      if (uploaded) await removePublicationFile(uploaded.file_path)
      setError('Unable to save this publication. Please try again.')
      setSaving(false)
    }
  }

  const subtypes = getCategory(form.category)?.subtypes ?? []
  const inputClass = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2'
  const labelClass = 'block text-sm font-medium text-gray-700'

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold">{isEditing ? 'Edit Publication' : 'New Publication'}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
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
            <label className={labelClass}>Type</label>
            <select
              value={form.subtype}
              onChange={(e) => updateField('subtype', e.target.value)}
              disabled={!form.category}
              className={`${inputClass} disabled:bg-gray-100`}
            >
              <option value="">— None —</option>
              {subtypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Authors / Organization</label>
            <input
              type="text"
              value={form.authors}
              onChange={(e) => updateField('authors', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Publication date</label>
            <input
              type="date"
              value={form.publication_date}
              onChange={(e) => updateField('publication_date', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>File</label>
          {isEditing && existingFile && !file && (
            <p className="mt-1 text-sm text-gray-500">
              Current file: {existingFile.file_name} (choose a new file below to replace it)
            </p>
          )}
          <input
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2"
          />
          <p className="mt-1 text-xs text-gray-400">
            PDF, Word, Excel, CSV, PowerPoint, TXT, ZIP, JSON, GeoJSON, KML/KMZ.
          </p>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-md bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Publish'}
        </button>
      </form>
    </main>
  )
}