import crypto from 'crypto'

// n8n webhooks that already do the real 5B login + request-otp/verify-otp work —
// this function only handles the WhatsApp Flow encryption layer around them.
const REQUEST_OTP_URL = 'https://n8n-test.tredasolutions.com/webhook/request-otp'
const VERIFY_OTP_URL = 'https://n8n-test.tredasolutions.com/webhook/verify-otp'

function decryptRequest(body) {
  const privateKeyPem = process.env.FLOW_PRIVATE_KEY
  if (!privateKeyPem) {
    throw new Error('FLOW_PRIVATE_KEY no está configurada en las variables de entorno')
  }

  const encryptedAesKey = Buffer.from(body.encrypted_aes_key, 'base64')
  const encryptedFlowData = Buffer.from(body.encrypted_flow_data, 'base64')
  const initialVector = Buffer.from(body.initial_vector, 'base64')

  const aesKey = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedAesKey
  )

  const TAG_LENGTH = 16
  const ciphertext = encryptedFlowData.subarray(0, encryptedFlowData.length - TAG_LENGTH)
  const authTag = encryptedFlowData.subarray(encryptedFlowData.length - TAG_LENGTH)

  const decipher = crypto.createDecipheriv('aes-128-gcm', aesKey, initialVector)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])

  return { payload: JSON.parse(decrypted.toString('utf-8')), aesKey, iv: initialVector }
}

function encryptResponse(responsePayload, aesKey, iv) {
  // Per Meta's Flow encryption spec: flip every bit of the request IV for the response.
  const flippedIv = Buffer.from(iv.map((b) => b ^ 0xff))
  const responseJson = JSON.stringify(responsePayload)

  const cipher = crypto.createCipheriv('aes-128-gcm', aesKey, flippedIv)
  const encrypted = Buffer.concat([cipher.update(responseJson, 'utf-8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return Buffer.concat([encrypted, authTag]).toString('base64')
}

async function callWebhook(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  let decrypted
  try {
    decrypted = decryptRequest(body)
  } catch (err) {
    // Logged server-side only — never leaked to Meta's response.
    console.error('Flow decryption failed:', err.message)
    console.error('FLOW_PRIVATE_KEY present:', Boolean(process.env.FLOW_PRIVATE_KEY))
    console.error('FLOW_PRIVATE_KEY starts with BEGIN marker:', (process.env.FLOW_PRIVATE_KEY || '').trimStart().startsWith('-----BEGIN'))
    // Meta expects HTTP 432 specifically for decryption/signature failures,
    // so it knows to prompt a key refresh rather than treating it as a generic error.
    return { statusCode: 432, body: 'Decryption failed' }
  }

  const { payload, aesKey, iv } = decrypted
  const action = payload.action
  const data = payload.data || {}
  const trigger = data.trigger || ''

  let responsePayload

  if (action === 'ping') {
    responsePayload = { data: { status: 'active' } }
  } else if (action === 'data_exchange' && trigger === 'verify') {
    try {
      const { ok, data: result } = await callWebhook(VERIFY_OTP_URL, {
        signatureHash: data.signatureHash,
        otpCode: data.otpCode,
      })
      responsePayload = ok
        ? { screen: 'SUCCESS', data: {} }
        : {
            screen: 'OTP',
            data: { has_error: true, error_message: result.message || 'Código inválido o expirado.' },
          }
    } catch {
      responsePayload = {
        screen: 'OTP',
        data: { has_error: true, error_message: 'No se pudo conectar con el servidor.' },
      }
    }
  } else if (action === 'data_exchange' && trigger === 'resend') {
    try {
      const { ok, data: result } = await callWebhook(REQUEST_OTP_URL, {
        signatureHash: data.signatureHash,
        authenticationMethodId: data.authenticationMethodId,
      })
      responsePayload = {
        screen: 'OTP',
        data: ok
          ? { has_error: false, error_message: '' }
          : { has_error: true, error_message: result.message || 'No se pudo reenviar el código.' },
      }
    } catch {
      responsePayload = {
        screen: 'OTP',
        data: { has_error: true, error_message: 'No se pudo conectar con el servidor.' },
      }
    }
  } else {
    // INIT, BACK, or anything else — trivial ack, no screen change.
    responsePayload = { data: {} }
  }

  const encryptedBase64 = encryptResponse(responsePayload, aesKey, iv)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: encryptedBase64,
  }
}
