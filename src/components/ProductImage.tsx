import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

interface Props {
  /** URL de la foto. Puede contener {w}, que se reemplaza por el ancho pedido. */
  src: string | undefined
  tone: [string, string]
  alt: string
  /** Tamaño que se pide al servidor de imágenes (usa ~2x del tamaño visible para pantallas retina). */
  w?: number
  h?: number
  /** true para la foto principal visible al cargar la página (desactiva la carga diferida). */
  eager?: boolean
  /** Ocupa todo el contenedor padre (que debe tener position: relative y un tamaño). */
  fill?: boolean
  className?: string
}

const resolve = (src: string, w: number) => src.replace('{w}', String(w))

/**
 * Foto de regalo optimizada:
 * - carga diferida (lazy) y decodificación asíncrona
 * - ancho/alto declarados para evitar saltos de diseño
 * - fondo con degradado + brillo mientras carga
 * - si la foto falla (sin internet, URL rota) muestra un fondo limpio con icono
 */
export function ProductImage({ src, tone, alt, w = 480, h = 384, eager = false, fill = false, className = '' }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(src ? 'loading' : 'error')
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setState(src ? 'loading' : 'error')
  }, [src])

  // Si la imagen ya estaba en caché, onLoad puede dispararse antes de enganchar el evento.
  useEffect(() => {
    const el = ref.current
    if (el && el.complete && el.naturalWidth > 0) setState('ok')
  }, [src])

  const style: React.CSSProperties = {
    background: `linear-gradient(145deg, ${tone[0]}, ${tone[1]})`,
    ...(fill ? {} : { aspectRatio: `${w} / ${h}` }),
  }

  return (
    <div className={`pimg ${fill ? 'fill' : ''} ${state === 'loading' ? 'is-loading' : ''} ${className}`} style={style}>
      {src && state !== 'error' && (
        <img
          ref={ref}
          src={resolve(src, w)}
          alt={alt}
          width={w}
          height={h}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          className={state === 'ok' ? 'is-ready' : ''}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
        />
      )}
      {state === 'error' && (
        <div className="pimg-fallback" role="img" aria-label={alt}>
          <Icon name="gift" size={34} strokeWidth={1.6} />
        </div>
      )}
    </div>
  )
}
