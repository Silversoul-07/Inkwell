'use client'

import { useState } from 'react'

const READONLY_MODE_KEY = 'inkwell-readonly-mode'

function getInitialReadOnlyMode(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(READONLY_MODE_KEY)
  return stored === 'true'
}

export function useReadOnlyMode() {
  const [isReadOnly, setIsReadOnly] = useState(getInitialReadOnlyMode)

  const toggleReadOnly = (value?: boolean) => {
    const newValue = value !== undefined ? value : !isReadOnly
    setIsReadOnly(newValue)
    localStorage.setItem(READONLY_MODE_KEY, String(newValue))
  }

  return {
    isReadOnly,
    toggleReadOnly,
  }
}
