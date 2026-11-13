// src/pages/entertainment/account/SubmissionCard.jsx
// One submission: who, where, the status, the progress line, and what the member can do
// (watch the clip, answer a scout, see the history, withdraw).
import { useState } from 'react'
import { getTalentCategory } from '../../../constants/talentCategories'
import { statusInfo } from '../../../constants/talentJourney'
import { getClipUrl, replyToSubmission, withdrawSubmission } from '../../../services/entertainmentTalentService'
import SubmissionTracker from './SubmissionTracker'
import { Modal, TIcon, btnDanger, btnGhost, btnPrimary, btnSoft, formatDate } from './talentUi'
import { inputClass } from './accountUi'

const TONES = {
  green: 'bg-[#E6F1EE] text-[#0F3D32]',
  live: 'bg-[#1B5E4F] text-white',
  amber: 'bg-amber-100 text-amber-900',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-500',
}

function subjectLabel(s) {
  if (s.subject === 'child') return 'My child'
  if (s.subject === 'adult') return s.relationship ? `Another adult (${s.relationship.toLowerCase()})` : 'Another adult'
  return 'Me'
}

function eventLabel(e) {
  if (e.actor === 'member') {
    if (e.status === 'withdrawn') return 'You withdrew this submission'
    if (e.note) return 'You replied'
    if (e.status === 'submitted') return 'You sent the clip'
  }
  return statusInfo(e.status).label
}

export default function SubmissionCard({ submission: s, onChanged, delay = 0 }) {
  const info = statusInfo(s.status)
  const live = s.status === 'published' || s.status === 'documentary_linked'
  const tone = live ? 'live' : info.tone
  const cat = getTalentCategory(s.category)
  const [showHistory, setShowHistory] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [player, setPlayer] = useState(null)

  const closed = s.status === 'withdrawn' || s.status === 'rejected'
  // the last thing the scout wrote
  const scoutNote = s.status_note || [...s.events].reverse().find((e) => e.actor === 'team' && e.note)?.note || ''

  async function run(action) {
    setBusy(true)
    setError('')
    try {
      await action()
      await onChanged()
      return true
    } catch (err) {
      console.error(err)
      setError(err?.message?.includes('withdrawn') ? 'This submission was already withdrawn.' : 'Something went wrong. Please try again.')
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
      setError('Could not open the clip. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article
      className="acc-rise rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#CDEBE2] sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* who and status */}
      <header className="flex flex-wrap items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E6F1EE] to-[#CDEBE2] text-[#1B5E4F]">
          <TIcon name="video" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold text-[#0F3D32]">
            {s.person_name}
            {s.what_they_do ? <span className="font-normal text-gray-500"> · {s.what_they_do}</span> : null}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>{subjectLabel(s)}</span>
            {cat && <span>{cat.label}</span>}
            {s.location && (
              <span className="inline-flex items-center gap-1">
                <TIcon name="pin" size={12} />
                {s.location}
              </span>
            )}
            <span>Sent {formatDate(s.created_at)}</span>
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONES[tone]}`}>{info.label}</span>
      </header>

      {/* what is going on */}
      <div className="mt-5">
        {s.status === 'withdrawn' ? (
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">{info.text}</p>
        ) : (
          <>
            <SubmissionTracker status={s.status} />
            <p className="mt-4 text-center text-sm text-gray-500">{info.text}</p>
          </>
        )}
      </div>

      {/* a scout asks for more */}
      {s.status === 'needs_info' && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <TIcon name="alert" size={16} />
            A scout needs more information
          </p>
          {scoutNote && <p className="mt-2 whitespace-pre-line rounded-xl bg-white/70 px-3 py-2 text-sm text-amber-900">{scoutNote}</p>}
          <textarea
            className={inputClass + ' mt-3 min-h-[90px] resize-y'}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write your answer to the scout"
            maxLength={1000}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={busy || reply.trim().length < 3}
              onClick={async () => {
                if (await run(() => replyToSubmission(s.id, reply))) setReply('')
              }}
              className={btnPrimary}
            >
              <TIcon name="send" size={15} />
              {busy ? 'Sending…' : 'Send my answer'}
            </button>
          </div>
        </div>
      )}

      {s.status === 'rejected' && scoutNote && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <span className="font-semibold">Scout's note: </span>
          {scoutNote}
        </p>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      {/* actions */}
      <footer className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
        <button type="button" onClick={watch} disabled={busy} className={btnSoft}>
          <TIcon name="play" size={14} />
          Watch clip
        </button>
        {s.reel_url && (
          <a href={s.reel_url} target="_blank" rel="noopener noreferrer" className={btnSoft}>
            <TIcon name="video" size={14} />
            Showcase reel
          </a>
        )}
        {s.documentary_url && (
          <a href={s.documentary_url} target="_blank" rel="noopener noreferrer" className={btnSoft}>
            <TIcon name="play" size={14} />
            Documentary
          </a>
        )}
        <button type="button" onClick={() => setShowHistory((v) => !v)} className={btnGhost} aria-expanded={showHistory}>
          <TIcon name="history" size={15} />
          History
          <TIcon name="chevron" size={14} className={'transition-transform ' + (showHistory ? 'rotate-180' : '')} />
        </button>

        {!closed && !confirmWithdraw && (
          <button
            type="button"
            onClick={() => setConfirmWithdraw(true)}
            className="ml-auto cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          >
            Withdraw
          </button>
        )}
        {!closed && confirmWithdraw && (
          <span className="acc-pop ml-auto flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            Withdraw this clip?
            <button type="button" disabled={busy} onClick={() => run(() => withdrawSubmission(s.id))} className={btnDanger + ' px-3! py-1.5!'}>
              Yes, withdraw
            </button>
            <button type="button" onClick={() => setConfirmWithdraw(false)} className="cursor-pointer text-xs font-semibold underline">
              Keep it
            </button>
          </span>
        )}
      </footer>

      {/* history */}
      {showHistory && (
        <ol className="acc-pop mt-4 space-y-3 border-l-2 border-[#E6F1EE] pl-4">
          {[...s.events].reverse().map((e) => (
            <li key={e.id} className="relative">
              <span
                className={
                  'absolute -left-[25px] top-0.5 flex size-4 items-center justify-center rounded-full ring-2 ring-white ' +
                  (e.actor === 'member' ? 'bg-[#2F9678] text-white' : 'bg-[#1B5E4F] text-white')
                }
              >
                <TIcon name={e.actor === 'member' ? 'user' : 'shield'} size={9} strokeWidth={3} />
              </span>
              <p className="text-sm font-semibold text-[#0F3D32]">{eventLabel(e)}</p>
              {e.note && <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">{e.note}</p>}
              <p className="mt-0.5 text-xs text-gray-400">{formatDate(e.created_at)}</p>
            </li>
          ))}
        </ol>
      )}

      {player && (
        <Modal title={`${s.person_name}'s clip`} wide onClose={() => setPlayer(null)}>
          <video src={player} controls autoPlay playsInline className="w-full rounded-xl bg-black" />
        </Modal>
      )}
    </article>
  )
}