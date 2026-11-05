// src/pages/admin/PostEditor.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import RichTextEditor from '../../components/RichTextEditor'
import {
  getPostById,
  createPost,
  updatePost,
  uploadCoverImage,
} from '../../services/postsService'
import { getCategories } from '../../services/categoriesService'
import { slugify } from '../../utils/slugify'

const emptyPost = {
  title: '',
  excerpt: '',
  content: '',
  category_id: '',
  author_id: null,
  status: 'draft',
  cover_image_url: null,
  published_at: null,
}

function FieldLabel({ icon: Icon, children }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
      <Icon className="h-4 w-4 text-[#1B5E4F]" />
      {children}
    </label>
  )
}

export default function PostEditor() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState(emptyPost)
  const [categories, setCategories] = useState([])
  const [uploadingCover, setUploadingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false) // ← added
  const fileInputRef = useRef(null) // ← added

  useEffect(() => {
    getCategories().then(setCategories).catch((err) => console.error('Failed to load categories:', err))
  }, [])

  useEffect(() => {
    if (!isEditing) return
    getPostById(id).then((post) => {
      setForm({
        title: post.title ?? '',
        excerpt: post.excerpt ?? '',
        content: post.content ?? '',
        category_id: post.category_id ?? '',
        author_id: post.author_id ?? null,
        status: post.status ?? 'draft',
        cover_image_url: post.cover_image_url ?? null,
        published_at: post.published_at ?? null,
      })
    })
  }, [id, isEditing])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // ← added: shared upload path for both the file input and drag-and-drop,
  // same upload call and same loading/error handling as the original
  async function uploadCoverFile(file) {
    if (!file) return
    setUploadingCover(true)
    try {
      const url = await uploadCoverImage(file)
      updateField('cover_image_url', url)
    } catch (err) {
      console.error('Cover upload failed:', err)
    } finally {
      setUploadingCover(false)
    }
  }

  function handleCoverUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    uploadCoverFile(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadCoverFile(file)
  }

  async function handleEditorImageUpload(file) {
    return uploadCoverImage(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      slug: slugify(form.title),
      author_id: isEditing ? form.author_id : user.id,
      published_at:
        form.status === 'published'
          ? form.published_at ?? new Date().toISOString()
          : null,
    }

    try {
      if (isEditing) {
        await updatePost(id, payload)
      } else {
        await createPost(payload)
      }
      navigate('/admin')
    } catch (err) {
      console.error('Save failed:', err)
      setError('Unable to save this post. Please try again.')
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Header — ← changed: icon badge + title/subtitle + back link, matching
          the other editors instead of a bare <h1> */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
            <IconDocument className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              {isEditing ? 'Update the article and its details below.' : 'Write a new article for the Peakstar blog.'}
            </p>
          </div>
        </div>

        <Link
          to="/admin/posts"
          className="flex shrink-0 items-center gap-1.5 self-start rounded-md border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to Posts
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel icon={IconType}>Title</FieldLabel>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. GIS in Land Administration"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F]"
              />
            </div>

            <div>
              <FieldLabel icon={IconLayers}>Category</FieldLabel>
              <select
                required
                value={form.category_id}
                onChange={(e) => updateField('category_id', e.target.value)}
                className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F]"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <FieldLabel icon={IconAlignLeft}>Excerpt</FieldLabel>
              <span className="mb-1.5 text-xs text-gray-400">{form.excerpt.length} characters</span>
            </div>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              placeholder="A short summary shown in previews and search results…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F]"
            />
          </div>
        </div>

        {/* Cover Image — ← changed: drag-and-drop dropzone with a live preview and
            Replace/Remove controls, instead of a bare <input type="file"> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <FieldLabel icon={IconImage}>Cover Image</FieldLabel>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-xl border-2 border-dashed transition ${
              dragActive ? 'border-[#1B5E4F] bg-[#EAF5F1]' : 'border-gray-300 bg-gray-50'
            }`}
          >
            {form.cover_image_url ? (
              <div className="relative">
                <img
                  src={form.cover_image_url}
                  alt="Cover preview"
                  className="h-48 w-full object-cover sm:h-56"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1.5 text-xs font-medium text-gray-700 backdrop-blur transition hover:bg-white"
                  >
                    <IconUpload className="h-3.5 w-3.5" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('cover_image_url', null)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1.5 text-xs font-medium text-red-600 backdrop-blur transition hover:bg-white"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center gap-2 px-4 py-8 text-center sm:py-10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF5F1] text-[#1B5E4F]">
                  <IconUpload className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-gray-700">Drag & drop an image, or click to browse</span>
                <span className="text-xs text-gray-400">PNG or JPG, landscape works best</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>
          {uploadingCover && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
              <IconSpinner className="h-4 w-4 animate-spin" />
              Uploading…
            </p>
          )}
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <FieldLabel icon={IconFileText}>Content</FieldLabel>
          <div className="overflow-x-auto rounded-lg">
            <div className="min-w-[280px]">
              <RichTextEditor
                value={form.content}
                onChange={(html) => updateField('content', html)}
                onImageUpload={handleEditorImageUpload}
              />
            </div>
          </div>
        </div>

        {/* Status — ← changed: Draft/Published toggle buttons instead of a <select>,
            matching the pattern used on PublicationEditor */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <FieldLabel icon={IconToggle}>Status</FieldLabel>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateField('status', 'draft')}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition sm:flex-none ${
                form.status === 'draft'
                  ? 'border-[#1B5E4F] bg-[#1B5E4F] text-white shadow-sm'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconEdit className="h-4 w-4" />
              Draft
            </button>
            <button
              type="button"
              onClick={() => updateField('status', 'published')}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition sm:flex-none ${
                form.status === 'published'
                  ? 'border-[#1B5E4F] bg-[#1B5E4F] text-white shadow-sm'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconCheckCircle className="h-4 w-4" />
              Published
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {form.status === 'published'
              ? 'This post will be visible on the public site immediately after saving.'
              : 'This post will be saved privately until you switch it to Published.'}
          </p>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <IconAlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || uploadingCover}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? (
            <>
              <IconSpinner className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <IconCheckCircle className="h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Create Post'}
            </>
          )}
        </button>
      </form>
    </main>
  )
}

function IconDocument(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
}
function IconArrowLeft(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}
function IconType(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  )
}
function IconLayers(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
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
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
  )
}
function IconFileText(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="8" y1="9" x2="10" y2="9" />
    </svg>
  )
}
function IconToggle(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="5" width="22" height="14" rx="7" /><circle cx="16" cy="12" r="3" />
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
function IconTrash(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
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
function IconSpinner(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M12 2a10 10 0 1 0 10 10" />
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