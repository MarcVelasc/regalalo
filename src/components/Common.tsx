import { Link } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

interface EmptyProps {
  icon: IconName
  title: string
  text: string
  actionLabel?: string
  actionTo?: string
}

export function EmptyState({ icon, title, text, actionLabel, actionTo }: EmptyProps) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={32} strokeWidth={1.7} />
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Ruta de navegación">
      {items.map((c, i) => (
        <span key={c.label} className="crumb">
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          {i < items.length - 1 && <Icon name="chevron" size={14} />}
        </span>
      ))}
    </nav>
  )
}

interface QtyProps {
  value: number
  max: number
  onChange: (n: number) => void
  size?: 'md' | 'sm'
}

export function QtyStepper({ value, max, onChange, size = 'md' }: QtyProps) {
  return (
    <div className={`qty ${size}`}>
      <button type="button" aria-label="Quitar uno" onClick={() => onChange(value - 1)} disabled={value <= 1}>
        <Icon name="minus" size={16} strokeWidth={2.6} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Agregar uno" onClick={() => onChange(value + 1)} disabled={value >= max}>
        <Icon name="plus" size={16} strokeWidth={2.6} />
      </button>
    </div>
  )
}
