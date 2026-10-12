import { renderTheoryHTML } from './render/render.js';
import allTopics from './topics/index.js';

/* ============================================================
   КОНСТАНТЫ
============================================================ */
const STORAGE_KEY = 'nomi_state_v7';
const XP_PER_HW = 20, XP_PER_TASK = 5, XP_PER_POMODORO = 15, XP_PER_TOPIC_PROBLEM = 10, XP_PER_FLASHCARD = 10;
const PREMIUM_DISCOUNT = 0.7;
const LEVELS = [
  { min: 0, max: 100, name: 'Новичок', icon: '🌱' },
  { min: 100, max: 300, name: 'Ученик', icon: '📖' },
  { min: 300, max: 700, name: 'Знаток', icon: '🎓' },
  { min: 700, max: 1500, name: 'Мастер', icon: '⚡' },
  { min: 1500, max: 3000, name: 'Гуру', icon: '🌟' },
  { min: 3000, max: Infinity, name: 'Легенда', icon: '💎' }
];
const DAYS = [{ id: 'mon', label: 'Пн' },{ id: 'tue', label: 'Вт' },{ id: 'wed', label: 'Ср' },{ id: 'thu', label: 'Чт' },{ id: 'fri', label: 'Пт' },{ id: 'sat', label: 'Сб' }];
const SUBJECTS = {
  '1-4': ['Русский язык', 'Математика', 'Чтение', 'Окружающий мир', 'Английский', 'ИЗО', 'Музыка', 'Труд', 'Физкультура'],
  '5-9': ['Русский язык', 'Литература', 'Математика', 'История', 'Обществознание', 'География', 'Биология', 'Физика', 'Химия', 'Информатика', 'Английский', 'ОБЗР', 'Музыка', 'ИЗО', 'Труд', 'Физкультура'],
  '10-11': ['Русский язык', 'Литература', 'Математика', 'История', 'Обществознание', 'География', 'Биология', 'Физика', 'Химия', 'Информатика', 'Английский', 'ОБЗР', 'Физкультура']
};
function getSubjectsForGrade(g) { if (g <= 4) return SUBJECTS['1-4']; if (g <= 9) return SUBJECTS['5-9']; return SUBJECTS['10-11']; }
const SRS_INTERVALS = [1, 3, 7, 14, 30, 60];
const LIMITS = {
  free: { topics: 30, flashCards: 50, fridgeTopics: 5, nomiAnswers: 4 },
  premium: { topics: Infinity, flashCards: Infinity, fridgeTopics: Infinity, nomiAnswers: Infinity }
};
const QUOTES = [
  { text: 'Учись так, как будто тебе предстоит жить вечно', author: 'Конфуций' },
  { text: 'Образование — самое мощное оружие', author: 'Нельсон Мандела' },
  { text: 'Успех — это сумма маленьких усилий', author: 'Роберт Кольер' },
  { text: 'Знание — сила', author: 'Фрэнсис Бэкон' },
  { text: 'Терпение и труд всё перетрут', author: 'Пословица' },
  { text: 'Дисциплина — мост между целями и достижениями', author: 'Джим Рон' },
  { text: 'Век живи — век учись', author: 'Пословица' },
  { text: 'Талант — это 1% вдохновения и 99% труда', author: 'Эдисон' },
  { text: 'Никогда не поздно стать тем, кем ты мог бы быть', author: 'Джордж Элиот' },
  { text: 'Каждый день — это шанс стать лучше', author: 'Неизвестный' },
  { text: 'Не бойся медленно идти, бойся стоять', author: 'Китайская' },
  { text: 'Сложнее всего начать', author: 'Неизвестный' },
  { text: 'Начни, чтобы стать великим', author: 'Зиг Зиглар' },
  { text: 'Маленькие шаги → большие результаты', author: 'Неизвестный' },
  { text: 'Ошибки — доказательство того, что ты пытаешься', author: 'Неизвестный' },
  { text: 'Сегодняшняя боль — завтрашняя сила', author: 'Неизвестный' },
  { text: 'Учись у вчера, живи сегодня', author: 'Эйнштейн' },
  { text: 'Если хочешь изменить мир — начни с себя', author: 'Ганди' },
  { text: 'Секрет успеха — начать', author: 'Марк Твен' },
  { text: 'Ты способен на большее', author: 'Неизвестный' }
];
const CUSTOM_COLORS = [
  { id: 'blue', primary: '#4C6FFF', accent: '#64B5F6' },
  { id: 'purple', primary: '#8B5CF6', accent: '#A78BFA' },
  { id: 'pink', primary: '#EC4899', accent: '#F472B6' },
  { id: 'red', primary: '#EF4444', accent: '#F87171' },
  { id: 'orange', primary: '#F97316', accent: '#FB923C' },
  { id: 'gold', primary: '#FBBF24', accent: '#FCD34D' },
  { id: 'green', primary: '#22C55E', accent: '#4ADE80' },
  { id: 'mint', primary: '#10B981', accent: '#6EE7B7' },
  { id: 'cyan', primary: '#06B6D4', accent: '#67E8F9' },
  { id: 'indigo', primary: '#6366F1', accent: '#818CF8' },
  { id: 'lime', primary: '#84CC16', accent: '#BEF264' },
  { id: 'rose', primary: '#F43F5E', accent: '#FB7185' }
];
const PET_SKINS = [
  { id: 'default', name: 'Классик', emoji: '🐣', price: 0, gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  { id: 'gold', name: 'Золотой', emoji: '🐥', price: 200, gradient: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
  { id: 'fire', name: 'Огненный', emoji: '🐲', price: 350, gradient: 'linear-gradient(135deg,#F97316,#DC2626)', premium: true },
  { id: 'ice', name: 'Ледяной', emoji: '🐧', price: 350, gradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)', premium: true },
  { id: 'forest', name: 'Лесной', emoji: '🦎', price: 300, gradient: 'linear-gradient(135deg,#22C55E,#16A34A)', premium: true },
  { id: 'cosmic', name: 'Космический', emoji: '👽', price: 500, gradient: 'linear-gradient(135deg,#8B5CF6,#EC4899)', premium: true },
  { id: 'pink', name: 'Розовый', emoji: '🦄', price: 300, gradient: 'linear-gradient(135deg,#EC4899,#F472B6)', premium: true },
  { id: 'shadow', name: 'Теневой', emoji: '🐉', price: 600, gradient: 'linear-gradient(135deg,#1F2937,#4C6FFF)', premium: true }
];
const SHOP_THEMES_BASE = [
  { id: 'dark', name: 'Тёмная', themeValue: 'dark', desc: 'Белый на чёрном' },
  { id: 'light', name: 'Светлая', themeValue: 'light', desc: 'Чёрный на белом' }
];
const SHOP_THEMES_EXTRA = [
  { id: 'fire', name: 'Огонь', priceXP: 180, desc: 'Красно-оранжевая' },
  { id: 'forest', name: 'Лес', priceXP: 220, desc: 'Зелёные тона' },
  { id: 'gold', name: 'Золото', priceXP: 420, desc: 'Золотые акценты' },
  { id: 'cosmic', name: 'Космос', priceXP: 650, desc: 'Фиолетово-розовая' }
];
const SHOP_AVATAR_COLORS = [
  { id: 'default', name: 'Синий', price: 0, gradient: 'linear-gradient(135deg,#4C6FFF,#6B5FFF)' },
  { id: 'purple', name: 'Фиолетовый', price: 0, gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
  { id: 'green', name: 'Зелёный', price: 120, gradient: 'linear-gradient(135deg,#22C55E,#16A34A)' },
  { id: 'pink', name: 'Розовый', price: 210, gradient: 'linear-gradient(135deg,#EC4899,#F472B6)' },
  { id: 'gold', name: 'Золотой', price: 260, gradient: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
  { id: 'red', name: 'Красный', price: 300, gradient: 'linear-gradient(135deg,#EF4444,#DC2626)' },
  { id: 'ice', name: 'Ледяной', price: 380, gradient: 'linear-gradient(135deg,#06B6D4,#3B82F6)' },
  { id: 'fire', name: 'Огненный', price: 450, gradient: 'linear-gradient(135deg,#F97316,#DC2626)' }
];
const NOMI_BODY_COLORS = {
  default: ['#4C6FFF', '#8B5CF6'],
  purple:  ['#8B5CF6', '#7C3AED'],
  green:   ['#22C55E', '#16A34A'],
  pink:    ['#EC4899', '#F472B6'],
  gold:    ['#FBBF24', '#F59E0B'],
  red:     ['#EF4444', '#DC2626'],
  ice:     ['#06B6D4', '#3B82F6'],
  fire:    ['#F97316', '#DC2626']
};
const NOMI_GRADIENT_IDS = ['nomiGradLoad','nomiGradHome','nomiProfGrad','nomiProfGradMain','petGrad','gc'];
const NOMI_SVG_PREFIXES = {
  'nomiFaceSvg': 'nomi',
  'nomiProfileSvg': 'nomiProf',
  'nomiProfileSvgMain': 'nomiProfMain',
  'petAvatarSvg': 'pet'
};
const SHOP_HATS = [
  { id: 'none', name: 'Без шляпы', price: 0, icon: '—' },
  { id: 'cap', name: 'Кепка', price: 90, icon: '🧢' },
  { id: 'party', name: 'Праздничная', price: 180, icon: '🎉' },
  { id: 'grad', name: 'Выпускник', price: 320, icon: '🎓' },
  { id: 'santa', name: 'Новогодняя', price: 400, icon: '🎅' },
  { id: 'tiara', name: 'Диадема', price: 700, icon: '💎', premium: true }
];
const SHOP_BACKGROUNDS = [
  { id: 'none', name: 'Без фона', price: 0, css: '', bodyClass: '' },
  { id: 'forest', name: 'Лес', price: 250, css: 'linear-gradient(180deg,#22C55E,#166534)', bodyClass: 'bg-forest' },
  { id: 'stars', name: 'Звёздное небо', price: 320, css: 'radial-gradient(circle at 30% 20%, #4C6FFF, #1E1B4B, #05040F)', bodyClass: 'bg-stars' },
  { id: 'sunset', name: 'Закат', price: 400, css: 'linear-gradient(180deg,#FBBF24,#EC4899,#7C3AED)', bodyClass: 'bg-sunset' },
  { id: 'ocean', name: 'Океан', price: 480, css: 'linear-gradient(180deg,#38BDF8,#0EA5E9,#0369A1)', bodyClass: 'bg-ocean' }
];

/* SVG-формы */
const HORN_SHAPES = {
  classic: '<path d="M 16 17 Q 13 8 11 6 Q 15 9 19 14 Z" fill="currentColor"/>',
  sharp: '<path d="M 14 16 L 9 3 L 20 12 Z" fill="currentColor"/>',
  ram: '<path d="M 14 15 Q 6 12 8 4 Q 12 8 16 10 Q 20 12 18 16 Z" fill="currentColor"/>',
  deer: '<path d="M 12 12 L 8 4 M 10 8 L 4 6 M 10 8 L 6 2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  rainbow: '<path d="M 16 17 Q 13 8 11 6 Q 15 9 19 14 Z" fill="currentColor"/>',
  bull: '<path d="M 14 16 Q 8 12 10 5 Q 13 9 17 11 Q 20 13 18 16 Z" fill="currentColor"/>',
  storm: '<path d="M 14 16 L 10 6 L 14 9 L 11 3 L 18 12 L 15 11 L 19 16 Z" fill="currentColor"/>',
  fire: '<path d="M 14 16 Q 10 10 13 4 Q 15 8 18 5 Q 20 10 18 15 Z" fill="currentColor"/>',
  crystal: '<path d="M 14 16 L 11 8 L 14 3 L 17 8 Z" fill="currentColor"/>',
  crown: '<path d="M 12 14 L 10 6 L 14 10 L 16 4 L 18 10 L 22 6 L 20 14 Z" fill="currentColor"/>',
  moon: '<path d="M 14 15 Q 8 12 12 5 Q 10 10 15 12 Q 18 13 14 15 Z" fill="currentColor"/>'
};
const HORN_MIRROR = {
  classic: '<path d="M 44 17 Q 47 8 49 6 Q 45 9 41 14 Z" fill="currentColor"/>',
  sharp: '<path d="M 46 16 L 51 3 L 40 12 Z" fill="currentColor"/>',
  ram: '<path d="M 46 15 Q 54 12 52 4 Q 48 8 44 10 Q 40 12 42 16 Z" fill="currentColor"/>',
  deer: '<path d="M 48 12 L 52 4 M 50 8 L 56 6 M 50 8 L 54 2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  rainbow: '<path d="M 44 17 Q 47 8 49 6 Q 45 9 41 14 Z" fill="currentColor"/>',
  bull: '<path d="M 46 16 Q 52 12 50 5 Q 47 9 43 11 Q 40 13 42 16 Z" fill="currentColor"/>',
  storm: '<path d="M 46 16 L 50 6 L 46 9 L 49 3 L 42 12 L 45 11 L 41 16 Z" fill="currentColor"/>',
  fire: '<path d="M 46 16 Q 50 10 47 4 Q 45 8 42 5 Q 40 10 42 15 Z" fill="currentColor"/>',
  crystal: '<path d="M 46 16 L 49 8 L 46 3 L 43 8 Z" fill="currentColor"/>',
  crown: '<path d="M 48 14 L 50 6 L 46 10 L 44 4 L 42 10 L 38 6 L 40 14 Z" fill="currentColor"/>',
  moon: '<path d="M 46 15 Q 52 12 48 5 Q 50 10 45 12 Q 42 13 46 15 Z" fill="currentColor"/>'
};
const HORN_COLORS = { classic:'#7C3AED', sharp:'#1F2937', ram:'#A78BFA', deer:'#78350F', rainbow:'#EC4899', bull:'#4C1D95', storm:'#FBBF24', fire:'#F97316', crystal:'#93C5FD', crown:'#FCD34D', moon:'#E5E7EB' };
const EYE_SHAPES = {
  round:    '<circle cx="22" cy="28" r="2.4" fill="currentColor"/><circle cx="38" cy="28" r="2.4" fill="currentColor"/>',
  heart:    '<path d="M 22 25 Q 19 24 19 27 Q 19 30 22 32 Q 25 30 25 27 Q 25 24 22 25 Z" fill="currentColor"/><path d="M 38 25 Q 35 24 35 27 Q 35 30 38 32 Q 41 30 41 27 Q 41 24 38 25 Z" fill="currentColor"/>',
  star:     '<path d="M 22 24 L 23.5 27.5 L 27 28 L 24.5 30.5 L 25 34 L 22 32 L 19 34 L 19.5 30.5 L 17 28 L 20.5 27.5 Z" fill="currentColor"/><path d="M 38 24 L 39.5 27.5 L 43 28 L 40.5 30.5 L 41 34 L 38 32 L 35 34 L 35.5 30.5 L 33 28 L 36.5 27.5 Z" fill="currentColor"/>',
  flame:    '<path d="M 22 23 Q 18.5 27 20.5 30.5 Q 21.5 32.5 22 31 Q 22.5 32.5 23.5 30.5 Q 25.5 27 22 23 Z" fill="currentColor"/><path d="M 38 23 Q 34.5 27 36.5 30.5 Q 37.5 32.5 38 31 Q 38.5 32.5 39.5 30.5 Q 41.5 27 38 23 Z" fill="currentColor"/>',
  drop:     '<path d="M 22 24 Q 19 28 20 30.5 Q 21 32.5 22 32.5 Q 23 32.5 24 30.5 Q 25 28 22 24 Z" fill="currentColor"/><path d="M 38 24 Q 35 28 36 30.5 Q 37 32.5 38 32.5 Q 39 32.5 40 30.5 Q 41 28 38 24 Z" fill="currentColor"/>',
  crescent: '<path d="M 24.5 25 Q 19 26 19 28.5 Q 19 31 24.5 32 Q 21 29 24.5 25 Z" fill="currentColor"/><path d="M 40.5 25 Q 35 26 35 28.5 Q 35 31 40.5 32 Q 37 29 40.5 25 Z" fill="currentColor"/>',
  shy:      '<path d="M 20 29 Q 22 26 24 29" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M 36 29 Q 38 26 40 29" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  cry:      '<circle cx="22" cy="28" r="2.4" fill="currentColor"/><circle cx="38" cy="28" r="2.4" fill="currentColor"/><path d="M 22 30 L 22 34" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round"/><path d="M 38 30 L 38 34" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round"/>',
  sly:      '<path d="M 20 28 L 24 26 L 24 30 Z" fill="currentColor"/><path d="M 40 28 L 36 26 L 36 30 Z" fill="currentColor"/>',
  diamond:  '<path d="M 22 25 L 24 28 L 22 31 L 20 28 Z" fill="currentColor"/><path d="M 38 25 L 40 28 L 38 31 L 36 28 Z" fill="currentColor"/>',
  cosmic:   '<circle cx="22" cy="28" r="2.4" fill="#8B5CF6"/><circle cx="38" cy="28" r="2.4" fill="#8B5CF6"/><circle cx="23" cy="27" r="0.8" fill="#fff"/><circle cx="39" cy="27" r="0.8" fill="#fff"/><circle cx="21" cy="29" r="0.5" fill="#FBBF24"/>'
};
const EYE_COLORS = { round:'#0A0E1A', heart:'#EC4899', star:'#FBBF24', flame:'#F97316', drop:'#60A5FA', crescent:'#E5E7EB', shy:'#A78BFA', cry:'#0A0E1A', sly:'#0A0E1A', diamond:'#93C5FD', cosmic:'#8B5CF6' };
const NOSE_SHAPES = {
  small: '<circle cx="30" cy="35" r="1.4" fill="#F9A8D4"/>',
  pig: '<ellipse cx="30" cy="35" rx="2.2" ry="1.6" fill="#F9A8D4"/><circle cx="29" cy="35" r="0.4" fill="#0A0E1A"/><circle cx="31" cy="35" r="0.4" fill="#0A0E1A"/>',
  dog: '<ellipse cx="30" cy="35" rx="1.8" ry="1.3" fill="#0A0E1A"/>',
  cat: '<path d="M 28 35 L 30 33 L 32 35 L 30 36 Z" fill="#F9A8D4"/>',
  triangle: '<path d="M 30 33 L 32 36 L 28 36 Z" fill="#F9A8D4"/>',
  heart: '<path d="M 30 34 Q 28 33 28 35 Q 28 37 30 38 Q 32 37 32 35 Q 32 33 30 34 Z" fill="#EC4899"/>',
  star: '<path d="M 30 33 L 30.6 34.7 L 32.4 34.7 L 31 35.8 L 31.5 37.5 L 30 36.5 L 28.5 37.5 L 29 35.8 L 27.6 34.7 L 29.4 34.7 Z" fill="#FBBF24"/>',
  diamond: '<path d="M 30 33 L 31.5 35 L 30 37 L 28.5 35 Z" fill="#93C5FD"/>',
  gold: '<circle cx="30" cy="35" r="1.6" fill="#FCD34D"/><circle cx="29.5" cy="34.5" r="0.5" fill="#fff"/>',
  comet: '<circle cx="30" cy="35" r="1.4" fill="#F97316"/><path d="M 28 34 L 25 33" stroke="#F97316" stroke-width="0.8"/>',
  magic: '<circle cx="30" cy="35" r="1.6" fill="#8B5CF6"/><circle cx="30" cy="35" r="0.5" fill="#FBBF24"/>'
};
const BIG_MOUTHS = {
  soft:   'M 40 68 Q 50 74 60 68',
  wide:   'M 36 66 Q 50 78 64 66',
  happy:  'M 36 66 Q 50 80 64 66',
  lick:   'M 40 68 Q 50 74 60 68 M 50 72 L 50 78',
  sly:    'M 40 70 Q 50 70 60 66',
  demon:  'M 36 68 Q 50 78 64 68 L 42 72 L 46 76',
  cat:    'M 40 68 Q 45 72 50 68 Q 55 72 60 68',
  purr:   'M 42 70 Q 50 74 58 70',
  wow:    'M 46 68 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
  love:   'M 40 68 Q 50 78 60 68 M 50 66 L 50 70',
  fang:   'M 38 68 Q 50 78 62 68 L 42 72 L 46 76 L 50 76 L 54 76 L 58 72'
};
const SMALL_MOUTHS = {
  soft:   'M 23 42 Q 30 47 37 42',
  wide:   'M 20 42 Q 30 51 40 42',
  happy:  'M 20 42 Q 30 53 40 42',
  lick:   'M 23 42 Q 30 47 37 42 M 30 46 L 30 51',
  sly:    'M 23 44 Q 30 44 37 41',
  demon:  'M 20 42 Q 30 51 40 42 L 24 46 L 27 50',
  cat:    'M 23 42 Q 26 45 30 42 Q 34 45 37 42',
  purr:   'M 25 44 Q 30 47 35 44',
  wow:    'M 27 43 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
  love:   'M 23 42 Q 30 49 37 42 M 30 40 L 30 43',
  fang:   'M 20 42 Q 30 51 40 42 L 24 46 L 27 49 L 30 49 L 33 49 L 36 46'
};
const EMOTION_TO_MOUTH = { excited:'wide', love:'love', eating:'lick', angry:'fang', sleepy:'purr' };
const NOMI_LOOK_DATA = {
  horns: [
    { id:'classic', name:'Классические', price:0 },{ id:'sharp', name:'Злые острые', price:80 },
    { id:'ram', name:'Бараньи', price:120 },{ id:'deer', name:'Оленьи', price:140 },
    { id:'rainbow', name:'Радужные', price:150 },{ id:'bull', name:'Бычьи', price:160 },
    { id:'storm', name:'Грозовые', price:240 },{ id:'fire', name:'Огненные', price:300 },
    { id:'crystal', name:'Кристальные', price:380 },{ id:'crown', name:'Королевские', price:460 },
    { id:'moon', name:'Лунные', price:550 }
  ],
  eyes: [
    { id:'round', name:'Обычные', price:0 },{ id:'heart', name:'Сердечки', price:60 },
    { id:'star', name:'Звёздочки', price:100 },{ id:'flame', name:'Пламя', price:140 },
    { id:'drop', name:'Капельки', price:160 },{ id:'crescent', name:'Полумесяцы', price:180 },
    { id:'shy', name:'Смущённые', price:200 },{ id:'cry', name:'Слезливые', price:220 },
    { id:'sly', name:'Хитрые', price:260 },{ id:'diamond', name:'Алмазные', price:340 },
    { id:'cosmic', name:'Космические', price:500 }
  ],
  noses: [
    { id:'small', name:'Обычный', price:0 },{ id:'pig', name:'Пятачок', price:50 },
    { id:'dog', name:'Собачий', price:60 },{ id:'cat', name:'Кошачий', price:70 },
    { id:'triangle', name:'Треугольный', price:90 },{ id:'heart', name:'Сердечко', price:100 },
    { id:'star', name:'Звёздочка', price:130 },{ id:'diamond', name:'Ромб', price:150 },
    { id:'gold', name:'Золотой', price:280 },{ id:'comet', name:'Комета', price:360 },
    { id:'magic', name:'Магический', price:480 }
  ],
  mouths: [
    { id:'soft', name:'Добрая', price:0 },{ id:'wide', name:'Широкая', price:40 },
    { id:'happy', name:'Счастливая', price:60 },{ id:'lick', name:'Облизывается', price:90 },
    { id:'cat', name:'Кошачья', price:110 },{ id:'sly', name:'Хитрая', price:120 },
    { id:'purr', name:'Мурчащая', price:140 },{ id:'wow', name:'Восторг', price:170 },
    { id:'demon', name:'Демонская', price:200 },{ id:'love', name:'Влюблённая', price:220 },
    { id:'fang', name:'Клыкастая', price:320 }
  ]
};

/* ============================================================
   МЕМНЫЕ ДОСТИЖЕНИЯ
============================================================ */
const RARITY = {
  common:    { name: 'Обычное',     color: '#22C55E', icon: '🟢' },
  rare:      { name: 'Редкое',      color: '#8B5CF6', icon: '🟣' },
  legendary: { name: 'Легендарное', color: '#FBBF24', icon: '🟡' }
};

const MEME_ACHIEVEMENTS = [
  { id:'m01_broken_hw', icon:'👑', name:'Поздравляю, ты её сломал', title:'Ты победил', desc:'Просрочить ДЗ, но отметить выполненным', rarity:'rare', xp:15, check: () => (state.homework||[]).some(h => h.done && h.date && h.date < todayISO()) },
  { id:'m02_sitting', icon:'🪑', name:'Сидим, не рыпаемся', title:'Сидим', desc:'Пропустить день, но сохранить streak', rarity:'rare', xp:30, check: () => (state.streak||0) >= 3 && (state.activeDays||{})[todayISO()] === undefined && state.lastCompletedDate === addDays(todayISO(), -1) },
  { id:'m03_taxi', icon:'🚕', name:'Мама, вызывай такси', title:'Такси едет', desc:'Открыть приложение после забытых дедлайнов', rarity:'common', xp:20, check: () => (state.homework||[]).filter(h => !h.done && h.date < todayISO()).length >= 3 },
  { id:'m04_veteran', icon:'🎮', name:'Я в эти игры уже играл', title:'Ветеран', desc:'Пройти квест повторно', rarity:'rare', xp:50, check: () => (state.completedQuestIds||[]).length >= 2 },
  { id:'m05_broke_task', icon:'🔨', name:'Поздравляю, ты её сломал', title:'Сломал', desc:'Решить задачу, которую не мог 3 дня', rarity:'legendary', xp:80, check: () => (state.hardProblemsSolved||0) >= 1 },
  { id:'m06_yasha', icon:'🐐', name:'Козёл по имени Яша', title:'Яша', desc:'Использовать голосовой ввод', rarity:'common', xp:25, check: () => !!state.usedVoiceInput },
  { id:'m07_shine', icon:'✨', name:'Мага, сияй', title:'Сияй', desc:'Выполнить задание без сил', rarity:'rare', xp:70, check: () => (state.lateNightTasks||0) >= 1 },
  { id:'m08_chicken', icon:'🐔', name:'Чикен Джокей', title:'Чикен Джокей', desc:'5 заданий за день', rarity:'rare', xp:60, check: () => (state.activeDays||{})[todayISO()] >= 5 },
  { id:'m09_krokodilo', icon:'🐊', name:'Бомбардиро Крокодило', title:'Крокодило', desc:'5 абсурдных карточек', rarity:'rare', xp:100, check: () => (state.flashCards||[]).filter(c => c.q && c.q.length > 40).length >= 5 },
  { id:'m10_okak', icon:'🤔', name:'Окак', title:'Окак', desc:'Открыть статистику 3 раза за день', rarity:'common', xp:40, check: () => (state.statsViewsToday||0) >= 3 },
  { id:'m11_labubu', icon:'👹', name:'Лабубу', title:'Лабубу', desc:'Купить 3 скина питомца', rarity:'rare', xp:80, check: () => (state.shopOwned?.petSkins||[]).length >= 3 },
  { id:'m12_human', icon:'🧍', name:'Мы не лошади, мы люди', title:'Человек', desc:'Решить задачу без подсказки', rarity:'rare', xp:90, check: () => (state.solvedProblemsWithoutHint||0) >= 1 },
  { id:'m13_glasses', icon:'👓', name:'Умный человек в очках', title:'Очки', desc:'30 минут Помодоро', rarity:'rare', xp:80, check: () => (state.pomodoroCount||0) >= 2 },
  { id:'m14_skebob', icon:'🎃', name:'Скебоб', title:'Скебоб', desc:'Восстановить пропущенную задачу', rarity:'common', xp:50, check: () => (state.restoredTasks||0) >= 1 },
  { id:'m15_cucumber', icon:'🥒', name:'Дикий огурец', title:'Огурец', desc:'Повторить 10 старых ошибок', rarity:'rare', xp:100, check: () => (state.reviewedMistakes||0) >= 10 },
  { id:'m16_peace', icon:'💎', name:'Смерть в нищете / Покой в роскоши', title:'Покой', desc:'Выполнить все 🔴 задания за день', rarity:'legendary', xp:200, check: () => { const high = (state.homework||[]).filter(h => h.priority === 'high'); return high.length > 0 && high.every(h => h.done); } },
  { id:'m17_kotly', icon:'⌚', name:'Тётя, а котлы?', title:'Котлы', desc:'Выполнить 🔴 задание без напоминаний', rarity:'rare', xp:100, check: () => (state.highDoneNoReminder||0) >= 1 },
  { id:'m18_67', icon:'6️⃣7️⃣', name:'Сикс-севен (6-7)', title:'6-7', desc:'Достичь streak 67 дней', rarity:'legendary', xp:670, check: () => (state.streak||0) >= 67 },
  { id:'m19_cheremsha', icon:'🦁', name:'Черемша', title:'Черемша', desc:'5 карточек про СССР', rarity:'rare', xp:150, check: () => (state.flashCards||[]).filter(c => /ссср|совет/i.test(c.q + ' ' + c.a)).length >= 5 },
  { id:'m20_stop', icon:'🚫', name:'Стоп, мне неприятно', title:'Границы', desc:'Удалить стрессовое задание', rarity:'common', xp:20, check: () => (state.deletedStressTasks||0) >= 1 },
  { id:'m21_choko', icon:'🥧', name:'Чоко и пай', title:'Мур-мур', desc:'5 карточек создано, но не использовано', rarity:'common', xp:40, check: () => (state.flashCards||[]).length >= 5 && (state.completedFlashCards||[]).length === 0 },
  { id:'m22_diddy', icon:'🧮', name:'Что этот Дидди блад...', title:'Дидди блад', desc:'Открыть приложение после перерыва', rarity:'common', xp:15, check: () => { const t = todayISO(), days = Object.keys(state.activeDays||{}); if (days.length < 2) return false; const last = days.sort().pop(); return last !== t && daysBetween(last) >= 3; } },
  { id:'m23_volgograd', icon:'🚗', name:'Папа едет в Волгоград', title:'Волгоград', desc:'Выполнить задание, отложенное на неделю', rarity:'rare', xp:70, check: () => (state.longOverdueDone||0) >= 1 },
  { id:'m24_take_phone', icon:'📞', name:'Возьми телефон, детка', title:'Возьми', desc:'Открыть после игнора', rarity:'common', xp:30, check: () => (state.ignoredAppCount||0) >= 1 },
  { id:'m25_vampire', icon:'🧛', name:'Вампир крадётся тихо', title:'Тихо-тихо', desc:'Учиться тайком', rarity:'rare', xp:50, check: () => (state.silentStudySessions||0) >= 1 },
  { id:'m26_tractor', icon:'🚜', name:'Трактор едет на ДНС', title:'Час радости', desc:'Пройти квест «Марафон ДЗ»', rarity:'rare', xp:120, check: () => (state.homework||[]).filter(h => h.done).length >= 5 },
  { id:'m27_poganets', icon:'🐯', name:'Поганец', title:'Поганец', desc:'Схитрить с заданием', rarity:'common', xp:25, check: () => (state.cheatedTasks||0) >= 1 },
  { id:'m28_musya', icon:'🐱', name:'Муся, это ты?', title:'Муся', desc:'Открыть после 3+ дней отсутствия', rarity:'common', xp:20, check: () => (state.comebackAfter3Days||0) >= 1 },
  { id:'m29_bee', icon:'🐝', name:'Шмель в башне', title:'Шмель', desc:'Помодоро в необычном месте', rarity:'rare', xp:40, check: () => (state.pomodoroUnusualPlace||0) >= 1 },
  { id:'m30_air', icon:'💨', name:'Воздухан', title:'Воздухан', desc:'Выполнить отложенное на неделю', rarity:'rare', xp:70, check: () => (state.longOverdueDone||0) >= 1 },
  { id:'m31_catness', icon:'🐈', name:'Котость', title:'Котость', desc:'Голосовой ввод 3 раза за день', rarity:'rare', xp:40, check: () => (state.voiceInputsToday||0) >= 3 },
  { id:'m32_kolbasenko', icon:'📛', name:'Данил Колбасенко', title:'Колбасенко', desc:'10 заданий за день', rarity:'rare', xp:120, check: () => (state.activeDays||{})[todayISO()] >= 10 },
  { id:'m33_burmalda', icon:'🌀', name:'Бурмалда', title:'Бурмалда', desc:'5 задач с абсурдными названиями', rarity:'rare', xp:40, check: () => (state.checklist||[]).filter(t => t.text && t.text.length > 25).length >= 5 },
  { id:'m34_2016', icon:'📼', name:'Верните мой 2016-й', title:'2016', desc:'Пересмотреть старые карточки', rarity:'common', xp:30, check: () => (state.reviewedOldCards||0) >= 1 },
  { id:'m35_fix', icon:'📹', name:'Я фиксирую, я фиксирую', title:'Фиксирую', desc:'Зафиксировать абсурдный момент', rarity:'common', xp:30, check: () => (state.absurdMoments||0) >= 1 },
  { id:'m36_mognu', icon:'💪', name:'Я тебя могну', title:'Могну', desc:'Превзойти свой рекорд', rarity:'rare', xp:45, check: () => (state.beatOwnRecord||0) >= 1 },
  { id:'m37_camin', icon:'🔥', name:'Мокну в камине в 6 утра', title:'Камин 6:00', desc:'Открыть приложение до 7 утра', rarity:'rare', xp:40, check: () => new Date().getHours() < 7 },
  { id:'m38_shield', icon:'⚡', name:'Электрощиток', title:'Электрощиток', desc:'Слушать музыку 5 минут во время учёбы', rarity:'common', xp:35, check: () => (state.musicDuringStudy||0) >= 1 },
  { id:'m39_panther', icon:'🐆', name:'Everybody, танцуй пантера', title:'Пантера', desc:'Устроить танцевальный перерыв 5 раз', rarity:'common', xp:35, check: () => (state.danceBreaks||0) >= 5 },
  { id:'m40_notebook', icon:'📓', name:'Тетрадки в клеточку, в линеечку', title:'Тетрадки', desc:'Заполнить все поля в ДЗ', rarity:'common', xp:25, check: () => (state.homework||[]).some(h => h.subject && h.desc && h.date && h.priority) },
  { id:'m41_two', icon:'2️⃣', name:'Верите, математика два, физра два', title:'Двойка', desc:'Получить 5 двоек подряд', rarity:'rare', xp:50, check: () => (state.homework||[]).filter(h => h.grade === 2).length >= 5 },
  { id:'m42_shaman', icon:'🇷🇺', name:'Песня Шамана: Россия, мама', title:'Шаман', desc:'Пропеть 3 раза в чате с Номи', rarity:'rare', xp:60, check: () => (state.shamanSung||0) >= 3 }
];
const TITLES = MEME_ACHIEVEMENTS.map(m => ({ id: m.id, name: m.title, icon: m.icon, rarity: m.rarity }));
const ACHIEVEMENTS = [
  { id: 'first_hw', name: 'Первый шаг', icon: '🌱', check: () => state.homework.filter(h => h.done).length >= 1 },
  { id: 'hw_10', name: 'Десятка', icon: '📚', check: () => state.homework.filter(h => h.done).length >= 10 },
  { id: 'hw_50', name: 'Полтинник', icon: '🏆', check: () => state.homework.filter(h => h.done).length >= 50 },
  { id: 'streak_7', name: 'Неделя силы', icon: '🔥', check: () => state.streak >= 7 },
  { id: 'streak_30', name: 'Месяц огня', icon: '💎', check: () => state.streak >= 30 },
  { id: 'lvl_5', name: 'Мастер', icon: '🎓', check: () => getLevelIndex(state.xp) >= 4 },
  { id: 'pomo_10', name: 'Помидорчик', icon: '🍅', check: () => (state.pomodoroCount||0) >= 10 },
  { id: 'topic_5', name: 'Исследователь', icon: '🔍', check: () => (state.viewedTopics||[]).length >= 5 },
  { id: 'premium', name: 'Premium!', icon: '💎', check: () => isPrem() },
  { id: 'xp_1000', name: 'Кладоискатель', icon: '🎁', check: () => state.xp >= 1000 },
  { id: 'friend_dragon', name: 'Друг дракона', icon: '🐉', check: () => state.pet?.level >= 5 },
  { id: 'flash_10', name: 'Карточный мастер', icon: '🎴', check: () => (state.completedFlashCards||[]).length >= 10 }
];

function defaultState() {
  return {
    onboarded: false, name: '', grade: 5, id: '',
    xp: 0, streak: 0, lastCompletedDate: null,
    theme: 'dark', fontSize: 'medium', customThemeColor: 'purple',
    notifications: true, sounds: true, vibration: true,
    schoolStart: '', schoolEnd: '', vacationStart: '', vacationEnd: '',
    homework: [], schedule: {}, afterSchool: {}, checklist: [], reminders: [],
    fridgeTopics: [], favoriteQuotes: [], solvedProblems: [], viewedTopics: [],
    pomodoroCount: 0, achievements: [], memeAchievements: [],
    dailyTasks: { date: null, tasks: [] },
    flashCards: [], activeDeck: 'Общее', completedFlashCards: [],
    shopOwned: { themes: ['default'], avatarColors: ['default','purple'], hats: ['none'], backgrounds: ['none'], petSkins: ['default'] },
    shopActive: { theme: 'default', avatarColor: 'purple', hat: 'none', background: 'none' },
    pet: { name: 'Номи', level: 1, xp: 0, hunger: 100, skin: 'default' },
    premium: { active: false, lifetime: false, expiresAt: null, usage: {} },
    petFeedsToday: { date: null, count: 0 },
    petPlaysToday: { date: null, count: 0 },
    petPetsToday: { date: null, count: 0 },
    chestOpenedDate: null,
    nomiLookOwned: { horns:['classic'], eyes:['round'], noses:['small'], mouths:['soft'] },
    nomiLookActive: { horns:'classic', eyes:'round', noses:'small', mouths:'soft' },
    nomiClickCount: 0, nomiLastClickTime: 0,
    activeTitle: null, usedVoiceInput: false, statsViewsToday: 0,
    hwSelected: [], taskSelected: [], activeDays: {},
    voiceInputsToday: 0, voiceInputsDate: null,
    completedQuestIds: [], solvedProblemsWithoutHint: 0, hardProblemsSolved: 0,
    lateNightTasks: 0, restoredTasks: 0, reviewedMistakes: 0, highDoneNoReminder: 0,
    longOverdueDone: 0, ignoredAppCount: 0, silentStudySessions: 0, cheatedTasks: 0,
    comebackAfter3Days: 0, pomodoroUnusualPlace: 0, reviewedOldCards: 0,
    absurdMoments: 0, beatOwnRecord: 0, musicDuringStudy: 0, danceBreaks: 0,
    deletedStressTasks: 0, shamanSung: 0
  };
}
let state = defaultState();
let currentTopicId = null, currentFilterTask = 'active', currentLookTab = 'horns';
let currentDay = 'mon', currentTopicFilter = 'all', currentTopicSearch = '';
let currentClassGroup = null, currentClass = null, currentSubject = null;
let timerState = { mode: '25/5', phase: 'work', totalSeconds: 1500, secondsLeft: 1500, running: false, intervalId: null, sessionNumber: 1 };
let onboard = { role: null, name: '', grade: null };
let audioContext = null, recognition = null, recognitionActive = false;
let nomiEmotionTimer = null, currentEmotion = 'happy';
let toastTimer = null, breathInterval = null;
let spendLock = false;

/* ============================================================
   УТИЛИТЫ
============================================================ */
function todayISO() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function addDays(iso, days) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate()+days); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function daysBetween(iso) { if (!iso) return 0; const a = new Date(iso+'T00:00:00'), b = new Date(todayISO()+'T00:00:00'); return Math.round((b-a)/86400000); }
function formatDate(iso) { if (!iso) return '—'; const d = new Date(iso+'T00:00:00'); const m = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']; const t = todayISO(), tm = addDays(t,1), y = addDays(t,-1); if (iso===t) return 'Сегодня'; if (iso===tm) return 'Завтра'; if (iso===y) return 'Вчера'; return d.getDate()+' '+m[d.getMonth()]; }
function getWeekDay() { const m = ['sun','mon','tue','wed','thu','fri','sat']; return m[new Date().getDay()]; }
function escapeHtml(s) { if (s == null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function generateId() { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let a='',b=''; for (let i=0;i<4;i++) a += c[Math.floor(Math.random()*c.length)]; for (let i=0;i<4;i++) b += c[Math.floor(Math.random()*c.length)]; return `NOMI-${a}-${b}`; }
function shortId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function getLevel(xp) { return LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[LEVELS.length-1]; }
function getLevelIndex(xp) { return LEVELS.findIndex(l => xp >= l.min && xp < l.max); }
function getGreeting() { const h = new Date().getHours(); if (h < 5) return 'Доброй ночи'; if (h < 12) return 'Доброе утро'; if (h < 17) return 'Добрый день'; if (h < 23) return 'Добрый вечер'; return 'Доброй ночи'; }
function plural(n, f) { const n10 = n%10, n100 = n%100; if (n10 === 1 && n100 !== 11) return f[0]; if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return f[1]; return f[2]; }
function isPrem() { return !!(state.premium?.active || state.premium?.lifetime); }
function price(xp) { return isPrem() ? Math.round(xp * PREMIUM_DISCOUNT) : xp; }
function logActivity() { const t = todayISO(); if (!state.activeDays) state.activeDays = {}; state.activeDays[t] = (state.activeDays[t]||0)+1; saveState(); }



/* ============================================================
   БАЗА ЗНАНИЙ — МЕСТО ДЛЯ ТЕМ
============================================================ */
const ALL_TOPICS = allTopics;

const CLASS_GROUPS = [
  { id: '1-4', name: '1–4 классы', sub: 'Начальная школа', emoji: '🎓', classes: [1,2,3,4] },
  { id: '5-6', name: '5–6 классы', sub: 'Средняя школа', emoji: '📖', classes: [5,6] },
  { id: '7-9', name: '7–9 классы', sub: 'Основная школа', emoji: '🎯', classes: [7,8,9] },
  { id: '10-11', name: '10–11 классы', sub: 'Старшая школа', emoji: '🚀', classes: [10,11] }
];
const SUBJECT_ICONS = {
  'Русский язык': '📝', 'Литературное чтение': '📖', 'Математика': '🔢', 'Окружающий мир': '🌍',
  'Английский язык': '🇬🇧', 'ИЗО': '🎨', 'Музыка': '🎵', 'Литература': '📚', 'История': '🏛️',
  'Обществознание': '👥', 'География': '🗺️', 'Биология': '🧬', 'Физика': '⚛️', 'Химия': '🧪',
  'Информатика': '💻', 'Алгебра': '🟰', 'Геометрия': '📐', 'ОБЖ': '🚨', 'Астрономия': '🔭',
  'Английский': '🇬🇧', 'Чтение': '📖', 'Труд': '🔨', 'Физкультура': '⚽', 'ОБЗР': '🚨'
};
const SUBJECTS_BY_CLASS = {
  1: ['Русский язык', 'Литературное чтение', 'Математика', 'Окружающий мир', 'Английский язык', 'ИЗО', 'Музыка'],
  2: ['Русский язык', 'Литературное чтение', 'Математика', 'Окружающий мир', 'Английский язык', 'ИЗО', 'Музыка'],
  3: ['Русский язык', 'Литературное чтение', 'Математика', 'Окружающий мир', 'Английский язык', 'ИЗО', 'Музыка'],
  4: ['Русский язык', 'Литературное чтение', 'Математика', 'Окружающий мир', 'Английский язык', 'ИЗО', 'Музыка'],
  5: ['Русский язык', 'Литература', 'Математика', 'История', 'Обществознание', 'География', 'Биология', 'Английский язык', 'ИЗО', 'Музыка'],
  6: ['Русский язык', 'Литература', 'Математика', 'История', 'Обществознание', 'География', 'Биология', 'Английский язык', 'ИЗО', 'Музыка'],
  7: ['Русский язык', 'Литература', 'Алгебра', 'Геометрия', 'История', 'Обществознание', 'География', 'Биология', 'Физика', 'Английский язык', 'Информатика'],
  8: ['Русский язык', 'Литература', 'Алгебра', 'Геометрия', 'История', 'Обществознание', 'География', 'Биология', 'Физика', 'Химия', 'Английский язык', 'Информатика', 'ОБЖ'],
  9: ['Русский язык', 'Литература', 'Алгебра', 'Геометрия', 'История', 'Обществознание', 'География', 'Биология', 'Физика', 'Химия', 'Английский язык', 'Информатика', 'ОБЖ'],
  10: ['Русский язык', 'Литература', 'Алгебра', 'Геометрия', 'История', 'Обществознание', 'География', 'Биология', 'Физика', 'Химия', 'Английский язык', 'Информатика', 'Астрономия'],
  11: ['Русский язык', 'Литература', 'Алгебра', 'Геометрия', 'История', 'Обществознание', 'География', 'Биология', 'Физика', 'Химия', 'Английский язык', 'Информатика', 'Астрономия']
};

function getAllTopics() {
  const merged = new Map();
  ALL_TOPICS.forEach(t => merged.set(t.id, t)); // новые перебивают старые по id
  return Array.from(merged.values()).map(t => ({
    id: t.id, title: t.title, subject: t.subject,
    icon: SUBJECT_ICONS[t.subject] || '📘',
    grade: t.class || 5, short: t.short || '', theory: t.theory || '',
    formulas: [], problems: (t.problems || []).map(p => ({ q: p.q, hint: p.hint || '', solution: p.answer || p.solution || '' }))
  }));
}

function isTopicLocked(id) { if (isPrem()) return false; return getAllTopics().findIndex(t => t.id === id) >= 30; }

/* ============================================================
   НАВИГАЦИЯ
============================================================ */
const NAV = [
  { id:'home', label:'Главная', icon:'🏠' },
  { id:'classGroups', label:'Темы', icon:'📚' },
  { id:'hw', label:'ДЗ', icon:'📝' },
  { id:'schedule', label:'Расписание', icon:'📅' },
  { id:'timer', label:'Таймер', icon:'⏱️' },
  { id:'checklist', label:'Чек-лист', icon:'✅' },
  { id:'stats', label:'Статистика', icon:'📊' },
  { id:'motivation', label:'Мотивация', icon:'💭' },
  { id:'shop', label:'Магазин', icon:'🛒' },
  { id:'pet', label:'Питомец', icon:'🐣' },
  { id:'flash', label:'Карточки', icon:'🎴' },
  { id:'quests', label:'Квесты', icon:'🗺' },
  { id:'profile', label:'Профиль', icon:'👤' },
  { id:'settings', label:'Настройки', icon:'⚙️' }
];
function buildNav() {
  const s = document.getElementById('sideNav'); if (s) s.innerHTML = NAV.map(it => `<button class="side-item" data-screen="${it.id}" onclick="showScreen('${it.id}')"><span>${it.icon}</span><span>${it.label}</span></button>`).join('');
  const b = document.getElementById('bottomNavInner'); if (b) b.innerHTML = NAV.map(it => `<button class="nav-item" data-screen="${it.id}" onclick="showScreen('${it.id}')"><span style="font-size:1.2rem;">${it.icon}</span><span>${it.label}</span></button>`).join('');
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id); if (el) el.classList.add('active');
  document.querySelectorAll('.side-item, .nav-item').forEach(i => i.classList.toggle('active', i.dataset.screen === id));
  const f = document.getElementById('fab'), c = document.getElementById('nomi-chat-btn');
  if (id === 'home') { if (f) f.style.display = 'flex'; if (c) c.style.display = 'flex'; }
  else { if (f) f.style.display = 'none'; if (c) c.style.display = 'none'; closeFab(); }
  window.scrollTo({top:0});
  if (id === 'home') { renderQuickActions(); renderDailyCard(); renderChest(); }
  else if (id === 'classGroups') renderClassGroups();
  else if (id === 'classSelect') renderClassList();
  else if (id === 'subjectSelect') renderSubjects();
  else if (id === 'topicList') renderTopicList();
  else if (id === 'hw') renderHw();
  else if (id === 'schedule') renderSchedule();
  else if (id === 'timer') { refreshTimerOptions(); updateTimerStats(); }
  else if (id === 'checklist') renderChecklist();
  else if (id === 'reminders') renderReminders();
  else if (id === 'stats') renderStats();
  else if (id === 'profile') renderProfile();
  else if (id === 'settings') renderSettings();
  else if (id === 'motivation') renderFavorites();
  else if (id === 'shop') { renderShop(); renderNomiLook(); }
  else if (id === 'pet') renderPet();
  else if (id === 'flash') renderFlashCards();
  else if (id === 'quests') { renderQuests(); renderSkillTree(); }
  else if (id === 'nomi') renderFridge();
}
function backFromTopic() { if (currentClass && currentSubject) showScreen('topicList'); else showScreen('classGroups'); }
function toggleFab(e) { if (e) e.stopPropagation(); const f = document.getElementById('fab'), m = document.getElementById('fab-menu'); if (!f) return; if (f.classList.contains('open')) closeFab(); else { f.classList.add('open'); if (m) m.classList.add('open'); } }
function closeFab() { const f = document.getElementById('fab'), m = document.getElementById('fab-menu'); if (f) f.classList.remove('open'); if (m) m.classList.remove('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('active'); }

/* ============================================================
   НАВИГАЦИЯ ПО КЛАССАМ
============================================================ */
function renderClassGroups() {
  const g = document.getElementById('classGroupsGrid'); if (!g) return;
  if (getAllTopics().length === 0) {
    g.innerHTML = '<div class="topics-empty" style="grid-column:1/-1;padding:60px 20px;">📭 Темы пока не добавлены<br><span style="font-size:0.8rem;color:var(--text-dim);margin-top:8px;display:block;">Скоро появятся</span></div>';
    return;
  }
  g.innerHTML = CLASS_GROUPS.map(cg => `
    <div class="class-group-card" data-group="${cg.id}" onclick="selectClassGroup('${cg.id}')">
      <span class="class-group-emoji">${cg.emoji}</span>
      <div class="class-group-name">${cg.name}</div>
      <div class="class-group-sub">${cg.sub}</div>
    </div>`).join('');
}


function selectClassGroup(id) {
  currentClassGroup = CLASS_GROUPS.find(c => c.id === id);
  if (!currentClassGroup) return;
  showScreen('classSelect');
}


function renderClassList() {
  if (!currentClassGroup) return;
  const title = document.getElementById('classSelectTitle');
  if (title) title.textContent = currentClassGroup.emoji + ' ' + currentClassGroup.name + ' — выбери класс';
  const g = document.getElementById('classListGrid');
  if (!g) return;
  g.innerHTML = currentClassGroup.classes.map(c => `
    <div class="class-list-card" onclick="selectClass(${c})">
      <div class="class-list-num">${c}</div>
      <div class="class-list-label">класс</div>
    </div>`).join('');
}


function selectClass(c) {
  currentClass = c;
  showScreen('subjectSelect');
}


function renderSubjects() {
  if (!currentClass) return;
  const subs = SUBJECTS_BY_CLASS[currentClass] || [];
  const title = document.getElementById('subjectSelectTitle');
  if (title) title.textContent = currentClass + ' класс — предметы';
  const g = document.getElementById('subjectsGrid');
  if (!g) return;
  g.innerHTML = subs.map(s => {
    const count = getAllTopics().filter(t => t.grade === currentClass && t.subject === s).length;
    return `<div class="subject-card" onclick="selectSubject('${s.replace(/'/g, "\\'")}')">
      <span class="subject-icon">${SUBJECT_ICONS[s] || '📘'}</span>
      <div class="subject-info"><div class="subject-name">${s}</div><div class="subject-count">${count} тем</div></div>
    </div>`;
  }).join('');
}

function selectSubject(s) {
  currentSubject = s;
  showScreen('topicList');
}

function renderTopicList() {
  if (!currentClass || !currentSubject) return;
  const topics = getAllTopics().filter(t => t.grade === currentClass && t.subject === currentSubject);
  const title = document.getElementById('topicListTitle');
  if (title) title.textContent = currentSubject + ' · ' + currentClass + ' класс';
  const g = document.getElementById('topicListGrid');
  if (!g) return;
  if (topics.length === 0) {
    g.innerHTML = '<div class="topics-empty">📭 Тем пока нет</div>';
    return;
  }
  g.innerHTML = topics.map(t => `
    <div class="topic-card" data-topic-id="${t.id}" onclick="openTopic('${t.id}')">
      <div class="topic-card-icon">${t.icon}</div>
      <div class="topic-card-title">${escapeHtml(t.title)}</div>
      <div class="topic-card-subject">${escapeHtml(t.subject)}</div>
      <div class="topic-card-desc">${escapeHtml(t.short || '')}</div>
      <div class="topic-card-meta"><span>✏️ ${t.problems ? t.problems.length : 0} задач</span></div>
    </div>`).join('');
}
/* ============================================================
   ДЕТАЛЬ ТЕМЫ
============================================================ */
function openTopic(id) {
  const t = getAllTopics().find(x => x.id === id); if (!t) return;
  const wasNew = !state.viewedTopics.includes(id);
  currentTopicId = id;
  if (wasNew) {
    state.viewedTopics.push(id);
    saveState();
    completeDailyTask('topic1');
  }
  document.getElementById('topicDetailTitle').textContent = t.title;
  document.getElementById('topicDetailSubject').textContent = `${t.subject} · ${t.grade} класс`;
  
  
  document.getElementById('topicTheory').innerHTML = renderTheoryHTML(t.theory);


  const fs = document.getElementById('topicFormulasSection'), fb = document.getElementById('topicFormulas');
  if (t.formulas && t.formulas.length) { fs.style.display = ''; fb.innerHTML = t.formulas.map(f => `<div class="topic-formula">${escapeHtml(f)}</div>`).join(''); } else fs.style.display = 'none';
  const ps = document.getElementById('topicProblemsSection'), pg = document.getElementById('topicProblems');
  if (t.problems && t.problems.length) {
    ps.style.display = '';
    pg.innerHTML = t.problems.map((p, i) => {
      const key = id + '#' + i;
      const solved = state.solvedProblems.includes(key);
      const safe = key.replace(/[#.]/g, '-');
      return `<div class="topic-problem ${solved?'solved':''}" data-key="${key}">
        <div class="topic-problem-num">Задача ${i+1}</div>
        <div class="topic-problem-text">${escapeHtml(p.q)}</div>
        <div class="problem-input-row">
          <input type="text" placeholder="Ответ..." onkeydown="if(event.key==='Enter'){event.preventDefault();checkProblem('${key}');}">
          <button onclick="checkProblem('${key}')">Проверить</button>
        </div>
        <div class="problem-feedback" id="fb-${safe}"></div>
        <div class="problem-actions">
          <button onclick="toggleHint('${key}')">💡 Подсказка</button>
          <button onclick="toggleSolution('${key}')">📖 Решение</button>
          ${solved ? '<button class="done-btn" disabled>✓ Решено</button>' : `<button class="done-btn" onclick="markSolved('${key}')">Отметить</button>`}
        </div>
        <div class="problem-hint" id="hint-${safe}">${escapeHtml(p.hint || '')}</div>
        <div class="problem-solution" id="sol-${safe}">${escapeHtml(p.solution || '')}</div>
      </div>`;
    }).join('');
  } else ps.style.display = 'none';
  showScreen('topicDetail');
}
function toggleHint(key) { const el = document.getElementById('hint-' + key.replace(/[#.]/g, '-')); if (el) el.classList.toggle('show'); }
function toggleSolution(key) { const el = document.getElementById('sol-' + key.replace(/[#.]/g, '-')); if (el) el.classList.toggle('show'); }
function normalizeAns(s) { return String(s || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/ё/g, 'е'); }
function checkProblem(key) {
  const card = document.querySelector(`.topic-problem[data-key="${key}"]`); if (!card) return;
  const input = card.querySelector('input');
  const fb = card.querySelector('.problem-feedback');
  const user = normalizeAns(input.value);
  if (!user) { fb.className = 'problem-feedback info show'; fb.textContent = '✏️ Напиши ответ'; return; }
  const [tid, idx] = key.split('#');
  const t = getAllTopics().find(x => x.id === tid); if (!t || !t.problems) return;
  const p = t.problems[parseInt(idx)];
  const correct = normalizeAns(p.solution || p.answer || '');
  if (user === correct || (correct.includes(user) && user.length >= 3)) {
    fb.className = 'problem-feedback correct show'; fb.textContent = `✅ Верно! +${XP_PER_TOPIC_PROBLEM} XP`;
    if (!state.solvedProblems.includes(key)) { state.solvedProblems.push(key); saveState(); addXP(XP_PER_TOPIC_PROBLEM); }
    card.classList.add('solved');
    setTimeout(() => openTopic(tid), 900);
  } else { fb.className = 'problem-feedback wrong show'; fb.textContent = '❌ Не совсем. Попробуй ещё или посмотри подсказку.'; }
}
function markSolved(key) {
  if (!state.solvedProblems.includes(key)) { state.solvedProblems.push(key); saveState(); addXP(XP_PER_TOPIC_PROBLEM); }
  showToast(`✅ +${XP_PER_TOPIC_PROBLEM} XP`, 'success'); openTopic(key.split('#')[0]);
}
function addToFridge() {
  if (!currentTopicId) return;
  if (!isPrem() && (state.fridgeTopics||[]).length >= 5) { openPremiumModal(); return; }
  if ((state.fridgeTopics||[]).some(f => f.topicId === currentTopicId)) { showToast('Уже в холодильнике', 'info'); return; }
  const t = getAllTopics().find(x => x.id === currentTopicId);
  state.fridgeTopics.push({ topicId: currentTopicId, title: t.title, nextReview: addDays(todayISO(), 1), level: 0 });
  saveState(); showToast('🧊 Добавлено', 'success');
}
function linkTopicToHw() { const t = getAllTopics().find(x => x.id === currentTopicId); if (!t) return; openHwModal(); document.getElementById('hwSubject').value = t.subject; document.getElementById('hwDesc').value = 'Тема: ' + t.title; }
function renderFridge() {
  const l = document.getElementById('fridgeList'); if (!l) return;
  const items = state.fridgeTopics || [];
  if (items.length === 0) { l.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim);">🧊 Холодильник пуст</div>'; return; }
  l.innerHTML = items.map((f, i) => `<div class="card" style="margin-bottom:8px;display:flex;align-items:center;gap:12px;"><span style="font-size:1.3rem;">🧊</span><div style="flex:1;"><div style="font-weight:700;">${escapeHtml(f.title)}</div><div style="font-size:0.72rem;color:var(--text-dim);">Следующее: ${formatDate(f.nextReview)}</div></div><button class="btn btn-xs" onclick="reviewFridge(${i})">Повторить</button></div>`).join('');
}
function reviewFridge(i) { const f = state.fridgeTopics[i]; if (!f) return; f.level = Math.min((f.level||0)+1, SRS_INTERVALS.length-1); f.nextReview = addDays(todayISO(), SRS_INTERVALS[f.level]); saveState(); renderFridge(); addXP(5); showToast('🧊 +5 XP', 'success'); }

/* ============================================================
   TOAST / XP / CONFETTI
============================================================ */
function showToast(msg, type = 'info') {
  const ex = document.querySelector('.toast'); if (ex) ex.remove();
  if (toastTimer) clearTimeout(toastTimer);
  const el = document.createElement('div'); el.className = `toast toast-${type}`; el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  toastTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2800);
}
function showUndo(msg, undoFn) {
  let el = document.querySelector('.undo-toast'); if (el) el.remove();
  el = document.createElement('div'); el.className = 'undo-toast';
  el.innerHTML = `<span>${escapeHtml(msg)}</span><button>Отменить</button>`;
  el.querySelector('button').onclick = () => { undoFn(); el.classList.remove('show'); setTimeout(() => el.remove(), 300); };
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { if (el.parentNode) { el.classList.remove('show'); setTimeout(() => el.remove(), 300); } }, 5000);
}
function xpFloat(a) { const el = document.createElement('div'); el.className = 'xp-float'; el.textContent = '+' + a + ' XP'; el.style.left = (window.innerWidth/2-30)+'px'; el.style.top = (window.innerHeight/2)+'px'; document.body.appendChild(el); setTimeout(() => el.remove(), 1600); }
function xpSpend(a) { const el = document.createElement('div'); el.className = 'xp-spend'; el.textContent = '−' + a + ' XP'; el.style.left = (window.innerWidth/2-30)+'px'; el.style.top = (window.innerHeight/2)+'px'; document.body.appendChild(el); setTimeout(() => el.remove(), 1600); }
function confetti(count = 60, gold = false, crowns = false) {
  const c = document.getElementById('confetti-container'); if (!c) return;
  const colors = ['#8B5CF6','#7C3AED','#22C55E','#FBBF24','#EC4899','#06B6D4'];
  const crownPieces = ['💎','✨','⭐','💫','🌟','👑'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece' + (gold?' gold':'') + (crowns?' crown':'');
    if (crowns) { p.textContent = crownPieces[Math.floor(Math.random()*crownPieces.length)]; p.style.fontSize = (12+Math.random()*16)+'px'; p.style.width='auto'; p.style.height='auto'; }
    else if (!gold) p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.left = Math.random()*100 + '%';
    p.style.animationDelay = (Math.random()*0.5)+'s';
    p.style.animationDuration = (2+Math.random()*1.5)+'s';
    if (!crowns) { p.style.width = (6+Math.random()*8)+'px'; p.style.height = (6+Math.random()*8)+'px'; if (Math.random()>0.5) p.style.borderRadius='50%'; }
    c.appendChild(p); setTimeout(() => p.remove(), 4000);
  }
}
function fireworks(count = 3) {
  let c = document.querySelector('.fireworks-container');
  if (!c) { c = document.createElement('div'); c.className='fireworks-container'; document.body.appendChild(c); }
  const colors = ['#FBBF24','#EC4899','#8B5CF6','#22C55E','#7C3AED','#F97316'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const cx = window.innerWidth*(0.2+Math.random()*0.6), cy = window.innerHeight*(0.2+Math.random()*0.4);
      const col = colors[Math.floor(Math.random()*colors.length)];
      for (let j = 0; j < 30; j++) {
        const p = document.createElement('div'); p.className='firework-particle';
        p.style.left = cx+'px'; p.style.top = cy+'px'; p.style.background = col; p.style.boxShadow = `0 0 8px ${col}`;
        const a = (Math.PI*2*j)/30, d = 80+Math.random()*120;
        p.style.setProperty('--tx',(Math.cos(a)*d)+'px'); p.style.setProperty('--ty',(Math.sin(a)*d)+'px');
        c.appendChild(p); setTimeout(() => p.remove(), 1300);
      }
    }, i*250);
  }
}
function initParticles() {
  const box = document.getElementById('premiumParticles'); if (!box) return; box.innerHTML = '';
  const s = ['✨','⭐','💎','💫','🌟','💠','👑'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div'); p.className = 'premium-particle';
    p.textContent = s[Math.floor(Math.random()*s.length)];
    p.style.left = Math.random()*100+'%'; p.style.animationDuration = (12+Math.random()*18)+'s';
    p.style.animationDelay = (Math.random()*15)+'s'; p.style.fontSize = (10+Math.random()*14)+'px';
    box.appendChild(p);
  }
}
function vibrate(ms) { if (state.vibration && navigator.vibrate) { try { navigator.vibrate(ms); } catch(e){} } }
function audioCtx() { if (!audioContext) { try { audioContext = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){} } if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(()=>{}); return audioContext; }
function playTone(f, d, type='sine', v=0.15) {
  if (!state.sounds) return;
  const ctx = audioCtx(); if (!ctx) return;
  try { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, ctx.currentTime); g.gain.setValueAtTime(v, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+d); o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime); o.stop(ctx.currentTime+d); } catch(e){}
}
function sSuccess() { playTone(523,0.12); setTimeout(()=>playTone(659,0.12),80); setTimeout(()=>playTone(784,0.18),160); }
function sLevelUp() { playTone(523,0.1); setTimeout(()=>playTone(659,0.1),100); setTimeout(()=>playTone(784,0.1),200); setTimeout(()=>playTone(1046,0.3),300); }
function sStreak() { playTone(392,0.15); setTimeout(()=>playTone(523,0.15),120); setTimeout(()=>playTone(659,0.25),240); }
function sFanfare() { playTone(523,0.15); setTimeout(()=>playTone(659,0.15),150); setTimeout(()=>playTone(784,0.15),300); setTimeout(()=>playTone(1046,0.4),450); }

function addXP(a) {
  if (!a || a <= 0) return;
  const oldIdx = getLevelIndex(state.xp); state.xp += a; const newIdx = getLevelIndex(state.xp);
  updateXP(); updateTopbar(); updateShopBalance(); xpFloat(a);
  if (newIdx > oldIdx) {
    setTimeout(() => { sLevelUp(); fireworks(4); confetti(80,true); if (isPrem()) confetti(30,false,true); showToast(`🎉 Уровень: ${LEVELS[newIdx].name}!`, 'success'); setEmotion('excited', 3000); }, 300);
  }
  saveState();
}
function spendXP(a) {
  if (spendLock) return false;
  if (state.xp < a) {
    showToast('💰 Недостаточно XP', 'error');
    vibrate(100);
    return false;
  }
  spendLock = true;
  state.xp -= a;
  updateXP(); updateTopbar(); updateShopBalance();
  xpSpend(a);
  saveState();
  setTimeout(() => showToast(`💰 −${a} XP`, 'warning'), 350);
  setTimeout(() => { spendLock = false; }, 300);
  return true;
}
function updateShopBalance() {
  const b = document.getElementById('shopBalance'); if (b) b.textContent = state.xp;
  const h = document.getElementById('homeXpValue'); if (h) h.textContent = state.xp;
  const t = document.getElementById('topbarXpValue'); if (t) t.textContent = state.xp;
  const p = document.getElementById('profileXpValue'); if (p) p.textContent = state.xp;
}
function updateXP() {
  updateShopBalance();
  const lvl = getLevel(state.xp), lvlIdx = getLevelIndex(state.xp);
  const le = document.getElementById('homeLevelValue'); if (le) le.textContent = lvlIdx + 1;
  const fill = document.getElementById('levelProgressFill'), pct = document.getElementById('levelProgressPercent'), lbl = document.getElementById('levelProgressLabel');
  if (fill && pct && lbl) {
    if (lvl.max === Infinity) { fill.style.width = '100%'; pct.textContent = 'MAX'; lbl.textContent = 'Максимум'; }
    else { const r = lvl.max - lvl.min, c = state.xp - lvl.min, p = Math.round((c/r)*100); fill.style.width = p+'%'; pct.textContent = p+'%'; lbl.textContent = `${c} / ${r} XP`; }
  }
}
function updateStreak() {
  const today = todayISO(); if (state.lastCompletedDate === today) return;
  if (state.lastCompletedDate === addDays(today,-1)) state.streak = (state.streak||0)+1; else state.streak = 1;
  state.lastCompletedDate = today; sStreak(); saveState(); updateTopbar();
  const el = document.getElementById('homeStreakValue'); if (el) el.textContent = state.streak;
}
function updateClock() {
  const n = new Date();
  const hh = String(n.getHours()).padStart(2,'0'), mm = String(n.getMinutes()).padStart(2,'0');
  const t = document.getElementById('clockTime'); const d = document.getElementById('clockDate');
  if (t) { t.textContent = hh+':'+mm; }
  if (d) { const days=['вс','пн','вт','ср','чт','пт','сб'], months=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']; d.textContent = `${days[n.getDay()]}, ${n.getDate()} ${months[n.getMonth()]}`; }
}
function updateGreeting() {
  const g = document.getElementById('greetingText'), s = document.getElementById('greetingSub'); if (!g) return;
  const name = state.name || 'друг';
  g.innerHTML = `${getGreeting()}, ${isPrem() ? '<span class="rainbow-text">'+escapeHtml(name)+'</span>' : escapeHtml(name)}!`;
  if (s) { const h = new Date().getHours(); s.textContent = h < 12 ? 'Начни день с одного шага' : h < 18 ? 'Отличное время для учёбы' : h < 23 ? 'Подведём итоги?' : 'Пора отдохнуть 😴'; }
}
function updateTopbar() {
  const s = document.getElementById('topbarStreakValue'); if (s) s.textContent = state.streak || 0;
  const x = document.getElementById('topbarXpValue'); if (x) x.textContent = state.xp || 0;
  const n = document.getElementById('topbarName'); if (n) n.innerHTML = isPrem() ? `<span class="rainbow-text">${escapeHtml(state.name||'Ученик')}</span>` : escapeHtml(state.name||'Ученик');
  const a = document.getElementById('topbarAvatar'); if (a) a.textContent = (state.name||'Я').charAt(0).toUpperCase();
  const p = document.getElementById('topbarPremium'); if (p) p.style.display = isPrem() ? 'flex' : 'none';
  const t = document.getElementById('topbarTitle');
  if (t) {
    const title = TITLES.find(x => x.name === state.activeTitle);
    if (title) { const r = RARITY[title.rarity] || RARITY.common; t.innerHTML = `<span style="color:${r.color};">${title.icon} ${escapeHtml(title.name)}</span>`; }
    else t.textContent = state.activeTitle || '';
  }
  const pb = document.getElementById('premiumBanner'); if (pb) pb.style.display = isPrem() ? 'none' : 'flex';
  const c = document.getElementById('chestCard'); if (c) c.style.display = isPrem() ? 'flex' : 'none';
  const sb = document.getElementById('shopPremiumBanner'); if (sb) sb.style.display = isPrem() ? 'none' : 'flex';
  const sa = document.getElementById('shopPremiumActive'); if (sa) sa.style.display = isPrem() ? 'block' : 'none';
  const ppb = document.getElementById('profilePremiumBlock'); if (ppb) ppb.style.display = isPrem() ? 'none' : 'block';
}

/* ============================================================
   ЭМОЦИИ И ВНЕШНОСТЬ
============================================================ */
function setEmotion(emotion, duration = 1500) {
  const a = document.getElementById('nomiAvatar'); if (!a) return;
  a.classList.remove('emoji-happy','emoji-excited','emoji-love','emoji-eating','emoji-angry','emoji-sleepy');
  if (nomiEmotionTimer) clearTimeout(nomiEmotionTimer);
  a.classList.add('emoji-' + emotion);
  currentEmotion = emotion;
  applyEmotionAll();
  if (duration > 0) nomiEmotionTimer = setTimeout(() => setEmotion('happy', 0), duration);
}
function applyEmotionAll() {
  const useSelectedMouth = (currentEmotion === 'happy');
  const selectedMouthId = state.nomiLookActive?.mouths || 'soft';
  const mouthId = useSelectedMouth ? selectedMouthId : (EMOTION_TO_MOUTH[currentEmotion] || selectedMouthId);
  document.querySelectorAll('#nomiMouth, #nomiProfMouth, #nomiProfMainMouth, #petMouth').forEach(el => {
    const svg = el.closest('svg');
    const isBig = svg && svg.getAttribute('viewBox') === '0 0 100 100';
    const color = isBig ? '#0A0E1A' : '#fff';
    const shapes = isBig ? BIG_MOUTHS : SMALL_MOUTHS;
    el.setAttribute('d', shapes[mouthId] || shapes.soft);
    el.setAttribute('stroke', color);
  });
}
function renderLookSvg(svgId, prefix) {
  const svg = document.getElementById(svgId); if (!svg) return;
  const a = state.nomiLookActive || {};
  const hornG = svg.querySelector('#' + prefix + 'HornsGroup');
  if (hornG) {
    const shape = HORN_SHAPES[a.horns] || HORN_SHAPES.classic;
    const mirror = HORN_MIRROR[a.horns] || HORN_MIRROR.classic;
    const color = HORN_COLORS[a.horns] || HORN_COLORS.classic;
    hornG.innerHTML = (shape + mirror).replace(/currentColor/g, color);
  }
  const pupilG = svg.querySelector('#' + prefix + 'PupilsGroup');
  if (pupilG) {
    const shape = EYE_SHAPES[a.eyes] || EYE_SHAPES.round;
    const color = EYE_COLORS[a.eyes] || EYE_COLORS.round;
    pupilG.innerHTML = shape.replace(/currentColor/g, color);
  }
  const noseG = svg.querySelector('#' + prefix + 'NoseGroup');
  if (noseG) {
    noseG.innerHTML = NOSE_SHAPES[a.noses] || NOSE_SHAPES.small;
  }
}
function updateNomiAvatar() {
  const colorId = state.shopActive?.avatarColor || 'purple';
  const pair = NOMI_BODY_COLORS[colorId] || NOMI_BODY_COLORS.purple;
  NOMI_GRADIENT_IDS.forEach(gid => {
    const grad = document.getElementById(gid);
    if (!grad) return;
    const stops = grad.querySelectorAll('stop');
    if (stops[0]) stops[0].setAttribute('stop-color', pair[0]);
    if (stops[1]) stops[1].setAttribute('stop-color', pair[1]);
  });
  Object.entries(NOMI_SVG_PREFIXES).forEach(([svgId, prefix]) => {
    renderLookSvg(svgId, prefix);
  });
  const a = document.getElementById('nomiAvatar');
  if (a) {
    const svg = a.querySelector('svg');
    if (svg) {
      const lvlIdx = getLevelIndex(state.xp);
      svg.style.transform = `scale(${1 + Math.min(lvlIdx, 5) * 0.06})`;
    }
    const fire = document.getElementById('avatarFire');
    if (fire) fire.style.display = state.streak >= 3 ? 'block' : 'none';
  }
  applyEmotionAll();
  updateHats();
  updateBodyBackground();
}
function updateHats() {
  const hat = state.shopActive?.hat || 'none';
  const hatEmojis = { cap:'🧢', party:'🎉', grad:'🎓', santa:'🎅', tiara:'💎', none:'' };
  const emoji = hatEmojis[hat] || '';
  const showHat = !!emoji;
  const premiumCrown = isPrem() && !showHat;
  document.querySelectorAll('.avatar-crown').forEach(c => {
    c.style.display = premiumCrown ? 'block' : 'none';
  });
  ['avatarHatSvg','profileHatSvg','mainHatSvg','petHatSvg'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    if (showHat) { el.textContent = emoji; el.style.display = 'flex'; }
    else { el.textContent = ''; el.style.display = 'none'; }
  });
}
function updateBodyBackground() {
  const bgs = ['bg-forest','bg-stars','bg-sunset','bg-ocean'];
  document.body.classList.remove(...bgs);
  const bgId = state.shopActive?.background;
  const bg = SHOP_BACKGROUNDS.find(b => b.id === bgId);
  if (bg && bg.bodyClass) document.body.classList.add(bg.bodyClass);
}
function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e){} }
function loadState() { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) state = deepMerge(defaultState(), JSON.parse(raw)); else state = defaultState(); } catch(e) { state = defaultState(); } }
function deepMerge(t, s) {
  if (typeof t !== 'object' || t === null) return s;
  if (typeof s !== 'object' || s === null) return t;
  if (Array.isArray(t) || Array.isArray(s)) return s;
  const r = { ...t };
  for (const k in s) { if (s.hasOwnProperty(k)) { if (typeof s[k]==='object' && s[k]!==null && !Array.isArray(s[k])) r[k] = deepMerge(t[k]||{}, s[k]); else r[k] = s[k]; } }
  return r;
}

/* ============================================================
   ГЛАВНАЯ, ЕЖЕДНЕВКИ, СУНДУК
============================================================ */
function renderQuickActions() {
  const g = document.getElementById('quickActionsGrid'); if (!g) return;
  const ph = state.homework.filter(h => !h.done).length, pt = (state.checklist||[]).filter(t => !t.done).length;
  const actions = [
    { icon:'📝', label:'ДЗ', screen:'hw', sub: ph + '' },
    { icon:'📅', label:'Расписание', screen:'schedule', sub: '—' },
    { icon:'⏱️', label:'Таймер', screen:'timer', sub: '25/5' },
    { icon:'📚', label:'Темы', screen:'classGroups', sub: '—' },
    { icon:'✅', label:'Задачи', screen:'checklist', sub: pt + '' },
    { icon:'📊', label:'Статистика', screen:'stats', sub: '—' },
    { icon:'💭', label:'Мотивация', screen:'motivation', sub: '—' },
    { icon:'🛒', label:'Магазин', screen:'shop', sub: '—' },
    { icon:'🐣', label:'Питомец', screen:'pet', sub: 'Ур.' + (state.pet?.level||1) },
    { icon:'🎴', label:'Карточки', screen:'flash', sub: (state.flashCards||[]).length + '' },
    { icon:'🗺', label:'Квесты', screen:'quests', sub: '—' },
    { icon:'👤', label:'Профиль', screen:'profile', sub: '—' }
  ];
  g.innerHTML = actions.map(a => `<button class="card pointer" onclick="showScreen('${a.screen}')" style="text-align:left;padding:12px;"><div style="font-size:1.5rem;margin-bottom:4px;">${a.icon}</div><div style="font-weight:700;font-size:0.8rem;">${a.label}</div><div style="font-size:0.65rem;color:var(--text-secondary);margin-top:2px;">${a.sub}</div></button>`).join('');
}
function updateHomeQuickCounts() { const el = document.getElementById('homeHwDoneValue'); if (el) el.textContent = state.homework.filter(h => h.done).length; }
function renderDailyCard() {
  const b = document.getElementById('dailyCard'); if (!b) return;
  if (!isPrem()) { b.innerHTML = ''; return; }
  const today = todayISO();
  if (!state.dailyTasks || state.dailyTasks.date !== today) {
    state.dailyTasks = { date: today, tasks: [
      { id:'hw1',    text:'Сделать 1 ДЗ',     done:false, xp:10, icon:'📝', source:'Отметь ДЗ выполненным' },
      { id:'topic1', text:'Открыть 1 тему',   done:false, xp:5,  icon:'📖', source:'Заходи в любую тему' },
      { id:'pomo1',  text:'Таймер 25 мин',    done:false, xp:15, icon:'⏱️', source:'Дослушай Помодоро' },
      { id:'task1',  text:'Закрыть 1 задачу', done:false, xp:5,  icon:'✅', source:'Отметь задачу в чек-листе' }
    ]};
    saveState();
  }
  b.innerHTML = `<div class="card" style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(124,58,237,0.1));border:1.5px solid var(--purple);margin-bottom:14px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <div style="font-size:0.82rem;font-weight:800;color:var(--purple);text-transform:uppercase;">📅 Ежедневные</div>
      <div style="font-size:0.72rem;color:var(--text-dim);font-weight:700;">${state.dailyTasks.tasks.filter(t=>t.done).length} / ${state.dailyTasks.tasks.length}</div>
    </div>
    ${state.dailyTasks.tasks.map(t => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;font-size:0.88rem;">
        <div style="width:24px;height:24px;border-radius:50%;border:2px solid ${t.done?'var(--success)':'var(--border)'};background:${t.done?'var(--success)':'transparent'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;transition:all 0.3s;">${t.done?'✓':t.icon}</div>
        <div style="flex:1;${t.done?'text-decoration:line-through;opacity:0.6;':''}">
          <div>${t.text}</div>
          ${!t.done && t.source ? `<div style="font-size:0.7rem;color:var(--text-dim);margin-top:2px;">${t.source}</div>` : ''}
        </div>
        <div style="font-size:0.72rem;font-weight:800;color:${t.done?'var(--success)':'var(--warning)'};">${t.done?'✓ +'+t.xp:'+'+t.xp} XP</div>
      </div>
    `).join('')}
  </div>`;
}
function completeDailyTask(taskId) {
  if (!isPrem()) return;
  const today = todayISO();
  if (!state.dailyTasks || state.dailyTasks.date !== today) return;
  const t = state.dailyTasks.tasks.find(x => x.id === taskId);
  if (!t || t.done) return;
  t.done = true;
  addXP(t.xp);
  sSuccess();
  showToast(`✅ ${t.text} · +${t.xp} XP`, 'success');
  saveState();
  renderDailyCard();
  checkAchievements();
}
function renderChest() {
  const c = document.getElementById('chestCard'); if (!c) return;
  const today = todayISO(), o = state.chestOpenedDate === today;
  const ci = document.getElementById('chestIcon'); if (ci) ci.textContent = o ? '📭' : '🎁';
  const ct = document.getElementById('chestTitle'); if (ct) ct.textContent = o ? 'Открыт' : 'Сундук';
  const cd = document.getElementById('chestDesc'); if (cd) cd.textContent = o ? 'Завтра!' : 'Открой!';
}
function openDailyChest() {
  if (!isPrem()) { openPremiumModal(); return; }
  const today = todayISO(); if (state.chestOpenedDate === today) { showToast('📭 Уже', 'info'); return; }
  state.chestOpenedDate = today;
  const r = [30,50,100][Math.floor(Math.random()*3)];
  addXP(r); confetti(50, true, true); saveState(); renderChest(); sFanfare();
  showToast(`🎁 +${r} XP!`, 'gold');
}

/* ============================================================
   ДЗ
============================================================ */
let hwPriority = 'medium';
function openHwModal() {
  document.getElementById('hwModal').classList.add('active');
  fillSubjects('hwSubject');
  const d = document.getElementById('hwDate'); if (d) d.value = todayISO();
  document.getElementById('hwDesc').value = ''; document.getElementById('hwGrade').value = '';
  hwPriority = 'medium';
  document.querySelectorAll('#hwPriority button').forEach(b => b.classList.toggle('active', b.dataset.p === hwPriority));
}
function setHwPriority(p) { hwPriority = p; document.querySelectorAll('#hwPriority button').forEach(b => b.classList.toggle('active', b.dataset.p === p)); }
function fillSubjects(sel) { const s = document.getElementById(sel); if (!s) return; const subs = getSubjectsForGrade(state.grade || 5); s.innerHTML = subs.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join(''); }
function saveHw() {
  const subject = document.getElementById('hwSubject').value;
  const desc = document.getElementById('hwDesc').value.trim();
  const date = document.getElementById('hwDate').value || todayISO();
  const grade = parseInt(document.getElementById('hwGrade').value) || null;
  if (!desc) { showToast('Введите описание', 'error'); return; }
  state.homework.push({ id: shortId(), subject, desc, date, priority: hwPriority, grade, done: !!grade, createdAt: Date.now() });
  saveState(); closeModal('hwModal'); renderHw(); updateHomeQuickCounts();
  sSuccess(); showToast('✅ ДЗ добавлено', 'success'); checkAchievements();
}
function renderHw() {
  const l = document.getElementById('hwList'); if (!l) return;
  const empty = document.getElementById('hwEmpty'), counter = document.getElementById('hwCounter');
  const search = (document.getElementById('hwSearch')?.value || '').toLowerCase();
  const sort = document.getElementById('hwSort')?.value || 'date';
  let items = [...state.homework];
  if (search) items = items.filter(h => h.subject.toLowerCase().includes(search) || h.desc.toLowerCase().includes(search));
  if (sort === 'date') items.sort((a,b) => (a.date||'').localeCompare(b.date||''));
  else if (sort === 'priority') { const o = {high:0,medium:1,low:2}; items.sort((a,b) => o[a.priority]-o[b.priority]); }
  else if (sort === 'subject') items.sort((a,b) => a.subject.localeCompare(b.subject));
  items.sort((a,b) => (a.done?1:0)-(b.done?1:0));
  counter.textContent = state.homework.filter(h => !h.done).length;
  if (items.length === 0) { l.innerHTML = ''; if (empty) empty.style.display = 'block'; updateHwBulkBar(); return; }
  if (empty) empty.style.display = 'none';
  l.innerHTML = items.map(h => {
    const pi = h.priority === 'high' ? '🔴' : h.priority === 'medium' ? '🟡' : '🟢';
    const gb = h.grade ? `<span style="margin-left:8px;padding:2px 10px;border-radius:8px;background:${h.grade>=4?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'};color:${h.grade>=4?'var(--success)':'var(--danger)'};font-weight:800;font-size:0.75rem;">${h.grade}</span>` : '';
    const sel = (state.hwSelected||[]).includes(h.id);
    return `<div class="hw-card priority-${h.priority} ${h.done?'done':''} ${sel?'selected':''}" onclick="toggleHwSelect('${h.id}', event)">
      <span class="hw-subject">${escapeHtml(h.subject)}</span>
      <div class="hw-title">${pi} ${escapeHtml(h.desc)}${gb}</div>
      <div class="hw-meta"><span>📅 ${formatDate(h.date)}</span></div>
      <div class="hw-actions">
        ${h.done ? '<button class="btn-done" disabled>✓ Выполнено</button>' : `<button class="btn-done" onclick="event.stopPropagation(); toggleHwDone('${h.id}')">✓ Отметить</button>`}
        <button onclick="event.stopPropagation(); deleteHw('${h.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
  updateHwBulkBar();
  renderAvgGrades();
}
function renderAvgGrades() {
  const block = document.getElementById('avgGradesBlock'); if (!block) return;
  if (!isPrem()) { block.style.display = 'none'; return; }
  block.style.display = 'block';
  const bySubj = {};
  state.homework.forEach(h => { if (h.grade) { if (!bySubj[h.subject]) bySubj[h.subject] = []; bySubj[h.subject].push(h.grade); } });
  if (Object.keys(bySubj).length === 0) { block.innerHTML = '<div class="stats-block"><div class="stats-block-title">📊 Средний балл</div><div class="stats-empty">Нет оценок</div></div>'; return; }
  block.innerHTML = '<div class="stats-block"><div class="stats-block-title">📊 Средний балл</div>' + Object.entries(bySubj).map(([s, g]) => {
    const avg = (g.reduce((a,b) => a+b, 0) / g.length).toFixed(1);
    const col = avg >= 4.5 ? 'var(--success)' : avg >= 3.5 ? 'var(--purple)' : 'var(--warning)';
    return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-soft);"><span>${escapeHtml(s)}</span><span style="font-weight:800;color:${col};">${avg}</span></div>`;
  }).join('') + '</div>';
}
function toggleHwSelect(id, e) {
  if (e && e.target && e.target.closest('button')) return;
  if (!state.hwSelected) state.hwSelected = [];
  const i = state.hwSelected.indexOf(id);
  if (i >= 0) state.hwSelected.splice(i, 1); else state.hwSelected.push(id);
  saveState(); renderHw();
}
function toggleHwDone(id) {
  const h = state.homework.find(x => x.id === id); if (!h) return;
  h.done = !h.done;
  if (h.done) {
    addXP(XP_PER_HW); updateStreak(); sSuccess();
    showToast(`✅ +${XP_PER_HW} XP`, 'success');
    setEmotion('excited', 1200); logActivity();
    completeDailyTask('hw1');
  }
  else { state.xp = Math.max(0, state.xp - XP_PER_HW); updateXP(); }
  saveState(); renderHw(); updateHomeQuickCounts(); checkAchievements();
}
function deleteHw(id) {
  const i = state.homework.findIndex(x => x.id === id); if (i < 0) return;
  const r = state.homework.splice(i, 1)[0]; saveState(); renderHw();
  showUndo('🗑 ДЗ удалено', () => { state.homework.splice(i, 0, r); saveState(); renderHw(); });
}
function updateHwBulkBar() { const b = document.getElementById('hwBulkBar'), c = document.getElementById('hwSelectedCount'); if (!b) return; const n = (state.hwSelected||[]).length; if (n > 0) { b.classList.remove('hidden-bar'); c.textContent = `Выбрано: ${n}`; } else b.classList.add('hidden-bar'); }
function bulkDeleteHw() {
  if (!state.hwSelected || state.hwSelected.length === 0) return;
  const r = state.homework.filter(h => state.hwSelected.includes(h.id));
  state.homework = state.homework.filter(h => !state.hwSelected.includes(h.id));
  state.hwSelected = []; saveState(); renderHw();
  showUndo(`🗑 Удалено: ${r.length}`, () => { state.homework.push(...r); saveState(); renderHw(); });
}
function bulkDoneHw() {
  if (!state.hwSelected || state.hwSelected.length === 0) return;
  let doneAny = false;
  state.hwSelected.forEach(id => {
    const h = state.homework.find(x => x.id === id);
    if (h && !h.done) { h.done = true; addXP(XP_PER_HW); logActivity(); doneAny = true; }
  });
  if (doneAny) completeDailyTask('hw1');
  updateStreak(); state.hwSelected = []; saveState(); renderHw(); sSuccess();
}
function clearHwSelection() { state.hwSelected = []; saveState(); renderHw(); }

/* ============================================================
   ЧЕК-ЛИСТ
============================================================ */
function addTask() {
  const inp = document.getElementById('taskInput'); if (!inp) return;
  const text = inp.value.trim();
  const date = document.getElementById('taskDate')?.value || todayISO();
  const time = document.getElementById('taskTime')?.value || '';
  const repeat = document.getElementById('taskRepeat')?.value || 'none';
  if (!text) { showToast('Введите задачу', 'error'); return; }
  if (!Array.isArray(state.checklist)) state.checklist = [];
  state.checklist.push({ id: shortId(), text, date, time, repeat, done: false, createdAt: Date.now() });
  inp.value = ''; saveState(); renderChecklist(); updateHomeQuickCounts(); showToast('✅ Добавлено', 'success'); checkAchievements();
}
function renderChecklist() {
  const l = document.getElementById('taskList'), e = document.getElementById('taskEmpty'), c = document.getElementById('taskCounter'); if (!l) return;
  const today = todayISO(), tmr = addDays(today, 1);
  let items = Array.isArray(state.checklist) ? [...state.checklist] : [];
  if (currentFilterTask === 'active') items = items.filter(t => !t.done);
  else if (currentFilterTask === 'today') items = items.filter(t => t.date === today);
  else if (currentFilterTask === 'tomorrow') items = items.filter(t => t.date === tmr);
  else if (currentFilterTask === 'overdue') items = items.filter(t => !t.done && t.date && t.date < today);
  else if (currentFilterTask === 'done') items = items.filter(t => t.done);
  items.sort((a,b) => (a.done?1:0)-(b.done?1:0) || (a.date||'').localeCompare(b.date||''));
  c.textContent = (state.checklist||[]).filter(t => !t.done).length;
  if (items.length === 0) { l.innerHTML = ''; if (e) e.style.display = 'block'; updateTaskBulkBar(); return; }
  if (e) e.style.display = 'none';
  const labels = { none:'', '5min':'каждые 5 мин', '1h':'каждый час', '24h':'каждые 24ч', 'day':'каждый день', 'week':'каждую неделю' };
  l.innerHTML = items.map(t => {
    const sel = (state.taskSelected||[]).includes(t.id);
    const over = !t.done && t.date && t.date < today;
    return `<div class="task-card ${t.done?'done':''} ${sel?'selected':''}" onclick="toggleTaskSelect('${t.id}', event)">
      <div class="task-checkbox ${t.done?'checked':''}" onclick="event.stopPropagation(); toggleTask('${t.id}')">${t.done?'✓':''}</div>
      <div class="task-content">
        <div class="task-text">${escapeHtml(t.text)}</div>
        <div class="task-meta">
          <span>📅 ${formatDate(t.date)}</span>
          ${t.time ? `<span class="time-badge">🕐 ${t.time}</span>` : ''}
          ${t.repeat && t.repeat !== 'none' ? `<span class="repeat-badge">🔁 ${labels[t.repeat]}</span>` : ''}
          ${over ? '<span class="repeat-badge" style="background:rgba(239,68,68,0.2);color:var(--danger);">⚠️</span>' : ''}
        </div>
      </div>
      <button class="icon-btn icon-btn-sm" onclick="event.stopPropagation(); deleteTask('${t.id}')">🗑</button>
    </div>`;
  }).join('');
  updateTaskBulkBar();
}
function toggleTask(id) {
  const t = (state.checklist||[]).find(x => x.id === id); if (!t) return;
  t.done = !t.done;
  if (t.done) {
    addXP(XP_PER_TASK); sSuccess();
    showToast(`✅ +${XP_PER_TASK} XP`, 'success');
    setEmotion('happy', 1000); logActivity();
    if (t.repeat && t.repeat !== 'none') createRepeatTask(t);
    completeDailyTask('task1');
  }
  else { state.xp = Math.max(0, state.xp - XP_PER_TASK); updateXP(); }
  saveState(); renderChecklist(); updateHomeQuickCounts(); checkAchievements();
}
function createRepeatTask(t) {
  const iv = { '5min':5*60*1000, '1h':60*60*1000, '24h':24*60*60*1000, 'day':24*60*60*1000, 'week':7*24*60*60*1000 };
  const ms = iv[t.repeat]; if (!ms) return;
  const d = new Date(Date.now()+ms);
  const iso = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  state.checklist.push({ id: shortId(), text: t.text, date: iso, time: t.time, repeat: t.repeat, done: false, createdAt: Date.now() });
}
function toggleTaskSelect(id, e) {
  if (e && e.target && e.target.closest('button')) return;
  if (!Array.isArray(state.taskSelected)) state.taskSelected = [];
  const i = state.taskSelected.indexOf(id);
  if (i >= 0) state.taskSelected.splice(i, 1); else state.taskSelected.push(id);
  saveState(); renderChecklist();
}
function deleteTask(id) {
  if (!Array.isArray(state.checklist)) return;
  const i = state.checklist.findIndex(x => x.id === id); if (i < 0) return;
  const r = state.checklist.splice(i, 1)[0]; saveState(); renderChecklist();
  showUndo('🗑 Задача удалена', () => { state.checklist.splice(i, 0, r); saveState(); renderChecklist(); });
}
function updateTaskBulkBar() { const b = document.getElementById('taskBulkBar'), c = document.getElementById('taskSelectedCount'); if (!b) return; const n = (state.taskSelected||[]).length; if (n > 0) { b.classList.remove('hidden-bar'); c.textContent = `Выбрано: ${n}`; } else b.classList.add('hidden-bar'); }
function bulkDeleteTask() {
  if (!state.taskSelected || state.taskSelected.length === 0) return;
  const r = state.checklist.filter(t => state.taskSelected.includes(t.id));
  state.checklist = state.checklist.filter(t => !state.taskSelected.includes(t.id));
  state.taskSelected = []; saveState(); renderChecklist();
  showUndo(`🗑 Удалено: ${r.length}`, () => { state.checklist.push(...r); saveState(); renderChecklist(); });
}
function bulkDoneTask() {
  if (!state.taskSelected || state.taskSelected.length === 0) return;
  let doneAny = false;
  state.taskSelected.forEach(id => {
    const t = state.checklist.find(x => x.id === id);
    if (t && !t.done) {
      t.done = true; addXP(XP_PER_TASK); logActivity();
      if (t.repeat && t.repeat !== 'none') createRepeatTask(t);
      doneAny = true;
    }
  });
  if (doneAny) completeDailyTask('task1');
  state.taskSelected = []; saveState(); renderChecklist(); sSuccess();
}
function clearTaskSelection() { state.taskSelected = []; saveState(); renderChecklist(); }

/* ============================================================
   РАСПИСАНИЕ
============================================================ */
function ensureSchedule() {
  if (!state.schedule) state.schedule = {};
  DAYS.forEach(d => { if (!state.schedule[d.id]) state.schedule[d.id] = [null,null,null,null,null,null,null,null]; });
  if (!state.afterSchool) state.afterSchool = {};
  DAYS.forEach(d => { if (!state.afterSchool[d.id]) state.afterSchool[d.id] = []; });
}
function renderSchedule() {
  ensureSchedule();
  const tabs = document.getElementById('scheduleDayTabs'), grid = document.getElementById('scheduleGrid'); if (!tabs || !grid) return;
  const today = getWeekDay(); if (!DAYS.find(d => d.id === currentDay)) currentDay = today;
  tabs.innerHTML = DAYS.map(d => `<button class="day-tab ${d.id===currentDay?'active':''}" data-day="${d.id}">${d.label}${d.id===today?' •':''}</button>`).join('');
  tabs.querySelectorAll('.day-tab').forEach(b => { b.onclick = () => { currentDay = b.dataset.day; renderSchedule(); }; });
  const lessons = state.schedule[currentDay] || []; grid.innerHTML = '';
  let totalMin = 0;
  for (let i = 0; i < 8; i++) {
    const l = lessons[i]; const cell = document.createElement('div');
    cell.className = 'lesson-cell' + (l ? ' filled' : '');
    const tStr = l ? (l.start && l.end ? `${l.start} – ${l.end}` : '') : '';
    if (l && l.start && l.end) { const [sh,sm]=l.start.split(':').map(Number), [eh,em]=l.end.split(':').map(Number); totalMin += Math.max(0,(eh*60+em)-(sh*60+sm)); }
    cell.innerHTML = `<div class="lesson-number">${i+1}</div><div class="lesson-content">${l ? `<div class="lesson-subject">${escapeHtml(l.subject)}</div>` : '<div class="lesson-empty">— пусто —</div>'}</div><div class="lesson-time-left">${tStr}</div>`;
    cell.onclick = () => openLessonModal(currentDay, i, l); grid.appendChild(cell);
  }
  const lb = document.getElementById('scheduleLoadBlock');
  if (lb) {
    const h = Math.floor(totalMin/60), m = totalMin%60, cnt = lessons.filter(Boolean).length;
    lb.innerHTML = `<div class="stats-block" style="margin:0;"><div class="stats-block-title">⏰ Нагрузка дня</div><div style="font-size:1.4rem;font-weight:800;color:var(--purple);">${h} ч ${m} мин</div><div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">Уроков: ${cnt}</div></div>`;
  }
  renderAfterSchool();
}
function renderAfterSchool() {
  const b = document.getElementById('afterSchoolList'); if (!b) return;
  if (!isPrem()) { b.innerHTML = '<div class="premium-lock" style="padding:14px;"><div class="lock-icon">💎</div><p>Premium</p><button class="btn btn-gold btn-sm" onclick="openPremiumModal()">Открыть</button></div>'; return; }
  const list = state.afterSchool[currentDay] || [];
  if (list.length === 0) { b.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-dim);font-size:0.82rem;">Занятий нет</div>'; return; }
  b.innerHTML = list.map((a, i) => `<div class="activity-card"><div class="activity-info"><div class="activity-name">${escapeHtml(a.name)}</div></div><div class="activity-time-left">${a.start} – ${a.end}</div><button class="icon-btn icon-btn-sm" onclick="deleteActivity(${i})">🗑</button></div>`).join('');
}
function openLessonModal(day, idx, lesson) {
  if (day === undefined) day = currentDay;
  if (idx === undefined) { const l = state.schedule[day]||[]; idx = l.findIndex(x => !x); if (idx === -1) { showToast('Все 8 уроков заполнены', 'warning'); return; } }
  document.getElementById('lessonModal').classList.add('active');
  document.getElementById('lessonDay').value = day; document.getElementById('lessonIndex').value = idx;
  const sel = document.getElementById('lessonSubjectSelect'), subjects = getSubjectsForGrade(state.grade||5);
  sel.innerHTML = subjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  if (lesson?.subject) sel.value = lesson.subject;
  document.getElementById('lessonStart').value = lesson?.start || '';
  document.getElementById('lessonEnd').value = lesson?.end || '';
  document.getElementById('lessonRoom').value = lesson?.room || '';
  document.getElementById('lessonDeleteBtn').style.display = lesson ? 'block' : 'none';
}
function saveLesson() {
  const day = document.getElementById('lessonDay').value, idx = parseInt(document.getElementById('lessonIndex').value);
  ensureSchedule();
  state.schedule[day][idx] = { subject: document.getElementById('lessonSubjectSelect').value, start: document.getElementById('lessonStart').value, end: document.getElementById('lessonEnd').value, room: document.getElementById('lessonRoom').value };
  saveState(); closeModal('lessonModal'); renderSchedule(); showToast('✅ Сохранено', 'success');
}
function deleteLesson() { const day = document.getElementById('lessonDay').value, idx = parseInt(document.getElementById('lessonIndex').value); state.schedule[day][idx] = null; saveState(); closeModal('lessonModal'); renderSchedule(); }
function copyDayPrompt() {
  const daysRu = { mon:'Пн', tue:'Вт', wed:'Ср', thu:'Чт', fri:'Пт', sat:'Сб' };
  const t = prompt('Куда?\n'+Object.entries(daysRu).map(([k,v])=>`${k} — ${v}`).join('\n'), 'tue');
  if (!t || !DAYS.find(d => d.id === t)) return;
  ensureSchedule(); state.schedule[t] = JSON.parse(JSON.stringify(state.schedule[currentDay]));
  saveState(); showToast('✅ Скопировано', 'success');
}
function clearDayPrompt() { if (!confirm('Очистить?')) return; ensureSchedule(); state.schedule[currentDay] = [null,null,null,null,null,null,null,null]; state.afterSchool[currentDay] = []; saveState(); renderSchedule(); }
function openActivityModal() { if (!isPrem()) { openPremiumModal(); return; } document.getElementById('activityModal').classList.add('active'); document.getElementById('activityName').value=''; document.getElementById('activityStart').value=''; document.getElementById('activityEnd').value=''; }
function saveActivity() {
  if (!isPrem()) { openPremiumModal(); return; }
  const n = document.getElementById('activityName').value.trim(); if (!n) { showToast('Введите название', 'error'); return; }
  ensureSchedule();
  state.afterSchool[currentDay].push({ name: n, start: document.getElementById('activityStart').value, end: document.getElementById('activityEnd').value });
  saveState(); closeModal('activityModal'); renderAfterSchool();
}
function deleteActivity(i) { state.afterSchool[currentDay].splice(i, 1); saveState(); renderAfterSchool(); }

/* ============================================================
   ТАЙМЕР
============================================================ */
function refreshTimerOptions() {
  const s = document.getElementById('timerMode'); if (!s) return;
  const p = isPrem();
  s.innerHTML = `<option value="25/5">25 / 5</option><option value="30/10">30 / 10</option><option value="40/10">40 / 10${p?'':' · 💎'}</option><option value="45/15">45 / 15${p?'':' · 💎'}</option><option value="60/25">60 / 25${p?'':' · 💎'}</option>`;
}
function onTimerModeChange(s) { if (['40/10','45/15','60/25'].includes(s.value) && !isPrem()) { s.value = '25/5'; openPremiumModal(); return; } pauseTimer(); parseTimerMode(); }
function parseTimerMode() { const m = document.getElementById('timerMode')?.value || '25/5'; timerState.mode = m; const [w,r] = m.split('/').map(Number); timerState.totalSeconds = (timerState.phase==='work'?w:r)*60; timerState.secondsLeft = timerState.totalSeconds; updateTimerDisplay(); }
function setTimerPhase(p) { timerState.phase = p; const [w,r] = timerState.mode.split('/').map(Number); timerState.totalSeconds = (p==='work'?w:r)*60; timerState.secondsLeft = timerState.totalSeconds; updateTimerDisplay(); const e = document.getElementById('timerPhase'); if (e) e.textContent = p==='work'?'РАБОТА':'ОТДЫХ'; }
function toggleTimer() { if (timerState.running) pauseTimer(); else startTimer(); }
function startTimer() { if (timerState.running) return; timerState.running = true; const b = document.getElementById('timerStartBtn'); if (b) b.textContent = '⏸'; timerState.intervalId = setInterval(() => { timerState.secondsLeft--; if (timerState.secondsLeft <= 0) completePhase(); else updateTimerDisplay(); }, 1000); }
function pauseTimer() { timerState.running = false; if (timerState.intervalId) clearInterval(timerState.intervalId); timerState.intervalId = null; const b = document.getElementById('timerStartBtn'); if (b) b.textContent = '▶ Старт'; }
function resetTimer() { pauseTimer(); setTimerPhase('work'); timerState.sessionNumber = 1; }
function skipToBreak() { completePhase(); }
function completePhase() {
  pauseTimer(); sSuccess();
  if (timerState.phase === 'work') {
    state.pomodoroCount = (state.pomodoroCount||0)+1;
    addXP(XP_PER_POMODORO); updateStreak();
    showToast(`🍅 +${XP_PER_POMODORO} XP!`, 'success');
    setEmotion('excited', 1500); logActivity();
    setTimerPhase('rest'); timerState.sessionNumber++;
    completeDailyTask('pomo1');
    checkAchievements();
  } else setTimerPhase('work');
  updateTimerStats();
}
function updateTimerDisplay() { const m = Math.floor(timerState.secondsLeft/60), s = timerState.secondsLeft%60; const e = document.getElementById('timerDisplay'); if (e) e.textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); const p = document.getElementById('timerProgress'); if (p) { const C = 2*Math.PI*108, fr = 1-timerState.secondsLeft/timerState.totalSeconds; p.setAttribute('stroke-dashoffset', (C*(1-fr)).toFixed(2)); } }
function updateTimerStats() { const e = document.getElementById('timerRounds'); if (e) e.textContent = `Сессия ${timerState.sessionNumber}`; }

/* ============================================================
   НАПОМИНАНИЯ
============================================================ */
function renderReminders() {
  const b = document.getElementById('remindersContent'); if (!b) return;
  if (!isPrem()) { b.innerHTML = '<div class="premium-lock"><div class="lock-icon">💎</div><p>Только в Premium</p><button class="btn btn-gold" onclick="openPremiumModal()">Открыть</button></div>'; return; }
  const items = state.reminders || [];
  b.innerHTML = `<button class="btn mb-16" onclick="openReminderModal()">+ Добавить</button>
    ${items.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--text-dim);">🔕 Нет</div>' : items.map(r => `<div class="task-card"><div class="task-content"><div class="task-text">${escapeHtml(r.text)}</div><div class="task-meta"><span>📅 ${formatDate(r.date)} ${r.time}</span></div></div><button class="icon-btn icon-btn-sm" onclick="deleteReminder('${r.id}')">🗑</button></div>`).join('')}`;
}
function openReminderModal() { if (!isPrem()) { openPremiumModal(); return; } document.getElementById('reminderModal').classList.add('active'); document.getElementById('reminderText').value=''; document.getElementById('reminderDate').value=todayISO(); document.getElementById('reminderTime').value='09:00'; }
function saveReminder() { const t = document.getElementById('reminderText').value.trim(); if (!t) return; state.reminders.push({ id: shortId(), text: t, date: document.getElementById('reminderDate').value, time: document.getElementById('reminderTime').value, repeat: document.getElementById('reminderRepeat').value }); saveState(); closeModal('reminderModal'); renderReminders(); showToast('✅ Создано', 'success'); }
function deleteReminder(id) { state.reminders = state.reminders.filter(x => x.id !== id); saveState(); renderReminders(); }
function requestNotificationPermission() {
  const s = document.getElementById('pushStatus');
  if (!('Notification' in window)) { if (s) s.textContent = 'Не поддерживается'; return; }
  if (Notification.permission === 'granted') { if (s) s.textContent = '✅'; return; }
  Notification.requestPermission().then(p => { if (s) s.textContent = p === 'granted' ? '✅' : '❌'; if (p === 'granted') { showToast('✅ Push разрешены', 'success'); new Notification('Номи', { body: 'Включено!' }); } });
}
function checkRemindersPush() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date(), hh = String(now.getHours()).padStart(2,'0'), mm = String(now.getMinutes()).padStart(2,'0');
  const cur = `${hh}:${mm}`, today = todayISO();
  (state.reminders || []).forEach(r => { if (r.date === today && r.time === cur && !r.notified) { r.notified = true; new Notification('Номи', { body: r.text }); saveState(); } });
}

/* ============================================================
   СТАТИСТИКА
============================================================ */
function renderStats() {
  state.statsViewsToday = (state.statsViewsToday||0)+1; saveState();
  const hw = state.homework||[], d = hw.filter(h => h.done).length, t = hw.length;
  const p = t > 0 ? Math.round((d/t)*100) : 0;
  document.getElementById('statsTotalHw').textContent = t;
  document.getElementById('statsDoneHw').textContent = d;
  document.getElementById('statsPendingHw').textContent = t-d;
  document.getElementById('statsPercent').textContent = p+'%';
  const box = document.getElementById('statsPremiumContent');
  if (!isPrem()) { box.innerHTML = '<div class="premium-lock"><div class="lock-icon">💎</div><p>Активность и графики в Premium</p><button class="btn btn-gold" onclick="openPremiumModal()">Открыть</button></div>'; return; }
  const bySubj = {};
  hw.forEach(h => { bySubj[h.subject] = bySubj[h.subject]||{done:0,total:0}; bySubj[h.subject].total++; if (h.done) bySubj[h.subject].done++; });
  let heat = '';
  for (let i = 89; i >= 0; i--) { const dt = addDays(todayISO(), -i), c = (state.activeDays||{})[dt]||0; let l = ''; if (c>=1) l='l1'; if (c>=3) l='l2'; if (c>=5) l='l3'; if (c>=8) l='l4'; heat += `<div class="heatmap-cell ${l}"></div>`; }
  const week = [];
  for (let i = 6; i >= 0; i--) { const dt = addDays(todayISO(), -i); week.push({ d: dt, c: (state.activeDays||{})[dt]||0 }); }
  const maxC = Math.max(1, ...week.map(w => w.c));
  const bars = week.map(w => { const h = Math.max(4, Math.round((w.c/maxC)*100)); const day = ['вс','пн','вт','ср','чт','пт','сб'][new Date(w.d+'T00:00:00').getDay()]; return `<div class="week-chart-bar"><div class="week-chart-value">${w.c}</div><div class="week-chart-fill" style="height:${h}%"></div><div class="week-chart-label">${day}</div></div>`; }).join('');
  const totalDays = Object.keys(state.activeDays||{}).length;
  let last30 = 0; for (let i=0;i<30;i++) last30 += (state.activeDays||{})[addDays(todayISO(),-i)]||0;
  const avg = (last30/30).toFixed(1), forecast = Math.round(avg*30);
  let weak = null, wp = 101;
  Object.entries(bySubj).forEach(([s,v]) => { const pc = v.total>0 ? (v.done/v.total)*100 : 100; if (pc < wp) { wp = pc; weak = s; } });
  box.innerHTML = `
    <div class="stats-block"><div class="stats-block-title">🔥 90 дней</div><div class="heatmap-grid">${heat}</div></div>
    <div class="stats-block"><div class="stats-block-title">📈 Неделя</div><div class="week-chart">${bars}</div></div>
    <div class="stats-block"><div class="stats-block-title">🔮 Прогноз</div><div style="font-size:0.9rem;line-height:1.6;">Средняя: <b>${avg} дел/день</b><br>Прогноз XP/мес: <b style="color:var(--purple);">+${forecast}</b><br>Активных дней: <b>${totalDays}</b></div></div>
    ${weak ? `<div class="stats-block"><div class="stats-block-title">⚠️ Слабое место</div><div style="font-size:0.9rem;">Предмет: <b>${escapeHtml(weak)}</b><br>Прогресс: <b style="color:var(--warning);">${Math.round(wp)}%</b></div></div>` : ''}
    <div class="stats-block"><div class="stats-block-title">🏆 Достижения</div><div style="font-size:0.85rem;color:var(--text-secondary);">Открыто: ${(state.achievements||[]).length} из ${ACHIEVEMENTS.length}<br>Мемных: ${(state.memeAchievements||[]).length} из ${MEME_ACHIEVEMENTS.length}</div></div>
    <div class="stats-block"><div class="stats-block-title">📚 По предметам</div>${Object.entries(bySubj).map(([s,v]) => `<div style="padding:6px 0;"><div style="display:flex;justify-content:space-between;"><span>${escapeHtml(s)}</span><span>${v.done}/${v.total}</span></div><div class="progress-bar" style="height:6px;margin-top:4px;"><div class="progress-fill" style="width:${v.total>0?(v.done/v.total)*100:0}%"></div></div></div>`).join('') || '<div class="stats-empty">Нет данных</div>'}</div>
  `;
}

/* ============================================================
   МОТИВАЦИЯ И ДЫХАНИЕ
============================================================ */
function newRandomQuote() { const q = QUOTES[Math.floor(Math.random()*QUOTES.length)]; const e = document.getElementById('dailyQuoteText'), a = document.getElementById('dailyQuoteAuthor'); if (e) e.textContent = `«${q.text}»`; if (a) a.textContent = `— ${q.author}`; }
function saveQuoteToFavorites() { const t = document.getElementById('dailyQuoteText')?.textContent || ''; if (!state.favoriteQuotes.includes(t)) { state.favoriteQuotes.push(t); saveState(); renderFavorites(); showToast('⭐ Сохранено', 'success'); } else showToast('Уже в избранном', 'info'); }
function moreMotivation() {
  if (!isPrem()) { openPremiumModal(); return; }
  const e = ['🌟 Ты молодец!','💪 Ещё шаг','🚀 Начни с малого','🎯 Фокус','🔥 Ты способен','📖 Суперсила','✨ Ты достоин','🌙 Отдохни'];
  const el = document.getElementById('dailyQuoteText'), a = document.getElementById('dailyQuoteAuthor');
  if (el) el.textContent = e[Math.floor(Math.random()*e.length)];
  if (a) a.textContent = '— Номи 💜';
  confetti(20); sSuccess(); setEmotion('excited', 1500); showToast('💎 Premium-мотивация!', 'gold');
}
function renderFavorites() { const b = document.getElementById('favoriteQuotes'); if (!b) return; const f = state.favoriteQuotes || []; b.innerHTML = f.length === 0 ? '<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:0.85rem;">Пока пусто</div>' : f.map(x => `<div class="card" style="margin-bottom:8px;font-size:0.88rem;font-style:italic;">${escapeHtml(x)}</div>`).join(''); }
function openBreath() { document.getElementById('breathModal').classList.add('active'); startBreathCycle(); }
function closeBreath() { document.getElementById('breathModal').classList.remove('active'); if (breathInterval) clearInterval(breathInterval); }
function startBreathCycle() {
  const circle = document.getElementById('breathCircle'), text = document.getElementById('breathText'), phase = document.getElementById('breathPhase');
  if (!circle) return;
  let cycle = 0;
  function runPhase(name, seconds, cls) {
    return new Promise(resolve => {
      phase.textContent = name + ' (' + seconds + ' сек)';
      circle.className = 'breath-circle ' + cls;
      let left = seconds; text.textContent = left;
      const int = setInterval(() => { left--; text.textContent = left; if (left <= 0) { clearInterval(int); resolve(); } }, 1000);
    });
  }
  async function run() {
    while (cycle < 4 && document.getElementById('breathModal').classList.contains('active')) {
      await runPhase('Вдох', 4, 'inhale');
      await runPhase('Задержка', 7, '');
      await runPhase('Выдох', 8, 'exhale');
      cycle++;
    }
    if (document.getElementById('breathModal').classList.contains('active')) { phase.textContent = 'Готово! 🧘'; text.textContent = '✓'; }
  }
  run();
}

/* ============================================================
   МАГАЗИН
============================================================ */
function renderShop() {
  const bb = document.getElementById('shopThemesBaseGrid');
  if (bb) bb.innerHTML = SHOP_THEMES_BASE.map(t => {
    const act = state.theme === t.themeValue;
    return `<div class="shop-item ${act?'selected':''}" onclick="buyTheme('${t.id}')">
      <div class="shop-item-preview" style="background:${t.themeValue==='light'?'#FFF':'#0A0E1A'};"></div>
      <div class="shop-item-name">${t.name}</div>
      <div class="shop-item-price owned-price">${act?'✓':'Бесплатно'}</div>
    </div>`;
  }).join('');
  const eb = document.getElementById('shopThemesGrid');
  if (eb) eb.innerHTML = SHOP_THEMES_EXTRA.map(t => {
    const o = state.shopOwned.themes.includes(t.id), a = state.shopActive.theme === t.id;
    const fp = price(t.priceXP);
    const canAfford = isPrem() || state.xp >= fp;
    const bgs = { fire:'linear-gradient(135deg,#EF4444,#F97316)', forest:'linear-gradient(135deg,#22C55E,#166534)', gold:'linear-gradient(135deg,#FBBF24,#F59E0B)', cosmic:'linear-gradient(135deg,#8B5CF6,#EC4899)' };
    return `<div class="shop-item ${o?'owned':''} ${a?'selected':''}" onclick="buyTheme('${t.id}')">
      <div class="shop-item-preview" style="background:${bgs[t.id]||'var(--card-bg-2)'};"></div>
      <div class="shop-item-name">${t.name}</div>
      <div class="shop-item-price ${o?'owned-price':(canAfford?'':'unaffordable')}">${o?'Есть':(isPrem()&&fp<t.priceXP?`<s>${t.priceXP}</s> ${fp}`:fp)+' XP'}</div>
    </div>`;
  }).join('');
  const acb = document.getElementById('shopAvatarColorsGrid');
  if (acb) acb.innerHTML = SHOP_AVATAR_COLORS.map(c => {
    const o = (state.shopOwned.avatarColors||[]).includes(c.id), a = state.shopActive.avatarColor === c.id;
    const fp = price(c.price);
    const canAfford = isPrem() || state.xp >= fp || c.price === 0;
    return `<div class="shop-item ${o?'owned':''} ${a?'selected':''}" onclick="buyAvatarColor('${c.id}')">
      <div style="width:60px;height:60px;border-radius:50%;margin:0 auto 8px;background:${c.gradient};"></div>
      <div class="shop-item-name">${c.name}</div>
      <div class="shop-item-price ${o?'owned-price':(canAfford?'':'unaffordable')}">${o?'Есть':(c.price===0?'Бесплатно':fp+' XP')}</div>
    </div>`;
  }).join('');
  const hb = document.getElementById('shopHatsGrid');
  if (hb) hb.innerHTML = SHOP_HATS.map(h => {
    const o = (state.shopOwned.hats||[]).includes(h.id), a = state.shopActive.hat === h.id;
    const fp = price(h.price);
    const canAfford = isPrem() || state.xp >= fp || h.price === 0;
    return `<div class="shop-item ${o?'owned':''} ${a?'selected':''}" onclick="buyHat('${h.id}')">
      <span style="font-size:2.5rem;display:block;margin-bottom:8px;">${h.icon}</span>
      <div class="shop-item-name">${h.name}</div>
      <div class="shop-item-price ${o?'owned-price':(canAfford?'':'unaffordable')}">${o?'Есть':(h.price===0?'Бесплатно':fp+' XP')}</div>
    </div>`;
  }).join('');
  const bgb = document.getElementById('shopBackgroundsGrid');
  if (bgb) bgb.innerHTML = SHOP_BACKGROUNDS.map(b => {
    const o = (state.shopOwned.backgrounds||[]).includes(b.id), a = state.shopActive.background === b.id;
    const fp = price(b.price);
    const canAfford = isPrem() || state.xp >= fp || b.price === 0;
    return `<div class="shop-item ${o?'owned':''} ${a?'selected':''}" onclick="buyBackground('${b.id}')">
      <div class="shop-item-preview" style="background:${b.css || 'var(--card-bg-2)'};"></div>
      <div class="shop-item-name">${b.name}</div>
      <div class="shop-item-price ${o?'owned-price':(canAfford?'':'unaffordable')}">${o?'Есть':(b.price===0?'Бесплатно':fp+' XP')}</div>
    </div>`;
  }).join('');
}
function buyAvatarColor(id) {
  const c = SHOP_AVATAR_COLORS.find(x => x.id === id); if (!c) return;
  if (!state.shopOwned.avatarColors) state.shopOwned.avatarColors = ['default'];
  if (!state.shopOwned.avatarColors.includes(id)) {
    if (isPrem()) {
      state.shopOwned.avatarColors.push(id);
      showToast('💎 Бесплатно!', 'gold');
    } else {
      const fp = price(c.price);
      if (fp === 0) {
        state.shopOwned.avatarColors.push(id);
      } else {
        if (!confirm(`Купить «${c.name}» за ${fp} XP?`)) return;
        if (!spendXP(fp)) { renderShop(); return; }
        state.shopOwned.avatarColors.push(id);
        sSuccess();
      }
    }
  }
  state.shopActive.avatarColor = id;
  saveState();
  updateNomiAvatar();
  renderShop();
  updateShopBalance();
  showToast('🎭 Применено', 'success');
}
function buyHat(id) {
  const h = SHOP_HATS.find(x => x.id === id); if (!h) return;
  if (!state.shopOwned.hats) state.shopOwned.hats = ['none'];
  if (!state.shopOwned.hats.includes(id)) {
    if (h.premium && !isPrem()) { openPremiumModal(); return; }
    if (isPrem()) {
      state.shopOwned.hats.push(id);
      showToast('💎 Бесплатно!', 'gold');
    } else {
      const fp = price(h.price);
      if (fp === 0) {
        state.shopOwned.hats.push(id);
      } else {
        if (!confirm(`Купить «${h.name}» за ${fp} XP?`)) return;
        if (!spendXP(fp)) { renderShop(); return; }
        state.shopOwned.hats.push(id);
        sSuccess();
      }
    }
  }
  state.shopActive.hat = id;
  saveState();
  updateNomiAvatar();
  renderShop();
  updateShopBalance();
  showToast('🎩 Надето', 'success');
}
function buyBackground(id) {
  const b = SHOP_BACKGROUNDS.find(x => x.id === id); if (!b) return;
  if (!state.shopOwned.backgrounds) state.shopOwned.backgrounds = ['none'];
  if (!state.shopOwned.backgrounds.includes(id)) {
    if (isPrem()) {
      state.shopOwned.backgrounds.push(id);
      showToast('💎 Бесплатно!', 'gold');
    } else {
      const fp = price(b.price);
      if (fp === 0) {
        state.shopOwned.backgrounds.push(id);
      } else {
        if (!confirm(`Купить «${b.name}» за ${fp} XP?`)) return;
        if (!spendXP(fp)) { renderShop(); return; }
        state.shopOwned.backgrounds.push(id);
        sSuccess();
      }
    }
  }
  state.shopActive.background = id;
  saveState();
  updateBodyBackground();
  renderShop();
  updateShopBalance();
  showToast('🖼 Применено', 'success');
}
function buyTheme(id) {
  const base = SHOP_THEMES_BASE.find(t => t.id === id);
  if (base) {
    if (base.themeValue === 'light') { state.theme = 'light'; document.body.classList.add('light-theme'); }
    else { state.theme = 'dark'; document.body.classList.remove('light-theme'); }
    saveState(); renderShop(); updateShopBalance();
    showToast(`🎨 ${base.name}`, 'success');
    return;
  }
  const ex = SHOP_THEMES_EXTRA.find(t => t.id === id); if (!ex) return;
  const o = state.shopOwned.themes.includes(id);
  if (!o) {
    if (isPrem()) {
      state.shopOwned.themes.push(id);
      state.shopActive.theme = id;
      applyTheme(id);
      saveState(); renderShop(); updateShopBalance();
      showToast('💎 Бесплатно!', 'gold');
      return;
    }
    const fp = price(ex.priceXP);
    if (!confirm(`Купить тему «${ex.name}» за ${fp} XP?`)) return;
    if (!spendXP(fp)) { renderShop(); return; }
    state.shopOwned.themes.push(id);
    sSuccess();
  }
  state.shopActive.theme = id;
  applyTheme(id);
  saveState(); renderShop(); updateShopBalance();
  showToast('🎨 Применено', 'success');
}
function applyTheme(id) { document.body.classList.remove('theme-fire','theme-forest','theme-gold','theme-cosmic'); if (id !== 'default') document.body.classList.add('theme-' + id); }

/* ВНЕШНОСТЬ НОМИ */
function renderNomiLook() {
  document.querySelectorAll('#nomiLookTabs .nomi-tab').forEach(b => {
    b.onclick = () => {
      currentLookTab = b.dataset.tab;
      document.querySelectorAll('#nomiLookTabs .nomi-tab').forEach(x => { x.classList.remove('active'); x.style.background='var(--card-bg-2)'; x.style.color='var(--text-secondary)'; x.style.border='1.5px solid var(--border)'; });
      b.style.background='var(--grad-purple)'; b.style.color='#fff'; b.style.border='none';
      ['horns','eyes','noses','mouths'].forEach(t => { const p = document.getElementById('look-panel-'+t); if (p) p.style.display = (t===currentLookTab)?'block':'none'; });
      renderLookGrid(currentLookTab);
    };
  });
  renderLookGrid(currentLookTab);
}
function renderLookPreview(tab, id) {
  let inner = '';
  if (tab === 'horns') {
    const shape = HORN_SHAPES[id] || HORN_SHAPES.classic;
    const mirror = HORN_MIRROR[id] || HORN_MIRROR.classic;
    const color = HORN_COLORS[id] || '#7C3AED';
    inner = `<ellipse cx="30" cy="32" rx="14" ry="12" fill="#7C3AED" opacity="0.3"/><g transform="translate(0,0) scale(1.2)">${(shape+mirror).replace(/currentColor/g, color)}</g>`;
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
function renderLookGrid(tab) {
  const g = document.getElementById('lookGrid-'+tab); if (!g) return;
  const items = NOMI_LOOK_DATA[tab] || [], owned = state.nomiLookOwned?.[tab] || [], active = state.nomiLookActive?.[tab];
  g.innerHTML = items.map(it => {
    const o = owned.includes(it.id), a = active === it.id;
    const fp = price(it.price);
    const canAfford = isPrem() || state.xp >= fp || it.price === 0;
    return `<div class="look-item ${o?'owned':''} ${a?'active':''}" onclick="pickLook('${tab}','${it.id}')">
      <div class="look-item-preview">${renderLookPreview(tab, it.id)}</div>
      <div class="look-item-name">${it.name}</div>
      <div class="look-item-price ${o?'owned-price':(canAfford?'':'unaffordable')}">${o?(a?'✓':'Есть'):(isPrem()&&fp<it.price?`<s>${it.price}</s> ${fp}`:fp)+' XP'}</div>
    </div>`;
  }).join('');
}
function pickLook(tab, id) {
  const items = NOMI_LOOK_DATA[tab] || [], it = items.find(x => x.id === id); if (!it) return;
  if (!state.nomiLookOwned) state.nomiLookOwned = {};
  if (!state.nomiLookActive) state.nomiLookActive = {};
  if (!state.nomiLookOwned[tab]) state.nomiLookOwned[tab] = [];
  const owned = state.nomiLookOwned[tab];
  if (!owned.includes(id)) {
    if (isPrem()) {
      owned.push(id);
      showToast('💎 Бесплатно!', 'gold');
    } else {
      const fp = price(it.price);
      if (fp === 0) {
        owned.push(id);
      } else {
        if (!confirm(`Купить «${it.name}» за ${fp} XP?`)) return;
        if (!spendXP(fp)) { renderLookGrid(tab); return; }
        owned.push(id);
        sSuccess();
      }
    }
  }
  state.nomiLookActive[tab] = id;
  saveState();
  renderLookGrid(tab);
  renderShop();
  updateShopBalance();
  if (tab === 'mouths') setEmotion('happy', 0);
  updateNomiAvatar();
  setEmotion('excited', 1500);
  confetti(30); vibrate(30); sSuccess();
  showToast(`🎉 ${it.name}!`, 'gold');
}

/* ============================================================
   ПИТОМЕЦ
============================================================ */
function renderPet() {
  const p = state.pet; if (!p) return;
  document.getElementById('petLevel').textContent = p.level;
  document.getElementById('petHungerValue').textContent = p.hunger + '%';
  document.getElementById('petHungerFill').style.width = p.hunger + '%';
  const need = p.level * 100;
  document.getElementById('petXpValue').textContent = p.xp + ' / ' + need;
  document.getElementById('petXpFill').style.width = ((p.xp/need)*100)+'%';
  document.getElementById('petStatusText').textContent = p.hunger > 70 ? 'Сытый и довольный! 🎉' : p.hunger > 30 ? 'Проголодался 🍎' : 'Очень голодный 😢';
  const hp = document.getElementById('homePetLevel'); if (hp) hp.textContent = p.level;
  const hs = document.getElementById('homePetStatus'); if (hs) hs.textContent = p.hunger > 70 ? 'Сытый и довольный' : 'Проголодался';
  const g = document.getElementById('petSkinsGrid'); const prem = isPrem();
  if (g) {
    const sk = prem ? PET_SKINS : PET_SKINS.slice(0, 2);
    g.innerHTML = sk.map(s => {
      const a = state.pet.skin === s.id;
      return `<div class="pet-skin-item ${a?'active':''}" style="background:${s.gradient};" onclick="selectPetSkin('${s.id}')">${s.emoji}</div>`;
    }).join('');
  }
  renderLookSvg('petAvatarSvg', 'pet');
  updateHats();
}
function selectPetSkin(id) {
  const s = PET_SKINS.find(x => x.id === id); if (!s) return;
  if (!isPrem() && !['default','gold'].includes(id)) { openPremiumModal(); return; }
  if (!state.shopOwned.petSkins) state.shopOwned.petSkins = ['default'];
  if (!state.shopOwned.petSkins.includes(id)) {
    if (isPrem()) {
      state.shopOwned.petSkins.push(id);
      showToast('💎 Бесплатно!', 'gold');
    } else {
      const fp = price(s.price);
      if (fp === 0) {
        state.shopOwned.petSkins.push(id);
      } else {
        if (!confirm(`Купить скин «${s.name}» за ${fp} XP?`)) return;
        if (!spendXP(fp)) { renderPet(); return; }
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
function feedPet() {
  const t = todayISO();
  if (!state.petFeedsToday || state.petFeedsToday.date !== t) state.petFeedsToday = { date: t, count: 0 };
  if (state.petFeedsToday.count >= 5) { showToast('🍎 Наелся!', 'warning'); return; }
  state.petFeedsToday.count++;
  const p = state.pet; p.hunger = Math.min(100, p.hunger+20); p.xp += 5;
  if (p.xp >= p.level*100) { p.xp -= p.level*100; p.level++; showToast('🎉 Вырос!', 'gold'); }
  saveState(); renderPet(); setEmotion('eating', 1000); showToast('🍎 +5 XP', 'success');
}
function playWithPet() {
  const t = todayISO();
  if (!state.petPlaysToday || state.petPlaysToday.date !== t) state.petPlaysToday = { date: t, count: 0 };
  if (state.petPlaysToday.count >= 5) { showToast('🎾 Устал!', 'warning'); return; }
  state.petPlaysToday.count++;
  const p = state.pet; p.hunger = Math.max(0, p.hunger-5); p.xp += 8;
  if (p.xp >= p.level*100) { p.xp -= p.level*100; p.level++; showToast('🎉 Вырос!', 'gold'); }
  saveState(); renderPet(); setEmotion('excited', 1500); addXP(3); showToast('🎾 +8 XP', 'success');
}
function petPet() {
  const t = todayISO();
  if (!state.petPetsToday || state.petPetsToday.date !== t) state.petPetsToday = { date: t, count: 0 };
  if (state.petPetsToday.count >= 10) { showToast('🤗 Хватит!', 'info'); return; }
  state.petPetsToday.count++;
  const p = state.pet; p.xp += 3;
  if (p.xp >= p.level*100) { p.xp -= p.level*100; p.level++; showToast('🎉 Вырос!', 'gold'); }
  saveState(); renderPet(); setEmotion('love', 1200); showToast('🤗 Мурр!', 'info');
}

/* ============================================================
   ФЛЕШ-КАРТОЧКИ
============================================================ */
function openFlashCardModal() {
  const t = (state.flashCards||[]).length;
  if (!isPrem() && t >= 50) { openPremiumModal(); return; }
  document.getElementById('flashCardModal').classList.add('active');
  document.getElementById('flashCardQuestion').value = ''; document.getElementById('flashCardAnswer').value = '';
  document.getElementById('flashCardDeck').value = 'Общее';
}
function saveFlashCard() {
  const q = document.getElementById('flashCardQuestion').value.trim();
  const a = document.getElementById('flashCardAnswer').value.trim();
  const d = document.getElementById('flashCardDeck').value.trim() || 'Общее';
  if (!q || !a) { showToast('Заполните поля', 'error'); return; }
  state.flashCards.push({ id: shortId(), q, a, deck: d });
  saveState(); closeModal('flashCardModal'); renderFlashCards(); showToast('✅ Создано', 'success'); checkAchievements();
}
function renderFlashCards() {
  const cards = state.flashCards || [];
  document.getElementById('flashCountBadge').textContent = cards.length;
  document.getElementById('flashTotalCount').textContent = cards.length;
  const ds = document.getElementById('flashDeckSelector');
  const decks = ['Общее', ...new Set(cards.map(c => c.deck))];
  ds.innerHTML = decks.map(d => `<button class="deck-chip ${state.activeDeck===d?'active':''}" onclick="selectDeck('${escapeHtml(d)}')">${escapeHtml(d)}</button>`).join('');
  const inDeck = cards.filter(c => c.deck === state.activeDeck);
  const a = document.getElementById('flashActive'), e = document.getElementById('flashEmpty');
  if (inDeck.length === 0) { if (a) a.style.display='none'; if (e) e.style.display='block'; return; }
  if (e) e.style.display='none'; if (a) a.style.display='block';
  const c = inDeck[0];
  document.getElementById('flashQuestionText').textContent = c.q;
  document.getElementById('flashAnswerText').textContent = c.a;
  document.getElementById('flashUserAnswer').value = ''; document.getElementById('flashResult').innerHTML = '';
  document.getElementById('flashCard').classList.remove('flipped');
}
function selectDeck(d) { state.activeDeck = d; saveState(); renderFlashCards(); }
function checkFlashAnswer() {
  const cards = state.flashCards.filter(c => c.deck === state.activeDeck); if (cards.length === 0) return;
  const c = cards[0], ua = (document.getElementById('flashUserAnswer').value||'').trim().toLowerCase();
  if (!ua) { showToast('Напиши ответ', 'warning'); return; }
  const ca = c.a.trim().toLowerCase();
  const r = document.getElementById('flashResult');
  if (ua === ca || (ca.includes(ua) && ua.length >= 3)) {
    r.className = 'flash-result correct'; r.innerHTML = `✅ Верно! +${XP_PER_FLASHCARD} XP`;
    addXP(XP_PER_FLASHCARD); sSuccess(); confetti(30); logActivity();
    state.completedFlashCards = (state.completedFlashCards||[]); state.completedFlashCards.push(c.id);
    setTimeout(() => { state.flashCards = state.flashCards.filter(x => x.id !== c.id); saveState(); renderFlashCards(); }, 1500);
    checkAchievements();
  } else { r.className = 'flash-result wrong'; r.innerHTML = `❌ Неверно. Ответ: «${c.a.charAt(0)}...»`; }
}

/* ============================================================
   КВЕСТЫ И НАВЫКИ
============================================================ */
function renderQuests() {
  const l = document.getElementById('questsList'); if (!l) return;
  const dh = state.homework.filter(h => h.done).length, p = state.pomodoroCount||0;
  const t = (state.viewedTopics||[]).length, s = (state.solvedProblems||[]).length, st = state.streak||0;
  const all = [
    { icon:'📚', name:'Марафон ДЗ', desc:'5 ДЗ', cur: dh, max:5, xp:50 },
    { icon:'🏅', name:'Двадцатка', desc:'20 ДЗ', cur: dh, max:20, xp:200 },
    { icon:'🍅', name:'Помидорный сад', desc:'10 сессий', cur: p, max:10, xp:100 },
    { icon:'🔥', name:'Помидорный лес', desc:'50 сессий', cur: p, max:50, xp:400 },
    { icon:'🔍', name:'Исследователь', desc:'10 тем', cur: t, max:10, xp:80 },
    { icon:'✏️', name:'Решатель', desc:'25 задач', cur: s, max:25, xp:150 },
    { icon:'⚡', name:'Неделя силы', desc:'Streak 7', cur: st, max:7, xp:200 },
    { icon:'💎', name:'Месяц огня', desc:'Streak 30', cur: st, max:30, xp:1000 }
  ];
  const qs = isPrem() ? all : all.slice(0, 5);
  l.innerHTML = qs.map(q => {
    const pct = Math.min(100, Math.round((q.cur/q.max)*100));
    return `<div class="quest-card ${q.cur>=q.max?'completed':''}"><div class="quest-header"><span class="quest-icon">${q.icon}</span><div class="quest-info"><div class="quest-name">${q.name}</div><div class="quest-desc">${q.desc}</div></div>${q.cur>=q.max?'<span style="font-size:1.4rem;">✅</span>':''}</div><div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div><div class="quest-progress-label"><span>${Math.min(q.cur,q.max)} / ${q.max}</span><span>+${q.xp} XP</span></div></div>`;
  }).join('');
  const b = document.getElementById('bossesList');
  const allB = [
    { icon:'👹', name:'Босс: Лень', desc:'10 ДЗ', cur: dh, max:10 },
    { icon:'👻', name:'Босс: Откладывание', desc:'5 сессий', cur: p, max:5 },
    { icon:'🐙', name:'Босс: Многозадачность', desc:'10 тем', cur: t, max:10 },
    { icon:'🦑', name:'Босс: Забывчивость', desc:'Streak 14', cur: st, max:14 },
    { icon:'🕷️', name:'Босс: Хаос', desc:'20 задач', cur: s, max:20 },
    { icon:'🐉', name:'Дракон Экзаменов', desc:'Streak 30', cur: st, max:30 }
  ];
  const bs = isPrem() ? allB : allB.slice(0, 3);
  b.innerHTML = bs.map(x => { const hp = Math.max(0, 100-Math.round((x.cur/x.max)*100)); return `<div class="boss-card"><div class="boss-avatar">${x.icon}</div><div class="boss-name">${x.name}</div><div class="boss-desc">${x.desc}</div><div class="boss-hp-bar"><div class="boss-hp-fill" style="width:${hp}%"></div></div><div class="boss-hp-label">HP: ${hp}%</div></div>`; }).join('');
}
const SKILLS = [
  { icon:'📚', name:'Мастер ДЗ', desc:'3 ДЗ', max:3, get: () => state.homework.filter(h => h.done).length, reward:'+50 XP' },
  { icon:'🍅', name:'Помодоро-ниндзя', desc:'5 сессий', max:5, get: () => state.pomodoroCount||0, reward:'+80 XP' },
  { icon:'🔍', name:'Исследователь', desc:'5 тем', max:5, get: () => (state.viewedTopics||[]).length, reward:'+60 XP' },
  { icon:'✏️', name:'Решатель', desc:'10 задач', max:10, get: () => (state.solvedProblems||[]).length, reward:'+100 XP' },
  { icon:'🔥', name:'Огонь', desc:'Streak 7', max:7, get: () => state.streak||0, reward:'+150 XP' },
  { icon:'🎴', name:'Карточный мастер', desc:'10 карточек', max:10, get: () => (state.completedFlashCards||[]).length, reward:'+100 XP' }
];
function renderSkillTree() {
  const b = document.getElementById('skillTreeBox'); if (!b) return;
  if (!isPrem()) { b.innerHTML = '<div class="premium-lock"><div class="lock-icon">💎</div><p>В Premium</p><button class="btn btn-gold" onclick="openPremiumModal()">Открыть</button></div>'; return; }
  b.innerHTML = `<div class="skill-tree">${SKILLS.map(s => { const c = Math.min(s.get(), s.max), d = c >= s.max, pct = Math.round((c/s.max)*100); return `<div class="skill-node ${d?'done':''}"><div class="skill-node-icon">${s.icon}</div><div class="skill-node-info"><div class="skill-node-name">${s.name} ${d?'✅':''}</div><div class="skill-node-desc">${s.desc}</div><div class="progress-bar" style="margin-top:6px;height:6px;"><div class="progress-fill" style="width:${pct}%"></div></div><div class="skill-node-reward">${s.reward}</div></div></div>`; }).join('')}</div>`;
}

/* ============================================================
   ДОСТИЖЕНИЯ
============================================================ */
function checkAchievements() {
  if (!state.achievements) state.achievements = [];
  ACHIEVEMENTS.forEach(a => {
    if (!state.achievements.includes(a.id) && a.check()) {
      state.achievements.push(a.id);
      addXP(15);
      setTimeout(() => { showToast(`🏆 ${a.name}!`, 'gold'); confetti(50); setEmotion('excited', 1500); }, 500);
    }
  });
  if (!state.memeAchievements) state.memeAchievements = [];
  MEME_ACHIEVEMENTS.forEach(m => {
    if (!state.memeAchievements.includes(m.id)) {
      try {
        if (m.check()) {
          state.memeAchievements.push(m.id);
          addXP(m.xp);
          const r = RARITY[m.rarity] || RARITY.common;
          setTimeout(() => {
            showToast(`${r.icon} ${m.icon} ${m.name} · +${m.xp} XP`, m.rarity === 'legendary' ? 'gold' : 'success');
            confetti(m.rarity === 'legendary' ? 90 : 40, m.rarity === 'legendary');
            setEmotion('excited', 1800);
          }, 500);
        }
      } catch(e) {}
    }
  });
  saveState();
}
function showTitlesHelp() {
  const unlocked = new Set(state.memeAchievements || []);
  const rows = MEME_ACHIEVEMENTS.map(m => {
    const u = unlocked.has(m.id);
    const r = RARITY[m.rarity] || RARITY.common;
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border-soft);opacity:${u?1:0.55};">
      <span style="font-size:1.4rem;">${m.icon}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:800;font-size:0.9rem;">${u ? '✓ ' : ''}${escapeHtml(m.title)}</div>
        <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${escapeHtml(m.desc)}</div>
        <div style="font-size:0.7rem;color:${r.color};font-weight:800;margin-top:4px;">${r.icon} ${r.name} · +${m.xp} XP</div>
      </div>
    </div>`;
  }).join('');
  const c = document.getElementById('levelInfoContent');
  c.innerHTML = `<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:14px;">Титулы открываются автоматически за <b>мемные достижения</b>. Выполни условие — титул появится в списке выше.</p><div style="max-height:50vh;overflow-y:auto;">${rows}</div>`;
  document.getElementById('levelInfoModal').classList.add('active');
}

/* ============================================================
   ПРОФИЛЬ
============================================================ */
function renderProfile() {
  document.getElementById('profileNameValue').textContent = state.name || '—';
  document.getElementById('profileClass').value = state.grade || 5;
  document.getElementById('profileXpValue').textContent = state.xp;
  document.getElementById('profileStreakValue').textContent = state.streak || 0;
  document.getElementById('profileTitleValue').textContent = state.activeTitle || '—';
  const lvl = getLevel(state.xp), lvlIdx = getLevelIndex(state.xp);
  document.getElementById('nomiProfileNameMain').textContent = state.name ? ('Номи · ' + state.name) : 'Номи';
  document.getElementById('nomiProfileLevelMain').textContent = lvlIdx + 1;
  const need = lvl.max === Infinity ? 1 : (lvl.max - lvl.min);
  const cur = state.xp - lvl.min;
  document.getElementById('nomiProfileXpFillMain').style.width = Math.min(100, Math.round((cur/need)*100)) + '%';
  document.getElementById('nomiProfileXpTextMain').textContent = `${cur} / ${need} XP`;
  updateNomiAvatar();
  updateHats();
  const memeBox = document.getElementById('profileMemeAchievements');
  if (memeBox) {
    const unlocked = (state.memeAchievements||[]).length;
    memeBox.innerHTML = `
      <div class="settings-group" style="margin-top:12px;">
        <div class="setting-row" style="flex-direction:column;align-items:flex-start;">
          <span class="setting-label">🎮 Мемные достижения</span>
          <div style="font-size:0.78rem;color:var(--text-dim);margin-top:4px;">Открыто: <b style="color:var(--purple);">${unlocked}</b> из <b>${MEME_ACHIEVEMENTS.length}</b></div>
          <div class="progress-bar" style="height:8px;margin-top:8px;width:100%;"><div class="progress-fill" style="width:${Math.round((unlocked/MEME_ACHIEVEMENTS.length)*100)}%"></div></div>
        </div>
      </div>
      <div class="settings-group">
        ${MEME_ACHIEVEMENTS.map(m => {
          const u = (state.memeAchievements||[]).includes(m.id);
          const r = RARITY[m.rarity] || RARITY.common;
          return `<div class="setting-row" style="opacity:${u?1:0.4};"><span class="setting-label">${m.icon} ${escapeHtml(m.name)}</span><span class="setting-value" style="color:${r.color};font-weight:800;">${u ? '✓ ' + escapeHtml(m.title) : r.icon + ' ' + r.name}</span></div>`;
        }).join('')}
      </div>
    `;
  }
}

/* ============================================================
   НАСТРОЙКИ
============================================================ */
function renderSettings() {
  const t = document.getElementById('toggleDarkTheme'); if (t) t.checked = state.theme === 'dark';
  const n = document.getElementById('toggleNotifications'); if (n) n.checked = state.notifications;
  const so = document.getElementById('toggleSounds'); if (so) so.checked = state.sounds;
  const v = document.getElementById('toggleVibration'); if (v) v.checked = state.vibration;
  renderCustomColors();
  updateSchoolDisplay();
  updateTitleSelect();
  const p = document.getElementById('pushStatus');
  if (p) { if (!('Notification' in window)) p.textContent = '—'; else if (Notification.permission === 'granted') p.textContent = '✅'; else if (Notification.permission === 'denied') p.textContent = '❌'; else p.textContent = 'Нажми'; }
}
function renderCustomColors() { const g = document.getElementById('customColorGrid'); if (!g) return; g.innerHTML = CUSTOM_COLORS.map(c => `<div class="color-swatch ${state.customThemeColor===c.id?'active':''}" style="background:${c.primary};" onclick="applyCustomColor('${c.id}')"></div>`).join(''); }
function applyCustomColor(id) { const c = CUSTOM_COLORS.find(x => x.id === id); if (!c) return; state.customThemeColor = id; document.documentElement.style.setProperty('--primary', c.primary); document.documentElement.style.setProperty('--accent', c.accent); document.documentElement.style.setProperty('--grad-blue', `linear-gradient(135deg, ${c.primary}, ${c.accent})`); saveState(); renderCustomColors(); showToast('🎨', 'success'); }
function updateTitleSelect() {
  const s = document.getElementById('titleSelect'); if (!s) return;
  const c = document.getElementById('titlesCount'), t = document.getElementById('titlesTotal');
  const unlocked = [];
  ACHIEVEMENTS.forEach(a => { if ((state.achievements||[]).includes(a.id)) unlocked.push({ id:a.id, name:a.name, icon:a.icon, rarity:'common' }); });
  MEME_ACHIEVEMENTS.forEach(m => { if ((state.memeAchievements||[]).includes(m.id)) unlocked.push({ id:m.id, name:m.title, icon:m.icon, rarity:m.rarity }); });
  if (t) t.textContent = ACHIEVEMENTS.length + MEME_ACHIEVEMENTS.length;
  if (c) c.textContent = unlocked.length;
  s.innerHTML = '<option value="">Без титула</option>' + unlocked.map(x => {
    const r = RARITY[x.rarity] || RARITY.common;
    return `<option value="${escapeHtml(x.name)}" ${state.activeTitle===x.name?'selected':''}>${r.icon} ${x.icon} ${escapeHtml(x.name)}</option>`;
  }).join('');
  s.onchange = () => { state.activeTitle = s.value || null; saveState(); updateTopbar(); renderProfile(); showToast('🏷️ Титул обновлён', 'success'); };
}
function editName() { const n = prompt('Новое имя:', state.name); if (n && n.trim()) { state.name = n.trim(); saveState(); renderProfile(); updateTopbar(); updateGreeting(); showToast('✅', 'success'); } }
function confirmClearData() { if (!confirm('Удалить?')) return; localStorage.removeItem(STORAGE_KEY); location.reload(); }
function setFontSize(s) { state.fontSize = s; document.documentElement.style.setProperty('--font-size-base', s === 'small' ? '13px' : s === 'large' ? '17px' : '15px'); saveState(); showToast('✅', 'success'); }
function updateSchoolDisplay() {
  const a = document.getElementById('schoolStartDisplay');
  const b = document.getElementById('schoolEndDisplay');
  const c = document.getElementById('vacationStartDisplay');
  const d = document.getElementById('vacationEndDisplay');
  if (a) a.textContent = state.schoolStart ? formatDate(state.schoolStart) : 'Не задано';
  if (b) b.textContent = state.schoolEnd ? formatDate(state.schoolEnd) : 'Не задано';
  if (c) c.textContent = state.vacationStart ? formatDate(state.vacationStart) : 'Не задано';
  if (d) d.textContent = state.vacationEnd ? formatDate(state.vacationEnd) : 'Не задано';
}
function updateProgressBars() {
  const bvFill = document.getElementById('beforeVacationFill');
  const bvPct = document.getElementById('beforeVacationPercent');
  const bvLbl = document.getElementById('beforeVacationLabel');
  if (state.vacationStart && state.vacationEnd) {
    const today = new Date(todayISO() + 'T00:00:00');
    const vS = new Date(state.vacationStart + 'T00:00:00');
    const vE = new Date(state.vacationEnd + 'T00:00:00');
    if (today < vS) {
      const baseStart = state.schoolStart ? new Date(state.schoolStart + 'T00:00:00') : new Date(vS.getTime() - 90*86400000);
      const totalToVac = Math.max(1, vS - baseStart);
      const passed = Math.max(0, today - baseStart);
      const pct = Math.min(100, Math.round((passed / totalToVac) * 100));
      const left = Math.max(0, Math.round((vS - today) / 86400000));
      if (bvFill) bvFill.style.width = pct + '%';
      if (bvPct) bvPct.textContent = pct + '%';
      if (bvLbl) bvLbl.textContent = `До каникул: ${left} ${plural(left, ['день','дня','дней'])}`;
    } else if (today > vE) {
      if (bvFill) bvFill.style.width = '100%';
      if (bvPct) bvPct.textContent = '✓';
      if (bvLbl) bvLbl.textContent = `🎒 Каникулы прошли`;
    } else {
      const total = Math.max(1, vE - vS);
      const passed = today - vS;
      const pct = Math.min(100, Math.round((passed / total) * 100));
      const left = Math.max(0, Math.round((vE - today) / 86400000));
      if (bvFill) bvFill.style.width = pct + '%';
      if (bvPct) bvPct.textContent = pct + '%';
      if (bvLbl) bvLbl.textContent = `🎉 Каникулы! Осталось ${left} ${plural(left, ['день','дня','дней'])}`;
    }
  } else {
    if (bvFill) bvFill.style.width = '0%';
    if (bvPct) bvPct.textContent = '—';
    if (bvLbl) bvLbl.textContent = 'Нажми, чтобы настроить';
  }
  if (state.schoolStart && state.schoolEnd) {
    const now = new Date();
    const s = new Date(state.schoolStart + 'T00:00:00');
    const e = new Date(state.schoolEnd + 'T00:00:00');
    const total = Math.max(1, e - s);
    const elapsed = Math.max(0, Math.min(total, now - s));
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const sf = document.getElementById('studyFill');
    const sp = document.getElementById('studyPercent');
    const sl = document.getElementById('studyLabel');
    if (sf) sf.style.width = pct + '%';
    if (sp) sp.textContent = Math.round(pct) + '%';
    if (sl) sl.textContent = `${formatDate(state.schoolStart)} → ${formatDate(state.schoolEnd)}`;
  } else {
    const sp = document.getElementById('studyPercent');
    const sl = document.getElementById('studyLabel');
    if (sp) sp.textContent = '—';
    if (sl) sl.textContent = 'Нажми, чтобы настроить';
  }
}
function quickEditStudy() {
  document.getElementById('quickSchoolStart').value = state.schoolStart || '';
  document.getElementById('quickSchoolEnd').value = state.schoolEnd || '';
  document.getElementById('quickVacationStart').value = state.vacationStart || '';
  document.getElementById('quickVacationEnd').value = state.vacationEnd || '';
  document.getElementById('quickDatesModal').classList.add('active');
}
function quickEditVacation() { quickEditStudy(); }
function quickVacation(days) {
  const start = document.getElementById('quickVacationStart').value || todayISO();
  const end = addDays(start, days);
  document.getElementById('quickVacationEnd').value = end;
  showToast(`🏖️ ${formatDate(start)} → ${formatDate(end)}`, 'info');
}
function saveQuickDates() {
  const sS = document.getElementById('quickSchoolStart').value;
  const sE = document.getElementById('quickSchoolEnd').value;
  const vS = document.getElementById('quickVacationStart').value;
  const vE = document.getElementById('quickVacationEnd').value;
  if (sS && sE && sE < sS) { showToast('❌ Конец учёбы раньше начала', 'error'); return; }
  if (vS && vE && vE < vS) { showToast('❌ Конец каникул раньше начала', 'error'); return; }
  state.schoolStart = sS; state.schoolEnd = sE;
  state.vacationStart = vS; state.vacationEnd = vE;
  saveState(); updateProgressBars(); updateSchoolDisplay(); closeModal('quickDatesModal');
  showToast('✅ Даты сохранены', 'success');
}

/* ============================================================
   PREMIUM
============================================================ */
function openPremiumModal() { document.getElementById('premiumModal').classList.add('active'); }
function selectPlan() { closeModal('premiumModal'); document.getElementById('paymentModal').classList.add('active'); document.getElementById('paymentForm').style.display = 'block'; document.getElementById('paymentProcessing').style.display = 'none'; document.getElementById('paymentSuccess').style.display = 'none'; }
function openPremiumLifetime() {
  if (confirm('💎 Купить Premium навсегда за 3000 ₽?\n\n✅ Все функции навсегда\n✅ Без подписок\n✅ Демо-списание 3000 ₽')) {
    activatePremium(365 * 100);
    state.premium.lifetime = true;
    saveState(); closeModal('premiumModal');
    showToast('💎 PREMIUM НАВСЕГДА!', 'gold');
    confetti(120, true, true); fireworks(6);
  }
}
function activatePremium(days = 30) {
  state.premium.active = true; state.premium.expiresAt = Date.now() + days * 86400000;
  document.body.classList.add('premium-active'); saveState();
  sFanfare(); confetti(80, true, true); fireworks(4); initParticles();
  updateTopbar(); updateNomiAvatar(); updateGreeting(); refreshTimerOptions(); renderProfile();
  showToast('💎 PREMIUM АКТИВИРОВАН!', 'gold');
}
function confirmPurchase() {
  document.getElementById('paymentForm').style.display = 'none';
  document.getElementById('paymentProcessing').style.display = 'block';
  setTimeout(() => { document.getElementById('paymentProcessing').style.display = 'none'; document.getElementById('paymentSuccess').style.display = 'block'; activatePremium(30); confetti(120, true, true); }, 1800);
}
function activatePromo() { const c = prompt('Промокод:'); if (!c) return; if (c === 'VIP2025') { activatePremium(365); closeModal('premiumModal'); showToast('🎁 Год!', 'gold'); } else if (c === 'NOMI2024') { activatePremium(30); closeModal('premiumModal'); showToast('🎁 Месяц!', 'gold'); } else showToast('❌', 'error'); }

/* ============================================================
   ОНБОРДИНГ
============================================================ */
function onboardNext(role) { onboard.role = role; document.getElementById('step-role').classList.remove('active'); document.getElementById('step-name').classList.add('active'); }
function onboardBack() { const steps = ['step-role','step-name','step-class']; const cur = document.querySelector('.onboard-step.active'); const i = steps.indexOf(cur?.id); if (i > 0) { cur.classList.remove('active'); document.getElementById(steps[i-1])?.classList.add('active'); } }
function onboardFinish() {
  state.onboarded = true; state.role = onboard.role || 'student';
  state.name = onboard.name || 'Ученик'; state.grade = onboard.grade || 5;
  if (!state.id) state.id = generateId();
  saveState();
  document.getElementById('onboarding')?.classList.remove('active');
  buildNav(); updateTopbar(); updateGreeting(); updateNomiAvatar(); showScreen('home');
  showToast('🎉 Добро пожаловать!', 'success');
}

/* ============================================================
   ЧАТ С НОМИ
============================================================ */
function toggleChat() { const p = document.getElementById('nomi-chat-panel'); if (!p) return; if (p.classList.contains('open')) p.classList.remove('open'); else { p.classList.add('open'); if (document.getElementById('nomiChatBody').children.length === 0) addBot('Привет! Я Номи 👋'); setTimeout(() => document.getElementById('nomiChatInput')?.focus(), 400); } }
function addBot(t) { const b = document.getElementById('nomiChatBody'); if (!b) return; const m = document.createElement('div'); m.className='chat-msg bot'; m.innerHTML = t; b.appendChild(m); b.scrollTop = b.scrollHeight; }
function addUser(t) { const b = document.getElementById('nomiChatBody'); if (!b) return; const m = document.createElement('div'); m.className='chat-msg user'; m.textContent = t; b.appendChild(m); b.scrollTop = b.scrollHeight; }
function sendChat() { const i = document.getElementById('nomiChatInput'); if (!i) return; const t = i.value.trim(); if (!t) return; addUser(t); i.value=''; setTimeout(() => addBot(getNomiResponse(t)), 700); }
function quickReply(t) { const i = document.getElementById('nomiChatInput'); if (i) i.value = t; sendChat(); }
function toggleChatMic() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { showToast('Не поддерживается', 'warning'); return; }
  if (recognitionActive) { try { recognition.stop(); } catch(e){} recognitionActive = false; return; }
  try {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR(); recognition.lang = 'ru-RU';
    recognition.onresult = (e) => {
      const i = document.getElementById('nomiChatInput');
      if (i) i.value = e.results[0][0].transcript;
      recognitionActive = false;
      state.usedVoiceInput = true;
      const today = todayISO();
      if (!state.voiceInputsDate || state.voiceInputsDate !== today) { state.voiceInputsDate = today; state.voiceInputsToday = 0; }
      state.voiceInputsToday = (state.voiceInputsToday||0) + 1;
      saveState(); checkAchievements();
    };
    recognition.onerror = () => { recognitionActive = false; };
    recognition.onend = () => { recognitionActive = false; };
    recognition.start(); recognitionActive = true;
  } catch(e){}
}
function getNomiResponse(q) {
  const l = q.toLowerCase();
  if (!state.premium.usage) state.premium.usage = {};
  const t = todayISO(), u = state.premium.usage.nomiAnswers;
  if (!u || u.date !== t) state.premium.usage.nomiAnswers = { count: 1, date: t }; else u.count++;
  const lim = LIMITS[isPrem() ? 'premium' : 'free'].nomiAnswers;
  if (!isPrem() && u.count > lim) return `💎 Бесплатных ответов: ${lim}. Premium!`;
  if (l.includes('шаман') || l.includes('россия, мама') || l.includes('россия мама')) {
    state.shamanSung = (state.shamanSung||0) + 1; saveState(); checkAchievements();
    return '🎤 «Россия, мама!» 🇷🇺 +1 к Шаману!';
  }
  if (l.includes('план') || l.includes('что делать')) { const h = state.homework.filter(x=>!x.done).length, tk = (state.checklist||[]).filter(x=>!x.done).length; return `📋 План: 1) ${Math.min(h,2)} ДЗ 2) 1 тема 3) Таймер 4) ${Math.min(tk,2)} задач`; }
  if (l.includes('прогресс')) { const d = state.homework.filter(x=>x.done).length, t2 = state.homework.length; return `📊 XP: ${state.xp}<br>🔥 Streak: ${state.streak}<br>📚 ДЗ: ${d}/${t2}`; }
  if (l.includes('мотив')) { const qq = QUOTES[Math.floor(Math.random()*QUOTES.length)]; return `💭 «${qq.text}»<br>— ${qq.author}`; }
  if (l.includes('привет')) return `Привет, ${state.name||'друг'}! 👋`;
  if (l.includes('помощь')) return 'Умею: «Что делать?», «Прогресс», «Мотивация», «Шутка», «Совет»';
  if (l.includes('каникул')) {
    if (state.vacationStart && state.vacationEnd) {
      const today = new Date(todayISO()+'T00:00:00'), vS = new Date(state.vacationStart+'T00:00:00'), vE = new Date(state.vacationEnd+'T00:00:00');
      if (today < vS) { const left = Math.max(0, Math.round((vS-today)/86400000)); return `🏖 До каникул: ${left} ${plural(left,['день','дня','дней'])}!`; }
      if (today > vE) return '🎒 Каникулы прошли!';
      const left = Math.max(0, Math.round((vE-today)/86400000));
      return `🎉 Каникулы! Осталось ${left} ${plural(left,['день','дня','дней'])}!`;
    }
    if (!state.vacationStart) return '📅 Укажи дату!';
    const left = -daysBetween(state.vacationStart); if (left <= 0) return '🎉 Каникулы!';
    return `🏖 До каникул: ${left} ${plural(left,['день','дня','дней'])}!`;
  }
  if (l.includes('шутк')) { const j = ['Почему учебник грустный? Одни проблемы! 📉','Что сказал ноль единице? Ты много значишь! 🔢']; return '😄 ' + j[Math.floor(Math.random()*j.length)]; }
  if (l.includes('россия')) return '🇷🇺 Россия — вперёд!';
  if (l.includes('совет')) { const a = ['Начни с простого','Сделай 5 минут','Убери телефон','Пей воду','Разбей на 3']; return '💡 ' + a[Math.floor(Math.random()*a.length)]; }
  if (l.includes('устал')) return '😴 Отдохни 5 минут.';
  if (l.includes('время')) { const d = new Date(); return `⏰ ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
  if (l.includes('достижен')) return `🏆 Открыто: ${(state.achievements||[]).length} + ${(state.memeAchievements||[]).length} мемных`;
  if (l.includes('premium')) return '💎 Premium: 14+ ответов, безлимит, −30%!';
  if (l.includes('спасибо')) return '😊 Рад!';
  return '🤔 Спроси: «Что делать?», «Прогресс», «Мотивация», «Совет»';
}

/* ============================================================
   LEVEL INFO / GREETING / AVATAR
============================================================ */
function openLevelInfo() {
  const i = getLevelIndex(state.xp), l = LEVELS[i], n = LEVELS[i+1];
  const c = document.getElementById('levelInfoContent'); if (!c) return;
  c.innerHTML = `<div style="text-align:center;margin-bottom:16px;"><div style="font-size:3rem;">${l.icon}</div><div style="font-size:1.3rem;font-weight:800;">${l.name}</div></div><div class="progress-card"><div class="progress-card-header"><span>⭐</span><span>${state.xp} XP</span></div>${n?`<div class="progress-card-label">До «${n.name}»: ${l.max-state.xp} XP</div>`:'<div class="progress-card-label">Максимум!</div>'}</div>`;
  document.getElementById('levelInfoModal').classList.add('active');
}
function greetingClick() {
  const c = document.querySelector('.greeting-card'); if (c) { c.classList.add('pulse'); setTimeout(() => c.classList.remove('pulse'), 900); }
  const h = new Date().getHours(); let msg, e;
  if (h < 5) { msg = 'Доброй ночи! 😴'; e = 'sleepy'; }
  else if (h < 12) { msg = 'Доброе утро! ☀️'; e = 'happy'; }
  else if (h < 17) { msg = 'Добрый день! 💪'; e = 'happy'; }
  else if (h < 23) { msg = 'Добрый вечер! 🌙'; e = 'love'; }
  else { msg = 'Поздно 🌜'; e = 'sleepy'; }
  showToast(msg, 'info'); setEmotion(e, 1500); vibrate(20); sSuccess();
}
function avatarClick() {
  const a = document.getElementById('nomiAvatar'); if (!a) return;
  const now = Date.now();
  if (now - state.nomiLastClickTime > 2000) state.nomiClickCount = 0;
  state.nomiClickCount++; state.nomiLastClickTime = now;
  a.classList.add('jumping');
  const r = document.getElementById('nomiRing');
  if (r) { r.classList.add('rainbow'); setTimeout(() => r.classList.remove('rainbow'), 2000); }
  sSuccess(); vibrate(20);
  setTimeout(() => a.classList.remove('jumping'), 700);
  if (state.nomiClickCount >= 5) { setEmotion('angry', 2000); showToast('Хватит! 😠', 'warning'); state.nomiClickCount = 0; }
  else { const e = ['happy','excited','love']; setEmotion(e[Math.floor(Math.random()*e.length)], 1500); }
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
============================================================ */
function init() {
  loadState();
  if (state.theme === 'light') document.body.classList.add('light-theme');
  if (isPrem()) { document.body.classList.add('premium-active'); initParticles(); }
  if (state.fontSize === 'small') document.documentElement.style.setProperty('--font-size-base', '13px');
  else if (state.fontSize === 'large') document.documentElement.style.setProperty('--font-size-base', '17px');
  if (!state.id) state.id = generateId();
  if (state.nomiLookActive?.eyes === 'love') state.nomiLookActive.eyes = 'heart';
  if (state.nomiLookActive?.eyes === 'rainbow') state.nomiLookActive.eyes = 'cosmic';
  buildNav(); updateTopbar(); updateXP(); updateGreeting(); updateClock();
  updateNomiAvatar(); updateProgressBars(); renderQuickActions(); updateHomeQuickCounts();
  renderDailyCard(); renderChest(); ensureSchedule(); updateSchoolDisplay();
  refreshTimerOptions(); updateTitleSelect(); renderCustomColors();
  const g = document.getElementById('classGrid');
  if (g) g.innerHTML = Array.from({length:11}, (_,i) => `<button class="class-btn" data-grade="${i+1}">${i+1}</button>`).join('');
  document.getElementById('toggleDarkTheme')?.addEventListener('change', (e) => { state.theme = e.target.checked ? 'dark' : 'light'; document.body.classList.toggle('light-theme', state.theme === 'light'); saveState(); });
  document.getElementById('toggleNotifications')?.addEventListener('change', (e) => { state.notifications = e.target.checked; saveState(); });
  document.getElementById('toggleSounds')?.addEventListener('change', (e) => { state.sounds = e.target.checked; saveState(); });
  document.getElementById('toggleVibration')?.addEventListener('change', (e) => { state.vibration = e.target.checked; saveState(); });
  document.getElementById('profileClass')?.addEventListener('change', (e) => { state.grade = parseInt(e.target.value); saveState(); });
  document.getElementById('hwSearch')?.addEventListener('input', renderHw);
  document.getElementById('hwSort')?.addEventListener('change', renderHw);
  document.querySelectorAll('#taskFilters .chip').forEach(b => { b.onclick = () => { document.querySelectorAll('#taskFilters .chip').forEach(x => x.classList.remove('active')); b.classList.add('active'); currentFilterTask = b.dataset.filter; renderChecklist(); }; });
  document.querySelectorAll('#shopTabs .shop-tab').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('#shopTabs .shop-tab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.shop-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('shop-panel-' + b.dataset.tab)?.classList.add('active');
      if (b.dataset.tab === 'look') renderNomiLook();
    };
  });
  setTimeout(() => {
    document.getElementById('loading-screen')?.classList.add('hidden');
    if (!state.onboarded) {
      document.getElementById('onboarding').classList.add('active');
      document.querySelectorAll('.class-btn').forEach(b => b.onclick = () => { document.querySelectorAll('.class-btn').forEach(x => x.classList.remove('selected')); b.classList.add('selected'); });
      document.getElementById('btnNameNext')?.addEventListener('click', () => {
        const n = document.getElementById('inputName').value.trim();
        if (!n) { showToast('Введите имя', 'error'); return; }
        onboard.name = n;
        document.getElementById('step-name').classList.remove('active');
        document.getElementById('step-class').classList.add('active');
      });
      document.getElementById('btnClassFinish')?.addEventListener('click', () => {
        const s = document.querySelector('.class-btn.selected');
        if (!s) { showToast('Выберите класс', 'error'); return; }
        onboard.grade = parseInt(s.dataset.grade);
        onboardFinish();
      });
    } else showScreen('home');
    checkAchievements();
  }, 800);
  setInterval(updateClock, 30000);
  setInterval(checkRemindersPush, 30000);
  setInterval(updateGreeting, 60000);
}

window.addEventListener('DOMContentLoaded', init);

/* ------------------------------------------------------------
   TEMP GLOBAL EXPORTS — удалить при переезде на Vue.
   Нужно потому, что модули не шарят scope в window,
   а HTML использует onclick="".
   ------------------------------------------------------------ */
Object.assign(window, {
  // Навигация и экраны
  showScreen, backFromTopic, toggleFab, closeFab, closeModal,
  selectClassGroup, selectClass, selectSubject,
  openTopic, addToFridge, linkTopicToHw,
  openLevelInfo, openPremiumModal, openPremiumLifetime,
  selectPlan, confirmPurchase, activatePromo, openDailyChest,
  openBreath, closeBreath, openActivityModal, openLessonModal,
  openHwModal, openReminderModal, openFlashCardModal,

  // Ном
  toggleChat, quickReply, toggleChatMic, sendChat,
  greetingClick, avatarClick,

  // Онбординг
  onboardNext, onboardBack,

  // ДЗ
  toggleHwSelect, toggleHwDone, deleteHw,
  bulkDeleteHw, bulkDoneHw, clearHwSelection,
  setHwPriority, saveHw,

  // Задачи
  toggleTaskSelect, toggleTask, deleteTask,
  bulkDeleteTask, bulkDoneTask, clearTaskSelection,
  addTask,

  // Расписание
  copyDayPrompt, clearDayPrompt,
  saveLesson, deleteLesson,
  saveActivity, deleteActivity,

  // Таймер
  toggleTimer, resetTimer, skipToBreak, onTimerModeChange,

  // Тема и задачи в ней
  checkProblem, toggleHint, toggleSolution, markSolved,
  reviewFridge,

  // Напоминания
  saveReminder, deleteReminder, requestNotificationPermission,

  // Карточки
  saveFlashCard, selectDeck, checkFlashAnswer,

  // Мотивация
  newRandomQuote, saveQuoteToFavorites, moreMotivation,

  // Настройки
  editName, confirmClearData, setFontSize,
  applyCustomColor, quickEditStudy, quickEditVacation, saveQuickDates, quickVacation,

  // Магазин
  buyTheme, buyAvatarColor, buyHat, buyBackground, pickLook,
  selectPetSkin, feedPet, playWithPet, petPet,
});

// P.S если чего-то не хватает — открой консоль, (crtl + shift + I)
// ошибка "X is not defined" покажет имя функции, которую надо добавить в этот блок
