"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthTabs } from "@/components/auth/AuthTabs"
import { LoginForm } from "@/components/auth/LoginForm"
import { login } from "@/services/auth.service"
import type { LoginInput } from "@/lib/validators/auth"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = async (credentials: LoginInput) => {
    setLoading(true)
    setError(undefined)

    try {
      await login(credentials.email, credentials.password)
      const redirectTo = searchParams.get("redirectTo") || "/"
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ingresar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AuthTabs active="login" />
      <h1 className="mb-1.5 text-[25px] font-extrabold tracking-tighter">Bienvenido de vuelta</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ingresa para ver tus pedidos, favoritos y recomendaciones.
      </p>
      <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  )
}
