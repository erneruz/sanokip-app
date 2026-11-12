// src/pages/entertainment/EntertainmentLogin.jsx
// Sign-in for Peak Star Entertainment (all kinds of users and staff).
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AuthField, AuthButton, PasswordToggle, IconMail, IconLock } from '../../components/AuthShell'
import EntAuthFrame from '../../components/entertainment/EntAuthFrame'

export default function EntertainmentLogin() {
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

    navigate('/entertainment/account')
  }

  return (
    <EntAuthFrame
      eyebrow="Peak Star Entertainment"
      title="Welcome back"
      text="Sign in to follow your submissions, update your profile and stay connected."
      maxWidth="max-w-md"
    >
      <h2 className="text-2xl font-bold tracking-tight text-[#0F3D32]">Sign in</h2>
      <p className="mt-1 text-sm text-gray-500">Enter your details to continue.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <AuthField
          id="entlogin-email"
          label="Email"
          icon={<IconMail />}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <AuthField
          id="entlogin-password"
          label="Password"
          icon={<IconLock />}
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          right={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <AuthButton type="submit" disabled={submitting} loading={submitting} loadingText="Signing in…">
          Sign in
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        New here?{' '}
        <Link to="/entertainment/register" className="font-semibold text-[#1B5E4F] hover:text-[#0F3D32] hover:underline">
          Create an account
        </Link>
      </p>
    </EntAuthFrame>
  )
}