'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, Zap, CheckCircle } from 'lucide-react'
import { storage } from '@/lib/storage'
import type { DashboardStats } from '@/lib/types'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from '@/lib/auth-context'


export interface YarnStock {
  total_yarn_stock: string
}

export interface YarnTypesCount {
  total_yarn_types: number
}

export interface YarnType {
  yarn_type: string
  stock: string
  waste: string
}

export interface WeightLoss {
  total_weight_loss: string
}

export interface ProductionChart {
  date: string
  total_output: string
}

export interface DashboardData {
  total_yarn_stock: YarnStock
  total_yarn_types: YarnTypesCount
  yarn_types: YarnType[]
  low_stock_alert: YarnType[]
  weight_loss: WeightLoss
  production_chart_7_days: ProductionChart[]
}

export interface DashboardResponse {
  status: boolean
  data: DashboardData
}
export default function DashboardPage() {

  const [stats, setStats] = useState<DashboardStats>({
    totalYarn: 0,
    totalProduction: 0,
    averageTPM: 0,
    completedBatches: 0,
  })
  const [CHART_DATA, setChartData] = useState<{ name: string; production: number; target: number }[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const safeNumber = (value: string | number | null | undefined) => {
    return Math.floor(Number(value ?? 0))
  }
  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard?company_id=${user?.company_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setDashboardData(data.data)
          const chartData = data.data.production_chart_7_days.map((item: ProductionChart) => ({
            name: item.date,
            production: parseInt(item.total_output),
            target: 1000, // Example target value, replace with actual target if available
          }))
          setChartData(chartData)
          setLoading(false)
        } else {
          console.error('Failed to fetch dashboard stats:', data.message)
        }
      })
      .catch(error => {
        console.error('Error fetching dashboard stats:', error)
      })
  }, []),
    useEffect(() => {
      const yarnData = storage.yarn.getAll()
      const tpmData = storage.tpm.getAll()
      const dyeingData = storage.dyeing.getAll()

      setStats({
        totalYarn: yarnData.length > 0 ? yarnData.reduce((sum, item) => sum + Number(item.weight), 0) : 0,
        totalProduction: dyeingData.length,
        averageTPM: tpmData.length > 0
          ? Math.round(tpmData.reduce((sum, item) => sum + item.tpmValue, 0) / tpmData.length)
          : 0,
        completedBatches: dyeingData.filter(d => d.batch).length,
      })
    }, [])

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-[300px] w-full" />
          </Card>

          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </Card>
        </div>

      </div>
    )
  }
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Production overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Yarn</p>
              <p className="text-3xl font-bold text-foreground">
                {safeNumber(dashboardData?.total_yarn_stock?.total_yarn_stock)}
              </p>              <p className="text-xs text-muted-foreground mt-2">kg in stock</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Yarn Types</p>
              <p className="text-3xl font-bold text-foreground">{dashboardData?.total_yarn_types.total_yarn_types}</p>
              <p className="text-xs text-muted-foreground mt-2">Yarn Types</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Low Stock Alert</p>
              <p className="text-3xl font-bold text-foreground">
                <p className="text-3xl font-bold text-foreground">
                  {(dashboardData?.low_stock_alert?.length ?? 0) === 0
                    ? "0"
                    : dashboardData?.low_stock_alert?.[0]?.yarn_type ?? "0"}
                </p>              </p>              <p className="text-xs text-muted-foreground mt-2">Yarn Types</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Weight Loss</p>
              <p className="text-3xl font-bold text-foreground">


                {safeNumber(dashboardData?.weight_loss?.total_weight_loss)}
              </p>              <p className="text-xs text-muted-foreground mt-2">kg this month</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trend */}
        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Production Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.75rem'
                }}
              />
              <Area type="monotone" dataKey="production" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorProduction)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Production vs Target */}
        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Yarn Type & Weight
          </h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Yarn Type</TableHead>
                <TableHead className="text-left">Stock (kg)</TableHead>
                <TableHead className="text-left">Waste (kg)</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(dashboardData?.yarn_types?.length ?? 0) > 0 ? (
                dashboardData!.yarn_types!.map((yarn, index) => (
                  <TableRow key={index}>
                    <TableCell>{yarn.yarn_type}</TableCell>
                    <TableCell>{Number(yarn.stock).toFixed(0)} kg</TableCell>
                    <TableCell>{Number(yarn.waste).toFixed(0)} kg</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No Yarn Data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
