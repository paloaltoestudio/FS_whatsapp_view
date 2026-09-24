import { useEffect, useRef, useState } from 'react'

const LENGTH = 4

// n8n webhooks — give visibility into every request via n8n's execution log,
// replacing the earlier Netlify Function proxy.
const REQUEST_OTP_URL = 'https://n8n-test.tredasolutions.com/webhook/request-otp'
const VERIFY_OTP_URL = 'https://n8n-test.tredasolutions.com/webhook/verify-otp'

export default function OtpStep({ signatureHash, authenticationMethodId, onConfirm }) {
  const [digits, setDigits] = useState(Array(LENGTH).fill(''))
  const [resendIn, setResendIn] = useState(30)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const inputsRef = useRef([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const setDigitAt = (index, value) => {
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (!raw) {
      setDigitAt(index, '')
      return
    }
    const value = raw.slice(-1)
    setDigitAt(index, value)
    if (index < LENGTH - 1) inputsRef.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
      setDigitAt(index - 1, '')
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
    if (text.length < 1) return
    e.preventDefault()
    const chars = text.slice(0, LENGTH).split('')
    const next = Array(LENGTH).fill('')
    chars.forEach((c, i) => (next[i] = c))
    setDigits(next)
    const focusIndex = Math.min(chars.length, LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  const code = digits.join('')
  const complete = code.length === LENGTH

  const handleResend = async () => {
    if (resendIn > 0 || isResending) return
    setError('')
    setIsResending(true)
    try {
      const res = await fetch(REQUEST_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureHash, authenticationMethodId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || 'No se pudo reenviar el código.')
        return
      }
      setDigits(Array(LENGTH).fill(''))
      inputsRef.current[0]?.focus()
      setResendIn(30)
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.')
    } finally {
      setIsResending(false)
    }
  }

  const handleConfirm = async () => {
    if (!complete) return
    setError('')
    setIsVerifying(true)
    try {
      const res = await fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureHash, otpCode: code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || 'No se pudo verificar el código.')
        return
      }
      onConfirm()
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 pt-6 pb-2 shrink-0">
        <div className="h-12 w-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#173179" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h1 className="font-display text-2xl text-ink-950 font-semibold">
          Ingresa el código de verificación
        </h1>
        <p className="text-[13px] text-ink-500 mt-1.5 leading-relaxed">
          Enviado a tu WhatsApp o correo electrónico registrado.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5">
        <div className="flex justify-center gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              className={`h-16 w-16 rounded-2xl bg-ink-50 text-center text-2xl font-semibold text-ink-950 border-2 outline-none transition-colors ${
                digit ? 'border-brand-700 bg-brand-50' : 'border-ink-200 focus:border-ink-400'
              }`}
            />
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendIn > 0 || isResending}
            className="text-[13px] font-medium text-ink-500 disabled:text-ink-300"
          >
            {isResending ? (
              <>Reenviando…</>
            ) : resendIn > 0 ? (
              <>¿No recibiste el código? Reenviar en {resendIn}s</>
            ) : (
              <span className="text-brand-700">¿No recibiste el código? Reenviar</span>
            )}
          </button>
        </div>
      </div>

      <div className="shrink-0 px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        {error && (
          <p className="mb-3 text-[12.5px] leading-snug text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={!complete || isVerifying}
          onClick={handleConfirm}
          className="w-full h-[52px] rounded-2xl bg-brand-700 disabled:bg-ink-200 disabled:text-ink-400 text-white font-semibold text-[15px] shadow-float active:scale-[0.98] transition-all duration-150"
        >
          {isVerifying ? 'Verificando…' : 'Confirmar y Finalizar Firma'}
        </button>
      </div>
    </div>
  )
}
