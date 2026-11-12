import type { CartItem, DeliveryMethod, Product } from '../types'
import { availableMethods } from './helpers'

export interface CartLine {
  item: CartItem
  product: Product
}

export interface CartGroup {
  sellerId: string
  lines: CartLine[]
  subtotal: number
  /** Métodos de entrega que soportan todos los regalos de este vendedor */
  methods: DeliveryMethod[]
}

/** Agrupa el carrito por vendedor (cada vendedor genera un pedido distinto). */
export function groupCart(cart: CartItem[], products: Product[]): CartGroup[] {
  const map = new Map<string, CartLine[]>()
  for (const item of cart) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue
    map.set(product.sellerId, [...(map.get(product.sellerId) ?? []), { item, product }])
  }
  return [...map.entries()].map(([sellerId, lines]) => ({
    sellerId,
    lines,
    subtotal: lines.reduce((acc, l) => acc + l.product.price * l.item.qty, 0),
    methods: availableMethods(lines.map((l) => l.product)),
  }))
}

export const shippingFor = (group: CartGroup): number =>
  Math.max(0, ...group.lines.map((l) => l.product.delivery.shippingCost))
