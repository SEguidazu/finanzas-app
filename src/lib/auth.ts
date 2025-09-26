import { createSupabaseClient } from './supabase-browser'

export const signUp = async (email: string, password: string, fullName?: string) => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (data.user && !error) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await supabase.rpc('setup_new_user_manual', {
        user_id: data.user.id
      })
    } catch (setupError) {
      console.warn('Manual user setup failed:', setupError)
    }
  }

  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export const signOut = async () => {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const supabase = createSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const setupNewUser = async (userId: string) => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.rpc('setup_new_user', {
    user_id: userId
  })

  return { data, error }
}