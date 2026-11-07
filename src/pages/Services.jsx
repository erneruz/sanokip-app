// src/pages/Services.jsx
import { useEffect, useRef, useState } from 'react'
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

function LandmarkIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7Z" />
    </Svg>
  )
}

function BuildingIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
    </Svg>
  )
}

function LeafIcon(props) {
  return (
    <Svg {...props}>
      <path d="M11 20A7 7 0 0 1 4 13c0-6 6-9 16-9 0 10-3 16-9 16Z" />
      <path d="M4 21c3-6 6-9 11-11" />
    </Svg>
  )
}

function BulbIcon(props) {
  return (
    <Svg {...props}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
    </Svg>
  )
}

function PinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  )
}

/* ---------- motion helpers ---------- */

// true while an element is on screen (once = stay true after the first time)
function useInView(threshold = 0.12, once = true) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          if (once) io.disconnect()
        } else if (!once) {
          setShown(false)
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, once])

  return [ref, shown]
}

const HIDDEN = {
  up: 'translate-y-10 opacity-0',
  left: '-translate-x-16 opacity-0',
  right: 'translate-x-16 opacity-0',
  zoom: 'scale-90 opacity-0',
}

// slides / fades a block in from a direction when it scrolls into view
function Reveal({ children, delay = 0, from = 'up', className = '' }) {
  const [ref, shown] = useInView()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : HIDDEN[from]
      } ${className}`}
    >
      {children}
    </div>
  )
}

// number that counts up from 0 every time it scrolls into view
function CountUp({ to, duration = 1800 }) {
  const [ref, shown] = useInView(0.4, false)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!shown) {
      setValue(0)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [shown, to, duration])

  return <span ref={ref}>{value}</span>
}

// sets --p on its element (about -1 to 1 by position on screen) so Drift children move while you scroll
function DriftField({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0

    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = (r.top + r.height / 2 - vh / 2) / vh
      el.style.setProperty('--p', String(Math.max(-1.2, Math.min(1.2, p))))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// moves its content while you scroll (big screens only). Must sit inside a DriftField.
function Drift({ dx = 0, dy = 0, children, className = '' }) {
  return (
    <div className={`svc-drift ${className}`} style={{ '--dx': `${dx}px`, '--dy': `${dy}px` }}>
      {children}
    </div>
  )
}

/* what our services do for people (shown in the closing section) */
const IMPACTS = [
  { icon: LandmarkIcon, title: 'Secure land rights', text: 'Clear boundaries and records families can rely on.' },
  { icon: BuildingIcon, title: 'Safer, smarter cities', text: 'Plans that put roads, homes and services in the right place.' },
  { icon: LeafIcon, title: 'Protected environment', text: 'Wetlands and forests monitored for the generations ahead.' },
  { icon: BulbIcon, title: 'Confident decisions', text: 'Trusted data for governments, businesses and communities.' },
]

const STEPS = [
  { title: 'Tell us the problem', text: 'Describe what you need, even if it is not on our list.' },
  { title: 'We shape the solution', text: 'Our team reviews it and replies with the right approach.' },
  { title: 'We deliver the change', text: 'Accurate work, handed over clearly and on time.' },
]

// the three steps: the line draws itself, then each step slides in one by one
function StepsList() {
  const [ref, shown] = useInView(0.3)

  return (
    <ol ref={ref} className="relative mt-6 space-y-5">
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-[15px] top-3 w-px origin-top bg-gradient-to-b from-[#1B5E4F]/50 via-[#2F8F7A]/30 to-transparent transition-transform duration-[1400ms] ease-out"
        style={{ transform: `scaleY(${shown ? 1 : 0})` }}
      />
      {STEPS.map((step, i) => (
        <li
          key={step.title}
          style={{ transitionDelay: `${300 + i * 240}ms` }}
          className={`relative flex gap-4 transition-all duration-700 ease-out ${
            shown ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`}
        >
          <span className="relative grid size-8 shrink-0 place-items-center">
            <span
              className="svc-ping absolute inset-0 rounded-full bg-[#2F8F7A]/40"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
            <span className="relative grid size-8 place-items-center rounded-full bg-[#1B5E4F] text-sm font-bold text-white ring-4 ring-white">
              {i + 1}
            </span>
          </span>
          <span>
            <span className="block text-sm font-bold text-[#0D3A31]">{step.title}</span>
            <span className="block text-xs leading-relaxed text-gray-600">{step.text}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export default function Services() {
  const rootRef = useRef(null)
  const barRef = useRef(null)
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

  // scroll progress bar + hero parallax (one light listener)
  useEffect(() => {
    let raf = 0

    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
      }
      if (rootRef.current) {
        rootRef.current.style.setProperty('--sy', String(Math.min(y, 1200)))
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
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
    `services-pop inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
      active
        ? 'bg-white text-[#0D3A31] shadow-md'
        : 'bg-white/10 text-white/85 ring-1 ring-white/20 hover:bg-white/15 hover:text-white hover:ring-white/40'
    }`

  const badgeClass = (active) =>
    `rounded-full px-2 py-0.5 text-xs font-bold ${
      active ? 'bg-[#E6F1EE] text-[#1B5E4F]' : 'bg-white/10 text-white/80'
    }`

  return (
    <div ref={rootRef} className="overflow-x-clip bg-[#F1F6F4]">
      <style>{`
        @keyframes services-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes services-pop {
          from { opacity: 0; transform: translateY(10px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes services-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(22px, -20px, 0) scale(1.08); }
        }
        @keyframes services-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes services-ping {
          0% { transform: scale(0.7); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes services-shimmer {
          0% { transform: translateX(-160%) skewX(-20deg); }
          60%, 100% { transform: translateX(380%) skewX(-20deg); }
        }
        @keyframes services-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        .services-rise { animation: services-rise 0.6s ease-out both; }
        .services-rise-delay { animation: services-rise 0.6s ease-out 0.12s both; }
        .services-pop { animation: services-pop 0.55s cubic-bezier(0.2, 0.8, 0.3, 1) both; }
        .services-float { animation: services-float 12s ease-in-out infinite; }
        .services-float-slow { animation: services-float 18s ease-in-out infinite reverse; }
        .svc-spin { animation: services-spin 60s linear infinite; }
        .svc-spin-rev { animation: services-spin 90s linear infinite reverse; }
        .svc-ping { animation: services-ping 2.2s ease-out infinite; }
        .svc-shimmer { animation: services-shimmer 3.8s ease-in-out infinite; }
        .svc-bob { animation: services-bob 4.5s ease-in-out infinite; }

        /* closing cards drift while you scroll (big screens only, so nothing overlaps on phones) */
        .svc-drift { will-change: transform; }
        @media (min-width: 1024px) {
          .svc-drift {
            transform: translate3d(
              calc(var(--p, 0) * var(--dx, 0px)),
              calc(var(--p, 0) * var(--dy, 0px)),
              0
            );
          }
        }
      `}</style>

      {/* scroll progress bar */}
      <div
        ref={barRef}
        aria-hidden="true"
        className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left bg-gradient-to-r from-[#2F8F7A] to-[#9FD8C9]"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] text-white">
        {/* decoration: soft glows and a dot grid (no big icons), drifting slower than the page */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ transform: 'translate3d(0, calc(var(--sy, 0) * 0.18px), 0)' }}
        >
          <div className="services-float absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
          <div className="services-float-slow absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="services-float absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-[#9FD8C9]/15 blur-3xl" />
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

          {/* category filters: they pop in one after another */}
          <div className="mt-8 flex flex-wrap gap-2.5 border-t border-white/10 pt-6">
            <button
              onClick={() => setActiveCategory('all')}
              className={pillClass(activeCategory === 'all')}
              style={{ animationDelay: '0.25s' }}
            >
              <GridIcon size={15} className={activeCategory === 'all' ? 'text-[#2F8F7A]' : 'text-[#9FD8C9]'} />
              All
              <span className={badgeClass(activeCategory === 'all')}>{allServices.length}</span>
            </button>

            {categories.map((cat, i) => {
              const active = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={pillClass(active)}
                  style={{ animationDelay: `${0.35 + i * 0.08}s` }}
                >
                  <TagIcon size={15} className={active ? 'text-[#2F8F7A]' : 'text-[#9FD8C9]'} />
                  {cat.name}
                  <span className={badgeClass(active)}>{countFor(cat.id)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── GRID: cards slide in from alternating sides and drift while you scroll ── */}
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

        <DriftField className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
          {visibleServices.map((service, i) => (
            <Reveal key={service.id} from={i % 2 === 0 ? 'left' : 'right'} delay={(i % 2) * 120}>
              <Drift dy={i % 2 === 0 ? -22 : 22}>
                <ServiceCard service={service} onExplore={setSelectedService} />
              </Drift>
            </Reveal>
          ))}
        </DriftField>
      </section>

      {/* ── CLOSING: how our services change lives ── */}
      {!loading && !error && (
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <Reveal from="zoom">
            <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#1B5E4F]/10 bg-gradient-to-br from-[#E6F1EE] via-[#CFEAE0] to-[#A8E0CE] shadow-[0_24px_60px_-28px_rgba(27,94,79,0.55)]">
              {/* living background: floating bubbles, turning rings, moving dots */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="services-float absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/60 blur-2xl" />
                <div className="services-float-slow absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-[#2F8F7A]/20 blur-3xl" />
                <div className="services-float absolute bottom-10 left-1/3 h-24 w-24 rounded-full bg-white/50 blur-xl" />

                <svg className="absolute -right-32 -top-32 h-[420px] w-[420px] opacity-70" viewBox="0 0 400 400" fill="none">
                  <g className="svc-spin" style={{ transformOrigin: '200px 200px' }} stroke="#1B5E4F" strokeOpacity="0.18" strokeWidth="1.2">
                    <circle cx="200" cy="200" r="190" strokeDasharray="4 10" />
                    <circle cx="200" cy="200" r="140" />
                  </g>
                  <g className="svc-spin-rev" style={{ transformOrigin: '200px 200px' }} stroke="#2F8F7A" strokeOpacity="0.3" strokeWidth="1.2">
                    <circle cx="200" cy="200" r="165" strokeDasharray="2 8" />
                    <circle cx="200" cy="200" r="100" />
                  </g>
                </svg>

                <div
                  className="absolute inset-0 opacity-[0.35]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #1B5E4F 1px, transparent 1.3px)',
                    backgroundSize: '24px 24px',
                    WebkitMaskImage: 'radial-gradient(ellipse at 0% 100%, black 0%, transparent 60%)',
                    maskImage: 'radial-gradient(ellipse at 0% 100%, black 0%, transparent 60%)',
                  }}
                />
              </div>

              <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12 lg:p-14">
                {/* left: the promise */}
                <div>
                  <Reveal from="left" delay={150}>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15">
                      <SparkleIcon size={13} />
                      Services that change lives
                    </span>

                    <h2 className="mt-5 text-3xl font-bold leading-tight text-[#0D3A31] sm:text-4xl">
                      Better data builds <span className="text-[#1B5E4F]">better lives</span>
                    </h2>
                    <div className="mt-4 h-[3px] w-12 rounded-full bg-[#1B5E4F]" />
                  </Reveal>

                  <Reveal from="left" delay={300}>
                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#0D3A31]/75 md:text-base">
                      Every map, survey and plan we deliver helps a family secure its land, a city grow
                      safely or a community protect what it depends on. Can't find the exact service?
                      Tell us the problem and we will shape the solution.
                    </p>
                  </Reveal>

                  {/* counting numbers */}
                  <Reveal from="up" delay={400}>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <div className="rounded-2xl bg-[#0D3A31] px-5 py-3 text-white shadow-md">
                        <p className="text-3xl font-bold tabular-nums">
                          <CountUp to={allServices.length} />
                        </p>
                        <p className="text-xs text-white/70">services ready for you</p>
                      </div>
                      <div className="rounded-2xl bg-white px-5 py-3 text-[#0D3A31] shadow-md ring-1 ring-[#1B5E4F]/10">
                        <p className="text-3xl font-bold tabular-nums text-[#1B5E4F]">
                          <CountUp to={categories.length} />
                        </p>
                        <p className="text-xs text-gray-600">areas of expertise</p>
                      </div>
                    </div>
                  </Reveal>

                  <DriftField className="mt-8 grid gap-3 sm:grid-cols-2">
                    {IMPACTS.map((item, i) => (
                      <Reveal key={item.title} from={i % 2 === 0 ? 'left' : 'right'} delay={450 + i * 130} className="h-full">
                        <Drift dy={i % 2 === 0 ? 16 : -16} className="h-full">
                          <div className="group flex h-full items-start gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_14px_28px_-14px_rgba(13,58,49,0.4)]">
                            <span
                              className="svc-bob grid size-10 shrink-0 place-items-center rounded-xl bg-[#1B5E4F] text-white shadow-sm transition duration-300 group-hover:-rotate-6 group-hover:scale-110"
                              style={{ animationDelay: `${i * 0.5}s` }}
                            >
                              <item.icon size={18} />
                            </span>
                            <span>
                              <span className="block text-sm font-bold text-[#0D3A31]">{item.title}</span>
                              <span className="mt-0.5 block text-xs leading-relaxed text-gray-600">{item.text}</span>
                            </span>
                          </div>
                        </Drift>
                      </Reveal>
                    ))}
                  </DriftField>
                </div>

                {/* right: three simple steps + the action */}
                <Reveal from="right" delay={250} className="self-center">
                  <div className="rounded-3xl bg-white p-6 shadow-[0_20px_44px_-20px_rgba(13,58,49,0.5)] ring-1 ring-[#1B5E4F]/10 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F7A]">
                      Three simple steps
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-[#0D3A31]">Start your project today</h3>

                    <StepsList />

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                      <Link
                        to="/about"
                        className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#1B5E4F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95"
                      >
                        {/* light sweeping across the button */}
                        <span
                          aria-hidden="true"
                          className="svc-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                        <MailIcon size={16} className="relative" />
                        <span className="relative">Get in Touch</span>
                        <ArrowRightIcon size={14} className="relative transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                      <Link
                        to="/projects"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E6F1EE] px-5 py-3 text-sm font-semibold text-[#1B5E4F] transition duration-200 hover:bg-[#d8ebe5] active:scale-95"
                      >
                        <FolderIcon size={16} />
                        See our work
                      </Link>
                    </div>

                    <p className="mt-5 flex items-center gap-2 border-t border-[#1B5E4F]/10 pt-4 text-xs text-gray-500">
                      <PinIcon size={14} className="text-[#2F8F7A]" />
                      Kicukiro District, Kigali, Rwanda
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
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