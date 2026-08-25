import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default function PdfViewer({ src }) {
  const containerRef = useRef(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    const ratio = Math.min(window.devicePixelRatio || 1, 2)

    async function render() {
      setStatus('loading')
      const container = containerRef.current
      container.innerHTML = ''

      try {
        const pdf = await pdfjsLib.getDocument(src).promise
        const width = container.clientWidth

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return
          const page = await pdf.getPage(pageNum)
          const baseViewport = page.getViewport({ scale: 1 })
          const scale = width / baseViewport.width
          const viewport = page.getViewport({ scale: scale * ratio })

          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = '100%'
          canvas.style.height = 'auto'
          canvas.style.display = 'block'
          if (pageNum > 1) canvas.style.marginTop = '10px'

          const ctx = canvas.getContext('2d')
          await page.render({ canvasContext: ctx, viewport }).promise
          if (cancelled) return
          container.appendChild(canvas)
        }

        if (!cancelled) setStatus('ready')
      } catch (err) {
        if (!cancelled) setStatus('error')
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <div className="relative h-full w-full overflow-y-auto no-scrollbar">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-ink-400 text-[13px]">
          <span className="h-4 w-4 rounded-full border-2 border-ink-200 border-t-brand-700 animate-spin" />
          Cargando documento…
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-[13px] text-ink-500">
          No se pudo cargar el documento.
        </div>
      )}
      <div ref={containerRef} />
    </div>
  )
}
