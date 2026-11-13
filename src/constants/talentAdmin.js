// src/constants/talentAdmin.js
// The admin side of the talent journey, in ONE place:
//   - the addresses of the admin pages
//   - the groups used by the filters on the Submissions page
//   - the next steps a scout can take from each status
// To change a step or a filter, edit it here only.
import { ENT_ADMIN } from './entertainmentAdmin'

export const ENT_TALENT_PATHS = {
  submissions: `${ENT_ADMIN}/submissions`,
  takedowns: `${ENT_ADMIN}/takedowns`,
  talents: `${ENT_ADMIN}/talents`,
  consents: `${ENT_ADMIN}/consents`,
}

// the groups on the Submissions page (the tiles and the chips)
export const SUBMISSION_GROUPS = [
  { key: 'new', label: 'New', hint: 'Nobody has looked at these yet', statuses: ['submitted'] },
  { key: 'review', label: 'In review', hint: 'A scout is checking', statuses: ['in_review'] },
  { key: 'waiting', label: 'Waiting for the member', hint: 'More information was asked', statuses: ['needs_info'] },
  {
    key: 'field',
    label: 'Verified and in the field',
    hint: 'Verified, visit, shoot',
    statuses: ['verified', 'visit_scheduled', 'shot'],
  },
  {
    key: 'live',
    label: 'Profile and live',
    hint: 'Profile in preparation or public',
    statuses: ['profile_draft', 'published', 'documentary_linked'],
  },
  { key: 'closed', label: 'Closed', hint: 'Not selected or withdrawn', statuses: ['rejected', 'withdrawn'] },
]

// every status a scout can set by hand (the "other status" menu)
export const SETTABLE_STATUSES = [
  'submitted',
  'in_review',
  'needs_info',
  'verified',
  'visit_scheduled',
  'shot',
  'profile_draft',
  'published',
  'documentary_linked',
  'rejected',
]

// the usual next steps from each status.
//   note: 'required' = the scout must write a message, 'optional' = may write one
//   tone: 'go' (green), 'ask' (amber), 'stop' (red), 'soft' (gray)
export const NEXT_STEPS = {
  submitted: [{ status: 'in_review', label: 'Start the review', tone: 'go', note: 'optional' }],
  in_review: [
    { status: 'verified', label: 'Verify the talent', tone: 'go', note: 'optional' },
    { status: 'needs_info', label: 'Ask for more information', tone: 'ask', note: 'required' },
    { status: 'rejected', label: 'Not selected', tone: 'stop', note: 'required' },
  ],
  needs_info: [
    { status: 'in_review', label: 'Back to review', tone: 'go', note: 'optional' },
    { status: 'rejected', label: 'Not selected', tone: 'stop', note: 'required' },
  ],
  verified: [
    { status: 'visit_scheduled', label: 'Schedule a visit', tone: 'go', note: 'optional' },
    { status: 'rejected', label: 'Not selected', tone: 'stop', note: 'required' },
  ],
  visit_scheduled: [{ status: 'shot', label: 'Reel filmed', tone: 'go', note: 'optional' }],
  shot: [{ status: 'profile_draft', label: 'Start the profile', tone: 'go', note: 'optional' }],
  profile_draft: [{ status: 'published', label: 'Publish', tone: 'go', note: 'optional' }],
  published: [{ status: 'documentary_linked', label: 'Link the documentary', tone: 'go', note: 'optional', needsDocumentary: true }],
  documentary_linked: [],
  rejected: [{ status: 'in_review', label: 'Reopen the review', tone: 'soft', note: 'optional' }],
  withdrawn: [],
}

// what the child-safety rules need before a step (the database checks them too)
export const CHILD_GATES = {
  visit_scheduled: 'visit',
  published: 'profile',
  documentary_linked: 'documentary',
}

export function groupOfStatus(status) {
  return SUBMISSION_GROUPS.find((g) => g.statuses.includes(status))?.key ?? 'closed'
}

// the consents that are active now, from the list sent by the database
export function activeConsentKinds(consents = []) {
  return consents.filter((c) => !c.withdrawn_at).map((c) => c.kind)
}

export function subjectLabel(s) {
  if (s.subject === 'child') return 'Child'
  if (s.subject === 'adult') return 'Another adult'
  return 'Talent'
}