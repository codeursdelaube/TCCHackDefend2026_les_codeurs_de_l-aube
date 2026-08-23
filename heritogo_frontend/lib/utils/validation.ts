/**
 * lib/utils/validation.ts
 * Fonctions de validation réutilisables dans toute l'application Heritogo.
 */

/**
 * Sanitize un champ téléphone en supprimant les caractères non autorisés.
 * Autorise : chiffres, +, espaces, tirets, parenthèses, points
 */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\s\-().]/g, '')
}

/**
 * Valide un numéro de téléphone.
 * Retourne null si valide (ou vide = optionnel), sinon retourne le message d'erreur.
 */
export function validatePhone(value: string): string | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.trim()
  const digitsOnly = cleaned.replace(/\D/g, '')
  if (digitsOnly.length < 7) {
    return 'Le numéro doit contenir au moins 7 chiffres'
  }
  if (digitsOnly.length > 15) {
    return 'Le numéro ne peut pas dépasser 15 chiffres'
  }
  if (!/^\+?[\d\s\-().]{7,20}$/.test(cleaned)) {
    return 'Format invalide. Ex: +228 90 00 00 00'
  }
  return null
}

/**
 * Valide un nom complet.
 * Retourne null si valide, sinon le message d'erreur.
 */
export function validateFullName(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length < 2) return 'Le nom doit contenir au moins 2 caractères'
  if (trimmed.length > 80) return 'Le nom est trop long (80 caractères max)'
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)) {
    return 'Le nom ne doit contenir que des lettres'
  }
  return null
}

/**
 * Valide qu'une valeur numérique est positive et dans les bornes attendues.
 * Retourne null si valide ou si la valeur est absente (champ optionnel).
 */
export function validatePositiveNumber(
  value: string | number,
  fieldName: string
): string | null {
  if (value === '' || value === null || value === undefined) return null
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return `${fieldName} doit être un nombre valide`
  if (num < 0) return `${fieldName} ne peut pas être négatif`
  if (num > 10000000) return `${fieldName} semble trop élevé`
  return null
}

/**
 * Valide un email basique.
 * Retourne null si valide, sinon le message d'erreur.
 */
export function validateEmail(value: string): string | null {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(value)) return 'Email invalide'
  return null
}

/**
 * Valide la force d'un mot de passe.
 * Retourne null si valide, sinon le message d'erreur.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une majuscule'
  }
  if (!/[a-z]/.test(password)) {
    return 'Le mot de passe doit contenir au moins une minuscule'
  }
  if (!/[0-9]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un chiffre'
  }
  return null
}

/**
 * Calcule la force d'un mot de passe (0-4).
 * 0 = vide, 1 = très faible, 2 = faible, 3 = moyen, 4 = fort
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  return score
}
