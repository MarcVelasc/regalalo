import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Account {
  name: string
  method: 'phone' | 'google'
  /** 8 dígitos, sin el 591 */
  phone?: string
  email?: string
}

interface AuthState {
  user: Account | null
  /** Cuentas que ya entraron alguna vez en este navegador (para el "Hola de nuevo") */
  known: Record<string, string>
  login: (a: Account) => void
  logout: () => void
}

/** Sesión simulada: no hay servidor, la cuenta vive en este navegador. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      known: {},
      login: (a) =>
        set((s) => ({ user: a, known: { ...s.known, [a.phone ?? a.email ?? a.name]: a.name } })),
      logout: () => set({ user: null }),
    }),
    { name: 'regalalo-cuenta', version: 1 },
  ),
)

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? ''
export const formatPhone = (p: string) => `+591 ${p.slice(0, 4)} ${p.slice(4)}`
