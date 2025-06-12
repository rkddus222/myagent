import React, { ReactNode } from 'react'

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: 'filled' | 'outlined'
  size?: 'large' | 'medium' | 'small'
  inValid?: boolean
  className?: string
  textClassName?: string
  icon?: ReactNode
}

const CustomButton = ({
  label,
  variant = 'filled',
  size = 'large',
  inValid = false,
  className = '',
  textClassName = '',
  icon = null,
  ...props
}: CustomButtonProps) => {
  const baseStyles =
    'rounded flex justify-center items-center transition-all duration-200'

  const variantStyles = {
    filled: 'bg-aicfo-purple hover:bg-aicfo-purple-accent',
    outlined:
      'inner-border-aicfo-purple inner-border hover:bg-background-card-accent bg-background-card'
  }

  const sizeStyles = {
    large: 'w-full py-4 md:py-3',
    medium: 'w-1/2 py-3 md:py-2',
    small: 'py-2 px-4'
  }

  const textStyles = {
    filled: 'text-white',
    outlined: 'text-aicfo-purple'
  }

  return (
    <button
      disabled={inValid}
      className={`
        transition-[background-color] duration-300
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${inValid ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      <div className='flex items-center justify-center gap-2'>
        {icon}
        <span
          className={`
          text-base font-bold
          ${textStyles[variant]}
          ${textClassName}
        `}
        >
          {label}
        </span>
      </div>
    </button>
  )
}

export default CustomButton
