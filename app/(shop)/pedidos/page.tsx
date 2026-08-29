import { EmptyState } from "@/components/shared/EmptyState"
import { Package } from "lucide-react"

export default function OrdersPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<Package size={48} />}
        title="Mis pedidos"
        description="Próximamente — Fase 3.6. Historial de pedidos como comprador."
      />
    </div>
  )
}
