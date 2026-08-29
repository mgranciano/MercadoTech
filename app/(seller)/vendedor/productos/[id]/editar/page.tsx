import { EmptyState } from "@/components/shared/EmptyState"
import { Edit } from "lucide-react"

export default function EditProductPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<Edit size={48} />}
        title="Editar producto"
        description="Próximamente — Fase 3.7. Formulario para editar producto con galería drag & drop."
      />
    </div>
  )
}
