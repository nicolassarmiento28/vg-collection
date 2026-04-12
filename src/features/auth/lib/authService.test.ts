import { describe, expect, it } from 'vitest'

import { authenticateLocalUser, DEMO_AUTH_USER } from './authService'

describe('authService', () => {
  it('authenticates demo user with valid credentials', async () => {
    await expect(
      authenticateLocalUser({ email: DEMO_AUTH_USER.email, password: DEMO_AUTH_USER.password }),
    ).resolves.toEqual({ email: DEMO_AUTH_USER.email })
  })

  it('rejects invalid credentials', async () => {
    await expect(
      authenticateLocalUser({ email: 'wrong@vg.com', password: 'Wrong1234' }),
    ).rejects.toThrow('Credenciales invalidas')
  })
})
