import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useSellerStats } from '../store/hooks'
import { formatMoney } from '../utils/helpers'
import type { Product } from '../types'
import { Icon } from './Icon'
import { ProductImage } from './ProductImage'
import { Rating } from './Stars'

export function ProductCard({ product }: { product: Product }) {
  const seller = useStore((s) => s.sellers.find((x) => x.id === product.sellerId))
  const inWishlist = useStore((s) => s.wishlist.includes(product.id))
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const addToCart = useStore((s) => s.addToCart)
  const stats = useSellerStats(product.sellerId)

  const soldOut = product.stock <= 0
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <article className="pcard">
      <Link to={`/regalo/${product.id}`} className="pcard-link" aria-label={`Ver ${product.title}`} />

      <div className="pcard-media">
        <ProductImage src={product.images[0]} tone={product.tone} alt={product.title} w={480} h={384} fill />
        <button
          className="pcard-fav"
          aria-pressed={inWishlist}
          aria-label={inWishlist ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onClick={() => toggleWishlist(product.id)}
        >
          <Icon name="heart" size={18} filled={inWishlist} />
        </button>
        <div className="pcard-tags">
          {product.delivery.pickup && (
            <span className="tag" title="Recogida en punto del vendedor">
              <Icon name="pin" size={11} strokeWidth={2.4} /> Recogida
            </span>
          )}
          {product.delivery.shipping && (
            <span className="tag" title="Envío a domicilio">
              <Icon name="truck" size={11} strokeWidth={2.4} /> Envío
            </span>
          )}
          {lowStock && <span className="tag tag-low">Quedan {product.stock}</span>}
        </div>
      </div>

      <div className="pcard-body">
        <h3 className="pcard-title">{product.title}</h3>
        {seller && (
          <div className="pcard-seller">
            <Link to={`/tienda/${seller.id}`}>{seller.name}</Link>
            <Rating avg={stats.avg} count={stats.count} size={12} />
          </div>
        )}
        <div className="price">
          <small>Bs</small>
          {formatMoney(product.price, false)}
        </div>
      </div>

      <button className="pcard-add" disabled={soldOut} onClick={() => addToCart(product.id)}>
        {soldOut ? (
          'Agotado'
        ) : (
          <>
            <Icon name="plus" size={18} strokeWidth={2.6} /> Agregar
          </>
        )}
      </button>
    </article>
  )
}
