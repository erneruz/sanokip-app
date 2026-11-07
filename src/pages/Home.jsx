// src/pages/Home.jsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../services/projectsService'
import { getServiceLinesWithServices } from '../services/servicesService'
import { getPublishedPosts } from '../services/postsService'
import { getPublishedPublications } from '../services/publicationsService'
import { getCategory, fileBadgeClass } from '../constants/publications'
import { htmlToPlainText } from '../utils/richText'
import ContactForm from '../components/ContactForm'

import ceoPhoto from '../assets/images/claude.webp'
import projectsBg from '../assets/images/projects.jpg'
import contactBg from '../assets/images/contact.jpg'

/*
  Peak Star brand colours
    #1B5E4F deep green   #0D3A31 darker green   #2F8F7A mid green
    #9FD8C9 light green  #A8E0CE soft green     #E6F1EE pale green   #F1F6F4 page tint
*/
const TINT = '#F1F6F4'
const WHITE = '#ffffff'

/* Fill these in to show them in the Contact section (empty = hidden). */
const CONTACT = {
  email: '',
  phone: '',
  address: 'Kicukiro District, Kigali, Rwanda',
}

/* ---------- icons ---------- */
function Svg({ size = 18, className = '', strokeWidth = 2, children }) {
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

const I = {
  Arrow: (p) => (
    <Svg strokeWidth={2.5} {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </Svg>
  ),
  Sparkle: (p) => (
    <Svg {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </Svg>
  ),
  Pin: (p) => (
    <Svg {...p}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  Quote: (p) => (
    <Svg strokeWidth={1.8} {...p}>
      <path d="M7 7h4v5c0 3-2 5-5 5M15 7h4v5c0 3-2 5-5 5" />
    </Svg>
  ),
  Check: (p) => (
    <Svg strokeWidth={3} {...p}>
      <path d="m5 12 5 5L20 7" />
    </Svg>
  ),
  Calendar: (p) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  ),
  Download: (p) => (
    <Svg {...p}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </Svg>
  ),
  File: (p) => (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </Svg>
  ),
  Tag: (p) => (
    <Svg {...p}>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </Svg>
  ),
  Layers: (p) => (
    <Svg {...p}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </Svg>
  ),
  Folder: (p) => (
    <Svg {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </Svg>
  ),
  Book: (p) => (
    <Svg {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M4 19a2 2 0 0 1 2-2h13" />
    </Svg>
  ),
  Newspaper: (p) => (
    <Svg {...p}>
      <path d="M4 5h13v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
      <path d="M17 9h3v10a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h3" />
    </Svg>
  ),
  Send: (p) => (
    <Svg {...p}>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </Svg>
  ),
  Mail: (p) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  ),
  Phone: (p) => (
    <Svg {...p}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </Svg>
  ),
  Shield: (p) => (
    <Svg {...p}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  ),
  Compass: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </Svg>
  ),
  Image: (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </Svg>
  ),
  Award: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="9" r="6" />
      <path d="m8.5 14 -1.5 8 5-3 5 3-1.5-8" />
    </Svg>
  ),
  Ruler: (p) => (
    <Svg {...p}>
      <path d="M3 17 17 3l4 4L7 21l-4-4Z" />
      <path d="m7 13 2 2M10 10l2 2M13 7l2 2" />
    </Svg>
  ),
  Map: (p) => (
    <Svg {...p}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </Svg>
  ),
  Grid: (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Svg>
  ),
  Leaf: (p) => (
    <Svg {...p}>
      <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" />
      <path d="M5 19c3-5 6-8 10-10" />
    </Svg>
  ),
  Globe: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </Svg>
  ),
  Eye: (p) => (
    <Svg {...p}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
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
    if (!shown || to === null) {
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

  return <span ref={ref}>{to === null ? '—' : value}</span>
}

// sets --p on its element (about -1 to 1 by position on screen) so children can move while you scroll
function DriftField({ children, className = '', style }) {
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
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}

/* ---------- waves ---------- */
const WAVE_PATH =
  'M0 50 C 150 0, 450 0, 600 50 S 1050 100, 1200 50 S 1650 0, 1800 50 S 2250 100, 2400 50 V100 H0 Z'

function WaveLayers({ fill }) {
  const layer = 'absolute bottom-0 left-0 block h-full w-[200%]'
  return (
    <>
      <svg className={`${layer} home-wave-a`} viewBox="0 0 2400 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={WAVE_PATH} fill={fill} fillOpacity="0.3" />
      </svg>
      <svg className={`${layer} home-wave-b`} viewBox="0 0 2400 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={WAVE_PATH} fill={fill} fillOpacity="0.55" />
      </svg>
      <svg className={`${layer} home-wave-c`} viewBox="0 0 2400 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={WAVE_PATH} fill={fill} />
      </svg>
    </>
  )
}

function Divider({ from, to }) {
  return (
    <div aria-hidden="true" className="relative -mb-px h-10 overflow-hidden sm:h-14" style={{ background: from }}>
      <WaveLayers fill={to} />
    </div>
  )
}

/* ---------- small building blocks ---------- */

function SectionHeading({ chip, ChipIcon, title, accent, children, center = true, light = false }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ring-1 ${
          light ? 'bg-white/10 text-[#9FD8C9] ring-white/20' : 'bg-[#E6F1EE] text-[#1B5E4F] ring-[#1B5E4F]/15'
        }`}
      >
        <ChipIcon size={13} />
        {chip}
      </span>
      <h2 className={`mt-4 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl ${light ? 'text-white' : 'text-[#0D3A31]'}`}>
        {title} {accent && <span className={light ? 'text-[#9FD8C9]' : 'text-[#2F8F7A]'}>{accent}</span>}
      </h2>
      <div className={`mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A] ${center ? 'mx-auto' : ''}`} />
      {children && (
        <p className={`mt-4 text-sm leading-relaxed md:text-base ${light ? 'text-white/75' : 'text-gray-600'}`}>
          {children}
        </p>
      )}
    </div>
  )
}

function DotGrid({ at = '85% 20%', color = '#ffffff', opacity = 0.12 }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        backgroundImage: `radial-gradient(circle, ${color} 1.2px, transparent 1.4px)`,
        backgroundSize: '26px 26px',
        WebkitMaskImage: `radial-gradient(ellipse at ${at}, black 0%, transparent 65%)`,
        maskImage: `radial-gradient(ellipse at ${at}, black 0%, transparent 65%)`,
      }}
    />
  )
}

function ButtonLink({ to, children, variant = 'light', icon: Icon }) {
  const styles = {
    light: 'bg-white text-[#0D3A31] shadow-sm hover:bg-[#E6F1EE] hover:shadow-md',
    green: 'bg-[#1B5E4F] text-white shadow-sm hover:bg-[#154A3E] hover:shadow-md',
    ghost: 'bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15',
    soft: 'bg-[#E6F1EE] text-[#1B5E4F] hover:bg-[#d8ebe5]',
  }
  return (
    <Link
      to={to}
      className={`group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition duration-200 active:scale-95 ${styles[variant]}`}
    >
      {Icon && <Icon size={16} />}
      {children}
      <I.Arrow size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-[#DCE9E5] ${className}`} />
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : ''

const STATUS = {
  completed: { label: 'Completed', cls: 'bg-[#1B5E4F] text-white' },
  ongoing: { label: 'Ongoing', cls: 'bg-[#A8E0CE] text-[#0D3A31]' },
  upcoming: { label: 'Upcoming', cls: 'bg-white text-[#1B5E4F]' },
}

/* ---------- services showcase (categories only) ---------- */

// icon + plain-language explanation for each kind of service category
const CATEGORY_INFO = [
  {
    match: ['remote', 'satellite', 'drone'],
    Icon: I.Eye,
    text: 'Satellite and drone imagery that shows change on the ground, from crops and forests to the growth of cities.',
  },
  {
    match: ['geospatial', 'gis'],
    Icon: I.Globe,
    text: 'Location data, dashboards and GIS tools that help leaders see patterns and decide with confidence.',
  },
  {
    match: ['mapping', 'cartograph'],
    Icon: I.Map,
    text: 'Clear, accurate maps that turn complex terrain into pictures that people can read and use.',
  },
  {
    match: ['land use', 'planning', 'zoning'],
    Icon: I.Grid,
    text: 'Plans that guide how districts and cities grow, balancing homes, farms, jobs and nature.',
  },
  {
    match: ['environment', 'social', 'impact'],
    Icon: I.Leaf,
    text: 'Studies that protect people and nature, so projects are safe, sustainable and ready for approval.',
  },
  {
    match: ['survey'],
    Icon: I.Ruler,
    text: 'Precise measurements of land and boundaries, so every plot, road and building starts on solid ground.',
  },
]

const CATEGORY_FALLBACK = {
  Icon: I.Compass,
  text: 'Professional engineering and technology services, delivered with care from first visit to final report.',
}

const getCategoryInfo = (name = '') => {
  const n = name.toLowerCase()
  return CATEGORY_INFO.find((c) => c.match.some((m) => n.includes(m))) ?? CATEGORY_FALLBACK
}

// the newest service of a category (by date when the data has one, otherwise the last added),
// preferring one that has a picture so the card can show it
function pickLatest(services) {
  if (!services.length) return null
  const stamp = (s) => new Date(s.created_at ?? s.updated_at ?? 0).getTime() || 0
  const hasDates = services.some((s) => s.created_at || s.updated_at)
  const ordered = hasDates
    ? [...services].sort((a, b) => stamp(b) - stamp(a))
    : [...services].reverse()
  return ordered.find((s) => s.image_url) ?? ordered[0]
}

const SLIDE_SECONDS = 6

function ServicesShowcase({ lines }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  if (!lines.length) return null

  const current = lines[Math.min(active, lines.length - 1)]
  const info = getCategoryInfo(current.name)
  const CurrentIcon = info.Icon
  const services = current.services ?? []
  const shown = services.slice(0, 6)
  const extra = services.length - shown.length
  const latest = pickLatest(services)
  const picture = latest?.image_url

  const next = () => setActive((a) => (a + 1) % lines.length)

  return (
    <div
      className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* category list */}
      <ul role="tablist" aria-label="Service categories" className="space-y-3">
        {lines.map((l, i) => {
          const isActive = i === active
          const RowIcon = getCategoryInfo(l.name).Icon
          const count = l.services?.length ?? 0
          return (
            <li key={l.id ?? l.name}>
              <Reveal from="left" delay={i * 90}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl px-4 py-4 text-left transition duration-300 ${
                    isActive
                      ? 'bg-[#1B5E4F] text-white shadow-[0_18px_36px_-16px_rgba(13,58,49,0.7)] lg:translate-x-2'
                      : 'bg-white text-[#0D3A31] ring-1 ring-[#1B5E4F]/10 hover:translate-x-1 hover:ring-[#1B5E4F]/30'
                  }`}
                >
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-xl transition duration-300 group-hover:scale-110 ${
                      isActive ? 'bg-white/15 text-[#9FD8C9]' : 'bg-[#E6F1EE] text-[#1B5E4F]'
                    }`}
                  >
                    <RowIcon size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold">{l.name}</span>
                    <span className={`block text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                      {count} {count === 1 ? 'service' : 'services'}
                    </span>
                  </span>
                  <I.Arrow
                    size={16}
                    className={`shrink-0 transition-transform duration-300 ${
                      isActive ? 'translate-x-0 text-[#9FD8C9]' : '-translate-x-1 text-[#2F8F7A] group-hover:translate-x-0'
                    }`}
                  />

                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
                      <span
                        key={active}
                        onAnimationEnd={next}
                        className="home-progress block h-full bg-[#9FD8C9]"
                        style={{ animationDuration: `${SLIDE_SECONDS}s`, animationPlayState: paused ? 'paused' : 'running' }}
                      />
                    </span>
                  )}
                </button>
              </Reveal>
            </li>
          )
        })}
      </ul>

      {/* selected category: the card decides its size, the picture is cropped to fit it */}
      <Reveal from="right" className="h-full">
        <div
          key={active}
          className="home-swap relative isolate flex h-full min-h-[34rem] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2E27] via-[#0D3A31] to-[#1B5E4F] p-7 text-white shadow-[0_28px_60px_-26px_rgba(13,58,49,0.8)] sm:p-9"
        >
          {/* background picture of the latest service */}
          {picture ? (
            <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
              <img
                src={picture}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                className="home-kenburns absolute inset-0 h-full w-full object-cover"
              />
              {/* dark at the top for the words, clearer at the bottom to show the picture */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E27]/95 via-[#0A2E27]/75 to-[#0A2E27]/15" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E27]/70 via-[#0A2E27]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0A2E27]/70 to-transparent" />
            </div>
          ) : (
            <>
              <DotGrid at="90% 10%" opacity={0.16} />
              <div aria-hidden="true" className="home-float absolute -right-16 -top-16 -z-10 size-56 rounded-full bg-[#2F8F7A]/35 blur-3xl" />
            </>
          )}

          <div className="relative flex flex-1 flex-col">
            <div className="flex items-center gap-4">
              <span className="relative grid size-16 shrink-0 place-items-center">
                <span className="home-ping absolute inset-0 rounded-full bg-[#9FD8C9]/40" />
                <span className="relative grid size-16 place-items-center rounded-full bg-white/10 text-[#9FD8C9] ring-1 ring-white/25 backdrop-blur-sm">
                  <CurrentIcon size={30} />
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9FD8C9]">
                  Category {Math.min(active, lines.length - 1) + 1} of {lines.length}
                </p>
                <h3 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{current.name}</h3>
              </div>
            </div>

            <div className="mt-5 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90">{info.text}</p>

            {services.length > 0 && (
              <>
                <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9]">
                  <I.Layers size={14} />
                  What we offer here
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {shown.map((s) => (
                    <li
                      key={s.id ?? s.name}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/15 backdrop-blur-sm"
                    >
                      <span className="grid size-4 place-items-center rounded-full bg-[#2F8F7A] text-white">
                        <I.Check size={10} />
                      </span>
                      {s.name}
                    </li>
                  ))}
                  {extra > 0 && (
                    <li className="inline-flex items-center rounded-full bg-[#2F8F7A]/40 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
                      +{extra} more
                    </li>
                  )}
                </ul>
              </>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/services"
                className="group inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#0D3A31] shadow-lg transition duration-200 hover:bg-[#E6F1EE] active:scale-95"
              >
                <I.Send size={15} className="text-[#2F8F7A]" />
                Request this service
                <I.Arrow size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/70">
                <I.Compass size={13} className="text-[#9FD8C9]" />
                {paused ? 'Paused' : 'Moves on by itself'}
              </span>
            </div>

            {/* which service the picture belongs to */}
            {latest && (
              <div className="mt-auto pt-10">
                <div className="inline-flex max-w-full items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 ring-1 ring-white/25 backdrop-blur-md">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#2F8F7A] text-white">
                    <I.Sparkle size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9FD8C9]">
                      Latest service
                    </span>
                    <span className="block truncate text-sm font-bold">{latest.name}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  )
}

const HERO_TAGS = ['Surveying', 'Geomatics', 'GIS', 'Land Use Planning', 'Remote Sensing']

const EXPECT = [
  'A clear, honest assessment of what you need',
  'A practical plan built around your goals and budget',
  'Accurate delivery, and support after handover',
]

export default function Home() {
  const rootRef = useRef(null)
  const barRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [lines, setLines] = useState([])
  const [posts, setPosts] = useState([])
  const [pubs, setPubs] = useState([])

  // scroll progress bar + parallax value (one light listener)
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

  // load everything the home page shows; one failing source never breaks the others
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      getProjects(),
      getServiceLinesWithServices(),
      getPublishedPosts(),
      getPublishedPublications(),
    ]).then(([p, s, b, u]) => {
      if (cancelled) return
      if (p.status === 'fulfilled' && Array.isArray(p.value)) setProjects(p.value)
      if (s.status === 'fulfilled' && Array.isArray(s.value)) setLines(s.value)
      if (b.status === 'fulfilled' && Array.isArray(b.value)) setPosts(b.value.slice(0, 4))
      if (u.status === 'fulfilled' && Array.isArray(u.value)) setPubs(u.value.slice(0, 4))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const allServicesCount = lines.reduce((sum, l) => sum + (l.services?.length ?? 0), 0)

  const completed = projects.filter((p) => p.status === 'completed').length
  const ongoing = projects.filter((p) => p.status === 'ongoing').length
  const featuredProject = projects.find((p) => p.featured) ?? projects[0]
  const sideProjects = projects.filter((p) => p.id !== featuredProject?.id).slice(0, 2)

  const [bigPost, ...smallPosts] = posts

  return (
    <div ref={rootRef} className="overflow-x-clip bg-[#F1F6F4]">
      <style>{`
        @keyframes home-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes home-wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes home-float { 0%, 100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(24px,-22px,0) scale(1.08); } }
        @keyframes home-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes home-ping { 0% { transform: scale(0.6); opacity: 0.7; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes home-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes home-zoom { from { transform: scale(1); } to { transform: scale(1.12); } }
        @keyframes home-shimmer { 0% { transform: translateX(-160%) skewX(-20deg); } 60%, 100% { transform: translateX(380%) skewX(-20deg); } }
        @keyframes home-turn { to { transform: rotate(360deg); } }
        @keyframes home-turn-rev { to { transform: rotate(-360deg); } }
        @keyframes home-glow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.95; transform: scale(1.08); } }
        @keyframes home-progress { from { width: 0%; } to { width: 100%; } }
        @keyframes home-swap { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
        .home-rise { animation: home-rise 0.7s ease-out both; }
        .home-rise-1 { animation: home-rise 0.7s ease-out 0.12s both; }
        .home-rise-2 { animation: home-rise 0.7s ease-out 0.24s both; }
        .home-rise-3 { animation: home-rise 0.7s ease-out 0.36s both; }
        .home-wave-a { animation: home-wave 26s linear infinite; }
        .home-wave-b { animation: home-wave 17s linear infinite reverse; }
        .home-wave-c { animation: home-wave 11s linear infinite; }
        .home-float { animation: home-float 14s ease-in-out infinite; }
        .home-float-slow { animation: home-float 20s ease-in-out infinite reverse; }
        .home-spin { animation: home-spin 80s linear infinite; transform-origin: 250px 250px; }
        .home-spin-rev { animation: home-spin 120s linear infinite reverse; transform-origin: 250px 250px; }
        .home-ping { animation: home-ping 2.2s ease-out infinite; }
        .home-bob { animation: home-bob 5s ease-in-out infinite; }
        .home-bob-slow { animation: home-bob 7s ease-in-out infinite; }
        .home-kenburns { animation: home-zoom 24s ease-in-out infinite alternate; }
        .home-shimmer { animation: home-shimmer 3.8s ease-in-out infinite; }
        .home-progress { animation-name: home-progress; animation-timing-function: linear; animation-fill-mode: forwards; }
        .home-swap { animation: home-swap 0.6s ease-out both; }

        /* CEO portrait: turning gradient ring, counter-turning dashed orbit, breathing glow */
        .home-ceo-ring {
          background: conic-gradient(from 0deg, #0D3A31, #2F8F7A, #9FD8C9, #1B5E4F, #A8E0CE, #0D3A31);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px));
                  mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px));
          animation: home-turn 14s linear infinite;
        }
        .home-ceo-orbit { animation: home-turn-rev 40s linear infinite; }
        .home-ceo-glow { animation: home-glow 4.5s ease-in-out infinite; }
      `}</style>

      {/* scroll progress bar */}
      <div
        ref={barRef}
        aria-hidden="true"
        className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left bg-gradient-to-r from-[#2F8F7A] to-[#9FD8C9]"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* ───────────────────────── 1. HERO ───────────────────────── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0A2E27] via-[#0D3A31] to-[#1B5E4F] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ transform: 'translate3d(0, calc(var(--sy, 0) * 0.18px), 0)' }}
        >
          <div className="home-float absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#2F8F7A]/35 blur-3xl" />
          <div className="home-float-slow absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="home-float absolute left-1/3 top-1/4 h-44 w-44 rounded-full bg-[#9FD8C9]/15 blur-3xl" />
          <DotGrid at="80% 30%" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-36 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-44">
          {/* words */}
          <div style={{ transform: 'translate3d(0, calc(var(--sy, 0) * 0.08px), 0)' }}>
            <span className="home-rise inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9] ring-1 ring-white/20">
              <I.Sparkle size={13} />
              Welcome to Peak Star Engineering
            </span>

            <h1 className="home-rise-1 mt-6 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              Where every landscape becomes a{' '}
              <span className="bg-gradient-to-r from-[#9FD8C9] to-[#E6F1EE] bg-clip-text text-transparent">
                brighter future
              </span>
            </h1>

            <div className="home-rise-1 mt-6 h-[3px] w-14 rounded-full bg-[#2F8F7A]" />

            <p className="home-rise-2 mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              We map, measure and plan the places where people live, work and dream, turning land into
              data, and data into decisions that last. From Kigali to the wider region, we are here to
              build with you.
            </p>

            <div className="home-rise-3 mt-8 flex flex-wrap gap-3">
              <Link
                to="/services"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#0D3A31] shadow-lg transition duration-200 hover:bg-[#E6F1EE] active:scale-95"
              >
                <span
                  aria-hidden="true"
                  className="home-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-[#1B5E4F]/15 to-transparent"
                />
                <I.Send size={16} className="relative text-[#2F8F7A]" />
                <span className="relative">Hire Peak Star</span>
                <I.Arrow size={14} className="relative transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/25 transition duration-200 hover:bg-white/15 active:scale-95"
              >
                <I.Folder size={16} />
                See our work
              </Link>
            </div>

            <div className="home-rise-3 mt-10 flex flex-wrap gap-2 text-xs font-medium">
              {HERO_TAGS.map((t) => (
                <span key={t} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                  <span className="size-1.5 rounded-full bg-[#9FD8C9]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* living map */}
          <div className="home-rise-2 relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-white/0 ring-1 ring-white/15" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 500" fill="none" aria-hidden="true">
              <g className="home-spin" stroke="#9FD8C9" strokeWidth="1.2" strokeOpacity="0.3">
                <ellipse cx="250" cy="250" rx="230" ry="190" />
                <ellipse cx="250" cy="250" rx="190" ry="152" />
                <ellipse cx="250" cy="250" rx="150" ry="116" />
                <ellipse cx="250" cy="250" rx="110" ry="80" />
                <ellipse cx="250" cy="250" rx="70" ry="48" />
              </g>
              <g className="home-spin-rev" stroke="#2F8F7A" strokeWidth="1.2" strokeOpacity="0.55" strokeDasharray="3 9">
                <ellipse cx="250" cy="250" rx="210" ry="170" />
                <ellipse cx="250" cy="250" rx="130" ry="98" />
              </g>
            </svg>

            {/* the pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="relative grid size-14 place-items-center">
                <span className="home-ping absolute inset-0 rounded-full bg-[#9FD8C9]/60" />
                <span className="relative grid size-14 place-items-center rounded-full bg-[#1B5E4F] text-white shadow-xl ring-4 ring-[#9FD8C9]/40">
                  <I.Pin size={24} />
                </span>
              </span>
              <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0D3A31] shadow-lg">
                Kigali, Rwanda
              </span>
            </div>

            {/* floating cards */}
            <div className="home-bob absolute -left-2 top-[14%] rounded-2xl bg-white/95 px-4 py-3 text-[#0D3A31] shadow-xl sm:-left-6">
              <p className="text-2xl font-bold tabular-nums text-[#1B5E4F]">
                <CountUp to={loading ? null : projects.length} />
              </p>
              <p className="text-[11px] font-medium text-gray-600">projects</p>
            </div>
            <div className="home-bob-slow absolute -right-2 bottom-[16%] rounded-2xl bg-white/95 px-4 py-3 text-[#0D3A31] shadow-xl sm:-right-6">
              <p className="text-2xl font-bold tabular-nums text-[#1B5E4F]">
                <CountUp to={loading ? null : allServicesCount} />
              </p>
              <p className="text-[11px] font-medium text-gray-600">services</p>
            </div>
            <div className="home-bob-slow absolute right-[6%] top-[8%] inline-flex items-center gap-2 rounded-full bg-[#1B5E4F] px-3.5 py-2 text-[11px] font-semibold text-white shadow-xl ring-1 ring-white/20">
              <I.Compass size={13} className="text-[#9FD8C9]" />
              Survey and GIS
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-14 overflow-hidden sm:h-20">
          <WaveLayers fill={WHITE} />
        </div>
      </section>

      {/* ─────────────── 2. WELCOME FROM THE CEO ─────────────── */}
      <section className="bg-white pb-20 pt-10">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[320px_1fr] lg:gap-14 lg:px-8">
          {/* small decorated round portrait */}
          <Reveal from="left">
            <div className="flex justify-center pb-2">
              <div className="relative h-[250px] w-[250px] sm:h-[270px] sm:w-[270px]">
                {/* breathing glow */}
                <div aria-hidden="true" className="home-ceo-glow absolute -inset-6 rounded-full bg-[#9FD8C9]/60 blur-2xl" />

                {/* dashed orbit with three dots, turning the other way */}
                <div
                  aria-hidden="true"
                  className="home-ceo-orbit absolute -inset-5 rounded-full border border-dashed border-[#2F8F7A]/50"
                >
                  <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2F8F7A]" />
                  <span className="absolute bottom-[14%] left-[7%] size-2 rounded-full bg-[#9FD8C9]" />
                  <span className="absolute bottom-[14%] right-[7%] size-1.5 rounded-full bg-[#1B5E4F]" />
                </div>

                {/* turning gradient ring */}
                <div aria-hidden="true" className="home-ceo-ring absolute inset-0 rounded-full" />

                {/* white inner ring + soft shadow */}
                <div
                  aria-hidden="true"
                  className="absolute inset-[9px] rounded-full bg-white shadow-[0_18px_40px_-12px_rgba(13,58,49,0.45)]"
                />

                {/* photo */}
                <div className="absolute inset-[15px] overflow-hidden rounded-full bg-[#E6F1EE]">
                  <img
                    src={ceoPhoto}
                    alt="Mr. Jean Claude Ntirenganya, CEO of Peak Star Engineering"
                    className="h-full w-full object-cover object-top"
                  />
                  <div aria-hidden="true" className="absolute inset-0 rounded-full ring-1 ring-inset ring-[#0D3A31]/10" />
                </div>

                {/* award badge */}
                <div className="home-bob absolute right-1 top-3 sm:right-0">
                  <span className="home-ping absolute inset-0 rounded-full bg-[#2F8F7A]/60" />
                  <span className="relative grid size-11 place-items-center rounded-full bg-gradient-to-br from-[#1B5E4F] to-[#0D3A31] text-white shadow-lg ring-4 ring-white">
                    <I.Award size={20} />
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* message */}
          <div>
            <Reveal from="right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15">
                <I.Quote size={13} />
                A word from our CEO
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-[#0D3A31] sm:text-4xl">
                Welcome to <span className="text-[#2F8F7A]">Peak Star</span>
              </h2>
              <div className="mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />
            </Reveal>

            <Reveal from="right" delay={150}>
              <div className="relative mt-6 rounded-3xl border border-[#1B5E4F]/10 bg-[#F8FBFA] p-6 sm:p-8">
                <I.Quote size={44} className="absolute -top-5 right-6 rounded-xl bg-[#1B5E4F] p-2.5 text-white shadow-md" />
                <div className="space-y-4 text-sm leading-relaxed text-gray-700 md:text-base">
                  <p>
                    It is a pleasure to welcome you to Peak Star Engineering. We exist for one simple
                    reason: too many important decisions about land, cities and infrastructure are made
                    without reliable information, and people pay the price.
                  </p>
                  <p>
                    We believe engineering and technology should serve people first. That is why we bring
                    together surveying, geospatial technology and planning, so that a farmer, a family, a
                    district or a ministry can act with confidence on what they know to be true.
                  </p>
                  <p>
                    Whether you are an institution, a developer, a community or an entrepreneur, our door
                    is open. Tell us the problem, and we will bring the discipline, the technology and the
                    care to solve it. It would be an honour to work with you.
                  </p>
                </div>

                {/* signature */}
                <div className="mt-8 border-t border-[#1B5E4F]/10 pt-6">
                  <p className="text-base font-bold text-[#0D3A31]">Mr. Jean Claude Ntirenganya</p>
                  <p className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2F8F7A]">
                    <span className="h-px w-6 bg-[#2F8F7A]/60" />
                    Chief Executive Officer
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Divider from={WHITE} to={TINT} />

      {/* ───────────────────── 3. SERVICES ───────────────────── */}
      <section className="pb-20 pt-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading chip="What we do" ChipIcon={I.Layers} title="Services built around" accent="your real needs">
              From the first measurement in the field to the final map on your screen, we cover the whole
              journey so you can deal with one trusted team.
            </SectionHeading>
          </Reveal>

          {loading ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
              <Skeleton className="h-96" />
            </div>
          ) : (
            <ServicesShowcase lines={lines} />
          )}

          <Reveal from="zoom" delay={200}>
            <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-3xl bg-gradient-to-r from-[#E6F1EE] to-[#CFEAE0] p-6 text-center ring-1 ring-[#1B5E4F]/10 sm:flex-row sm:p-8 sm:text-left">
              <div>
                <p className="text-lg font-bold text-[#0D3A31]">
                  <span className="tabular-nums text-[#1B5E4F]"><CountUp to={loading ? null : allServicesCount} /></span> services across{' '}
                  <span className="tabular-nums text-[#1B5E4F]"><CountUp to={loading ? null : lines.length} /></span> areas of expertise
                </p>
                <p className="mt-1 text-sm text-gray-600">Find the one that fits, or tell us what is missing.</p>
              </div>
              <ButtonLink to="/services" variant="green">
                Explore all services
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── 4. PROJECTS ───────────────────── */}
      <DriftField className="relative isolate overflow-hidden bg-[#0A2E27] py-24 text-white">
        {/* photo background, moving slower than the page */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src={projectsBg}
            alt=""
            className="home-kenburns absolute inset-0 h-full w-full object-cover"
            style={{ transform: 'translate3d(0, calc(var(--p, 0) * -50px), 0) scale(1.15)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E27] via-[#0A2E27]/80 to-[#0A2E27]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D3A31]/85 via-[#0D3A31]/50 to-[#1B5E4F]/50" />
          <DotGrid at="15% 20%" opacity={0.1} />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading light chip="Our work" ChipIcon={I.Folder} title="Projects that shape" accent="the ground we stand on">
              Real places, real people, real results. Explore what we have delivered and what we are building now.
            </SectionHeading>
          </Reveal>

          {/* counting numbers */}
          <Reveal delay={150}>
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                { label: 'Projects', value: projects.length },
                { label: 'Completed', value: completed },
                { label: 'In progress', value: ongoing },
              ].map((n) => (
                <div key={n.label} className="rounded-2xl bg-white/10 px-4 py-4 text-center ring-1 ring-white/20 backdrop-blur-md">
                  <p className="text-3xl font-bold tabular-nums">
                    <CountUp to={loading ? null : n.value} />
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">{n.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {loading ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              <Skeleton className="h-96 bg-white/10" />
              <div className="space-y-6">
                <Skeleton className="h-44 bg-white/10" />
                <Skeleton className="h-44 bg-white/10" />
              </div>
            </div>
          ) : featuredProject ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              {/* big project */}
              <Reveal from="left" className="h-full">
                <Link
                  to="/projects"
                  className="group relative block h-full min-h-[24rem] overflow-hidden rounded-3xl bg-[#0D3A31] shadow-[0_28px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/15"
                >
                  {featuredProject.image_url && (
                    <img
                      src={featuredProject.image_url}
                      alt={featuredProject.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0A2E27] via-[#0A2E27]/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      {STATUS[featuredProject.status] && (
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS[featuredProject.status].cls}`}>
                          {STATUS[featuredProject.status].label}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                        <I.Sparkle size={11} />
                        Featured
                      </span>
                    </div>
                    <h3 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{featuredProject.title}</h3>
                    <div className="mt-3 h-[3px] w-10 rounded-full bg-[#2F8F7A] transition-all duration-300 group-hover:w-20" />
                    <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80">
                      {htmlToPlainText(featuredProject.description)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/70">
                      {featuredProject.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <I.Pin size={13} className="text-[#9FD8C9]" />
                          {featuredProject.location}
                        </span>
                      )}
                      {featuredProject.year && (
                        <span className="inline-flex items-center gap-1.5">
                          <I.Calendar size={13} className="text-[#9FD8C9]" />
                          {featuredProject.year}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </Reveal>

              {/* two smaller projects */}
              <div className="flex flex-col gap-6">
                {sideProjects.map((p, i) => (
                  <Reveal key={p.id} from="right" delay={150 + i * 150} className="flex-1">
                    <Link
                      to="/projects"
                      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/15 sm:flex-row lg:flex-col xl:flex-row"
                    >
                      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-[#0D3A31] sm:aspect-auto sm:w-2/5 lg:aspect-[16/10] lg:w-full xl:aspect-auto xl:w-2/5">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.title}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-center p-5">
                        {STATUS[p.status] && (
                          <span className={`mb-2 w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS[p.status].cls}`}>
                            {STATUS[p.status].label}
                          </span>
                        )}
                        <h3 className="line-clamp-2 text-base font-bold leading-snug">{p.title}</h3>
                        {p.location && (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70">
                            <I.Pin size={12} className="text-[#9FD8C9]" />
                            {p.location}
                          </p>
                        )}
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}

          <Reveal delay={200}>
            <div className="mt-12 text-center">
              <ButtonLink to="/projects" variant="light">
                Explore all projects
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </DriftField>

      {/* ───────────────────── 5. BLOG ───────────────────── */}
      <section className="bg-white pb-20 pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading chip="Blog and news" ChipIcon={I.Newspaper} title="Fresh thinking from" accent="our field">
              Stories, insights and lessons on geospatial technology, land and the places we build.
            </SectionHeading>
          </Reveal>

          {loading ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
              <Skeleton className="h-[30rem]" />
              <div className="space-y-4">
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
              </div>
            </div>
          ) : bigPost ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
              {/* big latest post */}
              <Reveal from="left" className="h-full">
                <Link
                  to={`/posts/${bigPost.slug}`}
                  className="group relative block h-full min-h-[26rem] overflow-hidden rounded-3xl bg-[#0D3A31] shadow-[0_24px_50px_-22px_rgba(13,58,49,0.6)] lg:min-h-[32rem]"
                >
                  {bigPost.cover_image_url ? (
                    <img
                      src={bigPost.cover_image_url}
                      alt={bigPost.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white/30">
                      <I.Image size={56} strokeWidth={1.2} />
                    </div>
                  )}
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0A2E27] via-[#0A2E27]/45 to-transparent" />

                  <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-[#1B5E4F] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md">
                    <I.Sparkle size={12} />
                    Latest
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                      <I.Tag size={11} />
                      {bigPost.categories?.name || 'Article'}
                    </span>
                    <h3 className="mt-3 line-clamp-3 text-2xl font-bold leading-tight sm:text-3xl">{bigPost.title}</h3>
                    <div className="mt-3 h-[3px] w-10 rounded-full bg-[#2F8F7A] transition-all duration-300 group-hover:w-20" />
                    <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80">{bigPost.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-white/75">
                      <span className="inline-flex items-center gap-1.5">
                        <I.Calendar size={13} className="text-[#9FD8C9]" />
                        {formatDate(bigPost.published_at)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#9FD8C9]">
                        Read article
                        <I.Arrow size={13} className="transition-transform duration-200 group-hover:translate-x-1.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>

              {/* three smaller posts */}
              <div className="flex flex-col gap-4">
                {smallPosts.map((post, i) => (
                  <Reveal key={post.id} from="right" delay={150 + i * 140} className="flex-1">
                    <Link
                      to={`/posts/${post.slug}`}
                      className="group flex h-full gap-4 rounded-2xl border border-[#1B5E4F]/10 bg-[#F8FBFA] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#1B5E4F]/30 hover:bg-white hover:shadow-[0_16px_30px_-16px_rgba(13,58,49,0.4)]"
                    >
                      <div className="relative w-28 shrink-0 overflow-hidden rounded-xl bg-[#E6F1EE] sm:w-36">
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-[#1B5E4F]/40">
                            <I.Image size={26} />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2">
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#E6F1EE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1B5E4F]">
                          <I.Tag size={10} />
                          {post.categories?.name || 'Article'}
                        </span>
                        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-[#0D3A31] transition-colors group-hover:text-[#1B5E4F] sm:text-base">
                          {post.title}
                        </h3>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <I.Calendar size={12} className="text-[#2F8F7A]" />
                          {formatDate(post.published_at)}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}

                <Reveal from="right" delay={600}>
                  <Link
                    to="/blog"
                    className="group flex items-center justify-between rounded-2xl bg-[#1B5E4F] px-5 py-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md"
                  >
                    Explore more articles
                    <I.Arrow size={15} className="transition-transform duration-200 group-hover:translate-x-1.5" />
                  </Link>
                </Reveal>
              </div>
            </div>
          ) : (
            <p className="mt-12 text-center text-sm text-gray-500">New articles are on the way.</p>
          )}
        </div>
      </section>

      <Divider from={WHITE} to={TINT} />

      {/* ─────────────── 6. PUBLICATIONS ─────────────── */}
      <section className="pb-20 pt-8">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          {/* sticky intro */}
          <Reveal from="left">
            <div className="lg:sticky lg:top-28">
              <SectionHeading center={false} chip="Publications" ChipIcon={I.Book} title="Knowledge you can" accent="keep and use">
                Policy frameworks, studies, technical reports and advisory papers, free to read and
                download.
              </SectionHeading>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink to="/publications" variant="green" icon={I.Book}>
                  Browse all publications
                </ButtonLink>
              </div>

              <div className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-[#1B5E4F]/10">
                <span className="grid size-11 place-items-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F]">
                  <I.File size={20} />
                </span>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-[#1B5E4F]">
                    <CountUp to={loading ? null : pubs.length} />
                  </p>
                  <p className="text-xs text-gray-500">latest publications shown</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* document list */}
          <div>
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-28" />
                ))}
              </div>
            ) : pubs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#1B5E4F]/30 bg-white/70 px-6 py-12 text-center text-sm text-gray-500">
                New publications are on the way.
              </p>
            ) : (
              <ol className="space-y-4">
                {pubs.map((p, i) => {
                  const categoryLabel = getCategory(p.category)?.label || p.category
                  return (
                    <li key={p.id}>
                      <Reveal from="right" delay={i * 130}>
                        <article className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#1B5E4F]/10 bg-white p-4 shadow-sm transition duration-300 hover:translate-x-2 hover:border-[#1B5E4F]/30 hover:shadow-[0_18px_36px_-18px_rgba(13,58,49,0.4)] sm:gap-5 sm:p-5">
                          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#2F8F7A] to-[#1B5E4F]" />

                          <span className="hidden w-12 shrink-0 text-center text-4xl font-bold tabular-nums text-[#1B5E4F]/15 transition-colors duration-300 group-hover:text-[#2F8F7A]/40 sm:block">
                            {String(i + 1).padStart(2, '0')}
                          </span>

                          <span
                            className={`inline-flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold uppercase ${fileBadgeClass(
                              p.file_ext
                            )}`}
                          >
                            <I.File size={16} />
                            {p.file_ext || 'file'}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
                              <span className="rounded-full bg-[#1B5E4F] px-2.5 py-0.5 text-white">{categoryLabel}</span>
                              {p.publication_date && (
                                <span className="inline-flex items-center gap-1 text-gray-500">
                                  <I.Calendar size={11} className="text-[#2F8F7A]" />
                                  {formatDate(p.publication_date)}
                                </span>
                              )}
                            </div>
                            <h3 className="mt-2 line-clamp-2 break-words text-base font-bold leading-snug text-[#0D3A31] transition-colors group-hover:text-[#1B5E4F]">
                              {p.title}
                            </h3>
                          </div>

                          <a
                            href={p.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Download ${p.title}`}
                            className="grid size-11 shrink-0 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F] transition duration-200 hover:bg-[#1B5E4F] hover:text-white active:scale-90"
                          >
                            <I.Download size={18} />
                          </a>
                        </article>
                      </Reveal>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────── 7. WRITE TO US ─────────────────── */}
      <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <Reveal from="zoom">
          <DriftField className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#0A2E27] text-white shadow-[0_30px_70px_-28px_rgba(13,58,49,0.8)]">
            {/* photo background */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
              <img
                src={contactBg}
                alt=""
                className="home-kenburns absolute inset-0 h-full w-full object-cover"
                style={{ transform: 'translate3d(0, calc(var(--p, 0) * -30px), 0) scale(1.12)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E27] via-[#0A2E27]/90 to-[#0D3A31]/70" />
              <div className="home-float absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
              <DotGrid at="0% 100%" opacity={0.1} />
            </div>

            <div className="grid items-center gap-12 p-6 pb-24 sm:p-10 sm:pb-24 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:p-14 lg:pb-28">
              {/* left: serious message */}
              <div>
                <Reveal from="left" delay={150}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9] ring-1 ring-white/20">
                    <I.Send size={13} />
                    Write to us
                  </span>
                  <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                    Tell us what you have in <span className="text-[#9FD8C9]">mind</span>
                  </h2>
                  <div className="mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />
                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
                    Every project begins with a conversation. Send us a few words about your land, your
                    plan or your challenge, and our team will respond with a clear, professional way
                    forward.
                  </p>
                </Reveal>

                <ul className="mt-8 space-y-4">
                  {EXPECT.map((text, i) => (
                    <li key={text}>
                      <Reveal from="left" delay={300 + i * 140}>
                        <span className="flex items-start gap-3 text-sm text-white/90">
                          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#2F8F7A] text-white">
                            <I.Check size={13} />
                          </span>
                          {text}
                        </span>
                      </Reveal>
                    </li>
                  ))}
                </ul>

                <Reveal delay={700}>
                  <div className="mt-8 space-y-2.5 text-sm text-white/80">
                    <p className="flex items-center gap-2.5">
                      <I.Pin size={16} className="text-[#9FD8C9]" />
                      {CONTACT.address}
                    </p>
                    {CONTACT.email && (
                      <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2.5 transition-colors hover:text-white">
                        <I.Mail size={16} className="text-[#9FD8C9]" />
                        {CONTACT.email}
                      </a>
                    )}
                    {CONTACT.phone && (
                      <a href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 transition-colors hover:text-white">
                        <I.Phone size={16} className="text-[#9FD8C9]" />
                        {CONTACT.phone}
                      </a>
                    )}
                    <p className="flex items-center gap-2.5 text-white/60">
                      <I.Shield size={16} className="text-[#9FD8C9]" />
                      Peakstar Ltd, a registered private company in Rwanda
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {[
                      { to: '/services', icon: I.Layers, label: 'Our services' },
                      { to: '/projects', icon: I.Folder, label: 'Our track record' },
                      { to: '/about', icon: I.Compass, label: 'Meet the team' },
                    ].map((a) => (
                      <Link
                        key={a.to}
                        to={a.to}
                        className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-white/20 transition duration-200 hover:bg-white/20 active:scale-95"
                      >
                        <a.icon size={13} className="text-[#9FD8C9]" />
                        {a.label}
                        <I.Arrow size={11} className="text-[#9FD8C9] transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </Reveal>
              </div>

              {/* right: the message form */}
              <Reveal from="right" delay={250}>
                <ContactForm />
              </Reveal>
            </div>

            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-10 overflow-hidden sm:h-14">
              <WaveLayers fill="#1B5E4F" />
            </div>
          </DriftField>
        </Reveal>
      </section>
    </div>
  )
}