"use client"

import { useState } from "react"
import { Package, PlusCircle, ShoppingCart, Menu, X } from "lucide-react"
import { NavLink } from "./NavLink"

const LINKS = [
  { href: "/vendedor/productos", label: "Mis productos", icon: Package },
  { href: "/vendedor/publicar", label: "Publicar producto", icon: PlusCircle },
  { href: "/vendedor/pedidos", label: "Pedidos", icon: ShoppingCart },
]

export function SellerSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* El sidebar completo solo cabe desde md: en mobile, una barra con
          menú desplegable da acceso a las mismas rutas. */}
      <div className="flex items-center justify-between border-b border-border bg-card p-4 md:hidden">
        <h2 className="text-lg font-bold">Panel de Vendedor</h2>
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          className="rounded-md p-2 hover:bg-muted"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-b border-border bg-card p-4 md:hidden">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-md px-4 py-2 hover:bg-muted transition-colors"
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}

      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Panel de Vendedor</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors"
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
