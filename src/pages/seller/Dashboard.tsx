import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CommissionBreakdown } from '../../components/Commission'
import { Icon, type IconName } from '../../components/Icon'
import { ProductImage } from '../../components/ProductImage'
import { RatingSummary, ReviewItem } from '../../components/Reviews'
import { COMMISSION_RATE } from '../../config'
import { useSellerFinance, useSellerStats } from '../../store/hooks'
import { useStore } from '../../store/useStore'
import { formatMoney, methodLabel, nextActionLabel } from '../../utils/helpers'

function Kpi({ icon, label, value, hint, tone }: { icon: IconName; label: string; value: string; hint: string; tone?: string }) {
  return (
    <div className={`kpi ${tone ?? ''}`}>
      <div className="kpi-icon">
        <Icon name={icon} size={22} />
      </div>
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      <span className="kpi-hint">{hint}</span>
    </div>
  )
}

export function Dashboard() {
  const seller = useStore((s) => s.sellers.find((x) => x.id === s.currentSellerId))
  const sellerId = useStore((s) => s.currentSellerId)
  const products = useStore((s) => s.products)
  const reviews = useStore((s) => s.reviews)
  const advanceOrder = useStore((s) => s.advanceOrder)
  const withdraw = useStore((s) => s.withdraw)
  const fin = useSellerFinance()
  const stats = useSellerStats(sellerId)

  const [calcPrice, setCalcPrice] = useState('100')
  const [calcShip, setCalcShip] = useState('0')

  const mine = useMemo(() => products.filter((p) => p.sellerId === sellerId), [products, sellerId])
  const top = useMemo(() => [...mine].sort((a, b) => b.sold - a.sold).slice(0, 5), [mine])
  const topMax = Math.max(1, ...top.map((p) => p.sold))
  const lowStock = mine.filter((p) => p.active && p.stock <= 5)
  const latestReviews = useMemo(() => reviews.filter((r) => r.sellerId === sellerId).slice(0, 2), [reviews, sellerId])

  if (!seller) return null

  return (
    <>
      <div className="page-head">
        <h1>Hola, {seller.name}</h1>
        <p>Así va tu negocio en Regalalo.</p>
      </div>

      {/* ───────── KPIs */}
      <div className="kpis">
        <Kpi icon="bag" label="Ventas totales" value={formatMoney(fin.sales)} hint={`${fin.mine.length} pedidos`} />
        <Kpi
          icon="lock"
          label="Saldo retenido"
          value={formatMoney(fin.held)}
          hint="Se libera al confirmar el comprador"
          tone="gold"
        />
        <Kpi
          icon="unlock"
          label="Saldo liberado"
          value={formatMoney(fin.released)}
          hint={`Retirable: ${formatMoney(fin.available)}`}
          tone="mint"
        />
        <Kpi
          icon="receipt"
          label={`Comisión (${Math.round(COMMISSION_RATE * 100)}%)`}
          value={formatMoney(fin.commission)}
          hint="Descontada de tus ventas"
        />
      </div>

      {fin.available > 0 && (
        <div className="withdraw">
          <div>
            <strong>Tienes {formatMoney(fin.available)} disponibles para retirar</strong>
            <span>Es el dinero de pedidos que ya fueron confirmados por los compradores.</span>
          </div>
          <button className="btn btn-gold" onClick={() => withdraw(fin.available)}>
            <Icon name="wallet" size={18} /> Retirar saldo
          </button>
        </div>
      )}

      <div className="dash-grid">
        <div className="dash-main">
          {/* ───────── Pedidos por atender */}
          <section className="panel">
            <div className="panel-head">
              <h2>
                <Icon name="package" size={20} /> Pedidos por atender
                {fin.toAttend.length > 0 && <span className="count-pill">{fin.toAttend.length}</span>}
              </h2>
              <Link to="/panel/pedidos" className="link-more">
                Ver todos <Icon name="arrow" size={16} />
              </Link>
            </div>
            {fin.toAttend.length === 0 ? (
              <p className="muted">Estás al día. Cuando alguien compre, el pedido aparecerá aquí.</p>
            ) : (
              <div className="attend-list">
                {fin.toAttend.slice(0, 4).map((o) => (
                  <div key={o.id} className="attend">
                    <div>
                      <strong>
                        {o.id} · {o.buyerName}
                      </strong>
                      <span className="muted">
                        {o.items.map((i) => `${i.qty}× ${i.title}`).join(', ')} · {methodLabel(o.method)}
                      </span>
                    </div>
                    <b>{formatMoney(o.sellerNet)}</b>
                    <button className="btn btn-primary btn-sm" onClick={() => advanceOrder(o.id)}>
                      {nextActionLabel(o)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ───────── Más vendidos */}
          <section className="panel">
            <div className="panel-head">
              <h2>
                <Icon name="star" size={20} /> Tus regalos más vendidos
              </h2>
              <Link to="/panel/regalos" className="link-more">
                Gestionar <Icon name="arrow" size={16} />
              </Link>
            </div>
            <div className="top-list">
              {top.map((p) => (
                <div key={p.id} className="top-row">
                  <span className="mini">
                    <ProductImage src={p.images[0]} tone={p.tone} alt={p.title} w={104} h={104} />
                  </span>
                  <div className="top-info">
                    <strong>{p.title}</strong>
                    <div className="bar">
                      <div style={{ width: `${(p.sold / topMax) * 100}%` }} />
                    </div>
                  </div>
                  <span className="muted">{p.sold} vendidos</span>
                </div>
              ))}
            </div>
          </section>

          {lowStock.length > 0 && (
            <section className="panel alert">
              <h2>
                <Icon name="info" size={20} /> Stock bajo
              </h2>
              <ul className="plain-list">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <span>
                      <strong>{p.title}</strong> · quedan {p.stock}
                    </span>
                    <Link to={`/panel/regalos/${p.id}/editar`} className="link-more">
                      Reponer
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="dash-side">
          {/* ───────── Calificación */}
          <section className="panel">
            <div className="panel-head">
              <h2>
                <Icon name="star" size={20} /> Tu calificación
              </h2>
            </div>
            <RatingSummary stats={stats} />
            <div className="reviews compact">
              {latestReviews.map((r) => (
                <ReviewItem key={r.id} review={r} showProduct={false} />
              ))}
            </div>
            <Link to="/panel/resenas" className="btn btn-outline wide">
              Ver todas las reseñas
            </Link>
          </section>

          {/* ───────── Calculadora */}
          <section className="panel">
            <h2>
              <Icon name="receipt" size={20} /> Calculadora de comisión
            </h2>
            <div className="form-grid">
              <label className="field">
                <span>Precio del regalo (Bs)</span>
                <input type="number" min={0} value={calcPrice} onChange={(e) => setCalcPrice(e.target.value)} />
              </label>
              <label className="field">
                <span>Envío que cobras (Bs)</span>
                <input type="number" min={0} value={calcShip} onChange={(e) => setCalcShip(e.target.value)} />
              </label>
            </div>
            <CommissionBreakdown price={Number(calcPrice) || 0} shipping={Number(calcShip) || 0} />
          </section>
        </div>
      </div>
    </>
  )
}
