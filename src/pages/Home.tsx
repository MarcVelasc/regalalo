import regaloLogo from '../assets/brand/regalo.svg'
import { useMemo, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ProductCard } from '../components/ProductCard'
import { SellerCard } from '../components/SellerCard'
import { COMMISSION_RATE } from '../config'
import { useAllSellerStats } from '../store/hooks'
import { useStore } from '../store/useStore'

/** Posición, tamaño, color y ritmo de cada estrellita del hero */
const SPARKS: CSSProperties[] = [
  { top: '24%', left: '27%', width: 30, color: '#FFD54A', animationDelay: '0s' },
  { top: '16%', right: '30%', width: 20, color: '#FFFFFF', animationDelay: '-1.2s' },
  { bottom: '22%', left: '18%', width: 24, color: '#FF8A7A', animationDelay: '-0.6s' },
  { bottom: '30%', right: '24%', width: 34, color: '#FFD54A', animationDelay: '-2s' },
  { top: '48%', left: '6%', width: 16, color: '#8EE3C8', animationDelay: '-1.6s' },
  { top: '42%', right: '4%', width: 18, color: '#FFFFFF', animationDelay: '-0.3s' },
]
const CONFETTI: CSSProperties[] = [
  { top: '12%', left: '44%', background: '#FF8A7A', rotate: '20deg' },
  { top: '70%', left: '30%', background: '#FFD54A', rotate: '-30deg' },
  { top: '60%', right: '10%', background: '#8EE3C8', rotate: '45deg' },
  { top: '30%', left: '14%', background: '#B99CFF', rotate: '-12deg' },
  { bottom: '10%', left: '50%', background: '#FFFFFF', rotate: '60deg' },
  { top: '6%', right: '18%', background: '#FFD54A', rotate: '-50deg' },
]

export function Home() {
  const navigate = useNavigate()
  const holidays = useStore((s) => s.holidays)
  const people = useStore((s) => s.people)
  const products = useStore((s) => s.products)
  const sellers = useStore((s) => s.sellers)
  const setRole = useStore((s) => s.setRole)
  const stats = useAllSellerStats()

  const [holidayId, setHolidayId] = useState('navidad')

  const holiday = holidays.find((h) => h.id === holidayId) ?? holidays[0]
  const active = useMemo(() => products.filter((p) => p.active), [products])

  const forHoliday = useMemo(
    () =>
      active
        .filter((p) => p.holidays.includes(holiday.id))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5),
    [active, holiday.id],
  )

  const topSellers = useMemo(
    () =>
      [...sellers]
        .filter((s) => stats[s.id].count > 0)
        .sort((a, b) => stats[b.id].avg - stats[a.id].avg || stats[b.id].count - stats[a.id].count)
        .slice(0, 3),
    [sellers, stats],
  )

  const startSelling = () => {
    setRole('seller')
    navigate('/panel/regalos/nuevo')
  }

  return (
    <>
      {/* ───────── Hero: cambia con la festividad elegida */}
      <section className="hero" style={{ ['--accent' as string]: holiday.accent }}>
        <div>
          <span className="hero-eyebrow">
            <Icon name={holiday.icon} size={15} /> {holiday.name} · {holiday.dateLabel}
          </span>
          <h1>{holiday.heroTitle}</h1>
          <p className="lead">{holiday.heroText}</p>
          <div className="hero-cta">
            <Link to="/calendario/nueva" className="btn btn-primary">
              <Icon name="users" size={18} /> ¿Para quién es el regalo?
            </Link>
            <Link to={`/catalogo?fiesta=${holiday.id}`} className="btn btn-ghost">
              Ver regalos de {holiday.name}
            </Link>
          </div>
          <div className="hero-trust">
            <span>
              <Icon name="shield" size={16} /> Pago retenido hasta que recibes
            </span>
            <span>
              <Icon name="star" size={16} filled /> Vendedores calificados
            </span>
            <span>
              <Icon name="truck" size={16} /> Recogida o envío
            </span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="disc" />
          <div className="big">
            <img src={regaloLogo} alt="" style={{ width: 205, height: 220, objectFit: 'contain' }} />
          </div>
          {/* Estrellitas y confeti alrededor del regalo */}
          {SPARKS.map((sp, i) => (
            <svg key={i} className="spark" viewBox="0 0 24 24" style={sp}>
              <path d="M12 0c.9 6.6 4.5 10.6 12 12-7.5 1.4-11.1 5.4-12 12-.9-6.6-4.5-10.6-12-12C7.5 10.6 11.1 6.6 12 0Z" />
            </svg>
          ))}
          {CONFETTI.map((c, i) => (
            <i key={i} className="confetti" style={c} />
          ))}
        </div>
      </section>

      {/* ───────── Festividades */}
      <div className="holiday-row" role="group" aria-label="Elige una festividad">
        {holidays.map((h) => (
          <button key={h.id} className="holiday-card" aria-pressed={h.id === holidayId} onClick={() => setHolidayId(h.id)}>
            <span>
              <strong>{h.name}</strong>
              <span className="sub">{h.dateLabel}</span>
            </span>
            <span className="emo">
              <Icon name={h.icon} size={22} />
            </span>
          </button>
        ))}
        <Link to="/catalogo" className="holiday-more">
          <i>
            <Icon name="arrow" size={20} />
          </i>
          Ver todo
        </Link>
      </div>

      <p className="holiday-hint" aria-hidden="true">
        Desliza para ver más fechas <Icon name="arrow" size={14} />
      </p>

      {/* ───────── Entrada al calendario de regalos */}
      <section className="cal-banner quick-gift">
        <div className="quick-head">
          <span className="cal-icon">
            <Icon name="bellRing" size={22} />
          </span>
          <div>
            <strong>Tu regalo en 3 toques, sin buscar</strong>
            <p>Para quienes no tienen tiempo de recorrer tiendas ni de hacer scroll.</p>
          </div>
        </div>
        <ol className="quick-steps">
          <li>
            <b>1</b> Dinos para quién es: papá, tu ahijado… su edad y qué le gusta
          </li>
          <li>
            <b>2</b> Te avisamos 1 semana y 3 días antes, también por WhatsApp
          </li>
          <li>
            <b>3</b> Eliges uno de los 3 regalos que te elegimos y pagas seguro
          </li>
        </ol>
        <div className="quick-cta">
          <Link to="/calendario/nueva" className="btn btn-primary">
            ¿Para quién es el regalo?
          </Link>
          {people.length > 0 && (
            <Link to="/calendario" className="btn btn-outline">
              Mis personas ({people.length})
            </Link>
          )}
        </div>
      </section>

      {/* ───────── Regalos para la festividad elegida */}
      <section className="section">
        <div className="section-head">
          <div>
            <h2>Regalos para {holiday.name}</h2>
            <p>{holiday.tagline}</p>
          </div>
          <Link to={`/catalogo?fiesta=${holiday.id}`} className="link-more">
            Ver más <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="grid-products">
          {forHoliday.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ───────── Vendedores mejor calificados */}
      <section className="section">
        <div className="section-head">
          <div>
            <h2>Vendedores mejor calificados</h2>
            <p>Calificaciones reales de otros compradores. Entra al perfil para ver sus reseñas.</p>
          </div>
        </div>
        <div className="grid-sellers">
          {topSellers.map((s) => (
            <SellerCard key={s.id} seller={s} />
          ))}
        </div>
      </section>

      {/* ───────── Cómo funciona */}
      <section className="section" id="como-funciona">
        <div className="section-head">
          <div>
            <h2>Así de fácil funciona Regalalo</h2>
            <p>Comprar un regalo debería ser tan lindo como regalarlo.</p>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <div className="num"><Icon name="users" size={22} /></div>
            <h3>1. Dinos para quién es</h3>
            <p>Quién es, su edad, qué le gusta, la fecha y cuánto quieres gastar. Te avisamos 1 semana y 3 días antes.</p>
          </div>
          <div className="step">
            <div className="num"><Icon name="gift" size={22} /></div>
            <h3>2. Elige entre pocos regalos</h3>
            <p>Con el aviso llegan 3 regalos pensados para esa persona, de vendedores calificados. Eliges uno y listo.</p>
          </div>
          <div className="step">
            <div className="num"><Icon name="lock" size={22} /></div>
            <h3>3. Paga con tranquilidad</h3>
            <p>Tu dinero queda retenido en Regalalo. El vendedor solo recibe el pago cuando tú confirmas que llegó.</p>
          </div>
        </div>
      </section>

      {/* ───────── CTA vendedores */}
      <section className="section">
        <div className="cta-seller">
          <div>
            <h2>¿Haces regalos únicos? Véndelos en Regalalo</h2>
            <p>
              Publica gratis, define si entregas por recogida o por envío y cobra con pago protegido. Solo{' '}
              {Math.round(COMMISSION_RATE * 100)}% de comisión cuando vendes.
            </p>
          </div>
          <button className="btn btn-gold" onClick={startSelling}>
            Empezar a vender <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>
    </>
  )
}
