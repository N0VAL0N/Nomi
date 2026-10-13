// src/composables/useConfetti.ts
// Конфетти и фейерверк через DOM-элементы. Порт старого ui.js.

export function useConfetti() {
  function confetti(count = 60, gold = false, crowns = false) {
    const container = document.getElementById('confetti-container') || createContainer('confetti-container')
    const colors = ['#8B5CF6', '#7C3AED', '#22C55E', '#FBBF24', '#EC4899', '#06B6D4']
    const crownPieces = ['💎', '✨', '⭐', '💫', '🌟', '👑']

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      p.className = 'confetti-piece' + (gold ? ' gold' : '') + (crowns ? ' crown' : '')

      if (crowns) {
        p.textContent = crownPieces[Math.floor(Math.random() * crownPieces.length)]
        p.style.fontSize = 12 + Math.random() * 16 + 'px'
      } else if (!gold) {
        p.style.background = colors[Math.floor(Math.random() * colors.length)]
      }

      p.style.left = Math.random() * 100 + '%'
      p.style.animationDelay = Math.random() * 0.5 + 's'
      p.style.animationDuration = 2 + Math.random() * 1.5 + 's'
      if (!crowns) {
        const size = 6 + Math.random() * 8 + 'px'
        p.style.width = size
        p.style.height = size
        if (Math.random() > 0.5) p.style.borderRadius = '50%'
      }

      container.appendChild(p)
      setTimeout(() => p.remove(), 4000)
    }
  }

  function fireworks(count = 3) {
    const container = createContainer('fireworks-container')
    const colors = ['#FBBF24', '#EC4899', '#8B5CF6', '#22C55E', '#7C3AED', '#F97316']

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const cx = window.innerWidth * (0.2 + Math.random() * 0.6)
        const cy = window.innerHeight * (0.2 + Math.random() * 0.4)
        const color = colors[Math.floor(Math.random() * colors.length)]

        for (let j = 0; j < 30; j++) {
          const p = document.createElement('div')
          p.className = 'firework-particle'
          p.style.left = cx + 'px'
          p.style.top = cy + 'px'
          p.style.background = color
          p.style.boxShadow = `0 0 8px ${color}`
          const angle = (Math.PI * 2 * j) / 30
          const dist = 80 + Math.random() * 120
          p.style.setProperty('--tx', Math.cos(angle) * dist + 'px')
          p.style.setProperty('--ty', Math.sin(angle) * dist + 'px')
          container.appendChild(p)
          setTimeout(() => p.remove(), 1300)
        }
      }, i * 250)
    }
  }

  function createContainer(id: string): HTMLElement {
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('div')
      el.id = id
      el.className = id
      document.body.appendChild(el)
    }
    return el
  }

  return { confetti, fireworks }
}