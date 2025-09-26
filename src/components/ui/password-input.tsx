'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import {
  validatePassword,
  passwordCriteria,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  type PasswordValidation
} from '@/lib/password-validator'

interface PasswordInputProps {
  value: string
  onChange: { (value: string): void }
  placeholder?: string
  required?: boolean
  showStrength?: boolean
  showCriteria?: boolean
  id?: string
  name?: string
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  showStrength = true,
  showCriteria = true,
  id = "password",
  name = "password"
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [validation, setValidation] = useState<PasswordValidation>({
    isValid: false,
    score: 0,
    errors: [],
    suggestions: []
  })

  const handlePasswordChange = (newPassword: string) => {
    onChange(newPassword)
    const newValidation = validatePassword(newPassword)
    setValidation(newValidation)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={id}>Contraseña</Label>
        <div className="relative">
          <Input
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required={required}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>

      {value && showStrength && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Progress value={validation.score} className="flex-1" />
            <span className={`text-sm font-medium ${getPasswordStrengthColor(validation.score)}`}>
              {getPasswordStrengthLabel(validation.score)}
            </span>
          </div>

          {showCriteria && (
            <Card className="p-0">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Requisitos de contraseña:
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {passwordCriteria.map((criteria, index) => {
                      const isValid = criteria.test(value)
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          {isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                          <span className={isValid ? "text-green-700" : "text-gray-500"}>
                            {criteria.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {validation.suggestions.length > 0 && validation.score < 80 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Sugerencias:</p>
                        <ul className="space-y-1">
                          {validation.suggestions.slice(0, 2).map((suggestion, index) => (
                            <li key={index} className="text-xs">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}