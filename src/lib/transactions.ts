/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseClient } from './supabase-browser'
import { Database } from './database.types'
import { ensureCategoryExists } from './categories'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export interface CreateTransactionData {
  type: 'expense' | 'income'
  amount: number
  description: string
  categoryName: string 
  subcategoryId?: string
  paymentMethodId?: string
  transactionDate: string 
  notes?: string
  isDebt?: boolean
  installments?: number
  dueDate?: string
}

export const createTransaction = async (data: CreateTransactionData): Promise<{
  data: Transaction | null
  error: any
}> => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  try {
    const categoryResult = await ensureCategoryExists(data.categoryName)
    if (categoryResult.error || !categoryResult.data) {
      return { data: null, error: categoryResult.error || { message: 'Failed to create category' } }
    }

    const transactionData: TransactionInsert = {
      user_id: user.id,
      category_id: categoryResult.data,
      subcategory_id: data.subcategoryId || null,
      payment_method_id: data.paymentMethodId || null,
      type: data.type,
      amount: data.amount,
      currency: 'ARS',
      description: data.description.trim(),
      notes: data.notes?.trim() || null,
      transaction_date: data.transactionDate,
      due_date: data.dueDate || null,
      is_debt: data.isDebt || false,
      installments: data.installments || 1,
      current_installment: 1,
      status: 'paid'
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    if (data.isDebt && data.installments && data.installments > 1 && data.dueDate) {
      await createInstallments(transaction.id, data.amount, data.installments, data.dueDate)
    }

    return { data: transaction, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

const createInstallments = async (
  transactionId: string, 
  totalAmount: number, 
  installments: number,
  firstDueDate: string
) => {
  const supabase = createSupabaseClient()
  const installmentAmount = totalAmount / installments
  const installmentRecords = []

  for (let i = 1; i <= installments; i++) {
    const dueDate = new Date(firstDueDate)
    dueDate.setMonth(dueDate.getMonth() + i - 1)

    installmentRecords.push({
      transaction_id: transactionId,
      installment_number: i,
      amount: installmentAmount,
      due_date: dueDate.toISOString().split('T')[0],
      status: i === 1 ? 'paid' : 'pending'
    })
  }

  await supabase.from('debt_installments').insert(installmentRecords)
}

export const getUserTransactions = async ({
  page = 1,
  limit = 20,
  type,
  categoryId,
  paymentMethodId,
  startDate,
  endDate,
  search
}: {
  page?: number
  limit?: number
  type?: 'expense' | 'income'
  categoryId?: string
  paymentMethodId?: string
  startDate?: string
  endDate?: string
  search?: string
} = {}) => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'User not authenticated' } }

  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon,
        type
      ),
      subcategories (
        id,
        name
      ),
      payment_methods (
        id,
        name,
        type,
        brand,
        banks (
          name,
          type
        )
      )
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (paymentMethodId) query = query.eq('payment_method_id', paymentMethodId)
  if (startDate) query = query.gte('transaction_date', startDate)
  if (endDate) query = query.lte('transaction_date', endDate)
  if (search) {
    query = query.or(`description.ilike.%${search}%,notes.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return { 
    data, 
    error,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}

export const getTransactionSummary = async (
  startDate?: string,
  endDate?: string
) => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'User not authenticated' } }

  let query = supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', user.id)

  if (startDate) query = query.gte('transaction_date', startDate)
  if (endDate) query = query.lte('transaction_date', endDate)

  const { data, error } = await query

  if (error) return { data: null, error }

  const summary = data.reduce((acc, transaction) => {
    if (transaction.type === 'income') {
      acc.totalIncome += transaction.amount
    } else {
      acc.totalExpenses += transaction.amount
    }
    return acc
  }, {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  })

  summary.balance = summary.totalIncome - summary.totalExpenses

  return { data: summary, error: null }
}

export const updateTransaction = async (
  transactionId: string,
  updates: Partial<CreateTransactionData>
): Promise<{ data: Transaction | null; error: any }> => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  try {
    let categoryId: string | undefined

    if (updates.categoryName) {
      const categoryResult = await ensureCategoryExists(updates.categoryName)
      if (categoryResult.error || !categoryResult.data) {
        return { data: null, error: categoryResult.error || { message: 'Failed to create category' } }
      }
      categoryId = categoryResult.data
    }

    const updateData: Partial<TransactionInsert> = {}
    
    if (categoryId) updateData.category_id = categoryId
    if (updates.subcategoryId !== undefined) updateData.subcategory_id = updates.subcategoryId || null
    if (updates.paymentMethodId !== undefined) updateData.payment_method_id = updates.paymentMethodId || null
    if (updates.type) updateData.type = updates.type
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.description) updateData.description = updates.description.trim()
    if (updates.notes !== undefined) updateData.notes = updates.notes?.trim() || null
    if (updates.transactionDate) updateData.transaction_date = updates.transactionDate
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate || null
    if (updates.isDebt !== undefined) updateData.is_debt = updates.isDebt
    if (updates.installments) updateData.installments = updates.installments

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .eq('user_id', user.id) 
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const deleteTransaction = async (transactionId: string) => {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

  return { error }
}