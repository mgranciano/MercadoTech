"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CONDITION_OPTIONS,
  SORT_OPTIONS,
  DEFAULT_PRICE_RANGE,
} from "@/lib/constants/catalog"

interface FiltersPanelProps {
  condition?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  onFilterChange: (filters: {
    condition?: string
    minPrice?: number
    maxPrice?: number
    sort?: "recientes" | "precio_asc" | "precio_desc"
  }) => void
}

export function FiltersPanel({
  condition,
  minPrice = DEFAULT_PRICE_RANGE.min,
  maxPrice = DEFAULT_PRICE_RANGE.max,
  sort = "recientes",
  onFilterChange,
}: FiltersPanelProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    condition ? [condition] : []
  )
  const [selectedSort, setSelectedSort] = useState<
    "recientes" | "precio_asc" | "precio_desc"
  >((sort as "recientes" | "precio_asc" | "precio_desc") || "recientes")
  const [localMinPrice, setLocalMinPrice] = useState(String(minPrice))
  const [localMaxPrice, setLocalMaxPrice] = useState(String(maxPrice))

  const handleConditionToggle = (value: string) => {
    const newConditions = selectedConditions.includes(value)
      ? selectedConditions.filter((c) => c !== value)
      : [value]

    setSelectedConditions(newConditions)
    onFilterChange({
      condition: newConditions[0],
      sort: selectedSort,
      minPrice: localMinPrice ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
    })
  }

  const handleSortChange = (value: string) => {
    const newSort = value as "recientes" | "precio_asc" | "precio_desc"
    setSelectedSort(newSort)
    onFilterChange({
      condition: selectedConditions[0],
      sort: newSort,
      minPrice: localMinPrice ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
    })
  }

  const handlePriceChange = () => {
    onFilterChange({
      condition: selectedConditions[0],
      sort: selectedSort,
      minPrice: localMinPrice ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
    })
  }

  const handleReset = () => {
    setSelectedConditions([])
    setSelectedSort("recientes")
    setLocalMinPrice(String(DEFAULT_PRICE_RANGE.min))
    setLocalMaxPrice(String(DEFAULT_PRICE_RANGE.max))
    onFilterChange({
      condition: undefined,
      sort: "recientes",
      minPrice: undefined,
      maxPrice: undefined,
    })
  }

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border border-border">
      <div>
        <h3 className="font-semibold text-sm mb-3">Ordenar por</h3>
        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={selectedSort === option.value}
                onChange={() => handleSortChange(option.value)}
                className="w-4 h-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-sm mb-3">Estado</h3>
        <div className="space-y-2">
          {CONDITION_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedConditions.includes(option.value)}
                onChange={() => handleConditionToggle(option.value)}
                className="w-4 h-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold text-sm mb-3">Rango de precio</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Mínimo</label>
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-full px-2 py-1 border border-input rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Máximo</label>
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-full px-2 py-1 border border-input rounded text-sm"
            />
          </div>
          <Button
            onClick={handlePriceChange}
            size="sm"
            className="w-full"
            variant="outline"
          >
            Aplicar
          </Button>
        </div>
      </div>

      <div className="border-t pt-4">
        <Button onClick={handleReset} size="sm" variant="ghost" className="w-full">
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}
