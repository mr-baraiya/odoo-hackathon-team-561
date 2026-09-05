"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export function DropdownPortal({ children, targetRect, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false)
  const portalRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (portalRef.current && !portalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen || !targetRect) return null

  // Calculate position
  const top = targetRect.bottom + window.scrollY
  const left = targetRect.left + window.scrollX
  const width = targetRect.width

  return createPortal(
    <div
      ref={portalRef}
      className="fixed bg-white rounded-md shadow-lg border border-gray-200 max-h-64 overflow-auto"
      style={{
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 9999999, // Extremely high z-index
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
      }}
    >
      {children}
    </div>,
    document.body,
  )
}
