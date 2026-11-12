import { Icon } from './Icon'
import type { Order, OrderStatus } from '../types'
import { readyLabel } from '../utils/helpers'

const STEP_INDEX: Record<OrderStatus, number> = { pending: 0, accepted: 1, preparing: 2, ready: 3, delivered: 4 }

/** Línea de tiempo del pedido (la usan el comprador y el vendedor). */
export function OrderTimeline({ order }: { order: Order }) {
  const steps = ['Pagado', 'Aceptado', 'En preparación', readyLabel(order.method), 'Recibido']
  const current = STEP_INDEX[order.status]
  return (
    <ol className="timeline" aria-label="Estado del pedido">
      {steps.map((label, i) => (
        <li key={label} className={i < current ? 'done' : i === current ? 'current' : ''}>
          <span className="dot">{i <= current ? <Icon name="check" size={13} strokeWidth={3} /> : null}</span>
          <span className="label">{label}</span>
        </li>
      ))}
    </ol>
  )
}
