// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const [staffRoles, setStaffRoles] = useState([]) // platform_staff roles of this person
  const [entProfile, setEntProfile] = useState(null) // Peak Star Entertainment profile (or null)
  const [loading, setLoading] = useState(true)

  // loads everything about the logged-in person: Engineering profile,
  // staff roles and Entertainment profile. A failure in one never blocks the others.
  const loadAccount = useCallback(async (sessionUser, isCancelled = () => false) => {
    if (!sessionUser) {
      setRole(null)
      setProfile(null)
      setStaffRoles([])
      setEntProfile(null)
      return
    }

    const [profileRes, staffRes, entRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('role, first_name, last_name, avatar_url')
        .eq('id', sessionUser.id)
        .maybeSingle(),
      supabase.from('platform_staff').select('role').eq('user_id', sessionUser.id),
      supabase.from('ent_profiles').select('*').eq('user_id', sessionUser.id).maybeSingle(),
    ])

    if (isCancelled()) return
    setRole(profileRes.data?.role ?? 'user')
    setProfile(profileRes.data ?? null)
    setStaffRoles((staffRes.data ?? []).map((r) => r.role))
    setEntProfile(entRes.data ?? null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function applySession(session) {
      setUser(session?.user ?? null)
      await loadAccount(session?.user ?? null, () => cancelled)
      if (!cancelled) setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [loadAccount])

  // ── What this person may control ─────────────────────────────
  const has = (r) => staffRoles.includes(r)
  const isSuperAdmin = has('super_admin')

  const can = {
    // Peak Star Engineering admin area (the old "admin" role still works)
    engineering: role === 'admin' || isSuperAdmin || has('engineering_admin'),
    // Entertainment: approve / manage users
    entertainmentUsers:
      isSuperAdmin || has('entertainment_admin') || has('scouting_manager') || has('partner_manager'),
    // Entertainment: review the clips, verify and publish talents, take-downs, consents
    entertainmentScouting: isSuperAdmin || has('entertainment_admin') || has('scouting_manager'),
    // Entertainment: stories, news, videos, publications
    entertainmentContent: isSuperAdmin || has('entertainment_admin') || has('content_manager'),
    // staff roles screen
    staff: isSuperAdmin,
  }
  // any kind of admin / staff
  const isStaff =
    can.engineering || can.entertainmentUsers || can.entertainmentScouting || can.entertainmentContent || can.staff

  const value = {
    user,
    role,
    profile,
    staffRoles,
    entProfile,
    can,
    isStaff,
    isSuperAdmin,
    // kept for the existing code: true for Engineering admins and the Super Admin
    isAdmin: can.engineering,
    loading,
    // reload the Entertainment / staff information after a change
    refreshAccount: () => (user ? loadAccount(user) : Promise.resolve()),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    // extra = additional sign-up information (the Entertainment form uses it),
    // redirectPath = where the confirmation email brings the person back
    signUp: (email, password, firstName, lastName, extra = {}, redirectPath = '/login') =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, ...extra },
          emailRedirectTo: `${window.location.origin}${redirectPath}`,
        },
      }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}