// src/pages/entertainment/account/TalentCard.jsx
// Page "Talent card": see your public card as scouts will see it, choose what is
// public, say if you are available, and follow the path to being verified and published.
// Only for talents. A talent under 18 always gets the strict version of the card.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import TalentCardPreview from '../../../components/entertainment/TalentCardPreview'
import SocialIcon from '../../../components/entertainment/SocialIcon'
import { socialList } from '../../../constants/socialLinks'
import { PUBLIC_TOGGLES, isMinorTalent, publicSetting } from '../../../constants/talentJourney'
import { saveTalentCard } from '../../../services/entertainmentTalentService'
import { Card, Field, inputClass } from './accountUi'
import { Notice, RoleGate, Switch, TIcon, TalentStyles, btnGhost, btnPrimary, formatDate } from './talentUi'

const BASE = '/entertainment/account'

export default function TalentCard() {
  return (
    <RoleGate roles={['talent']}>
      <TalentCardPage />
    </RoleGate>
  )
}

function initialForm(p) {
  const settings = {}
  PUBLIC_TOGGLES.forEach((t) => {
    settings[t.key] = publicSetting(p.public_settings, t.key)
  })
  return {
    headline: p.headline ?? '',
    availability: p.availability === 'busy' ? 'busy' : 'available',
    height_cm: p.private_stats?.height_cm ?? '',
    weight_kg: p.private_stats?.weight_kg ?? '',
    settings,
  }
}

function TalentCardPage() {
  const { user, entProfile, refreshAccount } = useAuth()
  const d = entProfile.details ?? {}
  const minor = isMinorTalent(entProfile)

  const start = useMemo(() => initialForm(entProfile), [entProfile])
  const [form, setForm] = useState(start)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const dirty = JSON.stringify(form) !== JSON.stringify(start)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const setToggle = (key, value) => setForm((f) => ({ ...f, settings: { ...f.settings, [key]: value } }))

  // what the public sees: a child always gets the strict version
  const s = form.settings
  const firstName = (entProfile.full_name ?? '').trim().split(/\s+/)[0]
  const region = [!minor && s.show_district ? entProfile.district : '', entProfile.province, entProfile.country]
    .filter(Boolean)
    .join(', ')
  const socials = !minor && s.show_socials ? socialList(entProfile.socials) : []

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const row = await saveTalentCard(user.id, {
        headline: form.headline,
        availability: form.availability,
        privateStats: { height_cm: form.height_cm, weight_kg: form.weight_kg },
        publicSettings: form.settings,
      })
      await refreshAccount()
      setForm(initialForm(row)) // the saved values (numbers as saved), so "unsaved changes" goes away
      setMessage({ type: 'ok', text: 'Your talent card is saved.' })
    } catch (err) {
      console.error('Could not save the talent card:', err)
      setMessage({ type: 'error', text: 'Could not save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // the path to a public card
  const profileDone = !!(d.category && entProfile.bio && entProfile.avatar_url)
  const steps = [
    {
      key: 'profile',
      done: profileDone,
      title: 'Complete your profile',
      text: profileDone ? 'Category, photo and introduction are in place.' : 'Add your category, a photo and an introduction.',
      action: profileDone ? null : { to: `${BASE}/edit`, label: 'Edit profile' },
    },
    {
      key: 'verified',
      done: !!entProfile.verified_at,
      title: 'Get verified by a scout',
      text: entProfile.verified_at
        ? `Verified on ${formatDate(entProfile.verified_at)}.`
        : 'Send a clip. A scout checks that the talent and the skill are real.',
      action: entProfile.verified_at ? null : { to: `${BASE}/submissions`, label: 'Send a clip' },
    },
    {
      key: 'published',
      done: !!entProfile.published_at,
      title: 'Go public',
      text: entProfile.published_at
        ? `Your card has been public since ${formatDate(entProfile.published_at)}.`
        : 'After verification, a scout visits, films your reel and publishes your card.',
      action: null,
    },
  ]
  const doneCount = steps.filter((x) => x.done).length
  const firstOpen = steps.findIndex((x) => !x.done)
  const published = !!entProfile.published_at

  return (
    <div className="space-y-5">
      <TalentStyles />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* left: the card, as others will see it */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <TIcon name="eye" size={14} />
              How scouts will see you
            </p>
            <div className="acc-rise">
              <TalentCardPreview
                name={minor ? firstName : entProfile.full_name}
                headline={form.headline}
                category={d.category}
                specialty={d.specialty}
                region={region}
                ageGroup={d.ageGroup}
                level={d.level}
                available={form.availability === 'available'}
                verified={!!entProfile.verified_at}
                photo={!minor && s.show_photo ? entProfile.avatar_url : ''}
                cover={!minor && s.show_cover ? entProfile.cover_url : ''}
                about={minor ? '' : entProfile.bio}
                achievements={s.show_achievements ? d.achievements : ''}
                club={s.show_achievements ? d.club : ''}
                socials={socials}
                minor={minor}
                published={published}
              />
            </div>

            {/* sharing unlocks when the card is public */}
            <div className="mx-auto mt-4 flex max-w-sm items-center gap-2">
              <button type="button" disabled className={btnGhost + ' flex-1'} title="Available after your card is published">
                <TIcon name="copy" size={15} />
                Copy link
              </button>
              <button type="button" disabled className={btnGhost + ' flex-1'} title="Available after your card is published">
                <SocialIcon name="whatsapp" size={16} />
                WhatsApp
              </button>
            </div>
            <p className="mx-auto mt-2 max-w-sm text-center text-xs text-gray-400">
              Sharing unlocks when a scout publishes your card.
            </p>
          </div>
        </div>

        {/* right: settings */}
        <div className="space-y-5 lg:col-span-3">
          {/* the path */}
          <Card icon="trophy" title="Your path to a public card" text={`${doneCount} of ${steps.length} steps done`} delay={60}>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#E6F1EE]">
              <div
                className="trk-fill h-full rounded-full bg-gradient-to-r from-[#1B5E4F] to-[#9FD8C9]"
                style={{ width: `${(doneCount / steps.length) * 100}%` }}
              />
            </div>
            <ol className="space-y-4">
              {steps.map((st, i) => (
                <li key={st.key} className="flex items-start gap-3">
                  <span
                    className={
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ' +
                      (st.done
                        ? 'bg-[#1B5E4F] text-white'
                        : i === firstOpen
                          ? 'trk-now bg-white text-[#1B5E4F] ring-2 ring-[#2F9678]'
                          : 'bg-gray-100 text-gray-400')
                    }
                  >
                    {st.done ? <TIcon name="check" size={15} strokeWidth={3} /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={'text-sm font-semibold ' + (st.done ? 'text-[#0F3D32]' : 'text-gray-700')}>{st.title}</p>
                    <p className="text-xs text-gray-500">{st.text}</p>
                  </div>
                  {st.action && (
                    <Link to={st.action.to} className="shrink-0 rounded-lg bg-[#E6F1EE] px-3 py-1.5 text-xs font-semibold text-[#0F3D32] transition hover:bg-[#CDEBE2] active:scale-95">
                      {st.action.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </Card>

          <Card icon="sparkle" title="Headline and availability" text="The first thing a scout reads about you." delay={100}>
            <div className="space-y-4">
              <Field label="Headline" optional htmlFor="tc-headline" hint={`${form.headline.length} / 90. One line that sums you up.`}>
                <input
                  id="tc-headline"
                  className={inputClass}
                  value={form.headline}
                  maxLength={90}
                  onChange={(e) => set({ headline: e.target.value })}
                  placeholder="Example: Outside hitter with a powerful serve"
                />
              </Field>

              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-700">Are you available for scouting?</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'available', label: 'Available', text: 'Scouts may plan a visit.', dot: 'bg-emerald-500' },
                    { value: 'busy', label: 'Not right now', text: 'Hidden from visit plans.', dot: 'bg-gray-400' },
                  ].map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => set({ availability: o.value })}
                      aria-pressed={form.availability === o.value}
                      className={
                        'cursor-pointer rounded-2xl p-3 text-left ring-1 transition active:scale-[0.98] ' +
                        (form.availability === o.value
                          ? 'bg-[#E6F1EE] ring-2 ring-[#1B5E4F]'
                          : 'bg-white ring-gray-200 hover:bg-gray-50')
                      }
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-[#0F3D32]">
                        <span className={'size-2.5 rounded-full ' + o.dot} />
                        {o.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500">{o.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card
            icon="eye"
            title="What the public sees"
            text={minor ? 'Because you are under 18, the safe version is always used.' : 'Choose what appears on your public card.'}
            delay={140}
          >
            {minor && (
              <Notice tone="amber" icon="lock" className="mb-4">
                Only your first name, age group and region are shown. Your photo, social links, club and achievements stay
                private, and every contact request goes to your parent or guardian.
              </Notice>
            )}
            <ul className="divide-y divide-gray-100">
              {PUBLIC_TOGGLES.map((t) => (
                <li key={t.key} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0F3D32]">{t.label}</p>
                    <p className="text-xs text-gray-500">{t.text}</p>
                  </div>
                  <Switch label={t.label} checked={minor ? false : !!form.settings[t.key]} disabled={minor} onChange={(v) => setToggle(t.key, v)} />
                </li>
              ))}
            </ul>
          </Card>

          <Card
            icon="lock"
            title="Private details for verified scouts"
            text="Never shown to the public. Only verified scouts can see these."
            delay={180}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Height" optional htmlFor="tc-height" hint="In centimetres.">
                <div className="relative">
                  <input
                    id="tc-height"
                    type="number"
                    inputMode="numeric"
                    min="50"
                    max="260"
                    className={inputClass + ' pr-12'}
                    value={form.height_cm}
                    onChange={(e) => set({ height_cm: e.target.value })}
                    placeholder="Example: 182"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-gray-400">cm</span>
                </div>
              </Field>
              <Field label="Weight" optional htmlFor="tc-weight" hint="In kilograms.">
                <div className="relative">
                  <input
                    id="tc-weight"
                    type="number"
                    inputMode="decimal"
                    min="10"
                    max="250"
                    className={inputClass + ' pr-12'}
                    value={form.weight_kg}
                    onChange={(e) => set({ weight_kg: e.target.value })}
                    placeholder="Example: 76"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-gray-400">kg</span>
                </div>
              </Field>
            </div>
          </Card>

          {message && (
            <p
              role="status"
              className={
                'acc-pop rounded-xl px-4 py-3 text-sm font-medium ' +
                (message.type === 'ok' ? 'bg-[#1B5E4F] text-white' : 'border border-red-200 bg-red-50 text-red-600')
              }
            >
              {message.text}
            </p>
          )}
        </div>
      </div>

      {/* appears when something changed */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#CDEBE2] bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
            <p className="mr-auto text-sm text-gray-500">You have unsaved changes.</p>
            <button type="button" onClick={() => setForm(start)} disabled={saving} className={btnGhost}>
              Discard
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary}>
              <TIcon name="check" size={16} strokeWidth={2.6} />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
      <div className="h-16" />
    </div>
  )
}