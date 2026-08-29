"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Ingresar a MercadoTech</h1>
      <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  )
}
