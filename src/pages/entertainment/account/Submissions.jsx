// src/pages/entertainment/account/Submissions.jsx
// Page "Submissions": the clips sent for scouts to review, each with a progress line.
// For talents (their own clips) and parents or guardians (their children's clips).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { CLOSED_STATUSES, LIVE_STATUSES, OPEN_STATUSES, isMinorTalent } from '../../../constants/talentJourney'
import { listChildren, listSubmissions } from '../../../services/entertainmentTalentService'
import SubmissionCard from './SubmissionCard'
import SubmitClipForm from './SubmitClipForm'
import { Notice, RoleGate, TIcon, TalentStyles, btnPrimary } from './talentUi'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'In progress' },
  { key: 'needs', label: 'Needs me' },
  { key: 'live', label: 'Published' },
  { key: 'closed', label: 'Closed' },
]

const STEPS = [
  { icon: 'send', title: 'Submit', text: 'Send a rough clip from any phone. Free, and scouts never ask for money.' },
  { icon: 'search', title: 'Verify', text: 'A scout checks that the talent and the skill are real.' },
  { icon: 'pin', title: 'Visit and shoot', text: 'A scout visits and films a showcase reel. A guardian is present for a child.' },
  { icon: 'star', title: 'Profile and documentary', text: 'Your public profile goes live, linked to a short documentary.' },
]

export default function Submissions() {
  return (
    <RoleGate roles={['talent', 'guardian']}>
      <SubmissionsPage />
    </RoleGate>
  )
}

function SubmissionsPage() {
  const { entProfile } = useAuth()
  const isGuardian = entProfile.role === 'guardian'
  const minor = isMinorTalent(entProfile)
  const [params, setParams] = useSearchParams()

  const [subs, setSubs] = useState(null)
  const [kids, setKids] = useState([])
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(params.get('new') === '1')

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([listSubmissions(), isGuardian ? listChildren() : Promise.resolve([])])
      setSubs(s)
      setKids(c)
      setLoadError('')
    } catch (err) {
      console.error('Could not load the submissions:', err)
      setLoadError('Could not load your submissions. Please refresh the page.')
      setSubs((old) => old ?? [])
    }
  }, [isGuardian])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    const list = subs ?? []
    return {
      sent: list.filter((s) => s.status !== 'withdrawn').length,
      open: list.filter((s) => OPEN_STATUSES.includes(s.status)).length,
      needs: list.filter((s) => s.status === 'needs_info').length,
      live: list.filter((s) => LIVE_STATUSES.includes(s.status)).length,
      closed: list.filter((s) => CLOSED_STATUSES.includes(s.status)).length,
    }
  }, [subs])

  const shown = (subs ?? []).filter((s) => {
    if (filter === 'open') return OPEN_STATUSES.includes(s.status)
    if (filter === 'needs') return s.status === 'needs_info'
    if (filter === 'live') return LIVE_STATUSES.includes(s.status)
    if (filter === 'closed') return CLOSED_STATUSES.includes(s.status)
    return true
  })

  function closeForm() {
    setFormOpen(false)
    if (params.get('new') || params.get('child')) setParams({}, { replace: true })
  }

  const tiles = [
    { label: 'Clips sent', value: counts.sent, icon: 'video' },
    { label: 'In progress', value: counts.open, icon: 'clock' },
    { label: 'Need your answer', value: counts.needs, icon: 'alert', alert: counts.needs > 0 },
    { label: 'Published', value: counts.live, icon: 'verified' },
  ]

  return (
    <div className="space-y-5">
      <TalentStyles />

      {minor && (
        <Notice tone="amber" icon="lock">
          You are under 18, so a parent or legal guardian sends your clips from their own account (they join as
          "Parent / guardian"). You can follow the progress of your clips here.
        </Notice>
      )}

      {/* summary and the main button */}
      <section className="acc-rise rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#CDEBE2] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#0F3D32]">My submissions</h2>
            <p className="text-sm text-gray-500">
              {isGuardian ? "Follow every clip you sent for your children, step by step." : 'Follow every clip you sent, step by step.'}
            </p>
          </div>
          {!minor && (
            <button type="button" onClick={() => setFormOpen(true)} className={btnPrimary}>
              <TIcon name="plus" size={16} strokeWidth={2.6} />
              Send a clip
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <div
              key={t.label}
              className={
                'flex items-center gap-3 rounded-2xl p-3.5 ring-1 ' +
                (t.alert ? 'bg-amber-50 ring-amber-200' : 'bg-[#F8FBFA] ring-[#E6F1EE]')
              }
            >
              <span
                className={
                  'flex size-10 shrink-0 items-center justify-center rounded-xl ' +
                  (t.alert ? 'bg-amber-100 text-amber-800' : 'bg-gradient-to-br from-[#E6F1EE] to-[#CDEBE2] text-[#1B5E4F]')
                }
              >
                <TIcon name={t.icon} size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-[#0F3D32]">{subs === null ? '–' : t.value}</p>
                <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-gray-400">{t.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {loadError && <Notice tone="red" icon="info">{loadError}</Notice>}

      {/* filters */}
      {subs && subs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter submissions">
          {FILTERS.map((x) => {
            const n = x.key === 'all' ? subs.length : counts[x.key]
            return (
              <button
                key={x.key}
                type="button"
                role="tab"
                aria-selected={filter === x.key}
                onClick={() => setFilter(x.key)}
                className={
                  'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ' +
                  (filter === x.key ? 'bg-[#1B5E4F] text-white shadow-sm' : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:text-[#0F3D32]')
                }
              >
                {x.label}
                <span className={'rounded-full px-1.5 text-xs ' + (filter === x.key ? 'bg-white/20' : 'bg-gray-100')}>{n}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* the list */}
      {subs === null ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-[#CDEBE2]" />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <section className="acc-rise rounded-2xl border border-dashed border-[#9FD8C9] bg-white p-6 text-center sm:p-8">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#E6F1EE] text-[#1B5E4F]">
            <TIcon name="video" size={22} />
          </span>
          <h3 className="mt-3 text-base font-semibold text-[#0F3D32]">No clip sent yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            A short video from any phone is enough. Scouts review every clip, and the ones that stand out get a visit.
          </p>
          {!minor && (
            <button type="button" onClick={() => setFormOpen(true)} className={btnPrimary + ' mt-4'}>
              <TIcon name="plus" size={16} strokeWidth={2.6} />
              Send your first clip
            </button>
          )}
        </section>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 ring-1 ring-[#CDEBE2]">Nothing here.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((s, i) => (
            <SubmissionCard key={s.id} submission={s} onChanged={load} delay={Math.min(i, 5) * 60} />
          ))}
        </div>
      )}

      {/* how it works */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#CDEBE2] sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">From raw clip to featured talent</h3>
        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((st, i) => (
            <li key={st.title} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F]">
                <TIcon name={st.icon} size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#0F3D32]">
                  <span className="mr-1.5 text-gray-300">0{i + 1}</span>
                  {st.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {formOpen && subs !== null && (
        <SubmitClipForm
          kids={kids}
          defaultChildId={params.get('child') ?? ''}
          onClose={closeForm}
          onSent={async () => {
            await load()
            closeForm()
          }}
        />
      )}
    </div>
  )
}