// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError('Invalid email or password.')
      setSubmitting(false)
      return
    }

    navigate('/profile')
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">MapMind Group</span>
          </div>

          <h1 className="mt-10 text-3xl font-bold text-gray-900">Sign in</h1>
          <p className="mt-2 text-sm text-gray-500">Welcome back. Enter your details to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Spinner />}
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-gray-900 underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-black via-gray-700 to-white lg:block">
        <MapGridBackground />

        <div className="absolute -left-10 top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-24 right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-end px-12 pb-16">
          <h2 className="text-3xl font-semibold leading-tight text-white drop-shadow">
            Your research,
            <br />
            properly placed.
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70 drop-shadow">
            Sign in to keep your profile current — your credentials, your expertise,
            the work you want readers to find.
          </p>

          <ul className="mt-8 space-y-4">
            <FeatureRow icon={<UserIcon />} text="Update your photo, bio, and position" />
            <FeatureRow icon={<CapIcon />} text="Keep academic qualifications current" />
            <FeatureRow icon={<TagIcon />} text="Tag the expertise readers search for" />
          </ul>
        </div>
      </div>
    </div>
  )
}

function MapGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="600" height="900" fill="url(#grid)" />

        <g fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="1.2">
          <path d="M -50 180 C 120 120, 260 240, 420 160 S 700 140, 760 220" />
          <path d="M -50 230 C 110 175, 250 290, 410 210 S 690 190, 760 270" />
          <path d="M -50 280 C 100 230, 240 340, 400 260 S 680 240, 760 320" />
        </g>
        <g fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="1.2">
          <path d="M -50 620 C 140 560, 300 700, 460 600 S 720 560, 780 650" />
          <path d="M -50 670 C 130 615, 290 750, 450 650 S 710 610, 780 700" />
        </g>

        <g fill="white">
          <circle cx="150" cy="210" r="3" fillOpacity="0.5" />
          <circle cx="440" cy="650" r="3" fillOpacity="0.4" />
          <circle cx="340" cy="420" r="3" fillOpacity="0.3" />
        </g>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
    </div>
  )
}

function FeatureRow({ icon, text }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
        {icon}
      </span>
      <span className="text-sm text-gray-300">{text}</span>
    </li>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function CapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.2-5.2M9.9 4.2A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a18.6 18.6 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}