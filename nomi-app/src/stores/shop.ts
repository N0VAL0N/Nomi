// src/stores/shop.ts
import { defineStore } from 'pinia'

export interface ShopItem {
  id: string
  name: string
  price: number
  icon?: string
  gradient?: string
  premium?: boolean
}

export const SHOP_AVATAR_COLORS: ShopItem[] = [
  { id: 'default', name: 'Синий',      price: 0,   gradient: 'linear-gradient(135deg,#4C6FFF,#6B5FFF)' },
  { id: 'purple',  name: 'Фиолетовый', price: 0,   gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  { id: 'green',   name: 'Зелёный',    price: 120, gradient: 'linear-gradient(135deg,#22C55E,#16A34A)' },
  { id: 'pink',    name: 'Розовый',    price: 210, gradient: 'linear-gradient(135deg,#EC4899,#F472B6)' },
  { id: 'gold',    name: 'Золотой',    price: 260, gradient: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
  { id: 'red',     name: 'Красный',    price: 300, gradient: 'linear-gradient(135deg,#EF4444,#DC2626)' },
  { id: 'ice',     name: 'Ледяной',    price: 380, gradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)' },
  { id: 'fire',    name: 'Огненный',   price: 450, gradient: 'linear-gradient(135deg,#F97316,#DC2626)' }
]

export const SHOP_HATS: ShopItem[] = [
  { id: 'none',  name: 'Без шляпы',    price: 0,   icon: '—' },
  { id: 'cap',   name: 'Кепка',        price: 90,  icon: '🧢' },
  { id: 'party', name: 'Праздничная',  price: 180, icon: '🎉' },
  { id: 'grad',  name: 'Выпускник',    price: 320, icon: '🎓' },
  { id: 'santa', name: 'Новогодняя',   price: 400, icon: '🎅' },
  { id: 'tiara', name: 'Диадема',      price: 700, icon: '💎', premium: true }
]

export const useShopStore = defineStore('shop', {
  state: () => ({
    activeColor: 'purple',
    activeHat: 'none',
    ownedColors: ['default', 'purple'] as string[],
    ownedHats: ['none'] as string[]
  }),

  actions: {
    buyColor(item: ShopItem): boolean {
      if (this.ownedColors.includes(item.id)) {
        this.activeColor = item.id
        return true
      }
      this.ownedColors.push(item.id)
      this.activeColor = item.id
      return true
    },
    buyHat(item: ShopItem): boolean {
      if (this.ownedHats.includes(item.id)) {
        this.activeHat = item.id
        return true
      }
      this.ownedHats.push(item.id)
      this.activeHat = item.id
      return true
    }
  }
})