import { useState } from 'react'
import PdfViewer from './PdfViewer.jsx'

export default function DocumentStep({ onNext }) {
  const [accepted, setAccepted] = useState(true)

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 min-h-0 px-4 pt-4 pb-4">
        <div className="h-full rounded-t-2xl bg-paper-100 border border-ink-100 shadow-sheet overflow-hidden">
          <PdfViewer src="/ejemplo.pdf" />
        </div>
      </div>

      <div className="shrink-0 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-white border-t border-ink-100">
        <label className="flex items-start gap-2.5 mb-3 select-none">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded-md accent-brand-700"
          />
          <span className="text-[12.5px] leading-snug text-ink-500">
            Al continuar, aceptas realizar la firma por medios electrónicos con plena validez jurídica.
          </span>
        </label>
        <button
          type="button"
          disabled={!accepted}
          onClick={onNext}
          className="w-full h-[52px] rounded-2xl bg-brand-700 disabled:bg-ink-200 disabled:text-ink-400 text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-float active:scale-[0.98] transition-all duration-150"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          Firmar Documento
        </button>
      </div>
    </div>
  )
}
