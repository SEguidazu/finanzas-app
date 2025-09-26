/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseClient } from './supabase-browser'
import { Database } from './database.types'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']

export const getCategoryTemplates = async (type?: 'expense' | 'income') => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'User not authenticated' } }

  const { data, error } = await supabase.rpc('get_available_category_templates', {
    user_id: user.id,
    category_type: type || null
  })

  return { data, error }
}

export const getOrCreateCategory = async (templateName: string): Promise<{ 
  data: string | null;
  error: any 
}> => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase.rpc('get_or_create_user_category', {
    user_id: user.id,
    template_name: templateName
  })

  return { data, error }
}

export const getUserCategories = async (type?: 'expense' | 'income') => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'User not authenticated' } }

  let query = supabase
    .from('categories')
    .select(`
      *,
      subcategories (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .order('name')

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  return { data, error }
}

export const createCustomCategory = async (
  name: string,
  type: 'expense' | 'income',
  color?: string,
  icon?: string
) => {
  const supabase = createSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'User not authenticated' } }

  const categoryData: CategoryInsert = {
    user_id: user.id,
    name: name.trim(),
    type,
    color: color || '#6366f1',
    icon: icon || '📦'
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single()

  return { data, error }
}

export const updateCategory = async (
  categoryId: string,
  updates: Partial<Pick<Category, 'name' | 'color' | 'icon'>>
) => {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single()

  return { data, error }
}

export const deleteCategory = async (categoryId: string) => {
  const supabase = createSupabaseClient()
  
  const { data: transactions, error: checkError } = await supabase
    .from('transactions')
    .select('id')
    .eq('category_id', categoryId)
    .limit(1)

  if (checkError) return { error: checkError }

  if (transactions && transactions.length > 0) {
    return { 
      error: { 
        message: 'Cannot delete category that has transactions' 
      } 
    }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  return { error }
}

export const ensureCategoryExists = async (templateName: string) => {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: { message: 'User not authenticated' } }

  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', templateName)
    .single()

  if (existingCategory) {
    return { data: existingCategory.id, error: null }
  }

  return await getOrCreateCategory(templateName)
}