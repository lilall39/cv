'use client'

import { useCallback } from 'react'

interface ResizeHandleProps {
  sectionId: string
  onResize: (sectionId: string, height: number | null) => void
}

export function ResizeHandle({ sectionId, onResize }: ResizeHandleProps) {

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.detail === 2) return
      e.preventDefault()
      const body = document.getElementById(`body-${sectionId}`)
      if (!body) return
      const startY = e.clientY
      const startHeight = body.offsetHeight
      const minH = 60
      const maxH = 800

      const onMove = (ev: MouseEvent) => {
        const dy = ev.clientY - startY
        const newH = Math.max(minH, Math.min(maxH, startHeight + dy))
        body.style.maxHeight = newH + 'px'
        onResize(sectionId, newH)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [sectionId, onResize]
  )

  const handleDoubleClick = useCallback(() => {
    const body = document.getElementById(`body-${sectionId}`)
    if (body) {
      body.style.maxHeight = ''
      onResize(sectionId, null)
    }
  }, [sectionId, onResize])

  return (
    <div
      id={`resize-${sectionId}`}
      className="resize-handle no-print py-3 mt-3 rounded-lg text-center text-mocha text-xs font-medium"
      title="Glisser pour redimensionner (double-clic pour réinitialiser)"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      ⋮⋮ Redimensionner
    </div>
  )
}
