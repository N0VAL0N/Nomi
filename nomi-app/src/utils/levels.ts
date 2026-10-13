// src/utils/levels.ts
// Уровни пользователя.

export interface Level {
  min: number
  max: number
  name: string
  icon: string
}

export const LEVELS: Level[] = [
  { min: 0,    max: 100,      name: 'Новичок', icon: '🌱' },
  { min: 100,  max: 300,      name: 'Ученик',  icon: '📖' },
  { min: 300,  max: 700,      name: 'Знаток',  icon: '🎓' },
  { min: 700,  max: 1500,     name: 'Мастер',  icon: '⚡' },
  { min: 1500, max: 3000,     name: 'Гуру',    icon: '🌟' },
  { min: 3000, max: Infinity, name: 'Легенда', icon: '💎' }
]

export function getLevel(xp: number): Level {
  return LEVELS.find((l) => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length - 1]
}

export function getLevelIndex(xp: number): number {
  return LEVELS.findIndex((l) => xp >= l.min && xp < l.max)
}