// src/constants/talentCategories.js
// The talent categories of Peak Star Entertainment, and the sub-categories
// (positions, roles, styles) of each one.
// One list used everywhere (navbar menu, Talents page filters, Submit form,
// sign-up questions), so a new category or position is added in ONE place only.
// "slug" is what appears in the address: /entertainment/talents?category=music
//
// subLabel      = the question asked once the category is chosen
// subcategories = the professional names the person can pick from

export const TALENT_CATEGORIES = [
  {
    slug: 'music',
    label: 'Music & Artists',
    hint: 'Singers, rappers, bands, producers',
    subLabel: 'Your role in music',
    subcategories: [
      'Singer',
      'Rapper',
      'Singer-songwriter',
      'Music producer',
      'Instrumentalist',
      'DJ',
      'Band member',
      'Choir or gospel artist',
      'Traditional music artist',
    ],
  },
  {
    slug: 'movie',
    label: 'Movies & Acting',
    hint: 'Actors, filmmakers, short films',
    subLabel: 'Your role in film',
    subcategories: [
      'Actor or actress',
      'Film director',
      'Screenwriter',
      'Cinematographer',
      'Film editor',
      'Film producer',
      'Voice actor',
      'Stunt performer',
    ],
  },
  {
    slug: 'dance',
    label: 'Dance',
    hint: 'Traditional, urban, choreography',
    subLabel: 'Your dance style',
    subcategories: [
      'Traditional (Intore) dancer',
      'Contemporary dancer',
      'Hip hop or street dancer',
      'Afro dancer',
      'Ballet dancer',
      'Choreographer',
      'Dance crew member',
    ],
  },
  {
    slug: 'football',
    label: 'Football',
    hint: 'Strikers, midfielders, goalkeepers',
    subLabel: 'Your position',
    subcategories: [
      'Goalkeeper',
      'Centre-back',
      'Full-back',
      'Wing-back',
      'Defensive midfielder',
      'Central midfielder',
      'Attacking midfielder',
      'Winger',
      'Second striker',
      'Striker (centre-forward)',
    ],
  },
  {
    slug: 'basketball',
    label: 'Basketball',
    hint: 'Guards, forwards, centres',
    subLabel: 'Your position',
    subcategories: ['Point guard', 'Shooting guard', 'Small forward', 'Power forward', 'Center'],
  },
  {
    slug: 'volleyball',
    label: 'Volleyball',
    hint: 'Spikers, setters, liberos',
    subLabel: 'Your position',
    subcategories: [
      'Setter',
      'Outside hitter',
      'Opposite hitter',
      'Middle blocker',
      'Libero',
      'Beach volleyball player',
      'Sitting volleyball player',
    ],
  },
  {
    slug: 'athletics',
    label: 'Athletics',
    hint: 'Running, jumping, throwing',
    subLabel: 'Your event',
    subcategories: [
      'Sprinter (100 m to 400 m)',
      'Middle-distance runner (800 m to 1500 m)',
      'Long-distance runner (5000 m and 10 000 m)',
      'Marathon runner',
      'Hurdler or steeplechase runner',
      'Jumper (long, triple or high jump)',
      'Thrower (shot put, discus or javelin)',
      'Race walker',
    ],
  },
  {
    slug: 'comedy',
    label: 'Comedy',
    hint: 'Stand-up, sketches, MCs, online humour',
    subLabel: 'Your comedy style',
    subcategories: [
      'Stand-up comedian',
      'Sketch comedian',
      'MC or host',
      'Impressionist',
      'Improv performer',
      'Comedy writer',
      'Online comedy creator',
    ],
  },
  {
    slug: 'other',
    label: 'Other talents',
    hint: 'Art, fashion and more',
    subLabel: 'Your talent',
    subcategories: [
      'Visual artist',
      'Fashion designer',
      'Model',
      'Photographer',
      'Poet or spoken word artist',
      'Content creator',
      'Magician or circus performer',
      'Other',
    ],
  },
]

export function getTalentCategory(slug) {
  return TALENT_CATEGORIES.find((c) => c.slug === slug) ?? null
}

// the sub-categories (positions, roles, styles) of a category
export function getSubcategories(slug) {
  return getTalentCategory(slug)?.subcategories ?? []
}

// the question asked for the sub-category, for example "Your position"
export function getSubcategoryLabel(slug) {
  return getTalentCategory(slug)?.subLabel ?? 'Your speciality'
}