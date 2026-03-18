'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from "@/lib/auth-context"

import {
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react'

export function Navbar() {
  const { user } = useAuth()

  const router = useRouter()
    const { logout } = useAuth() // ✅ Hook inside component

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const userEmail = typeof window !== 'undefined' ? user?.name : null

const handleLogout = () => {
  logout()
  router.push('/')
}

  return (
    <nav className="h-16 border-b border-border bg-card flex items-center justify-end px-6 sticky top-0 z-20">
      {/* Profile Section */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
            <User size={20} className="text-primary" />
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">Profile</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {userEmail || 'user@example.com'}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
            >
              <User size={16} />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <div className="border-t border-border my-2" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Backdrop Overlay */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </nav>
  )
}
