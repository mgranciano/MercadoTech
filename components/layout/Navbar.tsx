import Link from "next/link"
import { Zap } from "lucide-react"
import { SearchBar } from "./SearchBar"
import { CategoriesMenu } from "./CategoriesMenu"
import { CartIndicator } from "./CartIndicator"
import { UserMenu } from "./UserMenu"
import { MobileNav } from "./MobileNav"

interface Category {
  id: string
  name: string
  slug: string
}

interface NavbarProps {
  categories?: Category[]
  cartCount?: number
  user?: { email: string; display_name?: string } | null
  role?: string | null
  onLogout?: () => void
}

export function Navbar({
  categories = [],
  cartCount = 0,
  user = null,
  role = null,
  onLogout,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" data-testid="nav-home-link">
            <Zap size={24} className="text-primary" />
            <span className="hidden sm:inline">MercadoTech</span>
          </Link>

          {/* Search Bar (desktop) */}
          <SearchBar className="hidden md:flex mx-4" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <CategoriesMenu categories={categories} />
            <CartIndicator count={cartCount} variant="desktop" />
            <UserMenu user={user} role={role} onLogout={onLogout} />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-3">
            <CartIndicator count={cartCount} variant="mobile" />
            <MobileNav categories={categories} />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </nav>
  )
}
