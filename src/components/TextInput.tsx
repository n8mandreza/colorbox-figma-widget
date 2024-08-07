import { JSX, h } from "preact";
import styles from './TextInputStyles.css'

interface SelectProps {
  id: string
  label: string
  type?: 'text' | 'number'
  value?: string | number
  hideLabel?: boolean
  placeholder?: string
  onInput?: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => void
}

export default function TextInput({ id, label, type = 'text', value = '', hideLabel = false, placeholder = '', onInput}: SelectProps) {
  return (
    <div class={styles.textInputContainer}>
      {hideLabel ? null : (
        <label for={id} class={styles.textInputLabel}>
          {label}
        </label>
      )}

      <input 
        id={id} 
        type={type}
        placeholder={placeholder} 
        onInput={onInput}
        value={value}
        class="w-full px-3 py-2 text-base rounded-lg bg-subtle placeholder:text-02"
      />
    </div>
  )
}