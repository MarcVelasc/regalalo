import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState, QtyStepper } from '../components/Common'
import { Icon } from '../components/Icon'
import { ProductImage } from '../components/ProductImage'
import { SellerAvatar } from '../components/SellerAvatar'
import { Rating } from '../components/Stars'
import { useSellerStats } from '../store/hooks'
import { useStore } from '../store/useStore'
import { groupCart, type CartGroup } from '../utils/cart'
import { formatMoney } from '../utils/helpers'

function SellerGroup({ group }: { group: CartGroup }) {
  const seller = useStore((s) => s.sellers.find((x) => x.id === group.sellerId))
  const updateCartQty = useStore((s) => s.updateCartQty)
  const setCartDedication = useStore((s) => s.setCartDedication)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const stats = useSellerStats(group.sellerId)
  if (!seller) return null

  return (
    <section className="cart-group">
      <header className="cart-group-head">
        <SellerAvatar seller={seller} size={40} />
        <div>
          <Link to={`/tienda/${seller.id}`} className="seller-link">
            {seller.name}
          </Link>
          <Rating avg={stats.avg} count={stats.count} size={12} />
        </div>
        <span className="muted order-note">Pedido independiente</span>
      </header>

      {group.methods.length === 0 && (
        <div className="notice warn">
          <Icon name="info" size={18} />
          <p>
            Estos regalos no comparten una forma de entrega (uno solo se recoge y otro solo se envía). Quita uno de ellos
            para continuar.
          </p>
        </div>
      )}

      {group.lines.map(({ item, product }) => (
        <div key={product.id} className="cart-line">
          <Link to={`/regalo/${product.id}`} className="cart-thumb">
            <ProductImage src={product.images[0]} tone={product.tone} alt={product.title} w={240} h={240} />
          </Link>
          <div className="cart-info">
            <Link to={`/regalo/${product.id}`} className="cart-title">
              {product.title}
            </Link>
            <span className="muted">{formatMoney(product.price)} c/u</span>
            <input
              className="dedication-input"
              type="text"
              maxLength={140}
              placeholder="Mensaje de dedicatoria (opcional)"
              value={item.dedication}
              onChange={(e) => setCartDedication(product.id, e.target.value)}
              aria-label={`Dedicatoria para ${product.title}`}
            />
          </div>
          <div className="cart-qty">
            <QtyStepper value={item.qty} max={product.stock} onChange={(n) => updateCartQty(product.id, n)} size="sm" />
          </div>
          <div className="cart-total">{formatMoney(product.price * item.qty)}</div>
          <button className="icon-plain" aria-label={`Quitar ${product.title}`} onClick={() => removeFromCart(product.id)}>
            <Icon name="trash" size={18} />
          </button>
        </div>
      ))}

      <footer className="cart-group-foot">
        <span>Subtotal de {seller.name}</span>
        <strong>{formatMoney(group.subtotal)}</strong>
      </footer>
    </section>
  )
}

export function Cart() {
  const navigate = useNavigate()
  const cart = useStore((s) => s.cart)
  const products = useStore((s) => s.products)
  const groups = useMemo(() => groupCart(cart, products), [cart, products])

  if (groups.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title="Tu carrito está vacío"
        text="Explora los regalos para cada festividad y agrega tus favoritos."
        actionLabel="Explorar regalos"
        actionTo="/catalogo"
      />
    )
  }

  const subtotal = groups.reduce((acc, g) => acc + g.subtotal, 0)
  const blocked = groups.some((g) => g.methods.length === 0)
  const count = cart.reduce((acc, c) => acc + c.qty, 0)

  return (
    <>
      <div className="page-head">
        <h1>Tu carrito</h1>
        <p>
          {count} {count === 1 ? 'regalo' : 'regalos'} de {groups.length} {groups.length === 1 ? 'vendedor' : 'vendedores'}
        </p>
      </div>

      <div className="cart-layout">
        <div className="cart-groups">
          {groups.map((g) => (
            <SellerGroup key={g.sellerId} group={g} />
          ))}
        </div>

        <aside className="summary">
          <h2>Resumen</h2>
          <div className="sum-row">
            <span>Regalos</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="sum-row muted">
            <span>Envío</span>
            <span>Se calcula en el pago</span>
          </div>
          <div className="sum-row total">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <button className="btn btn-primary wide" disabled={blocked} onClick={() => navigate('/checkout')}>
            Continuar al pago <Icon name="arrow" size={18} />
          </button>
          <Link to="/catalogo" className="btn btn-outline wide">
            Seguir comprando
          </Link>
          <div className="escrow-note">
            <Icon name="shield" size={20} />
            <p>Pagas ahora, pero el vendedor recibe el dinero solo cuando confirmas la recepción.</p>
          </div>
        </aside>
      </div>
    </>
  )
}
