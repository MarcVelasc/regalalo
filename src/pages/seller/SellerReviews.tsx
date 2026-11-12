import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/Common'
import { Icon } from '../../components/Icon'
import { RatingSummary, ReviewItem } from '../../components/Reviews'
import { useSellerStats } from '../../store/hooks'
import { useStore } from '../../store/useStore'

type Sort = 'recent' | 'best' | 'worst'

export function SellerReviews() {
  const sellerId = useStore((s) => s.currentSellerId)
  const reviews = useStore((s) => s.reviews)
  const stats = useSellerStats(sellerId)
  const [stars, setStars] = useState(0)
  const [sort, setSort] = useState<Sort>('recent')

  const shown = useMemo(() => {
    const list = reviews.filter((r) => r.sellerId === sellerId && (!stars || r.rating === stars))
    return [...list].sort((a, b) => {
      if (sort === 'best') return b.rating - a.rating || b.date.localeCompare(a.date)
      if (sort === 'worst') return a.rating - b.rating || b.date.localeCompare(a.date)
      return b.date.localeCompare(a.date)
    })
  }, [reviews, sellerId, stars, sort])

  if (stats.count === 0) {
    return (
      <EmptyState
        icon="star"
        title="Aún no tienes reseñas"
        text="Los compradores te calificarán después de recibir su pedido."
        actionLabel="Ver pedidos"
        actionTo="/panel/pedidos"
      />
    )
  }

  return (
    <>
      <div className="page-head">
        <h1>Mis reseñas</h1>
        <p>Así te ven los compradores. Esta calificación aparece en tus regalos y en tu perfil público.</p>
      </div>

      <div className="reviews-top">
        <RatingSummary stats={stats} />
      </div>

      <div className="section-head" style={{ marginTop: 36 }}>
        <div className="chips" role="group" aria-label="Filtrar por estrellas">
          <button className="chip" aria-pressed={stars === 0} onClick={() => setStars(0)}>
            Todas
          </button>
          {[5, 4, 3, 2, 1].map((n) => (
            <button key={n} className="chip" aria-pressed={stars === n} onClick={() => setStars(n)}>
              {n} <Icon name="star" size={13} filled />
            </button>
          ))}
        </div>
        <label className="sort">
          <span>Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="recent">Más recientes</option>
            <option value="best">Mejor calificadas</option>
            <option value="worst">Menos calificadas</option>
          </select>
        </label>
      </div>

      <div className="reviews">
        {shown.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
        {shown.length === 0 && <p className="muted">No hay reseñas con ese filtro.</p>}
      </div>
    </>
  )
}
