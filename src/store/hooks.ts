import { useMemo } from 'react'
import { useStore } from './useStore'
import { computeSellerFinance, computeSellerStats } from '../utils/helpers'

/** Calificación promedio de un vendedor, calculada a partir de las reseñas en memoria. */
export function useSellerStats(sellerId: string) {
  const reviews = useStore((s) => s.reviews)
  return useMemo(() => computeSellerStats(sellerId, reviews), [sellerId, reviews])
}

/** Estadísticas de todos los vendedores (para ordenar rankings). */
export function useAllSellerStats() {
  const reviews = useStore((s) => s.reviews)
  const sellers = useStore((s) => s.sellers)
  return useMemo(
    () => Object.fromEntries(sellers.map((s) => [s.id, computeSellerStats(s.id, reviews)])),
    [sellers, reviews],
  )
}

/** Números del negocio del vendedor activo: ventas, comisión y saldos (retenido / liberado / retirable). */
export function useSellerFinance() {
  const orders = useStore((s) => s.orders)
  const sellerId = useStore((s) => s.currentSellerId)
  const withdrawn = useStore((s) => s.withdrawn)
  return useMemo(() => computeSellerFinance(orders, sellerId, withdrawn), [orders, sellerId, withdrawn])
}
