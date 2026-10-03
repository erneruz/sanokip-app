// src/pages/AuthorProfile.jsx
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getPublicFullProfile } from '../services/profileService'
import { getPaginatedPostsByAuthor, getAuthorTopicCount } from '../services/postsService'
import Pagination from '../components/Pagination'

function initials(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function AuthorProfile() {
  const { authorId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const [profile, setProfile] = useState(null)
  const [academic, setAcademic] = useState([])
  const [certifications, setCertifications] = useState([])
  const [posts, setPosts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalArticles, setTotalArticles] = useState(0)
  const [topicCount, setTopicCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const { profile, academic, certifications } = await getPublicFullProfile(authorId)
        if (!profile) {
          setError('Author not found.')
        } else {
          setProfile(profile)
          setAcademic(academic)
          setCertifications(certifications)
        }
      } catch (err) {
        console.error('Failed to load author profile:', err)
        setError('Author not found.')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [authorId])

  useEffect(() => {
    let cancelled = false
    getAuthorTopicCount(authorId)
      .then((count) => {
        if (!cancelled) setTopicCount(count)
      })
      .catch((err) => console.error('Failed to load topic count:', err))
    return () => { cancelled = true }
  }, [authorId])

  useEffect(() => {
    let cancelled = false

    async function loadPosts() {
      setPostsLoading(true)
      try {
        const { posts, totalPages, totalCount } = await getPaginatedPostsByAuthor(authorId, currentPage)
        if (cancelled) return
        setPosts(posts)
        setTotalPages(totalPages)
        setTotalArticles(totalCount)
      } catch (err) {
        console.error('Failed to load author posts:', err)
      } finally {
        if (!cancelled) setPostsLoading(false)
      }
    }

    loadPosts()
    return () => { cancelled = true }
  }, [authorId, currentPage])

  function handlePageChange(page) {
    setSearchParams({ page: String(page) })
    window.scrollTo(0, 0)
  }

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
                <SectionTitle icon={<DocIcon />}>About</SectionTitle>
                <p className="mt-4 whitespace-pre-line text-gray-600">{profile.bio}</p>
              </section>
            )}

            {/* ── changed: full field set — start/end year range, institution, country, specialization ── */}
            {academic.length > 0 && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <SectionTitle icon={<CapIcon />}>Academic Qualifications</SectionTitle>
                <div className="mt-5 space-y-6 border-l-2 border-gray-100 pl-5">
                  {academic.map((item, i) => (
                    <div key={item.id ?? i} className="relative">
                      <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-900" />

                      <p className="font-semibold text-gray-900">
                        {item.degree}{item.field && ` in ${item.field}`}
                      </p>

                      {(item.institution || item.country) && (
                        <p className="mt-0.5 text-sm text-gray-600">
                          {item.institution}
                          {item.institution && item.country ? ', ' : ''}
                          {item.country}
                        </p>
                      )}

                      {(item.start_year || item.completion_year) && (
                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {item.start_year || '—'} – {item.completion_year || 'Present'}
                        </p>
                      )}

                      {item.specialization && (
                        <p className="mt-2 inline-block rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-600 ring-1 ring-gray-100">
                          Specialization: {item.specialization}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* ── end changed ── */}

            {/* ── changed: full field set — issuing body, certificate number, year obtained, expiry, specialization ── */}
            {certifications.length > 0 && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <SectionTitle icon={<BadgeIcon />}>Professional Certifications</SectionTitle>
                <div className="mt-5 space-y-6 border-l-2 border-gray-100 pl-5">
                  {certifications.map((item, i) => (
                    <div key={item.id ?? i} className="relative">
                      <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-900" />

                      <p className="font-semibold text-gray-900">{item.certification_name}</p>

                      {(item.certification_body || item.certification_number) && (
                        <p className="mt-0.5 text-sm text-gray-600">
                          {item.certification_body}
                          {item.certification_body && item.certification_number ? ' · ' : ''}
                          {item.certification_number && `No. ${item.certification_number}`}
                        </p>
                      )}

                      {(item.year_obtained || item.expiry_date) && (
                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {item.year_obtained && `Obtained ${item.year_obtained}`}
                          {item.year_obtained && item.expiry_date ? ' · ' : ''}
                          {item.expiry_date && `Expires ${item.expiry_date}`}
                        </p>
                      )}

                      {item.specialization && (
                        <p className="mt-2 inline-block rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-600 ring-1 ring-gray-100">
                          Specialization: {item.specialization}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* ── end changed ── */}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Overview</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Articles</span>
                  <span className="font-semibold text-gray-900">{totalArticles}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Topics covered</span>
                  <span className="font-semibold text-gray-900">{topicCount}</span>
                </div>
              </div>
            </div>

            {(profile.email || profile.phone || profile.website) && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Contact</h2>
                <div className="mt-3 space-y-3">
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
                      </svg>
                      <span className="truncate">{profile.email}</span>
                    </a>
                  )}

                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
                      </svg>
                      <span>{profile.phone}</span>
                    </a>
                  )}

                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span className="truncate">
                        {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------- */}
        {/* ARTICLES */}
        {/* -------------------------------------------- */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-gray-900">
            Articles by {fullName} <span className="font-normal text-gray-400">({totalArticles})</span>
          </h2>

          {postsLoading ? (
            <p className="mt-4 text-gray-500">Loading articles…</p>
          ) : posts.length === 0 ? (
            <p className="mt-4 text-gray-500">No published articles yet.</p>
          ) : (
            <>
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </div>
    </main>
  )
}

// ── added: shared section title, visually distinct (icon + uppercase tracking) from the list content below it ──
function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
        {icon}
      </span>
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">{children}</h2>
    </div>
  )
}

function DocIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  )
}

function CapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  )
}

function BadgeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M9 14 7 22l5-3 5 3-2-8" />
    </svg>
  )
}