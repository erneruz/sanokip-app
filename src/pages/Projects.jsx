// src/pages/Projects.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../services/projectsService'
import ProjectCard from '../components/ProjectCard'

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

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

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

  const counts = {
    all: projects.length,
    completed: projects.filter((p) => p.status === 'completed').length,
    ongoing: projects.filter((p) => p.status === 'ongoing').length,
    upcoming: projects.filter((p) => p.status === 'upcoming').length,
  }

  const featured = projects.find((p) => p.featured)
  const filtered = projects.filter((p) => activeFilter === 'all' || p.status === activeFilter)
  // On the "All" view, the featured project already gets its own large spot above —
  // skip it in the grid so it isn't shown twice.
  const gridProjects = activeFilter === 'all' && featured
    ? filtered.filter((p) => p.id !== featured.id)
    : filtered

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
        {/* single, deliberate entrance — not repeated per-section */}
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

          {/* ── Category filters ── */}
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

        {/* ── FEATURED PROJECT (shown only on the "All" view) ── */}
        {activeFilter === 'all' && featured && (
          <section className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Featured</p>
            <Link
              to={`/projects/${featured.slug}`}
              className="group mt-3 grid grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl md:grid-cols-2"
            >
              <div className="relative overflow-hidden">
                {featured.image_url ? (
                  <img
                    src={featured.image_url}
                    alt={featured.title}
                    className="h-64 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 md:h-full"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center bg-gray-100 text-sm text-gray-400 md:h-full">
                    No image available
                  </div>
                )}
                <span className={`absolute left-4 top-4 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${STATUS_CONFIG[featured.status]?.className}`}>
                  {STATUS_CONFIG[featured.status]?.label}
                </span>
              </div>

              <div className="flex flex-col justify-center p-8 md:p-10">
                {featured.location && (
                  <p className="text-xs text-gray-500">{featured.location} · {featured.year}</p>
                )}
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{featured.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{featured.summary}</p>
                <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition group-hover:bg-gray-700">
                  View Project
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* ── PROJECT GRID ── */}
        {gridProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
            <p className="text-gray-500">No projects in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {gridProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
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
    </main>
  )
}