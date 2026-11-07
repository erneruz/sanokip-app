// src/pages/About.jsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../services/projectsService'
import { getServiceLinesWithServices } from '../services/servicesService'

/*
  Peak Star brand colours
    #1B5E4F deep green   #0D3A31 darker green   #2F8F7A mid green
    #9FD8C9 light green  #E6F1EE pale green     #F1F6F4 page tint
*/
const TINT = '#F1F6F4'
const WHITE = '#ffffff'

/*
  Motion switch.
  false = the page always animates (even if Windows has "Show animations" turned off).
  true  = the page switches animations off for people whose device asks for reduced motion.
*/
const RESPECT_REDUCED_MOTION = false

const MR = RESPECT_REDUCED_MOTION
  ? 'motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none'
  : ''

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
  Home: (p) => (
    <Svg {...p}>
      <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z" />
      <path d="M9 22V12h6v10" />
    </Svg>
  ),
  Chevron: (p) => (
    <Svg {...p}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  ),
  Sparkle: (p) => (
    <Svg {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    </Svg>
  ),
  Arrow: (p) => (
    <Svg strokeWidth={2.5} {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </Svg>
  ),
  Pin: (p) => (
    <Svg {...p}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  Target: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </Svg>
  ),
  Eye: (p) => (
    <Svg {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  Shield: (p) => (
    <Svg {...p}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  ),
  Building: (p) => (
    <Svg {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
    </Svg>
  ),
  Chip: (p) => (
    <Svg {...p}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </Svg>
  ),
  Trend: (p) => (
    <Svg {...p}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Svg>
  ),
  Globe: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" />
    </Svg>
  ),
  Map: (p) => (
    <Svg {...p}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </Svg>
  ),
  Layout: (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </Svg>
  ),
  Leaf: (p) => (
    <Svg {...p}>
      <path d="M11 20A7 7 0 0 1 4 13c0-6 6-9 16-9 0 10-3 16-9 16Z" />
      <path d="M4 21c3-6 6-9 11-11" />
    </Svg>
  ),
  Compass: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </Svg>
  ),
  Layers: (p) => (
    <Svg {...p}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </Svg>
  ),
  Radar: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5" />
    </Svg>
  ),
  Landmark: (p) => (
    <Svg {...p}>
      <path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7Z" />
    </Svg>
  ),
  Users: (p) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.8.7 3 2.2 3 5.2" />
    </Svg>
  ),
  Search: (p) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  ),
  Database: (p) => (
    <Svg {...p}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </Svg>
  ),
  Tools: (p) => (
    <Svg {...p}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5Z" />
    </Svg>
  ),
  Flag: (p) => (
    <Svg {...p}>
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
    </Svg>
  ),
  Handshake: (p) => (
    <Svg {...p}>
      <path d="m11 17 2 2a1.4 1.4 0 0 0 2-2M14 14l2.5 2.5a1.4 1.4 0 0 0 2-2L15 11M7 14l3 3M3 9l4-4 5 1 3-1 6 6-3 3" />
    </Svg>
  ),
  Bulb: (p) => (
    <Svg {...p}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
    </Svg>
  ),
  Send: (p) => (
    <Svg {...p}>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
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
}

/* ---------- motion helpers ---------- */

const prefersReducedMotion = () =>
  RESPECT_REDUCED_MOTION &&
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

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

// fades a block in from a direction when it scrolls into view
function Reveal({ children, delay = 0, from = 'up', className = '' }) {
  const [ref, shown] = useInView()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${MR} ${
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
    if (to === null) return
    if (!shown) {
      setValue(0)
      return
    }
    if (prefersReducedMotion()) {
      setValue(to)
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

// sets --p on its element: about -1 to 1 depending on where it is on screen,
// so children (see Drift) can move while you scroll past
function DriftField({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
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

// moves its content while you scroll (big screens). Must sit inside a DriftField.
function Drift({ dx = 0, dy = 0, children, className = '' }) {
  return (
    <div className={`about-drift ${className}`} style={{ '--dx': `${dx}px`, '--dy': `${dy}px` }}>
      {children}
    </div>
  )
}

/* ---------- waves ---------- */
const WAVE_PATH =
  'M0 50 C 150 0, 450 0, 600 50 S 1050 100, 1200 50 S 1650 0, 1800 50 S 2250 100, 2400 50 V100 H0 Z'

// three layers of moving water-like waves
function WaveLayers({ fill }) {
  const layer = 'about-anim absolute bottom-0 left-0 block h-full w-[200%]'
  return (
    <>
      <svg className={`${layer} about-wave-a`} viewBox="0 0 2400 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={WAVE_PATH} fill={fill} fillOpacity="0.3" />
      </svg>
      <svg className={`${layer} about-wave-b`} viewBox="0 0 2400 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={WAVE_PATH} fill={fill} fillOpacity="0.55" />
      </svg>
      <svg className={`${layer} about-wave-c`} viewBox="0 0 2400 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={WAVE_PATH} fill={fill} />
      </svg>
    </>
  )
}

// a strip placed between two sections with a moving wave edge
function Divider({ from, to }) {
  return (
    <div aria-hidden="true" className="relative -mb-px h-10 overflow-hidden sm:h-14" style={{ background: from }}>
      <WaveLayers fill={to} />
    </div>
  )
}

/* ---------- small building blocks ---------- */

function SectionHeading({ chip, ChipIcon, title, accent, children, center = true }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15">
        <ChipIcon size={13} />
        {chip}
      </span>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-[#0D3A31] sm:text-3xl">
        {title} {accent && <span className="text-[#2F8F7A]">{accent}</span>}
      </h2>
      <div className={`mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A] ${center ? 'mx-auto' : ''}`} />
      {children && <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">{children}</p>}
    </div>
  )
}

function DotGrid({ at = '85% 20%' }) {
  return (
    <div
      className="absolute inset-0 opacity-[0.12]"
      style={{
        backgroundImage: 'radial-gradient(circle, #ffffff 1.2px, transparent 1.4px)',
        backgroundSize: '26px 26px',
        WebkitMaskImage: `radial-gradient(ellipse at ${at}, black 0%, transparent 65%)`,
        maskImage: `radial-gradient(ellipse at ${at}, black 0%, transparent 65%)`,
      }}
    />
  )
}

/* ---------- content ---------- */

// floating discipline chips: dx / dy = how far each one drifts while you scroll
const DISCIPLINES = [
  { name: 'Geospatial Technology', icon: I.Globe, style: 'solid', dx: 50, dy: -80 },
  { name: 'Surveying', icon: I.Compass, style: 'pale', dx: -40, dy: 60 },
  { name: 'Geomatics', icon: I.Layers, style: 'outline', dx: 65, dy: 90 },
  { name: 'Land Use Planning', icon: I.Layout, style: 'dark', dx: -55, dy: -60 },
  { name: 'Remote Sensing', icon: I.Radar, style: 'pale', dx: 40, dy: 100 },
  { name: 'GIS', icon: I.Map, style: 'solid', dx: -70, dy: -90 },
  { name: 'Engineering', icon: I.Tools, style: 'outline', dx: 55, dy: -50 },
  { name: 'Mapping', icon: I.Pin, style: 'dark', dx: -45, dy: 70 },
  { name: 'Environment', icon: I.Leaf, style: 'pale', dx: 60, dy: -100 },
  { name: 'Land and Property', icon: I.Landmark, style: 'solid', dx: -50, dy: 80 },
]

const CHIP_STYLES = {
  solid: 'bg-[#1B5E4F] text-white shadow-md',
  pale: 'bg-[#E6F1EE] text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15',
  outline: 'bg-white text-[#0D3A31] ring-1 ring-[#1B5E4F]/25 shadow-sm',
  dark: 'bg-[#0D3A31] text-white shadow-md',
}

const CONTEXT = [
  {
    icon: I.Building,
    title: 'Fast-growing cities',
    text: 'Kigali and secondary cities are expanding quickly. Growth works best when roads, housing, water and green space are planned from accurate maps.',
  },
  {
    icon: I.Trend,
    title: 'A rising economy',
    text: 'Investment in infrastructure, agriculture and services needs reliable land and site information so projects start on solid ground.',
  },
  {
    icon: I.Chip,
    title: 'A digital-first mindset',
    text: 'Rwanda is building a data-driven state. Geospatial technology turns paperwork and guesswork into systems people can query and trust.',
  },
  {
    icon: I.Globe,
    title: 'A connected region',
    text: 'Across East Africa and beyond, the same questions appear: who owns the land, where to build, and how to protect what we cannot replace.',
  },
]

const CAPABILITIES = [
  { icon: I.Map, name: 'Mapping and Cartography', text: 'Base, topographic and thematic maps that make complex places easy to read.' },
  { icon: I.Layout, name: 'Land Use Planning', text: 'Plans that balance growth, services and nature for towns, districts and communities.' },
  { icon: I.Leaf, name: 'Environment Management', text: 'Monitoring wetlands, forests and natural resources so they last for future generations.' },
  { icon: I.Compass, name: 'Surveying', text: 'Precise field measurement for boundaries, engineering works and land records.' },
  { icon: I.Layers, name: 'Geospatial Solutions', text: 'GIS systems and spatial analysis that turn raw data into clear decisions.' },
  { icon: I.Radar, name: 'Remote Sensing', text: 'Satellite and aerial imagery to see change over large areas, quickly.' },
  { icon: I.Landmark, name: 'Land and Property Services', text: 'Support for land information, registration and property management.' },
]

const STEPS = [
  { icon: I.Search, title: 'Understand', text: 'We start with the real problem: who is affected, what decision is needed and what is at stake.' },
  { icon: I.Database, title: 'Collect and analyse', text: 'Field surveys, imagery and records are gathered, checked and analysed with care.' },
  { icon: I.Tools, title: 'Design and build', text: 'We design the map, plan or system, and build it to fit how our clients actually work.' },
  { icon: I.Flag, title: 'Deliver and sustain', text: 'We hand over clear results, train the people who use them and stay available to improve them.' },
]

const VALUES = [
  { icon: I.Target, title: 'Accuracy first', text: 'Good decisions need good data, so we measure twice and document everything.' },
  { icon: I.Shield, title: 'Integrity', text: 'Honest advice, transparent methods and respect for the communities we work with.' },
  { icon: I.Bulb, title: 'Practical innovation', text: 'New tools only when they solve a real problem better than the old way.' },
  { icon: I.Handshake, title: 'Partnership', text: 'We work alongside institutions, innovators and communities, not over them.' },
]

const ACTIONS = [
  { to: '/services', icon: I.Send, title: 'Request a service', text: 'Tell us what you need in a few minutes.', primary: true },
  { to: '/projects', icon: I.Folder, title: 'Browse our projects', text: 'See the work we have delivered and what is underway.' },
  { to: '/publications', icon: I.Book, title: 'Read our publications', text: 'Studies, reports and insights we share openly.' },
]

// how far each column drifts on big screens (4 columns, 3 columns)
const DRIFT_4 = [26, -26, 26, -26]
const DRIFT_3 = [-34, 0, 34]
const FROM_3 = ['left', 'zoom', 'right']

export default function About() {
  const rootRef = useRef(null)
  const barRef = useRef(null)
  const [stats, setStats] = useState({ projects: null, completed: null, ongoing: null, services: null })

  // scroll progress bar + parallax value (one light listener)
  useEffect(() => {
    const reduce = prefersReducedMotion()
    let raf = 0

    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
      }
      if (!reduce && rootRef.current) {
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

  // live numbers from the same sources as the Projects and Services pages
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getProjects(), getServiceLinesWithServices()]).then(([p, s]) => {
      if (cancelled) return
      const next = { projects: null, completed: null, ongoing: null, services: null }
      if (p.status === 'fulfilled' && Array.isArray(p.value)) {
        next.projects = p.value.length
        next.completed = p.value.filter((x) => x.status === 'completed').length
        next.ongoing = p.value.filter((x) => x.status === 'ongoing').length
      }
      if (s.status === 'fulfilled' && Array.isArray(s.value)) {
        next.services = s.value.reduce((sum, line) => sum + (line.services?.length ?? 0), 0)
      }
      setStats(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div ref={rootRef} className="overflow-x-clip bg-[#F1F6F4]">
      <style>{`
        @keyframes about-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes about-wave {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes about-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(24px, -22px, 0) scale(1.08); }
        }
        @keyframes about-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes about-ping {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes about-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .about-rise { animation: about-rise 0.6s ease-out both; }
        .about-rise-delay { animation: about-rise 0.6s ease-out 0.12s both; }
        .about-wave-a { animation: about-wave 26s linear infinite; }
        .about-wave-b { animation: about-wave 17s linear infinite reverse; }
        .about-wave-c { animation: about-wave 11s linear infinite; }
        .about-float { animation: about-float 14s ease-in-out infinite; }
        .about-float-slow { animation: about-float 20s ease-in-out infinite reverse; }
        .about-spin { animation: about-spin 90s linear infinite; transform-origin: 400px 400px; }
        .about-spin-rev { animation: about-spin 140s linear infinite reverse; transform-origin: 400px 400px; }
        .about-ping { animation: about-ping 2.2s ease-out infinite; }
        .about-bob { animation: about-bob 4s ease-in-out infinite; }

        /* cards that move while you scroll (big screens only, so nothing overlaps on phones) */
        .about-drift { will-change: transform; height: 100%; }
        @media (min-width: 1024px) {
          .about-drift {
            transform: translate3d(
              calc(var(--p, 0) * var(--dx, 0px)),
              calc(var(--p, 0) * var(--dy, 0px)),
              0
            );
          }
        }
        ${
          RESPECT_REDUCED_MOTION
            ? `@media (prefers-reduced-motion: reduce) {
          .about-rise, .about-rise-delay, .about-anim, .about-float, .about-float-slow,
          .about-spin, .about-spin-rev, .about-ping, .about-bob { animation: none !important; }
          .about-drift { transform: none !important; }
        }`
            : ''
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ transform: 'translate3d(0, calc(var(--sy, 0) * 0.2px), 0)' }}
        >
          <div className="about-float absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#2F8F7A]/35 blur-3xl" />
          <div className="about-float-slow absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="about-float absolute right-1/3 top-1/3 h-40 w-40 rounded-full bg-[#9FD8C9]/15 blur-3xl" />
          <DotGrid />
        </div>

        <div
          className="mx-auto max-w-6xl px-4 pb-32 pt-16 sm:px-6 md:pb-40 md:pt-24 lg:px-8"
          style={{
            transform: 'translate3d(0, calc(var(--sy, 0) * 0.12px), 0)',
            opacity: 'calc(1 - var(--sy, 0) / 900)',
          }}
        >
          <nav className="about-rise flex items-center gap-1.5 text-xs text-white/60">
            <Link to="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <I.Home size={13} />
              Home
            </Link>
            <I.Chevron size={12} className="text-white/40" />
            <span className="text-white/85">About Us</span>
          </nav>

          <span className="about-rise mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9] ring-1 ring-white/20">
            <I.Sparkle size={13} />
            About Peak Star Engineering
          </span>

          <h1 className="about-rise mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Engineering and technology for the{' '}
            <span className="text-[#9FD8C9]">real problems</span> society faces
          </h1>

          <div className="about-rise mt-5 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />

          <p className="about-rise-delay mt-5 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
            We are a Rwandan geospatial and engineering company. We turn land, cities and landscapes
            into data that governments, businesses and communities can build on, from Kigali to the
            wider region and beyond.
          </p>

          <div className="about-rise-delay mt-8 flex flex-wrap gap-3">
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0D3A31] shadow-sm transition duration-200 hover:bg-[#E6F1EE] hover:shadow-md active:scale-95"
            >
              Explore our services
              <I.Arrow size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 transition duration-200 hover:bg-white/15 active:scale-95"
            >
              See our projects
            </Link>
          </div>
        </div>

        {/* moving wave at the bottom of the hero */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-12 overflow-hidden sm:h-16">
          <WaveLayers fill={TINT} />
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal from="left">
            <SectionHeading chip="Who we are" ChipIcon={I.Users} title="Built to solve problems," accent="not just draw maps" center={false} />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600 md:text-base">
              <p>
                Peak Star Engineering was founded on a simple belief: many of the problems societies
                face, from unclear land boundaries to unplanned growth and fragile ecosystems, are
                problems of missing or unreliable information. Fix the information, and better
                decisions follow.
              </p>
              <p>
                Our team brings together geospatial technology, surveying, geomatics, land use
                planning and software engineering. From precision surveying and land-use planning to
                remote sensing and geospatial analytics, we turn Rwanda's landscapes into data you can
                build on.
              </p>
              <p>
                We are a registered private company in Rwanda, based in Kicukiro District, Kigali,
                and we design every project so that it can grow with the region it serves.
              </p>
            </div>
          </Reveal>

          <Reveal from="right" delay={120}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] p-7 text-white shadow-[0_16px_40px_-16px_rgba(13,58,49,0.5)]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="about-float absolute -right-12 -top-16 h-52 w-52 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
                <DotGrid at="100% 0%" />
              </div>
              <div className="relative">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9]">
                  <I.Pin size={14} />
                  Peak Star at a glance
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { label: 'Projects', value: stats.projects },
                    { label: 'Completed', value: stats.completed },
                    { label: 'In progress', value: stats.ongoing },
                    { label: 'Services', value: stats.services },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                      <dd className="text-3xl font-bold tabular-nums">
                        <CountUp to={s.value} />
                      </dd>
                      <dt className="mt-1 text-xs text-white/70">{s.label}</dt>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 flex items-center gap-2 text-xs text-white/70">
                  <I.Pin size={13} className="text-[#9FD8C9]" />
                  Kicukiro District, Kigali, Rwanda
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── DISCIPLINES: chips that drift as you scroll ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal from="zoom">
          <DriftField className="relative overflow-hidden rounded-3xl border border-[#1B5E4F]/10 bg-white px-6 py-14 shadow-sm sm:px-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="about-float-slow absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#9FD8C9]/25 blur-3xl" />
              <div className="about-float absolute -bottom-20 -right-10 h-60 w-60 rounded-full bg-[#2F8F7A]/15 blur-3xl" />
            </div>

            <div className="relative text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15">
                <I.Layers size={13} />
                Our disciplines
              </span>
              <h2 className="mt-4 text-2xl font-bold text-[#0D3A31] sm:text-3xl">
                One team, <span className="text-[#2F8F7A]">every discipline</span>
              </h2>
              <div className="mx-auto mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />
            </div>

            <div className="relative mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-4 py-10">
              {DISCIPLINES.map((d, i) => (
                <div
                  key={d.name}
                  style={{
                    transform: `translate3d(calc(var(--p, 0) * ${d.dx}px), calc(var(--p, 0) * ${d.dy}px), 0)`,
                  }}
                >
                  <div
                    className={`about-bob about-anim inline-flex cursor-default items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 hover:scale-110 ${CHIP_STYLES[d.style]}`}
                    style={{ animationDelay: `${i * 0.35}s` }}
                  >
                    <d.icon size={16} className={d.style === 'pale' || d.style === 'outline' ? 'text-[#2F8F7A]' : 'text-[#9FD8C9]'} />
                    {d.name}
                  </div>
                </div>
              ))}
            </div>
          </DriftField>
        </Reveal>
      </section>

      <Divider from={TINT} to={WHITE} />

      {/* ── WHY NOW: RWANDA AND THE REGION ── */}
      <section className="bg-white pb-16 pt-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading chip="Why it matters" ChipIcon={I.Globe} title="A country and a region" accent="on the move">
              Rwanda is one of Africa's fastest-changing countries, and its neighbours are moving
              just as fast. Every new road, estate, farm and city block needs reliable spatial
              information behind it.
            </SectionHeading>
          </Reveal>

          <DriftField className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONTEXT.map((c, i) => (
              <Reveal key={c.title} delay={i * 130} className="h-full">
                <Drift dy={DRIFT_4[i % 4]}>
                  <div className="group h-full rounded-2xl border border-[#1B5E4F]/10 bg-[#F8FBFA] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[#1B5E4F]/30 hover:bg-white hover:shadow-[0_16px_32px_-16px_rgba(13,58,49,0.35)]">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F] transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-[#1B5E4F] group-hover:text-white">
                      <c.icon size={20} />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-[#0D3A31]">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{c.text}</p>
                  </div>
                </Drift>
              </Reveal>
            ))}
          </DriftField>
        </div>
      </section>

      <Divider from={WHITE} to={TINT} />

      {/* ── WHAT WE DO ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading chip="What we do" ChipIcon={I.Layers} title="Seven areas of expertise," accent="one connected team">
            Each service stands on its own and works even better together, because the data we
            collect for one job often helps solve the next.
          </SectionHeading>
        </Reveal>

        <DriftField className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.name} from={FROM_3[i % 3]} delay={(i % 3) * 120} className="h-full">
              <Drift dy={DRIFT_3[i % 3]}>
                <Link
                  to="/services"
                  className="group flex h-full flex-col rounded-2xl border border-[#1B5E4F]/10 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-[#1B5E4F]/30 hover:shadow-[0_16px_32px_-16px_rgba(13,58,49,0.35)]"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <c.icon size={20} />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-[#0D3A31] transition-colors group-hover:text-[#1B5E4F]">
                    {c.name}
                  </h3>
                  <span className="mb-3 mt-2 block h-[3px] w-8 rounded-full bg-[#2F8F7A] transition-all duration-300 group-hover:w-14" />
                  <p className="flex-1 text-sm leading-relaxed text-gray-600">{c.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B5E4F]">
                    Learn more
                    <I.Arrow size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Drift>
            </Reveal>
          ))}

          <Reveal from="zoom" delay={240} className="h-full">
            <Drift dy={DRIFT_3[7 % 3]}>
              <Link
                to="/services"
                className="group relative flex h-full min-h-[200px] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] p-6 text-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-16px_rgba(13,58,49,0.6)]"
              >
                <p className="text-lg font-bold">Not sure where to start?</p>
                <p className="mt-2 text-sm text-white/75">Browse every service and send us a request in a few minutes.</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#9FD8C9]">
                  View all services
                  <I.Arrow size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </Drift>
          </Reveal>
        </DriftField>
      </section>

      <Divider from={TINT} to={WHITE} />

      {/* ── HOW WE WORK ── */}
      <section className="bg-white pb-16 pt-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading chip="How we work" ChipIcon={I.Compass} title="From question to" accent="lasting result">
              A clear, repeatable path keeps every project on time, on budget and useful long after
              delivery.
            </SectionHeading>
          </Reveal>

          <StepsRow />
        </div>
      </section>

      <Divider from={WHITE} to={TINT} />

      {/* ── MISSION AND VISION ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <DriftField className="grid gap-6 md:grid-cols-2">
          <Reveal from="left" className="h-full">
            <Drift dy={22}>
              <div className="h-full rounded-3xl bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] p-8 text-white shadow-[0_16px_40px_-16px_rgba(13,58,49,0.5)]">
                <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-[#9FD8C9] ring-1 ring-white/20">
                  <I.Target size={20} />
                </span>
                <h3 className="mt-5 text-xl font-bold">Our mission</h3>
                <div className="mt-2 h-[3px] w-10 rounded-full bg-[#2F8F7A]" />
                <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">
                  To solve real engineering and technology problems with accurate data, sound design and
                  practical delivery, so that the people who plan, build and protect our communities can
                  act with confidence.
                </p>
              </div>
            </Drift>
          </Reveal>
          <Reveal from="right" delay={120} className="h-full">
            <Drift dy={-22}>
              <div className="h-full rounded-3xl border border-[#1B5E4F]/10 bg-white p-8 shadow-sm">
                <span className="grid size-11 place-items-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F]">
                  <I.Eye size={20} />
                </span>
                <h3 className="mt-5 text-xl font-bold text-[#0D3A31]">Our vision</h3>
                <div className="mt-2 h-[3px] w-10 rounded-full bg-[#2F8F7A]" />
                <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
                  A Rwanda, and a region, where every decision about land, cities and the environment is
                  backed by trustworthy spatial evidence, and where local engineers lead the way.
                </p>
              </div>
            </Drift>
          </Reveal>
        </DriftField>
      </section>

      <Divider from={TINT} to={WHITE} />

      {/* ── VALUES ── */}
      <section className="bg-white pb-16 pt-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading chip="Our values" ChipIcon={I.Shield} title="What we stand for," accent="every project">
              These principles guide how we measure, how we advise and how we treat the people we work with.
            </SectionHeading>
          </Reveal>

          <DriftField className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} from="zoom" delay={i * 130} className="h-full">
                <Drift dy={-DRIFT_4[i % 4]}>
                  <div className="group h-full rounded-2xl border border-[#1B5E4F]/10 bg-[#F8FBFA] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[#1B5E4F]/30 hover:bg-white hover:shadow-[0_16px_32px_-16px_rgba(13,58,49,0.35)]">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F] transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-[#1B5E4F] group-hover:text-white">
                      <v.icon size={20} />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-[#0D3A31]">{v.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{v.text}</p>
                  </div>
                </Drift>
              </Reveal>
            ))}
          </DriftField>
        </div>
      </section>

      <Divider from={WHITE} to={TINT} />

      {/* ── BEYOND ENGINEERING ── */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <Reveal from="zoom">
          <div className="grid items-center gap-6 rounded-3xl border border-[#1B5E4F]/10 bg-white p-8 shadow-sm md:grid-cols-[auto_1fr] md:p-10">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
              <I.Sparkle size={24} />
            </span>
            <div>
              <h3 className="text-xl font-bold text-[#0D3A31]">Beyond engineering</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                Peak Star Engineering is only one side of who we are. We also believe in sharing
                knowledge, so we publish articles, studies and reference papers, and we are building
                Peakstar Entertainment as a creative space alongside our technical work.
              </p>
              <Link
                to="/publications"
                className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B5E4F] transition-colors hover:text-[#0D3A31]"
              >
                Read our publications
                <I.Arrow size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CLOSING: contained topographic card ── */}
      <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <Reveal from="zoom">
          <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2E27] via-[#0D3A31] to-[#14493E] text-white shadow-[0_24px_60px_-24px_rgba(13,58,49,0.7)]">
            {/* moving contour lines, like a topographic map */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <svg
                className="absolute -right-48 top-1/2 h-[760px] w-[760px] -translate-y-1/2 opacity-60 lg:-right-32"
                viewBox="0 0 800 800"
                fill="none"
              >
                <g className="about-spin about-anim" stroke="#9FD8C9" strokeWidth="1.2" strokeOpacity="0.22">
                  <ellipse cx="400" cy="400" rx="380" ry="300" />
                  <ellipse cx="400" cy="400" rx="330" ry="255" />
                  <ellipse cx="400" cy="400" rx="280" ry="215" />
                  <ellipse cx="400" cy="400" rx="230" ry="170" />
                  <ellipse cx="400" cy="400" rx="180" ry="130" />
                  <ellipse cx="400" cy="400" rx="130" ry="90" />
                </g>
                <g className="about-spin-rev about-anim" stroke="#2F8F7A" strokeWidth="1.2" strokeOpacity="0.4">
                  <ellipse cx="400" cy="400" rx="355" ry="270" />
                  <ellipse cx="400" cy="400" rx="255" ry="190" />
                  <ellipse cx="400" cy="400" rx="155" ry="110" />
                  <ellipse cx="400" cy="400" rx="80" ry="55" />
                </g>
              </svg>
              <div className="about-float absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[#2F8F7A]/25 blur-3xl" />
              <DotGrid at="20% 100%" />
            </div>

            <div className="grid items-center gap-12 px-6 pb-24 pt-12 sm:px-10 lg:grid-cols-2 lg:px-14 lg:pt-16">
              {/* left: the message */}
              <Reveal from="left" delay={150}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9FD8C9] ring-1 ring-white/20">
                  <I.Compass size={13} />
                  Start a project
                </span>
                <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                  Got a problem <span className="text-[#9FD8C9]">worth mapping?</span>
                </h2>
                <div className="mt-4 h-[3px] w-12 rounded-full bg-[#2F8F7A]" />
                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
                  Whether you need a map, a survey, a plan or a full geospatial system, tell us about your
                  project and we will help you find the right solution.
                </p>

                <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white/10 py-3 pl-3 pr-5 ring-1 ring-white/15 backdrop-blur-sm">
                  <span className="relative grid size-10 place-items-center">
                    <span className="about-ping about-anim absolute inset-0 rounded-full bg-[#9FD8C9]/60" />
                    <span className="relative grid size-10 place-items-center rounded-full bg-[#1B5E4F] text-white ring-2 ring-[#9FD8C9]/50">
                      <I.Pin size={18} />
                    </span>
                  </span>
                  <span>
                    <span className="block text-xs text-white/60">Find us in</span>
                    <span className="block text-sm font-semibold">Kicukiro District, Kigali, Rwanda</span>
                  </span>
                </div>
              </Reveal>

              {/* right: three ways to get started */}
              <div className="space-y-4">
                {ACTIONS.map((a, i) => (
                  <Reveal key={a.to} from="right" delay={200 + i * 130}>
                    <Link
                      to={a.to}
                      className={`group flex items-center gap-4 rounded-2xl p-4 transition duration-300 hover:translate-x-2 ${
                        a.primary
                          ? 'bg-white text-[#0D3A31] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]'
                          : 'bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm hover:bg-white/15 hover:ring-white/30'
                      }`}
                    >
                      <span
                        className={`grid size-12 shrink-0 place-items-center rounded-xl transition duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
                          a.primary ? 'bg-[#1B5E4F] text-white' : 'bg-white/10 text-[#9FD8C9] ring-1 ring-white/15'
                        }`}
                      >
                        <a.icon size={22} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-bold">{a.title}</span>
                        <span className={`block text-sm ${a.primary ? 'text-gray-600' : 'text-white/70'}`}>{a.text}</span>
                      </span>
                      <I.Arrow
                        size={18}
                        className={`shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
                          a.primary ? 'text-[#1B5E4F]' : 'text-[#9FD8C9]'
                        }`}
                      />
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* moving wave along the bottom edge of the card */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-10 overflow-hidden sm:h-12">
              <WaveLayers fill="#1B5E4F" />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

/* the four steps, with a line that draws itself as you scroll to it */
function StepsRow() {
  const [ref, shown] = useInView(0.25)

  return (
    <div ref={ref} className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div
        aria-hidden="true"
        className="absolute left-[12%] right-[12%] top-6 hidden h-[2px] origin-left rounded-full bg-gradient-to-r from-[#1B5E4F]/10 via-[#2F8F7A] to-[#1B5E4F]/10 transition-transform duration-[1600ms] ease-out lg:block"
        style={{ transform: `scaleX(${shown ? 1 : 0})` }}
      />
      {STEPS.map((s, i) => (
        <Reveal key={s.title} delay={i * 180}>
          <div className="relative text-center">
            <span className="relative mx-auto grid size-12 place-items-center">
              <span
                className="about-ping about-anim absolute inset-0 rounded-full bg-[#2F8F7A]/40"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
              <span className="relative grid size-12 place-items-center rounded-full bg-[#1B5E4F] text-white shadow-md ring-8 ring-white">
                <s.icon size={20} />
                <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-[#9FD8C9] text-[11px] font-bold text-[#0D3A31]">
                  {i + 1}
                </span>
              </span>
            </span>
            <h3 className="mt-5 text-base font-bold text-[#0D3A31]">{s.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-600">{s.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}