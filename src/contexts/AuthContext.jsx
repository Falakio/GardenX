import { createContext, useContext, useState, useEffect } from 'react'
import { CircularProgress, Box } from '@mui/material'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Check active sessions and sets the user
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (mounted) {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkUser()

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,
    isAdmin: user?.email?.endsWith('@gemsdaa.net') || false,
  }

  // Only show loading indicator for initial auth check
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
