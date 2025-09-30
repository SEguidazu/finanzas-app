'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from '@/components/ui/currency-input'
import { toast } from 'sonner'

import { createTransaction, type CreateTransactionData } from '@/lib/transactions'
import { getCategoryTemplates } from '@/lib/categories'
import { getUserPaymentMethods, formatPaymentMethodName, PaymentMethodWithBank } from '@/lib/payment-methods'
import { Calendar, CreditCard, Receipt, Plus } from 'lucide-react'

interface CategoryTemplate {
  template_id: string
  name: string
  color: string
  icon: string | null
  type: string
  sort_order: number
  is_created: boolean
}

interface TransactionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialType?: 'expense' | 'income'
}

export function TransactionForm({
  onSuccess,
  onCancel,
  initialType = 'expense'
}: TransactionFormProps) {
  // Form state
  const [type, setType] = useState<'expense' | 'income'>(initialType)
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')
  const [isDebt, setIsDebt] = useState(false)
  const [installments, setInstallments] = useState(1)
  const [dueDate, setDueDate] = useState('')

  // Data state
  const [categoryTemplates, setCategoryTemplates] = useState<CategoryTemplate[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodWithBank[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Load initial data
  useEffect(() => {
    loadFormData()
  }, [type])

  const loadFormData = async () => {
    setLoadingData(true)

    try {
      // Load category templates based on type
      const { data: templates } = await getCategoryTemplates(type)
      if (templates) {
        setCategoryTemplates(templates)
      }

      // Load payment methods
      const { data: methods } = await getUserPaymentMethods()
      if (methods) {
        setPaymentMethods(methods)
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Error cargando datos del formulario')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (amount <= 0) {
      toast.error('El monto debe ser mayor a cero')
      return
    }

    if (!categoryName) {
      toast.error('Selecciona una categoría')
      return
    }

    if (!description.trim()) {
      toast.error('Agrega una descripción')
      return
    }

    setLoading(true)

    const transactionData: CreateTransactionData = {
      type,
      amount,
      description,
      categoryName,
      paymentMethodId: paymentMethodId || undefined,
      transactionDate,
      notes: notes.trim() || undefined,
      isDebt: type === 'expense' ? isDebt : false,
      installments: isDebt ? installments : undefined,
      dueDate: isDebt && dueDate ? dueDate : undefined
    }

    try {
      const { data, error } = await createTransaction(transactionData)

      if (error) {
        console.error('Transaction creation error:', error)
        toast.error('Error creando transacción', {
          description: error.message || 'Ocurrió un error inesperado'
        })
        return
      }

      if (data) {
        toast.success('¡Transacción creada!', {
          description: `${type === 'expense' ? 'Gasto' : 'Ingreso'} de $${amount.toLocaleString('es-AR')} registrado`
        })

        // Reset form
        resetForm()

        // Callback for parent component
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Error inesperado', {
        description: 'Por favor intenta de nuevo'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount(0)
    setDescription('')
    setCategoryName('')
    setPaymentMethodId('')
    setTransactionDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setIsDebt(false)
    setInstallments(1)
    setDueDate('')
  }

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType)
    setCategoryName('') // Reset category
    setIsDebt(false) // Reset debt options when switching to income
  }

  if (loadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando formulario...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Receipt className="h-5 w-5" />
          <span>Nueva Transacción</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Tipo de Transacción</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                onClick={() => handleTypeChange('expense')}
                className="flex-1"
              >
                📤 Gasto
              </Button>
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                onClick={() => handleTypeChange('income')}
                className="flex-1"
              >
                📥 Ingreso
              </Button>
            </div>
          </div>

          {/* Amount */}
          <CurrencyInput
            label="Monto"
            value={amount}
            onChange={setAmount}
            required
          />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              placeholder={type === 'expense' ? 'Ej: Supermercado Coto' : 'Ej: Sueldo de Mayo'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Select value={categoryName} onValueChange={setCategoryName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoryTemplates.map((template) => (
                  <SelectItem key={template.template_id} value={template.name}>
                    <div className="flex items-center space-x-2">
                      <span>{template.icon}</span>
                      <span>{template.name}</span>
                      {template.is_created && (
                        <Badge variant="secondary" className="ml-auto">Usada</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método de pago (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{formatPaymentMethodName(method)}</span>
                    </div>
                  </SelectItem>
                ))}
                {paymentMethods.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No hay métodos de pago configurados
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Debt Options (only for expenses) */}
          {type === 'expense' && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>¿Es una compra financiada?</Label>
                  <p className="text-sm text-muted-foreground">
                    Compras en cuotas, préstamos, etc.
                  </p>
                </div>
                <Switch
                  checked={isDebt}
                  onCheckedChange={setIsDebt}
                />
              </div>

              {isDebt && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="installments">Número de Cuotas</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="2"
                      max="60"
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Primera Cuota Vence</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || amount <= 0 || !categoryName || !description.trim()}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Crear {type === 'expense' ? 'Gasto' : 'Ingreso'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}