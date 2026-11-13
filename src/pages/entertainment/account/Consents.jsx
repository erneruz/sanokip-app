// src/pages/entertainment/account/Consents.jsx
// Page "Consents": each consent is given and withdrawn separately, with the date kept.
//   review of the clip, scout visit, public profile, showcase reel, YouTube documentary.
// A parent or guardian manages the consents of each child. A talent manages their own.
// At the bottom: ask for the profile and videos to be taken down.
import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import EntAvatar from '../../../components/entertainment/EntAvatar'
import { CONSENT_KINDS, CONSENT_WORDING_VERSION, consentText, isMinorTalent } from '../../../constants/talentJourney'
import {
  giveConsent,
  listChildren,
  listConsents,
  listTakedowns,
  requestTakedown,
  withdrawConsent,
} from '../../../services/entertainmentTalentService'
import { Field, inputClass } from './accountUi'
import { Modal, Notice, RoleGate, Switch, TIcon, TalentStyles, btnDanger, btnGhost, btnPrimary, formatDate } from './talentUi'

export default function Consents() {
  return (
    <RoleGate roles={['talent', 'guardian']}>
      <ConsentsPage />
    </RoleGate>
  )
}

function ConsentsPage() {
  const { user, entProfile } = useAuth()
  const isGuardian = entProfile.role === 'guardian'
  const minor = isMinorTalent(entProfile)
  const [params] = useSearchParams()
  const focusChild = params.get('child')

  const [kids, setKids] = useState([])
  const [consents, setConsents] = useState(null)
  const [takedowns, setTakedowns] = useState([])
  const [loadError, setLoadError] = useState('')
  const [ask, setAsk] = useState(null) // { subject, kind, action: 'give' | 'withdraw' }
  const [takedownOpen, setTakedownOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [c, k, t] = await Promise.all([listConsents(), isGuardian ? listChildren() : Promise.resolve([]), listTakedowns()])
      setConsents(c)
      setKids(k)
      setTakedowns(t)
      setLoadError('')
    } catch (err) {
      console.error('Could not load the consents:', err)
      setLoadError('Could not load your consents. Please refresh the page.')
      setConsents((old) => old ?? [])
    }
  }, [isGuardian])

  useEffect(() => {
    load()
  }, [load])

  // the people these consents are about
  const subjects = isGuardian
    ? kids.map((c) => ({ id: c.id, name: c.first_name, child: true }))
    : [{ id: null, name: entProfile.full_name || 'Me', child: false }]

  // bring the child asked for into view
  useEffect(() => {
    if (consents && focusChild) document.getElementById(`subject-${focusChild}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [consents, focusChild])

  const forSubject = (id) => (consents ?? []).filter((c) => (c.child_id ?? null) === (id ?? null))
  const active = (id, kind) => forSubject(id).find((c) => c.kind === kind && !c.withdrawn_at)
  const lastWithdrawn = (id, kind) => forSubject(id).find((c) => c.kind === kind && c.withdrawn_at)

  async function confirm() {
    if (!ask) return
    setBusy(true)
    setError('')
    try {
      if (ask.action === 'give') {
        await giveConsent(user.id, ask.subject.id, ask.kind, entProfile.full_name, CONSENT_WORDING_VERSION)
      } else {
        await withdrawConsent(active(ask.subject.id, ask.kind).id)
      }
      await load()
      setAsk(null)
    } catch (err) {
      console.error(err)
      setError('Could not save. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const openTakedowns = takedowns.filter((t) => t.status === 'open')

  return (
    <div className="space-y-5">
      <TalentStyles />

      <section className="acc-rise rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#CDEBE2] sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E6F1EE] to-[#CDEBE2] text-[#1B5E4F]">
            <TIcon name="verified" size={20} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[#0F3D32]">Consents and privacy</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Nothing is shown or published without your yes. Each step has its own consent, saved with the date, and you can
              withdraw it at any time.
            </p>
          </div>
        </div>
      </section>

      {minor && (
        <Notice tone="amber" icon="lock">
          You are under 18, so your parent or legal guardian gives and withdraws these consents from their own account.
          Nothing can be published about you without them.
        </Notice>
      )}
      {loadError && <Notice tone="red" icon="info">{loadError}</Notice>}

      {consents === null ? (
        <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-[#CDEBE2]" />
      ) : isGuardian && subjects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#9FD8C9] bg-white p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#E6F1EE] text-[#1B5E4F]">
            <TIcon name="child" size={22} />
          </span>
          <h3 className="mt-3 text-base font-semibold text-[#0F3D32]">Add your child first</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">Consents are given for each child separately.</p>
          <Link to="/entertainment/account/children" className={btnPrimary + ' mt-4'}>
            <TIcon name="plus" size={16} strokeWidth={2.6} />
            Add a child
          </Link>
        </section>
      ) : (
        subjects.map((sub, si) => {
          const given = CONSENT_KINDS.filter((k) => active(sub.id, k.kind)).length
          return (
            <section
              id={`subject-${sub.id}`}
              key={sub.id ?? 'me'}
              className={
                'acc-rise overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ' +
                (focusChild && focusChild === sub.id ? 'ring-2 ring-[#2F9678]' : 'ring-[#CDEBE2]')
              }
              style={{ animationDelay: `${si * 70}ms` }}
            >
              <header className="flex items-center gap-4 border-b border-gray-100 p-5 sm:px-6">
                <EntAvatar name={sub.name} src={sub.id ? '' : entProfile.avatar_url} size="size-12" textClass="text-base" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-[#0F3D32]">{sub.child ? sub.name : 'My consents'}</h3>
                  <p className="text-xs text-gray-500">
                    {given} of {CONSENT_KINDS.length} consents given
                  </p>
                </div>
                <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-[#E6F1EE] sm:block">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1B5E4F] to-[#9FD8C9] transition-all duration-700"
                    style={{ width: `${(given / CONSENT_KINDS.length) * 100}%` }}
                  />
                </div>
              </header>

              <ul className="divide-y divide-gray-100">
                {CONSENT_KINDS.map((k) => {
                  const on = active(sub.id, k.kind)
                  const off = lastWithdrawn(sub.id, k.kind)
                  return (
                    <li key={k.kind} className="flex items-start gap-4 px-5 py-4 sm:px-6">
                      <span
                        className={
                          'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ' +
                          (on ? 'bg-[#1B5E4F] text-white' : 'bg-[#E6F1EE] text-[#1B5E4F]')
                        }
                      >
                        <TIcon name={k.icon} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#0F3D32]">{k.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{sub.child ? k.child : k.me}</p>
                        <p className={'mt-1.5 text-xs font-medium ' + (on ? 'text-[#1B5E4F]' : 'text-gray-400')}>
                          {on
                            ? `Given on ${formatDate(on.given_at)}`
                            : off
                              ? `Withdrawn on ${formatDate(off.withdrawn_at)}`
                              : 'Not given'}
                        </p>
                      </div>
                      <Switch
                        label={k.title}
                        checked={!!on}
                        disabled={minor}
                        onChange={() => {
                          setError('')
                          setAsk({ subject: sub, kind: k.kind, action: on ? 'withdraw' : 'give' })
                        }}
                      />
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })
      )}

      {/* take-down */}
      {consents !== null && !(isGuardian && subjects.length === 0) && (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-red-100 sm:p-6">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <TIcon name="trash" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-[#0F3D32]">Take it down</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Change your mind? Ask us to remove the public profile and the videos. Your consents are withdrawn at once,
                and our team removes what was published.
              </p>
            </div>
            {!minor && (
              <button type="button" onClick={() => setTakedownOpen(true)} className={btnGhost + ' text-red-600 ring-red-200 hover:bg-red-50'}>
                Ask for a take-down
              </button>
            )}
          </div>

          {takedowns.length > 0 && (
            <ul className="mt-4 space-y-2">
              {takedowns.map((t) => {
                const who = t.child_id ? kids.find((c) => c.id === t.child_id)?.first_name ?? 'Child' : 'My profile'
                return (
                  <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-[#F8FBFA] px-4 py-3 text-sm ring-1 ring-[#E6F1EE]">
                    <TIcon name={t.status === 'done' ? 'check' : 'clock'} size={15} className="text-[#2F9678]" />
                    <span className="font-medium text-[#0F3D32]">{who}</span>
                    <span className="text-gray-500">asked on {formatDate(t.created_at)}</span>
                    <span
                      className={
                        'ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ' +
                        (t.status === 'done' ? 'bg-[#E6F1EE] text-[#0F3D32]' : 'bg-amber-100 text-amber-900')
                      }
                    >
                      {t.status === 'done' ? 'Done' : 'Our team is on it'}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {openTakedowns.length === 0 && takedowns.length === 0 && (
            <p className="mt-3 text-xs text-gray-400">No take-down requested.</p>
          )}
        </section>
      )}

      {/* confirm a consent change */}
      {ask && (
        <Modal
          title={ask.action === 'give' ? `Give consent: ${CONSENT_KINDS.find((k) => k.kind === ask.kind).title}` : 'Withdraw this consent?'}
          text={ask.subject.child ? `For ${ask.subject.name}` : undefined}
          busy={busy}
          onClose={() => setAsk(null)}
          footer={
            <>
              <button type="button" onClick={() => setAsk(null)} disabled={busy} className={btnGhost}>
                Cancel
              </button>
              {ask.action === 'give' ? (
                <button type="button" onClick={confirm} disabled={busy} className={btnPrimary}>
                  <TIcon name="check" size={16} strokeWidth={2.6} />
                  {busy ? 'Saving…' : 'I give my consent'}
                </button>
              ) : (
                <button type="button" onClick={confirm} disabled={busy} className={btnDanger}>
                  {busy ? 'Saving…' : 'Withdraw consent'}
                </button>
              )}
            </>
          }
        >
          <p className="rounded-xl bg-[#F8FBFA] px-4 py-3 text-sm leading-relaxed text-gray-700 ring-1 ring-[#E6F1EE]">
            {consentText(ask.kind, ask.subject.child)}
          </p>
          {ask.action === 'withdraw' &&
            ['profile', 'reel', 'documentary'].includes(ask.kind) &&
            (ask.subject.child || entProfile.published_at) && (
              <Notice tone="amber" icon="info" className="mt-3">
                Withdrawing this consent does not remove anything that is already public. To take {ask.subject.child ? `${ask.subject.name}'s` : 'your'} profile
                and videos down, close this window and use "Ask for a take-down" at the bottom of the page.
              </Notice>
            )}
          <p className="mt-3 text-xs text-gray-400">
            {ask.action === 'give'
              ? `Saved with today's date and your name. Wording version ${CONSENT_WORDING_VERSION}.`
              : 'You can give it again later. What the team can do next with this talent changes at once.'}
          </p>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </Modal>
      )}

      {takedownOpen && (
        <TakedownModal
          subjects={subjects}
          userId={user.id}
          onClose={() => setTakedownOpen(false)}
          onDone={async () => {
            await load()
            setTakedownOpen(false)
          }}
        />
      )}
    </div>
  )
}

function TakedownModal({ subjects, userId, onClose, onDone }) {
  const [who, setWho] = useState(subjects.length === 1 ? (subjects[0].id ?? '') : '')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const needChoice = subjects.length > 1 || subjects[0]?.id

  async function submit() {
    if (needChoice && !who) {
      setError('Please choose who the take-down is for.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await requestTakedown(userId, who || null, reason)
      await onDone()
    } catch (err) {
      console.error(err)
      setError('Could not send the request. Please try again.')
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Ask for a take-down"
      text="We remove the public profile and the videos. All consents for this person are withdrawn now."
      busy={busy}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={busy} className={btnDanger}>
            {busy ? 'Sending…' : 'Send the request'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {needChoice && (
          <Field label="Who is it for?" htmlFor="td-who">
            <select id="td-who" className={inputClass} value={who} onChange={(e) => setWho(e.target.value)}>
              <option value="">Choose</option>
              {subjects.map((s) => (
                <option key={s.id ?? 'me'} value={s.id ?? ''}>
                  {s.child ? s.name : 'My profile'}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Reason" optional htmlFor="td-reason">
          <textarea id="td-reason" className={inputClass + ' min-h-[90px] resize-y'} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="You do not have to give a reason." />
        </Field>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  )
}