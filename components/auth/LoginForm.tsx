"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { validateLogin, type LoginInput } from "@/lib/validators/auth"

interface LoginFormProps {
  onSubmit: (credentials: LoginInput) => Promise<void>
  loading?: boolean
  error?: string
}

export function LoginForm({ onSubmit, loading = false, error }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    const errors = validateLogin(formData)
    if (errors.length > 0) {
      const errorMap = errors.reduce(
        (acc, err) => ({ ...acc, [err.field]: err.message }),
        {}
      )
      setValidationErrors(errorMap)
      return
    }

    try {
      await onSubmit(formData)
    } catch {
      // Error is handled by parent
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        {validationErrors.email && (
          <p className="text-xs text-destructive mt-1">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        {validationErrors.password && (
          <p className="text-xs text-destructive mt-1">{validationErrors.password}</p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Ingresando..." : "Ingresar"}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  )
}
