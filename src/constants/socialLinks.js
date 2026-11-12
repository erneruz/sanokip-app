// src/constants/socialLinks.js
// The social media places a member can show on their profile.
// To add a platform, add ONE entry here (and one icon in SocialIcon.jsx).
//   kind 'handle'  : the person may type a @name or a full link
//   kind 'phone'   : a phone number (opens WhatsApp)
//   kind 'url'     : a full web address

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', kind: 'handle', base: 'https://www.instagram.com/', placeholder: 'Example: @aline.uwase or the link of your page' },
  { key: 'tiktok', label: 'TikTok', kind: 'handle', base: 'https://www.tiktok.com/@', placeholder: 'Example: @aline.uwase or the link of your page' },
  { key: 'youtube', label: 'YouTube', kind: 'url', placeholder: 'Example: https://www.youtube.com/@your-channel' },
  { key: 'facebook', label: 'Facebook', kind: 'url', placeholder: 'Example: https://www.facebook.com/your.name' },
  { key: 'x', label: 'X (Twitter)', kind: 'handle', base: 'https://x.com/', placeholder: 'Example: @aline_uwase or the link of your page' },
  { key: 'linkedin', label: 'LinkedIn', kind: 'url', placeholder: 'Example: https://www.linkedin.com/in/your-name' },
  { key: 'whatsapp', label: 'WhatsApp', kind: 'phone', placeholder: 'Example: +250788123456' },
  { key: 'website', label: 'Website', kind: 'url', placeholder: 'Example: https://www.your-website.com' },
]

export function getPlatform(key) {
  return SOCIAL_PLATFORMS.find((p) => p.key === key) ?? null
}

const isLink = (v) => /^https?:\/\//i.test(v)

// what the person typed -> a full link ('' when empty, null when it cannot be understood)
export function toSocialUrl(key, raw) {
  const p = getPlatform(key)
  const text = String(raw ?? '').trim()
  if (!p || !text) return ''

  if (p.kind === 'phone') {
    const digits = text.replace(/[^\d]/g, '')
    if (digits.length < 8 || digits.length > 15) return null
    return `https://wa.me/${digits}`
  }

  if (p.kind === 'handle' && !isLink(text) && !text.includes('/') && !/^www\./i.test(text)) {
    const name = text.replace(/^@/, '').replace(/\s+/g, '')
    if (!/^[\w.]{1,60}$/.test(name)) return null
    return `${p.base}${name}`
  }

  // a link: accept "www.site.com/page" and add https://
  const url = isLink(text) ? text : `https://${text.replace(/^\/+/, '')}`
  return /^https?:\/\/[^\s/]+\.[a-z]{2,}(\/\S*)?$/i.test(url) ? url : null
}

// returns a message about the first problem, or '' when everything is fine
export function socialsProblem(socials = {}) {
  for (const p of SOCIAL_PLATFORMS) {
    const value = socials[p.key]
    if (value && toSocialUrl(p.key, value) === null) {
      return p.kind === 'phone'
        ? `The ${p.label} number does not look right. Example: +250788123456`
        : `The ${p.label} link does not look right. Paste the full link of your page.`
    }
  }
  return ''
}

// what gets saved: { instagram: 'https://...', ... } with only the filled places
export function cleanSocials(socials = {}) {
  const out = {}
  for (const p of SOCIAL_PLATFORMS) {
    const url = toSocialUrl(p.key, socials[p.key])
    if (url) out[p.key] = url
  }
  return out
}

// the list shown on the profile: [{ key, label, url, shown }]
export function socialList(socials = {}) {
  return SOCIAL_PLATFORMS.filter((p) => socials?.[p.key]).map((p) => ({
    key: p.key,
    label: p.label,
    url: socials[p.key],
    shown: String(socials[p.key]).replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, ''),
  }))
}