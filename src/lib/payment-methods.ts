/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseClient } from './supabase-browser'
import { Database } from './database.types'

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
type PaymentMethodInsert = Database['public']['Tables']['payment_methods']['Insert']

export interface CreatePaymentMethodData {
  name: string
  type: 'cash' | 'debit_card' | 'credit_card' | 'bank_transfer' | 'digital_wallet' | 'other'
  bankId?: string
  brand?: string
  isCredit?: boolean
  creditLimit?: number
  lastFourDigits?: string
  expiryMonth?: number
  expiryYear?: number
}

export const getUserPaymentMethods = async (activeOnly = true) => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'User not authenticated' } }

  let query = supabase
    .from('payment_methods')
    .select(`
      *,
      banks (
        id,
        name,
        type,
        code
      )
    `)
    .eq('user_id', user.id)
    .order('name')

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  return { data, error }
}

export const createPaymentMethod = async (
  data: CreatePaymentMethodData
): Promise<{ data: PaymentMethod | null; error: any }> => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  if (data.type === 'credit_card' && data.expiryMonth && data.expiryYear) {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    if (data.expiryYear < currentYear || 
        (data.expiryYear === currentYear && data.expiryMonth < currentMonth)) {
      return { 
        data: null, 
        error: { message: 'La tarjeta está vencida' } 
      }
    }
  }

  const paymentMethodData: PaymentMethodInsert = {
    user_id: user.id,
    name: data.name.trim(),
    type: data.type,
    bank_id: data.bankId || null,
    brand: data.brand?.trim() || null,
    is_credit: data.isCredit || false,
    credit_limit: data.creditLimit || null,
    last_four_digits: data.lastFourDigits?.trim() || null,
    expiry_month: data.expiryMonth || null,
    expiry_year: data.expiryYear || null,
    is_active: true
  }

  const { data: result, error } = await supabase
    .from('payment_methods')
    .insert(paymentMethodData)
    .select()
    .single()

  return { data: result, error }
}

export const updatePaymentMethod = async (
  paymentMethodId: string,
  updates: Partial<CreatePaymentMethodData>
): Promise<{ data: PaymentMethod | null; error: any }> => {
  const supabase = createSupabaseClient()

  const updateData: Partial<PaymentMethodInsert> = {}
  
  if (updates.name) updateData.name = updates.name.trim()
  if (updates.type) updateData.type = updates.type
  if (updates.bankId !== undefined) updateData.bank_id = updates.bankId || null
  if (updates.brand !== undefined) updateData.brand = updates.brand?.trim() || null
  if (updates.isCredit !== undefined) updateData.is_credit = updates.isCredit
  if (updates.creditLimit !== undefined) updateData.credit_limit = updates.creditLimit || null
  if (updates.lastFourDigits !== undefined) updateData.last_four_digits = updates.lastFourDigits?.trim() || null
  if (updates.expiryMonth !== undefined) updateData.expiry_month = updates.expiryMonth || null
  if (updates.expiryYear !== undefined) updateData.expiry_year = updates.expiryYear || null

  const { data, error } = await supabase
    .from('payment_methods')
    .update(updateData)
    .eq('id', paymentMethodId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single()

  return { data, error }
}

export const deactivatePaymentMethod = async (paymentMethodId: string) => {
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from('payment_methods')
    .update({ is_active: false })
    .eq('id', paymentMethodId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

  return { error }
}

export const reactivatePaymentMethod = async (paymentMethodId: string) => {
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from('payment_methods')
    .update({ is_active: true })
    .eq('id', paymentMethodId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

  return { error }
}

export const deletePaymentMethod = async (paymentMethodId: string) => {
  const supabase = createSupabaseClient()
  
  const { data: transactions, error: checkError } = await supabase
    .from('transactions')
    .select('id')
    .eq('payment_method_id', paymentMethodId)
    .limit(1)

  if (checkError) return { error: checkError }

  if (transactions && transactions.length > 0) {
    return { 
      error: { 
        message: 'No se puede eliminar un método de pago que tiene transacciones asociadas. Puedes desactivarlo.' 
      } 
    }
  }

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

  return { error }
}

export const formatPaymentMethodName = (paymentMethod: PaymentMethod & { banks?: { name: string } | null }): string => {
  const bankName = paymentMethod.banks?.name
  const lastFour = paymentMethod.last_four_digits
  const brand = paymentMethod.brand

  if (paymentMethod.type === 'cash') {
    return paymentMethod.name
  }

  if (paymentMethod.type === 'credit_card' || paymentMethod.type === 'debit_card') {
    let name = paymentMethod.name
    if (brand) name = `${brand} ${name}`
    if (bankName) name = `${name} (${bankName})`
    if (lastFour) name = `${name} ****${lastFour}`
    return name
  }

  if (paymentMethod.type === 'digital_wallet' && bankName) {
    return `${paymentMethod.name} (${bankName})`
  }

  return paymentMethod.name
}