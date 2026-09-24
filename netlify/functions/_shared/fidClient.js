const FID_BASE_URL = process.env.FID_BASE_URL || 'https://devfid.5b.com.gt'

// Reused across warm invocations of the same function instance so we don't
// re-authenticate on every request. Never sent to the client.
let cachedToken = null
let cachedTokenExpiresAt = 0

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken
  }

  const email = process.env.FID_EMAIL
  const password = process.env.FID_PASSWORD
  if (!email || !password) {
    throw new Error('FID_EMAIL / FID_PASSWORD no están configuradas en las variables de entorno')
  }

  const res = await fetch(`${FID_BASE_URL}/api/v2/Auth/SignIn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))

  if (!res.ok || !data.access_token) {
    throw new Error(data.message || 'No se pudo autenticar con el proveedor de firma')
  }

  cachedToken = data.access_token
  // Refresh a minute early as a safety margin against clock drift.
  cachedTokenExpiresAt = new Date(data.expires_in).getTime() - 60_000
  return cachedToken
}

export async function fidFetch(path, options = {}) {
  const token = await getAccessToken()
  const res = await fetch(`${FID_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}
