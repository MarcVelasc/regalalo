import type { IconName } from '../components/Icon'
import type { AgeGroup, Gender } from '../types'

/**
 * Lo que Regalalo le pide al vendedor para clasificar cada regalo, y al comprador para describir a la persona.
 * Con estas mismas listas el algoritmo cruza "para quién es el regalo" con "para quién sirve cada producto".
 */

export const INTERESTS: { id: string; name: string; icon: IconName }[] = [
  { id: 'cafe', name: 'Café y desayunos', icon: 'coffee' },
  { id: 'dulces', name: 'Dulces', icon: 'candy' },
  { id: 'autos', name: 'Autos', icon: 'car' },
  { id: 'juegos', name: 'Juegos y juguetes', icon: 'gamepad' },
  { id: 'flores', name: 'Flores', icon: 'flower2' },
  { id: 'plantas', name: 'Plantas', icon: 'leaf' },
  { id: 'decoracion', name: 'Decorar la casa', icon: 'sofa' },
  { id: 'manualidades', name: 'Manualidades', icon: 'palette' },
  { id: 'recuerdos', name: 'Fotos y recuerdos', icon: 'camera' },
  { id: 'moda', name: 'Moda y accesorios', icon: 'shirt' },
  { id: 'bienestar', name: 'Relajarse y cuidarse', icon: 'bath' },
  { id: 'herramientas', name: 'Herramientas y arreglos', icon: 'hammer' },
]

export const AGE_GROUPS: { id: AgeGroup; name: string; min: number; max: number }[] = [
  { id: 'nino', name: 'Niños (0-12)', min: 0, max: 12 },
  { id: 'joven', name: 'Jóvenes (13-25)', min: 13, max: 25 },
  { id: 'adulto', name: 'Adultos (26-59)', min: 26, max: 59 },
  { id: 'mayor', name: 'Mayores (60+)', min: 60, max: 130 },
]

export const ageGroupOf = (age: number): AgeGroup =>
  (AGE_GROUPS.find((g) => age >= g.min && age <= g.max) ?? AGE_GROUPS[2]).id

/** Relaciones frecuentes. El sexo se completa solo cuando la relación lo indica. */
export const RELATIONS: { id: string; name: string; gender?: Gender }[] = [
  { id: 'papa', name: 'Papá', gender: 'hombre' },
  { id: 'mama', name: 'Mamá', gender: 'mujer' },
  { id: 'pareja', name: 'Pareja' },
  { id: 'hijo', name: 'Hijo', gender: 'hombre' },
  { id: 'hija', name: 'Hija', gender: 'mujer' },
  { id: 'hermano', name: 'Hermano', gender: 'hombre' },
  { id: 'hermana', name: 'Hermana', gender: 'mujer' },
  { id: 'ahijado', name: 'Ahijado', gender: 'hombre' },
  { id: 'ahijada', name: 'Ahijada', gender: 'mujer' },
  { id: 'abuelo', name: 'Abuelo', gender: 'hombre' },
  { id: 'abuela', name: 'Abuela', gender: 'mujer' },
  { id: 'amigo', name: 'Amigo', gender: 'hombre' },
  { id: 'amiga', name: 'Amiga', gender: 'mujer' },
  { id: 'otro', name: 'Otra persona' },
]

export const relationName = (id: string) => RELATIONS.find((r) => r.id === id)?.name ?? 'Otra persona'
export const interestName = (id: string) => INTERESTS.find((i) => i.id === id)?.name ?? id
