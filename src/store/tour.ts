import { create } from 'zustand'

interface TourState {
  active: boolean
  step: number
  start: () => void
  stop: () => void
  go: (step: number) => void
}

/** Estado del tour guiado (no se mezcla con el store de negocio). */
export const useTour = create<TourState>((set) => ({
  active: false,
  step: 0,
  start: () => set({ active: true, step: 0 }),
  stop: () => set({ active: false }),
  go: (step) => set({ step }),
}))
