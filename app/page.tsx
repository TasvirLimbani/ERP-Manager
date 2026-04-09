'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {

  const router = useRouter()
  const { login, user, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {

    if (!loading && user) {
      router.replace('/dashboard')
    }

  }, [user, loading, router])

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault()
    setIsLoading(true)
    setError("")

    const success = await login(email, password)

    if (success) {
      router.replace("/dashboard")
    } else {
      setError("Login Failed")
    }

    setIsLoading(false)

  }

  // 🚀 IMPORTANT FIX
  if (loading || user) return null

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-lg border border-border/50 backdrop-blur-sm bg-card/95">

        <div className="p-8">

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-foreground">Radhe ERM Manager</h1>
            <p className="text-sm text-muted-foreground">
              Yarn Factory Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>

              <Input
                type="email"
                placeholder="admin@fairmethod.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>

              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

          </form>

        </div>

      </Card>

    </main>
  )
}