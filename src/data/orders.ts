import { PRODUCTS } from './products'
import { computeOrderMoney } from '../utils/helpers'
import type { DeliveryMethod, Order, OrderStatus, PaymentStatus } from '../types'

const DAY = 86_400_000

function seedOrder(
  id: string,
  lines: [productId: string, qty: number, dedication?: string][],
  opts: {
    method: DeliveryMethod
    address: string
    date: string
    status: OrderStatus
    payment: PaymentStatus
    daysAgo: number
    reviewed?: boolean
    buyer?: [name: string, phone: string]
  },
): Order {
  const items = lines.map(([productId, qty, dedication = '']) => {
    const p = PRODUCTS.find((x) => x.id === productId)!
    return { productId, title: p.title, image: p.images[0], tone: p.tone, price: p.price, qty, dedication }
  })
  const first = PRODUCTS.find((x) => x.id === lines[0][0])!
  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0)
  const shippingCost = opts.method === 'shipping' ? first.delivery.shippingCost : 0
  return {
    id,
    sellerId: first.sellerId,
    items,
    method: opts.method,
    address: opts.address,
    date: opts.date,
    buyerName: opts.buyer?.[0] ?? 'Tú',
    buyerPhone: opts.buyer?.[1] ?? '70000000',
    ...computeOrderMoney(subtotal, shippingCost),
    status: opts.status,
    payment: opts.payment,
    createdAt: Date.now() - opts.daysAgo * DAY,
    reviewed: opts.reviewed ?? false,
  }
}

/** Pedidos de ejemplo para que ambas vistas tengan contenido desde el inicio. */
export const SEED_ORDERS: Order[] = [
  seedOrder('RG-1005', [['p2', 1, 'Feliz aniversario, mi amor']], {
    method: 'shipping', address: 'Av. Busch #120, Santa Cruz', date: '2026-10-04',
    status: 'ready', payment: 'held', daysAgo: 1, buyer: ['Camila Rojas', '71234567'],
  }),
  seedOrder('RG-1004', [['p1', 2, 'Para mamá, con todo mi cariño']], {
    method: 'shipping', address: 'Calle Murillo #45, Santa Cruz', date: '2026-10-05',
    status: 'pending', payment: 'held', daysAgo: 0, buyer: ['Marcelo Peña', '72345678'],
  }),
  seedOrder('RG-1003', [['p3', 1]], {
    method: 'pickup', address: 'Av. Los Pinos #234, Equipetrol', date: '2026-10-03',
    status: 'preparing', payment: 'held', daysAgo: 1, buyer: ['Daniela Vargas', '73456789'],
  }),
  seedOrder('RG-1002', [['p11', 1, '¡Feliz cumple, campeón!']], {
    method: 'pickup', address: 'Calle 21 de Calacoto #88, Zona Sur', date: '2026-09-26',
    status: 'delivered', payment: 'released', daysAgo: 6, buyer: ['Fernando Aguirre', '74567890'],
  }),
  seedOrder('RG-1001', [['p5', 3]], {
    method: 'pickup', address: 'Av. Los Pinos #234, Equipetrol', date: '2026-09-18',
    status: 'delivered', payment: 'released', daysAgo: 14, buyer: ['Valeria Salvatierra', '75678901'], reviewed: true,
  }),
  seedOrder('RG-1000', [['p1', 1]], {
    method: 'shipping', address: 'Calle Libertad #12, Santa Cruz', date: '2026-09-10',
    status: 'delivered', payment: 'released', daysAgo: 22, buyer: ['Luis Flores', '76789012'], reviewed: true,
  }),
]
