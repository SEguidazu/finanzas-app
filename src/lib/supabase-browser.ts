import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

export const createSupabaseClient = () => {
  return createClientComponentClient<Database>()
}