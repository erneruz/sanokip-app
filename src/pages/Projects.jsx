// src/pages/Projects.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../services/projectsService'
import { htmlToPlainText } from '../utils/richText'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import Pagination from '../components/Pagination'

const FILTERS = [
  { key: 'all', label: 'All Projects' },
  { key: 'completed', label: 'Completed' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'upcoming', label: 'Upcoming' },
]

const STATUS_CONFIG = {
  completed: { label: 'Completed', className: 'bg-gray-900 text-white' },
  ongoing: { label: 'Ongoing', className: 'bg-blue-600 text-white' },
  upcoming: { label: 'Upcoming', className: 'bg-white text-gray-700 ring-1 ring-gray-300' },
}

const PAGE_SIZE = 6

function IconMapPin({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconCalendar({ className = '' }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconStar({ className = '' }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const data = await getProjects()
        if (cancelled) return
        setProjects(data)
      } catch (err) {
        if (!cancelled) setError('Unable to load projects. Please try again later.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter])

  const counts = {
    all: projects.length,
    completed: projects.filter((p) => p.status === 'completed').length,
    ongoing: projects.filter((p) => p.status === 'ongoing').length,
    upcoming: projects.filter((p) => p.status === 'upcoming').length,
  }

  const featured = projects.find((p) => p.featured)
  const filtered = projects.filter((p) => activeFilter === 'all' || p.status === activeFilter)
  const gridProjects = activeFilter === 'all' && featured
    ? filtered.filter((p) => p.id !== featured.id)
    : filtered

  const totalPages = Math.max(1, Math.ceil(gridProjects.length / PAGE_SIZE))
  const paginatedProjects = gridProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function handlePageChange(page) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <main className="bg-black px-6 py-24 text-center text-gray-400">
        Loading projects…
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-24 text-center text-red-600">
        {error}
      </main>
    )
  }

  return (
    <main>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-black text-white">
        <style>{`
          @keyframes hero-rise {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-rise { animation: hero-rise 0.6s ease-out both; }
          .hero-rise-delay { animation: hero-rise 0.6s ease-out 0.12s both; }
        `}</style>

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="hero-rise text-xs text-gray-400">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            {' → '}
            <span className="text-gray-300">Projects</span>
          </div>

          <h1 className="hero-rise mt-5 text-3xl font-bold leading-tight md:text-4xl">
            Peakstar Projects
          </h1>

          <p className="hero-rise-delay mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
            From land digitization in Kigali to regional infrastructure mapping, every
            Peakstar project turns raw geospatial data into decisions people can act on.
            Explore the work we've completed, what we're building now, and what's next.
          </p>

          <div className="hero-rise-delay mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-6">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  activeFilter === filter.key
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-white/5 text-gray-300 ring-1 ring-white/15 hover:bg-white/10 hover:text-white hover:ring-white/30'
                }`}
              >
                {filter.label}{' '}
                <span className={activeFilter === filter.key ? 'font-bold' : 'font-bold text-gray-400'}>
                  ({counts[filter.key]})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* ── FEATURED PROJECT (shown only on the "All" view, and only on page 1) ── */}
        {activeFilter === 'all' && currentPage === 1 && featured && (
          <section className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Featured</p>

            <button
              onClick={() => setSelectedProject(featured)}
              className="group mt-3 grid w-full cursor-pointer grid-cols-1 gap-3 rounded-[28px] border border-gray-200/70 bg-gray-50 p-3 text-left shadow-lg transition-shadow duration-300 hover:shadow-2xl md:grid-cols-[1fr_1.15fr]"
            >
              <div className="relative h-64 overflow-hidden rounded-2xl sm:h-80 md:h-[440px]">
                {featured.image_url ? (
                  <img
                    src={featured.image_url}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                    No image available
                  </div>
                )}
                <span className={`absolute left-4 top-4 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${STATUS_CONFIG[featured.status]?.className}`}>
                  {STATUS_CONFIG[featured.status]?.label}
                </span>
              </div>

              <div className="flex flex-col justify-between rounded-2xl bg-white p-8 md:h-[440px] md:p-10">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                    <IconStar className="text-amber-500" />
                    Featured Project
                  </span>

                  <h2 className="mt-4 text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
                    {featured.title}
                  </h2>

                  <div className="mt-3 h-[3px] w-10 rounded-full bg-gray-900" />

                  {(featured.location || featured.year) && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      {featured.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <IconMapPin className="text-gray-400" />
                          {featured.location}
                        </span>
                      )}
                      {featured.year && (
                        <span className="inline-flex items-center gap-1.5">
                          <IconCalendar className="text-gray-400" />
                          {featured.year}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-gray-600 md:text-[15px]">
                    {htmlToPlainText(featured.description)}
                  </p>
                </div>

                <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition group-hover:bg-gray-700">
                  View Project
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          </section>
        )}

        {/* ── PROJECT GRID ── */}
        {paginatedProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
            <p className="text-gray-500">No projects in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Want to see how we could work together?
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Reach out to learn more about Peakstar's projects, partnerships, and the data behind them.
          </p>
          <Link
            to="/about"
            className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Get in Touch
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </main>
  )
}