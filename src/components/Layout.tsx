import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Footer } from './Footer'
import { GuidedTour } from './GuidedTour'
import { Header } from './Header'
import { Toasts } from './Toasts'

export function Layout() {
  const { pathname } = useLocation()
  const role = useStore((s) => s.role)
  const setRole = useStore((s) => s.setRole)

  // Si alguien entra directo a /panel/*, activamos la vista de vendedor.
  useEffect(() => {
    if (pathname.startsWith('/panel') && role !== 'seller') setRole('seller')
  }, [pathname, role, setRole])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  // Avisos del calendario: se revisan al abrir la app y luego cada minuto.
  const checkReminders = useStore((st) => st.checkReminders)
  useEffect(() => {
    checkReminders()
    const timer = window.setInterval(checkReminders, 60_000)
    return () => window.clearInterval(timer)
  }, [checkReminders])

  return (
    <div className="shell">
      <Header />
      <main className="page" key={pathname}>
        <Outlet />
      </main>
      <Footer />
      <Toasts />
      <GuidedTour />
    </div>
  )
}
