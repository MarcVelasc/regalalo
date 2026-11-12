import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/Common'
import { Icon } from '../../components/Icon'
import { OrderTimeline } from '../../components/OrderTimeline'
import { ProductImage } from '../../components/ProductImage'
import { COMMISSION_RATE } from '../../config'
import { useSellerFinance } from '../../store/hooks'
import { useStore } from '../../store/useStore'
import type { Order } from '../../types'
import { formatDate, formatMoney, isoFromTimestamp, methodLabel, nextActionLabel } from '../../utils/helpers'

type Tab = 'attend' | 'ready' | 'done' | 'all'

function SellerOrderCard({ order }: { order: Order }) {
  const advanceOrder = useStore((s) => s.advanceOrder)
  const action = nextActionLabel(order)

  return (
    <article className="order">
      <header className="order-head">
        <div className="order-id">
          <strong>{order.id}</strong>
          <span className="muted">Recibido el {formatDate(isoFromTimestamp(order.createdAt))}</span>
        </div>
        <div className="buyer-info">
          <strong>{order.buyerName}</strong>
          <span className="muted">
            <Icon name="phone" size={12} /> {order.buyerPhone}
          </span>
        </div>
        <span className={`pay-badge ${order.payment}`}>
          <Icon name={order.payment === 'held' ? 'lock' : 'unlock'} size={14} />
          {order.payment === 'held' ? 'Pago retenido' : 'Pago liberado'}
        </span>
      </header>

      <OrderTimeline order={order} />

      <div className="order-items">
        {order.items.map((i) => (
          <div key={i.productId} className="order-item">
            <span className="cart-thumb small">
              <ProductImage src={i.image} tone={i.tone} alt={i.title} w={160} h={160} />
            </span>
            <div>
              <strong className="cart-title">{i.title}</strong>
              <span className="muted">
                {i.qty} × {formatMoney(i.price)}
              </span>
              {i.dedication && (
                <span className="dedication-card">
                  <Icon name="pen" size={13} /> Dedicatoria: “{i.dedication}”
                </span>
              )}
            </div>
            <b>{formatMoney(i.price * i.qty)}</b>
          </div>
        ))}
      </div>

      <div className="order-split">
        <div className="order-delivery">
          <Icon name={order.method === 'pickup' ? 'pin' : 'truck'} size={18} />
          <div>
            <strong>{methodLabel(order.method)}</strong>
            <span>
              {order.method === 'pickup' ? 'El cliente recoge en: ' : 'Entregar en: '}
              {order.address}
            </span>
            <span>Fecha acordada: {formatDate(order.date)}</span>
          </div>
        </div>

        <div className="money-box">
          <div className="sum-row">
            <span>Regalos</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          {order.shippingCost > 0 && (
            <div className="sum-row">
              <span>Envío</span>
              <span>{formatMoney(order.shippingCost)}</span>
            </div>
          )}
          <div className="sum-row minus">
            <span>Comisión ({Math.round(COMMISSION_RATE * 100)}%)</span>
            <span>− {formatMoney(order.commission)}</span>
          </div>
          <div className="sum-row total">
            <span>Tú recibes</span>
            <span>{formatMoney(order.sellerNet)}</span>
          </div>
        </div>
      </div>

      <div className="order-actions">
        {action && (
          <button className="btn btn-primary" onClick={() => advanceOrder(order.id)}>
            <Icon name="check" size={18} strokeWidth={2.6} /> {action}
          </button>
        )}
        {order.status === 'ready' && (
          <span className="waiting-tag">
            <Icon name="clock" size={16} /> Esperando que el comprador confirme la recepción para liberar tu pago
          </span>
        )}
        {order.status === 'delivered' && (
          <span className="reviewed-tag">
            <Icon name="unlock" size={16} /> Pago liberado: {formatMoney(order.sellerNet)} ya está en tu saldo
          </span>
        )}
      </div>
    </article>
  )
}

export function SellerOrders() {
  const fin = useSellerFinance()
  const [tab, setTab] = useState<Tab | null>(null)

  const counts = useMemo(
    () => ({
      attend: fin.toAttend.length,
      ready: fin.mine.filter((o) => o.status === 'ready').length,
      done: fin.mine.filter((o) => o.status === 'delivered').length,
      all: fin.mine.length,
    }),
    [fin],
  )

  const current: Tab = tab ?? (counts.attend > 0 ? 'attend' : 'all')

  const shown = useMemo(
    () =>
      fin.mine.filter((o) =>
        current === 'all'
          ? true
          : current === 'attend'
            ? o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing'
            : current === 'ready'
              ? o.status === 'ready'
              : o.status === 'delivered',
      ),
    [fin.mine, current],
  )

  if (fin.mine.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="Todavía no recibiste pedidos"
        text="Cuando un comprador te compre, el pedido aparecerá aquí para que lo atiendas."
        actionLabel="Ver mis regalos"
        actionTo="/panel/regalos"
      />
    )
  }

  return (
    <>
      <div className="page-head">
        <h1>Pedidos recibidos</h1>
        <p>Atiende tus ventas. Tu dinero se libera cuando el comprador confirma que recibió su regalo.</p>
      </div>

      <div className="chips" style={{ marginBottom: 22 }} role="tablist">
        {(
          [
            ['attend', 'Por atender'],
            ['ready', 'Esperando confirmación'],
            ['done', 'Completados'],
            ['all', 'Todos'],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} role="tab" className="chip" aria-pressed={current === k} onClick={() => setTab(k)}>
            {label} ({counts[k]})
          </button>
        ))}
      </div>

      <div className="orders">
        {shown.map((o) => (
          <SellerOrderCard key={o.id} order={o} />
        ))}
        {shown.length === 0 && <p className="muted">No hay pedidos en esta sección.</p>}
      </div>
    </>
  )
}
