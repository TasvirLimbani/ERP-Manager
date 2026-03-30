// 'use client'

// import { useEffect, useState, ReactNode } from 'react'
// import { useRouter } from 'next/navigation'
// import { Sidebar } from '@/components/layout/sidebar'
// import { Navbar } from '@/components/layout/navbar'
// import { useAuth } from '@/lib/auth-context'

// export default function DashboardLayout({
//   children,
// }: {
//   children: ReactNode
// }) {
//   const router = useRouter()
//   const { user } = useAuth()

//   const [isAuthorized, setIsAuthorized] = useState(false)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (user === undefined) return

//     if (!user?.email) {
//       router.replace('/')
//     } else {
//       setIsAuthorized(true)
//     }

//     setLoading(false)
//   }, [user, router])

//   if (loading) return null
//   if (!isAuthorized) return null

//   return (
//     <div className="flex h-screen bg-background">
//       <Sidebar />

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Navbar />

//         <main className="flex-1 overflow-y-auto">
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// }


'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { useAuth } from '@/lib/auth-context'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

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