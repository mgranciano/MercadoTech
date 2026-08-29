import { ReactNode } from "react"

interface PriceProps {
  value: number | string
  className?: string
  prefix?: ReactNode
  suffix?: ReactNode
  currencySymbol?: string
}

export function Price({
  value,
  className = "",
  prefix,
  suffix,
  currencySymbol = "$",
}: PriceProps) {
  const numValue = Number(value)
  const formatted = numValue.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <span className={className}>
      {prefix}
      {currencySymbol}
      {formatted}
      {suffix}
    </span>
  )
}
