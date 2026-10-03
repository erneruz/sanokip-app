// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile } from '../services/profileService'

const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/blog', label: 'Blog & News' },
    { to: '/publications', label: 'Publications' },
]

function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

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
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function handleSignOut() {
        setMenuOpen(false)
        await signOut()
        navigate('/')
    }

    const displayName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
        : (user?.email ?? 'Account')

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link to="/" className="text-xl font-semibold tracking-tight text-gray-900">
                    MapMind Group
                </Link>

                {/* ── Nav links with animated underline + active state ── */}
                <div className="hidden items-center gap-8 text-sm md:flex">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `group relative py-1 transition-colors duration-300 ${
                                    isActive ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {link.label}
                                    <span
                                        className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-black transition-all duration-300 ease-out ${
                                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}
                                    />
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* ── Right side: either auth menu or guest actions ── */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                className="flex cursor-pointer items-center gap-2.5 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-3 transition hover:border-gray-300 hover:shadow-sm"
                            >
                                <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                                            {displayName?.[0]?.toUpperCase() ?? '?'}
                                        </span>
                                    )}
                                </span>
                                <span className="max-w-[120px] truncate text-sm font-medium text-gray-700">
                                    {displayName}
                                </span>
                                <svg
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-black/5">
                                    <Link
                                        to="/profile"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <IconUser />
                                        Profile
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
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
                        <>
                            <Link
                                to="/login"
                                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:text-gray-900"
                            >
                                <IconLogin />
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                            >
                                <IconUserPlus />
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
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

export default Navbar