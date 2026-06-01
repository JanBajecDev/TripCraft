import { Minus, Plus } from 'lucide-react'

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
        <Minus size={20} />
      </button>
      <span className="step-val">{value}<span className="step-suffix">{suffix}</span></span>
      <button type="button" className="step-btn" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase">
        <Plus size={20} />
      </button>
    </div>
  )
}
