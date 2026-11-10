// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell, {
  AuthField,
  AuthButton,
  PasswordToggle,
  IconMail,
  IconLock,
  IconUser,
  IconCap,
  IconTag,
} from '../components/AuthShell'

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
    <AuthShell
      panelSide="right"
      eyebrow="Peakstar Engineering"
      title={
        <>
          Welcome back,
          <br />
          let's keep building.
        </>
      }
      text="Sign in to keep your profile current: your credentials, your expertise, and the work you want readers to find."
      features={[
        { icon: <IconUser />, text: 'Update your photo, bio, and position' },
        { icon: <IconCap />, text: 'Keep academic qualifications current' },
        { icon: <IconTag />, text: 'Tag the expertise readers search for' },
      ]}
    >
      <h1 className="text-3xl font-bold tracking-tight text-[#0F3D32]">Sign in</h1>
      <p className="mt-2 text-sm text-gray-500">Welcome back. Enter your details to continue.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <AuthField
          id="login-email"
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
          id="login-password"
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
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-[#1B5E4F] hover:text-[#0F3D32] hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  )
}