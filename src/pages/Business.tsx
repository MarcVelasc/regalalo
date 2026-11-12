import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { COMMISSION_RATE, CURRENCY } from '../config'
import { formatMoney } from '../utils/helpers'

/** Convierte lo que escribe la persona en un número seguro (nunca NaN ni negativo). */
const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function NumField({
  label,
  hint,
  value,
  onChange,
  suffix,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  suffix?: string
}) {
  return (
    <label className="field">
      <span>
        {label} {hint && <em>· {hint}</em>}
      </span>
      <div className="biz-input">
        <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
        {suffix && <b>{suffix}</b>}
      </div>
    </label>
  )
}

const FLOW: { icon: IconName; title: string; text: string }[] = [
  { icon: 'card', title: 'El comprador paga', text: 'El monto completo entra a Regalalo, no al vendedor.' },
  { icon: 'lock', title: 'Pago retenido', text: 'Se mantiene en custodia mientras el pedido se prepara y se entrega.' },
  { icon: 'packageCheck', title: 'Confirma la recepción', text: 'El comprador avisa que recibió su regalo y puede calificar.' },
  { icon: 'unlock', title: 'Se libera al vendedor', text: 'El vendedor recibe el precio menos la comisión; el envío va íntegro.' },
]

export function Business() {
  const [sellers, setSellers] = useState('40')
  const [orders, setOrders] = useState('12')
  const [ticket, setTicket] = useState('150')
  const [rate, setRate] = useState(String(Math.round(COMMISSION_RATE * 1000) / 10))
  const [gateway, setGateway] = useState('3')
  const [fixed, setFixed] = useState('2000')

  const m = useMemo(() => {
    const orderCount = num(sellers) * num(orders)
    const gmv = orderCount * num(ticket)
    const commission = gmv * (num(rate) / 100)
    const gatewayCost = gmv * (num(gateway) / 100)
    const margin = commission - gatewayCost - num(fixed)
    return { orderCount, gmv, commission, gatewayCost, margin }
  }, [sellers, orders, ticket, rate, gateway, fixed])

  // Ejemplo real de un pedido de 200 Bs de regalo + 20 Bs de envío.
  const gift = 200
  const ship = 20
  const fee = gift * COMMISSION_RATE

  return (
    <>
      <div className="page-head">
        <h1>Modelo de negocio</h1>
        <p>Cómo se mueve el dinero en Regalalo y cuánto podría generar según tus propios supuestos.</p>
      </div>

      {/* ───────── Flujo */}
      <section className="biz-flow" aria-label="Flujo del pago">
        {FLOW.map((s, i) => (
          <div className="biz-step" key={s.title}>
            <span className="biz-num">{i + 1}</span>
            <span className="biz-ico">
              <Icon name={s.icon} size={22} />
            </span>
            <strong>{s.title}</strong>
            <p>{s.text}</p>
          </div>
        ))}
      </section>

      {/* ───────── Ejemplo */}
      <section className="panel biz-example">
        <h2>Un pedido de ejemplo</h2>
        <p className="biz-note">
          Regalo de {formatMoney(gift)} con envío de {formatMoney(ship)}. La comisión del{' '}
          {Math.round(COMMISSION_RATE * 100)}% se calcula solo sobre el regalo.
        </p>
        <dl className="biz-rows">
          <div>
            <dt>El comprador paga</dt>
            <dd>{formatMoney(gift + ship)}</dd>
          </div>
          <div>
            <dt>Comisión de Regalalo</dt>
            <dd className="neg">− {formatMoney(fee)}</dd>
          </div>
          <div className="total">
            <dt>El vendedor recibe</dt>
            <dd>{formatMoney(gift - fee + ship)}</dd>
          </div>
        </dl>
      </section>

      {/* ───────── Simulador */}
      <section className="panel">
        <h2>Simulador mensual</h2>
        <p className="biz-note">
          Todos los valores de abajo son <strong>supuestos que puedes cambiar</strong>, no datos reales. La tarifa de
          la pasarela de pago y los costos fijos dependen del proveedor que se elija.
        </p>

        <div className="biz-grid">
          <NumField label="Vendedores activos" value={sellers} onChange={setSellers} />
          <NumField label="Pedidos por vendedor al mes" value={orders} onChange={setOrders} />
          <NumField label="Ticket promedio" hint="solo regalo" value={ticket} onChange={setTicket} suffix={CURRENCY} />
          <NumField label="Comisión" value={rate} onChange={setRate} suffix="%" />
          <NumField label="Costo de la pasarela de pago" hint="supuesto" value={gateway} onChange={setGateway} suffix="%" />
          <NumField label="Costos fijos mensuales" hint="supuesto" value={fixed} onChange={setFixed} suffix={CURRENCY} />
        </div>

        <div className="kpis biz-kpis">
          <div className="kpi">
            <span className="kpi-label">Pedidos al mes</span>
            <strong className="kpi-value">{Math.round(m.orderCount).toLocaleString('es-BO')}</strong>
            <span className="kpi-hint">vendedores × pedidos</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Ventas movidas (GMV)</span>
            <strong className="kpi-value">{formatMoney(m.gmv)}</strong>
            <span className="kpi-hint">dinero que pasa por la plataforma</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Ingreso por comisión</span>
            <strong className="kpi-value">{formatMoney(m.commission)}</strong>
            <span className="kpi-hint">menos pasarela: {formatMoney(m.commission - m.gatewayCost)}</span>
          </div>
          <div className={`kpi ${m.margin >= 0 ? 'good' : 'bad'}`}>
            <span className="kpi-label">Resultado mensual</span>
            <strong className="kpi-value">{formatMoney(m.margin)}</strong>
            <span className="kpi-hint">por año: {formatMoney(m.margin * 12)}</span>
          </div>
        </div>
      </section>

      {/* ───────── Notas */}
      <section className="biz-notes">
        <div className="panel">
          <h2>Por qué funciona</h2>
          <ul>
            <li>El vendedor no paga por publicar: solo cobra Regalalo cuando él vende.</li>
            <li>El pago retenido da confianza al comprador y reduce el miedo a estafas.</li>
            <li>Las calificaciones públicas hacen que los buenos vendedores vendan más.</li>
          </ul>
        </div>
        <div className="panel">
          <h2>Riesgos a resolver</h2>
          <ul>
            <li>Disputas: qué pasa si el comprador no confirma o el regalo llega mal.</li>
            <li>Custodia del dinero: requisitos legales y pasarela de pago real.</li>
            <li>Entregas: coordinar la logística de envío entre vendedores y compradores.</li>
          </ul>
        </div>
        <div className="panel">
          <h2>Siguientes pasos</h2>
          <ul>
            <li>Validar con vendedores reales de una festividad y medir cuántos pedidos logran.</li>
            <li>Conectar un backend, cuentas de usuario y pagos.</li>
            <li>Definir plazo de confirmación automática y proceso de reclamos.</li>
          </ul>
        </div>
      </section>

      <p className="biz-back">
        <Link to="/" className="btn btn-outline">
          <Icon name="arrowLeft" size={16} /> Volver al inicio
        </Link>
      </p>
    </>
  )
}
