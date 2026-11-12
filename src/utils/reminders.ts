import { relationName } from '../data/audience'
import type { GiftPerson } from '../types'
import { daysUntil, formatDate, formatMoney } from './helpers'

/** Cuándo avisar. Lo elige el comprador al guardar a la persona. */
export const REMIND_OPTIONS: { value: number[]; label: string }[] = [
  { value: [7, 3], label: '1 semana y 3 días antes' },
  { value: [7], label: 'Solo 1 semana antes' },
  { value: [3], label: 'Solo 3 días antes' },
]

export const remindLabel = (d: number) => (d === 7 ? '1 semana antes' : `${d} días antes`)

/** Fecha (YYYY-MM-DD) en la que cae un aviso. */
export function reminderDate(iso: string, daysBefore: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d - daysBefore)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Avisos que ya llegaron a su día y no se enviaron. */
export function dueReminders(p: GiftPerson): number[] {
  const left = daysUntil(p.date)
  if (left < 0) return []
  return p.remindDays.filter((d) => left <= d && !p.sent.includes(d))
}

export const suggestionPath = (personId: string) => `/calendario/${personId}/sugerencia`

/** Texto del aviso. `daysLeft` permite simularlo en la demo. */
export function reminderMessage(p: GiftPerson, holidayName: string, daysLeft = daysUntil(p.date)) {
  const when = daysLeft <= 0 ? 'hoy' : daysLeft === 1 ? 'mañana' : `en ${daysLeft === 7 ? '1 semana' : `${daysLeft} días`}`
  const occasion = holidayName.toLowerCase() === 'cumpleaños' ? 'el cumpleaños' : holidayName
  const title = `${when.charAt(0).toUpperCase()}${when.slice(1)} es ${occasion} de ${personLabel(p)}`
  const text = `Te elegimos ${p.count} regalos de hasta ${formatMoney(p.budget)} que le pueden gustar. Elige uno en un toque.`
  return { title, text }
}

/** Mensaje de WhatsApp con el enlace directo a las sugerencias. */
export function whatsappText(p: GiftPerson, holidayName: string, url: string, daysLeft?: number) {
  const { title, text } = reminderMessage(p, holidayName, daysLeft)
  return `*Regalalo* · ${title} (${formatDate(p.date)}).\n${text}\n\n${url}`
}

/** wa.me abre WhatsApp (app o web) con el mensaje escrito. Con número, abre ese chat. */
export function whatsappLink(text: string, phone?: string) {
  const digits = (phone ?? '').replace(/\D/g, '')
  const number = digits.length === 8 ? `591${digits}` : digits // celular boliviano de 8 dígitos
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

/** "tu papá" si no le pusieron nombre; si no, el nombre ("Pedrito"). */
export const personLabel = (p: GiftPerson) =>
  p.name === relationName(p.relation) ? `tu ${p.name.toLowerCase()}` : p.name
