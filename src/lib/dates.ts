export const dayKey = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export const parseDay = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Lundi de la semaine courante. */
export const startOfWeek = (d = new Date()) => addDays(d, -((d.getDay() + 6) % 7))

export const shortDate = (key: string) =>
  parseDay(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
