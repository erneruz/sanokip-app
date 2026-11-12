// src/constants/countries.js
// Shared country list with calling codes, used across the app
// (service request form, Peak Star Entertainment sign-up and account).
// Format: { name, code (ISO), dial ("+250") }

export const COUNTRIES = [
  { name: 'Afghanistan', code: 'AF', dial: '+93' },
  { name: 'Albania', code: 'AL', dial: '+355' },
  { name: 'Algeria', code: 'DZ', dial: '+213' },
  { name: 'Andorra', code: 'AD', dial: '+376' },
  { name: 'Angola', code: 'AO', dial: '+244' },
  { name: 'Antigua and Barbuda', code: 'AG', dial: '+1268' },
  { name: 'Argentina', code: 'AR', dial: '+54' },
  { name: 'Armenia', code: 'AM', dial: '+374' },
  { name: 'Australia', code: 'AU', dial: '+61' },
  { name: 'Austria', code: 'AT', dial: '+43' },
  { name: 'Azerbaijan', code: 'AZ', dial: '+994' },
  { name: 'Bahamas', code: 'BS', dial: '+1242' },
  { name: 'Bahrain', code: 'BH', dial: '+973' },
  { name: 'Bangladesh', code: 'BD', dial: '+880' },
  { name: 'Barbados', code: 'BB', dial: '+1246' },
  { name: 'Belarus', code: 'BY', dial: '+375' },
  { name: 'Belgium', code: 'BE', dial: '+32' },
  { name: 'Belize', code: 'BZ', dial: '+501' },
  { name: 'Benin', code: 'BJ', dial: '+229' },
  { name: 'Bhutan', code: 'BT', dial: '+975' },
  { name: 'Bolivia', code: 'BO', dial: '+591' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dial: '+387' },
  { name: 'Botswana', code: 'BW', dial: '+267' },
  { name: 'Brazil', code: 'BR', dial: '+55' },
  { name: 'Brunei', code: 'BN', dial: '+673' },
  { name: 'Bulgaria', code: 'BG', dial: '+359' },
  { name: 'Burkina Faso', code: 'BF', dial: '+226' },
  { name: 'Burundi', code: 'BI', dial: '+257' },
  { name: 'Cambodia', code: 'KH', dial: '+855' },
  { name: 'Cameroon', code: 'CM', dial: '+237' },
  { name: 'Canada', code: 'CA', dial: '+1' },
  { name: 'Cape Verde', code: 'CV', dial: '+238' },
  { name: 'Central African Republic', code: 'CF', dial: '+236' },
  { name: 'Chad', code: 'TD', dial: '+235' },
  { name: 'Chile', code: 'CL', dial: '+56' },
  { name: 'China', code: 'CN', dial: '+86' },
  { name: 'Colombia', code: 'CO', dial: '+57' },
  { name: 'Comoros', code: 'KM', dial: '+269' },
  { name: 'Congo (Brazzaville)', code: 'CG', dial: '+242' },
  { name: 'Costa Rica', code: 'CR', dial: '+506' },
  { name: 'Croatia', code: 'HR', dial: '+385' },
  { name: 'Cuba', code: 'CU', dial: '+53' },
  { name: 'Cyprus', code: 'CY', dial: '+357' },
  { name: 'Czechia', code: 'CZ', dial: '+420' },
  { name: "Côte d'Ivoire", code: 'CI', dial: '+225' },
  { name: 'Denmark', code: 'DK', dial: '+45' },
  { name: 'Djibouti', code: 'DJ', dial: '+253' },
  { name: 'Dominica', code: 'DM', dial: '+1767' },
  { name: 'Dominican Republic', code: 'DO', dial: '+1809' },
  { name: 'DR Congo', code: 'CD', dial: '+243' },
  { name: 'Ecuador', code: 'EC', dial: '+593' },
  { name: 'Egypt', code: 'EG', dial: '+20' },
  { name: 'El Salvador', code: 'SV', dial: '+503' },
  { name: 'Equatorial Guinea', code: 'GQ', dial: '+240' },
  { name: 'Eritrea', code: 'ER', dial: '+291' },
  { name: 'Estonia', code: 'EE', dial: '+372' },
  { name: 'Eswatini', code: 'SZ', dial: '+268' },
  { name: 'Ethiopia', code: 'ET', dial: '+251' },
  { name: 'Fiji', code: 'FJ', dial: '+679' },
  { name: 'Finland', code: 'FI', dial: '+358' },
  { name: 'France', code: 'FR', dial: '+33' },
  { name: 'Gabon', code: 'GA', dial: '+241' },
  { name: 'Gambia', code: 'GM', dial: '+220' },
  { name: 'Georgia', code: 'GE', dial: '+995' },
  { name: 'Germany', code: 'DE', dial: '+49' },
  { name: 'Ghana', code: 'GH', dial: '+233' },
  { name: 'Greece', code: 'GR', dial: '+30' },
  { name: 'Grenada', code: 'GD', dial: '+1473' },
  { name: 'Guatemala', code: 'GT', dial: '+502' },
  { name: 'Guinea', code: 'GN', dial: '+224' },
  { name: 'Guinea-Bissau', code: 'GW', dial: '+245' },
  { name: 'Guyana', code: 'GY', dial: '+592' },
  { name: 'Haiti', code: 'HT', dial: '+509' },
  { name: 'Honduras', code: 'HN', dial: '+504' },
  { name: 'Hungary', code: 'HU', dial: '+36' },
  { name: 'Iceland', code: 'IS', dial: '+354' },
  { name: 'India', code: 'IN', dial: '+91' },
  { name: 'Indonesia', code: 'ID', dial: '+62' },
  { name: 'Iran', code: 'IR', dial: '+98' },
  { name: 'Iraq', code: 'IQ', dial: '+964' },
  { name: 'Ireland', code: 'IE', dial: '+353' },
  { name: 'Israel', code: 'IL', dial: '+972' },
  { name: 'Italy', code: 'IT', dial: '+39' },
  { name: 'Jamaica', code: 'JM', dial: '+1876' },
  { name: 'Japan', code: 'JP', dial: '+81' },
  { name: 'Jordan', code: 'JO', dial: '+962' },
  { name: 'Kazakhstan', code: 'KZ', dial: '+7' },
  { name: 'Kenya', code: 'KE', dial: '+254' },
  { name: 'Kuwait', code: 'KW', dial: '+965' },
  { name: 'Kyrgyzstan', code: 'KG', dial: '+996' },
  { name: 'Laos', code: 'LA', dial: '+856' },
  { name: 'Latvia', code: 'LV', dial: '+371' },
  { name: 'Lebanon', code: 'LB', dial: '+961' },
  { name: 'Lesotho', code: 'LS', dial: '+266' },
  { name: 'Liberia', code: 'LR', dial: '+231' },
  { name: 'Libya', code: 'LY', dial: '+218' },
  { name: 'Liechtenstein', code: 'LI', dial: '+423' },
  { name: 'Lithuania', code: 'LT', dial: '+370' },
  { name: 'Luxembourg', code: 'LU', dial: '+352' },
  { name: 'Madagascar', code: 'MG', dial: '+261' },
  { name: 'Malawi', code: 'MW', dial: '+265' },
  { name: 'Malaysia', code: 'MY', dial: '+60' },
  { name: 'Maldives', code: 'MV', dial: '+960' },
  { name: 'Mali', code: 'ML', dial: '+223' },
  { name: 'Malta', code: 'MT', dial: '+356' },
  { name: 'Mauritania', code: 'MR', dial: '+222' },
  { name: 'Mauritius', code: 'MU', dial: '+230' },
  { name: 'Mexico', code: 'MX', dial: '+52' },
  { name: 'Moldova', code: 'MD', dial: '+373' },
  { name: 'Monaco', code: 'MC', dial: '+377' },
  { name: 'Mongolia', code: 'MN', dial: '+976' },
  { name: 'Montenegro', code: 'ME', dial: '+382' },
  { name: 'Morocco', code: 'MA', dial: '+212' },
  { name: 'Mozambique', code: 'MZ', dial: '+258' },
  { name: 'Myanmar', code: 'MM', dial: '+95' },
  { name: 'Namibia', code: 'NA', dial: '+264' },
  { name: 'Nepal', code: 'NP', dial: '+977' },
  { name: 'Netherlands', code: 'NL', dial: '+31' },
  { name: 'New Zealand', code: 'NZ', dial: '+64' },
  { name: 'Nicaragua', code: 'NI', dial: '+505' },
  { name: 'Niger', code: 'NE', dial: '+227' },
  { name: 'Nigeria', code: 'NG', dial: '+234' },
  { name: 'North Korea', code: 'KP', dial: '+850' },
  { name: 'North Macedonia', code: 'MK', dial: '+389' },
  { name: 'Norway', code: 'NO', dial: '+47' },
  { name: 'Oman', code: 'OM', dial: '+968' },
  { name: 'Pakistan', code: 'PK', dial: '+92' },
  { name: 'Palestine', code: 'PS', dial: '+970' },
  { name: 'Panama', code: 'PA', dial: '+507' },
  { name: 'Papua New Guinea', code: 'PG', dial: '+675' },
  { name: 'Paraguay', code: 'PY', dial: '+595' },
  { name: 'Peru', code: 'PE', dial: '+51' },
  { name: 'Philippines', code: 'PH', dial: '+63' },
  { name: 'Poland', code: 'PL', dial: '+48' },
  { name: 'Portugal', code: 'PT', dial: '+351' },
  { name: 'Qatar', code: 'QA', dial: '+974' },
  { name: 'Romania', code: 'RO', dial: '+40' },
  { name: 'Russia', code: 'RU', dial: '+7' },
  { name: 'Rwanda', code: 'RW', dial: '+250' },
  { name: 'Saint Kitts and Nevis', code: 'KN', dial: '+1869' },
  { name: 'Saint Lucia', code: 'LC', dial: '+1758' },
  { name: 'Saint Vincent and the Grenadines', code: 'VC', dial: '+1784' },
  { name: 'Samoa', code: 'WS', dial: '+685' },
  { name: 'San Marino', code: 'SM', dial: '+378' },
  { name: 'Sao Tome and Principe', code: 'ST', dial: '+239' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966' },
  { name: 'Senegal', code: 'SN', dial: '+221' },
  { name: 'Serbia', code: 'RS', dial: '+381' },
  { name: 'Seychelles', code: 'SC', dial: '+248' },
  { name: 'Sierra Leone', code: 'SL', dial: '+232' },
  { name: 'Singapore', code: 'SG', dial: '+65' },
  { name: 'Slovakia', code: 'SK', dial: '+421' },
  { name: 'Slovenia', code: 'SI', dial: '+386' },
  { name: 'Solomon Islands', code: 'SB', dial: '+677' },
  { name: 'Somalia', code: 'SO', dial: '+252' },
  { name: 'South Africa', code: 'ZA', dial: '+27' },
  { name: 'South Korea', code: 'KR', dial: '+82' },
  { name: 'South Sudan', code: 'SS', dial: '+211' },
  { name: 'Spain', code: 'ES', dial: '+34' },
  { name: 'Sri Lanka', code: 'LK', dial: '+94' },
  { name: 'Sudan', code: 'SD', dial: '+249' },
  { name: 'Suriname', code: 'SR', dial: '+597' },
  { name: 'Sweden', code: 'SE', dial: '+46' },
  { name: 'Switzerland', code: 'CH', dial: '+41' },
  { name: 'Syria', code: 'SY', dial: '+963' },
  { name: 'Taiwan', code: 'TW', dial: '+886' },
  { name: 'Tajikistan', code: 'TJ', dial: '+992' },
  { name: 'Tanzania', code: 'TZ', dial: '+255' },
  { name: 'Thailand', code: 'TH', dial: '+66' },
  { name: 'Timor-Leste', code: 'TL', dial: '+670' },
  { name: 'Togo', code: 'TG', dial: '+228' },
  { name: 'Tonga', code: 'TO', dial: '+676' },
  { name: 'Trinidad and Tobago', code: 'TT', dial: '+1868' },
  { name: 'Tunisia', code: 'TN', dial: '+216' },
  { name: 'Turkey', code: 'TR', dial: '+90' },
  { name: 'Turkmenistan', code: 'TM', dial: '+993' },
  { name: 'Uganda', code: 'UG', dial: '+256' },
  { name: 'Ukraine', code: 'UA', dial: '+380' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971' },
  { name: 'United Kingdom', code: 'GB', dial: '+44' },
  { name: 'United States', code: 'US', dial: '+1' },
  { name: 'Uruguay', code: 'UY', dial: '+598' },
  { name: 'Uzbekistan', code: 'UZ', dial: '+998' },
  { name: 'Vanuatu', code: 'VU', dial: '+678' },
  { name: 'Vatican City', code: 'VA', dial: '+379' },
  { name: 'Venezuela', code: 'VE', dial: '+58' },
  { name: 'Vietnam', code: 'VN', dial: '+84' },
  { name: 'Yemen', code: 'YE', dial: '+967' },
  { name: 'Zambia', code: 'ZM', dial: '+260' },
  { name: 'Zimbabwe', code: 'ZW', dial: '+263' },
]

export const DEFAULT_COUNTRY_CODE = 'RW'

export function getCountryByCode(code) {
  return COUNTRIES.find((c) => c.code === code) ?? null
}

export function getCountryByName(name) {
  return COUNTRIES.find((c) => c.name === name) ?? null
}

// flag picture (Windows does not draw flag emojis, so a small image is used)
export function flagUrl(code, width = 20) {
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`
}

// a few dial codes are shared (+1, +7): this one wins when reading a saved number
const PREFERRED = { '+1': 'US', '+7': 'RU' }
const BY_DIAL_LENGTH = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)

// "+250788123456" -> { code: 'RW', number: '788123456' }
export function splitPhone(full) {
  const digits = String(full ?? '').replace(/[^\d]/g, '')
  if (!digits) return { code: DEFAULT_COUNTRY_CODE, number: '' }
  for (const c of BY_DIAL_LENGTH) {
    const dialDigits = c.dial.slice(1)
    if (digits.startsWith(dialDigits)) {
      const preferred = PREFERRED[c.dial]
      const code = preferred && getCountryByCode(preferred) ? preferred : c.code
      return { code, number: digits.slice(dialDigits.length) }
    }
  }
  return { code: DEFAULT_COUNTRY_CODE, number: digits }
}

// returns a short message when the phone number is not acceptable, else ''
export function phoneProblem(full) {
  const { code, number } = splitPhone(full)
  if (!number) return 'Please enter your phone number.'
  if (code === 'RW' && number.length !== 9) {
    return 'Rwandan numbers have 9 digits after +250, for example 788 123 456.'
  }
  if (number.length < 6 || number.length > 14) return 'Please check your phone number.'
  return ''
}