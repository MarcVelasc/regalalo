import { useMemo } from 'react'
import { EmptyState } from '../components/Common'
import { ProductCard } from '../components/ProductCard'
import { useStore } from '../store/useStore'

export function Wishlist() {
  const wishlist = useStore((s) => s.wishlist)
  const products = useStore((s) => s.products)
  const items = useMemo(
    () => wishlist.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p),
    [wishlist, products],
  )

  if (items.length === 0) {
    return (
      <EmptyState
        icon="heart"
        title="Tu lista de deseos está vacía"
        text="Toca el corazón en cualquier regalo para guardarlo y encontrarlo después."
        actionLabel="Explorar regalos"
        actionTo="/catalogo"
      />
    )
  }

  return (
    <>
      <div className="page-head">
        <h1>Lista de deseos</h1>
        <p>
          {items.length} {items.length === 1 ? 'regalo guardado' : 'regalos guardados'}
        </p>
      </div>
      <div className="grid-products">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}
