'use client'

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: number
  name: string
  email: string
  company_id: number
  department: string
  company_name: string
}

type AuthContextType = {
  user: User | null
  role: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const savedUser = localStorage.getItem("user")
    const savedRole = localStorage.getItem("role")

    if (savedUser) setUser(JSON.parse(savedUser))
    if (savedRole) setRole(savedRole)

    setLoading(false)

  }, [])

  const login = async (email: string, password: string) => {

    try {

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await res.json()

      if (data.status) {

        setUser(data.user)
        setRole(data.role)

        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("role", data.role)

        return true
      }

      return false

    } catch (error) {

      console.log("Login Error", error)
      return false

    }

  }

  const logout = () => {

    setUser(null)
    setRole(null)

    localStorage.removeItem("user")
    localStorage.removeItem("role")

  }

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )

}

export function useAuth() {

  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}