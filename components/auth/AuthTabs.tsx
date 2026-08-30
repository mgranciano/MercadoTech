"use client"

import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AuthTabsProps {
  active: "login" | "register"
}

// Solo navegación entre /login y /register (sin lógica de negocio ni
// Supabase): cada ruta sigue siendo la dueña de su propio formulario.
export function AuthTabs({ active }: AuthTabsProps) {
  const router = useRouter()

  return (
    <Tabs
      value={active}
      onValueChange={(value) => router.push(value === "login" ? "/login" : "/register")}
      className="mb-6"
    >
      <TabsList className="h-auto w-full gap-1 rounded-xl bg-muted p-1.5">
        <TabsTrigger
          value="login"
          className="flex-1 rounded-lg py-2.5 text-[13.5px] font-semibold data-[state=active]:font-extrabold"
        >
          Ingresar
        </TabsTrigger>
        <TabsTrigger
          value="register"
          className="flex-1 rounded-lg py-2.5 text-[13.5px] font-semibold data-[state=active]:font-extrabold"
        >
          Crear cuenta
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
