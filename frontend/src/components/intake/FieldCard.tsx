import type { ReactNode } from 'react'
import { MapPin, Compass, Calendar, Clock, Users, CreditCard, Star, Info, ChevronDown, Search } from 'lucide-react'

interface FieldCardProps {
  icon: string
  label: string
  children: ReactNode
  full?: boolean
}

const ICON_MAP: Record<string, React.ReactNode> = {
  my_location: <MapPin size={20} />,
  travel_explore: <Compass size={20} />,
  event: <Calendar size={20} />,
  schedule: <Clock size={20} />,
  group: <Users size={20} />,
  payments: <CreditCard size={20} />,
  interests: <Star size={20} />,
  info: <Info size={15} />,
  expand_more: <ChevronDown size={18} />,
  calendar_month: <Calendar size={19} />,
  savings: <Search size={19} />,
}

export function FieldCard({ icon, label, children, full }: FieldCardProps) {
  return (
    <div className={`field-card${full ? ' full' : ''}`}>
      <div className="field-head">
        {ICON_MAP[icon] ?? <Info size={20} />}
        <span className="field-label">{label}</span>
      </div>
      <div className="field-body">{children}</div>
    </div>
  )
}
