// src/pages/admin/PostEditor.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
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
    // ← changed: padding scales down on small screens (px-4 py-8) up to the
    // previous desktop values (lg:px-8 lg:py-12)
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <h1 className="text-2xl font-bold">{isEditing ? 'Edit Post' : 'New Post'}</h1>

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
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            required
            value={form.category_id}
            onChange={(e) => updateField('category_id', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Excerpt</label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cover Image</label>
          {form.cover_image_url && (
            // ← changed: full-width up to a capped size on mobile instead of
            // a bare h-40 w-auto, so the preview never gets cramped or
            // overflows a narrow screen
            <img
              src={form.cover_image_url}
              alt="Cover preview"
              className="mt-2 h-40 w-full max-w-xs rounded-md object-cover sm:w-auto"
            />
          )}
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="mt-2 w-full text-sm" />
          {uploadingCover && <p className="mt-1 text-sm text-gray-500">Uploading…</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          {/* ← added: overflow-x-auto safety net in case the rich text
              toolbar inside RichTextEditor is wider than a narrow phone
              screen — it scrolls instead of breaking the page layout */}
          <div className="mt-1 overflow-x-auto">
            <RichTextEditor
              value={form.content}
              onChange={(html) => updateField('content', html)}
              onImageUpload={handleEditorImageUpload}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || uploadingCover}
          className="w-full cursor-pointer rounded-md bg-[#1B5E4F] px-5 py-2.5 text-white hover:bg-[#154A3F] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
        >
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Post'}
        </button>
      </form>
    </main>
  )
}