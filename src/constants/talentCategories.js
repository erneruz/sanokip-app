// src/constants/talentCategories.js
// The talent categories of Peak Star Entertainment.
// One list used everywhere (navbar menu, Talents page filters, Submit form),
// so a new category is added in ONE place only.
// "slug" is what appears in the address: /entertainment/talents?category=music

export const TALENT_CATEGORIES = [
  { slug: 'music', label: 'Music & Artists', hint: 'Singers, rappers, bands, producers' },
  { slug: 'movie', label: 'Movies & Acting', hint: 'Actors, filmmakers, short films' },
  { slug: 'dance', label: 'Dance', hint: 'Traditional, urban, choreography' },
  { slug: 'football', label: 'Football', hint: 'Strikers, midfielders, goalkeepers' },
  { slug: 'basketball', label: 'Basketball', hint: 'Guards, forwards, centres' },
  { slug: 'volleyball', label: 'Volleyball', hint: 'Spikers, setters, liberos' },
  { slug: 'athletics', label: 'Athletics', hint: 'Running, jumping, throwing' },
  { slug: 'other', label: 'Other talents', hint: 'Art, comedy, fashion and more' },
]

export function getTalentCategory(slug) {
  return TALENT_CATEGORIES.find((c) => c.slug === slug) ?? null
}