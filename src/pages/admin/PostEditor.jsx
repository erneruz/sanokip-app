// src/pages/admin/PostEditor.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Editor } from '@tinymce/tinymce-react'

// self-hosted TinyMCE assets — these imports are what let it run without a cloud API key
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/skins/ui/oxide/skin.css'
import 'tinymce/skins/content/default/content.css'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/table'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/emoticons/js/emojis'
import 'tinymce/plugins/code'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/autoresize'

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
  const editorRef = useRef(null)

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

  // Called by TinyMCE whenever an image is dropped/pasted/inserted into the content
  async function handleEditorImageUpload(blobInfo) {
    const file = new File([blobInfo.blob()], blobInfo.filename(), { type: blobInfo.blob().type })
    const url = await uploadCoverImage(file)
    return url
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
          <div className="mt-1 rounded-md border border-gray-300">
            <Editor
              licenseKey="gpl"
              onInit={(_evt, editor) => (editorRef.current = editor)}
              value={form.content}
              onEditorChange={(value) => updateField('content', value)}
              init={{
                license_key: 'gpl',
                height: 500,
                menubar: false,
                plugins: ['lists', 'link', 'image', 'table', 'charmap', 'emoticons', 'code', 'wordcount', 'autoresize'],
                toolbar:
                  'undo redo | fontfamily fontsize | blocks | ' +
                  'bold italic underline strikethrough | forecolor backcolor removeformat | ' +
                  'bullist numlist | alignleft aligncenter alignright alignjustify | outdent indent | ' +
                  'link image | emoticons | table | charmap | code',
                images_upload_handler: handleEditorImageUpload,
                skin: false,
                content_css: false,
              }}
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
          className="cursor-pointer rounded-md bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Post'}
        </button>
      </form>
    </main>
  )
}