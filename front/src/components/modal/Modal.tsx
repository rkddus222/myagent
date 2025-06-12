import { cn } from '@/utils'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'

export interface ModalProps {
  isOpen?: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ onClose, children, className }: ModalProps) {
  return (
    <>
      <Transition.Child
        as={Fragment}
        enter='ease-out duration-300'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='ease-in duration-200'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div className='fixed inset-0 bg-black bg-opacity-25' />
      </Transition.Child>

      <div className='fixed inset-0 overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center text-center'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <Dialog.Panel
              className={cn(
                'w-full flex flex-col max-w-md transform overflow-hidden rounded-2xl bg-background-primary p-6 text-left align-middle shadow-xl transition-all',
                className
              )}
            >
              <div className='flex items-center justify-between absolute right-4 top-4 p-4'>
                <button
                  type='button'
                  className='rounded-md outline-none hover:bg-gray-100'
                  onClick={onClose}
                >
                  <XMarkIcon className='h-5 w-5 text-gray-500' />
                </button>
              </div>
              <div className='flex-1'>{children}</div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </>
  )
}
