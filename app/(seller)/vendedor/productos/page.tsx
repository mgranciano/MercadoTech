import { EmptyState } from "@/components/shared/EmptyState"
import { Package } from "lucide-react"

export default function SellerProductsPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<Package size={48} />}
        title="Mis productos"
        description="Próximamente — Fase 3.7. Tabla de productos con acciones de editar/eliminar."
      />
    </div>
  )
}
