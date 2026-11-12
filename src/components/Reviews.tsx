import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import type { Review } from '../types'
import { formatDate, type SellerStats } from '../utils/helpers'
import { Stars } from './Stars'

/** Una reseña de un comprador. */
export function ReviewItem({ review, showProduct = true }: { review: Review; showProduct?: boolean }) {
  const product = useStore((s) => (review.productId ? s.products.find((p) => p.id === review.productId) : undefined))
  return (
    <article className="review">
      <div className="review-avatar" aria-hidden="true">
        {review.author[0]}
      </div>
      <div className="review-main">
        <div className="review-top">
          <strong>{review.author}</strong>
          <Stars value={review.rating} size={14} />
          <span className="muted">{formatDate(review.date)}</span>
        </div>
        <p>{review.comment}</p>
        {showProduct && product && (
          <Link to={`/regalo/${product.id}`} className="review-product">
            Compró: {product.title}
          </Link>
        )}
      </div>
    </article>
  )
}

/** Promedio grande + barras de distribución por estrellas. */
export function RatingSummary({ stats }: { stats: SellerStats }) {
  return (
    <div className="rating-summary">
      <div className="rating-big">
        <div className="num">{stats.count ? stats.avg.toFixed(1) : '–'}</div>
        <Stars value={stats.avg} size={20} />
        <div className="muted">
          {stats.count} {stats.count === 1 ? 'reseña' : 'reseñas'}
        </div>
      </div>
      <div className="rating-bars">
        {stats.distribution.map((n, i) => {
          const pct = stats.count ? (n / stats.count) * 100 : 0
          return (
            <div key={i} className="bar-row">
              <span>{5 - i}</span>
              <div className="bar">
                <div style={{ width: `${pct}%` }} />
              </div>
              <span className="muted">{n}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
