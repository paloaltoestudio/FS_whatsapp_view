const STEP_LABELS = ['Documento', 'Firma', 'Verificación', 'Listo']

export default function Stepper({ step }) {
  return (
    <div className="px-5 pt-3 pb-2 bg-white border-b border-ink-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold tracking-wide text-ink-500 uppercase">
          Paso {step} de 4
        </span>
        <span className="text-[11px] font-semibold text-brand-700">{STEP_LABELS[step - 1]}</span>
      </div>
      <div className="flex gap-1.5">
        {STEP_LABELS.map((label, i) => {
          const idx = i + 1
          const state = idx < step ? 'done' : idx === step ? 'active' : 'pending'
          return (
            <div key={label} className="h-1.5 flex-1 rounded-full overflow-hidden bg-ink-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  state === 'done'
                    ? 'w-full bg-brand-700'
                    : state === 'active'
                    ? 'w-full bg-gradient-to-r from-brand-700 to-brand-700/60'
                    : 'w-0 bg-transparent'
                }`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
