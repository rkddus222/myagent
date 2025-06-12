import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

import CustomButton from '../common/CustomButton'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: ConfirmationModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
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
          <div className='flex min-h-full items-center justify-center p-4'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all'>
                <Dialog.Title className='text-lg font-medium mb-4 text-primary'>
                  {title}
                </Dialog.Title>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>{message}</p>
                </div>

                <div className='mt-6 flex justify-end gap-x-2'>
                  <CustomButton
                    type='button'
                    size='small'
                    variant='outlined'
                    label='취소'
                    onClick={onClose}
                  />
                  <CustomButton
                    type='button'
                    size='small'
                    variant='filled'
                    label='확인'
                    onClick={() => {
                      onConfirm()
                      onClose()
                    }}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ConfirmationModal
