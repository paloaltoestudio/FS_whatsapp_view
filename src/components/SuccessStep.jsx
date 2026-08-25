import { useState } from 'react'

export default function SuccessStep() {
  const [showFallback, setShowFallback] = useState(false)

  const handleClose = () => {
    window.close()
    // If the WebView blocks programmatic close (iOS/Android in-app browsers
    // commonly do), fall back to a friendly manual-close instruction.
    setTimeout(() => setShowFallback(true), 350)
  }

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
        ¡Documento Firmado Exitosamente!
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-500 max-w-[300px] animate-rise" style={{ animationDelay: '250ms', opacity: 0 }}>
        Hemos registrado tu firma con sello criptográfico. Puedes continuar con tu proceso.
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-400 animate-rise" style={{ animationDelay: '320ms', opacity: 0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Contrato #1234 · SHA-256 verificado
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
            Puedes cerrar esta ventana de forma segura y regresar al chat.
          </p>
        )}
      </div>
    </div>
  )
}
