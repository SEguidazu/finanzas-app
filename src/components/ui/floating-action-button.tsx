'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Receipt, TrendingUp } from 'lucide-react'
import { TransactionModal } from '@/components/modals/transaction-modal'

interface FloatingActionButtonProps {
  onTransactionCreated?: () => void
}

export function FloatingActionButton({ onTransactionCreated }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense')

  const handleOpenModal = (type: 'expense' | 'income') => {
    setSelectedType(type)
    setIsOpen(true)
    setShowOptions(false)
  }

  const handleSuccess = () => {
    if (onTransactionCreated) {
      onTransactionCreated()
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {showOptions && (
          <div className="absolute bottom-16 right-0 space-y-3 mb-2">
            <Button
              onClick={() => handleOpenModal('income')}
              size="lg"
              className="rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Ingreso
            </Button>
            <Button
              onClick={() => handleOpenModal('expense')}
              size="lg"
              className="rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white"
            >
              <Receipt className="h-5 w-5 mr-2" />
              Gasto
            </Button>
          </div>
        )}

        <Button
          onClick={() => setShowOptions(!showOptions)}
          size="lg"
          className={`rounded-full shadow-lg transition-transform duration-200 ${showOptions ? 'rotate-45' : 'rotate-0'
            }`}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <TransactionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
        initialType={selectedType}
      />
    </>
  )
}