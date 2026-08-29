"use client"

import Link from "next/link"
import { User, LogOut, Heart, Package, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  user?: { email: string; display_name?: string } | null
  role?: string | null
  onLogout?: () => void
  className?: string
}

export function UserMenu({ user, role, onLogout, className }: UserMenuProps) {
  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" className="gap-2">
          <User size={18} />
          Ingresar
        </Button>
      </Link>
    )
  }

  return (
    <div className={cn("relative group", className)}>
      <Button variant="ghost" className="gap-2">
        <User size={18} />
        <span className="max-w-[100px] truncate">{user.display_name || "Usuario"}</span>
      </Button>
      <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="bg-card border border-border rounded-md shadow-lg p-1">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b">
            {user.email}
          </div>

          <Link
            href="/pedidos"
            className="flex gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
          >
            <Package size={16} />
            Mis pedidos
          </Link>

          <Link
            href="/favoritos"
            className="flex gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
          >
            <Heart size={16} />
            Favoritos
          </Link>

          {(role === "seller" || role === "admin") && (
            <Link
              href="/vendedor/productos"
              className="flex gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors border-t"
            >
              <Store size={16} />
              Panel vendedor
            </Link>
          )}

          <button
            onClick={onLogout}
            className="w-full flex gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors border-t text-destructive hover:text-destructive"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
