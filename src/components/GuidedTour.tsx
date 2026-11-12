import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { COMMISSION_RATE } from '../config'
import { useStore } from '../store/useStore'
import { useTour } from '../store/tour'
import { Icon, type IconName } from './Icon'

interface Step {
  icon: IconName
  title: string
  text: string
  role: 'buyer' | 'seller'
  to: string
}

const pct = Math.round(COMMISSION_RATE * 100)

const STEPS: Step[] = [
  {
    icon: 'gift',
    title: 'Bienvenido a Regalalo',
    text: 'Un marketplace de regalos para festividades y cumpleaños, hecho de emprendedores. Este recorrido dura un minuto y pasa por las dos vistas: comprador y vendedor.',
    role: 'buyer',
    to: '/',
  },
  {
    icon: 'users',
    title: '¿Para quién es el regalo?',
    text: 'El comprador registra a la persona: quién es, su edad, qué le gusta, la fecha y su presupuesto. No tiene que buscar ni hacer scroll en un catálogo.',
    role: 'buyer',
    to: '/calendario/nueva',
  },
  {
    icon: 'bellRing',
    title: 'Aviso 1 semana y 3 días antes',
    text: 'Antes de la fecha le llega un aviso, también por WhatsApp, con el enlace a 3 regalos elegidos para esa persona. Elige uno y va directo al pago.',
    role: 'buyer',
    to: '/calendario',
  },
  {
    icon: 'users',
    title: 'Regalos pensados para cada persona',
    text: 'Cada vendedor indica para quién es su regalo: sexo, edad y gustos. Así a un papá no le sugerimos un ramo de rosas.',
    role: 'seller',
    to: '/panel/regalos/nuevo',
  },
  {
    icon: 'star',
    title: 'La reputación se ve antes de comprar',
    text: 'Cada ficha muestra la calificación del vendedor y sus reseñas reales de otros compradores. Esa confianza es lo que permite comprar a un emprendedor desconocido.',
    role: 'buyer',
    to: '/regalo/p1',
  },
  {
    icon: 'lock',
    title: 'Pago retenido hasta que recibes',
    text: 'El dinero queda en custodia de Regalalo. Solo cuando el comprador confirma la recepción se libera al vendedor, y recién ahí puede calificarlo. Mira los pedidos de ejemplo.',
    role: 'buyer',
    to: '/pedidos',
  },
  {
    icon: 'store',
    title: 'El vendedor ve su negocio',
    text: 'El panel resume ventas, saldo retenido y saldo liberado, y su calificación actual. Puede publicar, pausar y editar regalos con fotos, stock y tipo de entrega.',
    role: 'seller',
    to: '/panel',
  },
  {
    icon: 'package',
    title: 'Pedidos conectados entre vistas',
    text: 'Cuando el vendedor acepta, prepara o marca un pedido, el comprador recibe un aviso en su campana. Y al confirmar la recepción, el vendedor recibe el aviso de pago liberado.',
    role: 'seller',
    to: '/panel/pedidos',
  },
  {
    icon: 'wallet',
    title: 'Cómo gana Regalalo',
    text: `Comisión del ${pct}% sobre el precio del regalo, cobrada solo cuando se vende (el envío va íntegro al vendedor). Aquí puedes mover los supuestos y ver qué pasaría con otros números.`,
    role: 'buyer',
    to: '/negocio',
  },
]

export function GuidedTour() {
  const navigate = useNavigate()
  const setRole = useStore((s) => s.setRole)
  const { active, step, stop, go } = useTour()
  const current = STEPS[step]
  // useNavigate cambia de identidad con cada ruta; la guardamos para no re-navegar en bucle.
  const navRef = useRef(navigate)
  navRef.current = navigate

  // Cada paso lleva a su pantalla y a su vista (comprador / vendedor).
  useEffect(() => {
    if (!active) return
    const target = STEPS[step]
    setRole(target.role)
    navRef.current(target.to)
  }, [active, step, setRole])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop()
      if (e.key === 'ArrowRight' && step < STEPS.length - 1) go(step + 1)
      if (e.key === 'ArrowLeft' && step > 0) go(step - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, step, go, stop])

  if (!active || !current) return null
  const last = step === STEPS.length - 1

  return (
    <aside className="tour" role="dialog" aria-label="Tour guiado" aria-live="polite">
      <div className="tour-top">
        <span className="tour-icon">
          <Icon name={current.icon} size={20} />
        </span>
        <span className="tour-count">
          Paso {step + 1} de {STEPS.length}
        </span>
        <button className="tour-close" onClick={stop} aria-label="Cerrar tour">
          <Icon name="close" size={18} />
        </button>
      </div>

      <div key={step} className="tour-body">
        <h3>{current.title}</h3>
        <p>{current.text}</p>
      </div>

      <div className="tour-dots" aria-hidden="true">
        {STEPS.map((_, i) => (
          <i key={i} className={i === step ? 'on' : i < step ? 'done' : ''} />
        ))}
      </div>

      <div className="tour-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => go(step - 1)} disabled={step === 0}>
          Anterior
        </button>
        {last ? (
          <button className="btn btn-primary btn-sm" onClick={stop}>
            Terminar
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => go(step + 1)}>
            Siguiente <Icon name="arrow" size={15} />
          </button>
        )}
      </div>
    </aside>
  )
}
