'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
    <nav className="
  h-16 border-b border-border bg-card
  flex items-center px-6
  fixed top-0 left-0 right-0 md:static z-20
">
      {/* LEFT (empty for balance) */}
      <div className="flex-1" />

      {/* CENTER (Company Name) */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-primary truncate">
          {user?.company_name || 'Your Company'}
        </h1>
      </div>

      {/* RIGHT (Profile) */}
      <div className="flex-1 flex justify-end">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="h-10 w-10">
              <Avatar className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <AvatarFallback className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
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

          {/* Dropdown stays same */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  router.push('/dashboard/profile')
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary/50"
              >
                <User size={16} />
                My Profile
              </button>

              <div className="border-t border-border my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}

          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </div>
      </div>
    </nav>
  )
}
