import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

function Modal({ title, children, onClose }) {
  const panel = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current.querySelector('button')?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key !== 'Tab') return
      const focusable = [...panel.current.querySelectorAll('button:not(:disabled), a[href], select, input, textarea, summary, iframe')]
        .filter(element => !element.closest('details:not([open])') || element.tagName === 'SUMMARY')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

  return createPortal(
    <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="lesson-dialog" ref={panel} role="dialog" aria-modal="true" aria-labelledby="lesson-dialog-title" dir="rtl">
        <header className="dialog-header">
          <h2 id="lesson-dialog-title">{title}</h2>
          <button type="button" className="dialog-close" aria-label="إغلاق" onClick={onClose}>×</button>
        </header>
        {children}
      </section>
    </div>, document.body,
  )
}

export default Modal
