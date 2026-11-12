import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/Common'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { ProductImage } from '../../components/ProductImage'
import { useStore } from '../../store/useStore'
import type { Product } from '../../types'
import { formatMoney, normalize } from '../../utils/helpers'

type Filter = 'all' | 'active' | 'paused' | 'out'

const statusOf = (p: Product): Exclude<Filter, 'all'> => (!p.active ? 'paused' : p.stock <= 0 ? 'out' : 'active')

const STATUS_LABEL: Record<Exclude<Filter, 'all'>, string> = {
  active: 'Activo',
  paused: 'Pausado',
  out: 'Agotado',
}

export function MyGifts() {
  const sellerId = useStore((s) => s.currentSellerId)
  const products = useStore((s) => s.products)
  const categories = useStore((s) => s.categories)
  const toggleProductActive = useStore((s) => s.toggleProductActive)
  const deleteProduct = useStore((s) => s.deleteProduct)

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const mine = useMemo(() => products.filter((p) => p.sellerId === sellerId), [products, sellerId])
  const counts = useMemo(
    () => ({
      all: mine.length,
      active: mine.filter((p) => statusOf(p) === 'active').length,
      paused: mine.filter((p) => statusOf(p) === 'paused').length,
      out: mine.filter((p) => statusOf(p) === 'out').length,
    }),
    [mine],
  )

  const shown = useMemo(() => {
    const q = normalize(query.trim())
    return mine
      .filter((p) => (filter === 'all' ? true : statusOf(p) === filter))
      .filter((p) => !q || normalize(p.title).includes(q))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [mine, filter, query])

  if (mine.length === 0) {
    return (
      <EmptyState
        icon="gift"
        title="Aún no publicaste regalos"
        text="Publica tu primer regalo y empieza a vender en las próximas festividades."
        actionLabel="Publicar mi primer regalo"
        actionTo="/panel/regalos/nuevo"
      />
    )
  }

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <h1>Mis regalos</h1>
          <p>Gestiona lo que vendes: edita, pausa o elimina.</p>
        </div>
        <Link to="/panel/regalos/nuevo" className="btn btn-primary">
          <Icon name="plus" size={18} strokeWidth={2.6} /> Publicar regalo
        </Link>
      </div>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filtrar por estado">
          {(
            [
              ['all', 'Todos'],
              ['active', 'Activos'],
              ['paused', 'Pausados'],
              ['out', 'Agotados'],
            ] as [Filter, string][]
          ).map(([k, label]) => (
            <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {label} ({counts[k]})
            </button>
          ))}
        </div>
        <label className="inline-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Buscar en mis regalos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar en mis regalos"
          />
        </label>
      </div>

      <div className="gift-list">
        {shown.map((p) => {
          const st = statusOf(p)
          const cat = categories.find((c) => c.id === p.categoryId)
          return (
            <article key={p.id} className={`gift-row ${st}`}>
              <Link to={`/regalo/${p.id}`} className="gift-thumb" aria-label={`Ver ${p.title} como comprador`}>
                <ProductImage src={p.images[0]} tone={p.tone} alt={p.title} w={240} h={240} />
              </Link>
              <div className="gift-main">
                <strong>{p.title}</strong>
                <span className="muted">
                  {cat?.name} ·{' '}
                  {[p.delivery.pickup && 'Recogida', p.delivery.shipping && 'Envío'].filter(Boolean).join(' y ')}
                </span>
              </div>
              <div className="gift-num">
                <span className="muted">Precio</span>
                <b>{formatMoney(p.price)}</b>
              </div>
              <div className="gift-num">
                <span className="muted">Stock</span>
                <b className={p.stock <= 5 ? 'low' : ''}>{p.stock}</b>
              </div>
              <div className="gift-num">
                <span className="muted">Vendidos</span>
                <b>{p.sold}</b>
              </div>
              <span className={`status-badge ${st}`}>{STATUS_LABEL[st]}</span>
              <div className="gift-actions">
                <Link to={`/panel/regalos/${p.id}/editar`} className="btn btn-outline btn-sm">
                  Editar
                </Link>
                <button className="btn btn-ghost-dark btn-sm" onClick={() => toggleProductActive(p.id)}>
                  {p.active ? 'Pausar' : 'Reactivar'}
                </button>
                <button className="icon-plain" aria-label={`Eliminar ${p.title}`} onClick={() => setToDelete(p)}>
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </article>
          )
        })}
        {shown.length === 0 && <p className="muted">No hay regalos con ese filtro.</p>}
      </div>

      {toDelete && (
        <Modal
          title="¿Eliminar este regalo?"
          onClose={() => setToDelete(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setToDelete(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  deleteProduct(toDelete.id)
                  setToDelete(null)
                }}
              >
                Sí, eliminar
              </button>
            </>
          }
        >
          <p>
            Se eliminará <strong>{toDelete.title}</strong> del catálogo y de los carritos. Los pedidos ya hechos no se
            afectan. Si solo quieres dejar de venderlo por un tiempo, mejor <strong>pausarlo</strong>.
          </p>
        </Modal>
      )}
    </>
  )
}
