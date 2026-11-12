import type { Seller } from '../types'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

/** Avatar con iniciales del vendedor (sin emojis). */
export function SellerAvatar({ seller, size = 58 }: { seller: Pick<Seller, 'name' | 'avatarBg'>; size?: number }) {
  return (
    <span
      className="s-avatar"
      style={{ background: seller.avatarBg, width: size, height: size, fontSize: size * 0.36, borderRadius: size * 0.34 }}
      aria-hidden="true"
    >
      {initials(seller.name)}
    </span>
  )
}
