// src/pages/AuthorProfile.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicFullProfile } from '../services/profileService'
import { getPostsByAuthor } from '../services/postsService'

function initials(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function AuthorProfile() {
  const { authorId } = useParams()
  const [profile, setProfile] = useState(null)
  const [academic, setAcademic] = useState([])
  const [certifications, setCertifications] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [{ profile, academic, certifications }, authorPosts] = await Promise.all([
          getPublicFullProfile(authorId),
          getPostsByAuthor(authorId),
        ])
        if (!profile) {
          setError('Author not found.')
        } else {
          setProfile(profile)
          setAcademic(academic)
          setCertifications(certifications)
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
    return <main className="mx-auto max-w-5xl px-6 py-16 text-gray-500">Loading profile…</main>
  }

  if (error || !profile) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Author Not Found</h1>
        <p className="mt-2 text-gray-500">This profile doesn't exist or isn't public.</p>
        <Link to="/blog" className="mt-4 inline-block text-sm text-gray-600 hover:underline">
          ← Back to Blog
        </Link>
      </main>
    )
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const categoriesCovered = new Set(posts.map((p) => p.categories?.name).filter(Boolean)).size

  return (
    <main className="bg-gray-50">
      {/* -------------------------------------------- */}
      {/* HERO */}
      {/* -------------------------------------------- */}
      <section className="bg-gradient-to-br from-black to-gray-700 text-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="text-xs text-white/50">
            <Link to="/blog" className="hover:text-white">Blog & Reports</Link> / {fullName}
          </div>

          <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={fullName}
                className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-white/10"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold ring-4 ring-white/10">
                {initials(fullName)}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold">{fullName}</h1>
              {profile.current_position && (
                <p className="mt-1 text-white/70">
                  {profile.current_position}
                  {profile.organization && <span className="text-white/50"> · {profile.organization}</span>}
                </p>
              )}
              {profile.location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {profile.location}
                </p>
              )}
            </div>
          </div>

          {profile.areas_of_expertise?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.areas_of_expertise.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------- */}
      {/* BODY */}
      {/* -------------------------------------------- */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* MAIN COLUMN */}
          <div className="space-y-8 lg:col-span-2">
            {profile.bio && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">About</h2>
                <p className="mt-3 whitespace-pre-line text-gray-600">{profile.bio}</p>
              </section>
            )}

            {academic.length > 0 && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">Academic Qualifications</h2>
                <div className="mt-4 space-y-5 border-l-2 border-gray-100 pl-5">
                  {academic.map((item, i) => (
                    <div key={item.id ?? i} className="relative">
                      <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-900" />
                      <p className="font-medium text-gray-900">{item.degree}</p>
                      {item.institution && <p className="text-sm text-gray-500">{item.institution}</p>}
                      {item.completion_year && <p className="text-xs text-gray-400">{item.completion_year}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">Professional Certifications</h2>
                <div className="mt-4 space-y-5 border-l-2 border-gray-100 pl-5">
                  {certifications.map((item, i) => (
                    <div key={item.id ?? i} className="relative">
                      <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-900" />
                      <p className="font-medium text-gray-900">{item.certification_name}</p>
                      {item.year_obtained && <p className="text-xs text-gray-400">{item.year_obtained}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Overview</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Articles</span>
                  <span className="font-semibold text-gray-900">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Topics covered</span>
                  <span className="font-semibold text-gray-900">{categoriesCovered}</span>
                </div>
              </div>
            </div>

            {profile.website && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Website</h2>
                
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="truncate">
                    {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------- */}
        {/* ARTICLES */}
        {/* -------------------------------------------- */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-gray-900">
            Articles by {fullName} <span className="font-normal text-gray-400">({posts.length})</span>
          </h2>

          {posts.length === 0 ? (
            <p className="mt-4 text-gray-500">No published articles yet.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {post.cover_image_url && (
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {post.categories?.name && (
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {post.categories.name}
                      </p>
                    )}
                    <h3 className="mt-2 font-semibold text-gray-900 group-hover:underline">{post.title}</h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">{post.excerpt}</p>
                    )}
                    {post.published_at && (
                      <p className="mt-3 text-xs text-gray-400">
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}