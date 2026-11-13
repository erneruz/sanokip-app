// src/pages/admin/SubmissionReviewPanel.jsx
// The side panel where a scout reviews ONE clip: watch it, see who sent it and the consents,
// move it to the next step (with a message for the member), save the reel and documentary
// links, read the history and keep private team notes.
import { useEffect, useState } from 'react'
import { getTalentCategory } from '../../constants/talentCategories'
import { CONSENT_KINDS, statusInfo } from '../../constants/talentJourney'
import { CHILD_GATES, NEXT_STEPS, SETTABLE_STATUSES, activeConsentKinds, subjectLabel } from '../../constants/talentAdmin'
import {
  addSubmissionNote,
  listSubmissionNotes,
  moveSubmission,
  saveSubmissionLinks,
} from '../../services/entertainmentTalentAdminService'
import { getClipUrl } from '../../services/entertainmentTalentService'
import { IconCheck, IconClock, IconShield, IconStoryStar, IconVideo } from '../../components/admin/EntAdminIcons'
import { Avatar } from '../../components/admin/entAdminUi'
import {
  Detail,
  SubmissionPill,
  adminBtn,
  adminInput,
  formatDate,
  formatDateTime,
} from '../../components/admin/talentAdminUi'

const STEP_BTN = { go: adminBtn.primary, ask: adminBtn.amber, stop: adminBtn.danger, soft: adminBtn.ghost }

function whatsappLink(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : ''
}

function eventLabel(e) {
  if (e.actor === 'member') {
    if (e.status === 'withdrawn') return 'The member withdrew the clip'
    if (e.note) return 'The member replied'
    if (e.status === 'submitted') return 'The member sent the clip'
  }
  return statusInfo(e.status).label
}

export default function SubmissionReviewPanel({ s, onClose, onChanged }) {
  const [note, setNote] = useState('')
  const [reelUrl, setReelUrl] = useState(s.reel_url ?? '')
  const [docUrl, setDocUrl] = useState(s.documentary_url ?? '')
  const [otherStatus, setOtherStatus] = useState('')
  const [teamNotes, setTeamNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [player, setPlayer] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  const info = statusInfo(s.status)
  const cat = getTalentCategory(s.category)
  const active = activeConsentKinds(s.consents)
  const isChild = s.subject === 'child'
  const steps = NEXT_STEPS[s.status] ?? []
  const finished = s.status === 'withdrawn'
  const whatsapp = whatsappLink(s.submitter_phone)

  // the links follow the saved values (after a step or a save)
  useEffect(() => {
    setReelUrl(s.reel_url ?? '')
    setDocUrl(s.documentary_url ?? '')
  }, [s.reel_url, s.documentary_url])

  // team notes of this clip
  useEffect(() => {
    let alive = true
    listSubmissionNotes(s.id)
      .then((n) => alive && setTeamNotes(n))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [s.id])

  // Escape closes the panel
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function run(action, doneText = '') {
    setBusy(true)
    setError('')
    setSaved('')
    try {
      await action()
      await onChanged()
      if (doneText) setSaved(doneText)
      return true
    } catch (err) {
      console.error(err)
      setError(err?.message || 'That did not work. Please try again.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function watch() {
    setError('')
    setBusy(true)
    try {
      const clip = await getClipUrl(s)
      if (!clip) return
      if (clip.kind === 'link') window.open(clip.url, '_blank', 'noopener,noreferrer')
      else setPlayer(clip.url)
    } catch (err) {
      console.error(err)
      setError('Could not open the clip.')
    } finally {
      setBusy(false)
    }
  }

  // one step forward (or back) with the message for the member
  async function move(step) {
    if (step.note === 'required' && note.trim().length < 3) {
      setError('Please write a short message for the member first. They will read it.')
      return
    }
    if (step.needsDocumentary && !docUrl.trim()) {
      setError('Paste the YouTube link of the documentary first.')
      return
    }
    const ok = await run(
      () => moveSubmission(s.id, { status: step.status, note, reelUrl, documentaryUrl: docUrl }),
      `Moved to "${statusInfo(step.status).label}".`,
    )
    if (ok) {
      setNote('')
      setOtherStatus('')
    }
  }

  // a step is blocked when a child's guardian has not given the consent it needs
  function blockedBy(status) {
    const gate = CHILD_GATES[status]
    if (!isChild || !gate || active.includes(gate)) return ''
    return CONSENT_KINDS.find((k) => k.kind === gate)?.title ?? gate
  }

  async function addNote() {
    if (newNote.trim().length < 1) return
    const ok = await run(async () => {
      await addSubmissionNote(s.id, newNote)
      setTeamNotes(await listSubmissionNotes(s.id))
    })
    if (ok) setNewNote('')
  }

  const otherBlocked = otherStatus ? blockedBy(otherStatus) : ''

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Review a clip">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/40" />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
        {/* top */}
        <div className="flex items-start gap-3 bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] p-5 text-white">
          <Avatar name={s.person_name} size="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">
              {s.person_name}
              {s.what_they_do ? <span className="font-normal text-white/70"> · {s.what_they_do}</span> : null}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <SubmissionPill status={s.status} />
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">{subjectLabel(s)}</span>
              {cat && <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">{cat.label}</span>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* the clip */}
          <section>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={watch} disabled={busy} className={adminBtn.primary}>
                <IconVideo className="h-4 w-4" />
                {s.video_url ? 'Open the video link' : 'Watch the clip'}
              </button>
              {s.video_url && <span className="min-w-0 truncate text-xs text-gray-400">{s.video_url}</span>}
            </div>
            {player && <video src={player} controls autoPlay playsInline className="mt-3 w-full rounded-xl bg-black" />}
          </section>

          {/* what the system says about the status */}
          <p className="flex items-start gap-2 rounded-xl bg-[#F1F6F4] px-3 py-2.5 text-sm text-[#154A3F]">
            <IconClock className="mt-0.5 h-4 w-4 shrink-0" />
            {info.text}
          </p>

          {/* the member answered */}
          {s.reply_note && (
            <p className="rounded-xl border border-[#9FD8C9] bg-white px-3 py-2.5 text-sm text-gray-700">
              <span className="font-semibold text-[#0F3D32]">The member's last reply: </span>
              {s.reply_note}
            </p>
          )}

          {/* the steps */}
          {!finished && (
            <section className="rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Next step</h3>
              <label className="mt-3 block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Message for the member (they will read it)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Example: Please tell us where this video was filmed and who the coach is."
                  className={adminInput + ' mt-1 resize-y'}
                />
              </label>

              {/* links needed by the last steps */}
              {['shot', 'profile_draft', 'published', 'documentary_linked'].includes(s.status) && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Showcase reel link</span>
                    <input value={reelUrl} onChange={(e) => setReelUrl(e.target.value)} placeholder="https://" className={adminInput + ' mt-1'} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">YouTube documentary link</span>
                    <input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://youtu.be/…" className={adminInput + ' mt-1'} />
                  </label>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {steps.map((st) => {
                  const need = blockedBy(st.status)
                  return (
                    <button
                      key={st.status}
                      onClick={() => move(st)}
                      disabled={busy || !!need}
                      title={need ? `Needs the guardian's "${need}" consent` : undefined}
                      className={STEP_BTN[st.tone]}
                    >
                      {st.label}
                    </button>
                  )
                })}
                {steps.length === 0 && <p className="text-sm text-gray-500">This clip is at the end of the usual path.</p>}
              </div>

              {steps.map((st) => {
                const need = blockedBy(st.status)
                return need ? (
                  <p key={st.status} className="mt-2 text-xs text-amber-700">
                    "{st.label}" needs the guardian's <strong>{need}</strong> consent first. Ask the guardian to give it on their Consents page.
                  </p>
                ) : null
              })}

              {/* any status */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                <select
                  value={otherStatus}
                  onChange={(e) => setOtherStatus(e.target.value)}
                  disabled={busy}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2F9678]"
                >
                  <option value="">Set another status…</option>
                  {SETTABLE_STATUSES.filter((x) => x !== s.status).map((x) => (
                    <option key={x} value={x}>
                      {statusInfo(x).label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => move({ status: otherStatus, note: ['needs_info', 'rejected'].includes(otherStatus) ? 'required' : 'optional', needsDocumentary: otherStatus === 'documentary_linked' })}
                  disabled={busy || !otherStatus || !!otherBlocked}
                  className={adminBtn.ghost}
                >
                  Apply
                </button>
                {otherBlocked && <span className="text-xs text-amber-700">Needs the guardian's "{otherBlocked}" consent.</span>}
              </div>

              {/* links without a step */}
              {['published', 'documentary_linked', 'profile_draft', 'shot'].includes(s.status) && (
                <div className="mt-3">
                  <button
                    onClick={() => run(() => saveSubmissionLinks(s.id, { reelUrl, documentaryUrl: docUrl }), 'Links saved.')}
                    disabled={busy || (reelUrl === (s.reel_url ?? '') && docUrl === (s.documentary_url ?? ''))}
                    className={adminBtn.soft}
                  >
                    Save the links only
                  </button>
                </div>
              )}

              {saved && (
                <p role="status" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#1B5E4F]">
                  <IconCheck className="h-4 w-4" /> {saved}
                </p>
              )}
              {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </section>
          )}

          {/* verified and public (talents) */}
          {s.subject === 'self' && (
            <p className="flex items-start gap-2 rounded-xl bg-[#F8FBFA] px-3 py-2.5 text-sm text-gray-600 ring-1 ring-[#E6F1EE]">
              <IconStoryStar className="mt-0.5 h-4 w-4 shrink-0 text-[#2F9678]" />
              <span>
                Talent card: {s.submitter_verified_at ? `verified on ${formatDate(s.submitter_verified_at)}` : 'not verified yet'}
                {' · '}
                {s.submitter_published_at ? `public since ${formatDate(s.submitter_published_at)}` : 'not public'}.
                It follows the status of the clip, and can be changed on the Talent cards page.
              </span>
            </p>
          )}

          {/* details */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Detail label="Location">{s.location}</Detail>
            <Detail label="Sent on">{formatDate(s.created_at)}</Detail>
            {isChild && <Detail label="Age">{s.child_age != null ? `${s.child_age} years` : ''}</Detail>}
            {isChild && <Detail label="Home area (private)">{[s.child_district, s.child_province].filter(Boolean).join(', ')}</Detail>}
            <Detail label="Rights confirmed">{s.rights_confirmed ? 'Yes' : 'No'}</Detail>
            {s.note && (
              <div className="col-span-2">
                <Detail label="Note from the member">{s.note}</Detail>
              </div>
            )}
          </dl>

          {/* sent by */}
          <section className="rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">{isChild ? 'Parent or guardian (receives all contact)' : 'Sent by'}</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              <Detail label="Name">{s.submitter_name}</Detail>
              <Detail label="Phone">
                {s.submitter_phone && <a href={`tel:${s.submitter_phone}`} className="text-[#1B5E4F] hover:underline">{s.submitter_phone}</a>}
              </Detail>
              <Detail label="Email">
                {s.submitter_email && <a href={`mailto:${s.submitter_email}`} className="break-all text-[#1B5E4F] hover:underline">{s.submitter_email}</a>}
              </Detail>
              <Detail label="WhatsApp">
                {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#1B5E4F] hover:underline">Open a chat</a>}
              </Detail>
            </dl>
          </section>

          {/* another adult */}
          {s.subject === 'adult' && (
            <section className="rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">The adult in the clip</h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                <Detail label="Full name">{s.person_full_name}</Detail>
                <Detail label="Phone or email">{s.person_contact}</Detail>
                <Detail label="Relationship to the sender">{s.relationship}</Detail>
                <Detail label="Sender says they agree">{s.person_agreed ? 'Yes' : 'No'}</Detail>
              </dl>
              <p className="mt-3 text-xs text-gray-500">
                Contact this person yourself and confirm before the clip goes any further. The system does not ask them yet.
              </p>
            </section>
          )}

          {/* consents */}
          {s.subject !== 'adult' && (
            <section className="rounded-2xl border border-gray-200 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <IconShield className="h-4 w-4 text-[#2F9678]" />
                Consents {isChild ? 'of the guardian' : 'of the talent'}
              </h3>
              <ul className="mt-3 divide-y divide-gray-100">
                {CONSENT_KINDS.map((k) => {
                  const last = [...(s.consents ?? [])].reverse().find((c) => c.kind === k.kind)
                  const on = last && !last.withdrawn_at
                  return (
                    <li key={k.kind} className="flex items-center gap-3 py-2 text-sm">
                      <span className={'h-2.5 w-2.5 shrink-0 rounded-full ' + (on ? 'bg-[#1B5E4F]' : 'bg-gray-300')} />
                      <span className="flex-1 text-gray-800">{k.title}</span>
                      <span className="text-xs text-gray-500">
                        {on ? `Given ${formatDate(last.given_at)}` : last ? `Withdrawn ${formatDate(last.withdrawn_at)}` : 'Not given'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* history */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900">History</h3>
            <ol className="mt-3 space-y-3 border-l-2 border-[#E6F1EE] pl-4">
              {[...(s.events ?? [])].reverse().map((e) => (
                <li key={e.id} className="relative">
                  <span className={'absolute -left-[22px] top-1 h-3 w-3 rounded-full ring-2 ring-white ' + (e.actor === 'member' ? 'bg-[#2F9678]' : 'bg-[#0F3D32]')} />
                  <p className="text-sm font-semibold text-[#0F3D32]">{eventLabel(e)}</p>
                  {e.note && <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">{e.note}</p>}
                  <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(e.created_at)}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* private team notes */}
          <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Team notes <span className="font-normal text-gray-400">(private, the member never sees these)</span></h3>
            {teamNotes.length > 0 && (
              <ul className="mt-3 space-y-2">
                {teamNotes.map((n) => (
                  <li key={n.id} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-gray-200">
                    <p className="whitespace-pre-line text-gray-800">{n.note}</p>
                    <p className="mt-1 text-xs text-gray-400">{n.author_name} · {formatDateTime(n.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex gap-2">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
                maxLength={2000}
                placeholder="Write a note for the team"
                className={adminInput}
              />
              <button onClick={addNote} disabled={busy || !newNote.trim()} className={adminBtn.soft}>
                Add
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}