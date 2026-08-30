"use client"

import { useState } from "react"
import Link from "next/link"
import { Package } from "lucide-react"
import { ProductImage } from "@/components/shared/ProductImage"
import { Price } from "@/components/shared/Price"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { cn } from "@/lib/utils"
import type { SellerProduct } from "@/types/seller"

interface ProductsTableProps {
  products: SellerProduct[]
  onToggleActive: (productId: string, isActive: boolean) => Promise<void>
  onDelete: (productId: string) => Promise<void>
}

export function ProductsTable({ products, onToggleActive, onDelete }: ProductsTableProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package size={48} />}
        title="Todavía no publicaste productos"
        description="Crea tu primer anuncio para empezar a vender."
        action={
          <Link href="/vendedor/publicar">
            <Button variant="outline">Publicar producto</Button>
          </Link>
        }
      />
    )
  }

  const handleConfirmDelete = async (id: string) => {
    setDeleteError(null)
    try {
      await onDelete(id)
      setConfirmingId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "No se pudo eliminar el producto.")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Producto</th>
              <th className="px-4 py-2 font-medium">Precio</th>
              <th className="px-4 py-2 font-medium">Stock</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {product.image_url && (
                        <ProductImage
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="h-full w-full"
                        />
                      )}
                    </div>
                    <span className="font-medium">{product.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Price value={product.price} />
                </td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      product.is_active
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {product.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {confirmingId === product.id ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleConfirmDelete(product.id)}
                      >
                        Confirmar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Link href={`/vendedor/productos/${product.id}/editar`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleActive(product.id, !product.is_active)}
                      >
                        {product.is_active ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeleteError(null)
                          setConfirmingId(product.id)
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
