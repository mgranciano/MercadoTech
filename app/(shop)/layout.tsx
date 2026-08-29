"use client"

import { ReactNode, Suspense } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Container } from "@/components/shared/Container"
import { useAuth } from "@/hooks/useAuth"
import { useCategories } from "@/hooks/useCategories"

function ShopNavbar() {
  const { user, profile, logout } = useAuth()
  const { categories } = useCategories()

  return (
    <Navbar
      categories={categories}
      cartCount={0}
      user={user}
      role={profile?.role}
      onLogout={logout}
    />
  )
}

function ShopNavbarWrapper() {
  return (
    <Suspense fallback={null}>
      <ShopNavbar />
    </Suspense>
  )
}

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ShopNavbarWrapper />
      <main className="flex-1">
        <Container>{children}</Container>
      </main>
      <footer className="border-t border-border bg-card mt-12">
        <Container>
          <div className="py-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MercadoTech. Todos los derechos reservados.</p>
          </div>
        </Container>
      </footer>
    </>
  )
}
