import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CURRENT_SELLER_ID } from '../config'
import { CATEGORIES, HOLIDAYS } from '../data/catalog'
import { SEED_ORDERS } from '../data/orders'
import { PRODUCTS } from '../data/products'
import type { IconName } from '../components/Icon'
import { REVIEWS } from '../data/reviews'
import { SELLERS } from '../data/sellers'
import type {
  AppNotification,
  CartItem,
  DeliveryMethod,
  GiftPerson,
  Order,
  Product,
  Review,
  Role,
  Toast,
} from '../types'
import { computeOrderMoney, daysUntil, formatMoney, round2, STATUS_LABEL } from '../utils/helpers'
import { dueReminders, reminderMessage, suggestionPath, whatsappText } from '../utils/reminders'

export interface Shipment {
  method: DeliveryMethod
  address: string
  date: string
}

export type NewProduct = Omit<Product, 'id' | 'sellerId' | 'sold' | 'createdAt' | 'active'>

interface State {
  // Datos "estáticos" (viven en memoria mientras la app corre)
  holidays: typeof HOLIDAYS
  categories: typeof CATEGORIES
  sellers: typeof SELLERS
  products: Product[]
  reviews: Review[]
  orders: Order[]

  // Sesión
  role: Role
  currentSellerId: string
  cart: CartItem[]
  wishlist: string[]
  toasts: Toast[]
  /** Dinero que el vendedor demo ya retiró de su saldo liberado */
  withdrawn: number
  notifications: AppNotification[]
  /** Calendario de regalos del comprador */
  people: GiftPerson[]
  /** Fecha sugerida para el checkout cuando se confirma un regalo del calendario */
  giftDate: string | null
  /** WhatsApp del comprador, donde le llegan los avisos */
  buyerWhatsapp: string
  /** Último aviso de WhatsApp preparado, para mostrarlo en el calendario */
  whatsappPreview: { personId: string; text: string } | null

  // Acciones generales
  setRole: (role: Role) => void
  pushToast: (message: string, tone?: Toast['tone']) => void
  notify: (audience: Role, icon: IconName, title: string, text: string, to: string) => void
  markNotificationRead: (id: number) => void
  markAllNotificationsRead: (audience: Role) => void
  dismissToast: (id: number) => void

  // Comprador
  addToCart: (productId: string, qty?: number, dedication?: string) => boolean
  updateCartQty: (productId: string, qty: number) => void
  setCartDedication: (productId: string, dedication: string) => void
  removeFromCart: (productId: string) => void
  toggleWishlist: (productId: string) => void
  /** Crea un pedido por cada vendedor del carrito. El pago queda retenido. */
  placeOrders: (buyer: { name: string; phone: string }, shipments: Record<string, Shipment>) => Order[]
  confirmReceived: (orderId: string) => void
  addReview: (orderId: string, rating: number, comment: string, author?: string) => void

  // Calendario de regalos
  addPerson: (data: Omit<GiftPerson, 'id' | 'sent'>) => string
  removePerson: (personId: string) => void
  setBuyerWhatsapp: (phone: string) => void
  /** Revisa las fechas y envía los avisos que ya tocan (1 semana o 3 días antes). */
  checkReminders: () => void
  /** Solo para la demo: envía ya el siguiente aviso pendiente, sin esperar al día real. */
  simulateReminder: (personId: string) => void
  /** Pone el regalo sugerido en el carrito y recuerda la fecha para el checkout. */
  confirmSuggestion: (personId: string, productId: string) => boolean

  // Vendedor
  addProduct: (data: NewProduct) => string
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleProductActive: (id: string) => void
  advanceOrder: (orderId: string) => void
  updatePickupAddress: (address: string) => void
  withdraw: (amount: number) => void
}

let toastSeq = 1
let productSeq = 100
let orderSeq = 1006
let reviewSeq = 1000
let notifSeq = 100

const hoursAgo = (h: number) => Date.now() - h * 3_600_000

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    audience: 'buyer',
    icon: 'truck',
    title: 'Tu pedido RG-1005 va en camino',
    text: 'Floristería Primavera ya lo envió. Cuando lo recibas, confírmalo para liberar el pago.',
    to: '/pedidos',
    read: false,
    createdAt: hoursAgo(3),
  },
  {
    id: 2,
    audience: 'seller',
    icon: 'package',
    title: 'Nuevo pedido RG-1004',
    text: 'Marcelo Peña compró 2 Ramos de girasoles. Acéptalo para empezar a prepararlo.',
    to: '/panel/pedidos',
    read: false,
    createdAt: hoursAgo(1),
  },
  {
    id: 3,
    audience: 'seller',
    icon: 'unlock',
    title: 'Pago liberado: RG-1001',
    text: 'La compradora confirmó la recepción. El dinero ya está en tu saldo.',
    to: '/panel',
    read: true,
    createdAt: hoursAgo(30),
  },
]

export const useStore = create<State>()(
  persist(
    (set, get) => ({
  holidays: HOLIDAYS,
  categories: CATEGORIES,
  sellers: SELLERS,
  products: PRODUCTS,
  reviews: REVIEWS,
  orders: SEED_ORDERS,

  role: 'buyer',
  currentSellerId: CURRENT_SELLER_ID,
  cart: [],
  wishlist: ['p11', 'p2'],
  toasts: [],
  withdrawn: 0,
  notifications: SEED_NOTIFICATIONS,
  people: [],
  giftDate: null,
  buyerWhatsapp: '',
  whatsappPreview: null,

  setRole: (role) => set({ role }),

  pushToast: (message, tone = 'success') => {
    const id = toastSeq++
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }))
    window.setTimeout(() => get().dismissToast(id), 3200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  notify: (audience, icon, title, text, to) =>
    set((s) => ({
      notifications: [
        { id: notifSeq++, audience, icon, title, text, to, read: false, createdAt: Date.now() },
        ...s.notifications,
      ].slice(0, 40),
    })),
  markNotificationRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsRead: (audience) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.audience === audience ? { ...n, read: true } : n)) })),

  // ───────────── Comprador
  addToCart: (productId, qty = 1, dedication = '') => {
    const product = get().products.find((p) => p.id === productId)
    if (!product || !product.active) return false
    const existing = get().cart.find((c) => c.productId === productId)
    const nextQty = (existing?.qty ?? 0) + qty
    if (nextQty > product.stock) {
      get().pushToast(`Solo quedan ${product.stock} unidades de “${product.title}”`, 'error')
      return false
    }
    set((s) => ({
      cart: existing
        ? s.cart.map((c) =>
            c.productId === productId ? { ...c, qty: nextQty, dedication: dedication || c.dedication } : c,
          )
        : [...s.cart, { productId, qty, dedication }],
    }))
    get().pushToast(`“${product.title}” se agregó al carrito`)
    return true
  },

  addPerson: (data) => {
    const id = `g${Date.now().toString(36)}`
    // Si se guarda tarde (faltan 3 días y pidió 1 semana), quedan solo los avisos que aún sirven.
    const left = daysUntil(data.date)
    const sorted = [...data.remindDays].sort((a, b) => b - a)
    const useful = sorted.filter((d) => d <= left)
    const person: GiftPerson = { ...data, id, name: data.name.trim(), remindDays: useful.length ? useful : [Math.min(...sorted)], sent: [] }
    set((s) => ({ people: [...s.people, person] }))
    get().checkReminders()
    return id
  },

  removePerson: (personId) =>
    set((s) => ({
      people: s.people.filter((x) => x.id !== personId),
      notifications: s.notifications.filter((n) => n.to !== suggestionPath(personId)),
      whatsappPreview: s.whatsappPreview?.personId === personId ? null : s.whatsappPreview,
    })),

  setBuyerWhatsapp: (phone) => set({ buyerWhatsapp: phone.trim() }),

  checkReminders: () => {
    for (const person of get().people) {
      const to = suggestionPath(person.id)
      const holiday = get().holidays.find((h) => h.id === person.holidayId)?.name ?? 'la fecha'
      const due = dueReminders(person)
      if (due.length) {
        set((s) => ({
          people: s.people.map((x) => (x.id === person.id ? { ...x, sent: [...x.sent, ...due] } : x)),
          notifications: s.notifications.filter((n) => n.to !== to),
        }))
        const { title, text } = reminderMessage(person, holiday)
        get().notify('buyer', 'calendar', title, text, to)
        set({ whatsappPreview: { personId: person.id, text: whatsappText(person, holiday, appUrl(to)) } })
      } else if (person.sent.length && daysUntil(person.date) >= 0 && !get().notifications.some((n) => n.to === to)) {
        // Las notificaciones no se guardan al recargar: se vuelve a mostrar el aviso pendiente.
        const { title, text } = reminderMessage(person, holiday)
        get().notify('buyer', 'calendar', title, text, to)
      }
    }
  },

  simulateReminder: (personId) => {
    const person = get().people.find((x) => x.id === personId)
    const next = person?.remindDays.find((d) => !person.sent.includes(d))
    if (!person || next === undefined) return
    const to = suggestionPath(personId)
    const holiday = get().holidays.find((h) => h.id === person.holidayId)?.name ?? 'la fecha'
    set((s) => ({
      people: s.people.map((x) => (x.id === personId ? { ...x, sent: [...x.sent, next] } : x)),
      notifications: s.notifications.filter((n) => n.to !== to),
    }))
    const { title, text } = reminderMessage(person, holiday, next)
    get().notify('buyer', 'calendar', title, text, to)
    set({ whatsappPreview: { personId, text: whatsappText(person, holiday, appUrl(to), next) } })
  },

  confirmSuggestion: (personId, productId) => {
    const person = get().people.find((x) => x.id === personId)
    if (!person) return false
    const inCart = get().cart.some((c) => c.productId === productId)
    if (!inCart && !get().addToCart(productId, 1)) return false
    set({ giftDate: person.date })
    return true
  },

  updateCartQty: (productId, qty) => {
    const product = get().products.find((p) => p.id === productId)
    if (!product) return
    if (qty <= 0) return get().removeFromCart(productId)
    if (qty > product.stock) {
      get().pushToast(`Solo quedan ${product.stock} unidades`, 'error')
      return
    }
    set((s) => ({ cart: s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)) }))
  },

  setCartDedication: (productId, dedication) =>
    set((s) => ({ cart: s.cart.map((c) => (c.productId === productId ? { ...c, dedication } : c)) })),

  removeFromCart: (productId) => set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) })),

  toggleWishlist: (productId) => {
    const has = get().wishlist.includes(productId)
    set((s) => ({
      wishlist: has ? s.wishlist.filter((id) => id !== productId) : [...s.wishlist, productId],
    }))
    get().pushToast(has ? 'Quitado de tu lista de deseos' : 'Guardado en tu lista de deseos', 'info')
  },

  placeOrders: (buyer, shipments) => {
    const { cart, products } = get()
    const bySeller = new Map<string, CartItem[]>()
    for (const item of cart) {
      const p = products.find((x) => x.id === item.productId)
      if (!p) continue
      bySeller.set(p.sellerId, [...(bySeller.get(p.sellerId) ?? []), item])
    }

    const created: Order[] = []
    bySeller.forEach((items, sellerId) => {
      const ship = shipments[sellerId]
      if (!ship) return
      const lines = items.map((i) => {
        const p = products.find((x) => x.id === i.productId)!
        return { productId: p.id, title: p.title, image: p.images[0], tone: p.tone, price: p.price, qty: i.qty, dedication: i.dedication }
      })
      const subtotal = lines.reduce((acc, l) => acc + l.price * l.qty, 0)
      const shippingCost =
        ship.method === 'shipping'
          ? Math.max(...items.map((i) => products.find((x) => x.id === i.productId)!.delivery.shippingCost))
          : 0
      created.push({
        id: `RG-${orderSeq++}`,
        sellerId,
        items: lines,
        method: ship.method,
        address: ship.address,
        date: ship.date,
        buyerName: buyer.name,
        buyerPhone: buyer.phone,
        ...computeOrderMoney(subtotal, shippingCost),
        status: 'pending',
        payment: 'held', // escrow: el dinero queda retenido por la plataforma
        createdAt: Date.now(),
        reviewed: false,
      })
    })

    set((s) => ({
      orders: [...created, ...s.orders],
      cart: [],
      products: s.products.map((p) => {
        const bought = cart.find((c) => c.productId === p.id)
        return bought ? { ...p, stock: Math.max(0, p.stock - bought.qty), sold: p.sold + bought.qty } : p
      }),
    }))
    const mySellerId = get().currentSellerId
    for (const o of created) {
      if (o.sellerId !== mySellerId) continue
      const what = o.items.map((i) => `${i.qty} ${i.title}`).join(', ')
      get().notify('seller', 'package', `Nuevo pedido ${o.id}`, `${o.buyerName} compró ${what}. Tú recibirás ${formatMoney(o.sellerNet)}.`, '/panel/pedidos')
    }
    return created
  },

  confirmReceived: (orderId) => {
    const target = get().orders.find((o) => o.id === orderId)
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId && o.status === 'ready' ? { ...o, status: 'delivered', payment: 'released' } : o,
      ),
    }))
    get().pushToast('¡Gracias! El pago fue liberado al vendedor')
    if (target && target.status === 'ready' && target.sellerId === get().currentSellerId) {
      get().notify('seller', 'unlock', `Pago liberado: ${target.id}`, `${target.buyerName} confirmó la recepción. ${formatMoney(target.sellerNet)} ya está en tu saldo.`, '/panel')
    }
  },

  addReview: (orderId, rating, comment, author = 'Tú') => {
    const order = get().orders.find((o) => o.id === orderId)
    if (!order || order.status !== 'delivered' || order.reviewed) return
    const review: Review = {
      id: `r${reviewSeq++}`,
      sellerId: order.sellerId,
      productId: order.items[0]?.productId,
      author,
      rating,
      comment: comment.trim() || 'Sin comentario.',
      date: new Date().toISOString().slice(0, 10),
    }
    set((s) => ({
      reviews: [review, ...s.reviews],
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, reviewed: true } : o)),
    }))
    get().pushToast('¡Gracias por calificar al vendedor!')
    if (order.sellerId === get().currentSellerId) {
      get().notify('seller', 'star', `Nueva reseña de ${rating} ${rating === 1 ? 'estrella' : 'estrellas'}`, `${author} calificó tu pedido ${order.id}: “${review.comment}”`, '/panel/resenas')
    }
  },

  // ───────────── Vendedor
  addProduct: (data) => {
    const id = `p${productSeq++}`
    const product: Product = {
      ...data,
      id,
      sellerId: get().currentSellerId,
      sold: 0,
      active: true,
      createdAt: Date.now(),
    }
    set((s) => ({ products: [product, ...s.products] }))
    get().pushToast('Tu regalo ya está publicado')
    return id
  },

  updateProduct: (id, patch) => {
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
    get().pushToast('Cambios guardados')
  },

  deleteProduct: (id) => {
    set((s) => ({
      products: s.products.filter((p) => p.id !== id),
      cart: s.cart.filter((c) => c.productId !== id),
      wishlist: s.wishlist.filter((w) => w !== id),
    }))
    get().pushToast('Regalo eliminado', 'info')
  },

  toggleProductActive: (id) => {
    const p = get().products.find((x) => x.id === id)
    if (!p) return
    set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) }))
    get().pushToast(p.active ? 'Regalo pausado' : 'Regalo reactivado', 'info')
  },

  advanceOrder: (orderId) => {
    const next = { pending: 'accepted', accepted: 'preparing', preparing: 'ready' } as const
    const order = get().orders.find((o) => o.id === orderId)
    if (!order || order.status === 'ready' || order.status === 'delivered') return
    const status = next[order.status]
    set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) }))
    get().pushToast(`Pedido ${orderId}: ${STATUS_LABEL[status].toLowerCase()}`, 'info')
    const copy: Record<'accepted' | 'preparing' | 'ready', [IconName, string, string]> = {
      accepted: ['check', `Tu pedido ${orderId} fue aceptado`, 'El vendedor confirmó tu compra y empezará a prepararla.'],
      preparing: ['package', `Están preparando tu pedido ${orderId}`, 'Falta poco: tu regalo está en preparación.'],
      ready:
        order.method === 'pickup'
          ? ['pin', `Tu pedido ${orderId} está listo para recoger`, 'Pasa por el punto del vendedor. Al recibirlo, confírmalo para liberar el pago.']
          : ['truck', `Tu pedido ${orderId} va en camino`, 'Cuando lo recibas, confírmalo para liberar el pago.'],
    }
    const [icon, title, text] = copy[status]
    get().notify('buyer', icon, title, text, '/pedidos')
  },

  updatePickupAddress: (address) => {
    const id = get().currentSellerId
    set((s) => ({ sellers: s.sellers.map((x) => (x.id === id ? { ...x, pickupAddress: address } : x)) }))
  },

  withdraw: (amount) => {
    if (amount <= 0) return
    set((s) => ({ withdrawn: round2(s.withdrawn + amount) }))
    get().pushToast(`Retiro de ${formatMoney(amount)} solicitado (simulado)`)
  },
}),
    {
      name: 'regalalo',
      version: 2,
      // En el navegador se guarda solo lo que el comprador no debe perder al recargar.
      partialize: (s) => ({ people: s.people, buyerWhatsapp: s.buyerWhatsapp }),
    },
  ),
)

/** Enlace completo a una pantalla, también cuando la app está publicada en una subcarpeta (GitHub Pages). */
const appUrl = (path: string) => window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '') + path

// ───────────── Selectores de ayuda
export const selectCartCount = (s: State) => s.cart.reduce((acc, c) => acc + c.qty, 0)
