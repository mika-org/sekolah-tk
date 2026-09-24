'use client'

import { useEffect, useId, useRef } from 'react'

interface ModalEntry {
  id: string
  close: () => void
  href: string
}

// Global stack of active modals (LIFO)
const modalStack: ModalEntry[] = []

// Number of programmatic history.back() calls waiting to be ignored by popstate
let cleanupPopCount = 0

// Whether the window is unloading or closing
let isUnloading = false

// Ensure the popstate listener is attached only once
let isListenerAttached = false

function initGlobalModalHistory() {
  if (typeof window === 'undefined' || isListenerAttached) return
  isListenerAttached = true

  window.addEventListener('beforeunload', () => {
    isUnloading = true
  })

  window.addEventListener('popstate', () => {
    // If this popstate was triggered by our own history.back() cleanup, ignore it
    if (cleanupPopCount > 0) {
      cleanupPopCount--
      return
    }

    // If there is an open modal, close the topmost one
    if (modalStack.length > 0) {
      const topModal = modalStack.pop()
      if (topModal) {
        topModal.close()
      }
    }
  })
}

/**
 * Register an open modal in browser history.
 * Pushes a dummy history state so that pressing Back will dismiss the modal
 * instead of navigating to the previous page or logging out.
 *
 * @param id Unique identifier for this modal instance
 * @param close Callback to close the modal when Back is pressed
 * @returns Cleanup function to be called when modal closes or unmounts
 */
export function registerOpenModal(id: string, close: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  initGlobalModalHistory()

  const initialHref = window.location.href
  const stateKey = `__modal_${id}`

  // Push state so Back button triggers a popstate event instead of leaving the page
  try {
    const currentState = window.history.state || {}
    window.history.pushState(
      { ...currentState, [stateKey]: true },
      '',
      initialHref
    )
  } catch (err) {
    console.warn('Could not push modal history state:', err)
  }

  const entry: ModalEntry = { id, close, href: initialHref }
  modalStack.push(entry)

  let cleanedUp = false

  return () => {
    if (cleanedUp) return
    cleanedUp = true

    // Check if this modal is still on the stack.
    // If it is on the stack, it was closed via UI/code (NOT by popstate).
    const index = modalStack.findIndex((m) => m.id === id)
    if (index !== -1) {
      modalStack.splice(index, 1)

      // Only pop history if we are still on the exact same page/URL
      // and the page is not in the middle of unloading/navigation.
      if (!isUnloading && window.location.href === initialHref) {
        cleanupPopCount++
        try {
          window.history.back()
        } catch {
          cleanupPopCount = Math.max(0, cleanupPopCount - 1)
        }
      }
    }
  }
}

/**
 * Hook to automatically handle browser Back button for any modal/popup.
 * When the modal is open, pressing Back will close the modal instead of navigating away.
 *
 * @param isOpen Whether the modal is currently visible
 * @param onClose Callback to close the modal
 */
export function useModalBackHandler(isOpen: boolean, onClose: () => void) {
  const id = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) return

    const unregister = registerOpenModal(id, () => {
      onCloseRef.current?.()
    })

    return () => {
      unregister()
    }
  }, [isOpen, id])
}
