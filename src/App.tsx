import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Business } from './pages/Business'
import { Calendar } from './pages/Calendar'
import { CalendarNew } from './pages/CalendarNew'
import { CalendarSuggestion } from './pages/CalendarSuggestion'
import { Cart } from './pages/Cart'
import { Catalog } from './pages/Catalog'
import { Checkout } from './pages/Checkout'
import { Home } from './pages/Home'
import { Orders } from './pages/Orders'
import { ProductDetail } from './pages/ProductDetail'
import { SellerProfile } from './pages/SellerProfile'
import { Dashboard } from './pages/seller/Dashboard'
import { GiftForm } from './pages/seller/GiftForm'
import { MyGifts } from './pages/seller/MyGifts'
import { SellerOrders } from './pages/seller/SellerOrders'
import { SellerReviews } from './pages/seller/SellerReviews'
import { Wishlist } from './pages/Wishlist'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          {/* ───────── Comprador */}
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="regalo/:id" element={<ProductDetail />} />
          <Route path="tienda/:id" element={<SellerProfile />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="favoritos" element={<Wishlist />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="calendario/nueva" element={<CalendarNew />} />
          <Route path="calendario/:personId/sugerencia" element={<CalendarSuggestion />} />
          <Route path="negocio" element={<Business />} />

          {/* ───────── Vendedor */}
          <Route path="panel" element={<Dashboard />} />
          <Route path="panel/regalos" element={<MyGifts />} />
          <Route path="panel/regalos/nuevo" element={<GiftForm key="new" />} />
          <Route path="panel/regalos/:id/editar" element={<GiftForm key="edit" />} />
          <Route path="panel/pedidos" element={<SellerOrders />} />
          <Route path="panel/resenas" element={<SellerReviews />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
