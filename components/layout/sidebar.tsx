'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Shirt,
  Zap,
  Palette,
  Wind,
  Package,
  Boxes,
  Menu,
  X,
  LogOut,
  IndianRupee
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Yarn', href: '/dashboard/yarn', icon: Shirt },
  { name: 'TPM', href: '/dashboard/tpm', icon: Zap },
  { name: 'Dyeing', href: '/dashboard/dyeing', icon: Palette },
  { name: 'Conning', href: '/dashboard/conning', icon: Wind },
  { name: 'Packing', href: '/dashboard/packing', icon: Package },
  { name: 'Stock', href: '/dashboard/stock', icon: Boxes },
  // { name: 'Selling', href: '/dashboard/selling', icon: IndianRupee },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()


  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <>
      {/* Mobile Menu Button */}
    {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border
        transition-transform duration-300 md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border row flex">
          <img
            src="/logo.png"
            alt="Fair Logo"
            className="w-13 h-12"
          />
          <div className='col-flex ml-1'>

            <h1 className="text-2xl font-bold text-sidebar-primary">Radhe ERP</h1>
            <p className="text-[10px] text-sidebar-foreground/60">Enterprise Resource Planning</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200 text-left text-sm font-medium
                    ${isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/30'
                    }
                  `}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{item.name}</span>
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div>
          <div className="p-4 border-t border-sidebar-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-sidebar-accent/20 hover:bg-sidebar-accent/40 text-sidebar-foreground border-sidebar-border gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
          <p className="text-[8px] text-sidebar-foreground/60 text-center">
            V 1.0.0 - 2026
          </p>
          <a href="http://radhesoftwaresolutions.soon.it" target="_blank" rel="noopener noreferrer">
            <p className="text-[8px] text-sidebar-foreground/60 text-center mb-2">
              Designed and managed by Radhe Software Solutions
            </p>
          </a>
        </div>
      </aside>
    </>
  )
}
