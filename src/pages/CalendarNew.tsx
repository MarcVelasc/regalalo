import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { CURRENCY } from '../config'
import { INTERESTS, RELATIONS } from '../data/audience'
import { useStore } from '../store/useStore'
import type { Gender } from '../types'
import { isoDate } from '../utils/helpers'
import { REMIND_OPTIONS } from '../utils/reminders'

/** Festividades con fecha fija: al elegirlas, la fecha se completa sola. */
const FIXED_DATES: Record<string, string> = {
  navidad: '12-25',
  'anio-nuevo': '12-31',
  'san-valentin': '02-14',
  'dia-del-padre': '03-19',
  'dia-de-la-madre': '05-27',
  primavera: '09-21',
}

const nextDate = (monthDay: string) => {
  const year = new Date().getFullYear()
  const iso = `${year}-${monthDay}`
  return iso >= isoDate(0) ? iso : `${year + 1}-${monthDay}`
}

const MAX_INTERESTS = 2

/** Pantalla 2 · Registrar a la persona: quién es, qué le gusta, cuándo y cuánto */
export function CalendarNew() {
  const navigate = useNavigate()
  const holidays = useStore((s) => s.holidays)
  const addPerson = useStore((s) => s.addPerson)
  const pushToast = useStore((s) => s.pushToast)
  const savedWhatsapp = useStore((s) => s.buyerWhatsapp)
  const setBuyerWhatsapp = useStore((s) => s.setBuyerWhatsapp)

  const [relation, setRelation] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [age, setAge] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [holidayId, setHolidayId] = useState('cumpleanios')
  const [date, setDate] = useState('')
  const [budget, setBudget] = useState('')
  const [count, setCount] = useState(3)
  const [remind, setRemind] = useState(0)
  const [whatsapp, setWhatsapp] = useState(savedWhatsapp)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const pickRelation = (id: string) => {
    setRelation(id)
    const r = RELATIONS.find((x) => x.id === id)
    if (r?.gender) setGender(r.gender)
  }

  const pickHoliday = (id: string) => {
    setHolidayId(id)
    if (FIXED_DATES[id]) setDate(nextDate(FIXED_DATES[id]))
  }

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) return setInterests(interests.filter((x) => x !== id))
    if (interests.length >= MAX_INTERESTS) return pushToast(`Elige hasta ${MAX_INTERESTS} gustos`, 'info')
    setInterests([...interests, id])
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(budget.replace(',', '.'))
    const years = Number(age)
    const err: Record<string, string> = {}
    if (!relation) err.relation = 'Elige quién es'
    if (!gender) err.gender = 'Elige hombre o mujer'
    if (!Number.isInteger(years) || years < 0 || years > 110) err.age = 'Escribe su edad en años'
    if (interests.length === 0) err.interests = 'Elige al menos un gusto'
    if (!date || date < isoDate(0)) err.date = 'Elige una fecha desde hoy'
    if (!Number.isFinite(amount) || amount <= 0) err.budget = 'Escribe cuánto quieres gastar'
    if (whatsapp && whatsapp.replace(/\D/g, '').length < 8) err.whatsapp = 'Revisa el número (8 dígitos)'
    setErrors(err)
    if (Object.keys(err).length) {
      pushToast('Revisa los campos marcados', 'error')
      return
    }
    const label = name.trim() || RELATIONS.find((r) => r.id === relation)!.name
    if (whatsapp !== savedWhatsapp) setBuyerWhatsapp(whatsapp)
    addPerson({
      name: label,
      relation,
      gender: gender as Gender,
      age: years,
      interests,
      holidayId,
      date,
      budget: amount,
      count,
      remindDays: REMIND_OPTIONS[remind].value,
    })
    pushToast(`Guardamos a ${label}. Te avisaremos ${REMIND_OPTIONS[remind].label.toLowerCase()}`)
    navigate('/calendario')
  }

  return (
    <div className="cal-form-wrap">
      <Link to="/calendario" className="link-btn cal-back">
        <Icon name="arrowLeft" size={15} /> Volver a mis personas
      </Link>
      <div className="page-head">
        <h1>¿Para quién es el regalo?</h1>
        <p>Cuéntanos un poco de esa persona. Antes de la fecha te avisamos con pocos regalos elegidos para ella.</p>
      </div>

      <form className="panel cal-form" onSubmit={submit} noValidate>
        {/* ── Quién es */}
        <fieldset className={`pfield ${errors.relation ? 'has-error' : ''}`}>
          <legend>¿Quién es?</legend>
          <div className="chips" role="group" aria-label="Relación">
            {RELATIONS.map((r) => (
              <button key={r.id} type="button" className="chip chip-sm" aria-pressed={relation === r.id} onClick={() => pickRelation(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
          {errors.relation && <small className="err">{errors.relation}</small>}
        </fieldset>

        <div className="pfield-row">
          <label className="field">
            <span>
              Su nombre <em>(opcional)</em>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={RELATIONS.find((r) => r.id === relation)?.name ?? 'Ej. Pedrito'}
            />
          </label>
          <label className={`field ${errors.age ? 'has-error' : ''}`}>
            <span>Edad</span>
            <input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} placeholder="Ej. 55" />
            {errors.age && <small className="err">{errors.age}</small>}
          </label>
        </div>

        <fieldset className={`pfield ${errors.gender ? 'has-error' : ''}`}>
          <legend>Es</legend>
          <div className="seg" role="group" aria-label="Sexo">
            {(
              [
                ['hombre', 'Hombre'],
                ['mujer', 'Mujer'],
              ] as const
            ).map(([v, l]) => (
              <button key={v} type="button" aria-pressed={gender === v} onClick={() => setGender(v)}>
                {l}
              </button>
            ))}
          </div>
          {errors.gender && <small className="err">{errors.gender}</small>}
        </fieldset>

        {/* ── Gustos */}
        <fieldset className={`pfield ${errors.interests ? 'has-error' : ''}`}>
          <legend>
            ¿Qué le gusta? <em>(1 o 2)</em>
          </legend>
          <div className="chips" role="group" aria-label="Gustos">
            {INTERESTS.map((i) => (
              <button
                key={i.id}
                type="button"
                className="chip chip-sm"
                aria-pressed={interests.includes(i.id)}
                onClick={() => toggleInterest(i.id)}
              >
                <Icon name={i.icon} size={15} /> {i.name}
              </button>
            ))}
          </div>
          {errors.interests && <small className="err">{errors.interests}</small>}
        </fieldset>

        {/* ── Cuándo y cuánto */}
        <fieldset className="pfield">
          <legend>¿Qué ocasión es?</legend>
          <div className="chips" role="group" aria-label="Ocasión">
            {holidays.map((h) => (
              <button key={h.id} type="button" className="chip chip-sm" aria-pressed={holidayId === h.id} onClick={() => pickHoliday(h.id)}>
                <Icon name={h.icon} size={15} /> {h.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="pfield-row">
          <label className={`field ${errors.date ? 'has-error' : ''}`}>
            <span>Fecha</span>
            <input type="date" min={isoDate(0)} value={date} onChange={(e) => setDate(e.target.value)} />
            {errors.date && <small className="err">{errors.date}</small>}
          </label>
          <label className={`field ${errors.budget ? 'has-error' : ''}`}>
            <span>
              Presupuesto <em>({CURRENCY})</em>
            </span>
            <input inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ej. 200" />
            {errors.budget && <small className="err">{errors.budget}</small>}
          </label>
        </div>

        {/* ── Avisos */}
        <fieldset className="pfield">
          <legend>¿Cuándo te avisamos?</legend>
          <div className="seg" role="group" aria-label="Cuándo avisar">
            {REMIND_OPTIONS.map((o, i) => (
              <button key={o.label} type="button" aria-pressed={remind === i} onClick={() => setRemind(i)}>
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pfield">
          <legend>¿Cuántas opciones quieres ver?</legend>
          <div className="seg" role="group" aria-label="Cantidad de sugerencias">
            {[3, 5, 10].map((n) => (
              <button key={n} type="button" aria-pressed={count === n} onClick={() => setCount(n)}>
                {n} regalos
              </button>
            ))}
          </div>
        </fieldset>

        <label className={`field ${errors.whatsapp ? 'has-error' : ''}`}>
          <span>
            Tu WhatsApp para el aviso <em>(opcional)</em>
          </span>
          <input inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ej. 71234567" />
          {errors.whatsapp && <small className="err">{errors.whatsapp}</small>}
        </label>

        <button type="submit" className="btn btn-primary">
          <Icon name="bellRing" size={18} /> Guardar y programar aviso
        </button>
      </form>
    </div>
  )
}
