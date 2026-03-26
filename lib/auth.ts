import { redirect } from 'next/navigation'
import { getSession } from './session'
import { IS_MOCK } from './config'

export async function requireAuth(): Promise<{ username: string }> {
  if (IS_MOCK) return { username: 'mock-user' }

  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function getOptionalAuth(): Promise<{ username: string } | null> {
  if (IS_MOCK) return { username: 'mock-user' }
  return getSession()
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUsername = process.env.AUTH_USERNAME
  const passwordHash = process.env.AUTH_PASSWORD_HASH

  if (!expectedUsername || !passwordHash) return false

  // Timing-safe username comparison
  const usernameMatch = timingSafeEqual(username, expectedUsername)

  // Verify password against scrypt hash
  const passwordMatch = await verifyScryptHash(password, passwordHash)

  return usernameMatch && passwordMatch
}

function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length)
  let mismatch = a.length ^ b.length
  for (let i = 0; i < maxLen; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return mismatch === 0
}

async function verifyScryptHash(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split('.')
  if (!saltHex || !hashHex) return false

  // Use Node.js crypto scrypt via dynamic import for server-side only
  const { scrypt } = await import('node:crypto')

  return new Promise((resolve) => {
    const salt = Buffer.from(saltHex, 'hex')
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) {
        resolve(false)
        return
      }
      const computedHex = derivedKey.toString('hex')
      // Timing-safe comparison of hex strings
      resolve(timingSafeEqual(computedHex, hashHex))
    })
  })
}
