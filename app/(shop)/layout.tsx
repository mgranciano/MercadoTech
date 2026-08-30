"use client"

import { ReactNode, Suspense } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Container } from "@/components/shared/Container"
import { AIChatbot } from "@/components/shared/AIChatbot"
import { useAuth } from "@/hooks/useAuth"
import { useCategories } from "@/hooks/useCategories"
import { useCart } from "@/hooks/useCart"

function ShopNavbar() {
  const { user, profile, logout } = useAuth()
  const { categories } = useCategories()
  const { count } = useCart(profile?.id)

  return (
    <Navbar
      categories={categories}
      cartCount={count}
      user={user ? { email: user.email, display_name: profile?.display_name ?? undefined } : null}
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
      <AIChatbot />
    </>
  )
}
