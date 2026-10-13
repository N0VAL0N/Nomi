// src/utils/storage.ts
// Сохранение и загрузка состояния из localStorage.

const STORAGE_KEY = 'nomi_state_v8'

export function saveToStorage(data: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('[storage] save failed', e)
  }
}

export function loadFromStorage<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    return deepMerge(fallback, JSON.parse(raw)) as T
  } catch (e) {
    console.warn('[storage] load failed', e)
    return fallback
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null) return source
  if (typeof source !== 'object' || source === null) return target
  if (Array.isArray(target) || Array.isArray(source)) return source
  const result = { ...target }
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
  }
  return result
}