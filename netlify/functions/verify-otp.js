import { fidFetch } from './_shared/fidClient.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ status: 'error', message: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'JSON inválido' }) }
  }

  const { signatureHash, otpCode } = body
  if (!signatureHash || !otpCode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'error', message: 'signatureHash y otpCode son requeridos' }),
    }
  }

  try {
    const { status, data } = await fidFetch('/api/v2/Signature/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ signatureHash, otpCode }),
    })
    return { statusCode: status, body: JSON.stringify(data) }
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ status: 'error', message: err.message }) }
  }
}
