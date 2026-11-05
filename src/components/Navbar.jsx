// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profileService'
import logo from '../assets/images/logo.png'

const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/projects', label: 'Projects' },
    { to: '/blog', label: 'Blog & News' },
    { to: '/publications', label: 'Publications' },
]

function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [profile, setProfile] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false) // desktop avatar dropdown
    const [authMenuOpen, setAuthMenuOpen] = useState(false) // desktop login/signup dropdown
    const [mobileOpen, setMobileOpen] = useState(false) // mobile/tablet panel
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

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
            if (authMenuRef.current && !authMenuRef.current.contains(e.target)) {
                setAuthMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        setMobileOpen(false)
        setAuthMenuOpen(false)
    }, [location.pathname])

    async function handleSignOut() {
        setMenuOpen(false)
        setMobileOpen(false)
        await signOut()
        navigate('/')
    }

    const displayName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
        : (user?.email ?? 'Account')

    return (
        <header className="sticky top-0 z-50 border-b border-[#EAF5F1] bg-white/90 shadow-[0_1px_0_rgba(15,61,50,0.04)] backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
                {/* Logo — ← changed: added a small letter-spaced "ENGINEERING" tagline
                    under the wordmark, and shifted the green to match the logo's own
                    teal (#1B5E4F) instead of the near-black #0F3D32 */}
                <Link to="/" className="group flex shrink-0 items-center gap-2.5">
                    <img
                        src={logo}
                        alt="Peakstar"
                        className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
                    />
                    <div className="flex flex-col justify-center leading-none">
                        <span className="text-xl font-extrabold tracking-tight text-[#1B5E4F]">
                            Peak Star
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#1B5E4F]/55">
                            <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#1B5E4F]/55" />
                            Engineering
                        </span>
                    </div>
                </Link>

                <div className="hidden items-center gap-8 text-sm md:flex">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `group relative py-1 transition-colors duration-300 ${
                                    isActive ? 'font-medium text-[#0F3D32]' : 'text-gray-500 hover:text-[#0F3D32]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {link.label}
                                    <span
                                        className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] transition-all duration-300 ease-out ${
                                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}
                                    />
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex md:items-center md:gap-3">
                        {user ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen((v) => !v)}
                                    className={`flex cursor-pointer items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3 transition ${
                                        menuOpen
                                            ? 'border-[#1B5E4F]/40 shadow-sm'
                                            : 'border-gray-200 hover:border-[#1B5E4F]/30 hover:shadow-sm'
                                    }`}
                                >
                                    <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#EAF5F1] ring-1 ring-[#1B5E4F]/20">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#1B5E4F]">
                                                {displayName?.[0]?.toUpperCase() ?? '?'}
                                            </span>
                                        )}
                                    </span>
                                    <span className="max-w-[120px] truncate text-sm font-medium text-gray-700">
                                        {displayName}
                                    </span>
                                    <svg
                                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        className={`shrink-0 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180 text-[#1B5E4F]' : ''}`}
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl bg-white py-1.5 shadow-[0_12px_32px_rgba(15,61,50,0.14)] ring-1 ring-[#0F3D32]/10">
                                        <Link
                                            to="/profile"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                        >
                                            <IconUser />
                                            Profile
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                            >
                                                <IconShield />
                                                Admin Portal
                                            </Link>
                                        )}
                                        <div className="my-1 border-t border-gray-100" />
                                        <button
                                            onClick={handleSignOut}
                                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <IconLogout />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative" ref={authMenuRef}>
                                <button
                                    onClick={() => setAuthMenuOpen((v) => !v)}
                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                        authMenuOpen
                                            ? 'border-[#1B5E4F] text-[#0F3D32]'
                                            : 'border-gray-300 text-gray-700 hover:border-[#1B5E4F]/50 hover:bg-[#EAF5F1] hover:text-[#0F3D32]'
                                    }`}
                                >
                                    <IconUserCircle />
                                    Account
                                    <svg
                                        width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        className={`shrink-0 text-gray-400 transition-transform duration-200 ${authMenuOpen ? 'rotate-180 text-[#1B5E4F]' : ''}`}
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>

                                {authMenuOpen && (
                                    <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl bg-white py-1.5 shadow-[0_12px_32px_rgba(15,61,50,0.14)] ring-1 ring-[#0F3D32]/10">
                                        <Link
                                            to="/login"
                                            onClick={() => setAuthMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                        >
                                            <IconLogin />
                                            Log in
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setAuthMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                        >
                                            <IconUserPlus />
                                            Sign up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-gray-700 transition hover:bg-[#EAF5F1] hover:text-[#0F3D32] md:hidden"
                    >
                        {mobileOpen ? <IconClose /> : <IconMenu />}
                    </button>
                </div>
            </nav>

            {mobileOpen && (
                <div className="border-t border-[#EAF5F1] bg-white md:hidden">
                    <div className="mx-auto max-w-6xl px-6 py-4">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    end={link.end}
                                    className={({ isActive }) =>
                                        `rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                            isActive
                                                ? 'bg-[#EAF5F1] font-medium text-[#0F3D32]'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#0F3D32]'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="my-4 border-t border-gray-100" />

                        {user ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#EAF5F1] ring-1 ring-[#1B5E4F]/20">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#1B5E4F]">
                                                {displayName?.[0]?.toUpperCase() ?? '?'}
                                            </span>
                                        )}
                                    </span>
                                    <span className="truncate text-sm font-medium text-gray-800">{displayName}</span>
                                </div>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                >
                                    <IconUser />
                                    Profile
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                    >
                                        <IconShield />
                                        Admin Portal
                                    </Link>
                                )}
                                <button
                                    onClick={handleSignOut}
                                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                    <IconLogout />
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Account</p>
                                <div className="mt-2 flex flex-col gap-2">
                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1B5E4F]/50 hover:bg-[#EAF5F1] hover:text-[#0F3D32]"
                                    >
                                        <IconLogin />
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-[#0C3229] hover:to-[#154A3F]"
                                    >
                                        <IconUserPlus />
                                        Sign up
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

function IconUser() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </svg>
    )
}
function IconShield() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4Z" />
        </svg>
    )
}
function IconLogout() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    )
}
function IconLogin() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
    )
}
function IconUserPlus() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="8" r="4" />
            <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
        </svg>
    )
}
function IconUserCircle() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="10" r="3" />
            <path d="M6.2 19.3a6.5 6.5 0 0 1 11.6 0" />
        </svg>
    )
}
function IconMenu() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    )
}
function IconClose() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    )
}

export default Navbar