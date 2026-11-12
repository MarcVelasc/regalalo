import { COMMISSION_RATE, CURRENCY } from '../config'
import type { DeliveryMethod, Order, OrderStatus, Product, Review } from '../types'

export const round2 = (n: number) => Math.round(n * 100) / 100

export function formatMoney(n: number, withCurrency = true): string {
  const hasDecimals = Math.abs(n % 1) > 0.001
  const text = n.toLocaleString('es-BO', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return withCurrency ? `${CURRENCY} ${text}` : text
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Desglose de dinero de un pedido. La comisión se cobra solo sobre los regalos; el envío va íntegro al vendedor. */
export function computeOrderMoney(subtotal: number, shippingCost: number) {
  const commission = round2(subtotal * COMMISSION_RATE)
  return {
    subtotal,
    shippingCost,
    total: round2(subtotal + shippingCost),
    commission,
    sellerNet: round2(subtotal - commission + shippingCost),
  }
}

export interface SellerStats {
  avg: number
  count: number
  /** distribution[0] = cantidad de reseñas de 5 estrellas … distribution[4] = 1 estrella */
  distribution: number[]
}

export function computeSellerStats(sellerId: string, reviews: Review[]): SellerStats {
  const mine = reviews.filter((r) => r.sellerId === sellerId)
  const distribution = [5, 4, 3, 2, 1].map((s) => mine.filter((r) => r.rating === s).length)
  const count = mine.length
  const avg = count ? mine.reduce((acc, r) => acc + r.rating, 0) / count : 0
  return { avg, count, distribution }
}

/** Métodos de entrega que soportan TODOS los regalos de un mismo vendedor en el carrito. */
export function availableMethods(products: Product[]): DeliveryMethod[] {
  const methods: DeliveryMethod[] = []
  if (products.every((p) => p.delivery.pickup)) methods.push('pickup')
  if (products.every((p) => p.delivery.shipping)) methods.push('shipping')
  return methods
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente de aceptar',
  accepted: 'Aceptado',
  preparing: 'En preparación',
  ready: 'Listo',
  delivered: 'Recibido',
}

export function readyLabel(method: DeliveryMethod): string {
  return method === 'pickup' ? 'Listo para recoger' : 'Enviado'
}

/** Fecha ISO (YYYY-MM-DD) en hora local, con un desfase de días respecto a hoy. */
export function isoDate(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export const isoFromTimestamp = (ts: number): string => isoDate(Math.round((ts - Date.now()) / 86_400_000))

/** Minúsculas y sin tildes, para búsquedas tolerantes. */
export const normalize = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export const methodLabel = (m: DeliveryMethod): string => (m === 'pickup' ? 'Recogida en punto' : 'Envío a domicilio')

/** Texto del botón con el que el vendedor avanza un pedido al siguiente estado. */
export function nextActionLabel(order: Order): string | null {
  switch (order.status) {
    case 'pending':
      return 'Aceptar pedido'
    case 'accepted':
      return 'Empezar a preparar'
    case 'preparing':
      return order.method === 'pickup' ? 'Marcar listo para recoger' : 'Marcar como enviado'
    default:
      return null
  }
}

const sumOf = (list: number[]) => list.reduce((a, b) => a + b, 0)

/** Ventas, comisión y saldos (retenido / liberado / retirable) de un vendedor a partir de sus pedidos. */
export function computeSellerFinance(orders: Order[], sellerId: string, withdrawn: number) {
  const mine = orders.filter((o) => o.sellerId === sellerId).sort((a, b) => b.createdAt - a.createdAt)
  const released = round2(sumOf(mine.filter((o) => o.payment === 'released').map((o) => o.sellerNet)))
  const held = round2(sumOf(mine.filter((o) => o.payment === 'held').map((o) => o.sellerNet)))
  return {
    mine,
    sales: round2(sumOf(mine.map((o) => o.subtotal))),
    commission: round2(sumOf(mine.map((o) => o.commission))),
    released,
    held,
    withdrawn,
    available: round2(Math.max(0, released - withdrawn)),
    toAttend: mine.filter((o) => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing'),
  }
}

/** Días que faltan desde hoy hasta una fecha ISO (0 = hoy, negativo = ya pasó). */
export function daysUntil(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d).getTime()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((target - today) / 86_400_000)
}
