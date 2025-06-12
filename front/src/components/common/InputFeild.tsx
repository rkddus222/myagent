import React, { forwardRef, useId, useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, className = '', helperText, startIcon, endIcon, ...props },
    ref
  ) => {
    const id = useId()
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={id}
            className={`
              block mb-1.5 text-sm transition-colors
              ${isFocused ? 'text-blue-600' : 'text-gray-700'}
              ${error ? 'text-red-500' : ''}
            `}
          >
            {label}
          </label>
        )}
        <div className='relative'>
          {startIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
              {startIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            {...props}
            className={`
              w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition-all
              ${startIcon ? 'pl-10' : ''}
              ${endIcon ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }
              ${props.disabled ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}
              ${className}
            `}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
          />
          {endIcon && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
              {endIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  className?: string
  helperText?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', helperText, ...props }, ref) => {
    const id = useId()
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={id}
            className={`
              block mb-1.5 text-sm transition-colors
              ${isFocused ? 'text-blue-600' : 'text-gray-700'}
              ${error ? 'text-red-500' : ''}
            `}
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          {...props}
          className={`
            w-full px-3 py-2 text-sm bg-background-gray border rounded-lg outline-none transition-all min-h-[120px] resize-y
            ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }
            ${props.disabled ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
        />
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export { Input, TextArea }
