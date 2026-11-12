import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumbs, EmptyState, QtyStepper } from '../components/Common'
import { Icon } from '../components/Icon'
import { ProductCard } from '../components/ProductCard'
import { ProductImage } from '../components/ProductImage'
import { ReviewItem } from '../components/Reviews'
import { SellerAvatar } from '../components/SellerAvatar'
import { Rating } from '../components/Stars'
import { useSellerStats } from '../store/hooks'
import { useStore } from '../store/useStore'
import { formatMoney } from '../utils/helpers'

const MAX_DEDICATION = 140

export function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = useStore((s) => s.products.find((p) => p.id === id))
  const seller = useStore((s) => s.sellers.find((x) => x.id === product?.sellerId))
  const holidays = useStore((s) => s.holidays)
  const categories = useStore((s) => s.categories)
  const products = useStore((s) => s.products)
  const reviews = useStore((s) => s.reviews)
  const inWishlist = useStore((s) => (id ? s.wishlist.includes(id) : false))
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const addToCart = useStore((s) => s.addToCart)
  const stats = useSellerStats(product?.sellerId ?? '')

  const [photo, setPhoto] = useState(0)
  const [qty, setQty] = useState(1)
  const [dedication, setDedication] = useState('')

  useEffect(() => {
    setPhoto(0)
    setQty(1)
    setDedication('')
  }, [id])

  const related = useMemo(() => {
    if (!product) return []
    return products
      .filter((p) => p.active && p.id !== product.id)
      .map((p) => ({
        p,
        score:
          (p.categoryId === product.categoryId ? 2 : 0) + p.holidays.filter((h) => product.holidays.includes(h)).length,
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.p.sold - a.p.sold)
      .slice(0, 4)
      .map((x) => x.p)
  }, [products, product])

  const sellerReviews = useMemo(
    () => reviews.filter((r) => r.sellerId === product?.sellerId).slice(0, 3),
    [reviews, product?.sellerId],
  )

  if (!product || !seller) {
    return (
      <EmptyState
        icon="gift"
        title="Este regalo ya no está disponible"
        text="Puede que el vendedor lo haya retirado. Mira otras opciones en el catálogo."
        actionLabel="Ir al catálogo"
        actionTo="/catalogo"
      />
    )
  }

  const category = categories.find((c) => c.id === product.categoryId)
  const soldOut = product.stock <= 0
  const paused = !product.active

  const add = () => addToCart(product.id, qty, dedication.trim())
  const buyNow = () => {
    if (addToCart(product.id, qty, dedication.trim())) navigate('/carrito')
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Catálogo', to: '/catalogo' },
          ...(category ? [{ label: category.name, to: `/catalogo?cat=${category.id}` }] : []),
          { label: product.title },
        ]}
      />

      <div className="detail">
        {/* ───────── Galería */}
        <div className="gallery">
          <div className="gallery-main">
            <ProductImage
              src={product.images[photo]}
              tone={product.tone}
              alt={`${product.title}, foto ${photo + 1}`}
              w={900}
              h={720}
              eager
            />
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  className={i === photo ? 'on' : ''}
                  onClick={() => setPhoto(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-pressed={i === photo}
                >
                  <ProductImage src={src} tone={product.tone} alt="" w={200} h={160} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ───────── Información y compra */}
        <div className="buybox">
          <div className="chips tight">
            {product.holidays.map((h) => {
              const hol = holidays.find((x) => x.id === h)
              return hol ? (
                <Link key={h} to={`/catalogo?fiesta=${h}`} className="chip-link">
                  <Icon name={hol.icon} size={13} /> {hol.name}
                </Link>
              ) : null
            })}
          </div>

          <h1>{product.title}</h1>

          <div className="buybox-seller">
            <SellerAvatar seller={seller} size={36} />
            <div>
              <Link to={`/tienda/${seller.id}`} className="seller-link">
                {seller.name}
                {seller.verified && <Icon name="badge" size={15} />}
              </Link>
              <Rating avg={stats.avg} count={stats.count} size={13} />
            </div>
          </div>

          <div className="detail-price">
            <small>Bs</small>
            {formatMoney(product.price, false)}
          </div>

          <p className="detail-desc">{product.description}</p>

          <div className={`stock ${product.stock <= 5 ? 'low' : ''}`}>
            <Icon name="packageCheck" size={16} />
            {soldOut ? 'Agotado' : product.stock <= 5 ? `Últimas ${product.stock} unidades` : `${product.stock} disponibles`}
            <span className="dot" />
            {product.sold} vendidos
          </div>

          {/* Opciones de entrega que definió el vendedor */}
          <div className="delivery-box">
            <h3>Cómo lo recibes</h3>
            {product.delivery.pickup && (
              <div className="delivery-row">
                <Icon name="pin" size={18} />
                <div>
                  <strong>Recogida en el punto del vendedor</strong>
                  <span>{seller.pickupAddress}</span>
                </div>
                <b className="free">Gratis</b>
              </div>
            )}
            {product.delivery.shipping && (
              <div className="delivery-row">
                <Icon name="truck" size={18} />
                <div>
                  <strong>Envío a donde tú indiques</strong>
                  <span>{product.delivery.shippingZones}</span>
                </div>
                <b>{formatMoney(product.delivery.shippingCost)}</b>
              </div>
            )}
          </div>

          <label className="field">
            <span>
              Mensaje de dedicatoria <em>(opcional)</em>
            </span>
            <textarea
              rows={2}
              maxLength={MAX_DEDICATION}
              placeholder="Escribe unas palabras para acompañar el regalo…"
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
            />
            <small className="counter">
              {dedication.length}/{MAX_DEDICATION}
            </small>
          </label>

          <div className="buy-actions">
            <QtyStepper value={qty} max={Math.max(1, product.stock)} onChange={setQty} />
            <button className="btn btn-primary grow" onClick={add} disabled={soldOut || paused}>
              <Icon name="cart" size={18} /> Agregar al carrito
            </button>
            <button
              className={`btn-square ${inWishlist ? 'on' : ''}`}
              aria-pressed={inWishlist}
              aria-label={inWishlist ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              onClick={() => toggleWishlist(product.id)}
            >
              <Icon name="heart" size={20} filled={inWishlist} />
            </button>
          </div>
          <button className="btn btn-outline wide" onClick={buyNow} disabled={soldOut || paused}>
            Comprar ahora
          </button>

          <div className="escrow-note">
            <Icon name="shield" size={20} />
            <p>
              <strong>Compra protegida.</strong> Tu pago queda retenido en Regalalo y solo se libera al vendedor cuando
              confirmas que recibiste tu regalo.
            </p>
          </div>
        </div>
      </div>

      {/* ───────── Vendedor + reseñas */}
      <section className="section">
        <div className="section-head">
          <div>
            <h2>Sobre el vendedor</h2>
            <p>Lo que opinan quienes ya le compraron.</p>
          </div>
          <Link to={`/tienda/${seller.id}`} className="link-more">
            Ver perfil completo <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="seller-panel">
          <div className="seller-panel-top">
            <SellerAvatar seller={seller} size={64} />
            <div>
              <h3>
                {seller.name}
                {seller.verified && (
                  <span className="verified" title="Vendedor verificado">
                    <Icon name="badge" size={18} />
                  </span>
                )}
              </h3>
              <div className="city">
                <Icon name="pin" size={13} /> {seller.city} · Vende desde {seller.joined}
              </div>
              <Rating avg={stats.avg} count={stats.count} size={15} />
            </div>
          </div>
          <p>{seller.bio}</p>
        </div>
        <div className="reviews">
          {sellerReviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
          {sellerReviews.length === 0 && <p className="muted">Este vendedor aún no tiene reseñas.</p>}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>También te puede gustar</h2>
            </div>
          </div>
          <div className="grid-products">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
