// app/screens/pet.js
// Питомец: рендер, кормление, игры, скины.

import { state, saveState, isPrem } from '../state.js';
import { shortId } from '../utils.js';
import { showToast, sSuccess } from '../ui.js';
import { setEmotion, renderLookSvg, updateHats } from '../avatar.js';
import { openPremiumModal } from '../premium.js';
import { addXP, updateXP, updateShopBalance } from '../economy.js';

export const PET_SKINS = [
  { id: 'default', name: 'Классик',     emoji: '🐣', price: 0,   gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  { id: 'gold',    name: 'Золотой',     emoji: '🐥', price: 200, gradient: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
  { id: 'fire',    name: 'Огненный',    emoji: '🐲', price: 350, gradient: 'linear-gradient(135deg,#F97316,#DC2626)', premium: true },
  { id: 'ice',     name: 'Ледяной',     emoji: '🐧', price: 350, gradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)', premium: true },
  { id: 'forest',  name: 'Лесной',      emoji: '🦎', price: 300, gradient: 'linear-gradient(135deg,#22C55E,#16A34A)', premium: true },
  { id: 'cosmic',  name: 'Космический', emoji: '👽', price: 500, gradient: 'linear-gradient(135deg,#8B5CF6,#EC4899)', premium: true },
  { id: 'pink',    name: 'Розовый',     emoji: '🦄', price: 300, gradient: 'linear-gradient(135deg,#EC4899,#F472B6)', premium: true },
  { id: 'shadow',  name: 'Теневой',     emoji: '🐉', price: 600, gradient: 'linear-gradient(135deg,#1F2937,#4C6FFF)', premium: true }
];

export function renderPet() {
  const p = state.pet;
  if (!p) return;

  const lvlEl = document.getElementById('petLevel');
  if (lvlEl) lvlEl.textContent = p.level;

  const hungerEl = document.getElementById('petHungerValue');
  if (hungerEl) hungerEl.textContent = p.hunger + '%';
  const hungerFill = document.getElementById('petHungerFill');
  if (hungerFill) hungerFill.style.width = p.hunger + '%';

  const need = p.level * 100;
  const xpEl = document.getElementById('petXpValue');
  if (xpEl) xpEl.textContent = p.xp + ' / ' + need;
  const xpFill = document.getElementById('petXpFill');
  if (xpFill) xpFill.style.width = ((p.xp / need) * 100) + '%';

  const statusEl = document.getElementById('petStatusText');
  if (statusEl) statusEl.textContent = p.hunger > 70 ? 'Сытый и довольный! 🎉' : p.hunger > 30 ? 'Проголодался 🍎' : 'Очень голодный 😢';

  const hp = document.getElementById('homePetLevel');
  if (hp) hp.textContent = p.level;
  const hs = document.getElementById('homePetStatus');
  if (hs) hs.textContent = p.hunger > 70 ? 'Сытый и довольный' : 'Проголодался';

  const g = document.getElementById('petSkinsGrid');
  if (g) {
    const sk = isPrem() ? PET_SKINS : PET_SKINS.slice(0, 2);
    g.innerHTML = sk.map(s => {
      const a = state.pet.skin === s.id;
      return `<div class="pet-skin-item ${a ? 'active' : ''}" style="background:${s.gradient};" onclick="selectPetSkin('${s.id}')">${s.emoji}</div>`;
    }).join('');
  }

  renderLookSvg('petAvatarSvg', 'pet');
  updateHats();
}

export function selectPetSkin(id) {
  const s = PET_SKINS.find(x => x.id === id);
  if (!s) return;
  if (!isPrem() && !['default','gold'].includes(id)) {
    openPremiumModal();
    return;
  }
  if (!state.shopOwned.petSkins) state.shopOwned.petSkins = ['default'];
  if (!state.shopOwned.petSkins.includes(id)) {
    if (isPrem()) {
      state.shopOwned.petSkins.push(id);
      showToast('💎 Бесплатно!', 'gold');
    } else {
      const fp = Math.round(s.price * 0.7);
      if (fp === 0) {
        state.shopOwned.petSkins.push(id);
      } else {
        if (!confirm(`Купить скин «${s.name}» за ${fp} XP?`)) return;
        if (state.xp < fp) { showToast('💰 Недостаточно XP', 'error'); renderPet(); return; }
        state.xp -= fp;
        updateXP();
        state.shopOwned.petSkins.push(id);
        sSuccess();
      }
    }
  }
  state.pet.skin = id;
  saveState();
  renderPet();
  updateShopBalance();
  showToast(`🐲 ${s.name}`, 'success');
}

export function feedPet() {
  const t = (function(){ const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
  if (!state.petFeedsToday || state.petFeedsToday.date !== t) state.petFeedsToday = { date: t, count: 0 };
  if (state.petFeedsToday.count >= 5) { showToast('🍎 Наелся!', 'warning'); return; }
  state.petFeedsToday.count++;
  const p = state.pet;
  p.hunger = Math.min(100, p.hunger + 20);
  p.xp += 5;
  if (p.xp >= p.level * 100) { p.xp -= p.level * 100; p.level++; showToast('🎉 Вырос!', 'gold'); }
  saveState();
  renderPet();
  setEmotion('eating', 1000);
  showToast('🍎 +5 XP', 'success');
}

export function playWithPet() {
  const t = (function(){ const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
  if (!state.petPlaysToday || state.petPlaysToday.date !== t) state.petPlaysToday = { date: t, count: 0 };
  if (state.petPlaysToday.count >= 5) { showToast('🎾 Устал!', 'warning'); return; }
  state.petPlaysToday.count++;
  const p = state.pet;
  p.hunger = Math.max(0, p.hunger - 5);
  p.xp += 8;
  if (p.xp >= p.level * 100) { p.xp -= p.level * 100; p.level++; showToast('🎉 Вырос!', 'gold'); }
  saveState();
  renderPet();
  setEmotion('excited', 1500);
  addXP(3);
  showToast('🎾 +8 XP', 'success');
}

export function petPet() {
  const t = (function(){ const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
  if (!state.petPetsToday || state.petPetsToday.date !== t) state.petPetsToday = { date: t, count: 0 };
  if (state.petPetsToday.count >= 10) { showToast('🤗 Хватит!', 'info'); return; }
  state.petPetsToday.count++;
  const p = state.pet;
  p.xp += 3;
  if (p.xp >= p.level * 100) { p.xp -= p.level * 100; p.level++; showToast('🎉 Вырос!', 'gold'); }
  saveState();
  renderPet();
  setEmotion('love', 1200);
  showToast('🤗 Мурр!', 'info');
}