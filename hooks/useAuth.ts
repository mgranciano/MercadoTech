"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  logout,
  getCurrentUser,
  subscribeToAuthChanges,
} from "@/services/auth.service"
import type { User, Profile } from "@/types/user"

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
    let active = true

    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!active) return
        setState((prev) => ({
          ...prev,
          user,
          profile: user?.profile || null,
          initializing: false,
        }))
      } catch (error) {
        if (active) {
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : "Error initializing auth",
            initializing: false,
          }))
        }
      }
    }

    initializeAuth()

    const unsubscribe = subscribeToAuthChanges(async (hasSession) => {
      if (!active) return

      if (hasSession) {
        const updatedUser = await getCurrentUser()
        if (active) {
          setState((prev) => ({
            ...prev,
            user: updatedUser,
            profile: updatedUser?.profile || null,
            error: null,
          }))
        }
      } else {
        setState((prev) => ({ ...prev, user: null, profile: null, error: null }))
      }
    })

    return () => {
      active = false
      unsubscribe()
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
