import { EmptyState } from "@/components/shared/EmptyState"
import { Package } from "lucide-react"

export default function OrderDetailPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<Package size={48} />}
        title="Detalle de pedido"
        description="Próximamente — Fase 3.6. Detalles y estado del pedido."
      />
    </div>
  )
}
