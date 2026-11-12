import { ageGroupOf, AGE_GROUPS, interestName, relationName } from '../data/audience'
import type { GiftPerson, Holiday, Product, Review } from '../types'
import { computeSellerStats } from './helpers'

/**
 * Algoritmo de sugerencias de Regalalo (reglas con puntaje, no es IA entrenada).
 *
 * Paso 1 · Descarta lo que no va:
 *   sin stock, fuera del presupuesto, para otro sexo (a papá no se le sugieren rosas)
 *   o para otra edad (a un ahijado de 12 no se le sugiere un kit de café).
 * Paso 2 · Puntaje de 0 a 100 para ordenar lo que queda:
 *   gustos de la persona 40 · ocasión 20 · calificación del vendedor 20 ·
 *   aprovechar el presupuesto 10 · lo que más se vende 10.
 * Paso 3 · Muestra solo las primeras N (3, 5 o 10), cada una con sus razones.
 */

export const WEIGHTS = { interests: 40, occasion: 20, rating: 20, budget: 10, popularity: 10 } as const

export interface Suggestion {
  product: Product
  score: number
  reasons: string[]
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

export function suggestFor(person: GiftPerson, products: Product[], reviews: Review[], holidays: Holiday[]): Suggestion[] {
  const ratingCache = new Map<string, { avg: number; count: number }>()
  const rating = (sellerId: string) => {
    if (!ratingCache.has(sellerId)) ratingCache.set(sellerId, computeSellerStats(sellerId, reviews))
    return ratingCache.get(sellerId)!
  }
  const group = ageGroupOf(person.age)
  const groupLabel = AGE_GROUPS.find((g) => g.id === group)!.name.toLowerCase()
  const maxSold = Math.max(1, ...products.map((p) => p.sold))
  const holiday = holidays.find((h) => h.id === person.holidayId)
  const who = relationName(person.relation).toLowerCase()

  const out: Suggestion[] = []
  for (const p of products) {
    // Paso 1
    if (!p.active || p.stock <= 0 || p.price > person.budget) continue
    if (p.audience.gender !== 'todos' && p.audience.gender !== person.gender) continue
    if (!p.audience.ages.includes(group)) continue

    // Paso 2
    const liked = person.interests.filter((i) => p.audience.interests.includes(i))
    const interests = person.interests.length ? liked.length / person.interests.length : 0
    const occasion = p.holidays.includes(person.holidayId) ? 1 : 0
    const st = rating(p.sellerId)
    // Promedio "bayesiano": 1 reseña de 5 estrellas no le gana a 40 reseñas de 4,8
    const bayes = (st.avg * st.count + 4 * 3) / (st.count + 3)
    const ratingScore = clamp01((bayes - 3) / 2)
    const budget = clamp01(1 - Math.abs(p.price - person.budget * 0.8) / person.budget)
    const popularity = Math.log1p(p.sold) / Math.log1p(maxSold)

    const score = Math.round(
      WEIGHTS.interests * interests +
        WEIGHTS.occasion * occasion +
        WEIGHTS.rating * ratingScore +
        WEIGHTS.budget * budget +
        WEIGHTS.popularity * popularity,
    )

    // Razones visibles para el comprador
    const reasons: string[] = []
    if (liked.length) reasons.push(`Le gusta: ${liked.map((i) => interestName(i).toLowerCase()).join(' y ')}`)
    reasons.push(
      p.audience.gender === 'todos'
        ? `Pensado para ${groupLabel.replace(/\s*\(.*\)/, '')}`
        : `Ideal para ${who === 'otra persona' ? (person.gender === 'hombre' ? 'él' : 'ella') : who}`,
    )
    if (occasion && holiday) reasons.push(`Ocasión: ${holiday.name}`)
    if (st.count > 0) reasons.push(`Vendedor ${st.avg.toLocaleString('es-BO', { maximumFractionDigits: 1 })} ★`)

    out.push({ product: p, score, reasons })
  }

  // Las mejores N según el puntaje.
  return out.sort((a, b) => b.score - a.score || b.product.sold - a.product.sold).slice(0, person.count)
}
