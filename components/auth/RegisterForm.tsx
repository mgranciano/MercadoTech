"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { validateRegister, type RegisterInput } from "@/lib/validators/auth"

interface RegisterFormProps {
  onSubmit: (input: RegisterInput) => Promise<void>
  loading?: boolean
  error?: string
}

export function RegisterForm({ onSubmit, loading = false, error }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    displayName: "",
    role: "buyer",
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    const errors = validateRegister(formData)
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
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          Nombre
        </label>
        <input
          id="displayName"
          type="text"
          value={formData.displayName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, displayName: e.target.value }))
          }
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        {validationErrors.displayName && (
          <p className="text-xs text-destructive mt-1">{validationErrors.displayName}</p>
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

      <div>
        <label className="block text-sm font-medium mb-2">¿Qué quieres hacer?</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors" style={{borderColor: formData.role === 'buyer' ? 'var(--primary)' : undefined}}>
            <input
              type="radio"
              name="role"
              value="buyer"
              checked={formData.role === "buyer"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value as "buyer" | "seller",
                }))
              }
              disabled={loading}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium text-sm">Quiero comprar</div>
              <div className="text-xs text-muted-foreground">
                Explora nuestro catálogo y compra productos
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors" style={{borderColor: formData.role === 'seller' ? 'var(--primary)' : undefined}}>
            <input
              type="radio"
              name="role"
              value="seller"
              checked={formData.role === "seller"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value as "buyer" | "seller",
                }))
              }
              disabled={loading}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium text-sm">Quiero vender</div>
              <div className="text-xs text-muted-foreground">
                Publica productos y gestiona pedidos
              </div>
            </div>
          </label>
        </div>
        {validationErrors.role && (
          <p className="text-xs text-destructive mt-1">{validationErrors.role}</p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Ingresar
        </Link>
      </p>
    </form>
  )
}
