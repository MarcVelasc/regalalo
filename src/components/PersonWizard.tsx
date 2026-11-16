import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CURRENCY } from '../config'
import { INTERESTS, RELATIONS } from '../data/audience'
import { useStore } from '../store/useStore'
import type { Gender } from '../types'
import { isoDate } from '../utils/helpers'
import { REMIND_OPTIONS } from '../utils/reminders'
import { Icon } from './Icon'

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

const BUDGETS = [50, 100, 150, 200, 300]
const AGE_PRESETS = [
  { label: 'Niño o niña', hint: '0 a 12', age: 8 },
  { label: 'Joven', hint: '13 a 25', age: 18 },
  { label: 'Adulto', hint: '26 a 59', age: 40 },
  { label: 'Mayor', hint: '60 o más', age: 65 },
]
const MAX_INTERESTS = 2
const STEPS = ['Quién es', 'Edad', 'Gustos', 'Fecha', 'Presupuesto', 'Aviso']

/**
 * El inicio del comprador: una pregunta por pantalla, con toques grandes.
 * Al terminar no se ve un catálogo: se ven directamente los pocos regalos elegidos para esa persona.
 */
export function PersonWizard() {
  const navigate = useNavigate()
  const holidays = useStore((s) => s.holidays)
  const addPerson = useStore((s) => s.addPerson)
  const pushToast = useStore((s) => s.pushToast)
  const savedWhatsapp = useStore((s) => s.buyerWhatsapp)
  const setBuyerWhatsapp = useStore((s) => s.setBuyerWhatsapp)

  const [step, setStep] = useState(0)
  const [relation, setRelation] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [age, setAge] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [holidayId, setHolidayId] = useState('')
  const [date, setDate] = useState('')
  const [budget, setBudget] = useState('')
  const [count, setCount] = useState(3)
  const [remind, setRemind] = useState(0)
  const [whatsapp, setWhatsapp] = useState(savedWhatsapp)
  const [error, setError] = useState('')
  const boxRef = useRef<HTMLElement>(null)

  // En el celular, al pasar de pregunta la tarjeta vuelve a quedar a la vista
  useEffect(() => {
    const el = boxRef.current
    if (el && step > 0 && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  const rel = RELATIONS.find((r) => r.id === relation)
  const who = name.trim() || (rel ? rel.name.toLowerCase() : 'esa persona')
  const needsGender = !!relation && !rel?.gender

  const pickRelation = (id: string) => {
    setRelation(id)
    const r = RELATIONS.find((x) => x.id === id)
    setGender(r?.gender ?? '')
    setError('')
  }
  const pickHoliday = (id: string) => {
    setHolidayId(id)
    if (FIXED_DATES[id]) setDate(nextDate(FIXED_DATES[id]))
    setError('')
  }
  const toggleInterest = (id: string) => {
    setError('')
    if (interests.includes(id)) return setInterests(interests.filter((x) => x !== id))
    if (interests.length >= MAX_INTERESTS) return pushToast(`Elige hasta ${MAX_INTERESTS} gustos`, 'info')
    setInterests([...interests, id])
  }

  /** Revisa solo la pregunta de esta pantalla */
  const check = (): string => {
    const years = Number(age)
    const amount = parseFloat(budget.replace(',', '.'))
    switch (step) {
      case 0: return relation ? '' : 'Elige para quién es'
      case 1:
        if (age === '' || !Number.isInteger(years) || years < 0 || years > 110) return 'Elige o escribe su edad'
        return gender ? '' : 'Elige si es hombre o mujer'
      case 2: return interests.length ? '' : 'Elige al menos un gusto'
      case 3:
        if (!holidayId) return 'Elige la ocasión'
        return date && date >= isoDate(0) ? '' : 'Elige una fecha desde hoy'
      case 4: return Number.isFinite(amount) && amount > 0 ? '' : 'Elige cuánto quieres gastar'
      case 5: return !whatsapp || whatsapp.replace(/\D/g, '').length >= 8 ? '' : 'Revisa el número (8 dígitos)'
      default: return ''
    }
  }

  const next = () => {
    const err = check()
    setError(err)
    if (err) return
    if (step < STEPS.length - 1) return setStep(step + 1)
    finish()
  }
  const back = () => {
    setError('')
    setStep(Math.max(0, step - 1))
  }

  const finish = () => {
    const label = name.trim() || rel!.name
    if (whatsapp !== savedWhatsapp) setBuyerWhatsapp(whatsapp)
    const id = addPerson({
      name: label,
      relation,
      gender: gender as Gender,
      age: Number(age),
      interests,
      holidayId,
      date,
      budget: parseFloat(budget.replace(',', '.')),
      count,
      remindDays: REMIND_OPTIONS[remind].value,
    })
    pushToast(`Listo. Te avisaremos ${REMIND_OPTIONS[remind].label.toLowerCase()}`)
    navigate(`/calendario/${id}/sugerencia`)
  }

  const budgetIsPreset = BUDGETS.map(String).includes(budget)

  return (
    <section className="wiz" aria-labelledby="wiz-q" ref={boxRef}>
      <div className="wiz-progress" aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <span key={s} className={i < step ? 'done' : i === step ? 'now' : ''}>
            <i />
            <em>{s}</em>
          </span>
        ))}
      </div>

      <div className="wiz-body" key={step}>
        {step === 0 && (
          <>
            <h2 id="wiz-q">¿Para quién es el regalo?</h2>
            <p className="wiz-sub">Toca una opción. Con eso empezamos.</p>
            <div className="wiz-tiles" role="group" aria-label="Para quién">
              {RELATIONS.map((r) => (
                <button key={r.id} type="button" className="wiz-tile" aria-pressed={relation === r.id} onClick={() => pickRelation(r.id)}>
                  {r.name}
                </button>
              ))}
            </div>
            {relation && (
              <label className="field wiz-name">
                <span>
                  ¿Cómo se llama? <em>(opcional)</em>
                </span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Ej. ${relation === 'papa' ? 'Don Jorge' : 'Pedrito'}`} />
              </label>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h2 id="wiz-q">¿Cuántos años tiene {who}?</h2>
            <p className="wiz-sub">Así no te sugerimos un juguete para un adulto ni al revés.</p>
            <div className="wiz-tiles cols-4" role="group" aria-label="Edad aproximada">
              {AGE_PRESETS.map((a) => (
                <button key={a.label} type="button" className="wiz-tile" aria-pressed={age === String(a.age)} onClick={() => { setAge(String(a.age)); setError('') }}>
                  {a.label}
                  <small>{a.hint} años</small>
                </button>
              ))}
            </div>
            <label className="field wiz-inline">
              <span>O escribe su edad exacta</span>
              <input inputMode="numeric" value={age} onChange={(e) => { setAge(e.target.value.replace(/\D/g, '').slice(0, 3)); setError('') }} placeholder="Ej. 55" />
            </label>
            {needsGender && (
              <div className="wiz-gender">
                <span>Es</span>
                <div className="seg" role="group" aria-label="Sexo">
                  {(['hombre', 'mujer'] as const).map((g) => (
                    <button key={g} type="button" aria-pressed={gender === g} onClick={() => { setGender(g); setError('') }}>
                      {g === 'hombre' ? 'Hombre' : 'Mujer'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h2 id="wiz-q">¿Qué le gusta a {who}?</h2>
            <p className="wiz-sub">Elige 1 o 2. Con esto elegimos los regalos.</p>
            <div className="wiz-tiles" role="group" aria-label="Gustos">
              {INTERESTS.map((i) => (
                <button key={i.id} type="button" className="wiz-tile with-icon" aria-pressed={interests.includes(i.id)} onClick={() => toggleInterest(i.id)}>
                  <Icon name={i.icon} size={22} />
                  {i.name}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 id="wiz-q">¿Para cuándo?</h2>
            <p className="wiz-sub">Elige la ocasión. Si tiene fecha fija, la ponemos por ti.</p>
            <div className="wiz-tiles" role="group" aria-label="Ocasión">
              {holidays.map((h) => (
                <button key={h.id} type="button" className="wiz-tile with-icon" aria-pressed={holidayId === h.id} onClick={() => pickHoliday(h.id)}>
                  <Icon name={h.icon} size={22} />
                  {h.name}
                </button>
              ))}
            </div>
            {holidayId && (
              <label className="field wiz-inline">
                <span>Fecha</span>
                <input type="date" min={isoDate(0)} value={date} onChange={(e) => { setDate(e.target.value); setError('') }} />
              </label>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <h2 id="wiz-q">¿Cuánto quieres gastar?</h2>
            <p className="wiz-sub">Solo te mostramos regalos hasta ese monto.</p>
            <div className="wiz-tiles cols-5" role="group" aria-label="Presupuesto">
              {BUDGETS.map((b) => (
                <button key={b} type="button" className="wiz-tile money" aria-pressed={budget === String(b)} onClick={() => { setBudget(String(b)); setError('') }}>
                  <small>hasta</small>
                  {CURRENCY} {b}
                </button>
              ))}
            </div>
            <label className="field wiz-inline">
              <span>O escribe otro monto ({CURRENCY})</span>
              <input inputMode="decimal" value={budgetIsPreset ? '' : budget} onChange={(e) => { setBudget(e.target.value); setError('') }} placeholder="Ej. 120" />
            </label>
          </>
        )}

        {step === 5 && (
          <>
            <h2 id="wiz-q">¿Cuándo te avisamos?</h2>
            <p className="wiz-sub">Te llega un mensaje con los regalos elegidos y el enlace directo.</p>
            <div className="wiz-tiles cols-3" role="group" aria-label="Cuándo avisar">
              {REMIND_OPTIONS.map((o, i) => (
                <button key={o.label} type="button" className="wiz-tile with-icon" aria-pressed={remind === i} onClick={() => setRemind(i)}>
                  <Icon name="bellRing" size={22} />
                  {o.label}
                </button>
              ))}
            </div>
            <div className="wiz-row">
              <label className="field">
                <span>
                  Tu WhatsApp <em>(opcional)</em>
                </span>
                <input inputMode="tel" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value); setError('') }} placeholder="Ej. 71234567" />
              </label>
              <div className="field">
                <span>¿Cuántas opciones quieres ver?</span>
                <div className="seg" role="group" aria-label="Cantidad de sugerencias">
                  {[3, 5, 10].map((n) => (
                    <button key={n} type="button" aria-pressed={count === n} onClick={() => setCount(n)}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="wiz-err" role="alert">
            <Icon name="info" size={16} /> {error}
          </p>
        )}
      </div>

      <div className="wiz-nav">
        {step > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={back}>
            <Icon name="arrowLeft" size={16} /> Atrás
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="btn btn-primary" onClick={next}>
          {step === STEPS.length - 1 ? (
            <>
              <Icon name="gift" size={18} /> Ver sus regalos
            </>
          ) : (
            <>
              Siguiente <Icon name="arrow" size={16} />
            </>
          )}
        </button>
      </div>
    </section>
  )
}
