import { EmptyState } from "@/components/shared/EmptyState"
import { Plus } from "lucide-react"

export default function PublishProductPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<Plus size={48} />}
        title="Publicar producto"
        description="Próximamente — Fase 3.7. Formulario para crear nuevo producto."
      />
    </div>
  )
}
