// src/utils/id.ts
// Генерация уникальных идентификаторов.

export function shortId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function generateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let a = '', b = ''
  for (let i = 0; i < 4; i++) a += chars[Math.floor(Math.random() * chars.length)]
  for (let i = 0; i < 4; i++) b += chars[Math.floor(Math.random() * chars.length)]
  return `NOMI-${a}-${b}`
}