import { useEffect, useRef, useState } from 'react'

export default function SignatureStep({ onBack, onNext }) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef({ x: 0, y: 0 })
  const [hasStroke, setHasStroke] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    const ratio = window.devicePixelRatio || 1

    const resize = () => {
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const ctx = canvas.getContext('2d')
      ctx.scale(ratio, ratio)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 2.75
      ctx.strokeStyle = '#161a2b'
      ctxRef.current = ctx
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const src = e.touches && e.touches.length ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    drawingRef.current = true
    lastPointRef.current = getPoint(e)
  }

  const moveDraw = (e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const ctx = ctxRef.current
    const point = getPoint(e)
    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPointRef.current = point
    if (!hasStroke) setHasStroke(true)
  }

  const endDraw = (e) => {
    e.preventDefault()
    drawingRef.current = false
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStroke(false)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 pt-5 pb-4 shrink-0">
        <h1 className="font-display text-2xl text-ink-950 font-semibold">
          Dibuja tu firma a continuación
        </h1>
        <p className="text-[13px] text-ink-500 mt-1.5">
          Usa tu dedo para trazar tu firma dentro del recuadro.
        </p>
      </div>

      <div className="flex-1 min-h-0 px-5 pb-4 flex flex-col">
        <div className="relative flex-1 rounded-2xl bg-paper-50 border border-ink-100 shadow-sheet overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ touchAction: 'none' }}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={endDraw}
          />

          {!hasStroke && (
            <div className="absolute inset-0 flex items-end justify-center pb-10 pointer-events-none">
              <span className="text-ink-300 font-display text-lg italic">
                Firma aquí
              </span>
            </div>
          )}

          <div className="absolute left-6 right-6 bottom-8 border-b-2 border-dashed border-ink-950/15 pointer-events-none" />

          {hasStroke && (
            <button
              type="button"
              onClick={clearCanvas}
              className="absolute top-3 right-3 h-9 px-3.5 rounded-full bg-brand-700 text-white text-[12px] font-medium flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Limpiar trazo
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)] flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-[52px] px-6 rounded-2xl bg-brand-700 text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={!hasStroke}
          onClick={onNext}
          className="flex-1 h-[52px] rounded-2xl bg-brand-700 disabled:bg-ink-200 disabled:text-ink-400 text-white font-semibold text-[15px] shadow-float active:scale-[0.98] transition-all duration-150"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
