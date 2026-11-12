import { useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/Common'
import { Icon } from '../components/Icon'
import { ProductImage } from '../components/ProductImage'
import { useStore } from '../store/useStore'
import { daysUntil, formatDate, formatMoney } from '../utils/helpers'
import { personLabel } from '../utils/reminders'
import { suggestFor } from '../utils/suggest'

/** Pantalla 3 · Se llega desde el aviso: pocos regalos elegidos para esa persona. Un toque y al pago. */
export function CalendarSuggestion() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const person = useStore((s) => s.people.find((x) => x.id === personId))
  const products = useStore((s) => s.products)
  const reviews = useStore((s) => s.reviews)
  const sellers = useStore((s) => s.sellers)
  const holidays = useStore((s) => s.holidays)
  const confirmSuggestion = useStore((s) => s.confirmSuggestion)

  const suggestions = useMemo(
    () => (person ? suggestFor(person, products, reviews, holidays) : []),
    [person, products, reviews, holidays],
  )

  if (!person) return <Navigate to="/calendario" replace />

  const holiday = holidays.find((h) => h.id === person.holidayId)
  const left = daysUntil(person.date)

  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon="info"
        title="No encontramos regalos para esta persona"
        text={`Ningún regalo de hasta ${formatMoney(person.budget)} es para su edad y sexo. Prueba subiendo un poco el presupuesto.`}
        actionLabel="Volver a mis personas"
        actionTo="/calendario"
      />
    )
  }

  const choose = (productId: string) => {
    if (confirmSuggestion(person.id, productId)) navigate('/checkout')
  }

  return (
    <div className="sug-wrap sug-wide">
      <Link to="/calendario" className="link-btn cal-back">
        <Icon name="arrowLeft" size={15} /> Mis personas
      </Link>

      <p className="sug-for">
        <Icon name={holiday?.icon ?? 'calendar'} size={16} /> {holiday?.name} de <strong>{person.name}</strong> ·{' '}
        {formatDate(person.date)}
        {left >= 0 && ` · ${left === 0 ? 'es hoy' : left === 1 ? 'es mañana' : `faltan ${left} días`}`}
      </p>
      <h1 className="sug-title">
        {suggestions.length} {suggestions.length === 1 ? 'regalo elegido' : 'regalos elegidos'} para {personLabel(person)}
      </h1>
      <p className="muted sug-sub">Dentro de tus {formatMoney(person.budget)}. Toca el que más te guste y vas directo al pago.</p>

      <ol className="sug-list">
        {suggestions.map(({ product, reasons }, i) => {
          const seller = sellers.find((s) => s.id === product.sellerId)
          const methods = [product.delivery.pickup && 'Recogida', product.delivery.shipping && 'Envío'].filter(Boolean).join(' o ')
          return (
            <li key={product.id} className="sug-item">
              <Link to={`/regalo/${product.id}`} className="sug-thumb" aria-label={`Ver ${product.title}`}>
                <ProductImage src={product.images[0]} tone={product.tone} alt={product.title} w={320} h={320} eager={i < 3} fill />
                {i === 0 && <span className="sug-best">Mejor opción</span>}
              </Link>
              <div className="sug-info">
                <h2>{product.title}</h2>
                <span className="muted">
                  {seller?.name} · {methods}
                </span>
                <ul className="sug-reasons">
                  {reasons.slice(0, 3).map((r) => (
                    <li key={r}>
                      <Icon name="check" size={13} strokeWidth={2.6} /> {r}
                    </li>
                  ))}
                </ul>
                <div className="sug-buy">
                  <b className="sug-price">{formatMoney(product.price)}</b>
                  <button className="btn btn-sm btn-primary" onClick={() => choose(product.id)}>
                    Elegir este
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="sug-trust">
        <Icon name="lock" size={16} /> Tu pago queda retenido hasta que confirmes que el regalo llegó.
      </p>
    </div>
  )
}
