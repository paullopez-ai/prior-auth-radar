let cachedToken: string | null = null
let tokenExpiry: number = 0

export async function getOptumBearerToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const clientId = process.env.OPTUM_CLIENT_ID
  const clientSecret = process.env.OPTUM_CLIENT_SECRET
  const authUrl = process.env.OPTUM_AUTH_URL

  if (!clientId || !clientSecret || !authUrl) {
    throw new Error('Optum API credentials are not configured')
  }

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`Optum auth failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as { access_token: string; expires_in: number }
  cachedToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60 * 1000
  return cachedToken
}
