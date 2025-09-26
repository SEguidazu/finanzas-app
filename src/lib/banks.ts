/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseClient } from './supabase-browser'
import { Database } from './database.types'

type Bank = Database['public']['Tables']['banks']['Row']
type BankInsert = Database['public']['Tables']['banks']['Insert']

export const getBanksForUser = async (): Promise<{ data: Bank[] | null; error: any }> => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .eq('is_active', true)
    .order('is_system_bank', { ascending: false })
    .order('name')

  return { data, error }
}

export const getSystemBanks = async (): Promise<{ data: Bank[] | null; error: any }> => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .eq('is_system_bank', true)
    .eq('is_active', true)
    .order('name')

  return { data, error }
}

export const createCustomBank = async (
  name: string, 
  type: Bank['type'] = 'custom',
  code?: string
): Promise<{ data: Bank | null; error: any }> => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const bankData: BankInsert = {
    name: name.trim(),
    code,
    type,
    is_system_bank: false,
    created_by_user_id: user.id
  }

  const { data, error } = await supabase
    .from('banks')
    .insert(bankData)
    .select()
    .single()

  return { data, error }
}

export const updateCustomBank = async (
  bankId: string,
  updates: Partial<Pick<Bank, 'name' | 'code' | 'type' | 'is_active'>>
): Promise<{ data: Bank | null; error: any }> => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('banks')
    .update(updates)
    .eq('id', bankId)
    .eq('is_system_bank', false) 
    .select()
    .single()

  return { data, error }
}

export const deleteCustomBank = async (bankId: string): Promise<{ error: any }> => {
  const supabase = createSupabaseClient()
  
  const { data: paymentMethods, error: checkError } = await supabase
    .from('payment_methods')
    .select('id')
    .eq('bank_id', bankId)
    .limit(1)

  if (checkError) {
    return { error: checkError }
  }

  if (paymentMethods && paymentMethods.length > 0) {
    return { 
      error: { 
        message: 'Cannot delete bank that is being used by payment methods' 
      } 
    }
  }

  const { error } = await supabase
    .from('banks')
    .delete()
    .eq('id', bankId)
    .eq('is_system_bank', false) 

  return { error }
}

export const checkBankNameExists = async (
  name: string, 
  excludeId?: string
): Promise<{ exists: boolean; error: any }> => {
  const supabase = createSupabaseClient()
  
  let query = supabase
    .from('banks')
    .select('id')
    .ilike('name', name.trim())

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query.limit(1)

  return { 
    exists: !error && data && data.length > 0, 
    error 
  }
}