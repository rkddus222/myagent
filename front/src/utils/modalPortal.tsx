import { ModalRoot } from '@components/modal/modalRoot'

import { createPortal } from 'react-dom'

export const ModalPortal = ({
  isOpen,
  setIsOpen,
  children,
  className
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
  className?: string
}) => {
  const el = document.getElementById('modal')
  if (!el) return null

  return createPortal(
    <ModalRoot
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className={className}
    >
      {children}
    </ModalRoot>,
    el
  )
}
