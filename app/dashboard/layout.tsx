'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { useAuth } from '@/lib/auth-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const router = useRouter()
  const { user } = useAuth()   // ✅ FIX: inside component
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const isLoggedIn = user?.email

    if (!isLoggedIn) {
      router.replace('/')
    } else {
      setIsAuthorized(true)
    }

  }, [user, router])

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  )
}