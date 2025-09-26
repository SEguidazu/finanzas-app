export interface Database {
  public: {
    Tables: {
      banks: {
        Row: {
          id: string
          name: string
          code: string | null
          type: 'traditional_bank' | 'digital_bank' | 'fintech' | 'credit_card_company' | 'custom'
          logo_url: string | null
          is_active: boolean
          is_system_bank: boolean
          created_by_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          type: 'traditional_bank' | 'digital_bank' | 'fintech' | 'credit_card_company' | 'custom'
          logo_url?: string | null
          is_active?: boolean
          is_system_bank?: boolean
          created_by_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          type?: 'traditional_bank' | 'digital_bank' | 'fintech' | 'credit_card_company' | 'custom'
          logo_url?: string | null
          is_active?: boolean
          is_system_bank?: boolean
          created_by_user_id?: string | null
          created_at?: string
        }
      }
      category_templates: {
        Row: {
          id: string
          name: string
          color: string
          icon: string | null
          type: 'expense' | 'income'
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          icon?: string | null
          type: 'expense' | 'income'
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string | null
          type?: 'expense' | 'income'
          sort_order?: number
          created_at?: string
        }
      }
      subcategory_templates: {
        Row: {
          id: string
          category_template_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_template_id: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_template_id?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          currency: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          currency?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          currency?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string | null
          type: 'expense' | 'income'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string | null
          type: 'expense' | 'income'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string | null
          type?: 'expense' | 'income'
          created_at?: string
        }
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          created_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          bank_id: string | null
          name: string
          type: 'cash' | 'debit_card' | 'credit_card' | 'bank_transfer' | 'digital_wallet' | 'other'
          brand: string | null
          is_credit: boolean
          credit_limit: number | null
          last_four_digits: string | null
          expiry_month: number | null
          expiry_year: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bank_id?: string | null
          name: string
          type: 'cash' | 'debit_card' | 'credit_card' | 'bank_transfer' | 'digital_wallet' | 'other'
          brand?: string | null
          is_credit?: boolean
          credit_limit?: number | null
          last_four_digits?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bank_id?: string | null
          name?: string
          type?: 'cash' | 'debit_card' | 'credit_card' | 'bank_transfer' | 'digital_wallet' | 'other'
          brand?: string | null
          is_credit?: boolean
          credit_limit?: number | null
          last_four_digits?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string
          subcategory_id: string | null
          payment_method_id: string | null
          type: 'expense' | 'income'
          amount: number
          currency: string
          description: string
          notes: string | null
          transaction_date: string
          due_date: string | null
          status: 'paid' | 'pending' | 'overdue' | 'partial'
          is_debt: boolean
          installments: number
          current_installment: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          subcategory_id?: string | null
          payment_method_id?: string | null
          type: 'expense' | 'income'
          amount: number
          currency?: string
          description: string
          notes?: string | null
          transaction_date: string
          due_date?: string | null
          status?: 'paid' | 'pending' | 'overdue' | 'partial'
          is_debt?: boolean
          installments?: number
          current_installment?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          subcategory_id?: string | null
          payment_method_id?: string | null
          type?: 'expense' | 'income'
          amount?: number
          currency?: string
          description?: string
          notes?: string | null
          transaction_date?: string
          due_date?: string | null
          status?: 'paid' | 'pending' | 'overdue' | 'partial'
          is_debt?: boolean
          installments?: number
          current_installment?: number
          created_at?: string
          updated_at?: string
        }
      }
      debt_installments: {
        Row: {
          id: string
          transaction_id: string
          installment_number: number
          amount: number
          due_date: string
          status: 'paid' | 'pending' | 'overdue'
          paid_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          installment_number: number
          amount: number
          due_date: string
          status?: 'paid' | 'pending' | 'overdue'
          paid_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          installment_number?: number
          amount?: number
          due_date?: string
          status?: 'paid' | 'pending' | 'overdue'
          paid_date?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          month: number
          year: number
          planned_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          month: number
          year: number
          planned_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          month?: number
          year?: number
          planned_amount?: number
          created_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          status: 'active' | 'completed' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_or_create_user_category: {
        Args: {
          user_id: string
          template_name: string
        }
        Returns: string
      }
      get_available_category_templates: {
        Args: {
          user_id: string
          category_type?: string
        }
        Returns: {
          template_id: string
          name: string
          color: string
          icon: string
          type: string
          sort_order: number
          is_created: boolean
        }[]
      }
      setup_new_user: {
        Args: {
          user_id: string
        }
        Returns: void
      }
    }
  }
}