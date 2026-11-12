import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumbs, EmptyState } from '../components/Common'
import { Icon } from '../components/Icon'
import { ProductCard } from '../components/ProductCard'
import { RatingSummary, ReviewItem } from '../components/Reviews'
import { SellerAvatar } from '../components/SellerAvatar'
import { useSellerStats } from '../store/hooks'
import { useStore } from '../store/useStore'

type ReviewSort = 'recent' | 'best' | 'worst'

export function SellerProfile() {
  const { id } = useParams()
  const seller = useStore((s) => s.sellers.find((x) => x.id === id))
  const products = useStore((s) => s.products)
  const reviews = useStore((s) => s.reviews)
  const stats = useSellerStats(id ?? '')

  const [stars, setStars] = useState(0)
  const [sort, setSort] = useState<ReviewSort>('recent')

  const sellerProducts = useMemo(() => products.filter((p) => p.sellerId === id && p.active), [products, id])

  const shownReviews = useMemo(() => {
    const list = reviews.filter((r) => r.sellerId === id && (!stars || r.rating === stars))
    return [...list].sort((a, b) => {
      if (sort === 'best') return b.rating - a.rating || b.date.localeCompare(a.date)
      if (sort === 'worst') return a.rating - b.rating || b.date.localeCompare(a.date)
      return b.date.localeCompare(a.date)
    })
  }, [reviews, id, stars, sort])

  if (!seller) {
    return (
      <EmptyState
        icon="store"
        title="No encontramos a este vendedor"
        text="Revisa el enlace o explora el catálogo."
        actionLabel="Ir al catálogo"
        actionTo="/catalogo"
      />
    )
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Vendedores' }, { label: seller.name }]} />

      <section className="profile-head">
        <div className="profile-id">
          <SellerAvatar seller={seller} size={92} />
          <div>
            <h1>
              {seller.name}
              {seller.verified && (
                <span className="verified" title="Vendedor verificado">
                  <Icon name="badge" size={24} />
                </span>
              )}
            </h1>
            <div className="profile-meta">
              <span>
                <Icon name="pin" size={14} /> {seller.city}
              </span>
              <span>
                <Icon name="calendar" size={14} /> Vende desde {seller.joined}
              </span>
              <span>
                <Icon name="store" size={14} /> {sellerProducts.length} regalos activos
              </span>
            </div>
            <p>{seller.bio}</p>
            <div className="profile-pickup">
              <Icon name="pin" size={15} /> Punto de recogida: {seller.pickupAddress}
            </div>
          </div>
        </div>
        <RatingSummary stats={stats} />
      </section>

      <section className="section" id="resenas">
        <div className="section-head">
          <div>
            <h2>Reseñas de compradores</h2>
            <p>Calificaciones dejadas después de recibir el pedido.</p>
          </div>
          <label className="sort">
            <span>Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as ReviewSort)}>
              <option value="recent">Más recientes</option>
              <option value="best">Mejor calificadas</option>
              <option value="worst">Menos calificadas</option>
            </select>
          </label>
        </div>
        <div className="chips" style={{ marginBottom: 18 }} role="group" aria-label="Filtrar reseñas por estrellas">
          <button className="chip" aria-pressed={stars === 0} onClick={() => setStars(0)}>
            Todas
          </button>
          {[5, 4, 3, 2, 1].map((n) => (
            <button key={n} className="chip" aria-pressed={stars === n} onClick={() => setStars(n)}>
              {n} <Icon name="star" size={13} filled />
            </button>
          ))}
        </div>
        <div className="reviews">
          {shownReviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
          {shownReviews.length === 0 && <p className="muted">No hay reseñas con ese filtro.</p>}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Regalos de {seller.name}</h2>
          </div>
        </div>
        {sellerProducts.length === 0 ? (
          <p className="muted">Este vendedor no tiene regalos activos en este momento.</p>
        ) : (
          <div className="grid-products">
            {sellerProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
