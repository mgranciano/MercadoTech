import { EmptyState } from "@/components/shared/EmptyState"
import { ShoppingCart } from "lucide-react"

export default function SellerOrdersPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<ShoppingCart size={48} />}
        title="Pedidos"
        description="Próximamente — Fase 3.7. Kanban con pedidos en estados: pendiente, enviado, entregado, cancelado."
      />
    </div>
  )
}
