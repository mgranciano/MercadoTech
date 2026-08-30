"use client"

import { ReactNode, Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { SellerSidebar } from "@/components/layout/SellerSidebar"
import { Container } from "@/components/shared/Container"
import { useAuth } from "@/hooks/useAuth"

export default function SellerLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, profile, initializing, logout } = useAuth()

  useEffect(() => {
    if (!initializing && profile && !["seller", "admin"].includes(profile.role)) {
      router.push("/")
    }
  }, [profile, initializing, router])

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!profile || !["seller", "admin"].includes(profile.role)) {
    return null
  }

  return (
    <>
      <Suspense fallback={null}>
        <Navbar
          categories={[]}
          cartCount={0}
          user={{ email: user?.email ?? "", display_name: profile.display_name ?? undefined }}
          role={profile.role}
          onLogout={logout}
        />
      </Suspense>
      <div className="flex flex-1 flex-col md:flex-row">
        <SellerSidebar />
        <main className="flex-1 overflow-auto">
          <Container>{children}</Container>
        </main>
      </div>
    </>
  )
}
