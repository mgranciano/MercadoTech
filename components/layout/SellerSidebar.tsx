import { Package, ShoppingCart } from "lucide-react"
import { NavLink } from "./NavLink"

export function SellerSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold">Panel de Vendedor</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          href="/vendedor/productos"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors"
        >
          <Package size={20} />
          <span>Mis productos</span>
        </NavLink>

        <NavLink
          href="/vendedor/publicar"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors"
        >
          <Package size={20} />
          <span>Publicar producto</span>
        </NavLink>

        <NavLink
          href="/vendedor/pedidos"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors"
        >
          <ShoppingCart size={20} />
          <span>Pedidos</span>
        </NavLink>
      </nav>
    </aside>
  )
}
