"use client"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <Label htmlFor="email" className="mb-1.5 block text-xs font-bold">
          Correo electrónico
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@correo.com"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          disabled={loading}
          className="h-12 rounded-xl"
          data-testid="auth-email"
        />
        {validationErrors.email && (
          <p className="mt-1 text-xs text-destructive">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="mb-1.5 block text-xs font-bold">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          disabled={loading}
          className="h-12 rounded-xl"
          data-testid="auth-password"
        />
        {validationErrors.password && (
          <p className="mt-1 text-xs text-destructive">{validationErrors.password}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="h-[50px] w-full rounded-xl bg-gradient-to-r from-ai-cyan via-primary to-accent text-base font-extrabold text-white shadow-[0_10px_26px_rgba(11,79,214,.3)] transition hover:-translate-y-0.5"
        data-testid="auth-submit"
      >
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  )
}
