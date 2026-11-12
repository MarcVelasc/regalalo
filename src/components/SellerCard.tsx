import { Link } from 'react-router-dom'
import { useSellerStats } from '../store/hooks'
import { useStore } from '../store/useStore'
import type { Seller } from '../types'
import { Icon } from './Icon'
import { SellerAvatar } from './SellerAvatar'
import { Rating } from './Stars'

export function SellerCard({ seller }: { seller: Seller }) {
  const stats = useSellerStats(seller.id)
  const productCount = useStore((s) => s.products.filter((p) => p.sellerId === seller.id && p.active).length)

  return (
    <Link to={`/tienda/${seller.id}`} className="scard">
      <div className="scard-top">
        <SellerAvatar seller={seller} />
        <div>
          <h3>
            {seller.name}
            {seller.verified && (
              <span className="verified" title="Vendedor verificado">
                <Icon name="badge" size={17} />
              </span>
            )}
          </h3>
          <div className="city">
            <Icon name="pin" size={12} /> {seller.city}
          </div>
          <Rating avg={stats.avg} count={stats.count} size={14} />
        </div>
      </div>
      <p className="bio">{seller.bio}</p>
      <div className="scard-foot">
        <span>{productCount} regalos activos</span>
        <span>Desde {seller.joined}</span>
      </div>
    </Link>
  )
}
