import { useEffect, useState } from 'react'

// Business WhatsApp number in E.164 without the leading "+" (wa.me format).
const WHATSAPP_NUMBER = '573026947616'

// How long the success state stays visible before auto-returning to WhatsApp.
const AUTO_RETURN_DELAY_MS = 1800

export default function SuccessStep() {
  const [showFallback, setShowFallback] = useState(false)

  const handleClose = () => {
    // wa.me is intercepted by the OS and switches straight into the WhatsApp
    // app/chat. window.close() only works on tabs the page itself opened, so
    // it silently fails here since the WebView/browser opened this tab.
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}`
    setTimeout(() => setShowFallback(true), 800)
  }

  useEffect(() => {
    const timer = setTimeout(handleClose, AUTO_RETURN_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col h-full bg-white items-center justify-center px-8 text-center">
      <div className="relative mb-7">
        <span className="absolute inset-0 rounded-full bg-brand-700/30 animate-ringPulse" />
        <div className="relative h-20 w-20 rounded-full bg-brand-700 flex items-center justify-center animate-popIn">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5 10 17.5 19.5 7"
              stroke="#ffffff"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="48"
              strokeDashoffset="48"
              className="animate-drawCheck"
            />
          </svg>
        </div>
      </div>

      <h1 className="font-display text-[26px] leading-tight text-ink-950 font-semibold animate-rise" style={{ animationDelay: '150ms', opacity: 0 }}>
        ¡Código verificado!
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-500 max-w-[300px] animate-rise" style={{ animationDelay: '250ms', opacity: 0 }}>
        Tu identidad fue confirmada y el documento entró en proceso de firma. Te avisaremos por WhatsApp en cuanto quede completado.
      </p>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 animate-rise" style={{ animationDelay: '320ms', opacity: 0 }}>
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        <span className="text-xs font-medium text-amber-700">Firma en proceso</span>
      </div>

      <div className="w-full max-w-sm mt-10 animate-rise" style={{ animationDelay: '420ms', opacity: 0 }}>
        <button
          type="button"
          onClick={handleClose}
          className="w-full h-[52px] rounded-2xl bg-brand-700 text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-float active:scale-[0.98] transition-transform"
        >
          Volver a WhatsApp
        </button>

        {showFallback && (
          <p className="mt-4 text-[12.5px] text-ink-400 animate-rise" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            Si no fuiste redirigido, puedes cerrar esta ventana y volver al chat manualmente.
          </p>
        )}
      </div>
    </div>
  )
}
