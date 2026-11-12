import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/Common'
import { Icon } from '../components/Icon'
import { interestName, relationName } from '../data/audience'
import { useStore } from '../store/useStore'
import type { GiftPerson } from '../types'
import { daysUntil, formatDate, formatMoney } from '../utils/helpers'
import { reminderDate, remindLabel, suggestionPath, whatsappLink } from '../utils/reminders'

const when = (days: number) => {
  if (days < 0) return 'Ya pasó'
  if (days === 0) return 'Es hoy'
  if (days === 1) return 'Falta 1 día'
  return `Faltan ${days} días`
}

/** Vista previa del mensaje que llega por WhatsApp, con el enlace directo a las sugerencias. */
function WhatsappPreview({ person, text }: { person: GiftPerson; text: string }) {
  const navigate = useNavigate()
  const phone = useStore((s) => s.buyerWhatsapp)
  const [body, link] = [text.slice(0, text.lastIndexOf('\n\n')), text.slice(text.lastIndexOf('\n\n') + 2)]
  return (
    <div className="wa-preview" aria-label="Aviso por WhatsApp">
      <div className="wa-head">
        <Icon name="message" size={16} /> Así te llega el aviso por WhatsApp
      </div>
      <div className="wa-bubble">
        {body.split('\n').map((line, i) => (
          <p key={i}>{line.replace(/\*/g, '')}</p>
        ))}
        <button className="wa-link" onClick={() => navigate(suggestionPath(person.id))}>
          {link}
        </button>
      </div>
      <div className="wa-actions">
        <button className="btn btn-sm btn-primary" onClick={() => navigate(suggestionPath(person.id))}>
          Abrir el enlace del aviso
        </button>
        <a className="btn btn-sm btn-outline" href={whatsappLink(text, phone)} target="_blank" rel="noreferrer">
          <Icon name="message" size={15} /> Enviarlo a mi WhatsApp
        </a>
      </div>
    </div>
  )
}

/** Pantalla 1 · Mis personas y sus fechas */
export function Calendar() {
  const people = useStore((s) => s.people)
  const holidays = useStore((s) => s.holidays)
  const preview = useStore((s) => s.whatsappPreview)
  const simulateReminder = useStore((s) => s.simulateReminder)
  const removePerson = useStore((s) => s.removePerson)
  const pushToast = useStore((s) => s.pushToast)
  const sorted = useMemo(() => [...people].sort((a, b) => a.date.localeCompare(b.date)), [people])

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="Aún no registraste a nadie"
        text="Registra a quien quieres regalar: quién es, qué le gusta, la fecha y tu presupuesto. Te avisamos 1 semana y 3 días antes con pocos regalos elegidos."
        actionLabel="¿Para quién es el regalo?"
        actionTo="/calendario/nueva"
      />
    )
  }

  return (
    <>
      <div className="page-head cal-head">
        <div>
          <h1>Mis personas</h1>
          <p>Antes de cada fecha te avisamos con pocos regalos elegidos para esa persona. Eliges uno y listo.</p>
        </div>
        <Link to="/calendario/nueva" className="btn btn-primary">
          <Icon name="plus" size={18} /> Agregar persona
        </Link>
      </div>

      <ul className="cal-list">
        {sorted.map((p) => {
          const left = daysUntil(p.date)
          const holiday = holidays.find((h) => h.id === p.holidayId)
          const pending = p.remindDays.find((d) => !p.sent.includes(d))
          return (
            <li key={p.id} className="cal-card">
              <span className="cal-icon">
                <Icon name={holiday?.icon ?? 'gift'} size={22} />
              </span>
              <div className="cal-main">
                <strong>
                  {p.name}
                  {p.name !== relationName(p.relation) && <span className="cal-rel"> · {relationName(p.relation)}</span>}
                </strong>
                <span className="muted">
                  {holiday?.name} · {formatDate(p.date)} · {when(left)}
                </span>
                <span className="muted">
                  {p.age} años · le gusta {p.interests.map((i) => interestName(i).toLowerCase()).join(', ')} · hasta{' '}
                  {formatMoney(p.budget)}
                </span>
              </div>

              <ul className="cal-reminders" aria-label="Avisos programados">
                {p.remindDays.map((d) => {
                  const done = p.sent.includes(d)
                  return (
                    <li key={d} data-done={done}>
                      <Icon name={done ? 'check' : 'bell'} size={14} /> {remindLabel(d)} · {formatDate(reminderDate(p.date, d))}
                      <em>{done ? 'Enviado' : 'Programado'}</em>
                    </li>
                  )
                })}
              </ul>

              <div className="cal-actions">
                {p.sent.length > 0 && left >= 0 && (
                  <Link to={suggestionPath(p.id)} className="btn btn-sm btn-primary">
                    Ver sus {p.count} regalos
                  </Link>
                )}
                {pending !== undefined && (
                  <button className="cal-test" onClick={() => simulateReminder(p.id)}>
                    Prueba: simular aviso de {remindLabel(pending)}
                  </button>
                )}
                <button
                  className="cal-remove"
                  aria-label={`Quitar a ${p.name}`}
                  onClick={() => {
                    removePerson(p.id)
                    pushToast(`Quitamos a ${p.name}`, 'info')
                  }}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>

              {preview?.personId === p.id && <WhatsappPreview person={p} text={preview.text} />}
            </li>
          )
        })}
      </ul>

      <p className="cal-note">
        <Icon name="info" size={15} />
        <span>
          Los avisos se revisan solos cada vez que abres Regalalo y salen en la campana. Con <strong>Enviarlo a mi WhatsApp</strong> el
          mensaje con el enlace llega a tu chat. El envío automático por WhatsApp necesita un servidor y queda para la siguiente versión.
        </span>
      </p>
    </>
  )
}
