import { JSX, h } from 'preact'
import RightChevron from '../icons/RightChevron'
import styles from './SelectStyles.css'

interface SelectItem {
  label: string
  value: string
}

interface SelectProps {
  label: string
  hideLabel?: boolean
  options: SelectItem[]
  selection: string | undefined
  caption?: string
  disabled?: boolean
  onChange: (event: JSX.TargetedEvent<HTMLSelectElement, Event>) => void
}

export default function Select({label, hideLabel = false, options, selection, caption, disabled = false, onChange}: SelectProps) {
  return (
    <div class={styles.selectContainer}>
      {hideLabel ? null : (
        <label for={label} class={styles.selectLabel + `${disabled ? ' fg-muted' : ' fg-default'}`}>{label}</label>
      )}

      <div class={`relative w-full px-3 py-2 text-base rounded-lg bg-subtle placeholder:fg-muted ${disabled ? 'fg-muted cursor-not-allowed' : 'fg-default cursor-pointer'}`}>
        <div class={styles.selectInputUI}>
          {options.find(option => option.value === selection)?.label || 'Select...'}
          <div class={styles.selectChevron}>
            <RightChevron/>
          </div>
        </div>

        <select id={label} name={label} aria-label={label} onChange={onChange} class={styles.selectInput} disabled={disabled}>
          {options.map((option: SelectItem) => (
            <option key={option.value} value={option.value} selected={selection === option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {caption ? <p class={styles.selectCaption + ` fg-muted`}>{caption}</p> : null}
    </div>
  )
}