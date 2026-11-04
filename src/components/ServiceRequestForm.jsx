// src/components/ServiceRequestForm.jsx
import { useState } from 'react'
import { COUNTRIES, DEFAULT_COUNTRY_CODE } from '../constants/countries'
import { createServiceRequest } from '../services/serviceRequestsService'

const defaultDial = COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY_CODE)?.dial ?? '+250'
const defaultCountryName = COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY_CODE)?.name ?? 'Rwanda'

const REQUESTER_TYPES = [
  { value: 'individual', label: 'On my own behalf (individual)' },
  { value: 'company', label: 'On behalf of a company' },
  { value: 'institution', label: 'On behalf of an institution' },
  { value: 'organization', label: 'On behalf of an organization' },
]

export default function ServiceRequestForm({ service, onBack, onClose }) {
  const [form, setForm] = useState({
    fullName: '',
    dialCode: defaultDial,
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

    try {
      await createServiceRequest({
        service_id: service.id,
        service_name: service.name,
        category_name: service.categoryName,
        requester_name: form.fullName.trim(),
        phone_dial_code: form.dialCode,
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
        <div className="flex items-center justify-center w-14 h-14 mb-5 text-white bg-black rounded-full">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Request received</h3>
        <p className="max-w-sm mt-2 text-sm text-gray-600">
          Thank you — our team has received your request for{' '}
          <span className="font-medium text-gray-900">{service.name}</span> and will get back to
          you at <span className="font-medium text-gray-900">{form.email}</span> shortly.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 mt-8 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 sm:px-10 sm:py-10">
      {/* Requested-service banner — pinned at the top of the form */}
      <div className="flex items-center gap-3 p-4 mb-8 border border-gray-200 rounded-xl bg-gray-50">
        <div className="flex items-center justify-center w-10 h-10 text-white bg-black rounded-lg shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
            You're requesting
          </p>
          <p className="text-sm font-bold text-gray-900 truncate">{service.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Your details */}
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">
            Your details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. Jean Mugisha"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={form.dialCode}
                  onChange={(e) => update('dialCode', e.target.value)}
                  className="px-2 py-2 text-sm bg-white border border-gray-300 rounded-md w-28 shrink-0 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.dial}>
                      {c.dial} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => update('phoneNumber', e.target.value)}
                  className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="788 123 456"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Requesting as <span className="text-red-500">*</span>
              </label>
              <select
                value={form.requesterType}
                onChange={(e) => update('requesterType', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                {REQUESTER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {form.requesterType !== 'individual' && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Company / institution / organization name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(e) => update('organizationName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Peakstar Ltd"
                />
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">
            Where the service is needed
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Province / State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => update('province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Kigali City"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  District / County <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Gasabo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-900 uppercase">
            Your message
          </h3>
          <textarea
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 leading-relaxed border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Tell us why you need this service and how you'd like it delivered — timeline, site details, or anything else that helps us prepare a response."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-gray-600 cursor-pointer hover:text-black"
          >
            ← Back to service details
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </form>
    </div>
  )
}