'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getUserTransactions } from '@/lib/transactions'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowUpIcon, ArrowDownIcon, MoreHorizontal, Eye } from 'lucide-react'

interface Transaction {
  id: string
  type: 'expense' | 'income'
  amount: number
  description: string
  transaction_date: string
  categories: {
    name: string
    color: string
    icon: string | null
  } | null
  payment_methods: {
    name: string
    type: string
  } | null
}

interface RecentTransactionsProps {
  refreshTrigger?: number
}

export function RecentTransactions({ refreshTrigger }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentTransactions()
  }, [refreshTrigger])

  const loadRecentTransactions = async () => {
    setLoading(true)
    try {
      const { data, error } = await getUserTransactions({
        page: 1,
        limit: 10
      })

      if (error) {
        console.error('Error loading transactions:', error)
        return
      }

      if (data) {
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error loading recent transactions:', error)
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

  const formatRelativeDate = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), {
        addSuffix: true,
        locale: es
      })
    } catch {
      return new Date(dateString).toLocaleDateString('es-AR')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>
              {transactions.length === 0
                ? "No hay transacciones registradas"
                : `Últimas ${transactions.length} transacciones`
              }
            </CardDescription>
          </div>
          {transactions.length > 0 && (
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver todas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">💳</div>
            <p className="text-sm">Aún no has registrado ninguna transacción</p>
            <p className="text-xs mt-1">Usa el botón + para agregar tu primera transacción</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Transaction Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {transaction.description}
                      </span>
                      {transaction.categories && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: transaction.categories.color + '20',
                            color: transaction.categories.color
                          }}
                        >
                          {transaction.categories.icon} {transaction.categories.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(transaction.transaction_date)}
                      </span>
                      {transaction.payment_methods && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {transaction.payment_methods.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center space-x-2">
                  <div className={`text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    <div className="font-semibold">
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}