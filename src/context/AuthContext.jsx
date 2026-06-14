import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUser(data.session.user)
        const isVerified = data.session.user.email_confirmed_at !== null
        setEmailVerified(isVerified)
      }
      setLoading(false)
    }

    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          const isVerified = session.user.email_confirmed_at !== null
          setEmailVerified(isVerified)
        } else {
          setEmailVerified(false)
        }
      }
    )

    return () => listener?.subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      })

      if (error) return { error }

      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        coins: 0,
        active_effect: 'none',
        is_vip: false,
        nick_color: '#8B5CF6'
      })

      return { data }
    } catch (err) {
      return { error: err }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) return { error }

      const isVerified = data.user.email_confirmed_at !== null
      setEmailVerified(isVerified)

      return { data, isVerified }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setEmailVerified(false)
  }

  const resendVerificationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })
      return { error }
    } catch (err) {
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerified,
        signUp,
        signIn,
        signOut,
        resendVerificationEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
