// src/pages/entertainment/EntertainmentRegister.jsx
// Sign-up for Peak Star Entertainment. The person chooses how they join
// (visitor, talent, parent/guardian, scout, talent manager, partner).
// Scouts, talent managers and partners wait for approval.
// After "Create Account" the person is asked to confirm the email, then goes
// to the Login page. Nobody is signed in by the sign-up itself.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import {
  AuthField,
  AuthButton,
  PasswordToggle,
  IconMail,
  IconLock,
  IconUser,
  IconTag,
} from '../../components/AuthShell'
import EntAuthFrame from '../../components/entertainment/EntAuthFrame'
import EntRolePicker from '../../components/entertainment/EntRolePicker'
import CountryPhoneInput from '../../components/entertainment/CountryPhoneInput'
import LocationFields from '../../components/entertainment/LocationFields'
import RoleDetailsFields from '../../components/entertainment/RoleDetailsFields'
import { cleanDetails, detailsProblem } from '../../constants/entRoleDetails'
import { ENT_ROLES } from '../../services/entertainmentUsersService'
import { phoneProblem } from '../../constants/countries'

export default function EntertainmentRegister() {
  const { signUp, signOut } = useAuth()

  const [role, setRole] = useState('talent')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('') // full number, for example +250788123456
  const [place, setPlace] = useState({ country: 'Rwanda', province: '', district: '' })
  const [organization, setOrganization] = useState('')
  const [details, setDetails] = useState({}) // the questions that depend on the chosen role
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [existing, setExisting] = useState(false) // this email already has a Peak Star login
  const [cooldown, setCooldown] = useState(0) // seconds before the confirmation email can be sent again
  const [resendNote, setResendNote] = useState(null) // { type: 'ok' | 'error', text }

  const chosen = ENT_ROLES.find((r) => r.value === role)
  const showOrg = role === 'scout' || role === 'partner' || role === 'manager'
  const orgRequired = role === 'scout' || role === 'partner'
  const orgLabel =
    role === 'partner' ? 'Organisation name' : role === 'manager' ? 'Agency or company (optional)' : 'Team, club or organisation'
  const orgPlaceholder =
    role === 'partner'
      ? 'Example: Kigali Football Academy'
      : role === 'manager'
        ? 'Example: Kigali Talent Agency'
        : 'Example: APR FC Youth Team'

  // count down the "send again" button
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function resendEmail() {
    setResendNote(null)
    setCooldown(45)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/entertainment/login` },
    })
    setResendNote(
      error
        ? { type: 'error', text: 'We could not send it again. Please wait a minute and try again.' }
        : { type: 'ok', text: `We sent a new link to ${email}.` },
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setExisting(false)

    const problem = phoneProblem(phone)
    if (problem) {
      setError(problem)
      return
    }

    const detailsError = detailsProblem(role, details)
    if (detailsError) {
      setError(detailsError)
      return
    }

    setSubmitting(true)
    const { data, error } = await signUp(
      email,
      password,
      firstName,
      lastName,
      {
        site: 'entertainment',
        ent_role: role,
        phone,
        country: place.country,
        province: place.province.trim(),
        district: place.district.trim(),
        organization: organization.trim(),
        ent_details: cleanDetails(role, details),
      },
      '/entertainment/login',
    )

    if (error) {
      if (/already|registered|exists/i.test(error.message || '')) {
        setExisting(true)
        setSubmitting(false)
        return
      }
      setError(error.message || 'Could not create your account.')
      setSubmitting(false)
      return
    }

    // The email already has a Peak Star login (for example from Peak Star Engineering).
    // The login service answers "ok" but creates nothing, so we point the person
    // to sign in and join, where their details are filled in for them.
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setExisting(true)
      setSubmitting(false)
      return
    }

    // If the project does not ask for email confirmation, the sign-up logs the person in.
    // Everybody must pass through the Login page, so we close that session here.
    if (data?.session) await signOut()

    setCooldown(45)
    setDone(true)
    setSubmitting(false)
  }

  return (
    <EntAuthFrame
      eyebrow="Join Peak Star Entertainment"
      title={done ? 'Almost there' : 'Get seen, get discovered'}
      text={done ? undefined : 'Visitors, talents, parents, scouts, managers and partners all meet here. Choose how you join.'}
      maxWidth="max-w-3xl"
    >
      {done ? (
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F1EE] text-[#1B5E4F] ring-8 ring-[#E6F1EE]/60">
            <IconMail />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#0F3D32]">Confirm your email</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            We sent a confirmation link to <strong className="text-gray-800">{email}</strong>. Open your email and tap the
            link to confirm that it is yours.
          </p>

          {/* the three steps */}
          <ol className="mt-6 space-y-2 text-left">
            {[
              { n: 1, title: 'Confirm your email', text: 'Open the message we sent you and tap the link.', now: true },
              { n: 2, title: 'Sign in', text: 'Use your email and password on the Sign in page.' },
              { n: 3, title: 'Your profile', text: 'You will land on your profile, ready to use.' },
            ].map((step) => (
              <li
                key={step.n}
                className={
                  'flex items-start gap-3 rounded-xl px-3 py-2.5 ' +
                  (step.now ? 'bg-[#E6F1EE] ring-1 ring-[#9FD8C9]' : 'bg-[#F1F6F4]')
                }
              >
                <span
                  className={
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ' +
                    (step.now ? 'bg-[#1B5E4F] text-white' : 'bg-white text-[#1B5E4F] ring-1 ring-[#9FD8C9]')
                  }
                >
                  {step.n}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#0F3D32]">{step.title}</span>
                  <span className="block text-xs text-gray-500">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>

          {chosen?.needsApproval && (
            <p className="mt-4 rounded-lg border border-dashed border-[#2F9678] bg-[#F1F6F4] px-3 py-2 text-xs text-[#154A3F]">
              As a {chosen.label.toLowerCase()}, your account is reviewed by our team before it becomes active. We will let you know.
            </p>
          )}

          <Link
            to="/entertainment/login"
            state={{ registered: true }}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] py-3 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F9678]"
          >
            I confirmed my email, go to Sign in
          </Link>

          <div className="mt-4 rounded-lg bg-[#F1F6F4] px-3 py-3 text-xs text-gray-500">
            <p>Can't see it? Look in your spam or junk folder.</p>
            <button
              type="button"
              onClick={resendEmail}
              disabled={cooldown > 0}
              className="mt-1.5 cursor-pointer font-semibold text-[#1B5E4F] underline underline-offset-2 hover:text-[#0F3D32] disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
            >
              {cooldown > 0 ? `Send the email again (wait ${cooldown}s)` : 'Send the email again'}
            </button>
            {resendNote && (
              <p className={'mt-1.5 ' + (resendNote.type === 'ok' ? 'text-[#154A3F]' : 'text-red-600')}>{resendNote.text}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F3D32]">Create your account</h2>
          <p className="mt-1 text-sm text-gray-500">First, tell us how you will join.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <EntRolePicker
              value={role}
              onChange={(r) => {
                setRole(r)
                setDetails({}) // each kind of member has its own questions
              }}
            />

            {chosen?.needsApproval && (
              <p className="rounded-lg border border-dashed border-[#2F9678] bg-[#F1F6F4] px-3 py-2 text-xs text-[#154A3F]">
                {chosen.label} accounts are reviewed by our team before they become active.
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AuthField
                id="ent-first"
                label="First name"
                icon={<IconUser />}
                type="text"
                required
                placeholder="Example: Aline"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <AuthField
                id="ent-last"
                label="Last name"
                icon={<IconUser />}
                type="text"
                required
                placeholder="Example: Uwase"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AuthField
                id="ent-email"
                label="Email"
                icon={<IconMail />}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Example: aline@gmail.com"
              />
              <CountryPhoneInput id="ent-phone" value={phone} onChange={setPhone} required />
            </div>

            <LocationFields idPrefix="ent" value={place} onChange={setPlace} />

            {showOrg && (
              <AuthField
                id="ent-org"
                label={orgLabel}
                icon={<IconTag />}
                type="text"
                required={orgRequired}
                placeholder={orgPlaceholder}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            )}

            {/* the questions of the chosen kind of member (none for visitors) */}
            <RoleDetailsFields role={role} value={details} onChange={setDetails} idPrefix="ent" />

            <AuthField
              id="ent-password"
              label="Password"
              icon={<IconLock />}
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password of at least 6 characters"
              right={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
            />

            {existing && (
              <div className="rounded-lg border border-dashed border-[#2F9678] bg-[#F1F6F4] px-3 py-3 text-sm text-[#154A3F]">
                <p className="font-semibold">This email already has a Peak Star login.</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Sign in with it, and you can join Peak Star Entertainment in one step: your details are filled in
                  for you, and you only choose how you want to join.
                </p>
                <Link
                  to="/entertainment/login"
                  className="mt-2 inline-block font-semibold text-[#1B5E4F] underline underline-offset-2 hover:text-[#0F3D32]"
                >
                  Sign in and join
                </Link>
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <AuthButton type="submit" disabled={submitting} loading={submitting} loadingText="Creating account…">
              Create Account
            </AuthButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/entertainment/login" className="font-semibold text-[#1B5E4F] hover:text-[#0F3D32] hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </EntAuthFrame>
  )
}