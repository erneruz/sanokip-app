// src/pages/entertainment/account/Children.jsx
// Page "My children": for parents and legal guardians. Each child has a safe public
// card (first name, age group and region only), their own clips and their own consents.
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EntAvatar from '../../../components/entertainment/EntAvatar'
import CategoryIcon from '../../../components/entertainment/CategoryIcon'
import TalentCardPreview from '../../../components/entertainment/TalentCardPreview'
import { useAuth } from '../../../context/AuthContext'
import { RWANDA_LOCATIONS, RWANDA_PROVINCES } from '../../../constants/rwandaLocations'
import { TALENT_CATEGORIES, getTalentCategory } from '../../../constants/talentCategories'
import { CONSENT_KINDS, ageGroupOfYears } from '../../../constants/talentJourney'
import { addChild, deleteChild, listChildren, listConsents, listSubmissions, updateChild } from '../../../services/entertainmentTalentService'
import { Field, inputClass } from './accountUi'
import { Modal, Notice, RoleGate, TIcon, TalentStyles, btnDanger, btnGhost, btnPrimary, btnSoft } from './talentUi'

const BASE = '/entertainment/account'
const AGES = Array.from({ length: 18 }, (_, i) => i)

export default function Children() {
  return (
    <RoleGate roles={['guardian']}>
      <ChildrenPage />
    </RoleGate>
  )
}

function ChildrenPage() {
  const { user } = useAuth()
  const [kids, setKids] = useState(null)
  const [subs, setSubs] = useState([])
  const [consents, setConsents] = useState([])
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | child
  const [removing, setRemoving] = useState(null)
  const [previewing, setPreviewing] = useState(null)

  const load = useCallback(async () => {
    try {
      const [k, s, c] = await Promise.all([listChildren(), listSubmissions(), listConsents()])
      setKids(k)
      setSubs(s)
      setConsents(c)
      setLoadError('')
    } catch (err) {
      console.error('Could not load the children:', err)
      setLoadError('Could not load your children. Please refresh the page.')
      setKids((old) => old ?? [])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-5">
      <TalentStyles />

      <section className="acc-rise rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#CDEBE2] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#0F3D32]">My children</h2>
            <p className="text-sm text-gray-500">You stay in charge: you send the clips, give each consent and receive every contact request.</p>
          </div>
          <button type="button" onClick={() => setEditing('new')} className={btnPrimary}>
            <TIcon name="plus" size={16} strokeWidth={2.6} />
            Add a child
          </button>
        </div>
      </section>

      {loadError && <Notice tone="red" icon="info">{loadError}</Notice>}

      {kids === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-60 animate-pulse rounded-2xl bg-white ring-1 ring-[#CDEBE2]" />
          ))}
        </div>
      ) : kids.length === 0 ? (
        <section className="acc-rise rounded-2xl border border-dashed border-[#9FD8C9] bg-white p-6 text-center sm:p-8">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#E6F1EE] text-[#1B5E4F]">
            <TIcon name="child" size={22} />
          </span>
          <h3 className="mt-3 text-base font-semibold text-[#0F3D32]">Add your first child</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Only a first name, an age and a region are needed. The public card of a child never shows more than that.
          </p>
          <button type="button" onClick={() => setEditing('new')} className={btnPrimary + ' mt-4'}>
            <TIcon name="plus" size={16} strokeWidth={2.6} />
            Add a child
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {kids.map((c, i) => {
            const cat = getTalentCategory(c.category)
            const given = CONSENT_KINDS.filter((k) => consents.some((x) => x.child_id === c.id && x.kind === k.kind && !x.withdrawn_at)).length
            const sent = subs.filter((s) => s.child_id === c.id && s.status !== 'withdrawn').length
            const live = subs.filter((s) => s.child_id === c.id && (s.status === 'published' || s.status === 'documentary_linked')).length
            return (
              <article
                key={c.id}
                className="acc-rise overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#CDEBE2]"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="relative h-16 bg-gradient-to-br from-[#0A2E27] via-[#0F3D32] to-[#1B5E4F]">
                  <span className="acc-dots absolute inset-0 opacity-70" />
                </div>
                <div className="px-5 pb-5">
                  <div className="-mt-8 flex items-end gap-3">
                    <EntAvatar name={c.first_name} size="size-16" textClass="text-xl" className="ring-4! ring-white! shadow-md" />
                    <div className="min-w-0 pb-1">
                      <h3 className="truncate text-lg font-bold text-[#0F3D32]">{c.first_name}</h3>
                      <p className="text-xs text-gray-500">{c.age_years} years old</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-2.5 py-1 text-xs font-semibold text-[#0F3D32]">
                      <TIcon name="calendar" size={13} />
                      {ageGroupOfYears(c.age_years)}
                    </span>
                    {cat && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-2.5 py-1 text-xs font-semibold text-[#0F3D32]">
                        <CategoryIcon slug={c.category} size={13} />
                        {cat.label}
                      </span>
                    )}
                    {c.specialty && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-2.5 py-1 text-xs font-semibold text-[#0F3D32]">
                        <TIcon name="star" size={13} />
                        {c.specialty}
                      </span>
                    )}
                    {c.province && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F1EE] px-2.5 py-1 text-xs font-semibold text-[#0F3D32]">
                        <TIcon name="pin" size={13} />
                        {c.province}
                      </span>
                    )}
                  </div>

                  {/* progress of this child */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { v: sent, l: 'Clips sent' },
                      { v: live, l: 'Published' },
                      { v: `${given}/${CONSENT_KINDS.length}`, l: 'Consents' },
                    ].map((x) => (
                      <div key={x.l} className="rounded-xl bg-[#F8FBFA] px-2 py-2.5 ring-1 ring-[#E6F1EE]">
                        <p className="text-lg font-bold leading-none text-[#0F3D32]">{kids === null ? '–' : x.v}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{x.l}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`${BASE}/submissions?new=1&child=${c.id}`} className={btnPrimary + ' flex-1 px-3!'}>
                      <TIcon name="send" size={14} />
                      Send a clip
                    </Link>
                    <Link to={`${BASE}/consents?child=${c.id}`} className={btnSoft + ' flex-1 px-3!'}>
                      <TIcon name="verified" size={15} />
                      Consents
                    </Link>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <button type="button" onClick={() => setPreviewing(c)} className="cursor-pointer rounded-lg px-2.5 py-1.5 font-medium text-[#1B5E4F] transition hover:bg-[#E6F1EE]">
                      Public card
                    </button>
                    <button type="button" onClick={() => setEditing(c)} className="cursor-pointer rounded-lg px-2.5 py-1.5 font-medium text-[#1B5E4F] transition hover:bg-[#E6F1EE]">
                      Edit
                    </button>
                    <button type="button" onClick={() => setRemoving(c)} className="ml-auto cursor-pointer rounded-lg px-2.5 py-1.5 font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600">
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {editing && (
        <ChildForm
          child={editing === 'new' ? null : editing}
          userId={user.id}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            await load()
            setEditing(null)
          }}
        />
      )}

      {removing && (
        <RemoveChild
          child={removing}
          onClose={() => setRemoving(null)}
          onDone={async () => {
            await load()
            setRemoving(null)
          }}
        />
      )}

      {previewing && (
        <Modal title="Public card" text={`The most that anyone can see about ${previewing.first_name}.`} onClose={() => setPreviewing(null)}>
          <div className="py-2">
            <TalentCardPreview
              name={previewing.first_name}
              category={previewing.category}
              specialty={previewing.specialty}
              region={[previewing.province, 'Rwanda'].filter(Boolean).join(', ')}
              ageGroup={ageGroupOfYears(previewing.age_years)}
              minor
            />
          </div>
        </Modal>
      )}
    </div>
  )
}

function ChildForm({ child, userId, onClose, onSaved }) {
  const [f, setF] = useState({
    first_name: child?.first_name ?? '',
    age_years: child?.age_years ?? '',
    province: child?.province ?? '',
    district: child?.district ?? '',
    category: child?.category ?? '',
    specialty: child?.specialty ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (patch) => setF((x) => ({ ...x, ...patch }))

  async function save() {
    if (!f.first_name.trim()) return setError("Please write the child's first name.")
    if (f.age_years === '' || Number(f.age_years) < 0 || Number(f.age_years) > 17) return setError('Please choose an age under 18.')
    setBusy(true)
    setError('')
    try {
      if (child) await updateChild(child.id, f)
      else await addChild(userId, f)
      await onSaved()
    } catch (err) {
      console.error(err)
      setError('Could not save. Please try again.')
      setBusy(false)
    }
  }

  return (
    <Modal
      title={child ? `Edit ${child.first_name}` : 'Add a child'}
      text="Only the first name, the age group and the region are ever shown publicly."
      busy={busy}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy} className={btnPrimary}>
            <TIcon name="check" size={16} strokeWidth={2.6} />
            {busy ? 'Saving…' : child ? 'Save changes' : 'Add child'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="ch-name">
          <input id="ch-name" className={inputClass} value={f.first_name} maxLength={60} onChange={(e) => set({ first_name: e.target.value })} placeholder="Example: Eric" />
        </Field>
        <Field label="Age" htmlFor="ch-age">
          <select id="ch-age" className={inputClass} value={f.age_years} onChange={(e) => set({ age_years: e.target.value })}>
            <option value="">Choose the age</option>
            {AGES.map((a) => (
              <option key={a} value={a}>
                {a} {a === 1 ? 'year' : 'years'}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Province" optional htmlFor="ch-prov">
          <select id="ch-prov" className={inputClass} value={f.province} onChange={(e) => set({ province: e.target.value, district: '' })}>
            <option value="">Choose</option>
            {RWANDA_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="District" optional htmlFor="ch-dist" hint="Private. Never shown publicly.">
          <select id="ch-dist" className={inputClass} value={f.district} disabled={!f.province} onChange={(e) => set({ district: e.target.value })}>
            <option value="">{f.province ? 'Choose' : 'Choose a province first'}</option>
            {(RWANDA_LOCATIONS[f.province] ?? []).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Talent category" optional htmlFor="ch-cat">
          <select id="ch-cat" className={inputClass} value={f.category} onChange={(e) => set({ category: e.target.value })}>
            <option value="">Choose</option>
            {TALENT_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="What they do" optional htmlFor="ch-spec" hint="Singer, dancer, striker…">
          <input id="ch-spec" className={inputClass} value={f.specialty} maxLength={80} onChange={(e) => set({ specialty: e.target.value })} placeholder="Example: Striker" />
        </Field>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    </Modal>
  )
}

function RemoveChild({ child, onClose, onDone }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    setBusy(true)
    try {
      await deleteChild(child.id)
      await onDone()
    } catch (err) {
      console.error(err)
      setError('Could not remove. Please try again.')
      setBusy(false)
    }
  }

  return (
    <Modal
      title={`Remove ${child.first_name}?`}
      busy={busy}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={btnGhost}>
            Keep
          </button>
          <button type="button" onClick={remove} disabled={busy} className={btnDanger}>
            {busy ? 'Removing…' : 'Remove child'}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-gray-600">
        The details and the consents saved for {child.first_name} are deleted. Clips already sent stay with the scouting
        team. To take a published profile down, use "Take it down" on the Consents page first.
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    </Modal>
  )
}