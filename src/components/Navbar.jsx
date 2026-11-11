// src/components/Navbar.jsx
// Peak Star Engineering navbar. It uses the same style as the Entertainment navbar
// (same font, buttons, dropdowns, mobile menu and scroll line), but in the light
// Engineering colours, so the logo image stays clearly visible.
// The links keep the original Engineering hover: a green line slides in from the left.
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profileService'
import logo from '../assets/images/logo.png'

// every Engineering address starts with this
const ENG = '/engineering'

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
function InfoIcon(p) {
    return (
        <Svg {...p}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
        </Svg>
    )
}
function ToolIcon(p) {
    return (
        <Svg {...p}>
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
        </Svg>
    )
}
function FolderIcon(p) {
    return (
        <Svg {...p}>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
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
function BookIcon(p) {
    return (
        <Svg {...p}>
            <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
            <path d="M4 21a2 2 0 0 1 2-2h13" />
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
function UserPlusIcon(p) {
    return (
        <Svg {...p}>
            <circle cx="9" cy="8" r="4" />
            <path d="M2 21c0-3.6 3-6 7-6s7 2.4 7 6M19 8v6M16 11h6" />
        </Svg>
    )
}
function LoginIcon(p) {
    return (
        <Svg {...p}>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <path d="m10 17 5-5-5-5M15 12H3" />
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
function ArrowRightIcon(p) {
    return (
        <Svg {...p}>
            <path d="M5 12h14M13 5l7 7-7 7" />
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

/* ---------- the links ---------- */
// Each link has "match", the list of addresses it covers. A link stays active on
// its own page AND on every page under those addresses (for example a single post).
const navLinks = [
    { to: ENG, label: 'Home', end: true, icon: HomeIcon },
    { to: `${ENG}/about`, label: 'About Us', match: [`${ENG}/about`], icon: InfoIcon },
    { to: `${ENG}/services`, label: 'Services', match: [`${ENG}/services`, `${ENG}/service`], icon: ToolIcon },
    { to: `${ENG}/projects`, label: 'Projects', match: [`${ENG}/projects`, `${ENG}/project`], icon: FolderIcon },
    {
        to: `${ENG}/blog`,
        label: 'Blog & News',
        match: [
            `${ENG}/blog`, `${ENG}/posts`, `${ENG}/post`, `${ENG}/authors`,
            `${ENG}/article`, `${ENG}/articles`, `${ENG}/news`,
        ],
        icon: NewsIcon,
    },
    { to: `${ENG}/publications`, label: 'Publications', match: [`${ENG}/publications`, `${ENG}/publication`], icon: BookIcon },
]

// true when the current address belongs to this link
function isLinkActive(link, pathname) {
    const path = pathname.replace(/\/+$/, '') || '/'
    if (link.end) return path === link.to
    return (link.match ?? [link.to]).some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    )
}

/* ---------- round "switch site" button ---------- */
// takes the visitor back to the Peak Star Group page (Engineering or Entertainment)
function SwitchSiteLink() {
    return (
        <Link
            to="/"
            title="Back to Peak Star Group"
            aria-label="Switch site: Back to Peak Star Group"
            className="grid size-10 shrink-0 place-items-center rounded-full text-[#1B5E4F]/70 ring-1 ring-[#1B5E4F]/20 transition hover:bg-[#EAF5F1] hover:text-[#0F3D32] hover:ring-[#1B5E4F]/40 active:scale-95"
        >
            <GridIcon size={16} />
        </Link>
    )
}

function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [profile, setProfile] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false) // desktop avatar dropdown
    const [authMenuOpen, setAuthMenuOpen] = useState(false) // desktop login/signup dropdown
    const [mobileOpen, setMobileOpen] = useState(false) // mobile/tablet panel
    const [scrolled, setScrolled] = useState(false)
    const [progress, setProgress] = useState(0) // how far down the page, 0 to 100
    const menuRef = useRef(null)
    const authMenuRef = useRef(null)

    const isAdmin = profile?.role === 'admin' // ⚠️ adjust if your admin flag differs

    useEffect(() => {
        if (!user?.id) {
            setProfile(null)
            return
        }
        getProfile(user.id)
            .then(setProfile)
            .catch((err) => console.error('Failed to load profile:', err))
    }, [user?.id])

    // the bar gets a soft shadow once you scroll, and the line follows your scroll
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
    }, [location.pathname])

    // close menus on outside click and on Escape
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
            if (authMenuRef.current && !authMenuRef.current.contains(e.target)) setAuthMenuOpen(false)
        }
        function handleKey(e) {
            if (e.key === 'Escape') {
                setMenuOpen(false)
                setAuthMenuOpen(false)
                setMobileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKey)
        }
    }, [])

    // close menus on page change
    useEffect(() => {
        setMobileOpen(false)
        setMenuOpen(false)
        setAuthMenuOpen(false)
    }, [location.pathname])

    async function handleSignOut() {
        setMenuOpen(false)
        setMobileOpen(false)
        await signOut()
        navigate(ENG)
    }

    const displayName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
        : (user?.email ?? 'Account')

    const avatar = (size) => (
        <span className={`${size} shrink-0 overflow-hidden rounded-full bg-[#EAF5F1] ring-2 ring-[#2F9678]/50`}>
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
            ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-[#1B5E4F]">
                    {displayName?.[0]?.toUpperCase() ?? '?'}
                </span>
            )}
        </span>
    )

    return (
        <header
            className={`eng-nav sticky top-0 z-50 border-b transition-all duration-300 ${
                scrolled
                    ? 'border-[#E6F1EE] bg-white/90 shadow-[0_12px_30px_-18px_rgba(15,61,50,0.35)] backdrop-blur-xl'
                    : 'border-transparent bg-white'
            }`}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
                .eng-nav { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }

                /* flowing green border of the Account button */
                .eng-flow {
                    background-image: linear-gradient(90deg, #1B5E4F, #2F9678, #9FD8C9, #2F9678, #1B5E4F);
                    background-size: 300% 100%;
                    animation: eng-flow 5s linear infinite;
                }
                @keyframes eng-flow { to { background-position: 300% 0; } }

                /* shine that sweeps across the Account button on hover */
                .eng-sheen { transform: translateX(-160%) skewX(-12deg); }
                .eng-account:hover .eng-sheen { animation: eng-sheen 0.9s ease-out; }
                @keyframes eng-sheen {
                    from { transform: translateX(-160%) skewX(-12deg); }
                    to { transform: translateX(420%) skewX(-12deg); }
                }

                /* menus opening */
                @keyframes eng-drop {
                    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes eng-item {
                    from { opacity: 0; transform: translateX(-14px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .eng-drop { animation: eng-drop 0.22s ease-out both; }
                .eng-item { animation: eng-item 0.4s ease-out both; }

                @media (prefers-reduced-motion: reduce) {
                    .eng-flow, .eng-drop, .eng-item { animation: none; }
                    .eng-account:hover .eng-sheen { animation: none; }
                }
            `}</style>

            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
                {/* ── logo: the same image, in the same style as Entertainment (no hover effect) ── */}
                <Link
                    to={ENG}
                    className="flex shrink-0 flex-col items-center"
                    aria-label="Peak Star Engineering, home"
                >
                    <img src={logo} alt="Peakstar" className="h-10 w-10 shrink-0 object-contain" />
                    <span className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#1B5E4F]">
                        <span className="size-1 rounded-full bg-[#2F9678]" />
                        Engineering
                    </span>
                </Link>

                {/* ── links (desktop): the original Engineering hover, a line slides in from the left ── */}
                <div className="hidden items-center gap-5 xl:gap-8 lg:flex">
                    {navLinks.map((link) => {
                        const active = isLinkActive(link, location.pathname)
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={`group relative py-1 text-sm transition-colors duration-300 ${
                                    active ? 'font-medium text-[#0F3D32]' : 'text-gray-500 hover:text-[#0F3D32]'
                                }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] transition-all duration-300 ease-out ${
                                        active ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`}
                                />
                            </NavLink>
                        )
                    })}
                </div>

                {/* ── right side (desktop) ── */}
                <div className="hidden items-center gap-3 lg:flex">
                    <SwitchSiteLink />

                    {user ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                className={`flex cursor-pointer items-center gap-2.5 rounded-full py-1 pl-1 pr-3 ring-1 transition ${
                                    menuOpen
                                        ? 'bg-[#EAF5F1] ring-[#2F9678]/50'
                                        : 'ring-[#1B5E4F]/20 hover:bg-[#EAF5F1] hover:ring-[#1B5E4F]/40'
                                }`}
                            >
                                {avatar('size-9')}
                                <span className="max-w-[110px] truncate text-sm font-medium text-gray-700">{displayName}</span>
                                <ChevronIcon
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180 text-[#1B5E4F]' : ''}`}
                                />
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="eng-drop absolute right-0 top-full z-20 mt-3 w-56 overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_24px_50px_-14px_rgba(15,61,50,0.35)] ring-1 ring-[#0F3D32]/10"
                                >
                                    <Link
                                        to="/profile"
                                        role="menuitem"
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                    >
                                        <UserIcon size={16} className="text-[#2F9678]" />
                                        Profile
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            role="menuitem"
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                        >
                                            <ShieldIcon size={16} className="text-[#2F9678]" />
                                            Admin Portal
                                        </Link>
                                    )}
                                    <div className="my-1 h-px bg-gray-100" />
                                    <button
                                        onClick={handleSignOut}
                                        role="menuitem"
                                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                                    >
                                        <LogoutIcon size={16} />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative" ref={authMenuRef}>
                            {/* Account button: flowing green border, tilting badge, sweeping shine */}
                            <button
                                onClick={() => setAuthMenuOpen((v) => !v)}
                                aria-haspopup="menu"
                                aria-expanded={authMenuOpen}
                                className="eng-account group relative inline-flex cursor-pointer rounded-full p-[1.5px] shadow-[0_10px_28px_-12px_rgba(27,94,79,0.6)] transition-shadow duration-300 hover:shadow-[0_14px_34px_-10px_rgba(27,94,79,0.75)]"
                            >
                                <span aria-hidden="true" className="eng-flow absolute inset-0 rounded-full" />
                                <span className="relative flex items-center gap-2.5 overflow-hidden rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold text-[#0F3D32] transition-colors duration-300 group-hover:bg-[#F1F6F4]">
                                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2F9678] to-[#0F3D32] text-white shadow-inner transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                                        <UserIcon size={16} strokeWidth={2.4} />
                                    </span>
                                    Account
                                    <ChevronIcon
                                        size={14}
                                        className={`text-[#1B5E4F]/60 transition-transform duration-300 ${authMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                    <span aria-hidden="true" className="eng-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-[#9FD8C9]/40" />
                                </span>
                            </button>

                            {authMenuOpen && (
                                <div
                                    role="menu"
                                    className="eng-drop absolute right-0 top-full z-20 mt-3 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_24px_50px_-14px_rgba(15,61,50,0.35)] ring-1 ring-[#0F3D32]/10"
                                >
                                    <Link
                                        to="/login"
                                        role="menuitem"
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                    >
                                        <LoginIcon size={16} className="text-[#2F9678]" />
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        role="menuitem"
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                    >
                                        <UserPlusIcon size={16} className="text-[#2F9678]" />
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── phone, tablet and small laptops: switch-site button + menu button ── */}
                <div className="flex items-center gap-2 lg:hidden">
                    <Link
                        to="/"
                        title="Back to Peak Star Group"
                        aria-label="Switch site: Back to Peak Star Group"
                        className="grid size-11 place-items-center rounded-full bg-[#F1F6F4] text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15 transition hover:bg-[#EAF5F1] hover:text-[#0F3D32] active:scale-95"
                    >
                        <GridIcon size={18} />
                    </Link>
                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                        className="relative grid size-11 cursor-pointer place-items-center rounded-full bg-[#F1F6F4] ring-1 ring-[#1B5E4F]/15 transition hover:bg-[#EAF5F1]"
                    >
                        <span className="relative block h-3.5 w-5">
                            <span className={`absolute left-0 h-0.5 w-full rounded-full bg-[#0F3D32] transition-all duration-300 ${mobileOpen ? 'top-1.5 rotate-45 bg-[#2F9678]' : 'top-0'}`} />
                            <span className={`absolute left-0 top-1.5 h-0.5 w-full rounded-full bg-[#0F3D32] transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
                            <span className={`absolute left-0 h-0.5 w-full rounded-full bg-[#0F3D32] transition-all duration-300 ${mobileOpen ? 'top-1.5 -rotate-45 bg-[#2F9678]' : 'top-3'}`} />
                        </span>
                    </button>
                </div>
            </nav>

            {/* ── mobile menu ── */}
            {mobileOpen && (
                <div className="eng-drop max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-[#E6F1EE] bg-white lg:hidden">
                    <div className="mx-auto max-w-7xl px-6 pb-6 pt-4">
                        <div className="flex flex-col gap-1.5">
                            {navLinks.map((link, i) => {
                                const active = isLinkActive(link, location.pathname)
                                return (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        end={link.end}
                                        style={{ animationDelay: `${i * 40}ms` }}
                                        className={`eng-item flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition ${
                                            active
                                                ? 'bg-gradient-to-r from-[#1B5E4F] to-[#2F9678] text-white'
                                                : 'text-gray-700 hover:bg-[#EAF5F1] hover:text-[#0F3D32]'
                                        }`}
                                    >
                                        <link.icon size={18} className={active ? 'text-white' : 'text-[#2F9678]'} />
                                        {link.label}
                                    </NavLink>
                                )
                            })}
                        </div>

                        <div className="mt-4">
                            {user ? (
                                <div className="rounded-2xl bg-[#F1F6F4] p-3 ring-1 ring-[#1B5E4F]/10">
                                    <div className="flex items-center gap-3 px-1 pb-2">
                                        {avatar('size-10')}
                                        <span className="truncate text-sm font-medium text-gray-800">{displayName}</span>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-white hover:text-[#0F3D32]"
                                    >
                                        <UserIcon size={16} className="text-[#2F9678]" />
                                        Profile
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-white hover:text-[#0F3D32]"
                                        >
                                            <ShieldIcon size={16} className="text-[#2F9678]" />
                                            Admin Portal
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignOut}
                                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogoutIcon size={16} />
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-[#0F3D32] ring-1 ring-[#1B5E4F]/30 transition hover:bg-[#EAF5F1] active:scale-[0.98]"
                                    >
                                        <LoginIcon size={18} className="text-[#2F9678]" />
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1B5E4F] to-[#2F9678] px-5 py-3 text-base font-semibold text-white shadow-lg shadow-[#1B5E4F]/25 transition active:scale-[0.98]"
                                    >
                                        <UserPlusIcon size={18} />
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link
                            to="/"
                            className="mt-4 flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold text-[#1B5E4F] ring-1 ring-[#1B5E4F]/25 transition hover:bg-[#EAF5F1] active:scale-[0.98]"
                        >
                            <GridIcon size={16} />
                            Switch site: Peak Star Group
                            <ArrowRightIcon size={14} />
                        </Link>
                    </div>
                </div>
            )}

            {/* line that grows as you scroll down the page (the only scroll line to keep) */}
            <div aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-full bg-[#1B5E4F]/5">
                <div
                    className="h-full bg-gradient-to-r from-[#1B5E4F] via-[#2F9678] to-[#9FD8C9] transition-[width] duration-150"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </header>
    )
}

export default Navbar