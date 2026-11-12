// src/pages/entertainment/account/AccountSecurity.jsx
// Page 3 of "My profile": the sign-in email, a new password, and sign out.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../supabase'
import { useAuth } from '../../../context/AuthContext'
import { Card, Field, Icon, inputClass } from './accountUi'

function PasswordInput({ id, value, onChange, placeholder, autoComplete }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={shown ? 'text' : 'password'}
        className={inputClass + ' pr-11'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={6}
        required
      />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#E6F1EE] hover:text-[#1B5E4F]"
      >
        <Icon name={shown ? 'eyeOff' : 'eye'} size={17} />
      </button>
    </div>
  )
}

export default function AccountSecurity() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }

  async function handlePassword(e) {
    e.preventDefault()
    setMessage(null)
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'The new password needs at least 6 characters.' })
      return
    }
    if (password !== again) {
      setMessage({ type: 'error', text: 'The two passwords are not the same. Please type them again.' })
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      setMessage({ type: 'error', text: error.message || 'Could not change the password. Please try again.' })
      return
    }
    setPassword('')
    setAgain('')
    setMessage({ type: 'ok', text: 'Your password is changed. Use it the next time you sign in.' })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/entertainment')
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card icon="key" title="Change your password" text="Choose a password that only you know." delay={50}>
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="New password" htmlFor="sec-new">
                <PasswordInput
                  id="sec-new"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Type it again" htmlFor="sec-again">
                <PasswordInput
                  id="sec-again"
                  value={again}
                  onChange={(e) => setAgain(e.target.value)}
                  placeholder="Type the same password again"
                  autoComplete="new-password"
                />
              </Field>
            </div>

            <p className="flex items-start gap-2 rounded-lg bg-[#F1F6F4] px-3 py-2 text-xs leading-relaxed text-[#154A3F]">
              <Icon name="info" size={14} className="mt-0.5 shrink-0" />
              Your password belongs to your Peak Star login, so it also changes on any other Peak Star site where you use
              the same email.
            </p>

            {message && (
              <p
                role="status"
                className={
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm ' +
                  (message.type === 'ok' ? 'bg-[#E6F1EE] text-[#154A3F]' : 'border border-red-200 bg-red-50 text-red-600')
                }
              >
                <Icon name={message.type === 'ok' ? 'check' : 'info'} size={15} />
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F3D32] to-[#1B5E4F] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1B5E4F]/25 transition hover:from-[#0D3A31] hover:to-[#2F9678] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="lock" size={15} />
              {saving ? 'Saving…' : 'Change password'}
            </button>
          </form>
        </Card>
      </div>

      <div className="space-y-5">
        <Card icon="mail" title="Your sign-in email" delay={100}>
          <p className="break-all rounded-xl bg-[#F1F6F4] px-3 py-2.5 text-sm font-medium text-[#0F3D32]">{user.email}</p>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            This is the email you use to sign in. It cannot be changed here.
          </p>
        </Card>

        <Card icon="logout" title="Sign out" delay={150}>
          <p className="mb-3 text-xs leading-relaxed text-gray-500">
            Finished? Sign out, especially on a phone or computer that other people use.
          </p>
          <button
            onClick={handleSignOut}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 active:scale-95"
          >
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </Card>
      </div>
    </div>
  )
}