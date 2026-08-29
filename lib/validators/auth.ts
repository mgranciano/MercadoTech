export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  displayName: string
  role: "buyer" | "seller"
}

export interface ValidationError {
  field: string
  message: string
}

export function validateLogin(input: Partial<LoginInput>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!input.email?.trim()) {
    errors.push({ field: "email", message: "El email es requerido" })
  } else if (!isValidEmail(input.email)) {
    errors.push({ field: "email", message: "El email no es válido" })
  }

  if (!input.password) {
    errors.push({ field: "password", message: "La contraseña es requerida" })
  } else if (input.password.length < 8) {
    errors.push({
      field: "password",
      message: "La contraseña debe tener al menos 8 caracteres",
    })
  }

  return errors
}

export function validateRegister(
  input: Partial<RegisterInput>
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!input.email?.trim()) {
    errors.push({ field: "email", message: "El email es requerido" })
  } else if (!isValidEmail(input.email)) {
    errors.push({ field: "email", message: "El email no es válido" })
  }

  if (!input.password) {
    errors.push({ field: "password", message: "La contraseña es requerida" })
  } else if (input.password.length < 8) {
    errors.push({
      field: "password",
      message: "La contraseña debe tener al menos 8 caracteres",
    })
  }

  if (!input.displayName?.trim()) {
    errors.push({
      field: "displayName",
      message: "El nombre es requerido",
    })
  } else if (input.displayName.length < 2 || input.displayName.length > 60) {
    errors.push({
      field: "displayName",
      message: "El nombre debe tener entre 2 y 60 caracteres",
    })
  }

  if (!input.role || !["buyer", "seller"].includes(input.role)) {
    errors.push({
      field: "role",
      message: "Debes seleccionar tu tipo de cuenta",
    })
  }

  return errors
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
