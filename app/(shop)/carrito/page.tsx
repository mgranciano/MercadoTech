import { EmptyState } from "@/components/shared/EmptyState"
import { ShoppingCart } from "lucide-react"

export default function CartPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<ShoppingCart size={48} />}
        title="Carrito de compras"
        description="Próximamente — Fase 3.6. Revisión de carrito y checkout."
      />
    </div>
  )
}
