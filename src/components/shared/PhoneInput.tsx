import React, { useState } from 'react'
import { formatPhone } from '../../utils/phoneFormat'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  id?: string
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  disabled,
  className = 'field-input',
  id,
}) => {
  const [raw, setRaw] = useState(value)

  // Sync if parent value changes (e.g. record switch)
  React.useEffect(() => {
    setRaw(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setRaw(v)
    onChange(v)
  }

  const handleBlur = () => {
    const formatted = formatPhone(raw)
    setRaw(formatted)
    onChange(formatted)
  }

  return (
    <input
      id={id}
      type="tel"
      className={className}
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder="(555) 555-5555"
      maxLength={20}
    />
  )
}
