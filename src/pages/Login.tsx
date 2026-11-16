import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import regaloUrl from '../assets/brand/regalo.svg'
import wordmarkUrl from '../assets/brand/wordmark.svg'
import { Icon } from '../components/Icon'
import { firstName, formatPhone, useAuth, type Account } from '../store/auth'
import { useStore } from '../store/useStore'

type Stage = 'start' | 'code' | 'name'
type Intent = 'buyer' | 'seller'

const newCode = () => String(Math.floor(100000 + Math.random() * 900000))

/** Entrada a la app: celular con código por WhatsApp, o Google. Todo simulado, sin servidor. */
export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuth((s) => s.user)
  const known = useAuth((s) => s.known)
  const login = useAuth((s) => s.login)
  const setRole = useStore((s) => s.setRole)
  const setBuyerWhatsapp = useStore((s) => s.setBuyerWhatsapp)

  const [intent, setIntent] = useState<Intent>('buyer')
  const [stage, setStage] = useState<Stage>('start')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0)
  const [google, setGoogle] = useState(false)
  const [gName, setGName] = useState('')
  const [gMail, setGMail] = useState('')
  const [pending, setPending] = useState<Account | null>(null)
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  const from = (location.state as { from?: string } | null)?.from

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  if (user && !pending) return <Navigate to={from ?? '/'} replace />

  const enter = (a: Account) => {
    login(a)
    setRole(intent)
    if (a.phone) setBuyerWhatsapp(a.phone)
    navigate(intent === 'seller' ? '/panel' : from && from !== '/entrar' ? from : '/', { replace: true })
  }

  const sendCode = (e?: FormEvent) => {
    e?.preventDefault()
    if (!/^[67]\d{7}$/.test(phone)) return setError('Escribe tu celular de 8 dígitos (empieza con 6 o 7)')
    setError('')
    setCode(newCode())
    setDigits(Array(6).fill(''))
    setWait(30)
    setStage('code')
    setTimeout(() => boxes.current[0]?.focus(), 50)
  }

  const verify = (all: string[]) => {
    const typed = all.join('')
    if (typed.length < 6) return
    if (typed !== code) {
      setError('Ese código no coincide. Revísalo en el mensaje.')
      return
    }
    setError('')
    const saved = known[phone]
    if (saved) return enter({ name: saved, method: 'phone', phone })
    setStage('name')
  }

  const typeDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    setError('')
    if (d && i < 5) boxes.current[i + 1]?.focus()
    if (next.every(Boolean)) verify(next)
  }
  const keyDigit = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus()
  }
  const pasteDigits = (e: ClipboardEvent<HTMLInputElement>) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (p.length < 2) return
    e.preventDefault()
    const next = Array.from({ length: 6 }, (_, k) => p[k] ?? '')
    setDigits(next)
    boxes.current[Math.min(p.length, 5)]?.focus()
    if (next.every(Boolean)) verify(next)
  }

  const saveName = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setError('Escribe tu nombre')
    enter({ name: name.trim(), method: 'phone', phone })
  }

  const googleGo = (e: FormEvent) => {
    e.preventDefault()
    if (gName.trim().length < 2) return setError('Escribe tu nombre')
    if (!/^\S+@\S+\.\S+$/.test(gMail.trim())) return setError('Escribe un correo válido')
    setError('')
    const a: Account = { name: gName.trim(), method: 'google', email: gMail.trim().toLowerCase() }
    setGoogle(false)
    setPending(a)
    // Google no da el celular: lo pedimos para poder avisarle por WhatsApp
    setStage('start')
  }

  const finishGoogle = (e: FormEvent) => {
    e.preventDefault()
    if (phone && !/^[67]\d{7}$/.test(phone)) return setError('Revisa el número (8 dígitos)')
    enter({ ...pending!, phone: phone || undefined })
  }

  return (
    <div className="login">
      <aside className="login-brand">
        <div className="login-gift" aria-hidden="true">
          <img src={regaloUrl} alt="" />
          <i className="glow" />
        </div>
        <img className="login-word" src={wordmarkUrl} alt="Regalalo" />
        <p className="login-tag">Regalos con historia, sin buscar y sin olvidar.</p>
        <ul>
          <li><Icon name="users" size={18} /> Dinos para quién es y te mostramos pocos regalos pensados para esa persona</li>
          <li><Icon name="bellRing" size={18} /> Te avisamos por WhatsApp 1 semana y 3 días antes</li>
          <li><Icon name="shield" size={18} /> Tu pago queda retenido hasta que recibes el regalo</li>
        </ul>
      </aside>

      <main className="login-panel">
        <div className="login-card">
          {pending ? (
            <form onSubmit={finishGoogle} noValidate className="login-step">
              <span className="login-ok"><Icon name="check" size={22} /></span>
              <h1>Hola, {firstName(pending.name)}</h1>
              <p className="login-sub">Entraste con {pending.email}. ¿A qué WhatsApp te enviamos los avisos de tus fechas?</p>
              <PhoneField phone={phone} setPhone={(v) => { setPhone(v); setError('') }} />
              {error && <p className="login-err" role="alert">{error}</p>}
              <button className="btn btn-primary login-main" type="submit">
                Entrar a Regalalo <Icon name="arrow" size={18} />
              </button>
              <button type="button" className="link-btn login-skip" onClick={() => enter(pending)}>
                Ahora no, lo agrego después
              </button>
            </form>
          ) : stage === 'start' ? (
            <form onSubmit={sendCode} noValidate className="login-step">
              <h1>Entra a Regalalo</h1>
              <p className="login-sub">Con tu número de celular. Si es tu primera vez, se crea tu cuenta.</p>

              <div className="login-intent" role="group" aria-label="¿Qué quieres hacer?">
                <button type="button" aria-pressed={intent === 'buyer'} onClick={() => setIntent('buyer')}>
                  <Icon name="gift" size={20} />
                  <span>Quiero regalar</span>
                </button>
                <button type="button" aria-pressed={intent === 'seller'} onClick={() => setIntent('seller')}>
                  <Icon name="store" size={20} />
                  <span>Quiero vender</span>
                </button>
              </div>

              <PhoneField phone={phone} setPhone={(v) => { setPhone(v); setError('') }} autoFocus />
              {error && <p className="login-err" role="alert">{error}</p>}
              <button className="btn btn-primary login-main" type="submit">
                <Icon name="message" size={18} /> Recibir código por WhatsApp
              </button>

              <div className="login-or"><span>o</span></div>
              <button type="button" className="btn login-google" onClick={() => { setError(''); setGoogle(true) }}>
                <span className="g" aria-hidden="true">G</span> Continuar con Google
              </button>
              <p className="login-legal">Al continuar aceptas los términos y la política de privacidad de Regalalo.</p>
            </form>
          ) : stage === 'code' ? (
            <div className="login-step">
              <button type="button" className="link-btn login-back" onClick={() => { setStage('start'); setError('') }}>
                <Icon name="arrowLeft" size={15} /> Cambiar número
              </button>
              <h1>Escribe el código</h1>
              <p className="login-sub">Te lo enviamos por WhatsApp al <strong>{formatPhone(phone)}</strong>.</p>

              <div className="login-wa" aria-live="polite">
                <span className="wa-dot"><Icon name="message" size={16} /></span>
                <div>
                  <small>WhatsApp · Regalalo</small>
                  <p>Tu código de Regalalo es <b>{code}</b>. No lo compartas con nadie.</p>
                </div>
                <em>Simulación</em>
              </div>

              <div className="otp" role="group" aria-label="Código de 6 dígitos">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { boxes.current[i] = el }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={d}
                    aria-label={`Dígito ${i + 1}`}
                    onChange={(e) => typeDigit(i, e.target.value)}
                    onKeyDown={(e) => keyDigit(i, e)}
                    onPaste={pasteDigits}
                    className={error ? 'bad' : ''}
                  />
                ))}
              </div>
              {error && <p className="login-err" role="alert">{error}</p>}
              <p className="login-resend">
                {wait > 0 ? (
                  <>¿No te llegó? Puedes pedir otro en {wait} s</>
                ) : (
                  <button type="button" className="link-btn" onClick={() => sendCode()}>Enviar otro código</button>
                )}
              </p>
            </div>
          ) : (
            <form onSubmit={saveName} noValidate className="login-step">
              <span className="login-ok"><Icon name="check" size={22} /></span>
              <h1>¡Bienvenido!</h1>
              <p className="login-sub">Es tu primera vez. ¿Cómo te llamas?</p>
              <label className="field">
                <span>Tu nombre</span>
                <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setError('') }} placeholder="Ej. Marco Velasco" autoComplete="name" />
              </label>
              {error && <p className="login-err" role="alert">{error}</p>}
              <button className="btn btn-primary login-main" type="submit">
                {intent === 'seller' ? 'Ir a mi panel de vendedor' : 'Empezar a regalar'} <Icon name="arrow" size={18} />
              </button>
            </form>
          )}
        </div>
      </main>

      {google && (
        <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="g-title" onClick={() => setGoogle(false)}>
          <form className="login-modal-card" onSubmit={googleGo} onClick={(e) => e.stopPropagation()} noValidate>
            <span className="g big" aria-hidden="true">G</span>
            <h2 id="g-title">Continuar con Google</h2>
            <p className="login-sub">En la app real se abre la ventana de Google. En esta demo, escribe tu cuenta.</p>
            <label className="field">
              <span>Nombre</span>
              <input autoFocus value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Ej. Marco Velasco" />
            </label>
            <label className="field">
              <span>Correo de Gmail</span>
              <input type="email" value={gMail} onChange={(e) => setGMail(e.target.value)} placeholder="tucorreo@gmail.com" />
            </label>
            {error && <p className="login-err" role="alert">{error}</p>}
            <div className="login-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setGoogle(false); setError('') }}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Continuar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function PhoneField({ phone, setPhone, autoFocus }: { phone: string; setPhone: (v: string) => void; autoFocus?: boolean }) {
  return (
    <label className="field">
      <span>Tu número de celular</span>
      <div className="login-phone">
        <b>+591</b>
        <input
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="7123 4567"
        />
      </div>
    </label>
  )
}
