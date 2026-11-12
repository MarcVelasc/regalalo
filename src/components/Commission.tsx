import { COMMISSION_RATE } from '../config'
import { computeOrderMoney, formatMoney } from '../utils/helpers'

interface Props {
  /** Precio del regalo (por unidad) */
  price: number
  /** Costo de envío que cobra el vendedor (0 si no envía) */
  shipping?: number
}

/** Desglose: lo que paga el cliente, lo que retiene Regalalo y lo que recibe el vendedor. */
export function CommissionBreakdown({ price, shipping = 0 }: Props) {
  const m = computeOrderMoney(price > 0 ? price : 0, shipping)
  const pct = Math.round(COMMISSION_RATE * 100)
  return (
    <div className="commission">
      <div className="commission-row">
        <span>El cliente paga</span>
        <b>{formatMoney(m.total)}</b>
      </div>
      <div className="commission-row sub">
        <span>Regalo</span>
        <span>{formatMoney(m.subtotal)}</span>
      </div>
      {shipping > 0 && (
        <div className="commission-row sub">
          <span>Envío</span>
          <span>{formatMoney(shipping)}</span>
        </div>
      )}
      <div className="commission-row minus">
        <span>Comisión Regalalo ({pct}% del regalo)</span>
        <b>− {formatMoney(m.commission)}</b>
      </div>
      <div className="commission-row net">
        <span>Tú recibes</span>
        <b>{formatMoney(m.sellerNet)}</b>
      </div>
      <p className="commission-note">El dinero se libera cuando el comprador confirma que recibió su regalo.</p>
    </div>
  )
}
