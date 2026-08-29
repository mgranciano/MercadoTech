"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">Crear cuenta en MercadoTech</h1>
      <RegisterForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  )
}
