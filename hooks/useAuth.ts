"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  logout,
  getCurrentUser,
  type User,
  type Profile,
} from "@/services/auth.service"

interface AuthState {
  user: User | null
  profile: Profile | null
  initializing: boolean
  loading: boolean
  error: string | null
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    initializing: true,
    loading: false,
    error: null,
  })

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initializeAuth = async () => {
      try {
        const supabase = createClient()

        // Get current user on mount
        const user = await getCurrentUser()
        setState((prev) => ({
          ...prev,
          user,
          profile: user?.profile || null,
          initializing: false,
        }))

        // Subscribe to auth state changes
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const updatedUser = await getCurrentUser()
            setState((prev) => ({
              ...prev,
              user: updatedUser,
              profile: updatedUser?.profile || null,
              error: null,
            }))
          } else {
            setState((prev) => ({
              ...prev,
              user: null,
              profile: null,
              error: null,
            }))
          }
        })

        unsubscribe = data?.subscription?.unsubscribe
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Error initializing auth",
          initializing: false,
        }))
      }
    }

    initializeAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const handleLogout = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await logout()
      setState({
        user: null,
        profile: null,
        initializing: false,
        loading: false,
        error: null,
      })
      router.push("/")
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Error logging out",
      }))
    }
  }

  return {
    ...state,
    logout: handleLogout,
  }
}
