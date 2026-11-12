import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { EmptyState } from '../components/Common'
import { Icon, type IconName } from '../components/Icon'
import { ProductImage } from '../components/ProductImage'
import { useStore, type Shipment } from '../store/useStore'
import type { DeliveryMethod, Order } from '../types'
import { groupCart, shippingFor, type CartGroup } from '../utils/cart'
import { formatDate, formatMoney, isoDate, methodLabel, round2 } from '../utils/helpers'

type PayMethod = 'card' | 'qr' | 'transfer'

const PAY_METHODS: { id: PayMethod; label: string; hint: string; icon: IconName }[] = [
  { id: 'card', label: 'Tarjeta', hint: 'Débito o crédito', icon: 'card' },
  { id: 'qr', label: 'Pago QR', hint: 'Desde tu app bancaria', icon: 'qr' },
  { id: 'transfer', label: 'Transferencia', hint: 'Banco a banco', icon: 'bank' },
]

type Errors = Record<string, string>

function groupShip(group: CartGroup, draft: Partial<Shipment> | undefined, defaultDate: string): Shipment {
  return {
    method: draft?.method ?? (group.methods.includes('pickup') ? 'pickup' : 'shipping'),
    address: draft?.address ?? '',
    date: draft?.date ?? defaultDate,
  }
}

export function Checkout() {
  const cart = useStore((s) => s.cart)
  const products = useStore((s) => s.products)
  const sellers = useStore((s) => s.sellers)
  const placeOrders = useStore((s) => s.placeOrders)
  const pushToast = useStore((s) => s.pushToast)
  const giftDate = useStore((s) => s.giftDate)
  const groups = useMemo(() => groupCart(cart, products), [cart, products])
  // Si viene del calendario de regalos, la fecha de la persona es la fecha de entrega por defecto.
  const defaultDate = giftDate && giftDate >= isoDate(1) ? giftDate : isoDate(2)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [drafts, setDrafts] = useState<Record<string, Partial<Shipment>>>({})
  const [pay, setPay] = useState<PayMethod>('card')
  const [card, setCard] = useState({ number: '', exp: '', cvv: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [placed, setPlaced] = useState<Order[] | null>(null)

  const patchDraft = (sellerId: string, patch: Partial<Shipment>) =>
    setDrafts((d) => ({ ...d, [sellerId]: { ...d[sellerId], ...patch } }))

  const totals = groups.map((g) => {
    const ship = groupShip(g, drafts[g.sellerId], defaultDate)
    const shipping = ship.method === 'shipping' ? shippingFor(g) : 0
    return { g, ship, shipping, total: round2(g.subtotal + shipping) }
  })
  const grandTotal = round2(totals.reduce((acc, t) => acc + t.total, 0))

  // ───────── Pantalla de éxito
  if (placed) {
    const paid = round2(placed.reduce((acc, o) => acc + o.total, 0))
    return (
      <section className="success">
        <div className="success-icon">
          <Icon name="check" size={40} strokeWidth={2.6} />
        </div>
        <h1>¡Pedido realizado!</h1>
        <p className="lead">
          Pagaste <strong>{formatMoney(paid)}</strong>. Tu dinero está <strong>retenido por Regalalo</strong> y se liberará
          al vendedor cuando confirmes que recibiste tu regalo.
        </p>
        <div className="success-orders">
          {placed.map((o) => {
            const seller = sellers.find((s) => s.id === o.sellerId)
            return (
              <div key={o.id} className="success-order">
                <div>
                  <strong>{o.id}</strong>
                  <span className="muted">
                    {seller?.name} · {methodLabel(o.method)} · {formatDate(o.date)}
                  </span>
                </div>
                <b>{formatMoney(o.total)}</b>
              </div>
            )
          })}
        </div>
        <div className="success-actions">
          <Link to="/pedidos" className="btn btn-primary">
            Ver mis pedidos
          </Link>
          <Link to="/catalogo" className="btn btn-outline">
            Seguir comprando
          </Link>
        </div>
      </section>
    )
  }

  if (groups.length === 0) return <Navigate to="/carrito" replace />

  if (groups.some((g) => g.methods.length === 0)) {
    return (
      <EmptyState
        icon="info"
        title="Revisa tu carrito antes de pagar"
        text="Hay regalos de un mismo vendedor con formas de entrega que no coinciden."
        actionLabel="Volver al carrito"
        actionTo="/carrito"
      />
    )
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err: Errors = {}
    if (name.trim().length < 3) err.name = 'Escribe tu nombre completo'
    if (phone.replace(/\D/g, '').length < 7) err.phone = 'Escribe un teléfono válido'
    for (const t of totals) {
      if (t.ship.method === 'shipping' && t.ship.address.trim().length < 6) {
        err[`address-${t.g.sellerId}`] = 'Indica la dirección de entrega'
      }
      if (!t.ship.date || t.ship.date < isoDate(1)) err[`date-${t.g.sellerId}`] = 'Elige una fecha desde mañana'
    }
    if (pay === 'card') {
      if (card.number.replace(/\s/g, '').length < 13) err.cardNumber = 'Número de tarjeta incompleto'
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) err.cardExp = 'Usa el formato MM/AA'
      if (!/^\d{3,4}$/.test(card.cvv)) err.cardCvv = 'CVV inválido'
    }
    setErrors(err)
    if (Object.keys(err).length) {
      pushToast('Revisa los campos marcados', 'error')
      return
    }

    const shipments: Record<string, Shipment> = {}
    for (const t of totals) {
      const seller = sellers.find((s) => s.id === t.g.sellerId)
      shipments[t.g.sellerId] = {
        method: t.ship.method,
        date: t.ship.date,
        address: t.ship.method === 'pickup' ? (seller?.pickupAddress ?? '') : t.ship.address.trim(),
      }
    }
    setPlaced(placeOrders({ name: name.trim(), phone: phone.trim() }, shipments))
  }

  const fmtCard = (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim()
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  return (
    <>
      <div className="page-head">
        <h1>Finalizar compra</h1>
        <p>Último paso: elige cómo recibir tu regalo y paga de forma protegida.</p>
      </div>

      <form className="cart-layout" onSubmit={submit} noValidate>
        <div className="cart-groups">
          {/* ───────── Datos del comprador */}
          <section className="panel">
            <h2>
              <Icon name="user" size={20} /> Tus datos
            </h2>
            <div className="form-grid">
              <label className={`field ${errors.name ? 'has-error' : ''}`}>
                <span>Nombre completo</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. María Fernández" />
                {errors.name && <small className="err">{errors.name}</small>}
              </label>
              <label className={`field ${errors.phone ? 'has-error' : ''}`}>
                <span>Teléfono de contacto</span>
                <input
                  value={phone}
                  inputMode="tel"
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 7XXXXXXX"
                />
                {errors.phone && <small className="err">{errors.phone}</small>}
              </label>
            </div>
          </section>

          {/* ───────── Entrega por vendedor */}
          {totals.map(({ g, ship, shipping }) => {
            const seller = sellers.find((s) => s.id === g.sellerId)
            if (!seller) return null
            const addrErr = errors[`address-${g.sellerId}`]
            const dateErr = errors[`date-${g.sellerId}`]
            return (
              <section key={g.sellerId} className="panel">
                <h2>
                  <Icon name="truck" size={20} /> Entrega · {seller.name}
                </h2>

                <div className="thumb-strip">
                  {g.lines.map(({ item, product }) => (
                    <div key={product.id} className="mini" title={product.title}>
                      <ProductImage src={product.images[0]} tone={product.tone} alt={product.title} w={120} h={120} />
                      {item.qty > 1 && <b>{item.qty}</b>}
                    </div>
                  ))}
                  <span className="muted">
                    {g.lines.reduce((a, l) => a + l.item.qty, 0)} regalo(s) · {formatMoney(g.subtotal)}
                  </span>
                </div>

                <div className="method-grid">
                  {(['pickup', 'shipping'] as DeliveryMethod[]).map((m) => {
                    const available = g.methods.includes(m)
                    return (
                      <label key={m} className={`method ${ship.method === m ? 'on' : ''} ${available ? '' : 'off'}`}>
                        <input
                          type="radio"
                          name={`method-${g.sellerId}`}
                          disabled={!available}
                          checked={ship.method === m}
                          onChange={() => patchDraft(g.sellerId, { method: m })}
                        />
                        <Icon name={m === 'pickup' ? 'pin' : 'truck'} size={22} />
                        <div>
                          <strong>{m === 'pickup' ? 'Recogerlo yo' : 'Enviar a una dirección'}</strong>
                          <span>
                            {!available
                              ? 'No disponible para estos regalos'
                              : m === 'pickup'
                                ? 'Gratis'
                                : formatMoney(shippingFor(g))}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {ship.method === 'pickup' ? (
                  <div className="notice">
                    <Icon name="pin" size={18} />
                    <p>
                      Recoges en <strong>{seller.pickupAddress}</strong> ({seller.city}). El vendedor te avisará cuando esté
                      listo.
                    </p>
                  </div>
                ) : (
                  <label className={`field ${addrErr ? 'has-error' : ''}`}>
                    <span>Dirección de entrega</span>
                    <input
                      value={ship.address}
                      onChange={(e) => patchDraft(g.sellerId, { address: e.target.value })}
                      placeholder="Calle, número, zona y referencia"
                    />
                    <small className="hint">
                      Zonas de envío: {g.lines[0].product.delivery.shippingZones || 'consulta con el vendedor'}
                    </small>
                    {addrErr && <small className="err">{addrErr}</small>}
                  </label>
                )}

                <label className={`field narrow ${dateErr ? 'has-error' : ''}`}>
                  <span>{ship.method === 'pickup' ? 'Fecha de recogida' : 'Fecha de entrega'}</span>
                  <input
                    type="date"
                    min={isoDate(1)}
                    value={ship.date}
                    onChange={(e) => patchDraft(g.sellerId, { date: e.target.value })}
                  />
                  {dateErr && <small className="err">{dateErr}</small>}
                </label>

                {shipping > 0 && (
                  <div className="sum-row muted">
                    <span>Envío</span>
                    <span>{formatMoney(shipping)}</span>
                  </div>
                )}
              </section>
            )
          })}

          {/* ───────── Pago */}
          <section className="panel">
            <h2>
              <Icon name="wallet" size={20} /> Método de pago
            </h2>
            <div className="pay-grid">
              {PAY_METHODS.map((m) => (
                <label key={m.id} className={`method ${pay === m.id ? 'on' : ''}`}>
                  <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)} />
                  <Icon name={m.icon} size={22} />
                  <div>
                    <strong>{m.label}</strong>
                    <span>{m.hint}</span>
                  </div>
                </label>
              ))}
            </div>

            {pay === 'card' && (
              <div className="form-grid three">
                <label className={`field span2 ${errors.cardNumber ? 'has-error' : ''}`}>
                  <span>Número de tarjeta</span>
                  <input
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })}
                  />
                  {errors.cardNumber && <small className="err">{errors.cardNumber}</small>}
                </label>
                <label className={`field ${errors.cardExp ? 'has-error' : ''}`}>
                  <span>Vence</span>
                  <input
                    inputMode="numeric"
                    placeholder="MM/AA"
                    value={card.exp}
                    onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })}
                  />
                  {errors.cardExp && <small className="err">{errors.cardExp}</small>}
                </label>
                <label className={`field ${errors.cardCvv ? 'has-error' : ''}`}>
                  <span>CVV</span>
                  <input
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })}
                  />
                  {errors.cardCvv && <small className="err">{errors.cardCvv}</small>}
                </label>
              </div>
            )}
            {pay === 'qr' && (
              <div className="notice">
                <Icon name="qr" size={18} />
                <p>Al confirmar se generaría un código QR para pagar desde tu app bancaria. (Simulado en este MVP)</p>
              </div>
            )}
            {pay === 'transfer' && (
              <div className="notice">
                <Icon name="bank" size={18} />
                <p>Al confirmar recibirías los datos de la cuenta de Regalalo para transferir. (Simulado en este MVP)</p>
              </div>
            )}
            <p className="muted demo-note">Demo: no se realiza ningún cobro real y no se guardan datos.</p>
          </section>
        </div>

        {/* ───────── Resumen */}
        <aside className="summary">
          <h2>Resumen del pedido</h2>
          {totals.map(({ g, shipping, total }) => {
            const seller = sellers.find((s) => s.id === g.sellerId)
            return (
              <div key={g.sellerId} className="sum-block">
                <strong>{seller?.name}</strong>
                <div className="sum-row">
                  <span>Regalos</span>
                  <span>{formatMoney(g.subtotal)}</span>
                </div>
                <div className="sum-row">
                  <span>Envío</span>
                  <span>{shipping ? formatMoney(shipping) : 'Gratis'}</span>
                </div>
                <div className="sum-row sub">
                  <span>Total del pedido</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>
            )
          })}
          <div className="sum-row total">
            <span>Total a pagar</span>
            <span>{formatMoney(grandTotal)}</span>
          </div>
          <button type="submit" className="btn btn-primary wide">
            <Icon name="lock" size={18} /> Pagar {formatMoney(grandTotal)}
          </button>
          <Link to="/carrito" className="btn btn-outline wide">
            Volver al carrito
          </Link>
          <div className="escrow-note">
            <Icon name="shield" size={20} />
            <p>
              <strong>Pago retenido.</strong> Regalalo guarda tu dinero hasta que confirmes la recepción. Si algo sale
              mal, está protegido.
            </p>
          </div>
        </aside>
      </form>
    </>
  )
}
