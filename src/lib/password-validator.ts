export interface PasswordValidation {
  isValid: boolean
  score: number // 0-100
  errors: string[]
  suggestions: string[]
}

export interface PasswordCriteria {
  label: string
  test: (password: string) => boolean
  message: string
}

export const passwordCriteria: PasswordCriteria[] = [
  {
    label: "Mínimo 8 caracteres",
    test: (password) => password.length >= 8,
    message: "La contraseña debe tener al menos 8 caracteres"
  },
  {
    label: "Una letra minúscula",
    test: (password) => /[a-z]/.test(password),
    message: "Debe contener al menos una letra minúscula (a-z)"
  },
  {
    label: "Una letra mayúscula",
    test: (password) => /[A-Z]/.test(password),
    message: "Debe contener al menos una letra mayúscula (A-Z)"
  },
  {
    label: "Un número",
    test: (password) => /\d/.test(password),
    message: "Debe contener al menos un número (0-9)"
  },
  {
    label: "Un símbolo especial",
    test: (password) => /[@$!%*?&.,#_-]/.test(password),
    message: "Debe contener al menos un símbolo (@$!%*?&.,#_-)"
  }
]

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 0

  passwordCriteria.forEach(criteria => {
    if (criteria.test(password)) {
      score += 20 
    } else {
      errors.push(criteria.message)
    }
  })

  if (password.length >= 12) score += 10 
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 5 
  if (password.length >= 16) score += 5 

  score = Math.min(score, 100)

  if (password.length < 8) {
    suggestions.push("Intenta usar al menos 8 caracteres")
  }
  if (!/[a-z]/.test(password)) {
    suggestions.push("Agrega letras minúsculas")
  }
  if (!/[A-Z]/.test(password)) {
    suggestions.push("Agrega letras mayúsculas")
  }
  if (!/\d/.test(password)) {
    suggestions.push("Agrega números")
  }
  if (!/[@$!%*?&.,#_-]/.test(password)) {
    suggestions.push("Agrega símbolos como @, !, %, etc.")
  }

  if (score < 60) {
    suggestions.push("Considera usar una frase con espacios y números")
    suggestions.push("Evita palabras comunes o información personal")
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
    suggestions
  }
}

export const getPasswordStrengthColor = (score: number): string => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600" 
  if (score >= 40) return "text-orange-600"
  return "text-red-600"
}

export const getPasswordStrengthLabel = (score: number): string => {
  if (score >= 80) return "Muy fuerte"
  if (score >= 60) return "Fuerte"
  if (score >= 40) return "Media"
  if (score >= 20) return "Débil"
  return "Muy débil"
}

export const getPasswordStrengthBgColor = (score: number): string => {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-yellow-500"
  if (score >= 40) return "bg-orange-500"
  return "bg-red-500"
}