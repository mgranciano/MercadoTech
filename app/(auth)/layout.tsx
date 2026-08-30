import { ReactNode } from "react"
import Link from "next/link"
import { Zap } from "lucide-react"

const STATS: [string, string][] = [
  ["+15", "categorías"],
  ["4.8★", "satisfacción"],
  ["100%", "compra protegida"],
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      {/* Panel de marca — solo desktop, siempre oscuro (no depende del tema) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,#07173d,#0b4fd6_55%,#4c1bc4)] p-14 lg:flex">
        <div className="absolute -bottom-36 -right-20 h-96 w-96 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.45),transparent_66%)]" />

        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ai-cyan to-accent text-white">
            <Zap size={24} />
          </span>
          <span className="leading-tight">
            <span className="block text-xl font-extrabold tracking-tight text-white">MercadoTech</span>
            <span className="block font-mono text-[10px] uppercase tracking-[.15em] text-[#8fb6ff]">
              marketplace · ia
            </span>
          </span>
        </Link>

        <div className="relative max-w-[30ch]">
          <h2 className="mb-3.5 text-pretty text-4xl font-extrabold leading-tight tracking-tighter text-white">
            Compra y vende tecnología con un copiloto de IA.
          </h2>
          <p className="text-[15px] leading-relaxed text-[#c2d3f0]">
            Recomendaciones personalizadas, seguimiento de pedidos en tiempo real y
            soporte con un asistente entrenado en tu catálogo.
          </p>
        </div>

        <div className="relative flex gap-7">
          {STATS.map(([value, statLabel]) => (
            <div key={statLabel}>
              <div className="text-[22px] font-extrabold text-[#7deaff]">{value}</div>
              <div className="text-xs text-[#9fb6dd]">{statLabel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel del formulario */}
      <div className="flex items-center justify-center bg-background px-5 py-10 lg:px-10">
        <div className="w-full max-w-[430px]">
          <Link href="/" className="mb-6 flex flex-col items-center gap-3 lg:hidden">
            <span className="flex h-[60px] w-[60px] items-center justify-center rounded-[19px] bg-gradient-to-br from-primary via-accent to-ai-cyan text-white shadow-[0_12px_30px_rgba(11,79,214,.35)]">
              <Zap size={28} />
            </span>
            <span className="text-center">
              <span className="block text-xl font-extrabold tracking-tighter">MercadoTech</span>
              <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[.15em] text-muted-foreground">
                marketplace · ia
              </span>
            </span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
