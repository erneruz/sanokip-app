// src/pages/admin/EntertainmentTalentCards.jsx
// The talents of Peak Star Entertainment and their public card: who is verified, who is
// public, what they chose to show. The team can verify or publish a card by hand
// (a card also follows the status of a clip by itself) and take it back.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTalentCategory } from '../../constants/talentCategories'
import { PUBLIC_TOGGLES, isMinorTalent, publicSetting, statusInfo } from '../../constants/talentJourney'
import { ENT_TALENT_PATHS } from '../../constants/talentAdmin'
import { listAdminTalents, setTalentPublished, setTalentVerified } from '../../services/entertainmentTalentAdminService'
import { IconCheck, IconEye, IconShield } from '../../components/admin/EntAdminIcons'
import { Avatar, StatusPill } from '../../components/admin/entAdminUi'
import { ErrorBar, PageHeader, SearchBox, Tile, adminBtn, formatDate } from '../../components/admin/talentAdminUi'

const FILTERS = [
  { key: '', label: 'All talents' },
  { key: 'unverified', label: 'Not verified' },
  { key: 'verified', label: 'Verified' },
  { key: 'public', label: 'Public' },
]

export default function EntertainmentTalentCards() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState('') // the card whose details are open
  const [confirm, setConfirm] = useState(null) // { id, action }
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setError('')
      setRows(await listAdminTalents())
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not load the talents.')
      setRows((old) => old ?? [])
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  const list = rows ?? []
  const counts = {
    '': list.length,
    unverified: list.filter((t) => !t.verified_at).length,
    verified: list.filter((t) => t.verified_at).length,
    public: list.filter((t) => t.published_at).length,
  }

  const q = search.trim().toLowerCase()
  const visible = useMemo(
    () =>
      list.filter((t) => {
        if (filter === 'unverified' && t.verified_at) return false
        if (filter === 'verified' && !t.verified_at) return false
        if (filter === 'public' && !t.published_at) return false
        if (!q) return true
        return [t.full_name, t.email, t.phone, t.province, t.district, t.headline]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      }),
    [list, filter, q],
  )

  async function apply() {
    if (!confirm) return
    setBusy(true)
    setError('')
    try {
      if (confirm.action === 'verify') await setTalentVerified(confirm.id, true)
      if (confirm.action === 'unverify') await setTalentVerified(confirm.id, false)
      if (confirm.action === 'publish') await setTalentPublished(confirm.id, true)
      if (confirm.action === 'unpublish') await setTalentPublished(confirm.id, false)
      setConfirm(null)
      await load()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'That did not work. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const CONFIRM_TEXT = {
    verify: 'Mark this talent as "Verified by Scout"? The green badge appears on their profile.',
    unverify: 'Remove the "Verified by Scout" badge from this talent?',
    publish: 'Make this talent card public? Check first that the talent has given the consent for a public profile.',
    unpublish: 'Take this talent card offline? The talent stays verified.',
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Talent cards"
        text="The talents and the state of their public card. A card becomes verified and public by itself as a clip moves forward. You can also change it here."
      />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {FILTERS.map((f) => (
          <Tile key={f.key || 'all'} label={f.label} value={rows === null ? '–' : counts[f.key]} active={filter === f.key} onClick={() => setFilter(f.key)} />
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <SearchBox value={search} onChange={setSearch} placeholder="Search name, email, phone, place…" />
      </div>

      <ErrorBar>{error}</ErrorBar>

      <div className="mt-5 space-y-3">
        {rows === null ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading the talents…</p>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
            {list.length === 0 ? 'No talent has joined yet.' : 'No talent matches these filters.'}
          </p>
        ) : (
          visible.map((t) => {
            const cat = getTalentCategory(t.details?.category)
            const minor = isMinorTalent({ role: 'talent', details: t.details })
            const expanded = open === t.user_id
            const asking = confirm?.id === t.user_id ? confirm.action : null
            return (
              <article key={t.user_id} className="rounded-2xl border border-gray-200 bg-white">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <Avatar name={t.full_name || t.email} size="h-11 w-11" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{t.full_name || '—'}</p>
                    <p className="truncate text-xs text-gray-400">
                      {[cat?.label, t.details?.specialty, [t.district, t.province].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || t.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {minor && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">Under 18</span>}
                    <span className={'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ' + (t.verified_at ? 'bg-[#1B5E4F] text-white' : 'bg-gray-100 text-gray-500')}>
                      <IconShield className="h-3 w-3" />
                      {t.verified_at ? 'Verified' : 'Not verified'}
                    </span>
                    <span className={'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ' + (t.published_at ? 'bg-[#E6F1EE] text-[#1B5E4F]' : 'bg-gray-100 text-gray-500')}>
                      <IconEye className="h-3 w-3" />
                      {t.published_at ? 'Public' : 'Not public'}
                    </span>
                    <StatusPill status={t.status} />
                  </div>
                  <button
                    onClick={() => setOpen(expanded ? '' : t.user_id)}
                    className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B5E4F] ring-1 ring-[#9FD8C9] transition hover:bg-[#EAF5F1]"
                  >
                    {expanded ? 'Close' : 'Details'}
                  </button>
                </div>

                {expanded && (
                  <div className="space-y-4 border-t border-gray-100 p-4">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Phone</dt>
                        <dd className="mt-0.5 text-sm">{t.phone ? <a href={`tel:${t.phone}`} className="text-[#1B5E4F] hover:underline">{t.phone}</a> : '—'}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Email</dt>
                        <dd className="mt-0.5 break-all text-sm"><a href={`mailto:${t.email}`} className="text-[#1B5E4F] hover:underline">{t.email}</a></dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Joined</dt>
                        <dd className="mt-0.5 text-sm text-gray-800">{formatDate(t.created_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Headline</dt>
                        <dd className="mt-0.5 text-sm text-gray-800">{t.headline || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Availability</dt>
                        <dd className="mt-0.5 text-sm text-gray-800">{t.availability === 'busy' ? 'Not available' : 'Available'}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Height · weight (private)</dt>
                        <dd className="mt-0.5 text-sm text-gray-800">
                          {t.private_stats?.height_cm ? `${t.private_stats.height_cm} cm` : '—'} · {t.private_stats?.weight_kg ? `${t.private_stats.weight_kg} kg` : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Clips sent</dt>
                        <dd className="mt-0.5 text-sm text-gray-800">
                          {t.clips_sent} {t.latest_status ? `· latest: ${statusInfo(t.latest_status).label}` : ''}
                        </dd>
                      </div>
                    </dl>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">What the talent chose to show</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {PUBLIC_TOGGLES.map((p) => {
                          const on = !minor && publicSetting(t.public_settings, p.key)
                          return (
                            <li key={p.key} className={'rounded-full px-2.5 py-0.5 text-xs font-medium ' + (on ? 'bg-[#E6F1EE] text-[#1B5E4F]' : 'bg-gray-100 text-gray-400 line-through')}>
                              {p.label.replace(/^My /, '')}
                            </li>
                          )
                        })}
                      </ul>
                      {minor && <p className="mt-2 text-xs text-amber-700">Under 18: only the first name, age group and region are ever shown.</p>}
                    </div>

                    {/* actions */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                      {!t.verified_at ? (
                        <button onClick={() => setConfirm({ id: t.user_id, action: 'verify' })} disabled={busy} className={adminBtn.primary}>
                          <IconCheck className="h-4 w-4" /> Verify
                        </button>
                      ) : (
                        <button onClick={() => setConfirm({ id: t.user_id, action: 'unverify' })} disabled={busy} className={adminBtn.ghost}>
                          Remove verification
                        </button>
                      )}
                      {!t.published_at ? (
                        <button
                          onClick={() => setConfirm({ id: t.user_id, action: 'publish' })}
                          disabled={busy || !t.verified_at}
                          title={!t.verified_at ? 'Verify the talent first' : undefined}
                          className={adminBtn.soft}
                        >
                          Make public
                        </button>
                      ) : (
                        <button onClick={() => setConfirm({ id: t.user_id, action: 'unpublish' })} disabled={busy} className={adminBtn.ghost}>
                          Take offline
                        </button>
                      )}
                      <Link to={ENT_TALENT_PATHS.submissions + `?q=${encodeURIComponent(t.full_name ?? '')}`} className="ml-auto text-xs font-semibold text-[#1B5E4F] hover:underline">
                        See their clips →
                      </Link>
                    </div>

                    {asking && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                        {CONFIRM_TEXT[asking]}
                        <div className="mt-3 flex gap-2">
                          <button onClick={apply} disabled={busy} className="cursor-pointer rounded-lg bg-[#0F3D32] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#154A3F] disabled:opacity-50">
                            {busy ? 'Please wait…' : 'Yes, do it'}
                          </button>
                          <button onClick={() => setConfirm(null)} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-300 transition hover:bg-white">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </main>
  )
}