// src/components/ContactForm.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { createContactMessage } from '../services/contactService'
import { COUNTRIES, DEFAULT_COUNTRY_CODE } from '../constants/countries'

const MAX_MESSAGE = 2000

// ← added: the line the message starts with when someone clicks "Become a partner"
const PARTNERSHIP_TEXT =
  'Hello Peakstar, I would like to explore a partnership with you. '

const dialOf = (c) => (String(c.dial).startsWith('+') ? String(c.dial) : `+${c.dial}`)

/* ---------- icons ---------- */
function Ico({ size = 18, className = '', strokeWidth = 2, children }) {
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

const Icons = {
  User: (p) => (
    <Ico {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Ico>
  ),
  Mail: (p) => (
    <Ico {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Ico>
  ),
  Chat: (p) => (
    <Ico {...p}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h7M8.5 14h4" />
    </Ico>
  ),
  Send: (p) => (
    <Ico {...p}>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </Ico>
  ),
  Check: (p) => (
    <Ico strokeWidth={3} {...p}>
      <path d="m5 12 5 5L20 7" />
    </Ico>
  ),
  Chevron: (p) => (
    <Ico strokeWidth={2.5} {...p}>
      <path d="m6 9 6 6 6-6" />
    </Ico>
  ),
  Search: (p) => (
    <Ico {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Ico>
  ),
  Shield: (p) => (
    <Ico {...p}>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Ico>
  ),
}

/* ---------- flag (image, because Windows cannot draw emoji flags) ---------- */
function Flag({ code }) {
  const [failed, setFailed] = useState(false)
  const lower = String(code).toLowerCase()

  if (failed) {
    return (
      <span className="grid h-4 w-6 shrink-0 place-items-center rounded-[3px] bg-white/15 text-[8px] font-bold text-white">
        {code}
      </span>
    )
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${lower}.png`}
      srcSet={`https://flagcdn.com/w80/${lower}.png 2x`}
      alt=""
      width="24"
      height="16"
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-4 w-6 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-white/25"
    />
  )
}

/* ---------- shared bits ---------- */
const boxClass = (error) =>
  `flex items-center gap-2.5 rounded-xl border px-3.5 transition duration-200 focus-within:ring-4 ${
    error
      ? 'border-red-400/70 bg-red-500/10 focus-within:border-red-300 focus-within:ring-red-400/20'
      : 'border-white/15 bg-white/[0.08] hover:border-white/30 hover:bg-white/[0.11] focus-within:border-[#9FD8C9] focus-within:bg-white/[0.14] focus-within:ring-[#9FD8C9]/20'
  }`

const inputClass =
  'cf-input w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/45'

function Field({ id, label, optional, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/90">
        {label}
        {optional && <span className="font-normal text-white/50">Optional</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

/* ---------- phone with flag + country list ---------- */
function PhoneField({ id, country, onCountry, value, onValue, error }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const wrapRef = useRef(null)

  const selected = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return COUNTRIES
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(t) ||
        c.code.toLowerCase().includes(t) ||
        dialOf(c).includes(t)
    )
  }, [q])

  return (
    <div ref={wrapRef} className="relative">
      <div className={boxClass(error)}>
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o)
            setQ('')
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code, ${selected.name} ${dialOf(selected)}`}
          className="flex shrink-0 cursor-pointer items-center gap-2 border-r border-white/15 py-3 pr-3"
        >
          <Flag code={selected.code} />
          <span className="text-sm font-semibold text-white">{dialOf(selected)}</span>
          <Icons.Chevron size={14} className={`text-[#9FD8C9] transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => onValue(e.target.value.replace(/[^\d\s-]/g, ''))}
          placeholder="788 123 456"
          maxLength={20}
          className={inputClass}
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl bg-[#0A2E27] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/20">
          <div className="flex items-center gap-2 border-b border-white/10 px-3.5">
            <Icons.Search size={15} className="text-[#9FD8C9]" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country or code"
              className="cf-input w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/45"
            />
          </div>

          <ul role="listbox" className="cf-scroll max-h-60 overflow-y-auto py-1">
            {list.length === 0 && <li className="px-4 py-3 text-sm text-white/60">No country found.</li>}
            {list.map((c) => {
              const isOn = c.code === selected.code
              return (
                <li key={c.code} role="option" aria-selected={isOn}>
                  <button
                    type="button"
                    onClick={() => {
                      onCountry(c.code)
                      setOpen(false)
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                      isOn ? 'bg-[#2F8F7A]/30 font-semibold text-white' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Flag code={c.code} />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-white/55">{dialOf(c)}</span>
                    {isOn && <Icons.Check size={14} className="text-[#9FD8C9]" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ---------- checks ---------- */
function validate(f) {
  const e = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Please enter a valid email address.'
  const digits = f.phone.replace(/\D/g, '')
  if (f.phone.trim() && (digits.length < 6 || digits.length > 14)) e.phone = 'Please enter a valid phone number.'
  if (f.message.trim().length < 10) e.message = 'Please write a short message (at least 10 characters).'
  return e
}

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  country: DEFAULT_COUNTRY_CODE,
  message: '',
  website: '', // hidden trap field: real people never see it
}

/* ---------- the form ---------- */
export default function ContactForm() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [failure, setFailure] = useState('')
  const [glow, setGlow] = useState(false) // ← added: short glow when we arrive here

  // ← added: used to scroll to the form and put the cursor in the message box
  const cardRef = useRef(null)
  const messageRef = useRef(null)
  const location = useLocation()

  // ← added: runs when someone arrives with "#send-message" in the address
  // (the "Become a partner" button). "location.key" changes on every click,
  // so it also works when you are already on the Home page.
  useEffect(() => {
    if (location.hash !== '#send-message') return

    const topic = new URLSearchParams(location.search).get('topic')

    // show the empty form again if it was still saying "Message sent"
    setSent(false)

    // the partnership line is only added when the box is still empty
    if (topic === 'partnership') {
      setForm((f) => (f.message.trim() ? f : { ...f, message: PARTNERSHIP_TEXT }))
    }

    // a short wait, so the page has finished drawing (and any "scroll to top"
    // on page change has finished) before we scroll
    const scrollTimer = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setGlow(true)
    }, 350)

    // after the scroll, put the cursor at the end of the message
    const focusTimer = setTimeout(() => {
      const box = messageRef.current
      if (box) {
        box.focus({ preventScroll: true })
        const end = box.value.length
        box.setSelectionRange(end, end)
      }
    }, 1000)

    const glowTimer = setTimeout(() => setGlow(false), 2600)

    return () => {
      clearTimeout(scrollTimer)
      clearTimeout(focusTimer)
      clearTimeout(glowTimer)
    }
  }, [location.key, location.hash, location.search])

  const change = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (sending) return

    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setFailure('')

    // a bot filled the hidden field: pretend it worked, send nothing
    if (form.website) {
      setSent(true)
      return
    }

    setSending(true)
    try {
      const country = COUNTRIES.find((c) => c.code === form.country) ?? COUNTRIES[0]
      await createContactMessage({
        fullName: form.name,
        email: form.email,
        phoneDialCode: dialOf(country),
        phone: form.phone,
        message: form.message,
      })
      setSent(true)
      setForm(EMPTY)
    } catch {
      setFailure('Sorry, your message could not be sent. Please try again in a moment.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      id="send-message"
      ref={cardRef}
      className={`relative scroll-mt-28 rounded-3xl bg-[#0A2E27]/55 p-6 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-shadow duration-500 sm:p-8 ${
        glow ? 'ring-2 ring-[#9FD8C9] shadow-[0_0_0_6px_rgba(159,216,201,0.18),0_30px_60px_-24px_rgba(0,0,0,0.7)]' : 'ring-1 ring-white/20'
      }`}
    >
      <style>{`
        @keyframes cf-pop { 0% { transform: scale(0.4); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes cf-ring { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes cf-spin { to { transform: rotate(360deg); } }
        .cf-pop { animation: cf-pop 0.5s ease-out both; }
        .cf-ring { animation: cf-ring 1.8s ease-out infinite; }
        .cf-spin { animation: cf-spin 0.8s linear infinite; }

        /* keep browser autofill dark and readable */
        .cf-input:-webkit-autofill,
        .cf-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff;
          caret-color: #ffffff;
          transition: background-color 9999s ease-out 0s;
          box-shadow: 0 0 0 1000px #12463b inset;
        }
        .cf-scroll { scrollbar-width: thin; scrollbar-color: rgba(159,216,201,0.4) transparent; }
      `}</style>

      {/* soft inner light, clipped to the card (the country list can still drop out of it) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0D3A31] via-[#2F8F7A] to-[#9FD8C9]" />
        <div className="absolute -right-16 -top-20 size-56 rounded-full bg-[#2F8F7A]/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 size-56 rounded-full bg-[#9FD8C9]/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] to-transparent" />
      </div>

      <div className="relative">
        {sent ? (
          <div className="flex min-h-[26rem] flex-col items-center justify-center text-center">
            <span className="relative grid size-20 place-items-center">
              <span className="cf-ring absolute inset-0 rounded-full bg-[#9FD8C9]/40" />
              <span className="cf-pop relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#2F8F7A] to-[#9FD8C9] text-[#0A2E27] shadow-lg">
                <Icons.Check size={36} />
              </span>
            </span>
            <h3 className="mt-6 text-2xl font-bold text-white">Message sent</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">
              Thank you for writing to Peak Star. Our team will read your message and get back to you.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/20 active:scale-95"
            >
              <Icons.Chat size={15} className="text-[#9FD8C9]" />
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#2F8F7A] to-[#9FD8C9] text-[#0A2E27] shadow-md">
                <Icons.Send size={19} />
              </span>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">Send us a message</h3>
                <p className="text-xs text-white/65">Tell us a little about you and what you need.</p>
              </div>
            </div>

            <div className="mt-4 h-px bg-gradient-to-r from-white/25 via-white/10 to-transparent" />

            <div className="mt-5 space-y-4">
              <Field id="cf-name" label="Full name" error={errors.name}>
                <div className={boxClass(errors.name)}>
                  <Icons.User size={17} className="shrink-0 text-[#9FD8C9]" />
                  <input
                    id="cf-name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => change('name')(e.target.value)}
                    placeholder="Your full name"
                    maxLength={120}
                    className={inputClass}
                  />
                </div>
              </Field>

              <Field id="cf-phone" label="Telephone" optional error={errors.phone}>
                <PhoneField
                  id="cf-phone"
                  country={form.country}
                  onCountry={change('country')}
                  value={form.phone}
                  onValue={change('phone')}
                  error={errors.phone}
                />
              </Field>

              <Field id="cf-email" label="Email address" error={errors.email}>
                <div className={boxClass(errors.email)}>
                  <Icons.Mail size={17} className="shrink-0 text-[#9FD8C9]" />
                  <input
                    id="cf-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => change('email')(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={200}
                    className={inputClass}
                  />
                </div>
              </Field>

              <Field id="cf-message" label="Your message" error={errors.message}>
                <div className={`${boxClass(errors.message)} items-start`}>
                  <Icons.Chat size={17} className="mt-3.5 shrink-0 text-[#9FD8C9]" />
                  <textarea
                    id="cf-message"
                    ref={messageRef}
                    rows={4}
                    value={form.message}
                    onChange={(e) => change('message')(e.target.value.slice(0, MAX_MESSAGE))}
                    placeholder="Tell us about your land, your plan or your challenge..."
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                </div>
                <p className="mt-1 text-right text-[11px] text-white/50">
                  {form.message.length} / {MAX_MESSAGE}
                </p>
              </Field>

              {/* hidden trap field for bots */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="cf-website">Leave this empty</label>
                <input
                  id="cf-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => change('website')(e.target.value)}
                />
              </div>
            </div>

            {failure && (
              <p role="alert" className="mt-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-medium text-red-200 ring-1 ring-red-400/40">
                {failure}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="group relative mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#2F8F7A] via-[#6FC2AD] to-[#9FD8C9] px-6 py-3.5 text-sm font-bold text-[#0A2E27] shadow-[0_14px_30px_-12px_rgba(159,216,201,0.6)] transition duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sending ? (
                <>
                  <svg className="cf-spin size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Icons.Send size={16} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Send message
                </>
              )}
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/60">
              <Icons.Shield size={13} className="text-[#9FD8C9]" />
              Your details are only used to reply to your message.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}