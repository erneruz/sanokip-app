// src/components/entertainment/EntertainmentNavbar.jsx
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { entRoleLabel } from '../../services/entertainmentUsersService'
import { TALENT_CATEGORIES } from '../../constants/talentCategories'
import logoWhite from '../../assets/images/peakstar-logo-white-small.png'

// every Entertainment address starts with this
const ENT = '/entertainment'

// Colours: only the Peak Star greens. Light green #9FD8C9 / #CDEBE2 is the highlight,
// #2F9678 the mid green, #0A2E27 / #0D3A31 the dark greens.

/* ---------- small icons ---------- */
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
function HomeIcon(p) {
  return (
    <Svg {...p}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h5v-6h4v6h5V10" />
    </Svg>
  )
}
function StarIcon(p) {
  return (
    <Svg {...p}>
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </Svg>
  )
}
function FlagIcon(p) {
  return (
    <Svg {...p}>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </Svg>
  )
}
function BriefcaseIcon(p) {
  return (
    <Svg {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </Svg>
  )
}
function RouteIcon(p) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" />
    </Svg>
  )
}
function ShieldCheckIcon(p) {
  return (
    <Svg {...p}>
      <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  )
}
function TrophyIcon(p) {
  return (
    <Svg {...p}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    </Svg>
  )
}
function SearchIcon(p) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  )
}
function InfoIcon(p) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </Svg>
  )
}
function MailIcon(p) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  )
}
function NewsIcon(p) {
  return (
    <Svg {...p}>
      <path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Z" />
      <path d="M19 9h2v9a2 2 0 0 1-2 2M8 8h7M8 12h7M8 16h4" />
    </Svg>
  )
}
function VideoIcon(p) {
  return (
    <Svg {...p}>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="m16 10 5-3v10l-5-3" />
    </Svg>
  )
}
function UserIcon(p) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Svg>
  )
}
function ArrowRightIcon(p) {
  return (
    <Svg {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </Svg>
  )
}
function ArrowLeftIcon(p) {
  return (
    <Svg {...p}>
      <path d="M19 12H5M11 5l-7 7 7 7" />
    </Svg>
  )
}
function GridIcon(p) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  )
}
function ShieldIcon(p) {
  return (
    <Svg {...p}>
      <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />
    </Svg>
  )
}
function LogoutIcon(p) {
  return (
    <Svg {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </Svg>
  )
}
function ChevronIcon(p) {
  return (
    <Svg {...p}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

// one small icon for each talent category
function CategoryIcon({ slug, size = 18 }) {
  switch (slug) {
    case 'music':
      return (
        <Svg size={size}>
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
        </Svg>
      )
    case 'movie':
      return (
        <Svg size={size}>
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path d="m3 8 3.5-5 3.5 5M10 8l3.5-5L17 8M13.5 8l3.5-5 4 5" />
        </Svg>
      )
    case 'dance':
      return (
        <Svg size={size}>
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
          <path d="M19 16v4M17 18h4" />
        </Svg>
      )
    case 'football':
      return (
        <Svg size={size}>
          <circle cx="12" cy="12" r="9" />
          <path d="m12 8 3.5 2.5-1.3 4.2H9.8L8.5 10.5 12 8Z" />
          <path d="M12 3v5M20.5 9.5l-5 1M17.5 19l-3.3-4.3M6.5 19l3.3-4.3M3.5 9.5l5 1" />
        </Svg>
      )
    case 'basketball':
      return (
        <Svg size={size}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3v18M5.5 5.5c3 3 3 10 0 13M18.5 5.5c-3 3-3 10 0 13" />
        </Svg>
      )
    case 'volleyball':
      return (
        <Svg size={size}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c0 6-3 9-9 9M12 3c2 3 5 5 8.5 5M20.5 15.5C15 15 11 17 9 21M5 18.5c3-4.5 8-6 15.5-3" />
        </Svg>
      )
    case 'athletics':
      return (
        <Svg size={size}>
          <circle cx="12" cy="14" r="7" />
          <path d="M12 14v-4M9 2h6M12 2v3M18.5 6.5 20 5" />
        </Svg>
      )
    default:
      return (
        <Svg size={size}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </Svg>
      )
  }
}

/* ---------- the links ---------- */
// Pages that sit under "More"
const moreLinks = [
  { to: `${ENT}/opportunities`, label: 'Opportunities', hint: 'Trials, auditions, scholarships', icon: FlagIcon, match: [`${ENT}/opportunities`] },
  { to: `${ENT}/partners`, label: 'For partners', hint: 'Clubs, labels, agents, brands', icon: BriefcaseIcon, match: [`${ENT}/partners`] },
  { to: `${ENT}/how-it-works`, label: 'How it works', hint: 'From a clip to an opportunity', icon: RouteIcon, match: [`${ENT}/how-it-works`] },
  { to: `${ENT}/parents`, label: 'For parents', hint: 'Safety and consent', icon: ShieldCheckIcon, match: [`${ENT}/parents`] },
  { to: `${ENT}/stories`, label: 'Success stories', hint: 'Talents who made it', icon: TrophyIcon, match: [`${ENT}/stories`] },
  { to: `${ENT}/track`, label: 'Track submission', hint: 'Follow your clip', icon: SearchIcon, match: [`${ENT}/track`] },
]

// The links in the bar (desktop). "menu" = the link opens a dropdown panel.
const barItems = [
  { key: 'home', label: 'Home', to: ENT, end: true, icon: HomeIcon },
  { key: 'about', label: 'About Us', to: `${ENT}/about`, match: [`${ENT}/about`], icon: InfoIcon },
  { key: 'talents', label: 'Talents', to: `${ENT}/talents`, match: [`${ENT}/talents`, `${ENT}/talent`], icon: StarIcon, menu: 'talents' },
  { key: 'news', label: 'News', to: `${ENT}/news`, match: [`${ENT}/news`], icon: NewsIcon },
  { key: 'contact', label: 'Contact Us', to: `${ENT}/contact`, match: [`${ENT}/contact`], icon: MailIcon },
  { key: 'more', label: 'More', menu: 'more', children: moreLinks },
]

// the phone menu: the main links, then everything that sits under More
const mobileLinks = [
  ...barItems.filter((i) => i.key !== 'more'),
  ...moreLinks.map((l) => ({ ...l, key: l.to })),
]

function pathMatches(pathname, link) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (link.end) return path === link.to
  return (link.match ?? [link.to]).some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

function isItemActive(item, pathname) {
  if (item.children) return item.children.some((c) => pathMatches(pathname, c))
  return pathMatches(pathname, item)
}

/* ---------- the Log in button ---------- */
// flowing green border, a light-green user badge that tilts, a shine that
// sweeps across on hover, and an arrow that slides.
function LoginButton({ full = false, onClick }) {
  return (
    <Link
      to={`${ENT}/login`}
      onClick={onClick}
      aria-label="Log in"
      className={`ent-login group relative rounded-full p-[1.5px] shadow-[0_10px_28px_-10px_rgba(159,216,201,0.45)] transition-shadow duration-300 hover:shadow-[0_14px_34px_-8px_rgba(159,216,201,0.75)] ${
        full ? 'flex w-full' : 'inline-flex'
      }`}
    >
      <span aria-hidden="true" className="ent-flow absolute inset-0 rounded-full" />
      <span
        className={`relative flex items-center gap-2.5 overflow-hidden rounded-full bg-[#0A2E27] py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white transition-colors duration-300 group-hover:bg-[#0F3D32] ${
          full ? 'w-full justify-center py-2.5 text-base' : ''
        }`}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#9FD8C9] to-[#2F9678] text-[#0A2E27] shadow-inner transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
          <UserIcon size={16} strokeWidth={2.4} />
        </span>
        Log in
        <ArrowRightIcon size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        <span aria-hidden="true" className="ent-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/25" />
      </span>
    </Link>
  )
}

/* ---------- the navbar ---------- */
export default function EntertainmentNavbar() {
  const { user: authUser, signOut, entProfile, can, loading } = useAuth()

  // Only people who belong to Peak Star Entertainment show as "signed in" here:
  // an Entertainment member, or an Entertainment staff member / Super Admin.
  // Someone logged in only to Peak Star Engineering, or nobody, sees Sign in / Join.
  const isEntPerson = !!authUser && (!!entProfile || can.entertainmentUsers || can.entertainmentContent)
  const user = isEntPerson ? authUser : null
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [menuOpen, setMenuOpen] = useState(false) // avatar dropdown (desktop)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0) // how far down the page, 0 to 100
  const menuRef = useRef(null)

  // dropdown panels under "Talents" and "More"
  const [panel, setPanel] = useState(null) // 'talents' | 'more' | null
  const closeTimer = useRef(null)
  const openPanel = (name) => {
    clearTimeout(closeTimer.current)
    setPanel(name)
  }
  const closePanelSoon = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setPanel(null), 140) // small delay so it does not flicker
  }
  const closePanelNow = () => {
    clearTimeout(closeTimer.current)
    setPanel(null)
  }

  // where the admin link goes: Entertainment staff and the Super Admin open the
  // Entertainment admin; Engineering-only admins open the Engineering admin
  const adminLink =
    can.entertainmentUsers || can.entertainmentContent
      ? '/admin/entertainment'
      : can.engineering
        ? '/admin'
        : null

  // the bar becomes more solid once you scroll, and the line follows your scroll
  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        const max = document.documentElement.scrollHeight - window.innerHeight
        setScrolled(y > 8)
        setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0)
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  // close menus on page change, on outside click and on Escape
  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
    closePanelNow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    function onDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setMobileOpen(false)
        closePanelNow()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      clearTimeout(closeTimer.current)
    }
  }, [])

  async function handleSignOut() {
    setMenuOpen(false)
    setMobileOpen(false)
    await signOut()
    navigate(ENT)
  }

  // the name and the kind of user come from the Entertainment profile
  // (not from the Peak Star Engineering profile)
  const displayName = entProfile?.full_name || user?.email || 'Account'
  const roleText = entProfile
    ? `${entRoleLabel(entProfile.role)}${entProfile.status === 'pending' ? ' · Waiting for approval' : ''}`
    : 'Join Entertainment'

  const avatar = (size) => (
    <span className={`${size} shrink-0 overflow-hidden rounded-full bg-[#9FD8C9]/20 ring-2 ring-[#9FD8C9]/70`}>
      <span className="flex h-full w-full items-center justify-center text-xs font-bold text-[#9FD8C9]">
        {displayName?.[0]?.toUpperCase() ?? '?'}
      </span>
    </span>
  )

  return (
    <header
      className={`ent-nav sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/10 bg-[#0A2E27]/90 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.6)] backdrop-blur-xl'
          : 'border-transparent bg-[#0A2E27]'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .ent-nav { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }

        /* flowing border of the Log in button */
        .ent-flow {
          background-image: linear-gradient(90deg, #2F9678, #9FD8C9, #E6F1EE, #9FD8C9, #2F9678);
          background-size: 300% 100%;
          animation: ent-flow 5s linear infinite;
        }
        @keyframes ent-flow { to { background-position: 300% 0; } }

        /* shine that sweeps across the Log in button on hover */
        .ent-sheen { transform: translateX(-160%) skewX(-12deg); }
        .ent-login:hover .ent-sheen { animation: ent-sheen 0.9s ease-out; }
        @keyframes ent-sheen {
          from { transform: translateX(-160%) skewX(-12deg); }
          to { transform: translateX(420%) skewX(-12deg); }
        }

        /* hover effect of the links: a light-green line grows from the centre,
           a soft glow rises from below, and the text lifts a little */
        .ent-link { position: relative; transition: color .25s ease, transform .25s ease; }
        .ent-link::before {
          content: ''; position: absolute; inset: 0; border-radius: 9999px; z-index: -1;
          background: radial-gradient(ellipse at 50% 100%, rgba(159,216,201,.28), transparent 70%);
          opacity: 0; transition: opacity .3s ease;
        }
        .ent-link::after {
          content: ''; position: absolute; left: 50%; bottom: 2px; height: 2px; width: 0;
          border-radius: 9999px; transform: translateX(-50%);
          background: linear-gradient(90deg, transparent, #CDEBE2, transparent);
          box-shadow: 0 0 10px rgba(159,216,201,.9);
          transition: width .35s cubic-bezier(.2,.8,.2,1);
        }
        .ent-link:hover, .ent-link:focus-visible, .ent-link[data-open='true'] { color: #CDEBE2; transform: translateY(-1px); }
        .ent-link:hover::before, .ent-link:focus-visible::before, .ent-link[data-open='true']::before { opacity: 1; }
        .ent-link:hover::after, .ent-link:focus-visible::after, .ent-link[data-open='true']::after { width: 70%; }
        /* the page you are on: light green text and a small dot */
        .ent-link[data-active='true'] { color: #9FD8C9; }
        .ent-link[data-active='true']::after { width: 6px; height: 6px; bottom: 0; background: #9FD8C9; transition: width .35s cubic-bezier(.2,.8,.2,1); }
        .ent-link[data-active='true']:hover::after { width: 70%; height: 2px; bottom: 2px; background: linear-gradient(90deg, transparent, #CDEBE2, transparent); }

        /* menus opening */
        @keyframes ent-drop {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ent-item {
          from { opacity: 0; transform: translateX(-14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .ent-drop { animation: ent-drop 0.22s ease-out both; }
        .ent-item { animation: ent-item 0.4s ease-out both; }

        @media (prefers-reduced-motion: reduce) {
          .ent-flow, .ent-drop, .ent-item { animation: none; }
          .ent-link, .ent-link::after, .ent-link::before { transition: none; }
          .ent-login:hover .ent-sheen { animation: none; }
        }
      `}</style>

      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        {/* ── logo (no hover effect) ── */}
        <Link to={ENT} className="flex shrink-0 flex-col items-center" aria-label="Peak Star Entertainment, home">
          <img src={logoWhite} alt="Peak Star" className="h-11 w-auto object-contain" />
          <span className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#9FD8C9]">
            <span className="size-1 rounded-full bg-[#9FD8C9]" />
            Entertainment
          </span>
        </Link>

        {/* ── links (desktop) ── */}
        <div
          className="relative hidden items-center gap-1 lg:flex"
          onMouseLeave={() => {
            closePanelSoon()
          }}
        >
          {barItems.map((item) => {
            const active = isItemActive(item, pathname)
            const open = panel === item.menu && !!item.menu
            const handlers = {
              onMouseEnter: () => {
                if (item.menu) openPanel(item.menu)
                else closePanelNow()
              },
              onFocus: () => {
                if (item.menu) openPanel(item.menu)
              },
            }
            const cls = `ent-link inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium ${
              active ? '' : 'text-white/75'
            }`
            const chevron = item.menu ? (
              <ChevronIcon size={13} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            ) : null

            // "More" is a button that opens a list; the others are real links
            if (item.menu === 'more') {
              return (
                <button
                  key={item.key}
                  type="button"
                  {...handlers}
                  onClick={() => (panel === 'more' ? closePanelNow() : openPanel('more'))}
                  aria-haspopup="menu"
                  aria-expanded={panel === 'more'}
                  data-active={active}
                  data-open={open}
                  className={cls}
                >
                  {item.label}
                  {chevron}
                </button>
              )
            }
            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                {...handlers}
                data-active={active}
                data-open={open}
                className={cls}
              >
                {item.label}
                {chevron}
              </NavLink>
            )
          })}

          {/* panel under "Talents": the categories */}
          {panel === 'talents' && (
            <div className="absolute left-0 top-full z-30 w-[37rem] pt-3" onMouseEnter={() => openPanel('talents')}>
              <div className="ent-drop overflow-hidden rounded-2xl bg-[#0D3A31] p-3 shadow-[0_28px_60px_-14px_rgba(0,0,0,0.75)] ring-1 ring-white/15">
                <div className="flex items-center justify-between px-3 pb-2 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9FD8C9]">Browse by category</p>
                  <Link
                    to={`${ENT}/talents`}
                    className="group/all inline-flex items-center gap-1.5 text-xs font-semibold text-[#9FD8C9] transition hover:text-white"
                  >
                    All talents
                    <ArrowRightIcon size={13} className="transition-transform duration-200 group-hover/all:translate-x-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {TALENT_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`${ENT}/talents?category=${cat.slug}`}
                      className="group/cat flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/10"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/[0.08] text-[#9FD8C9] ring-1 ring-white/10 transition duration-300 group-hover/cat:-rotate-6 group-hover/cat:scale-110 group-hover/cat:bg-gradient-to-br group-hover/cat:from-[#2F9678] group-hover/cat:to-[#9FD8C9] group-hover/cat:text-[#0A2E27]">
                        <CategoryIcon slug={cat.slug} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">{cat.label}</span>
                        <span className="block truncate text-xs text-white/55">{cat.hint}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* panel under "More" */}
          {panel === 'more' && (
            <div className="absolute right-0 top-full z-30 w-80 pt-3" onMouseEnter={() => openPanel('more')}>
              <div className="ent-drop overflow-hidden rounded-2xl bg-[#0D3A31] p-1.5 shadow-[0_28px_60px_-14px_rgba(0,0,0,0.75)] ring-1 ring-white/15">
                {moreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group/more flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/10"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.08] text-[#9FD8C9] ring-1 ring-white/10 transition duration-300 group-hover/more:scale-110 group-hover/more:bg-gradient-to-br group-hover/more:from-[#2F9678] group-hover/more:to-[#9FD8C9] group-hover/more:text-[#0A2E27]">
                      <link.icon size={17} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{link.label}</span>
                      <span className="block text-xs text-white/55">{link.hint}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── right side (desktop) ── */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* back to the Gateway */}
          <Link
            to="/"
            title="Back to Peak Star Group"
            aria-label="Back to Peak Star Group"
            className="grid size-10 place-items-center rounded-full text-white/70 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white hover:ring-white/30"
          >
            <GridIcon size={16} />
          </Link>

          <Link
            to={`${ENT}/submit`}
            className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#2F9678] to-[#9FD8C9] px-4 py-2.5 text-sm font-semibold text-[#0A2E27] shadow-[0_10px_26px_-10px_rgba(159,216,201,0.7)] transition duration-200 hover:brightness-110 active:scale-95"
          >
            <VideoIcon size={16} className="transition-transform duration-200 group-hover:scale-110" />
            Submit a talent
          </Link>

          {loading ? (
            <div aria-hidden="true" className="h-11 w-11" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`flex cursor-pointer items-center gap-2.5 rounded-full py-1 pl-1 pr-3 ring-1 transition ${
                  menuOpen ? 'bg-white/10 ring-[#9FD8C9]/60' : 'ring-white/15 hover:bg-white/10 hover:ring-white/30'
                }`}
              >
                {avatar('size-9')}
                <span className="max-w-[110px] truncate text-sm font-medium text-white">{displayName}</span>
                <ChevronIcon
                  size={14}
                  className={`text-white/60 transition-transform duration-200 ${menuOpen ? 'rotate-180 text-[#9FD8C9]' : ''}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="ent-drop absolute right-0 top-full z-20 mt-3 w-56 overflow-hidden rounded-2xl bg-[#0D3A31] p-1.5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/15"
                >
                  <div className="px-3 pb-2 pt-2">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-[#9FD8C9]">{roleText}</p>
                  </div>
                  <div className="mb-1 h-px bg-white/10" />
                  <Link
                    to={`${ENT}/account`}
                    role="menuitem"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
                  >
                    <UserIcon size={16} className="text-[#9FD8C9]" />
                    My account
                  </Link>
                  {adminLink && (
                    <Link
                      to={adminLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="menuitem"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
                    >
                      <ShieldIcon size={16} className="text-[#9FD8C9]" />
                      Admin Portal
                    </Link>
                  )}
                  <div className="my-1 h-px bg-white/10" />
                  <button
                    onClick={handleSignOut}
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-500/15"
                  >
                    <LogoutIcon size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <LoginButton />
          )}
        </div>

        {/* ── phone, tablet and small laptops: switch-site button + menu button ── */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/"
            title="Back to Peak Star Group"
            aria-label="Switch site: Back to Peak Star Group"
            className="grid size-11 place-items-center rounded-full bg-white/[0.08] text-[#9FD8C9] ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white active:scale-95"
          >
            <GridIcon size={18} />
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="relative grid size-11 cursor-pointer place-items-center rounded-full bg-white/[0.08] ring-1 ring-white/15 transition hover:bg-white/15"
          >
            <span className="relative block h-3.5 w-5">
              <span className={`absolute left-0 h-0.5 w-full rounded-full bg-white transition-all duration-300 ${mobileOpen ? 'top-1.5 rotate-45 bg-[#9FD8C9]' : 'top-0'}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-full rounded-full bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 h-0.5 w-full rounded-full bg-white transition-all duration-300 ${mobileOpen ? 'top-1.5 -rotate-45 bg-[#9FD8C9]' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </nav>

      {/* ── mobile menu ── */}
      {mobileOpen && (
        <div className="ent-drop max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-white/10 bg-[#0A2E27] lg:hidden">
          <div className="mx-auto max-w-7xl px-6 pb-6 pt-4">
            <div className="flex flex-col gap-1.5">
              {mobileLinks.map((link, i) => {
                const active = pathMatches(pathname, link)
                return (
                  <div key={link.key}>
                    <NavLink
                      to={link.to}
                      end={link.end}
                      style={{ animationDelay: `${i * 40}ms` }}
                      className={`ent-item flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition ${
                        active
                          ? 'bg-gradient-to-r from-[#2F9678] to-[#9FD8C9] text-[#0A2E27]'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <link.icon size={18} className={active ? 'text-[#0A2E27]' : 'text-[#9FD8C9]'} />
                      {link.label}
                    </NavLink>

                    {/* the categories, right under Talents */}
                    {link.key === 'talents' && (
                      <div className="mt-2 flex flex-wrap gap-2 px-2 pb-1">
                        {TALENT_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.slug}
                            to={`${ENT}/talents?category=${cat.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white"
                          >
                            <span className="text-[#9FD8C9]">
                              <CategoryIcon slug={cat.slug} size={14} />
                            </span>
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <Link
              to={`${ENT}/submit`}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2F9678] to-[#9FD8C9] px-5 py-3 text-base font-semibold text-[#0A2E27] shadow-lg active:scale-[0.98]"
            >
              <VideoIcon size={18} />
              Submit a talent
            </Link>

            <div className="mt-3">
              {loading ? (
                <div aria-hidden="true" className="h-11" />
              ) : user ? (
                <div className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-3 px-1 pb-2">
                    {avatar('size-10')}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{displayName}</span>
                      <span className="block truncate text-xs text-[#9FD8C9]">{roleText}</span>
                    </span>
                  </div>
                  <Link to={`${ENT}/account`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 hover:bg-white/10">
                    <UserIcon size={16} className="text-[#9FD8C9]" />
                    My account
                  </Link>
                  {adminLink && (
                    <Link
                      to={adminLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 hover:bg-white/10"
                    >
                      <ShieldIcon size={16} className="text-[#9FD8C9]" />
                      Admin Portal
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/15"
                  >
                    <LogoutIcon size={16} />
                    Sign out
                  </button>
                </div>
              ) : (
                <LoginButton full />
              )}
            </div>

            <Link
              to="/"
              className="mt-4 flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold text-[#CDEBE2] ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
            >
              <GridIcon size={16} />
              Switch site: Peak Star Group
              <ArrowLeftIcon size={14} className="rotate-180" />
            </Link>
          </div>
        </div>
      )}

      {/* line that grows as you scroll down the page */}
      <div aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#2F9678] via-[#9FD8C9] to-[#E6F1EE] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  )
}