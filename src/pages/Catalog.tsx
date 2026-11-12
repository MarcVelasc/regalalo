import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/Common'
import { Icon } from '../components/Icon'
import { ProductCard } from '../components/ProductCard'
import { Stars } from '../components/Stars'
import { useAllSellerStats } from '../store/hooks'
import { useStore } from '../store/useStore'
import { normalize } from '../utils/helpers'

type Sort = 'popular' | 'price-asc' | 'price-desc' | 'new' | 'rating'

const SORTS: { value: Sort; label: string }[] = [
  { value: 'popular', label: 'Más vendidos' },
  { value: 'new', label: 'Más nuevos' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor calificados' },
]

const RATING_OPTIONS = [
  { value: '', label: 'Cualquiera' },
  { value: '4', label: '4.0 o más' },
  { value: '4.5', label: '4.5 o más' },
]

export function Catalog() {
  const [params, setParams] = useSearchParams()
  const holidays = useStore((s) => s.holidays)
  const categories = useStore((s) => s.categories)
  const sellers = useStore((s) => s.sellers)
  const products = useStore((s) => s.products)
  const stats = useAllSellerStats()
  const [showFilters, setShowFilters] = useState(false)

  const q = params.get('q') ?? ''
  const fiesta = params.get('fiesta') ?? ''
  const cat = params.get('cat') ?? ''
  const entrega = params.get('entrega') ?? ''
  const min = params.get('min') ?? ''
  const max = params.get('max') ?? ''
  const rating = params.get('rating') ?? ''
  const sort = (params.get('orden') as Sort) || 'popular'

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const clearAll = () => setParams(q ? { q } : {}, { replace: true })

  const results = useMemo(() => {
    const terms = normalize(q).split(/\s+/).filter(Boolean)
    const minN = min ? Number(min) : 0
    const maxN = max ? Number(max) : Infinity
    const minRating = rating ? Number(rating) : 0

    const list = products.filter((p) => {
      if (!p.active) return false
      if (fiesta && !p.holidays.includes(fiesta)) return false
      if (cat && p.categoryId !== cat) return false
      if (entrega === 'pickup' && !p.delivery.pickup) return false
      if (entrega === 'shipping' && !p.delivery.shipping) return false
      if (p.price < minN || p.price > maxN) return false
      if (minRating && stats[p.sellerId].avg < minRating) return false
      if (terms.length) {
        const seller = sellers.find((s) => s.id === p.sellerId)
        const hay = normalize(
          [
            p.title,
            p.description,
            seller?.name ?? '',
            categories.find((c) => c.id === p.categoryId)?.name ?? '',
            ...p.holidays.map((h) => holidays.find((x) => x.id === h)?.name ?? ''),
          ].join(' '),
        )
        if (!terms.every((t) => hay.includes(t))) return false
      }
      return true
    })

    const sorted = [...list]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'new':
        sorted.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'rating':
        sorted.sort((a, b) => stats[b.sellerId].avg - stats[a.sellerId].avg || b.sold - a.sold)
        break
      default:
        sorted.sort((a, b) => b.sold - a.sold)
    }
    return sorted
  }, [products, sellers, categories, holidays, stats, q, fiesta, cat, entrega, min, max, rating, sort])

  const activeFilters: { key: string; label: string }[] = []
  if (fiesta) activeFilters.push({ key: 'fiesta', label: holidays.find((h) => h.id === fiesta)?.name ?? fiesta })
  if (cat) activeFilters.push({ key: 'cat', label: categories.find((c) => c.id === cat)?.name ?? cat })
  if (entrega) activeFilters.push({ key: 'entrega', label: entrega === 'pickup' ? 'Recogida' : 'Envío a domicilio' })
  if (min || max) activeFilters.push({ key: 'precio', label: `Bs ${min || '0'} – ${max || '∞'}` })
  if (rating) activeFilters.push({ key: 'rating', label: `Vendedor ${rating}+` })

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(params)
    if (key === 'precio') {
      next.delete('min')
      next.delete('max')
    } else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <>
      <div className="page-head">
        <h1>{q ? `Resultados para “${q}”` : 'Catálogo de regalos'}</h1>
        <p>Encuentra el detalle perfecto para cada ocasión.</p>
      </div>

      <div className="catalog">
        <aside className={`filters ${showFilters ? 'open' : ''}`} aria-label="Filtros">
          <div className="filters-head">
            <h2>Filtros</h2>
            {activeFilters.length > 0 && (
              <button className="link-btn" onClick={clearAll}>
                Limpiar todo
              </button>
            )}
          </div>

          <fieldset>
            <legend>Festividad</legend>
            <label className="opt">
              <input type="radio" name="fiesta" checked={!fiesta} onChange={() => setParam('fiesta', '')} />
              <span>Todas</span>
            </label>
            {holidays.map((h) => (
              <label key={h.id} className="opt">
                <input type="radio" name="fiesta" checked={fiesta === h.id} onChange={() => setParam('fiesta', h.id)} />
                <span>
                  <Icon name={h.icon} size={15} /> {h.name}
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Categoría</legend>
            <label className="opt">
              <input type="radio" name="cat" checked={!cat} onChange={() => setParam('cat', '')} />
              <span>Todas</span>
            </label>
            {categories.map((c) => (
              <label key={c.id} className="opt">
                <input type="radio" name="cat" checked={cat === c.id} onChange={() => setParam('cat', c.id)} />
                <span>
                  <Icon name={c.icon} size={15} /> {c.name}
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Tipo de entrega</legend>
            <div className="seg">
              {[
                { v: '', l: 'Todas' },
                { v: 'pickup', l: 'Recogida' },
                { v: 'shipping', l: 'Envío' },
              ].map((o) => (
                <button key={o.v} type="button" aria-pressed={entrega === o.v} onClick={() => setParam('entrega', o.v)}>
                  {o.l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Precio (Bs)</legend>
            <div className="price-range">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Mín"
                value={min}
                onChange={(e) => setParam('min', e.target.value)}
                aria-label="Precio mínimo"
              />
              <span>–</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Máx"
                value={max}
                onChange={(e) => setParam('max', e.target.value)}
                aria-label="Precio máximo"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Calificación del vendedor</legend>
            {RATING_OPTIONS.map((o) => (
              <label key={o.value} className="opt">
                <input type="radio" name="rating" checked={rating === o.value} onChange={() => setParam('rating', o.value)} />
                <span>
                  {o.value ? <Stars value={Number(o.value)} size={13} /> : null} {o.label}
                </span>
              </label>
            ))}
          </fieldset>
        </aside>

        <section aria-live="polite">
          <div className="results-bar">
            <button className="btn btn-outline btn-sm filters-toggle" onClick={() => setShowFilters((v) => !v)}>
              <Icon name="filters" size={16} /> {showFilters ? 'Ocultar filtros' : 'Filtros'}
            </button>
            <strong>
              {results.length} {results.length === 1 ? 'regalo' : 'regalos'}
            </strong>
            <label className="sort">
              <span>Ordenar</span>
              <select value={sort} onChange={(e) => setParam('orden', e.target.value === 'popular' ? '' : e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {activeFilters.length > 0 && (
            <div className="active-filters">
              {activeFilters.map((f) => (
                <button key={f.key} className="pill-x" onClick={() => removeFilter(f.key)}>
                  {f.label} <Icon name="close" size={13} strokeWidth={2.6} />
                </button>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <EmptyState
              icon="search"
              title="No encontramos regalos con esos filtros"
              text="Prueba quitando algún filtro o buscando con otras palabras."
            />
          ) : (
            <div className="grid-products catalog-grid">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
