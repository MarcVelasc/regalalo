import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Icon } from './Icon'

const ago = (ts: number) => {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60_000))
  if (m < 60) return `hace ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.round(h / 24)} d`
}

/** Campana de avisos: cada vista (comprador / vendedor) ve solo los suyos. */
export function NotificationBell() {
  const navigate = useNavigate()
  const role = useStore((s) => s.role)
  const all = useStore((s) => s.notifications)
  const markRead = useStore((s) => s.markNotificationRead)
  const markAll = useStore((s) => s.markAllNotificationsRead)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const mine = useMemo(() => all.filter((n) => n.audience === role), [all, role])
  const unread = mine.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="bell-wrap" ref={boxRef}>
      <button
        className="icon-btn"
        aria-label={`Notificaciones (${unread} sin leer)`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="bell" size={20} />
        {unread > 0 && (
          <span key={unread} className="badge bump">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="bell-panel" role="region" aria-label="Notificaciones">
          <div className="bell-head">
            <strong>Notificaciones</strong>
            {unread > 0 && (
              <button className="link-btn" onClick={() => markAll(role)}>
                Marcar todas como leídas
              </button>
            )}
          </div>
          {mine.length === 0 ? (
            <p className="bell-empty">No tienes notificaciones por ahora.</p>
          ) : (
            <ul>
              {mine.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <button
                    className={`bell-item ${n.read ? '' : 'unread'}`}
                    onClick={() => {
                      markRead(n.id)
                      setOpen(false)
                      navigate(n.to)
                    }}
                  >
                    <span className="bell-icon">
                      <Icon name={n.icon} size={18} />
                    </span>
                    <span className="bell-text">
                      <strong>{n.title}</strong>
                      <span>{n.text}</span>
                      <em>{ago(n.createdAt)}</em>
                    </span>
                    {!n.read && <i className="bell-dot" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
