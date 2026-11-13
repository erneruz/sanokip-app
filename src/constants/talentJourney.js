// src/constants/talentJourney.js
// Everything about the talent journey in ONE place:
//   - the stages of a submission (the tracker)
//   - the five consents
//   - small helpers (age group, public region)
// To rename a stage or change a consent text, edit it here only.

// ── Stages of a submission, in order (the tracker) ───────────
export const STAGES = [
  { key: 'submitted', label: 'Submitted', text: 'We received your clip.' },
  { key: 'in_review', label: 'In review', text: 'A scout is watching your clip and checking it.' },
  { key: 'verified', label: 'Verified', text: 'A scout confirmed the talent and the skill are real.' },
  { key: 'visit_scheduled', label: 'Visit', text: 'A scout visit is planned.' },
  { key: 'shot', label: 'Shoot', text: 'The studio-quality showcase reel was filmed.' },
  { key: 'profile_draft', label: 'Profile', text: 'Your public profile is being prepared.' },
  { key: 'published', label: 'Published', text: 'Your public profile is live.' },
  { key: 'documentary_linked', label: 'Documentary', text: 'Your documentary is linked on YouTube.' },
]

// tone: green = good, amber = needs you, red = stopped, gray = closed
export const STATUS_INFO = {
  submitted: { label: 'Submitted', tone: 'green', text: 'We received your clip. A scout will review it soon.' },
  in_review: { label: 'In review', tone: 'green', text: 'A scout is watching your clip and checking it.' },
  needs_info: { label: 'More information needed', tone: 'amber', text: 'A scout asked you something. Please reply below.' },
  verified: { label: 'Verified', tone: 'green', text: 'A scout confirmed the talent and the skill are real.' },
  rejected: { label: 'Not selected', tone: 'red', text: 'This clip was not selected this time.' },
  visit_scheduled: { label: 'Visit scheduled', tone: 'green', text: 'A scout visit is planned. A guardian is present for a child.' },
  shot: { label: 'Reel filmed', tone: 'green', text: 'The studio-quality showcase reel was filmed.' },
  profile_draft: { label: 'Profile in preparation', tone: 'green', text: 'Your public profile is being prepared.' },
  published: { label: 'Published', tone: 'green', text: 'Your public profile is live.' },
  documentary_linked: { label: 'Documentary linked', tone: 'green', text: 'Your documentary is linked on YouTube.' },
  withdrawn: { label: 'Withdrawn', tone: 'gray', text: 'You withdrew this submission.' },
}

export function statusInfo(status) {
  return STATUS_INFO[status] ?? { label: status, tone: 'gray', text: '' }
}

// where the tracker stands (0 = first stage). -1 = not on the path (withdrawn)
export function stageIndex(status) {
  if (status === 'needs_info' || status === 'rejected') return 1
  return STAGES.findIndex((s) => s.key === status)
}

// groups used by the filter chips
export const OPEN_STATUSES = ['submitted', 'in_review', 'needs_info', 'verified', 'visit_scheduled', 'shot', 'profile_draft']
export const CLOSED_STATUSES = ['rejected', 'withdrawn']
export const LIVE_STATUSES = ['published', 'documentary_linked']

// ── The five consents ────────────────────────────────────────
// Each one is given and withdrawn separately, with the date kept.
export const CONSENT_WORDING_VERSION = 'v1'

export const CONSENT_KINDS = [
  {
    kind: 'review',
    icon: 'search',
    title: 'Review of the clip',
    me: 'Scouts may watch the clip I sent and check that I am who I say and that the skill is real.',
    child: 'Scouts may watch the clip I sent of my child and check that the skill is real.',
  },
  {
    kind: 'visit',
    icon: 'pin',
    title: 'Scout visit',
    me: 'A scout may visit me and film a high-quality showcase reel.',
    child: 'A scout may visit my child and film a showcase reel. I will be present at every visit.',
  },
  {
    kind: 'profile',
    icon: 'user',
    title: 'Public profile',
    me: 'A public profile may be shown on Peak Star Entertainment.',
    child: 'A public profile may be shown. It shows only my child\'s first name, age group and region. Contact requests come to me.',
  },
  {
    kind: 'reel',
    icon: 'video',
    title: 'Showcase reel',
    me: 'The studio-quality showcase reel may be shown on my profile.',
    child: 'The studio-quality showcase reel may be shown on my child\'s profile.',
  },
  {
    kind: 'documentary',
    icon: 'play',
    title: 'YouTube documentary',
    me: 'A short documentary about me may be published worldwide on YouTube and linked from my profile.',
    child: 'A short documentary about my child may be published worldwide on YouTube and linked from the profile.',
  },
]

export function consentText(kind, forChild) {
  const k = CONSENT_KINDS.find((c) => c.kind === kind)
  return k ? (forChild ? k.child : k.me) : ''
}

// ── Small helpers ────────────────────────────────────────────
export const UNDER_18_GROUPS = ['Under 13', '13 to 17']

export function ageGroupOfYears(years) {
  const n = Number(years)
  if (!Number.isFinite(n)) return ''
  if (n < 13) return 'Under 13'
  if (n < 18) return '13 to 17'
  return '18 or older'
}

// a talent who chose an under-18 age group is treated as a child (strict privacy)
export function isMinorTalent(entProfile) {
  return entProfile?.role === 'talent' && UNDER_18_GROUPS.includes(entProfile?.details?.ageGroup)
}

export const SKILL_LEVELS = ['Beginner', 'Amateur', 'Semi-professional', 'Professional']

export const RELATIONSHIPS_ADULT = ['Family member', 'Friend', 'Coach or teacher', 'Manager or agent', 'Other']

// what a member decides to show on the public card (adults only; a child is always the strict version)
export const PUBLIC_TOGGLES = [
  { key: 'show_photo', label: 'My profile photo', text: 'Shown at the top of your card.', def: true },
  { key: 'show_cover', label: 'My cover picture', text: 'The wide picture behind your photo.', def: true },
  { key: 'show_socials', label: 'My social media links', text: 'Instagram, YouTube, TikTok and the others you added.', def: true },
  { key: 'show_achievements', label: 'My achievements and club', text: 'Prizes, matches and your team or club.', def: true },
  { key: 'show_district', label: 'My district', text: 'Not only your province. A scout can plan a visit more easily.', def: false },
]

export function publicSetting(settings, key) {
  const t = PUBLIC_TOGGLES.find((x) => x.key === key)
  const v = settings?.[key]
  return typeof v === 'boolean' ? v : (t?.def ?? true)
}