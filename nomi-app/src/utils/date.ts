// src/utils/date.ts
// Утилиты для работы с датами.

export function todayISO(): string {
  const d = new Date()
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

export function daysBetween(iso: string): number {
  if (!iso) return 0
  const a = new Date(iso + 'T00:00:00')
  const b = new Date(todayISO() + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const t = todayISO()
  const tm = addDays(t, 1)
  const y = addDays(t, -1)
  if (iso === t) return 'Сегодня'
  if (iso === tm) return 'Завтра'
  if (iso === y) return 'Вчера'
  return d.getDate() + ' ' + months[d.getMonth()]
}

export function plural(n: number, forms: [string, string, string]): string {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1]
  return forms[2]
}