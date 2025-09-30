'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTransactionSummary } from '@/lib/transactions'
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'

interface FinancialSummaryProps {
  refreshTrigger?: number
}

export function FinancialSummary({ refreshTrigger }: FinancialSummaryProps) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [refreshTrigger])

  const loadSummary = async () => {
    setLoading(true)
    try {
      // Get current month summary
      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const startDate = firstDayOfMonth.toISOString().split('T')[0]
      const endDate = lastDayOfMonth.toISOString().split('T')[0]

      const { data, error } = await getTransactionSummary(startDate, endDate)

      if (error) {
        console.error('Error loading summary:', error)
        return
      }

      if (data) {
        setSummary(data)
      }
    } catch (error) {
      console.error('Error loading financial summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </p>
        </CardContent>
      </Card>

      {/* Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <Wallet className={`h-4 w-4 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.balance)}
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <Badge variant={summary.balance >= 0 ? "default" : "destructive"} className="text-xs">
              {summary.balance >= 0 ? 'Positivo' : 'Negativo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Ahorro</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {summary.totalIncome > 0
              ? `${Math.round((summary.balance / summary.totalIncome) * 100)}%`
              : '0%'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Del total de ingresos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}