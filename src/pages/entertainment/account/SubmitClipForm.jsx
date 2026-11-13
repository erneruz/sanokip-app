// src/pages/entertainment/account/SubmitClipForm.jsx
// The window to send a clip for scouts to review (inspired by the Open Pitch form):
//   who is in the clip -> the details -> the video (upload or link) -> the confirmations.
// A talent sends for themselves or for another adult. A parent or guardian sends for a child.
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { TALENT_CATEGORIES } from '../../../constants/talentCategories'
import { CONSENT_WORDING_VERSION, RELATIONSHIPS_ADULT } from '../../../constants/talentJourney'
import { MAX_CLIP_MB, createSubmission, giveConsent } from '../../../services/entertainmentTalentService'
import { Field, inputClass } from './accountUi'
import { Modal, Notice, TIcon, btnGhost, btnPrimary } from './talentUi'

const MAX_BYTES = MAX_CLIP_MB * 1024 * 1024

function megabytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1)
}

function Tick({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#F8FBFA] p-3 text-sm text-gray-700 ring-1 ring-[#E6F1EE] transition hover:bg-[#F1F6F4]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#1B5E4F]"
      />
      <span>{children}</span>
    </label>
  )
}

export default function SubmitClipForm({ kids = [], defaultChildId = '', onClose, onSent }) {
  const { user, entProfile } = useAuth()
  const d = entProfile.details ?? {}
  const isGuardian = entProfile.role === 'guardian'
  const firstName = (entProfile.full_name ?? '').trim().split(/\s+/)[0] ?? ''
  const myPlace = [entProfile.district, entProfile.country].filter(Boolean).join(', ')

  const subjects = useMemo(
    () =>
      isGuardian
        ? [
            { value: 'child', title: 'My child', text: 'Under 18. I am the parent or legal guardian.', icon: 'child' },
            { value: 'adult', title: 'Another adult', text: 'They know about this and agree.', icon: 'users' },
          ]
        : [
            { value: 'self', title: 'Me', text: 'I am 18 or over.', icon: 'user' },
            { value: 'adult', title: 'Another adult', text: 'They know about this and agree.', icon: 'users' },
          ],
    [isGuardian],
  )

  const startChild = kids.find((c) => c.id === defaultChildId) ?? (isGuardian && kids.length === 1 ? kids[0] : null)
  const [subject, setSubject] = useState(subjects[0].value)
  const [childId, setChildId] = useState(startChild?.id ?? '')
  const [f, setF] = useState(() => ({
    personName: isGuardian ? (startChild?.first_name ?? '') : firstName,
    personFullName: '',
    personContact: '',
    relationship: '',
    category: isGuardian ? (startChild?.category ?? '') : (d.category ?? ''),
    whatTheyDo: isGuardian ? (startChild?.specialty ?? '') : (d.specialty ?? ''),
    location: isGuardian
      ? [startChild?.district, startChild?.province].filter(Boolean).join(', ')
      : myPlace,
    note: '',
    videoUrl: '',
    rights: false,
    agreed: false,
    guardianConsent: false,
  }))
  const [mode, setMode] = useState('upload') // 'upload' | 'link'
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pickRef = useRef(null)
  const camRef = useRef(null)

  const set = (patch) => setF((x) => ({ ...x, ...patch }))

  // choosing who is in the clip refills the form
  function chooseSubject(value) {
    setSubject(value)
    setError('')
    if (value === 'adult') {
      set({ personName: '', category: '', whatTheyDo: '', location: '' })
    } else if (value === 'self') {
      set({ personName: firstName, category: d.category ?? '', whatTheyDo: d.specialty ?? '', location: myPlace })
    } else {
      pickChild(childId)
    }
  }

  function pickChild(id) {
    setChildId(id)
    const c = kids.find((k) => k.id === id)
    set({
      personName: c?.first_name ?? '',
      category: c?.category ?? '',
      whatTheyDo: c?.specialty ?? '',
      location: c ? [c.district, c.province].filter(Boolean).join(', ') : '',
    })
  }

  function takeFile(picked) {
    setError('')
    if (!picked) return
    if (!/^video\//i.test(picked.type) && !/\.(mp4|mov|webm|3gp)$/i.test(picked.name)) {
      setError('Please choose a video file (MP4, MOV or WebM).')
      return
    }
    if (picked.size > MAX_BYTES) {
      setError(`This video is ${megabytes(picked.size)} MB. The limit here is ${MAX_CLIP_MB} MB. Paste a YouTube or Google Drive link instead.`)
      return
    }
    setFile(picked)
  }

  function problem() {
    if (subject === 'child' && !childId) return 'Please choose which child is in the clip.'
    if (!f.personName.trim()) return 'Please write the first name of the person in the clip.'
    if (!f.category && !f.whatTheyDo.trim()) return 'Please say what they do.'
    if (!f.location.trim()) return 'Please write where they are based.'
    if (subject === 'adult') {
      if (!f.personFullName.trim()) return 'Please write their full name.'
      if (f.personContact.trim().length < 5) return 'Please write their phone or email. We ask them to confirm before anything is published.'
      if (!f.relationship) return 'Please choose your relationship to them.'
    }
    if (mode === 'upload' && !file) return 'Please choose a video, or paste a link.'
    if (mode === 'link' && !/^https?:\/\/\S+\.\S+/i.test(f.videoUrl.trim())) return 'Please paste a full link, starting with https://'
    if (subject === 'adult' && !f.agreed) return 'Please confirm that they know about this and agree.'
    if (subject === 'child' && !f.guardianConsent) return 'Please confirm that you are the parent or legal guardian and give your consent.'
    if (!f.rights) return 'Please confirm that you made the video or have permission to share it.'
    return ''
  }

  async function submit() {
    const p = problem()
    if (p) {
      setError(p)
      return
    }
    setBusy(true)
    setError('')
    try {
      if (subject === 'child') {
        // the guardian's consent to review is recorded (a second one is not needed if it exists)
        try {
          await giveConsent(user.id, childId, 'review', entProfile.full_name, CONSENT_WORDING_VERSION)
        } catch (err) {
          if (err?.code !== '23505') throw err
        }
      }
      await createSubmission(user.id, {
        subject,
        childId,
        personName: f.personName,
        personFullName: f.personFullName,
        personContact: f.personContact,
        relationship: f.relationship,
        category: f.category,
        whatTheyDo: f.whatTheyDo,
        location: f.location,
        note: f.note,
        videoUrl: mode === 'link' ? f.videoUrl : '',
        file: mode === 'upload' ? file : null,
        rightsConfirmed: f.rights,
        personAgreed: f.agreed,
      })
      await onSent()
    } catch (err) {
      console.error('Could not send the clip:', err)
      setError(
        /size|exceed|too large|payload/i.test(err?.message ?? '')
          ? `This video is too big. The limit here is ${MAX_CLIP_MB} MB. Paste a link instead.`
          : 'Could not send the clip. Please check your connection and try again.',
      )
      setBusy(false)
    }
  }

  const noChildren = subject === 'child' && kids.length === 0

  return (
    <Modal
      title="Send a clip for review"
      text="Any quality is fine. A rough phone video is enough. Scouts never ask for money."
      wide
      busy={busy}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={busy || noChildren} className={btnPrimary}>
            <TIcon name="send" size={15} />
            {busy ? (file && mode === 'upload' ? 'Uploading… keep this window open' : 'Sending…') : 'Send for review'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* who is in the clip */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Who is in this clip?</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {subjects.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => chooseSubject(o.value)}
                aria-pressed={subject === o.value}
                className={
                  'flex cursor-pointer items-center gap-3 rounded-2xl p-3 text-left ring-1 transition active:scale-[0.98] ' +
                  (subject === o.value ? 'bg-[#E6F1EE] ring-2 ring-[#1B5E4F]' : 'bg-white ring-gray-200 hover:bg-gray-50')
                }
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1B5E4F] shadow-sm ring-1 ring-[#CDEBE2]">
                  <TIcon name={o.icon} size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#0F3D32]">{o.title}</span>
                  <span className="block text-xs text-gray-500">{o.text}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {subject === 'child' && (
          <>
            {kids.length === 0 ? (
              <Notice tone="amber" icon="child">
                Add your child first, so we can keep their clips and consents together.{' '}
                <Link to="/entertainment/account/children" className="font-semibold underline">
                  Add a child
                </Link>
              </Notice>
            ) : (
              <Field label="Which child?" htmlFor="sc-child">
                <select id="sc-child" className={inputClass} value={childId} onChange={(e) => pickChild(e.target.value)}>
                  <option value="">Choose a child</option>
                  {kids.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} ({c.age_years})
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Notice icon="lock">
              Anyone under 18 can only be sent by a parent or legal guardian. A public profile shows a first name only, and
              all contact comes to you.
            </Notice>
          </>
        )}

        {/* the person */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name of the person in the clip" htmlFor="sc-name">
            <input id="sc-name" className={inputClass} value={f.personName} onChange={(e) => set({ personName: e.target.value })} maxLength={80} placeholder="Example: Aline" />
          </Field>
          <Field label="Where they are based" htmlFor="sc-place" hint="Town and country, so a scout knows if a visit is possible.">
            <input id="sc-place" className={inputClass} value={f.location} onChange={(e) => set({ location: e.target.value })} placeholder="Example: Huye, Rwanda" />
          </Field>
          <Field label="Talent category" htmlFor="sc-cat">
            <select id="sc-cat" className={inputClass} value={f.category} onChange={(e) => set({ category: e.target.value })}>
              <option value="">Choose a category</option>
              {TALENT_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="What they do" htmlFor="sc-do" hint="Singer, dancer, striker, painter…">
            <input id="sc-do" className={inputClass} value={f.whatTheyDo} onChange={(e) => set({ whatTheyDo: e.target.value })} maxLength={80} placeholder="Example: Outside hitter" />
          </Field>
        </div>

        {subject === 'adult' && (
          <div className="rounded-2xl bg-[#F8FBFA] p-4 ring-1 ring-[#E6F1EE]">
            <p className="mb-3 text-sm font-semibold text-[#0F3D32]">The person in the clip (private to scouts)</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Their full name" htmlFor="sc-full">
                <input id="sc-full" className={inputClass} value={f.personFullName} onChange={(e) => set({ personFullName: e.target.value })} maxLength={120} />
              </Field>
              <Field label="Their phone or email" htmlFor="sc-contact" hint="We ask them to confirm before anything is published.">
                <input id="sc-contact" className={inputClass} value={f.personContact} onChange={(e) => set({ personContact: e.target.value })} maxLength={120} />
              </Field>
              <Field label="Your relationship to them" htmlFor="sc-rel">
                <select id="sc-rel" className={inputClass} value={f.relationship} onChange={(e) => set({ relationship: e.target.value })}>
                  <option value="">Choose</option>
                  {RELATIONSHIPS_ADULT.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* the video */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">The video</p>
          <div className="mb-3 inline-flex rounded-xl bg-[#F1F6F4] p-1">
            {[
              { v: 'upload', label: 'Upload a video' },
              { v: 'link', label: 'Paste a link' },
            ].map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => {
                  setMode(t.v)
                  setError('')
                }}
                className={
                  'cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold transition ' +
                  (mode === t.v ? 'bg-white text-[#0F3D32] shadow-sm' : 'text-gray-500 hover:text-[#0F3D32]')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === 'upload' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                takeFile(e.dataTransfer.files?.[0])
              }}
              className={
                'rounded-2xl border-2 border-dashed p-5 text-center transition ' +
                (dragging ? 'border-[#2F9678] bg-[#E6F1EE]' : 'border-[#9FD8C9] bg-[#F8FBFA]')
              }
            >
              {file ? (
                <div className="flex items-center justify-center gap-3 text-left">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1B5E4F] text-white">
                    <TIcon name="video" size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#0F3D32]">{file.name}</span>
                    <span className="block text-xs text-gray-500">{megabytes(file.size)} MB</span>
                  </span>
                  <button type="button" onClick={() => setFile(null)} disabled={busy} className="cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-white text-[#1B5E4F] shadow-sm ring-1 ring-[#CDEBE2]">
                    <TIcon name="upload" size={20} />
                  </span>
                  <p className="mt-2 text-sm font-semibold text-[#0F3D32]">Drop a video here, or choose one</p>
                  <p className="text-xs text-gray-500">MP4, MOV or WebM. Up to {MAX_CLIP_MB} MB, about 3 minutes.</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button type="button" onClick={() => pickRef.current?.click()} className="cursor-pointer rounded-xl bg-[#1B5E4F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#154A3F] active:scale-95">
                      Choose a video
                    </button>
                    <button type="button" onClick={() => camRef.current?.click()} className="cursor-pointer rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0F3D32] ring-1 ring-[#CDEBE2] transition hover:bg-[#F1F6F4] active:scale-95">
                      Record now
                    </button>
                  </div>
                </>
              )}
              <input ref={pickRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/3gpp,.mp4,.mov,.webm" className="hidden" onChange={(e) => takeFile(e.target.files?.[0])} />
              <input ref={camRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => takeFile(e.target.files?.[0])} />
            </div>
          ) : (
            <Field label="Link to the video" htmlFor="sc-link" hint="A YouTube, Google Drive, Instagram or TikTok link. Make sure scouts can open it.">
              <input id="sc-link" className={inputClass} value={f.videoUrl} onChange={(e) => set({ videoUrl: e.target.value })} placeholder="https://" inputMode="url" />
            </Field>
          )}
        </div>

        <Field label="Anything the scout should know?" optional htmlFor="sc-note">
          <textarea id="sc-note" className={inputClass + ' min-h-[80px] resize-y'} value={f.note} onChange={(e) => set({ note: e.target.value })} maxLength={600} placeholder="Example: This was filmed at a school match last month." />
        </Field>

        {/* confirmations */}
        <div className="space-y-2">
          {subject === 'child' && (
            <Tick checked={f.guardianConsent} onChange={(v) => set({ guardianConsent: v })}>
              I am the parent or legal guardian. I consent to this clip being reviewed, and I understand a guardian must be
              present at any scout visit.
            </Tick>
          )}
          {subject === 'adult' && (
            <Tick checked={f.agreed} onChange={(v) => set({ agreed: v })}>
              They know about this submission and agree to it.
            </Tick>
          )}
          <Tick checked={f.rights} onChange={(v) => set({ rights: v })}>
            I made this video, or I have permission to share it.
          </Tick>
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <TIcon name="info" size={16} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}