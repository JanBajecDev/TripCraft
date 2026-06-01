interface StepperProps {
  value: number
  min: number
  max: number
  suffix: string
  onChange: (v: number) => void
}

export function Stepper({ value, min, max, suffix, onChange }: StepperProps) {
  return (
    <div className="stepper">
      <button type="button" className="step-btn" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease">
        <span className="material-symbols-outlined">remove</span>
      </button>
      <span className="step-val">{value}<span className="step-suffix">{suffix}</span></span>
      <button type="button" className="step-btn" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  )
}
