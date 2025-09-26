'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  id?: string
  name?: string
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = "$ 0,00",
  required = false,
  disabled = false,
  id = "amount",
  name = "amount"
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const formatCurrency = (amount: number): string => {
    if (amount === 0 && !isFocused) return ''

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const parseCurrency = (formatted: string): number => {
    const cleaned = formatted.replace(/[^\d,.]/g, '')

    const normalized = cleaned.replace(',', '.')

    const number = parseFloat(normalized)
    return isNaN(number) ? 0 : number
  }

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value))
    }
  }, [value, isFocused])

  useEffect(() => {
    setDisplayValue(formatCurrency(value))
  }, [])

  const handleFocus = () => {
    setIsFocused(true)
    if (value > 0) {
      setDisplayValue(value.toFixed(2).replace('.', ','))
    } else {
      setDisplayValue('')
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    const numericValue = parseCurrency(displayValue)
    onChange(numericValue)
    setDisplayValue(formatCurrency(numericValue))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    if (isFocused) {
      const sanitized = inputValue.replace(/[^\d,.]/g, '')
      setDisplayValue(sanitized)
    } else {
      setDisplayValue(inputValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Tab', 'Escape', 'Enter', ',', '.'].includes(e.key) ||
      (e.key === 'a' && e.ctrlKey === true) ||
      (e.key === 'c' && e.ctrlKey === true) ||
      (e.key === 'v' && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)) {
      return
    }

    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>{label}</Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          required={required}
          disabled={disabled}
          className={`text-right ${value > 0 ? 'font-medium' : ''}`}
        />
        {!isFocused && value > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-xs text-muted-foreground">ARS</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Ejemplo: 1.500,50 para mil quinientos pesos con cincuenta centavos
      </p>
    </div>
  )
}