import { supabase } from '../supabase'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  // No row yet for this user — return a minimal shape instead of throwing,
  // so the edit modal has something sane to work with.
  return data ?? { id: userId, first_name: '', last_name: '', email: '', phone: '', bio: '', academic_profile: '', experience: '', avatar_url: null }
}

export async function updateProfile(userId, updates) {
  // Only send editable fields — never let stray keys like created_at overwrite anything.
  const { first_name, last_name, email, phone, bio, academic_profile, experience, avatar_url } = updates

  const payload = {
    id: userId,
    first_name,
    last_name,
    email,
    phone,
    bio,
    academic_profile,
    experience,
    ...(avatar_url !== undefined ? { avatar_url } : {}),
    updated_at: new Date().toISOString(),
  }

  // upsert: creates the row if it doesn't exist yet, updates it if it does.
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadAvatar(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage.from('avatars').upload(fileName, file)
  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
  return data.publicUrl
}