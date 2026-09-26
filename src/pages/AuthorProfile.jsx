// src/pages/AuthorProfile.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicFullProfile } from '../services/profileService'
import { getPostsByAuthor } from '../services/postsService'

export default function AuthorProfile() {
  const { authorId } = useParams()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [{ profile }, authorPosts] = await Promise.all([
          getPublicFullProfile(authorId),
          getPostsByAuthor(authorId),
        ])
        if (!profile) {
          setError('Author not found.')
        } else {
          setProfile(profile)
          setPosts(authorPosts)
        }
      } catch (err) {
        console.error('Failed to load author profile:', err)
        setError('Author not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authorId])

  if (loading) {
    return <main className="mx-auto max-w-3xl px-6 py-12 text-gray-500">Loading profile…</main>
  }

  if (error || !profile) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">Author Not Found</h1>
        <Link to="/blog" className="mt-3 inline-block text-blue-600 hover:underline">
          Back to Blog
        </Link>
      </main>
    )
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-5">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={fullName} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-500">
            {fullName.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
          {profile.current_position && (
            <p className="text-gray-600">
              {profile.current_position}
              {profile.organization && ` · ${profile.organization}`}
            </p>
          )}
          {profile.location && <p className="text-sm text-gray-400">{profile.location}</p>}
        </div>
      </div>

      {profile.bio && <p className="mt-6 text-gray-700">{profile.bio}</p>}

      {profile.website && (

        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          {profile.website}
        </a>
      )}

      <h2 className="mt-10 text-lg font-semibold text-gray-900">
        Articles by {fullName} ({posts.length})
      </h2>

      {posts.length === 0 ? (
        <p className="mt-4 text-gray-500">No published articles yet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.slug}`} className="block group">
              <p className="text-xs text-gray-400">{post.categories?.name}</p>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">{post.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}