import { Star } from 'lucide-react'
import { useState } from 'react'

const five = (size: number) =>
  [0, 1, 2, 3, 4].map((i) => <Star key={i} size={size} strokeWidth={0} fill="currentColor" aria-hidden="true" />)

interface StarsProps {
  value: number
  size?: number
}

/** Estrellas con relleno parcial (ej. 4.6 llena 4 estrellas y 60% de la quinta). */
export function Stars({ value, size = 14 }: StarsProps) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  return (
    <span className="stars" role="img" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      <span className="base">{five(size)}</span>
      <span className="fill" style={{ width: `${pct}%` }}>
        <span className="inner">{five(size)}</span>
      </span>
    </span>
  )
}

interface RatingProps {
  avg: number
  count: number
  size?: number
}

export function Rating({ avg, count, size = 14 }: RatingProps) {
  if (!count) {
    return <span className="rating muted">Sin reseñas aún</span>
  }
  return (
    <span className="rating">
      <Stars value={avg} size={size} />
      <b>{avg.toFixed(1)}</b>
      <span className="muted">({count})</span>
    </span>
  )
}

interface StarInputProps {
  value: number
  onChange: (v: number) => void
  size?: number
}

const RATING_WORDS = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente']

/** Selector de calificación de 1 a 5 estrellas (para reseñas). */
export function StarInput({ value, onChange, size = 34 }: StarInputProps) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="star-input">
      <div role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
            className={n <= shown ? 'on' : ''}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
          >
            <Star size={size} strokeWidth={1.5} fill={n <= shown ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        ))}
      </div>
      <span className="star-word">{RATING_WORDS[shown] || 'Toca una estrella'}</span>
    </div>
  )
}
