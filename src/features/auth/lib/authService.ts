export const DEMO_AUTH_USER = {
  email: 'demo@vg.com',
  password: 'Demo1234',
} as const

interface LoginCredentials {
  email: string
  password: string
}

interface AuthenticatedUser {
  email: string
}

export async function authenticateLocalUser(
  credentials: LoginCredentials,
): Promise<AuthenticatedUser> {
  const email = credentials.email.trim().toLowerCase()

  if (email !== DEMO_AUTH_USER.email || credentials.password !== DEMO_AUTH_USER.password) {
    throw new Error('Credenciales invalidas')
  }

  return { email: DEMO_AUTH_USER.email }
}
