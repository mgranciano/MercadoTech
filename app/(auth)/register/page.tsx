"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthTabs } from "@/components/auth/AuthTabs"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { register } from "@/services/auth.service"
import type { RegisterInput } from "@/lib/validators/auth"

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = async (input: RegisterInput) => {
    setLoading(true)
    setError(undefined)

    try {
      await register(input)
      const redirectTo = searchParams.get("redirectTo") || "/"
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AuthTabs active="register" />
      <h1 className="mb-1.5 text-[25px] font-extrabold tracking-tighter">Crea tu cuenta</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Dos minutos y empiezas a comprar o vender con MercadoTech.
      </p>
      <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  )
}
