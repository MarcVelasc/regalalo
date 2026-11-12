import { Link } from 'react-router-dom'
import { COMMISSION_RATE } from '../config'
import regaloUrl from '../assets/brand/regalo.svg'
import wordmarkUrl from '../assets/brand/wordmark.svg'

export function Footer() {
  return (
    <footer className="footer">
      <div className="row">
        <div>
          <div className="logo">
            <img className="logo-gift" src={regaloUrl} alt="" width="42" height="45" />
            <img className="logo-word" src={wordmarkUrl} alt="Regalalo" width="122" height="32" />
          </div>
          <p>Regalos para cada festividad, de emprendedores como tú.</p>
        </div>
        <div>
          <strong>Compra tranquilo</strong>
          <p>Tu pago queda retenido hasta que confirmas que recibiste tu regalo.</p>
        </div>
        <div>
          <strong>Vende con nosotros</strong>
          <p>Comisión de solo {Math.round(COMMISSION_RATE * 100)}% por venta. Sin costos de publicación.</p>
        </div>
        <div>
          <strong>Explora</strong>
          <p>
            <Link to="/catalogo">Catálogo</Link> · <Link to="/favoritos">Favoritos</Link> · <Link to="/negocio">Modelo de negocio</Link>
          </p>
        </div>
      </div>
      <p style={{ marginTop: 22, fontSize: '0.78rem', opacity: 0.6 }}>
        MVP de demostración · los regalos y vendedores son ficticios. Tus personas se guardan solo en este navegador.
      </p>
    </footer>
  )
}
