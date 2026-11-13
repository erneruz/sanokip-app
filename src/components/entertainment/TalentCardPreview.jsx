// src/components/entertainment/TalentCardPreview.jsx
// The public talent card, as scouts, partners and visitors will see it.
// It only draws what it is given: the page decides what is public (a child gets
// the strict version: first name, age group and region only).
import EntAvatar from './EntAvatar'
import CategoryIcon from './CategoryIcon'
import SocialIcon from './SocialIcon'
import { getTalentCategory } from '../../constants/talentCategories'
import { TIcon } from '../../pages/entertainment/account/talentUi'

// the About text without the formatting marks (bold stars, bullets)
function plain(text) {
  return String(text ?? '')
    .replace(/\*\*/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function Chip({ children, icon, slug }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E6F1EE] to-[#CDEBE2] px-2.5 py-1 text-xs font-semibold text-[#0F3D32]">
      {slug ? <CategoryIcon slug={slug} size={13} /> : <TIcon name={icon} size={13} />}
      {children}
    </span>
  )
}

export default function TalentCardPreview({
  name,
  headline,
  category,
  specialty,
  region,
  ageGroup,
  level,
  available = true,
  verified = false,
  photo = '',
  cover = '',
  about = '',
  achievements = '',
  club = '',
  socials = [],
  minor = false,
  published = false,
}) {
  const cat = getTalentCategory(category)
  const summary = plain(about)

  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-[#CDEBE2]">
      {/* top: cover (or the green design), with the badges */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#0A2E27] via-[#0F3D32] to-[#1B5E4F]">
        {cover ? (
          <>
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#0A2E27]/70 via-[#0F3D32]/25 to-[#0A2E27]/10" />
            <span className="absolute inset-0 bg-gradient-to-t from-[#0A2E27]/60 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <span className="acc-blob-a absolute -left-8 -top-10 size-40 rounded-full bg-[#2F9678]/40 blur-2xl" />
            <span className="acc-blob-b absolute -bottom-12 right-0 size-44 rounded-full bg-[#9FD8C9]/25 blur-2xl" />
          </>
        )}
        <span className="acc-dots absolute inset-0 opacity-60" />
        <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
          {published ? 'Public card' : 'Preview'}
        </span>
        {verified && (
          <span className="verified-shine absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#1B5E4F]/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg ring-1 ring-white/30">
            <TIcon name="verified" size={13} />
            Verified by Scout
          </span>
        )}
      </div>

      <div className="px-5 pb-5">
        <EntAvatar
          name={name}
          src={photo}
          size="size-20"
          textClass="text-2xl"
          className="-mt-10 ring-4! ring-white! shadow-lg"
        />

        <h3 className="mt-3 break-words text-xl font-bold tracking-tight text-[#0F3D32]">{name || 'Your name'}</h3>
        {headline && <p className="mt-0.5 break-words text-sm text-gray-500">{headline}</p>}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {cat && <Chip slug={category}>{cat.label}</Chip>}
          {specialty && <Chip icon="star">{specialty}</Chip>}
          {region && <Chip icon="pin">{region}</Chip>}
          {ageGroup && <Chip icon="calendar">{ageGroup}</Chip>}
          {level && <Chip icon="trophy">{level}</Chip>}
        </div>

        <p
          className={
            'mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ' +
            (available ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500')
          }
        >
          <span className={'size-2 rounded-full ' + (available ? 'bg-emerald-500' : 'bg-gray-400')} />
          {available ? 'Available for scouting' : 'Not available right now'}
        </p>

        {summary && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-gray-600">{summary}</p>}

        {(club || achievements) && !minor && (
          <div className="mt-4 space-y-2 rounded-2xl bg-[#F8FBFA] p-3 ring-1 ring-[#E6F1EE]">
            {club && (
              <p className="flex items-start gap-2 text-xs text-gray-600">
                <TIcon name="users" size={14} className="mt-0.5 shrink-0 text-[#2F9678]" />
                <span className="break-words">{club}</span>
              </p>
            )}
            {achievements && (
              <p className="flex items-start gap-2 text-xs text-gray-600">
                <TIcon name="trophy" size={14} className="mt-0.5 shrink-0 text-[#2F9678]" />
                <span className="line-clamp-2 break-words">{plain(achievements)}</span>
              </p>
            )}
          </div>
        )}

        {socials.length > 0 && !minor && (
          <div className="mt-4 flex flex-wrap gap-2">
            {socials.map((s) => (
              <span
                key={s.key}
                title={s.label}
                className="flex size-8 items-center justify-center rounded-full bg-[#E6F1EE] text-[#1B5E4F]"
              >
                <SocialIcon name={s.key} size={15} />
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B5E4F] px-4 py-2.5 text-sm font-semibold text-white">
            <TIcon name="send" size={15} />
            Contact through Peak Star
          </span>
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F]" title="Share on WhatsApp">
            <SocialIcon name="whatsapp" size={17} />
          </span>
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#E6F1EE] text-[#1B5E4F]" title="Copy link">
            <TIcon name="copy" size={16} />
          </span>
        </div>

        {minor && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
            <TIcon name="lock" size={14} className="mt-0.5 shrink-0" />
            Under 18: only the first name, age group and region are shown. Every contact request goes to the
            parent or guardian.
          </p>
        )}
      </div>
    </article>
  )
}