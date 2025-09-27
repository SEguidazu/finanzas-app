'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TransactionForm } from '@/components/forms/transaction-form'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialType?: 'expense' | 'income'
}

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'expense'
}: TransactionModalProps) {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Nueva {initialType === 'expense' ? 'Gasto' : 'Ingreso'}
          </DialogTitle>
          <DialogDescription>
            Registra un nuevo {initialType === 'expense' ? 'gasto' : 'ingreso'} en tu historial financiero
          </DialogDescription>
        </DialogHeader>

        <TransactionForm
          onSuccess={handleSuccess}
          onCancel={onClose}
          initialType={initialType}
        />
      </DialogContent>
    </Dialog>
  )
}