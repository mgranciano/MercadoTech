"use client"

import { useRef } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/constants/orders"
import { OrderStatus } from "@/lib/constants/roles"
import { OrderKanbanCard } from "./OrderKanbanCard"
import { cn } from "@/lib/utils"
import type { SellerOrder } from "@/types/seller"

const STATUS_DOT: Record<string, string> = {
  [OrderStatus.PENDING]: "bg-warning",
  [OrderStatus.PAID]: "bg-blue-600",
  [OrderStatus.SHIPPED]: "bg-accent",
  [OrderStatus.DELIVERED]: "bg-success",
  [OrderStatus.CANCELLED]: "bg-destructive",
}

interface DraggableCardProps {
  order: SellerOrder
  draggable: boolean
}

function DraggableCard({ order, draggable }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    disabled: !draggable,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div data-testid={`kanban-card-${order.id}`}>
      <div
        ref={setNodeRef}
        style={style}
        data-testid="kanban-card-handle"
        {...(draggable ? attributes : {})}
        {...(draggable ? listeners : {})}
        className={cn(
          "touch-none",
          draggable && "cursor-grab active:cursor-grabbing",
          isDragging && "z-10 opacity-50"
        )}
      >
        <OrderKanbanCard order={order} />
      </div>
    </div>
  )
}

interface KanbanColumnProps {
  status: string
  label: string
  orders: SellerOrder[]
  droppable: boolean
}

function KanbanColumn({ status, label, orders, droppable }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: !droppable })

  return (
    <div
      id={`kanban-col-${status}`}
      data-testid={`kanban-column-${status}`}
      ref={setNodeRef}
      className={cn(
        "flex w-[85vw] max-w-[300px] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-3 sm:w-72 sm:max-w-none",
        isOver && droppable && "border-primary bg-primary/10"
      )}
    >
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[status] ?? "bg-muted-foreground")} />
          <span className="text-[13.5px] font-extrabold tracking-tight">{label}</span>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-card px-1.5 text-[11.5px] font-extrabold">
          {orders.length}
        </span>
      </div>

      <div className="flex min-h-[80px] flex-col gap-2.5">
        {orders.map((order) => (
          <DraggableCard key={order.id} order={order} draggable={droppable} />
        ))}
      </div>
    </div>
  )
}

interface OrdersKanbanProps {
  orders: SellerOrder[]
  onMove: (orderId: string, toStatus: string) => void
}

export function OrdersKanban({ orders, onMove }: OrdersKanbanProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  )

  const columns = ORDER_STATUS_FLOW.map((status) => ({
    status,
    label: ORDER_STATUS_LABELS[status],
    orders: orders.filter((o) => o.status === status),
  }))

  const cancelled = orders.filter((o) => o.status === OrderStatus.CANCELLED)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const orderId = String(active.id)
    const toStatus = String(over.id)
    const order = orders.find((o) => o.id === orderId)
    if (!order || order.status === toStatus) return

    onMove(orderId, toStatus)
  }

  const allColumns = [...columns, { status: OrderStatus.CANCELLED, label: "Cancelado", orders: cancelled }]

  const scrollToColumn = (status: string) => {
    const container = scrollRef.current
    const target = document.getElementById(`kanban-col-${status}`)
    if (!container || !target) return

    // scrollIntoView pelea con scroll-snap-type (el snap la interrumpe a
    // mitad de la animación); ir directo al offset del snap point sí funciona.
    container.scrollTo({ left: target.offsetLeft - container.offsetLeft, behavior: "smooth" })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* Accesos rápidos móviles: saltan a una columna sin desmontar el resto,
          las columnas deben seguir montadas para que dnd-kit permita soltar entre ellas. */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {allColumns.map((col) => (
          <button
            key={col.status}
            type="button"
            onClick={() => scrollToColumn(col.status)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] font-semibold text-muted-foreground"
          >
            <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[col.status] ?? "bg-muted-foreground")} />
            {col.label}
            <span className="font-mono text-[10.5px] opacity-75">{col.orders.length}</span>
          </button>
        ))}
      </div>

      <div ref={scrollRef} data-testid="kanban-board" className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            orders={col.orders}
            droppable
          />
        ))}
        {/* El vendedor no puede cancelar (RLS): columna de solo lectura. */}
        <KanbanColumn
          status={OrderStatus.CANCELLED}
          label="Cancelado"
          orders={cancelled}
          droppable={false}
        />
      </div>
    </DndContext>
  )
}
