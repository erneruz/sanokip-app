// src/pages/admin/AdminPosts.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllPostsForAdmin, deletePost } from '../../services/postsService'
import { useAuth } from '../../context/AuthContext'

export default function AdminPosts() {
  const { signOut } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadPosts() {
    setLoading(true)
    try {
      const data = await getAllPostsForAdmin()
      setPosts(data)
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    try {
      await deletePost(id)
      loadPosts()
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <div className="flex gap-3">
          <Link to="/admin/posts/new" className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white">
            + New Post
          </Link>
          <button onClick={signOut} className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm">
            Sign out
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading…</p>
      ) : (
        <table className="mt-8 w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-500">
            <tr>
              <th className="pb-2">Title</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Status</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100">
                <td className="py-3">{post.title}</td>
                <td className="py-3 text-gray-500">{post.categories?.name ?? '—'}</td>
                <td className="py-3">
                  <span
                    className={
                      post.status === 'published'
                        ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                        : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                    }
                  >
                    {post.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <Link to={`/admin/posts/${post.id}/edit`} className="mr-4 cursor-pointer text-blue-600 hover:underline">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="cursor-pointer text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}