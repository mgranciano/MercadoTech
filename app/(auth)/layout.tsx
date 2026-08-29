import { ReactNode } from "react"
import { Zap } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <Zap size={32} className="text-primary" />
            <span className="text-2xl font-bold">MercadoTech</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
