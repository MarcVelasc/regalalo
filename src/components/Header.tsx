import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { COMMISSION_RATE } from '../config'
import { selectCartCount, useStore } from '../store/useStore'
import { useTour } from '../store/tour'
import { Icon } from './Icon'
import { NotificationBell } from './NotificationBell'
import { SellerAvatar } from './SellerAvatar'

const buyerLinks = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/calendario', label: 'Mis personas' },
  { to: '/pedidos', label: 'Mis pedidos' },
  { to: '/favoritos', label: 'Favoritos' },
]

const sellerLinks = [
  { to: '/panel', label: 'Panel', end: true },
  { to: '/panel/regalos', label: 'Mis regalos' },
  { to: '/panel/regalos/nuevo', label: 'Publicar regalo' },
  { to: '/panel/pedidos', label: 'Pedidos recibidos' },
  { to: '/panel/resenas', label: 'Mis reseñas' },
]

export function Header() {
  const navigate = useNavigate()
  const role = useStore((s) => s.role)
  const setRole = useStore((s) => s.setRole)
  const cartCount = useStore(selectCartCount)
  const wishCount = useStore((s) => s.wishlist.length)
  const seller = useStore((s) => s.sellers.find((x) => x.id === s.currentSellerId))
  const pendingOrders = useStore(
    (s) => s.orders.filter((o) => o.sellerId === s.currentSellerId && o.status === 'pending').length,
  )
  const startTour = useTour((s) => s.start)
  const [query, setQuery] = useState('')

  const switchRole = (next: 'buyer' | 'seller') => {
    if (next === role) return
    setRole(next)
    navigate(next === 'buyer' ? '/' : '/panel')
  }

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    if (role === 'seller') setRole('buyer')
    navigate(`/catalogo${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  const links = role === 'buyer' ? buyerLinks : sellerLinks

  return (
    <header>
      <div className="topbar">
        <Link to={role === 'buyer' ? '/' : '/panel'} className="logo" aria-label="Regalalo, inicio">
          <span className="logo-mark">
            <Icon name="gift" size={21} />
          </span>
          <span>
            Regalalo
            <small>{role === 'buyer' ? 'Regalos con historia' : 'Panel de vendedor'}</small>
          </span>
        </Link>

        <form className="search" onSubmit={onSearch} role="search">
          <input
            type="search"
            placeholder="Busca ramos, manualidades, Hot Wheels, flores amarillas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar regalos"
          />
          <button type="submit" aria-label="Buscar">
            <Icon name="search" size={19} />
          </button>
        </form>

        <div className="view-switch" role="group" aria-label="Cambiar de vista">
          <button aria-pressed={role === 'buyer'} onClick={() => switchRole('buyer')}>
            <Icon name="bag" size={16} /> <span className="label-long">Comprador</span>
          </button>
          <button aria-pressed={role === 'seller'} onClick={() => switchRole('seller')}>
            <Icon name="store" size={16} /> <span className="label-long">Vendedor</span>
          </button>
        </div>

        <div className="top-actions">
          <NotificationBell />
          {role === 'buyer' ? (
            <>
              <Link to="/favoritos" className="icon-btn" aria-label={`Favoritos (${wishCount})`}>
                <Icon name="heart" size={20} />
                {wishCount > 0 && <span className="badge">{wishCount}</span>}
              </Link>
              <Link to="/carrito" className="icon-btn" aria-label={`Carrito (${cartCount})`}>
                <Icon name="cart" size={20} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
              <span className="avatar" title="Tu cuenta (demo)">
                <Icon name="user" size={20} />
              </span>
            </>
          ) : (
            <>
              <Link to="/panel/pedidos" className="icon-btn" aria-label={`Pedidos pendientes (${pendingOrders})`}>
                <Icon name="bag" size={20} />
                {pendingOrders > 0 && <span className="badge">{pendingOrders}</span>}
              </Link>
              {seller && <SellerAvatar seller={seller} size={42} />}
            </>
          )}
        </div>
      </div>

      {role === 'seller' && (
        <div className="role-banner">
          <strong>Vista de vendedor:</strong> estás gestionando <strong>{seller?.name}</strong>. Regalalo cobra una
          comisión del <strong>{Math.round(COMMISSION_RATE * 100)}%</strong> solo cuando vendes.
        </div>
      )}

      <nav className="subnav" aria-label="Navegación principal">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
        <NavLink to="/negocio" className={({ isActive }) => `subnav-aside ${isActive ? 'active' : ''}`}>
          Modelo de negocio
        </NavLink>
        <button className="tour-launch" onClick={startTour}>
          <Icon name="sparkles" size={15} /> Tour guiado
        </button>
      </nav>
    </header>
  )
}
