import React, { forwardRef } from 'react'

interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string
  value: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  type?: string
  required?: boolean
  className?: string
  containerClassName?: string
}
const CustomInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CustomInputProps
>(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      error,
      type = 'text',
      required = false,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`relative w-full ${containerClassName}`}>
        <div className='relative disabled:bg-gray-100 bg-white h-full text-lg'>
          {type === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              required={required}
              className={`peer w-full bg-transparent px-4 outline-none rounded-lg border-2 border-background-secondary placeholder:text-transparent transition-all focus:border-aicfo-purple resize-none py-4 ${
                error ? 'border-red-500' : ''
              } ${value ? 'border-border' : ''} ${className}`}
              {...props}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type={type}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              required={required}
              className={`peer disabled:bg-gray-100 w-full bg-transparent px-4 outline-none rounded-lg border-2 border-background-secondary placeholder:text-transparent transition-all focus:border-aicfo-purple h-14 ${
                error ? 'border-red-500' : ''
              } ${value ? 'border-border' : ''} ${className}`}
              {...props}
            />
          )}
          <label
            className={`absolute peer-enabled:bg-background-primary bg-background-gray-100 left-3 -top-2.5 px-2 text-sm transition-all text-text-secondary peer-focus:text-aicfo-purple peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base ${
              error ? 'text-red-500' : ''
            }`}
          >
            {label}
            {required && <span className='ml-1 text-red-500'>*</span>}
          </label>
        </div>
        {error && <p className='mt-1 pl-1 text-sm text-red-500'>{error}</p>}
      </div>
    )
  }
)

CustomInput.displayName = 'CustomInput'

export default CustomInput
