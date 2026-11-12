import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/Common'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { OrderTimeline } from '../components/OrderTimeline'
import { ProductImage } from '../components/ProductImage'
import { SellerAvatar } from '../components/SellerAvatar'
import { StarInput } from '../components/Stars'
import { useStore } from '../store/useStore'
import type { Order } from '../types'
import { formatDate, formatMoney, isoFromTimestamp, methodLabel } from '../utils/helpers'

function OrderCard({
  order,
  onConfirm,
  onReview,
}: {
  order: Order
  onConfirm: (o: Order) => void
  onReview: (o: Order) => void
}) {
  const seller = useStore((s) => s.sellers.find((x) => x.id === order.sellerId))
  const inProgress = order.status === 'pending' || order.status === 'accepted' || order.status === 'preparing'

  return (
    <article className="order">
      <header className="order-head">
        <div className="order-id">
          <strong>{order.id}</strong>
          <span className="muted">Pedido el {formatDate(isoFromTimestamp(order.createdAt))}</span>
        </div>
        {seller && (
          <Link to={`/tienda/${seller.id}`} className="order-seller">
            <SellerAvatar seller={seller} size={30} />
            {seller.name}
          </Link>
        )}
        <span className={`pay-badge ${order.payment}`}>
          <Icon name={order.payment === 'held' ? 'lock' : 'unlock'} size={14} />
          {order.payment === 'held' ? 'Pago retenido' : 'Pago liberado'}
        </span>
      </header>

      <OrderTimeline order={order} />

      <div className="order-items">
        {order.items.map((i) => (
          <div key={i.productId} className="order-item">
            <Link to={`/regalo/${i.productId}`} className="cart-thumb small">
              <ProductImage src={i.image} tone={i.tone} alt={i.title} w={160} h={160} />
            </Link>
            <div>
              <Link to={`/regalo/${i.productId}`} className="cart-title">
                {i.title}
              </Link>
              <span className="muted">
                {i.qty} × {formatMoney(i.price)}
              </span>
              {i.dedication && <em className="dedication">“{i.dedication}”</em>}
            </div>
            <b>{formatMoney(i.price * i.qty)}</b>
          </div>
        ))}
      </div>

      <div className="order-foot">
        <div className="order-delivery">
          <Icon name={order.method === 'pickup' ? 'pin' : 'truck'} size={17} />
          <div>
            <strong>{methodLabel(order.method)}</strong>
            <span>
              {order.address} · {formatDate(order.date)}
            </span>
          </div>
        </div>
        <div className="order-totals">
          <span className="muted">
            Regalos {formatMoney(order.subtotal)}
            {order.shippingCost > 0 && ` + envío ${formatMoney(order.shippingCost)}`}
          </span>
          <strong>{formatMoney(order.total)}</strong>
        </div>
      </div>

      {order.payment === 'held' && (
        <div className="notice">
          <Icon name="shield" size={18} />
          <p>
            Tu dinero está protegido por Regalalo y se entrega al vendedor cuando confirmes la recepción.
            {inProgress && ' Podrás confirmar la recepción cuando el vendedor lo marque como listo.'}
          </p>
        </div>
      )}

      <div className="order-actions">
        {order.status === 'ready' && (
          <button className="btn btn-primary" onClick={() => onConfirm(order)}>
            <Icon name="packageCheck" size={18} /> Ya recibí mi pedido
          </button>
        )}
        {order.status === 'delivered' && !order.reviewed && (
          <button className="btn btn-gold" onClick={() => onReview(order)}>
            <Icon name="star" size={18} filled /> Calificar al vendedor
          </button>
        )}
        {order.status === 'delivered' && order.reviewed && (
          <span className="reviewed-tag">
            <Icon name="check" size={16} strokeWidth={3} /> Ya calificaste a este vendedor
          </span>
        )}
      </div>
    </article>
  )
}

type Tab = 'all' | 'active' | 'done'

export function Orders() {
  const orders = useStore((s) => s.orders)
  const confirmReceived = useStore((s) => s.confirmReceived)
  const addReview = useStore((s) => s.addReview)
  const sellers = useStore((s) => s.sellers)

  const [tab, setTab] = useState<Tab>('all')
  const [confirming, setConfirming] = useState<Order | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const counts = useMemo(
    () => ({
      all: orders.length,
      active: orders.filter((o) => o.status !== 'delivered').length,
      done: orders.filter((o) => o.status === 'delivered').length,
    }),
    [orders],
  )

  const shown = useMemo(
    () =>
      orders
        .filter((o) => (tab === 'all' ? true : tab === 'active' ? o.status !== 'delivered' : o.status === 'delivered'))
        .sort((a, b) => b.createdAt - a.createdAt),
    [orders, tab],
  )

  const reviewing = orders.find((o) => o.id === reviewingId) ?? null
  const reviewingSeller = sellers.find((s) => s.id === reviewing?.sellerId)

  const openReview = (o: Order) => {
    setRating(0)
    setComment('')
    setReviewingId(o.id)
  }

  const doConfirm = () => {
    if (!confirming) return
    const order = confirming
    confirmReceived(order.id)
    setConfirming(null)
    openReview(order) // justo después de recibir, invitamos a calificar
  }

  const submitReview = () => {
    if (!reviewing || rating < 1) return
    addReview(reviewing.id, rating, comment)
    setReviewingId(null)
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="Aún no tienes pedidos"
        text="Cuando compres un regalo, podrás seguir su estado aquí."
        actionLabel="Explorar regalos"
        actionTo="/catalogo"
      />
    )
  }

  return (
    <>
      <div className="page-head">
        <h1>Mis pedidos</h1>
        <p>Sigue tus compras y libera el pago cuando recibas cada regalo.</p>
      </div>

      <div className="chips" style={{ marginBottom: 22 }} role="tablist">
        {(
          [
            ['all', 'Todos'],
            ['active', 'En curso'],
            ['done', 'Completados'],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} role="tab" className="chip" aria-pressed={tab === k} onClick={() => setTab(k)}>
            {label} ({counts[k]})
          </button>
        ))}
      </div>

      <div className="orders">
        {shown.map((o) => (
          <OrderCard key={o.id} order={o} onConfirm={setConfirming} onReview={openReview} />
        ))}
        {shown.length === 0 && <p className="muted">No hay pedidos en esta sección.</p>}
      </div>

      {confirming && (
        <Modal
          title="¿Recibiste tu pedido?"
          onClose={() => setConfirming(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setConfirming(null)}>
                Todavía no
              </button>
              <button className="btn btn-primary" onClick={doConfirm}>
                Sí, lo recibí
              </button>
            </>
          }
        >
          <p>
            Al confirmar, Regalalo liberará <strong>{formatMoney(confirming.total)}</strong> al vendedor. Hazlo solo si ya
            tienes tu regalo en las manos.
          </p>
        </Modal>
      )}

      {reviewing && (
        <Modal
          title={`Califica a ${reviewingSeller?.name ?? 'el vendedor'}`}
          onClose={() => setReviewingId(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setReviewingId(null)}>
                Ahora no
              </button>
              <button className="btn btn-primary" disabled={rating < 1} onClick={submitReview}>
                Publicar reseña
              </button>
            </>
          }
        >
          <p className="muted" style={{ marginBottom: 14 }}>
            Tu opinión ayuda a otros compradores a elegir con confianza. Pedido {reviewing.id}.
          </p>
          <StarInput value={rating} onChange={setRating} />
          <label className="field" style={{ marginTop: 18 }}>
            <span>
              Cuéntanos cómo fue <em>(opcional)</em>
            </span>
            <textarea
              rows={3}
              maxLength={300}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿El regalo llegó a tiempo? ¿Era como en las fotos?"
            />
            <small className="counter">{comment.length}/300</small>
          </label>
        </Modal>
      )}
    </>
  )
}
