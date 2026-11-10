// src/pages/Register.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell, {
  AuthField,
  AuthButton,
  PasswordToggle,
  IconMail,
  IconLock,
  IconUser,
  IconCap,
  IconMap,
  IconCheck,
} from '../components/AuthShell'

// 0 to 4: how strong the password looks
function passwordScore(password) {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++
  return score
}

const STRENGTH = [
  { label: 'Too short', color: 'bg-gray-200', text: 'text-gray-400' },
  { label: 'Weak', color: 'bg-red-400', text: 'text-red-500' },
  { label: 'Fair', color: 'bg-amber-400', text: 'text-amber-600' },
  { label: 'Good', color: 'bg-[#2F8F7A]', text: 'text-[#2F8F7A]' },
  { label: 'Strong', color: 'bg-[#1B5E4F]', text: 'text-[#1B5E4F]' },
]

export default function Register() {
  const { signUp } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await signUp(email, password, firstName, lastName)

    if (error) {
      setError(error.message || 'Could not create account.')
      setSubmitting(false)
      return
    }

    setDone(true)
    setSubmitting(false)
  }

  const score = password ? passwordScore(password) : 0
  const strength = STRENGTH[score]

  return (
    <AuthShell
      panelSide="left"
      eyebrow="Join Peakstar Engineering"
      title={
        <>
          Create your profile,
          <br />
          get started today.
        </>
      }
      text="One account gives you a professional profile that shows who you are and what you know."
      features={[
        { icon: <IconUser />, text: 'A public profile with your photo and bio' },
        { icon: <IconCap />, text: 'Your qualifications and certifications in one place' },
        { icon: <IconMap />, text: 'Be found for the expertise you offer' },
      ]}
    >
      {done ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F1EE] text-[#1B5E4F] ring-8 ring-[#E6F1EE]/60">
            <IconCheck />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#0F3D32]">Check your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            We've sent a confirmation link to <strong className="text-gray-800">{email}</strong>. Confirm it, then sign in.
          </p>
          <p className="mt-3 rounded-lg bg-[#F1F6F4] px-3 py-2 text-xs text-gray-500">
            Can't see it? Look in your spam or junk folder.
          </p>
          <Link
            to="/login"
            className="mt-7 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] py-3 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F8F7A]"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F3D32]">Create an account</h1>
          <p className="mt-2 text-sm text-gray-500">Join Peakstar Engineering to manage your profile.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AuthField
                id="reg-first"
                label="First name"
                icon={<IconUser />}
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <AuthField
                id="reg-last"
                label="Last name"
                icon={<IconUser />}
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <AuthField
              id="reg-email"
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
              id="reg-password"
              label="Password"
              icon={<IconLock />}
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              right={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
              hint={
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          password && n <= score ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`mt-1.5 text-xs ${password ? strength.text : 'text-gray-400'}`}>
                    {password ? strength.label : 'At least 6 characters.'}
                  </p>
                </div>
              }
            />

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <AuthButton type="submit" disabled={submitting} loading={submitting} loadingText="Creating account…">
              Create Account
            </AuthButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#1B5E4F] hover:text-[#0F3D32] hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}