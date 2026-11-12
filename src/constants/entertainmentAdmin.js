// src/constants/entertainmentAdmin.js
// Shared facts for the Peak Star Entertainment admin area:
// the address, the content types, and which member roles each staff role may manage.

export const ENT_ADMIN = '/admin/entertainment'

// The kinds of content the Entertainment team publishes.
// "path" is the end of the admin address: /admin/entertainment/news
// "kind" is the value saved in the database (table ent_content).
export const ENT_CONTENT_KINDS = [
  { kind: 'news', path: 'news', label: 'News', single: 'news article' },
  { kind: 'story', path: 'stories', label: 'Success Stories', single: 'success story' },
  { kind: 'opportunity', path: 'opportunities', label: 'Opportunities', single: 'opportunity' },
  { kind: 'testimonial', path: 'testimonials', label: 'Testimonials', single: 'testimonial' },
  { kind: 'video', path: 'videos', label: 'Video Clips', single: 'video clip' },
  { kind: 'publication', path: 'publications', label: 'Publications', single: 'publication' },
]

export function contentKindLabel(kind) {
  return ENT_CONTENT_KINDS.find((k) => k.kind === kind)?.label ?? kind
}

// plural names of the member roles, for menus and titles
export const ENT_ROLE_PLURAL = {
  visitor: 'Visitors',
  talent: 'Talents',
  guardian: 'Parents / Guardians',
  scout: 'Scouts',
  manager: 'Talent Managers',
  partner: 'Partners',
}

export const ENT_ROLE_ORDER = ['visitor', 'talent', 'guardian', 'scout', 'manager', 'partner']

// Which member roles a person may manage, from their staff roles.
// This mirrors the database rule, which is the real protection.
export function manageableEntRoles(staffRoles = []) {
  if (staffRoles.includes('super_admin') || staffRoles.includes('entertainment_admin')) {
    return [...ENT_ROLE_ORDER]
  }
  const roles = new Set()
  if (staffRoles.includes('scouting_manager')) ['scout', 'talent', 'manager'].forEach((r) => roles.add(r))
  if (staffRoles.includes('partner_manager')) ['partner', 'manager'].forEach((r) => roles.add(r))
  return ENT_ROLE_ORDER.filter((r) => roles.has(r))
}

// only the Super Admin and the Entertainment Admin may remove a member
export function canRemoveEntMembers(staffRoles = []) {
  return staffRoles.includes('super_admin') || staffRoles.includes('entertainment_admin')
}