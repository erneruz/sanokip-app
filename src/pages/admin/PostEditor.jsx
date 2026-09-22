// src/pages/admin/PostEditor.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
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
  author_first_name: '',
  author_second_name: '',
  status: 'draft',
  cover_image_url: null,
}

export default function PostEditor() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const quillRef = useRef(null)

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
        author_first_name: post.author_first_name ?? '',
        author_second_name: post.author_second_name ?? '',
        status: post.status ?? 'draft',
        cover_image_url: post.cover_image_url ?? null,
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

  // Called when the Quill toolbar's image button is clicked
  function imageHandler() {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return

      try {
        const url = await uploadCoverImage(file)
        const editor = quillRef.current.getEditor()
        const range = editor.getSelection(true)
        editor.insertEmbed(range.index, 'image', url)
      } catch (err) {
        console.error('Inline image upload failed:', err)
      }
    }
  }

  const modules = {
    toolbar: {
      container: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: { image: imageHandler },
    },
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      slug: slugify(form.title),
      published_at: form.status === 'published' ? new Date().toISOString() : null,
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
    <main className="mx-auto max-w-3xl px-6 py-12">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Author first name</label>
            <input
              type="text"
              required
              value={form.author_first_name}
              onChange={(e) => updateField('author_first_name', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Author last name</label>
            <input
              type="text"
              required
              value={form.author_second_name}
              onChange={(e) => updateField('author_second_name', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
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
            <img src={form.cover_image_url} alt="Cover preview" className="mt-2 h-40 w-auto rounded-md object-cover" />
          )}
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="mt-2" />
          {uploadingCover && <p className="mt-1 text-sm text-gray-500">Uploading…</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={form.content}
            onChange={(value) => updateField('content', value)}
            modules={modules}
            className="mt-1 bg-white"
          />
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
          className="cursor-pointer rounded-md bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Post'}
        </button>
      </form>
    </main>
  )
}