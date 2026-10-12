// app/screens/shop.js
// Магазин: темы, цвета аватара, шляпы, фоны, внешность Номи.

import { state, saveState, isPrem, price } from '../state.js';
import { escapeHtml } from '../utils.js';
import { showToast, sSuccess, confetti, vibrate } from '../ui.js';
import {
  updateNomiAvatar, setEmotion,
  renderLookSvg,
  HORN_SHAPES, HORN_MIRROR, HORN_COLORS,
  EYE_SHAPES, EYE_COLORS, NOSE_SHAPES,
  NOMI_BODY_COLORS,
  BIG_MOUTHS, SMALL_MOUTHS
} from '../avatar.js';

/* ---------- Данные магазина ---------- */

export const SHOP_THEMES_BASE = [
  { id: 'dark',  name: 'Тёмная',  themeValue: 'dark',  desc: 'Белый на чёрном' },
  { id: 'light', name: 'Светлая', themeValue: 'light', desc: 'Чёрный на белом' }
];

export const SHOP_THEMES_EXTRA = [
  { id: 'fire',   name: 'Огонь',  priceXP: 180, desc: 'Красно-оранжевая' },
  { id: 'forest', name: 'Лес',    priceXP: 220, desc: 'Зелёные тона' },
  { id: 'gold',   name: 'Золото', priceXP: 420, desc: 'Золотые акценты' },
  { id: 'cosmic', name: 'Космос', priceXP: 650, desc: 'Фиолетово-розовая' }
];

export const SHOP_AVATAR_COLORS = [
  { id: 'default', name: 'Синий',       price: 0,   gradient: 'linear-gradient(135deg,#4C6FFF,#6B5FFF)' },
  { id: 'purple',  name: 'Фиолетовый',  price: 0,   gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  { id: 'green',   name: 'Зелёный',     price: 120, gradient: 'linear-gradient(135deg,#22C55E,#16A34A)' },
  { id: 'pink',    name: 'Розовый',     price: 210, gradient: 'linear-gradient(135deg,#EC4899,#F472B6)' },
  { id: 'gold',    name: 'Золотой',     price: 260, gradient: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
  { id: 'red',     name: 'Красный',     price: 300, gradient: 'linear-gradient(135deg,#EF4444,#DC2626)' },
  { id: 'ice',     name: 'Ледяной',     price: 380, gradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)' },
  { id: 'fire',    name: 'Огненный',    price: 450, gradient: 'linear-gradient(135deg,#F97316,#DC2626)' }
];

export const SHOP_HATS = [
  { id: 'none',  name: 'Без шляпы',     price: 0,   icon: '—' },
  { id: 'cap',   name: 'Кепка',         price: 90,  icon: '🧢' },
  { id: 'party', name: 'Праздничная',   price: 180, icon: '🎉' },
  { id: 'grad',  name: 'Выпускник',     price: 320, icon: '🎓' },
  { id: 'santa', name: 'Новогодняя',    price: 400, icon: '🎅' },
  { id: 'tiara', name: 'Диадема',       price: 700, icon: '💎', premium: true }
];

export const SHOP_BACKGROUNDS = [
  { id: 'none',   name: 'Без фона',      price: 0,   css: '', bodyClass: '' },
  { id: 'forest', name: 'Лес',           price: 250, css: 'linear-gradient(180deg,#22C55E,#166534)', bodyClass: 'bg-forest' },
  { id: 'stars',  name: 'Звёздное небо', price: 320, css: 'radial-gradient(circle at 30% 20%, #4C6FFF, #1E1B4B, #05040F)', bodyClass: 'bg-stars' },
  { id: 'sunset', name: 'Закат',         price: 400, css: 'linear-gradient(180deg,#FBBF24,#EC4899,#7C3AED)', bodyClass: 'bg-sunset' },
  { id: 'ocean',  name: 'Океан',         price: 480, css: 'linear-gradient(180deg,#38BDF8,#0EA5E9,#0369A1)', bodyClass: 'bg-ocean' }
];

export const NOMI_LOOK_DATA = {
  horns: [
    { id:'classic', name:'Классические',   price:0 },   { id:'sharp',   name:'Злые острые',  price:80 },
    { id:'ram',     name:'Бараньи',        price:120 }, { id:'deer',    name:'Оленьи',       price:140 },
    { id:'rainbow', name:'Радужные',       price:150 }, { id:'bull',    name:'Бычьи',        price:160 },
    { id:'storm',   name:'Грозовые',       price:240 }, { id:'fire',    name:'Огненные',     price:300 },
    { id:'crystal', name:'Кристальные',    price:380 }, { id:'crown',   name:'Королевские',  price:460 },
    { id:'moon',    name:'Лунные',         price:550 }
  ],
  eyes: [
    { id:'round',    name:'Обычные',       price:0 },   { id:'heart',   name:'Сердечки',     price:60 },
    { id:'star',     name:'Звёздочки',     price:100 }, { id:'flame',   name:'Пламя',        price:140 },
    { id:'drop',     name:'Капельки',      price:160 }, { id:'crescent',name:'Полумесяцы',   price:180 },
    { id:'shy',      name:'Смущённые',     price:200 }, { id:'cry',     name:'Слезливые',    price:220 },
    { id:'sly',      name:'Хитрые',        price:260 }, { id:'diamond', name:'Алмазные',     price:340 },
    { id:'cosmic',   name:'Космические',   price:500 }
  ],
  noses: [
    { id:'small',    name:'Обычный',       price:0 },   { id:'pig',     name:'Пятачок',      price:50 },
    { id:'dog',      name:'Собачий',       price:60 },  { id:'cat',     name:'Кошачий',      price:70 },
    { id:'triangle', name:'Треугольный',   price:90 },  { id:'heart',   name:'Сердечко',     price:100 },
    { id:'star',     name:'Звёздочка',     price:130 }, { id:'diamond', name:'Ромб',         price:150 },
    { id:'gold',     name:'Золотой',       price:280 }, { id:'comet',   name:'Комета',       price:360 },
    { id:'magic',    name:'Магический',    price:480 }
  ],
  mouths: [
    { id:'soft',   name:'Добрая',         price:0 },   { id:'wide',   name:'Широкая',        price:40 },
    { id:'happy',  name:'Счастливая',     price:60 },  { id:'lick',   name:'Облизывается',   price:90 },
    { id:'cat',    name:'Кошачья',        price:110 }, { id:'sly',    name:'Хитрая',         price:120 },
    { id:'purr',   name:'Мурчащая',       price:140 }, { id:'wow',    name:'Восторг',        price:170 },
    { id:'demon',  name:'Демонская',      price:200 }, { id:'love',   name:'Влюблённая',     price:220 },
    { id:'fang',   name:'Клыкастая',      price:320 }
  ]
};

let currentLookTab = 'horns';
export function setLookTab(t) { currentLookTab = t; }

/* ---------- Покупка товара (универсальный метод) ---------- */

function tryBuy(item, ownedList) {
  if (ownedList.includes(item.id)) return true;

  if (isPrem()) {
    ownedList.push(item.id);
    showToast('💎 Бесплатно!', 'gold');
    return true;
  }

  const fp = price(item.price);
  if (fp === 0) {
    ownedList.push(item.id);
    return true;
  }

  if (!confirm(`Купить «${item.name}» за ${fp} XP?`)) return false;
  if (state.xp < fp) {
    showToast('💰 Недостаточно XP', 'error');
    return false;
  }
  state.xp -= fp;
  if (typeof window.updateXP === 'function') window.updateXP();
  ownedList.push(item.id);
  sSuccess();
  return true;
}

/* ---------- Основной рендер магазина ---------- */

export function renderShop() {
  const bb = document.getElementById('shopThemesBaseGrid');
  if (bb) bb.innerHTML = SHOP_THEMES_BASE.map(t => {
    const act = state.theme === t.themeValue;
    return `<div class="shop-item ${act ? 'selected' : ''}" onclick="buyTheme('${t.id}')">
      <div class="shop-item-preview" style="background:${t.themeValue === 'light' ? '#FFF' : '#0A0E1A'};"></div>
      <div class="shop-item-name">${t.name}</div>
      <div class="shop-item-price owned-price">${act ? '✓' : 'Бесплатно'}</div>
    </div>`;
  }).join('');

  const eb = document.getElementById('shopThemesGrid');
  if (eb) eb.innerHTML = SHOP_THEMES_EXTRA.map(t => {
    const o = state.shopOwned.themes.includes(t.id);
    const a = state.shopActive.theme === t.id;
    const fp = price(t.priceXP);
    const canAfford = isPrem() || state.xp >= fp;
    const bgs = { fire:'linear-gradient(135deg,#EF4444,#F97316)', forest:'linear-gradient(135deg,#22C55E,#166534)', gold:'linear-gradient(135deg,#FBBF24,#F59E0B)', cosmic:'linear-gradient(135deg,#8B5CF6,#EC4899)' };
    return `<div class="shop-item ${o ? 'owned' : ''} ${a ? 'selected' : ''}" onclick="buyTheme('${t.id}')">
      <div class="shop-item-preview" style="background:${bgs[t.id] || 'var(--card-bg-2)'};"></div>
      <div class="shop-item-name">${t.name}</div>
      <div class="shop-item-price ${o ? 'owned-price' : (canAfford ? '' : 'unaffordable')}">${o ? 'Есть' : (isPrem() && fp < t.priceXP ? `<s>${t.priceXP}</s> ${fp}` : fp) + ' XP'}</div>
    </div>`;
  }).join('');

  const acb = document.getElementById('shopAvatarColorsGrid');
  if (acb) acb.innerHTML = SHOP_AVATAR_COLORS.map(c => {
    const o = (state.shopOwned.avatarColors || []).includes(c.id);
    const a = state.shopActive.avatarColor === c.id;
    const fp = price(c.price);
    const canAfford = isPrem() || state.xp >= fp || c.price === 0;
    return `<div class="shop-item ${o ? 'owned' : ''} ${a ? 'selected' : ''}" onclick="buyAvatarColor('${c.id}')">
      <div style="width:60px;height:60px;border-radius:50%;margin:0 auto 8px;background:${c.gradient};"></div>
      <div class="shop-item-name">${c.name}</div>
      <div class="shop-item-price ${o ? 'owned-price' : (canAfford ? '' : 'unaffordable')}">${o ? 'Есть' : (c.price === 0 ? 'Бесплатно' : fp + ' XP')}</div>
    </div>`;
  }).join('');

  const hb = document.getElementById('shopHatsGrid');
  if (hb) hb.innerHTML = SHOP_HATS.map(h => {
    const o = (state.shopOwned.hats || []).includes(h.id);
    const a = state.shopActive.hat === h.id;
    const fp = price(h.price);
    const canAfford = isPrem() || state.xp >= fp || h.price === 0;
    return `<div class="shop-item ${o ? 'owned' : ''} ${a ? 'selected' : ''}" onclick="buyHat('${h.id}')">
      <span style="font-size:2.5rem;display:block;margin-bottom:8px;">${h.icon}</span>
      <div class="shop-item-name">${h.name}</div>
      <div class="shop-item-price ${o ? 'owned-price' : (canAfford ? '' : 'unaffordable')}">${o ? 'Есть' : (h.price === 0 ? 'Бесплатно' : fp + ' XP')}</div>
    </div>`;
  }).join('');

  const bgb = document.getElementById('shopBackgroundsGrid');
  if (bgb) bgb.innerHTML = SHOP_BACKGROUNDS.map(b => {
    const o = (state.shopOwned.backgrounds || []).includes(b.id);
    const a = state.shopActive.background === b.id;
    const fp = price(b.price);
    const canAfford = isPrem() || state.xp >= fp || b.price === 0;
    return `<div class="shop-item ${o ? 'owned' : ''} ${a ? 'selected' : ''}" onclick="buyBackground('${b.id}')">
      <div class="shop-item-preview" style="background:${b.css || 'var(--card-bg-2)'};"></div>
      <div class="shop-item-name">${b.name}</div>
      <div class="shop-item-price ${o ? 'owned-price' : (canAfford ? '' : 'unaffordable')}">${o ? 'Есть' : (b.price === 0 ? 'Бесплатно' : fp + ' XP')}</div>
    </div>`;
  }).join('');
}

/* ---------- Покупки ---------- */

export function buyAvatarColor(id) {
  const c = SHOP_AVATAR_COLORS.find(x => x.id === id);
  if (!c) return;
  if (!state.shopOwned.avatarColors) state.shopOwned.avatarColors = ['default'];
  if (!tryBuy(c, state.shopOwned.avatarColors)) { renderShop(); return; }
  state.shopActive.avatarColor = id;
  saveState();
  updateNomiAvatar();
  renderShop();
  if (typeof window.updateShopBalance === 'function') window.updateShopBalance();
  showToast('🎭 Применено', 'success');
}

export function buyHat(id) {
  const h = SHOP_HATS.find(x => x.id === id);
  if (!h) return;
  if (h.premium && !isPrem()) {
    if (typeof window.openPremiumModal === 'function') window.openPremiumModal();
    return;
  }
  if (!state.shopOwned.hats) state.shopOwned.hats = ['none'];
  if (!tryBuy(h, state.shopOwned.hats)) { renderShop(); return; }
  state.shopActive.hat = id;
  saveState();
  updateNomiAvatar();
  renderShop();
  if (typeof window.updateShopBalance === 'function') window.updateShopBalance();
  showToast('🎩 Надето', 'success');
}

export function buyBackground(id) {
  const b = SHOP_BACKGROUNDS.find(x => x.id === id);
  if (!b) return;
  if (!state.shopOwned.backgrounds) state.shopOwned.backgrounds = ['none'];
  if (!tryBuy(b, state.shopOwned.backgrounds)) { renderShop(); return; }
  state.shopActive.background = id;
  saveState();
  if (typeof window.updateBodyBackground === 'function') window.updateBodyBackground();
  renderShop();
  if (typeof window.updateShopBalance === 'function') window.updateShopBalance();
  showToast('🖼 Применено', 'success');
}

export function buyTheme(id) {
  const base = SHOP_THEMES_BASE.find(t => t.id === id);
  if (base) {
    if (base.themeValue === 'light') {
      state.theme = 'light';
      document.body.classList.add('light-theme');
    } else {
      state.theme = 'dark';
      document.body.classList.remove('light-theme');
    }
    saveState();
    renderShop();
    if (typeof window.updateShopBalance === 'function') window.updateShopBalance();
    showToast(`🎨 ${base.name}`, 'success');
    return;
  }

  const ex = SHOP_THEMES_EXTRA.find(t => t.id === id);
  if (!ex) return;
  const o = state.shopOwned.themes.includes(id);
  if (!o) {
    if (isPrem()) {
      state.shopOwned.themes.push(id);
      state.shopActive.theme = id;
      applyTheme(id);
      saveState();
      renderShop();
      if (typeof window.updateShopBalance === 'function') window.updateShopBalance();
      showToast('💎 Бесплатно!', 'gold');
      return;
    }
    const fp = price(ex.priceXP);
    if (!confirm(`Купить тему «${ex.name}» за ${fp} XP?`)) return;
    if (state.xp < fp) { showToast('💰 Недостаточно XP', 'error'); renderShop(); return; }
    state.xp -= fp;
    if (typeof window.updateXP === 'function') window.updateXP();
    state.shopOwned.themes.push(id);
    sSuccess();
  }
  state.shopActive.theme = id;
  applyTheme(id);
  saveState();
  renderShop();
  if (typeof window.updateShopBalance === 'function') window.updateShopBalance();
  showToast('🎨 Применено', 'success');
}

export function applyTheme(id) {
  document.body.classList.remove('theme-fire','theme-forest','theme-gold','theme-cosmic');
  if (id !== 'default') document.body.classList.add('theme-' + id);
}

/* ---------- Внешность Номи ---------- */

export function renderNomiLook() {
  document.querySelectorAll('#nomiLookTabs .nomi-tab').forEach(b => {
    b.onclick = () => {
      currentLookTab = b.dataset.tab;
      document.querySelectorAll('#nomiLookTabs .nomi-tab').forEach(x => {
        x.classList.remove('active');
        x.style.background = 'var(--card-bg-2)';
        x.style.color = 'var(--text-secondary)';
        x.style.border = '1.5px solid var(--border)';
      });
      b.style.background = 'var(--grad-purple)';
      b.style.color = '#fff';
      b.style.border = 'none';
      ['horns','eyes','noses','mouths'].forEach(t => {
        const p = document.getElementById('look-panel-' + t);
        if (p) p.style.display = (t === currentLookTab) ? 'block' : 'none';
      });
      renderLookGrid(currentLookTab);
    };
  });
  renderLookGrid(currentLookTab);
}

export function renderLookPreview(tab, id) {
  let inner = '';
  if (tab === 'horns') {
    const shape = HORN_SHAPES[id] || HORN_SHAPES.classic;
    const mirror = HORN_MIRROR[id] || HORN_MIRROR.classic;
    const color = HORN_COLORS[id] || '#7C3AED';
    inner = `<ellipse cx="30" cy="32" rx="14" ry="12" fill="#7C3AED" opacity="0.3"/><g transform="translate(0,0) scale(1.2)">${(shape + mirror).replace(/currentColor/g, color)}</g>`;
  } else if (tab === 'eyes') {
    const shape = EYE_SHAPES[id] || EYE_SHAPES.round;
    const color = EYE_COLORS[id] || EYE_COLORS.round;
    inner = `<g transform="translate(0,0) scale(0.9)">${shape.replace(/currentColor/g, color)}</g>`;
  } else if (tab === 'noses') {
    inner = (NOSE_SHAPES[id] || NOSE_SHAPES.small);
  } else {
    const m = SMALL_MOUTHS[id] || SMALL_MOUTHS.soft;
    inner = m.replace(/currentColor/g, '#fff');
  }
  return `<svg viewBox="0 0 60 60">${inner}</svg>`;
}

export function renderLookGrid(tab) {
  const g = document.getElementById('lookGrid-' + tab);
  if (!g) return;
  const items = NOMI_LOOK_DATA[tab] || [];
  const owned = state.nomiLookOwned?.[tab] || [];
  const active = state.nomiLookActive?.[tab];

  g.innerHTML = items.map(it => {
    const o = owned.includes(it.id);
    const a = active === it.id;
    const fp = price(it.price);
    const canAfford = isPrem() || state.xp >= fp || it.price === 0;
    return `<div class="look-item ${o ? 'owned' : ''} ${a ? 'active' : ''}" onclick="pickLook('${tab}','${it.id}')">
      <div class="look-item-preview">${renderLookPreview(tab, it.id)}</div>
      <div class="look-item-name">${it.name}</div>
      <div class="look-item-price ${o ? 'owned-price' : (canAfford ? '' : 'unaffordable')}">${o ? (a ? '✓' : 'Есть') : (isPrem() && fp < it.price ? `<s>${it.price}</s> ${fp}` : fp) + ' XP'}</div>
    </div>`;
  }).join('');
}

export function pickLook(tab, id) {
  const items = NOMI_LOOK_DATA[tab] || [];
  const it = items.find(x => x.id === id);
  if (!it) return;

  if (!state.nomiLookOwned) state.nomiLookOwned = {};
  if (!state.nomiLookActive) state.nomiLookActive = {};
  if (!state.nomiLookOwned[tab]) state.nomiLookOwned[tab] = [];

  const owned = state.nomiLookOwned[tab];
  if (!tryBuy(it, owned)) { renderLookGrid(tab); return; }

  state.nomiLookActive[tab] = id;
  saveState();
  renderLookGrid(tab);
  renderShop();
  if (typeof window.updateShopBalance === 'function') window.updateShopBalance();
  if (tab === 'mouths') setEmotion('happy', 0);
  updateNomiAvatar();
  setEmotion('excited', 1500);
  confetti(30);
  vibrate(30);
  sSuccess();
  showToast(`🎉 ${it.name}!`, 'gold');
}