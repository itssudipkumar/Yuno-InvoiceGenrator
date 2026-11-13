import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../utils/supabase'

export interface BusinessInfo {
  name:string; abn:string; email:string; phone:string; address:string
  logo?:string; bsb?:string; accountNumber?:string; accountName?:string; bankName?:string; website?:string
}
export interface User {
  id:string; email:string; businessInfo:BusinessInfo; invoiceDesign:string; createdAt:string
}
interface AuthCtx {
  user:User|null
  loading:boolean
  error:string
  recovering:boolean
  recoveryError:string
  retry:()=>void
  login:(email:string,password:string)=>Promise<void>
  register:(email:string,password:string,biz:string)=>Promise<void>
  logout:()=>Promise<void>
  updateUser:(user:User)=>Promise<void>
  updateEmail:(email:string)=>Promise<void>
  updatePassword:(current:string,password:string)=>Promise<void>
  requestReset:(email:string)=>Promise<void>
  resetPassword:(password:string)=>Promise<void>
  cancelRecovery:()=>Promise<void>
}
const Ctx = createContext<AuthCtx|null>(null)
const recoveryKey = 'yuno_password_recovery'
const configurationError = 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the app.'
const redirectTo = () => window.location.origin
const callbackParams = new URLSearchParams(window.location.hash.slice(1))
let callbackError = callbackParams.get('error_description') || new URLSearchParams(window.location.search).get('error_description')

async function loadProfile(authUser:SupabaseUser):Promise<User> {
  const defaults:BusinessInfo = { name:typeof authUser.user_metadata?.business_name === 'string' ? authUser.user_metadata.business_name : '', abn:'', email:authUser.email || '', phone:'', address:'' }
  let { data, error } = await supabase.from('yuno_profiles').select('business_info, invoice_design').eq('owner_id',authUser.id).maybeSingle()
  if (error) throw error
  if (!data) {
    const inserted = await supabase.from('yuno_profiles').insert({ owner_id:authUser.id, business_info:defaults, invoice_design:'slate' })
    // Another session may have created the profile after the read.
    if (inserted.error && inserted.error.code !== '23505') throw inserted.error
    const result = await supabase.from('yuno_profiles').select('business_info, invoice_design').eq('owner_id',authUser.id).single()
    if (result.error) throw result.error
    data = result.data
  }
  return { id:authUser.id, email:authUser.email || '', createdAt:authUser.created_at,
    businessInfo:{...defaults, ...data.business_info}, invoiceDesign:data.invoice_design || 'slate' }
}

export function AuthProvider({children}:{children:ReactNode}) {
  const [user,setUser] = useState<User|null>(null)
  const [loading,setLoading] = useState(supabaseConfigured)
  const [error,setError] = useState(supabaseConfigured ? '' : configurationError)
  const [recovering,setRecovering] = useState(() => sessionStorage.getItem(recoveryKey) === 'true')
  const [recoveryError,setRecoveryError] = useState('')
  const generation = useRef(0)
  const eventSequence = useRef(0)
  const activeId = useRef<string|null>(null)

  const applySession = useCallback(async (authUser:SupabaseUser|null) => {
    const current = ++generation.current
    activeId.current = authUser?.id || null
    setLoading(true)
    setError('')
    if (!authUser) {
      setUser(null); setLoading(false); return
    }
    if (!authUser.email_confirmed_at) {
      setUser(null); setLoading(false)
      setError('Your email must be verified before signing in. Check your email, or enable email confirmation in Supabase.')
      return
    }
    try {
      const profile = await loadProfile(authUser)
      if (current === generation.current) setUser(profile)
    } catch (e) {
      if (current === generation.current) { setUser(null); setError(e instanceof Error ? e.message : 'Unable to load your cloud profile.') }
    } finally {
      if (current === generation.current) setLoading(false)
    }
  },[])

  const retry = useCallback(() => {
    if (!supabaseConfigured) { setUser(null); setLoading(false); setError(configurationError); return }
    const sequence = ++eventSequence.current
    ++generation.current
    setLoading(true)
    void supabase.auth.getSession().then(({data,error:sessionError}) => {
      if (sequence !== eventSequence.current) return
      if (sessionError) { setUser(null); setError(sessionError.message); setLoading(false); return }
      void applySession(data.session?.user || null)
    }).catch(e => { if (sequence === eventSequence.current) { setError(e instanceof Error ? e.message : 'Unable to restore session.'); setLoading(false) } })
  },[applySession])

  useEffect(() => {
    if (!supabaseConfigured) return
    let mounted = true
    const { data:{subscription} } = supabase.auth.onAuthStateChange((event,session) => {
      if (event === 'PASSWORD_RECOVERY') { sessionStorage.setItem(recoveryKey,'true'); setRecovering(true); setRecoveryError('') }
      if (event === 'TOKEN_REFRESHED' && session?.user.id === activeId.current) return
      if (event === 'USER_UPDATED' && session?.user.id === activeId.current) {
        setUser(previous => previous ? {...previous, email:session.user.email || ''} : previous)
        return
      }
      if (event === 'SIGNED_IN' && session?.user.id === activeId.current) return
      const sequence = ++eventSequence.current
      ++generation.current
      if (!session) activeId.current = null
      // Supabase auth callbacks must not await another Supabase operation.
      window.setTimeout(() => {
        if (!mounted || sequence !== eventSequence.current) return
        if (event === 'INITIAL_SESSION' && callbackError) {
          const message = callbackError
          callbackError = null
          const url = new URL(window.location.href)
          const hash = new URLSearchParams(url.hash.slice(1))
          for (const key of ['error', 'error_code', 'error_description']) { url.searchParams.delete(key); hash.delete(key) }
          url.hash = hash.toString()
          window.history.replaceState(window.history.state, '', url.toString())
          sessionStorage.removeItem(recoveryKey)
          setUser(null); setError(''); setLoading(false); setRecovering(true)
          setRecoveryError(`Authentication link error: ${message}. Request a new link.`)
          return
        }
        if (event === 'INITIAL_SESSION' && !session) {
          retry(); return
        }
        void applySession(session?.user || null)
      },0)
    })
    return () => { mounted = false; ++generation.current; ++eventSequence.current; subscription.unsubscribe() }
  },[applySession,retry])

  const login = async (email:string,password:string) => {
    const {data,error} = await supabase.auth.signInWithPassword({email:email.trim(),password})
    if (error) throw error
    if (!data.user?.email_confirmed_at) { await supabase.auth.signOut(); throw new Error('Please verify your email before signing in.') }
  }
  const register = async (email:string,password:string,biz:string) => {
    const {data,error} = await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:redirectTo(),data:{business_name:biz.trim()}}})
    if (error) throw error
    if (data.session) {
      const {error:signOutError} = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      throw new Error('Email confirmation is not enabled for this Supabase project. Enable it before creating accounts.')
    }
  }
  const logout = async () => {
    if (!supabaseConfigured) throw new Error(configurationError)
    const {error} = await supabase.auth.signOut()
    if (error) throw error
    sessionStorage.removeItem(recoveryKey); setRecovering(false); setRecoveryError('')
  }
  const updateUser = async (updated:User) => {
    if (!user || updated.id !== user.id) throw new Error('Please sign in again.')
    const {data,error} = await supabase.from('yuno_profiles').update({business_info:updated.businessInfo,invoice_design:updated.invoiceDesign}).eq('owner_id',user.id).select('owner_id').single()
    if (error) throw error
    if (!data) throw new Error('Profile was not saved.')
    setUser(previous => previous?.id === updated.id ? {...previous,businessInfo:updated.businessInfo,invoiceDesign:updated.invoiceDesign} : previous)
  }
  const updateEmail = async (email:string) => {
    const {error} = await supabase.auth.updateUser({email:email.trim()},{emailRedirectTo:redirectTo()})
    if (error) throw error
  }
  const updatePassword = async (current:string,password:string) => {
    if (!user) throw new Error('Please sign in again.')
    const {error:signInError} = await supabase.auth.signInWithPassword({email:user.email,password:current})
    if (signInError) throw signInError
    const {error} = await supabase.auth.updateUser({password})
    if (error) throw error
  }
  const requestReset = async (email:string) => {
    const {error} = await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:redirectTo()})
    if (error) throw error
  }
  const resetPassword = async (password:string) => {
    if (!recovering) throw new Error('Open a valid password recovery link first.')
    const {error} = await supabase.auth.updateUser({password})
    if (error) throw error
    sessionStorage.removeItem(recoveryKey); setRecovering(false)
  }
  const cancelRecovery = async () => { await logout() }
  return <Ctx.Provider value={{user,loading,error,recovering,recoveryError,retry,login,register,logout,updateUser,updateEmail,updatePassword,requestReset,resetPassword,cancelRecovery}}>{children}</Ctx.Provider>
}
export const useAuth=()=>{const c=useContext(Ctx);if(!c)throw new Error('useAuth outside AuthProvider');return c}
