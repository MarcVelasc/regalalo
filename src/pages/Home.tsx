import { useMemo, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import regaloUrl from '../assets/brand/regalo.svg'
import { Icon } from '../components/Icon'
import { PersonWizard } from '../components/PersonWizard'
import { COMMISSION_RATE } from '../config'
import { relationName } from '../data/audience'
import { firstName, useAuth } from '../store/auth'
import { useStore } from '../store/useStore'
import { daysUntil, formatDate } from '../utils/helpers'

/** Estrellitas alrededor del regalo de la marca */
const SPARKS: CSSProperties[] = [
  { top: '8%', left: '12%', width: 22, color: '#FFD54A', animationDelay: '0s' },
  { top: '18%', right: '6%', width: 16, color: '#FFFFFF', animationDelay: '-1.2s' },
  { bottom: '14%', left: '4%', width: 18, color: '#FF8A7A', animationDelay: '-0.6s' },
  { bottom: '6%', right: '14%', width: 26, color: '#FFD54A', animationDelay: '-2s' },
]

/**
 * Inicio del comprador: no es un catálogo para hacer scroll.
 * Lo primero que se ve es la pregunta "¿Para quién es el regalo?" y se responde paso a paso.
 */
export function Home() {
  const navigate = useNavigate()
  const people = useStore((s) => s.people)
  const holidays = useStore((s) => s.holidays)
  const setRole = useStore((s) => s.setRole)
  const user = useAuth((s) => s.user)

  const upcoming = useMemo(() => [...people].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4), [people])

  const startSelling = () => {
    setRole('seller')
    navigate('/panel/regalos/nuevo')
  }

  return (
    <div className="home-wiz">
      <header className="home-wiz-head">
        <div className="home-wiz-art" aria-hidden="true">
          <img src={regaloUrl} alt="" />
          {SPARKS.map((sp, i) => (
            <svg key={i} className="spark" viewBox="0 0 24 24" style={sp}>
              <path d="M12 0c.9 6.6 4.5 10.6 12 12-7.5 1.4-11.1 5.4-12 12-.9-6.6-4.5-10.6-12-12C7.5 10.6 11.1 6.6 12 0Z" />
            </svg>
          ))}
        </div>
        <div>
          {user && <span className="home-hi">Hola, {firstName(user.name)}</span>}
          <h1>Regala sin buscar</h1>
          <p>Cuéntanos de esa persona en 6 toques. Te mostramos pocos regalos pensados para ella y te avisamos antes de la fecha.</p>
        </div>
      </header>

      {upcoming.length > 0 && (
        <section className="home-people" aria-label="Tus personas">
          <div className="home-people-head">
            <h2>Tus personas</h2>
            <Link to="/calendario" className="link-more">
              Ver todas <Icon name="arrow" size={14} />
            </Link>
          </div>
          <div className="home-people-row">
            {upcoming.map((p) => {
              const h = holidays.find((x) => x.id === p.holidayId)
              const left = daysUntil(p.date)
              return (
                <Link key={p.id} to={`/calendario/${p.id}/sugerencia`} className="home-person">
                  <span className="hp-ico">
                    <Icon name={h?.icon ?? 'gift'} size={20} />
                  </span>
                  <span>
                    <strong>{p.name || relationName(p.relation)}</strong>
                    <small>
                      {h?.name ?? 'Fecha especial'} · {formatDate(p.date)}
                    </small>
                  </span>
                  <b className={left <= 7 ? 'soon' : ''}>{left === 0 ? 'Hoy' : left === 1 ? 'Mañana' : `${left} días`}</b>
                </Link>
              )
            })}
          </div>
          <p className="home-people-new">Agrega a otra persona abajo.</p>
        </section>
      )}

      <PersonWizard />

      <ul className="home-trust">
        <li>
          <Icon name="shield" size={18} /> Tu pago queda retenido hasta que recibes el regalo
        </li>
        <li>
          <Icon name="star" size={18} filled /> Solo vendedores verificados y calificados
        </li>
        <li>
          <Icon name="bellRing" size={18} /> Aviso 1 semana y 3 días antes, por WhatsApp
        </li>
      </ul>

      <footer className="home-alt">
        <p>
          ¿Ya sabes qué buscas? <Link to="/catalogo">Explorar todos los regalos</Link>
        </p>
        <p>
          ¿Haces regalos? <button type="button" className="link-btn" onClick={startSelling}>Vende en Regalalo</button> · solo{' '}
          {Math.round(COMMISSION_RATE * 100)}% de comisión cuando vendes
        </p>
      </footer>
    </div>
  )
}
