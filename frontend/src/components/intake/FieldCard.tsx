import type { ReactNode } from 'react'

interface FieldCardProps {
  icon: string
  label: string
  children: ReactNode
  full?: boolean
}

export function FieldCard({ icon, label, children, full }: FieldCardProps) {
  return (
    <div className={`field-card${full ? ' full' : ''}`}>
      <div className="field-head">
        <span className="material-symbols-outlined">{icon}</span>
        <span className="field-label">{label}</span>
      </div>
      <div className="field-body">{children}</div>
    </div>
  )
}
