import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CommissionBreakdown } from '../../components/Commission'
import { Breadcrumbs, EmptyState } from '../../components/Common'
import { Icon } from '../../components/Icon'
import { ProductImage } from '../../components/ProductImage'
import { useStore } from '../../store/useStore'
import { AGE_GROUPS, INTERESTS } from '../../data/audience'
import type { AgeGroup, Audience, Product } from '../../types'
import { fileToResizedDataUrl } from '../../utils/images'
import { formatMoney } from '../../utils/helpers'

const MAX_PHOTOS = 4
const TONES: [string, string][] = [
  ['#FFE08A', '#F5B83D'],
  ['#FFB38A', '#E8532F'],
  ['#D6C5FF', '#7C5CE0'],
  ['#CDEBD0', '#7DBE88'],
  ['#FFD3DC', '#F28BA0'],
  ['#BFD9FF', '#4F86E8'],
]

interface FormState {
  title: string
  description: string
  price: string
  stock: string
  categoryId: string
  holidays: string[]
  audience: Audience
  images: string[]
  pickup: boolean
  shipping: boolean
  shippingCost: string
  shippingZones: string
}

type Errors = Partial<Record<keyof FormState | 'delivery' | 'ages' | 'interests', string>>

export function GiftForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)

  const sellerId = useStore((s) => s.currentSellerId)
  const seller = useStore((s) => s.sellers.find((x) => x.id === s.currentSellerId))
  const product = useStore((s) => s.products.find((p) => p.id === id))
  const categories = useStore((s) => s.categories)
  const holidays = useStore((s) => s.holidays)
  const addProduct = useStore((s) => s.addProduct)
  const updateProduct = useStore((s) => s.updateProduct)
  const updatePickupAddress = useStore((s) => s.updatePickupAddress)
  const pushToast = useStore((s) => s.pushToast)

  const [form, setForm] = useState<FormState>(() => ({
    title: product?.title ?? '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    stock: product ? String(product.stock) : '',
    categoryId: product?.categoryId ?? categories[0].id,
    holidays: product?.holidays ?? [],
    audience: product?.audience ?? { gender: 'todos', ages: [], interests: [] },
    images: product?.images ?? [],
    pickup: product?.delivery.pickup ?? true,
    shipping: product?.delivery.shipping ?? false,
    shippingCost: product ? String(product.delivery.shippingCost) : '15',
    shippingZones: product?.delivery.shippingZones ?? '',
  }))
  const [pickupAddress, setPickupAddress] = useState(seller?.pickupAddress ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  if (editing && (!product || product.sellerId !== sellerId)) {
    return (
      <EmptyState
        icon="gift"
        title="No encontramos este regalo"
        text="Puede que ya lo hayas eliminado."
        actionLabel="Volver a mis regalos"
        actionTo="/panel/regalos"
      />
    )
  }

  const toggleHoliday = (hid: string) =>
    set('holidays', form.holidays.includes(hid) ? form.holidays.filter((h) => h !== hid) : [...form.holidays, hid])

  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const setAudience = (patch: Partial<Audience>) => set('audience', { ...form.audience, ...patch })

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = MAX_PHOTOS - form.images.length
    if (room <= 0) {
      pushToast(`Máximo ${MAX_PHOTOS} fotos por regalo`, 'error')
      return
    }
    setUploading(true)
    const added: string[] = []
    for (const file of Array.from(files).slice(0, room)) {
      if (file.size > 12 * 1024 * 1024) {
        pushToast(`“${file.name}” pesa más de 12 MB`, 'error')
        continue
      }
      try {
        added.push(await fileToResizedDataUrl(file))
      } catch {
        pushToast(`No se pudo leer “${file.name}”`, 'error')
      }
    }
    if (added.length) setForm((f) => ({ ...f, images: [...f.images, ...added] }))
    if (files.length > room) pushToast(`Solo se agregaron ${room} foto(s): el máximo es ${MAX_PHOTOS}`, 'info')
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const makeCover = (i: number) => set('images', [form.images[i], ...form.images.filter((_, k) => k !== i)])
  const removePhoto = (i: number) => set('images', form.images.filter((_, k) => k !== i))

  const price = Number(form.price)
  const shippingCost = form.shipping ? Math.max(0, Number(form.shippingCost) || 0) : 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err: Errors = {}
    if (form.title.trim().length < 4) err.title = 'Ponle un nombre de al menos 4 letras'
    if (form.description.trim().length < 20) err.description = 'Describe tu regalo con al menos 20 caracteres'
    if (!(price > 0)) err.price = 'Indica un precio mayor a 0'
    const stock = Number(form.stock)
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) err.stock = 'Indica cuántas unidades tienes'
    if (form.holidays.length === 0) err.holidays = 'Elige al menos una festividad'
    if (form.audience.ages.length === 0) err.ages = 'Elige al menos una edad'
    if (form.audience.interests.length === 0) err.interests = 'Elige al menos un gusto'
    if (!form.pickup && !form.shipping) err.delivery = 'Elige al menos una forma de entrega'
    if (form.pickup && pickupAddress.trim().length < 6) err.delivery = 'Indica la dirección del punto de recogida'
    if (form.shipping && form.shippingZones.trim().length < 3) err.shippingZones = 'Indica a qué zonas envías'
    setErrors(err)
    if (Object.keys(err).length) {
      pushToast('Revisa los campos marcados', 'error')
      return
    }

    if (pickupAddress.trim() !== seller?.pickupAddress) updatePickupAddress(pickupAddress.trim())

    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Math.round(price * 100) / 100,
      stock,
      categoryId: form.categoryId,
      holidays: form.holidays,
      audience: form.audience,
      images: form.images,
      tone: product?.tone ?? TONES[form.title.trim().length % TONES.length],
      delivery: {
        pickup: form.pickup,
        shipping: form.shipping,
        shippingCost: form.shipping ? shippingCost : 0,
        shippingZones: form.shipping ? form.shippingZones.trim() : '',
      },
    } satisfies Omit<Product, 'id' | 'sellerId' | 'sold' | 'createdAt' | 'active'>

    if (editing && product) updateProduct(product.id, data)
    else addProduct(data)
    navigate('/panel/regalos')
  }

  const cover = form.images[0]
  const tone = product?.tone ?? TONES[form.title.trim().length % TONES.length]

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Panel', to: '/panel' },
          { label: 'Mis regalos', to: '/panel/regalos' },
          { label: editing ? 'Editar regalo' : 'Publicar regalo' },
        ]}
      />
      <div className="page-head">
        <h1>{editing ? 'Editar regalo' : 'Publicar un regalo'}</h1>
        <p>Cuanto más claro y atractivo, más fácil de vender.</p>
      </div>

      <form className="cart-layout" onSubmit={submit} noValidate>
        <div className="cart-groups">
          {/* ───────── Información */}
          <section className="panel">
            <h2>
              <Icon name="pen" size={20} /> Información del regalo
            </h2>
            <label className={`field ${errors.title ? 'has-error' : ''}`}>
              <span>Nombre</span>
              <input
                value={form.title}
                maxLength={60}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Ej. Ramo de girasoles con tarjeta"
              />
              {errors.title && <small className="err">{errors.title}</small>}
            </label>
            <label className={`field ${errors.description ? 'has-error' : ''}`}>
              <span>Descripción</span>
              <textarea
                rows={4}
                maxLength={400}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="¿Qué incluye? ¿De qué está hecho? ¿Se puede personalizar?"
              />
              <small className="counter">{form.description.length}/400</small>
              {errors.description && <small className="err">{errors.description}</small>}
            </label>
            <div className="form-grid three">
              <label className={`field ${errors.price ? 'has-error' : ''}`}>
                <span>Precio (Bs)</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="0"
                />
                {errors.price && <small className="err">{errors.price}</small>}
              </label>
              <label className={`field ${errors.stock ? 'has-error' : ''}`}>
                <span>Stock disponible</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                  placeholder="0"
                />
                {errors.stock && <small className="err">{errors.stock}</small>}
              </label>
              <label className="field span2">
                <span>Categoría</span>
                <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* ───────── Festividades */}
          <section className="panel">
            <h2>
              <Icon name="calendar" size={20} /> ¿Para qué festividades es?
            </h2>
            <div className="chips" role="group" aria-label="Festividades">
              {holidays.map((h) => (
                <button
                  type="button"
                  key={h.id}
                  className="chip"
                  aria-pressed={form.holidays.includes(h.id)}
                  onClick={() => toggleHoliday(h.id)}
                >
                  <Icon name={h.icon} size={15} /> {h.name}
                </button>
              ))}
            </div>
            {errors.holidays && <small className="err">{errors.holidays}</small>}
          </section>

          {/* ───────── Para quién es: lo usa el algoritmo para sugerir el regalo correcto */}
          <section className="panel">
            <h2>
              <Icon name="users" size={20} /> ¿Para quién es este regalo?
            </h2>
            <p className="muted audience-hint">
              Con esto lo sugerimos a quien de verdad le puede gustar. Por ejemplo, a un papá no le mostramos un ramo de rosas.
            </p>

            <div className="audience-block">
              <span className="audience-label">Sexo</span>
              <div className="seg" role="group" aria-label="Sexo">
                {(
                  [
                    ['todos', 'Para todos'],
                    ['hombre', 'Hombres'],
                    ['mujer', 'Mujeres'],
                  ] as const
                ).map(([v, l]) => (
                  <button key={v} type="button" aria-pressed={form.audience.gender === v} onClick={() => setAudience({ gender: v })}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="audience-block">
              <span className="audience-label">Edad</span>
              <div className="chips" role="group" aria-label="Edad">
                {AGE_GROUPS.map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    className="chip"
                    aria-pressed={form.audience.ages.includes(g.id)}
                    onClick={() => setAudience({ ages: toggleIn<AgeGroup>(form.audience.ages, g.id) })}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
              {errors.ages && <small className="err">{errors.ages}</small>}
            </div>

            <div className="audience-block">
              <span className="audience-label">Le gusta a quien disfruta de…</span>
              <div className="chips" role="group" aria-label="Gustos">
                {INTERESTS.map((i) => (
                  <button
                    type="button"
                    key={i.id}
                    className="chip"
                    aria-pressed={form.audience.interests.includes(i.id)}
                    onClick={() => setAudience({ interests: toggleIn(form.audience.interests, i.id) })}
                  >
                    <Icon name={i.icon} size={15} /> {i.name}
                  </button>
                ))}
              </div>
              {errors.interests && <small className="err">{errors.interests}</small>}
            </div>
          </section>

          {/* ───────── Fotos */}
          <section className="panel">
            <h2>
              <Icon name="gift" size={20} /> Fotos
            </h2>
            <p className="muted">
              Sube hasta {MAX_PHOTOS} fotos. La primera es la portada. Se reducen automáticamente para que pesen poco.
            </p>
            <div className="photo-grid">
              {form.images.map((src, i) => (
                <div key={i} className={`photo-item ${i === 0 ? 'cover' : ''}`}>
                  <ProductImage src={src} tone={tone} alt={`Foto ${i + 1}`} w={320} h={320} />
                  {i === 0 && <span className="cover-tag">Portada</span>}
                  <div className="photo-actions">
                    {i !== 0 && (
                      <button type="button" onClick={() => makeCover(i)}>
                        Portada
                      </button>
                    )}
                    <button type="button" onClick={() => removePhoto(i)} aria-label={`Quitar foto ${i + 1}`}>
                      <Icon name="close" size={14} strokeWidth={2.6} />
                    </button>
                  </div>
                </div>
              ))}
              {form.images.length < MAX_PHOTOS && (
                <button type="button" className="photo-add" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Icon name="plus" size={26} />
                  <span>{uploading ? 'Procesando…' : 'Agregar foto'}</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => onFiles(e.target.files)}
            />
            {form.images.length === 0 && (
              <p className="muted">Los regalos con fotos venden mucho más. Puedes publicar sin foto y agregarla después.</p>
            )}
          </section>

          {/* ───────── Entrega */}
          <section className="panel">
            <h2>
              <Icon name="truck" size={20} /> Entrega
            </h2>
            <p className="muted">Elige cómo pueden recibir este regalo tus clientes. Puedes ofrecer una o ambas.</p>

            <label className={`toggle-card ${form.pickup ? 'on' : ''}`}>
              <input type="checkbox" checked={form.pickup} onChange={(e) => set('pickup', e.target.checked)} />
              <Icon name="pin" size={22} />
              <div>
                <strong>Recogida en mi punto</strong>
                <span>El cliente viene por su regalo. Sin costo para él.</span>
              </div>
              <i className="switch" aria-hidden="true" />
            </label>
            {form.pickup && (
              <label className="field">
                <span>Dirección de recogida</span>
                <input
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Calle, número y zona"
                />
                <small className="hint">Es la misma para todos tus regalos.</small>
              </label>
            )}

            <label className={`toggle-card ${form.shipping ? 'on' : ''}`}>
              <input type="checkbox" checked={form.shipping} onChange={(e) => set('shipping', e.target.checked)} />
              <Icon name="truck" size={22} />
              <div>
                <strong>Envío a donde indique el cliente</strong>
                <span>Tú haces llegar el regalo. El costo de envío es tuyo.</span>
              </div>
              <i className="switch" aria-hidden="true" />
            </label>
            {form.shipping && (
              <div className="form-grid">
                <label className="field">
                  <span>Costo de envío (Bs)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.shippingCost}
                    onChange={(e) => set('shippingCost', e.target.value)}
                  />
                </label>
                <label className={`field ${errors.shippingZones ? 'has-error' : ''}`}>
                  <span>Zonas a las que envías</span>
                  <input
                    value={form.shippingZones}
                    onChange={(e) => set('shippingZones', e.target.value)}
                    placeholder="Ej. Centro, Equipetrol y Zona Norte"
                  />
                  {errors.shippingZones && <small className="err">{errors.shippingZones}</small>}
                </label>
              </div>
            )}
            {errors.delivery && <small className="err">{errors.delivery}</small>}
          </section>
        </div>

        {/* ───────── Vista previa y comisión */}
        <aside className="summary">
          <h2>Así lo verá el comprador</h2>
          <div className="preview">
            <div className="preview-media">
              <ProductImage src={cover} tone={tone} alt="Portada" w={480} h={384} />
            </div>
            <strong>{form.title.trim() || 'Nombre de tu regalo'}</strong>
            <div className="price">
              <small>Bs</small>
              {price > 0 ? formatMoney(price, false) : '0'}
            </div>
            <div className="pcard-tags static">
              {form.pickup && (
                <span className="tag">
                  <Icon name="pin" size={11} strokeWidth={2.4} /> Recogida
                </span>
              )}
              {form.shipping && (
                <span className="tag">
                  <Icon name="truck" size={11} strokeWidth={2.4} /> Envío
                </span>
              )}
            </div>
          </div>

          <h3 className="side-title">Cuánto recibes por venta</h3>
          <CommissionBreakdown price={price > 0 ? price : 0} shipping={shippingCost} />

          <button type="submit" className="btn btn-primary wide" disabled={uploading}>
            {editing ? 'Guardar cambios' : 'Publicar regalo'}
          </button>
          <Link to="/panel/regalos" className="btn btn-outline wide">
            Cancelar
          </Link>
        </aside>
      </form>
    </>
  )
}
