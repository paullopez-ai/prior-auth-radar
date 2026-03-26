#!/usr/bin/env node

/**
 * Generate a scrypt password hash for the auth system.
 *
 * Usage:
 *   node scripts/generate-password-hash.mjs
 *
 * Prompts for a password and outputs a hash in the format: saltHex.hashHex
 * Copy the output into AUTH_PASSWORD_HASH in your .env.local file.
 */

import { scrypt, randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })

function question(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve))
}

async function hashPassword(password) {
  const salt = randomBytes(16)
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(`${salt.toString('hex')}.${derivedKey.toString('hex')}`)
    })
  })
}

async function main() {
  const password = await question('Enter password to hash: ')
  const hash = await hashPassword(password)
  console.log('\nGenerated hash (copy to AUTH_PASSWORD_HASH):')
  console.log(hash)

  // Also generate a random AUTH_SECRET
  const secret = randomBytes(32).toString('hex')
  console.log('\nGenerated secret (copy to AUTH_SECRET):')
  console.log(secret)

  rl.close()
}

main().catch(console.error)
