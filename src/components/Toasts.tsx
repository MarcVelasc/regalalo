import { useStore } from '../store/useStore'

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} className={`toast ${t.tone}`} onClick={() => dismiss(t.id)}>
          {t.message}
        </button>
      ))}
    </div>
  )
}
