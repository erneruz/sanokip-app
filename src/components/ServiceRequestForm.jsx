// src/components/ServiceRequestForm.jsx
import { useEffect, useRef, useState } from 'react'
import { COUNTRIES, DEFAULT_COUNTRY_CODE } from '../constants/countries'
import { createServiceRequest } from '../services/serviceRequestsService'

const defaultCountryName = COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY_CODE)?.name ?? 'Rwanda'

const REQUESTER_TYPES = [
  { value: 'individual', label: 'On my own behalf (individual)' },
  { value: 'company', label: 'On behalf of a company' },
  { value: 'institution', label: 'On behalf of an institution' },
  { value: 'organization', label: 'On behalf of an organization' },
]

/* ---------- icons ---------- */
function Svg({ size = 16, className = '', strokeWidth = 2, children }) {
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

function UserIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </Svg>
  )
}

function PhoneIcon(props) {
  return (
    <Svg {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </Svg>
  )
}

function MailIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  )
}

function BuildingIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
    </Svg>
  )
}

function UsersIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.8.7 3 2.2 3 5.2" />
    </Svg>
  )
}

function GlobeIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" />
    </Svg>
  )
}

function MapPinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  )
}

function MessageIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </Svg>
  )
}

function CheckCircleIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Svg>
  )
}

function CheckIcon(props) {
  return (
    <Svg strokeWidth={3} {...props}>
      <path d="m5 12 5 5L20 7" />
    </Svg>
  )
}

function AlertIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5h.01" />
    </Svg>
  )
}

function ArrowLeftIcon(props) {
  return (
    <Svg {...props}>
      <path d="M19 12H5M11 19l-7-7 7-7" />
    </Svg>
  )
}

function SendIcon(props) {
  return (
    <Svg {...props}>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </Svg>
  )
}

function SpinnerIcon(props) {
  return (
    <Svg strokeWidth={3} {...props}>
      <path d="M12 2a10 10 0 1 0 10 10" />
    </Svg>
  )
}

function ChevronDownIcon(props) {
  return (
    <Svg strokeWidth={2.5} {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

function SearchIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  )
}

/* ---------- small building blocks ---------- */

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F]'

function Field({ icon: Icon, label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#0D3A31]">
        <Icon size={14} className="text-[#2F8F7A]" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="mb-4 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-[#1B5E4F]">
      <span className="grid size-8 place-items-center rounded-lg bg-[#E6F1EE] text-[#1B5E4F]">
        <Icon size={16} />
      </span>
      {children}
      <span className="h-px flex-1 bg-[#1B5E4F]/15" />
    </h3>
  )
}

/*
  Country flag as a small picture. Windows does not draw emoji flags, so the
  picture comes from flagcdn.com. If it cannot load, the country letters show.
*/
function Flag({ code, className = '' }) {
  const [failed, setFailed] = useState(false)
  const lower = String(code || '').toLowerCase()

  if (!lower || failed) {
    return (
      <span
        className={`grid h-[15px] w-5 shrink-0 place-items-center rounded-[3px] bg-[#E6F1EE] text-[8px] font-bold text-[#1B5E4F] ${className}`}
      >
        {String(code || '').toUpperCase().slice(0, 2)}
      </span>
    )
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${lower}.png`}
      srcSet={`https://flagcdn.com/w80/${lower}.png 2x`}
      width="20"
      height="15"
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-[15px] w-5 shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.12)] ${className}`}
    />
  )
}

/*
  Phone field: [flag +250 v] [ number bar ]
  The flag button opens a searchable list of countries. The number bar holds
  only the number, because the country code is already shown by the flag.
*/
function PhoneField({ countryCode, onCountryChange, number, onNumberChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)

  const selected = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0]

  // close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return
    function onMouseDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          String(c.dial).includes(q)
      )
    : COUNTRIES

  function toggle() {
    setQuery('')
    setOpen((o) => !o)
  }

  function choose(code) {
    onCountryChange(code)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={wrapRef} className="relative flex gap-2">
      {/* flag + code button */}
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code: ${selected.name} ${selected.dial}`}
        className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-[#0D3A31] outline-none transition hover:border-[#1B5E4F]/60 focus:border-[#1B5E4F] focus:ring-1 focus:ring-[#1B5E4F] ${
          open ? 'border-[#1B5E4F] ring-1 ring-[#1B5E4F]' : 'border-gray-300'
        }`}
      >
        <Flag code={selected.code} />
        <span>{selected.dial}</span>
        <ChevronDownIcon
          size={14}
          className={`text-[#2F8F7A] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* number bar (no country code inside) */}
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={number}
        onChange={(e) => onNumberChange(e.target.value.replace(/[^\d\s-]/g, ''))}
        className={`${inputClass} min-w-0 flex-1`}
        placeholder="788 123 456"
      />

      {/* country list */}
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full max-w-sm overflow-hidden rounded-xl border border-[#1B5E4F]/15 bg-white shadow-[0_16px_40px_-12px_rgba(13,58,49,0.35)]">
          <div className="relative border-b border-[#1B5E4F]/10 p-2">
            <SearchIcon
              size={15}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#2F8F7A]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              autoFocus
              className="w-full rounded-lg bg-[#F1F6F4] py-2 pl-9 pr-3 text-sm text-[#0D3A31] outline-none placeholder:text-gray-400 focus:ring-1 focus:ring-[#1B5E4F]"
            />
          </div>

          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-gray-500">No country found.</li>
            )}
            {filtered.map((c) => {
              const active = c.code === selected.code
              return (
                <li key={c.code} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => choose(c.code)}
                    className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? 'bg-[#E6F1EE] font-semibold text-[#0D3A31]'
                        : 'text-gray-700 hover:bg-[#F1F6F4]'
                    }`}
                  >
                    <Flag code={c.code} />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="shrink-0 text-xs font-medium text-gray-500">{c.dial}</span>
                    {active && <CheckIcon size={14} className="shrink-0 text-[#1B5E4F]" />}
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

export default function ServiceRequestForm({ service, onBack, onClose }) {
  const [form, setForm] = useState({
    fullName: '',
    phoneCountry: DEFAULT_COUNTRY_CODE,
    phoneNumber: '',
    email: '',
    requesterType: 'individual',
    organizationName: '',
    country: defaultCountryName,
    province: '',
    district: '',
    message: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    if (!form.fullName.trim()) return 'Please enter your full name.'
    if (!form.phoneNumber.trim()) return 'Please enter your phone number.'
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return 'Please enter a valid email address.'
    }
    if (form.requesterType !== 'individual' && !form.organizationName.trim()) {
      return 'Please enter the name of the company, institution or organization.'
    }
    if (!form.country) return 'Please select a country.'
    if (!form.province.trim()) return 'Please enter the province or state.'
    if (!form.district.trim()) return 'Please enter the district or county.'
    if (!form.message.trim()) return 'Please tell us briefly why you need this service.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)

    // the dial code comes from the country picked on the flag button
    const phoneCountry = COUNTRIES.find((c) => c.code === form.phoneCountry) ?? COUNTRIES[0]

    try {
      await createServiceRequest({
        service_id: service.id,
        service_name: service.name,
        category_name: service.categoryName,
        requester_name: form.fullName.trim(),
        phone_dial_code: phoneCountry.dial,
        phone_number: form.phoneNumber.trim(),
        email: form.email.trim(),
        requester_type: form.requesterType,
        organization_name: form.requesterType === 'individual' ? null : form.organizationName.trim(),
        country: form.country,
        province_state: form.province.trim(),
        district_county: form.district.trim(),
        message: form.message.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-5 grid size-16 place-items-center rounded-full bg-[#E6F1EE] text-[#1B5E4F] ring-8 ring-[#E6F1EE]/50">
          <CheckIcon size={30} />
        </div>
        <h3 className="text-xl font-bold text-[#0D3A31]">Request received</h3>
        <div className="mt-2 h-[3px] w-10 rounded-full bg-[#2F8F7A]" />
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
          Thank you. Our team has received your request for{' '}
          <span className="font-semibold text-[#0D3A31]">{service.name}</span> and will get back to
          you at <span className="font-semibold text-[#0D3A31]">{form.email}</span> shortly.
        </p>
        <button
          onClick={onClose}
          className="mt-8 cursor-pointer rounded-lg bg-[#1B5E4F] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 sm:px-10 sm:py-10">
      {/* Requested-service banner, pinned at the top of the form */}
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-[#1B5E4F]/15 bg-[#E6F1EE] p-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] text-white shadow-sm">
          <CheckCircleIcon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2F8F7A]">
            You're requesting
          </p>
          <p className="truncate text-sm font-bold text-[#0D3A31]">{service.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Your details */}
        <div>
          <SectionTitle icon={UserIcon}>Your details</SectionTitle>
          <div className="space-y-4">
            <Field icon={UserIcon} label="Full name" required>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className={inputClass}
                placeholder="e.g. Jean Mugisha"
              />
            </Field>

            <Field icon={PhoneIcon} label="Phone number" required>
              <PhoneField
                countryCode={form.phoneCountry}
                onCountryChange={(code) => update('phoneCountry', code)}
                number={form.phoneNumber}
                onNumberChange={(value) => update('phoneNumber', value)}
              />
            </Field>

            <Field icon={MailIcon} label="Email address" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </Field>

            <Field icon={UsersIcon} label="Requesting as" required>
              <select
                value={form.requesterType}
                onChange={(e) => update('requesterType', e.target.value)}
                className={inputClass}
              >
                {REQUESTER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            {form.requesterType !== 'individual' && (
              <Field icon={BuildingIcon} label="Company / institution / organization name" required>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(e) => update('organizationName', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Peakstar Ltd"
                />
              </Field>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <SectionTitle icon={MapPinIcon}>Where the service is needed</SectionTitle>
          <div className="space-y-4">
            <Field icon={GlobeIcon} label="Country" required>
              <select
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className={inputClass}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field icon={MapPinIcon} label="Province / State" required>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => update('province', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Kigali City"
                />
              </Field>
              <Field icon={MapPinIcon} label="District / County" required>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Gasabo"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <SectionTitle icon={MessageIcon}>Your message</SectionTitle>
          <textarea
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            rows={5}
            className={`${inputClass} resize-y leading-relaxed`}
            placeholder="Tell us why you need this service and how you'd like it delivered: timeline, site details, or anything else that helps us prepare a response."
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1B5E4F]/10 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1B5E4F] transition-colors hover:text-[#0D3A31]"
          >
            <ArrowLeftIcon size={15} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Back to service details
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#1B5E4F] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#154A3E] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <SpinnerIcon size={16} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <SendIcon size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                Submit request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}