"use client"

import { FormEvent, useState } from "react"
import { ShoppingBag, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { validateRegister, type RegisterInput } from "@/lib/validators/auth"

interface RegisterFormProps {
  onSubmit: (input: RegisterInput) => Promise<void>
  loading?: boolean
  error?: string
}

const ROLES = [
  {
    value: "buyer" as const,
    icon: ShoppingBag,
    title: "Quiero comprar",
    description: "Explora el catálogo y compra con seguimiento de pedidos.",
  },
  {
    value: "seller" as const,
    icon: Store,
    title: "Quiero vender",
    description: "Publica productos y gestiona tus pedidos.",
  },
]

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
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <Label htmlFor="displayName" className="mb-1.5 block text-xs font-bold">
          Nombre completo
        </Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Ana Rivera"
          value={formData.displayName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, displayName: e.target.value }))
          }
          disabled={loading}
          className="h-12 rounded-xl"
        />
        {validationErrors.displayName && (
          <p className="mt-1 text-xs text-destructive">{validationErrors.displayName}</p>
        )}
      </div>

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
        />
        {validationErrors.password && (
          <p className="mt-1 text-xs text-destructive">{validationErrors.password}</p>
        )}
      </div>

      <div>
        <Label className="mb-2.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
          ¿Cómo quieres empezar?
        </Label>
        <RadioGroup
          value={formData.role}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, role: value as "buyer" | "seller" }))
          }
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {ROLES.map(({ value, icon: Icon, title, description }) => {
            const active = formData.role === value
            return (
              <Label
                key={value}
                htmlFor={`role-${value}`}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 text-left font-normal transition hover:-translate-y-0.5",
                  "focus-within:ring-2 focus-within:ring-ai-cyan focus-within:ring-offset-2 focus-within:ring-offset-background",
                  active
                    ? "border-accent bg-gradient-to-br from-ai-cyan/10 to-accent/10"
                    : "border-border bg-card"
                )}
              >
                <RadioGroupItem
                  value={value}
                  id={`role-${value}`}
                  disabled={loading}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    active
                      ? "bg-gradient-to-br from-ai-cyan to-accent text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon size={18} />
                </span>
                <span className="text-[14.5px] font-extrabold tracking-tight">{title}</span>
                <span className="text-[11.5px] leading-snug text-muted-foreground">
                  {description}
                </span>
                {active && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-ai-cyan to-accent text-[11px] text-white">
                    ✓
                  </span>
                )}
              </Label>
            )
          })}
        </RadioGroup>
        {validationErrors.role && (
          <p className="mt-1 text-xs text-destructive">{validationErrors.role}</p>
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
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  )
}
