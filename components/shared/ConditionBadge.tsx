import { cn } from "@/lib/utils"

// products.condition solo admite estos 3 valores (check constraint de
// 0004_create_products_table.sql); antes este mapa usaba claves que nunca
// existen en la base (como_nuevo, usado_bueno, ...) y rompía la página con
// cualquier producto usado o reacondicionado del seed.
type Condition = "nuevo" | "usado" | "reacondicionado"

const conditionMap: Record<Condition, { label: string; bg: string; text: string }> =
  {
    nuevo: { label: "Nuevo", bg: "bg-success/10", text: "text-success" },
    usado: { label: "Usado", bg: "bg-warning/10", text: "text-warning" },
    reacondicionado: { label: "Reacondicionado", bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" },
  }

interface ConditionBadgeProps {
  condition: Condition
  className?: string
  variant?: "default" | "outline"
}

export function ConditionBadge({
  condition,
  className = "",
  variant = "default",
}: ConditionBadgeProps) {
  const config = conditionMap[condition]

  if (variant === "outline") {
    return (
      <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-current", config.text, className)}>
        {config.label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  )
}
