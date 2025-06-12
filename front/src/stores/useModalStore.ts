import { create } from 'zustand'

interface ModalStore {
  content: {
    children: React.ReactNode | null
    title?: string
    className?: string
  }
  isModalOpen: boolean
  closeModal: () => void
  openModal: ({
    children,
    title,
    className
  }: {
    children: React.ReactNode | null
    title?: string
    className?: string
  }) => void
}

const useModalStore = create<ModalStore>((set) => ({
  content: {
    children: null,
    title: '',
    className: ''
  },
  isModalOpen: false,
  closeModal: () => set({ isModalOpen: false }),
  openModal: ({ children, title, className }) =>
    set({ isModalOpen: true, content: { children, title, className } })
}))

export default useModalStore
