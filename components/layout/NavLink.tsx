"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "transition-colors",
        isActive
          ? "text-primary font-semibold"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </Link>
  )
}
