"use client"

import { Container } from "@/components/shared/Container"
import { Price } from "@/components/shared/Price"
import { RatingStars } from "@/components/shared/RatingStars"
import { ConditionBadge } from "@/components/shared/ConditionBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function UIShowcase() {
  return (
    <main className="min-h-screen bg-background py-12">
      <Container>
        <div className="space-y-16">
          {/* Título */}
          <div className="text-center">
            <h1 className="text-4xl font-bold">MercadoTech UI Components</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Sistema de componentes base para la Sesión 3
            </p>
          </div>

          {/* Price Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Price</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-2">Default</p>
                <Price value={29999} className="text-2xl font-semibold" />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-2">String input</p>
                <Price value="15500" className="text-2xl font-semibold" />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-2">With suffix</p>
                <Price
                  value={49999}
                  className="text-2xl font-semibold"
                  suffix=" COP"
                  currencySymbol=""
                />
              </div>
            </div>
          </section>

          {/* RatingStars Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Rating Stars</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-3">5 stars (full)</p>
                <RatingStars rating={5} showCount count={128} />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-3">3.5 stars (half)</p>
                <RatingStars rating={3.5} showCount count={64} />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-3">2 stars (empty)</p>
                <RatingStars rating={2} showCount count={8} />
              </div>
            </div>
          </section>

          {/* ConditionBadge Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Condition Badge</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <ConditionBadge condition="nuevo" />
              </div>
              <div className="rounded-lg border p-4">
                <ConditionBadge condition="usado" />
              </div>
              <div className="rounded-lg border p-4">
                <ConditionBadge condition="reacondicionado" />
              </div>
              <div className="rounded-lg border p-4">
                <ConditionBadge condition="nuevo" variant="outline" />
              </div>
            </div>
          </section>

          {/* ProductImage Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Product Image</h2>
            <p className="text-sm text-muted-foreground mb-3">
              ProductImage maneja cargas de imágenes, fallbacks y errores. Soporta Next.js Image u HTML img.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border overflow-hidden">
                <div className="w-full h-96 bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-white font-semibold">
                  Imagen cargada exitosamente
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <div className="w-full h-96 bg-red-100 flex flex-col items-center justify-center text-red-700 font-semibold">
                  <AlertCircle size={32} className="mb-2" />
                  Error en la imagen (fallback)
                </div>
              </div>
            </div>
          </section>

          {/* EmptyState Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Empty State</h2>
            <div className="rounded-lg border">
              <EmptyState
                title="Sin productos guardados"
                description="Aún no has guardado ningún producto en tus favoritos. Explora nuestro catálogo para encontrar lo que buscas."
                action={<Button>Ir al catálogo</Button>}
              />
            </div>
          </section>

          {/* ErrorState Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Error State</h2>
            <div className="rounded-lg border">
              <ErrorState
                title="Error al cargar productos"
                description="No pudimos obtener los productos. Por favor, verifica tu conexión."
                details="Network timeout after 30000ms"
                onRetry={() => console.log("Retry clicked")}
              />
            </div>
          </section>

          {/* LoadingState Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Loading State</h2>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold mb-3">List variant</p>
                <div className="rounded-lg border overflow-hidden">
                  <LoadingState variant="list" count={3} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-3">Grid variant</p>
                <LoadingState variant="grid" count={3} />
              </div>
            </div>
          </section>

          {/* Container Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Container</h2>
            <div className="space-y-3">
              <div className="bg-muted">
                <Container>
                  <div className="py-4 text-center">
                    <p>Container with default max-width (2xl)</p>
                  </div>
                </Container>
              </div>
              <div className="bg-muted">
                <Container maxWidth="lg">
                  <div className="py-4 text-center">
                    <p>Container with max-width lg</p>
                  </div>
                </Container>
              </div>
              <div className="bg-muted">
                <Container maxWidth="sm">
                  <div className="py-4 text-center">
                    <p>Container with max-width sm</p>
                  </div>
                </Container>
              </div>
            </div>
          </section>

          {/* Button Component */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Button</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
          </section>

          {/* Theme toggle info */}
          <section className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-300">
              🎨 Tema dinámico disponible
            </p>
            <p className="mt-2 text-blue-800 dark:text-blue-200">
              Este componente respeta prefers-color-scheme. Los colores se adaptan automáticamente a light/dark mode.
            </p>
          </section>
        </div>
      </Container>
    </main>
  )
}
