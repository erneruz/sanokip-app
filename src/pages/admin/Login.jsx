// src/pages/admin/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    navigate('/admin')
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* -------------------------------------------- */}
      {/* LEFT: FORM */}
      {/* -------------------------------------------- */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Sanokip Admin</span>
          </div>

          <h1 className="mt-10 text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to manage posts, categories, and comments.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-xl bg-black py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            This is a private admin area. Access is limited to authorized accounts.
          </p>
        </div>
      </div>

      {/* -------------------------------------------- */}
      {/* RIGHT: ILLUSTRATION PANEL (hidden on small screens) */}
      {/* -------------------------------------------- */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-black via-gray-700 to-white lg:block">
        <div className="absolute -left-10 top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-24 right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMax slice">
          {/* moon */}
          <circle cx="300" cy="220" r="110" fill="#FFFFFF" opacity="0.12" />
          <circle cx="300" cy="220" r="70" fill="#FFFFFF" opacity="0.25" />

          {/* rolling hills, dark to light */}
          <path d="M0 480 Q150 420 300 470 T600 460 V800 H0 Z" fill="#FFFFFF" opacity="0.08" />
          <path d="M0 560 Q180 500 340 550 T600 540 V800 H0 Z" fill="#FFFFFF" opacity="0.15" />
          <path d="M0 640 Q200 590 350 630 T600 620 V800 H0 Z" fill="#FFFFFF" opacity="0.25" />

          {/* trees */}
          {[80, 150, 220, 480, 540].map((x, i) => (
            <g key={i} transform={`translate(${x}, ${680 + (i % 2) * 20})`}>
              <line x1="0" y1="0" x2="0" y2="70" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="3" />
              <line x1="0" y1="10" x2="-14" y2="-6" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2" />
              <line x1="0" y1="20" x2="13" y2="4" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2" />
              <line x1="0" y1="34" x2="-12" y2="18" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2" />
              <line x1="0" y1="46" x2="11" y2="30" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="2" />
            </g>
          ))}
        </svg>

        <div className="absolute inset-x-0 bottom-10 px-12 text-center">
          <p className="text-lg font-semibold text-white drop-shadow">Mapping Rwanda's ground truth</p>
          <p className="mt-1 text-sm text-white/70 drop-shadow">Manage your blog content in one place.</p>
        </div>
      </div>
    </div>
  )
}