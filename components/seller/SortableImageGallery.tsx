"use client"

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X } from "lucide-react"
import { ProductImage } from "@/components/shared/ProductImage"
import { cn } from "@/lib/utils"

export interface BaseGalleryImage {
  id: string
  url: string
}

interface SortableThumbProps {
  image: BaseGalleryImage
  index: number
  onRemove: (id: string) => void
}

function SortableThumb({ image, index, onRemove }: SortableThumbProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative h-24 w-24 flex-shrink-0 touch-none rounded-md border border-border bg-muted",
        isDragging && "opacity-50"
      )}
    >
      <ProductImage src={image.url} alt={`Imagen ${index + 1}`} fill className="h-full w-full rounded-md" />

      {index === 0 && (
        <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          Portada
        </span>
      )}

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(image.id)
        }}
        aria-label={`Quitar imagen ${index + 1}`}
        className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground hover:bg-destructive hover:text-destructive-foreground"
      >
        <X size={14} />
      </button>
    </div>
  )
}

interface SortableImageGalleryProps<T extends BaseGalleryImage> {
  images: T[]
  onReorder: (newOrder: T[]) => void
  onRemove: (id: string) => void
  onAddFiles: (files: FileList) => void
  maxImages: number
}

export function SortableImageGallery<T extends BaseGalleryImage>({
  images,
  onReorder,
  onRemove,
  onAddFiles,
  maxImages,
}: SortableImageGalleryProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex((img) => img.id === active.id)
    const newIndex = images.findIndex((img) => img.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onReorder(arrayMove(images, oldIndex, newIndex))
  }

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-3">
              {images.map((image, index) => (
                <SortableThumb key={image.id} image={image} index={index} onRemove={onRemove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {images.length < maxImages && (
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
          Agregar imágenes
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddFiles(e.target.files)
              }
              e.target.value = ""
            }}
          />
        </label>
      )}
    </div>
  )
}
