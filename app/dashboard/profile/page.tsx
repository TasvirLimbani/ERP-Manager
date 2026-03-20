'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Mail, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

type Profile = {
  companyName: string
  managerName: string
  email: string
}

export default function ProfilePage() {
  const { user } = useAuth()

  const [profile, setProfile] = useState<Profile>({
    companyName: '',
    managerName: '',
    email: '',
  })

  useEffect(() => {
    if (user) {
      setProfile({
        companyName: user.company_name,   // ✅ correct mapping
        managerName: user.name,
        email: user.email,
      })
    } else {
      const saved = localStorage.getItem('profile')
      if (saved) {
        setProfile(JSON.parse(saved))
      }
    }
  }, [user])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-muted to-slate-200 p-4 ">

      <Card className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/40 backdrop-blur">

        {/* Header */}
        <div className="h-32 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />

        <CardContent className="p-6 -mt-16 space-y-6">

          {/* Avatar */}
           <div className="flex flex-col items-center">
            <div className="h-10 w-10">
              <Avatar className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <AvatarFallback className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>  
          {/* </div> */}

            <h2 className="mt-4 text-2xl font-semibold">
              {profile.managerName || 'Manager Name'}
            </h2>

            <p className="text-sm text-muted-foreground">
              {profile.companyName || 'Company Name'}
            </p>
          </div>

          {/* Info */}
          <div className="space-y-4">

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur border">
              <Building2 size={20} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm font-semibold">
                  {profile.companyName || 'Not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur border">
              <User size={20} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Manager</p>
                <p className="text-sm font-semibold">
                  {profile.managerName || 'Not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur border">
              <Mail size={20} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-semibold break-all">
                  {profile.email || 'Not available'}
                </p>
              </div>
            </div>

          </div>

        </CardContent>
      </Card>
    </div>
  )
}