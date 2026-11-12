import type { IconName } from './components/Icon'

export type Role = 'buyer' | 'seller'

export interface Holiday {
  id: string
  name: string
  icon: IconName
  dateLabel: string
  tagline: string
  heroTitle: string
  heroText: string
  /** Color de acento del hero para esta festividad */
  accent: string
  /** Emojis para la ilustración del hero (el primero es el principal) */
  heroEmojis: string[]
}

export interface Category {
  id: string
  name: string
  icon: IconName
  hint: string
}

export interface Seller {
  id: string
  name: string
  avatarBg: string
  city: string
  bio: string
  joined: string
  verified: boolean
  pickupAddress: string
}

export interface DeliveryOptions {
  pickup: boolean
  shipping: boolean
  /** Costo de envío en Bs (solo si shipping = true) */
  shippingCost: number
  /** Zonas a las que envía (texto libre) */
  shippingZones: string
}

export type Gender = 'hombre' | 'mujer'
export type AgeGroup = 'nino' | 'joven' | 'adulto' | 'mayor'

/** Para quién sirve un regalo. Lo define el vendedor al publicarlo. */
export interface Audience {
  /** 'todos' = sirve para hombres y mujeres */
  gender: Gender | 'todos'
  ages: AgeGroup[]
  /** ids de data/audience.ts → INTERESTS */
  interests: string[]
}

export interface Product {
  id: string
  sellerId: string
  title: string
  description: string
  price: number
  /** Fotos del regalo. Pueden llevar {w} y {h} (se reemplazan por el tamaño pedido) o ser una URL fija / archivo local. */
  images: string[]
  /** Colores del fondo mientras carga la foto (o si falla) */
  tone: [string, string]
  holidays: string[]
  categoryId: string
  audience: Audience
  stock: number
  sold: number
  delivery: DeliveryOptions
  active: boolean
  createdAt: number
}

export interface Review {
  id: string
  sellerId: string
  productId?: string
  author: string
  rating: number
  comment: string
  date: string
}

export type DeliveryMethod = 'pickup' | 'shipping'

export interface CartItem {
  productId: string
  qty: number
  dedication: string
}

export type OrderStatus =
  | 'pending' // recién pagado, esperando que el vendedor acepte
  | 'accepted'
  | 'preparing'
  | 'ready' // listo para recoger / enviado
  | 'delivered' // el comprador confirmó la recepción

export type PaymentStatus = 'held' | 'released'

export interface OrderItem {
  productId: string
  title: string
  image: string
  tone: [string, string]
  price: number
  qty: number
  dedication: string
}

export interface Order {
  id: string
  sellerId: string
  items: OrderItem[]
  method: DeliveryMethod
  address: string
  date: string
  buyerName: string
  buyerPhone: string
  subtotal: number
  shippingCost: number
  total: number
  commission: number
  sellerNet: number
  status: OrderStatus
  payment: PaymentStatus
  createdAt: number
  reviewed: boolean
}

export interface Toast {
  id: number
  message: string
  tone: 'success' | 'info' | 'error'
}

export interface AppNotification {
  id: number
  /** A quién va dirigida: la vista de comprador o la de vendedor */
  audience: Role
  icon: IconName
  title: string
  text: string
  /** Ruta a la que lleva al hacer clic */
  to: string
  read: boolean
  createdAt: number
}

/** Persona a quien el comprador quiere regalarle algo en una fecha. */
export interface GiftPerson {
  id: string
  /** Texto libre: "Papá", "Pedrito", "Camila". */
  name: string
  /** id de data/audience.ts → RELATIONS */
  relation: string
  gender: Gender
  age: number
  /** Uno o dos gustos (ids de INTERESTS) */
  interests: string[]
  /** Ocasión (id de festividad) */
  holidayId: string
  /** Fecha ISO (YYYY-MM-DD) de la ocasión. */
  date: string
  /** Presupuesto en Bs. */
  budget: number
  /** Cuántas sugerencias quiere ver (3, 5 o 10) */
  count: number
  /** Con cuántos días de anticipación avisar, por ejemplo [7, 3] */
  remindDays: number[]
  /** Avisos ya enviados (cada número es uno de remindDays) */
  sent: number[]
}
