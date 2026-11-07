// src/pages/Services.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getServiceLinesWithServices } from '../services/servicesService'
import ServiceModal from '../components/ServiceModal'
import ServiceCard from '../components/ServiceCard'

/*
  Peak Star brand colours (taken from the logo)
    deep green   #1B5E4F   buttons, tags
    darker green #0D3A31   headings, hero depth
    mid green    #2F8F7A   small accents and icons
    pale green   #E6F1EE   soft tags and highlights
    page tint    #F1F6F4   page background
*/

/* ---------- icons (all drawn here, no extra library needed) ---------- */
function Svg({ size = 16, className = '', strokeWidth = 2, children }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
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

function SparkleIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
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

function TagIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </Svg>
  )
}

function LayersIcon(props) {
  return (
    <Svg {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
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

function FolderIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
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

function ArrowRightIcon(props) {
  return (
    <Svg strokeWidth={2.5} {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </Svg>
  )
}

export default function Services() {
  const [serviceLines, setServiceLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    let cancelled = false
    getServiceLinesWithServices()
      .then((data) => {
        if (!cancelled) setServiceLines(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = serviceLines.map((line) => ({ id: line.id, name: line.name }))

  const allServices = serviceLines.flatMap((line) =>
    (line.services ?? []).map((s) => ({
      ...s,
      categoryId: line.id,
      categoryName: line.name,
    }))
  )

  const visibleServices =
    activeCategory === 'all'
      ? allServices
      : allServices.filter((s) => s.categoryId === activeCategory)

  // how many services each category has (shown on the filter pills)
  const countFor = (categoryId) => allServices.filter((s) => s.categoryId === categoryId).length

  const pillClass = (active) =>
    `inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
      active
        ? 'bg-white text-[#0D3A31] shadow-md'
        : 'bg-white/10 text-white/85 ring-1 ring-white/20 hover:bg-white/15 hover:text-white hover:ring-white/40'
    }`

  const badgeClass = (active) =>
    `rounded-full px-2 py-0.5 text-xs font-bold ${
      active ? 'bg-[#E6F1EE] text-[#1B5E4F]' : 'bg-white/10 text-white/80'
    }`

  return (
    <div className="bg-[#F1F6F4]">
      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] text-white">
        <style>{`
          @keyframes services-rise {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .services-rise { animation: services-rise 0.6s ease-out both; }
          .services-rise-delay { animation: services-rise 0.6s ease-out 0.12s both; }
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

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
          <nav className="services-rise flex items-center gap-1.5 text-xs text-white/60">
            <Link to="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <HomeIcon size={13} />
              Home
            </Link>
            <ChevronRightIcon size={12} className="text-white/40" />
            <span className="text-white/85">Services</span>
          </nav>

          <span className="services-rise mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9] ring-1 ring-white/20">
            <SparkleIcon size={13} />
            What we do
          </span>

          <h1 className="services-rise mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            Our Services
          </h1>

          <div className="services-rise mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />

          <p className="services-rise-delay mt-4 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
            Mapping, planning, surveying and geospatial solutions, organized by category.
          </p>

          {/* quick facts */}
          {!loading && !error && (
            <div className="services-rise-delay mt-5 flex flex-wrap gap-2.5 text-xs font-medium">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                <LayersIcon size={14} className="text-[#9FD8C9]" />
                {allServices.length} {allServices.length === 1 ? 'service' : 'services'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                <TagIcon size={14} className="text-[#9FD8C9]" />
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </span>
            </div>
          )}

          {/* category filters */}
          <div className="services-rise-delay mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-6">
            <button onClick={() => setActiveCategory('all')} className={pillClass(activeCategory === 'all')}>
              <GridIcon size={15} className={activeCategory === 'all' ? 'text-[#2F8F7A]' : 'text-[#9FD8C9]'} />
              All
              <span className={badgeClass(activeCategory === 'all')}>{allServices.length}</span>
            </button>

            {categories.map((cat) => {
              const active = activeCategory === cat.id
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={pillClass(active)}>
                  <TagIcon size={15} className={active ? 'text-[#2F8F7A]' : 'text-[#9FD8C9]'} />
                  {cat.name}
                  <span className={badgeClass(active)}>{countFor(cat.id)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        {loading && (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="relative aspect-[6/5] w-full animate-pulse">
                <div className="absolute inset-y-0 left-0 w-[58%] rounded-2xl bg-[#DCE9E5]" />
                <div className="absolute bottom-[14%] right-0 top-[14%] w-[72%] space-y-3 rounded-2xl border border-[#1B5E4F]/10 bg-white p-6">
                  <div className="h-4 w-1/3 rounded-full bg-[#E6F1EE]" />
                  <div className="h-5 w-3/4 rounded bg-[#DCE9E5]" />
                  <div className="h-3 w-full rounded bg-[#E6F1EE]" />
                  <div className="h-3 w-2/3 rounded bg-[#E6F1EE]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-dashed border-red-300 bg-white/80 px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
              <AlertIcon size={24} />
            </span>
            <p className="font-medium text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && visibleServices.length === 0 && (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-2 rounded-2xl border border-dashed border-[#1B5E4F]/30 bg-white/70 px-6 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]">
              <FolderIcon size={26} />
            </span>
            <p className="font-medium text-[#0D3A31]">No services in this category yet.</p>
            <p className="text-sm text-gray-500">Try another category above.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
          {visibleServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onExplore={setSelectedService}
            />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      {!loading && !error && (
        <section className="px-4 pb-16 sm:px-6">
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

            <h2 className="text-2xl font-bold">Can't find the service you need?</h2>
            <div className="mx-auto mt-3 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75">
              Tell us about your project and we will help you find the right solution.
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
      )}

      {selectedService && (
        <ServiceModal
          service={selectedService}
          allServices={allServices}
          onClose={() => setSelectedService(null)}
          onSelectService={setSelectedService}
        />
      )}
    </div>
  )
}