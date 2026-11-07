// src/pages/Projects.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../services/projectsService'
import { htmlToPlainText } from '../utils/richText'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import ProjectStatusBadge from '../components/ProjectStatusBadge'
import Pagination from '../components/Pagination'

/*
  Peak Star brand colours (taken from the logo)
    deep green   #1B5E4F   buttons, tags
    darker green #0D3A31   headings, hero depth
    mid green    #2F8F7A   small accents and icons
    pale green   #E6F1EE   soft tags and highlights
    page tint    #F1F6F4   page background
*/

const PAGE_SIZE = 6

/* ---------- icons (all drawn here, no extra library needed) ---------- */
function Svg({ size = 16, className = '', strokeWidth = 2, fill = 'none', children }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function HomeIcon(props) {
  return (
    <Svg {...props}>
      <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z" />
      <path d="M9 22V12h6v10" />
    </Svg>
  )
}

function ChevronRightIcon(props) {
  return (
    <Svg {...props}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  )
}

function BriefcaseIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </Svg>
  )
}

function GridIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  )
}

function CheckCircleIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Svg>
  )
}

function ActivityIcon(props) {
  return (
    <Svg {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
  )
}

function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  )
}

function MapPinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  )
}

function StarIcon(props) {
  return (
    <Svg {...props} fill="currentColor" strokeWidth={1.5}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
  )
}

function ArrowRightIcon(props) {
  return (
    <Svg {...props} strokeWidth={2.5}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </Svg>
  )
}

function ImageIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-9 9" />
    </Svg>
  )
}

function FolderIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </Svg>
  )
}

function AlertIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5h.01" />
    </Svg>
  )
}

function MailIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  )
}

/* ---------- filters ---------- */

const FILTERS = [
  { key: 'all', label: 'All Projects', Icon: GridIcon },
  { key: 'completed', label: 'Completed', Icon: CheckCircleIcon },
  { key: 'ongoing', label: 'Ongoing', Icon: ActivityIcon },
  { key: 'upcoming', label: 'Upcoming', Icon: CalendarIcon },
]

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
      } catch {
        if (!cancelled) setError('Unable to load projects. Please try again later.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // Changing the filter always goes back to page 1
  function handleFilterChange(key) {
    setActiveFilter(key)
    setCurrentPage(1)
  }

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

  /* ── loading ── */
  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#F1F6F4]">
        <div className="animate-pulse bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] py-16">
          <div className="mx-auto max-w-6xl space-y-4 px-6">
            <div className="h-3 w-40 rounded bg-white/20" />
            <div className="h-9 w-72 rounded bg-white/25" />
            <div className="h-4 w-full max-w-xl rounded bg-white/15" />
            <div className="flex gap-3 pt-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-28 rounded-full bg-white/15" />
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl animate-pulse gap-8 px-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white">
              <div className="aspect-[16/10] bg-[#DCE9E5]" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-3/4 rounded bg-[#E6F1EE]" />
                <div className="h-3 w-full rounded bg-[#E6F1EE]" />
                <div className="h-3 w-2/3 rounded bg-[#E6F1EE]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  /* ── error ── */
  if (error) {
    return (
      <main className="min-h-[60vh] bg-[#F1F6F4] px-6 py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-dashed border-[#1B5E4F]/30 bg-white/80 px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
            <AlertIcon size={28} />
          </span>
          <p className="font-medium text-[#0D3A31]">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#F1F6F4]">
      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] text-white">
        <style>{`
          @keyframes hero-rise {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-rise { animation: hero-rise 0.6s ease-out both; }
          .hero-rise-delay { animation: hero-rise 0.6s ease-out 0.12s both; }
        `}</style>

        {/* decoration: soft glows and a dot grid (no big icons) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1.2px, transparent 1.4px)',
              backgroundSize: '26px 26px',
              WebkitMaskImage: 'radial-gradient(ellipse at 85% 20%, black 0%, transparent 65%)',
              maskImage: 'radial-gradient(ellipse at 85% 20%, black 0%, transparent 65%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <nav className="hero-rise flex items-center gap-1.5 text-xs text-white/60">
            <Link to="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <HomeIcon size={13} />
              Home
            </Link>
            <ChevronRightIcon size={12} className="text-white/40" />
            <span className="text-white/85">Projects</span>
          </nav>

          <span className="hero-rise mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9] ring-1 ring-white/20">
            <BriefcaseIcon size={13} />
            Our work
          </span>

          <h1 className="hero-rise mt-4 text-3xl font-bold leading-tight md:text-4xl">
            Peakstar Projects
          </h1>

          <div className="hero-rise mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />

          <p className="hero-rise-delay mt-4 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
            From land digitization in Kigali to regional infrastructure mapping, every
            Peakstar project turns raw geospatial data into decisions people can act on.
            Explore the work we've completed, what we're building now, and what's next.
          </p>

          {/* filters */}
          <div className="hero-rise-delay mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-6">
            {FILTERS.map(({ key, label, Icon }) => {
              const active = activeFilter === key
              return (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key)}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
                    active
                      ? 'bg-white text-[#0D3A31] shadow-md'
                      : 'bg-white/10 text-white/85 ring-1 ring-white/20 hover:bg-white/15 hover:text-white hover:ring-white/40'
                  }`}
                >
                  <Icon size={15} className={active ? 'text-[#2F8F7A]' : 'text-[#9FD8C9]'} />
                  {label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      active ? 'bg-[#E6F1EE] text-[#1B5E4F]' : 'bg-white/10 text-white/80'
                    }`}
                  >
                    {counts[key]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* ── FEATURED PROJECT (shown only on the "All" view, and only on page 1) ── */}
        {activeFilter === 'all' && currentPage === 1 && featured && (
          <section className="mb-14">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-[#2F8F7A]">
              <StarIcon size={13} />
              Featured
              <span className="h-px flex-1 bg-[#1B5E4F]/15" />
            </p>

            <button
              onClick={() => setSelectedProject(featured)}
              className="group mt-4 grid w-full cursor-pointer grid-cols-1 gap-3 rounded-[28px] border border-[#1B5E4F]/10 bg-white p-3 text-left shadow-[0_1px_2px_rgba(13,58,49,0.06),0_16px_40px_-16px_rgba(13,58,49,0.25)] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(13,58,49,0.08),0_24px_50px_-14px_rgba(13,58,49,0.35)] md:grid-cols-[1fr_1.15fr]"
            >
              <div className="relative h-64 overflow-hidden rounded-2xl sm:h-80 md:h-[440px]">
                {featured.image_url ? (
                  <img
                    src={featured.image_url}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-sm text-white/70">
                    <ImageIcon size={28} />
                    No image available
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  <ProjectStatusBadge status={featured.status} />
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl bg-[#F8FBFA] p-8 md:h-[440px] md:p-10">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1B5E4F]">
                    <StarIcon size={11} className="text-[#2F8F7A]" />
                    Featured Project
                  </span>

                  <h2 className="mt-4 text-2xl font-bold leading-tight text-[#0D3A31] md:text-3xl">
                    {featured.title}
                  </h2>

                  <div className="mt-3 h-[3px] w-10 rounded-full bg-[#2F8F7A]" />

                  {(featured.location || featured.year) && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
                      {featured.location && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-[#1B5E4F]/10">
                          <MapPinIcon size={13} className="text-[#2F8F7A]" />
                          {featured.location}
                        </span>
                      )}
                      {featured.year && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-[#1B5E4F]/10">
                          <CalendarIcon size={13} className="text-[#2F8F7A]" />
                          {featured.year}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-gray-600 md:text-[15px]">
                    {htmlToPlainText(featured.description)}
                  </p>
                </div>

                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[#1B5E4F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 group-hover:bg-[#154A3E] group-hover:shadow-md">
                  View Project
                  <ArrowRightIcon size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          </section>
        )}

        {/* ── PROJECT GRID ── */}
        {paginatedProjects.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#1B5E4F]/30 bg-white/70 px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
              <FolderIcon size={26} />
            </span>
            <p className="font-medium text-[#0D3A31]">No projects in this category yet.</p>
            <p className="text-sm text-gray-500">Try another filter above.</p>
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
      <section className="px-6 pb-16">
        <div className="relative isolate mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] px-6 py-12 text-center text-white shadow-[0_16px_40px_-16px_rgba(13,58,49,0.5)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1.2px, transparent 1.4px)',
                backgroundSize: '26px 26px',
                WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)',
                maskImage: 'radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)',
              }}
            />
          </div>

          <h2 className="text-2xl font-bold">
            Want to see how we could work together?
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75">
            Reach out to learn more about Peakstar's projects, partnerships, and the data behind them.
          </p>
          <Link
            to="/about"
            className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0D3A31] shadow-sm transition duration-200 hover:bg-[#E6F1EE] hover:shadow-md active:scale-95"
          >
            <MailIcon size={16} className="text-[#2F8F7A]" />
            Get in Touch
            <ArrowRightIcon size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </main>
  )
}