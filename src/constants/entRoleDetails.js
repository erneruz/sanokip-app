// src/constants/entRoleDetails.js
// The extra (professional) information asked from each kind of Entertainment
// member when they join. Visitors have none.
// Everything is described here, in ONE place: to add or change a question,
// edit the list of that role. The form, the checks, the saving and the admin
// view all read from it.
//
// Field kinds: text | url | tel | select | multi | choice | textarea
//   choice    = one answer picked from chips (used for the sub-category)
// dependsOn: the key of an earlier question; when that answer changes, this one is cleared.
// optionsFor / labelFor: the options and the question depend on the earlier answer.
// showIf: the field is only asked when this returns true for the answers so far.
import { TALENT_CATEGORIES, getSubcategories, getSubcategoryLabel } from './talentCategories'

const categoryOptions = TALENT_CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))
const opts = (list) => list.map((x) => ({ value: x, label: x }))

const YEARS = opts(['Less than 1 year', '1 to 3 years', '4 to 6 years', '7 to 10 years', 'More than 10 years'])
const UNDER_18 = ['Under 13', '13 to 17']

export const ROLE_DETAILS = {
  talent: {
    title: 'Your talent profile',
    text: 'Scouts and partners look at this first, so tell them what you do.',
    fields: [
      { key: 'category', label: 'Talent category', kind: 'select', required: true, options: categoryOptions, placeholder: 'Choose your category' },
      // opens straight after the category: positions for football, roles for music, styles for comedy...
      {
        key: 'specialty',
        label: 'Your position or speciality',
        labelFor: (d) => getSubcategoryLabel(d.category),
        kind: 'choice',
        required: true,
        dependsOn: 'category',
        showIf: (d) => !!d.category,
        optionsFor: (d) => opts(getSubcategories(d.category)),
      },
      { key: 'level', label: 'Your level', kind: 'select', required: true, placeholder: 'Choose your level', options: opts(['Beginner', 'Amateur', 'Semi-professional', 'Professional']) },
      { key: 'experience', label: 'Experience', kind: 'select', required: false, placeholder: 'How long have you been doing this?', options: YEARS },
      { key: 'ageGroup', label: 'Your age group', kind: 'select', required: true, placeholder: 'Choose your age group', options: opts([...UNDER_18, '18 or older']) },
      { key: 'guardianName', label: "Parent or guardian's full name", kind: 'text', required: true, showIf: (d) => UNDER_18.includes(d.ageGroup), hint: 'Talents under 18 need a parent or guardian.' },
      { key: 'guardianPhone', label: "Parent or guardian's phone", kind: 'tel', required: true, showIf: (d) => UNDER_18.includes(d.ageGroup), placeholder: '+250788123456' },
      { key: 'club', label: 'Current team, club, school or group', kind: 'text', required: false },
      { key: 'link', label: 'Link to your best work', kind: 'url', required: false, placeholder: 'YouTube, Instagram, TikTok…' },
      { key: 'achievements', label: 'Achievements', kind: 'textarea', required: false, placeholder: 'Prizes, matches, albums, shows…' },
    ],
  },

  guardian: {
    title: 'About the young talent you follow',
    text: 'Tell us about the child in your care.',
    fields: [
      { key: 'relationship', label: 'Your relationship', kind: 'select', required: true, placeholder: 'Choose', options: opts(['Parent', 'Legal guardian', 'Coach or teacher', 'Other family member']) },
      { key: 'childName', label: "Child's full name", kind: 'text', required: true },
      { key: 'childAge', label: "Child's age", kind: 'select', required: true, placeholder: 'Choose age group', options: opts(['Under 10', '10 to 12', '13 to 15', '16 to 17']) },
      { key: 'childCategory', label: "Child's talent category", kind: 'select', required: true, options: categoryOptions, placeholder: 'Choose category' },
      {
        key: 'childSpecialty',
        label: "Child's position or speciality",
        labelFor: (d) => getSubcategoryLabel(d.childCategory).replace('Your', "Child's").replace('your', "child's"),
        kind: 'choice',
        required: true,
        dependsOn: 'childCategory',
        showIf: (d) => !!d.childCategory,
        optionsFor: (d) => opts(getSubcategories(d.childCategory)),
      },
      { key: 'link', label: 'Link to the child\'s work', kind: 'url', required: false, placeholder: 'YouTube, Instagram, TikTok…' },
    ],
  },

  scout: {
    title: 'Your scouting profile',
    text: 'Our team checks this before your scout account is approved.',
    fields: [
      { key: 'categories', label: 'Talents you scout', kind: 'multi', required: true, options: categoryOptions },
      { key: 'position', label: 'Your position', kind: 'text', required: true, placeholder: 'For example: head scout, academy recruiter' },
      { key: 'experience', label: 'Experience as a scout', kind: 'select', required: true, placeholder: 'Choose', options: YEARS },
      { key: 'coverage', label: 'Areas you cover', kind: 'text', required: false, placeholder: 'Districts, provinces or countries' },
      { key: 'accreditation', label: 'Licence or accreditation number', kind: 'text', required: false },
      { key: 'link', label: 'Website or professional profile', kind: 'url', required: false, placeholder: 'https://' },
    ],
  },

  manager: {
    title: 'Your management profile',
    text: 'Our team checks this before your account is approved.',
    fields: [
      { key: 'categories', label: 'Talents you represent', kind: 'multi', required: true, options: categoryOptions },
      { key: 'talentsCount', label: 'Talents you manage now', kind: 'select', required: true, placeholder: 'Choose', options: opts(['None yet', '1 to 5', '6 to 15', 'More than 15']) },
      { key: 'experience', label: 'Experience as a manager', kind: 'select', required: true, placeholder: 'Choose', options: YEARS },
      { key: 'licence', label: 'Licence or registration number', kind: 'text', required: false },
      { key: 'link', label: 'Website or professional profile', kind: 'url', required: false, placeholder: 'https://' },
      { key: 'clients', label: 'Notable talents or results', kind: 'textarea', required: false },
    ],
  },

  partner: {
    title: 'Your organisation',
    text: 'Our team checks this before your partner account is approved.',
    fields: [
      { key: 'orgType', label: 'Type of organisation', kind: 'select', required: true, placeholder: 'Choose', options: opts(['Club or team', 'Academy or school', 'Record label or studio', 'Brand or sponsor', 'Media house', 'NGO or foundation', 'Other']) },
      { key: 'contactRole', label: 'Your position there', kind: 'text', required: true, placeholder: 'For example: sporting director, A&R manager' },
      { key: 'categories', label: 'Talents you look for', kind: 'multi', required: true, options: categoryOptions },
      { key: 'offers', label: 'What you can offer', kind: 'multi', required: true, options: opts(['Trials', 'Scholarships', 'Contracts', 'Sponsorship', 'Training', 'Media coverage', 'Other']) },
      { key: 'link', label: 'Website', kind: 'url', required: false, placeholder: 'https://' },
    ],
  },
}

// does this kind of member have extra questions?
export function roleHasDetails(role) {
  return !!ROLE_DETAILS[role]
}

// the questions that apply right now (some depend on earlier answers)
export function visibleFields(role, details = {}) {
  return (ROLE_DETAILS[role]?.fields ?? []).filter((f) => !f.showIf || f.showIf(details))
}

const isEmpty = (v) => (Array.isArray(v) ? v.length === 0 : String(v ?? '').trim() === '')

// returns a message about the first problem, or '' when everything is fine
export function detailsProblem(role, details = {}) {
  for (const f of visibleFields(role, details)) {
    const v = details[f.key]
    if (f.required && isEmpty(v)) {
      return f.kind === 'multi' ? `Choose at least one option for "${f.label}".` : `Please fill in "${f.label}".`
    }
    if (f.kind === 'url' && !isEmpty(v) && !/^https?:\/\/\S+\.\S+/i.test(String(v).trim())) {
      return `"${f.label}" must be a full link starting with https://`
    }
    if (f.kind === 'tel' && !isEmpty(v) && String(v).replace(/\D/g, '').length < 8) {
      return `"${f.label}" does not look like a phone number.`
    }
  }
  return ''
}

// only what applies to this role, trimmed (this is what gets saved)
export function cleanDetails(role, details = {}) {
  const out = {}
  for (const f of visibleFields(role, details)) {
    const v = details[f.key]
    if (isEmpty(v)) continue
    out[f.key] = Array.isArray(v) ? v : String(v).trim()
  }
  return out
}

// a readable list for the admin view: [{ label, value }]
export function describeDetails(role, details) {
  if (!details || typeof details !== 'object') return []
  return visibleFields(role, details)
    .filter((f) => !isEmpty(details[f.key]))
    .map((f) => {
      const raw = details[f.key]
      const labelOf = (v) => f.options?.find((o) => o.value === v)?.label ?? v
      const value = Array.isArray(raw) ? raw.map(labelOf).join(', ') : labelOf(raw)
      return { key: f.key, label: f.labelFor ? f.labelFor(details) : f.label, value, link: f.kind === 'url' }
    })
}