'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { validatePassword } from '@/lib/password-validator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordInput } from '@/components/ui/password-input'
import { toast } from "sonner"

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad')
      toast.error("Contraseña inválida", {
        description: "Revisa los requisitos de contraseña",
      })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      toast.error("Error de validación", {
        description: "Las contraseñas no coinciden",
      })
      setLoading(false)
      return
    }

    if (!fullName.trim()) {
      setError('El nombre completo es requerido')
      setLoading(false)
      return
    }

    const { data, error } = await signUp(email, password, fullName.trim())

    if (error) {
      setError(error.message)

      if (error.message.includes('Password should be at least')) {
        toast.error("Contraseña muy débil", {
          description: "La contraseña debe ser más fuerte según las políticas de seguridad",
        })
      } else if (error.message.includes('already registered')) {
        toast.error("Email ya registrado", {
          description: "Este email ya tiene una cuenta. Intenta iniciar sesión.",
        })
      } else {
        toast.error("Error de registro", {
          description: error.message,
        })
      }
    } else if (data.user) {
      toast.success("¡Registro exitoso!", {
        description: "Tu cuenta ha sido creada. Revisa tu email para confirmar.",
      })

      if (data.session) {
        router.push('/dashboard')
      } else {
        router.push('/login?message=check-email')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-center">
            Completa tus datos para comenzar a controlar tus finanzas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Santiago Eguidazu"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              required
              showStrength={true}
              showCriteria={true}
            />

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={confirmPassword && password !== confirmPassword ? 'border-red-500' : ''}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !validatePassword(password).isValid || password !== confirmPassword}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}