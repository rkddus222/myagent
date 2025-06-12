import { useState } from 'react'

interface UseInputProps<T> {
  initialValue: T
}

function useInput<T>({ initialValue }: UseInputProps<T>) {
  const [values, setValues] = useState(initialValue)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChangeText = (name: keyof T, text: string) => {
    setValues({
      ...values,
      [name]: text
    })

    console.log(text, 'values')
  }

  const handleBlur = (name: keyof T) => {
    setTouched({
      ...touched,
      [name]: true
    })
  }
  const handleTextClear = () => {
    setValues(initialValue)
  }

  const handleCopy = (value: T) => {
    setValues(value)
  }

  const getTextInputProps = (name: keyof T) => {
    const value = values[name]
    const onChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => handleChangeText(name, e.target.value)
    const onBlur = () => handleBlur(name)
    const label = name

    return { value, onChange, onBlur, label }
  }

  return {
    values,
    touched,
    handleChangeText,
    getTextInputProps,
    handleTextClear,
    handleCopy
  }
}
export default useInput
