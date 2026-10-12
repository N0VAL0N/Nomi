import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.join(__dirname, '..', 'topics.js');
const OUT_DIR = path.join(__dirname, '..', 'topics');
const REPORT = path.join(__dirname, 'report.txt');

let topics;
try {
  const mod = await import('file://' + SRC);
  topics = mod.default;
} catch (e) {
  console.error('Не смог загрузить topics.js:', e.message);
  console.error(e.stack);
  process.exit(1);
}

console.log(`Всего тем: ${topics.length}`);

// --- 2. Конвертер одного HTML-блока в структуру ---

const warnings = [];

function htmlToBlocks(html, topicId) {
  if (!html) return [];
  if (typeof html !== 'string') return [{ legacy: html }];

  const $ = cheerio.load('<div id="root">' + html + '</div>', null, false);
  const $root = $('#root');
  const blocks = [];

  $root.children().each((_, el) => {
    const $el = $(el);
    const tag = el.tagName ? el.tagName.toLowerCase() : '';

    if (tag === 'h3') {
      blocks.push({ h: inline($el.html()) });
    } else if (tag === 'h4') {
      blocks.push({ h: inline($el.html()) });
    } else if (tag === 'p') {
      blocks.push({ p: inline($el.html()) });
    } else if (tag === 'ul') {
      const items = $el.children('li').map((_, li) => inline($(li).html())).get();
      if (items.length) blocks.push({ ul: items });
    } else if (tag === 'ol') {
      const items = $el.children('li').map((_, li) => inline($(li).html())).get();
      if (items.length) blocks.push({ ol: items });
    } else if (tag === 'table') {
      const head = [];
      const rows = [];
      $el.find('tr').each((i, tr) => {
        const $tr = $(tr);
        const cells = $tr.children('th, td').map((_, c) => inline($(c).html())).get();
        const isHead = $tr.children('th').length > 0;
        if (isHead && head.length === 0) head.push(...cells);
        else rows.push(cells);
      });
      blocks.push({ table: { head, rows } });
    } else if (tag === 'div') {
      // неожиданный div — сохраняем как legacy
      blocks.push({ legacy: $.html($el) });
      warnings.push(`${topicId}: неожиданный <div>`);
    } else {
      // что-то ещё (текст, br, hr) — оборачиваем в p или legacy
      blocks.push({ legacy: $.html($el) });
      warnings.push(`${topicId}: неожиданный <${tag}>`);
    }
  });

  // Текст вне тегов — тоже потеря, ловим
  const flatText = $root.contents().filter((_, n) => n.type === 'text').text().trim();
  if (flatText) {
    warnings.push(`${topicId}: голый текст вне тегов (${flatText.slice(0, 40)}...)`);
    blocks.push({ p: flatText });
  }

  return blocks;
}

// Превращает внутренности HTML-тега в мини-разметку
function inline(html) {
  if (html == null) return '';
  let s = String(html);

  // <strong>/<b> -> **...**
  s = s.replace(/<(strong|b)>(.*?)<\/\1>/gi, '**$2**');
  // <em>/<i> -> *...*
  s = s.replace(/<(em|i)>(.*?)<\/\1>/gi, '*$2*');
  // <code> -> `...`
  s = s.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  // <br> -> \n (пробел — потому что у нас плоский текст)
  s = s.replace(/<br\s*\/?>/gi, ' ');
  // Остальные теги — выкидываем, оставляем содержимое
  s = s.replace(/<[^>]+>/g, '');

  // HTML-entities
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&plusmn;/g, '±')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&radic;/g, '√')
    .replace(/&pi;/g, 'π')
    .replace(/&deg;/g, '°');

  return s.trim();
}

// --- 3. Прогоняем все темы, собираем статистику ---

let converted = 0;
let withWarnings = 0;
let legacyOnly = 0;

const results = topics.map(t => {
  const hasHtml = typeof t.theory === 'string' && t.theory.includes('<');
  if (!hasHtml) return t; // уже структура или пустая

  const blocks = htmlToBlocks(t.theory, t.id);
  const hasLegacy = blocks.some(b => b.legacy);

  converted++;
  if (hasLegacy) { legacyOnly++; withWarnings++; }

  return { ...t, theory: blocks };
});

// --- 4. Пишем отчёт ---

const lines = [];
lines.push(`Всего тем: ${topics.length}`);
lines.push(`С HTML-теорией: ${converted}`);
lines.push(`С проблемами (legacy): ${withWarnings}`);
lines.push('');
lines.push('=== ПРЕДУПРЕЖДЕНИЯ ===');
if (warnings.length === 0) {
  lines.push('Нет. Всё сконвертировано чисто.');
} else {
  warnings.forEach(w => lines.push(w));
}
fs.writeFileSync(REPORT, lines.join('\n'), 'utf8');

console.log(lines.join('\n'));
console.log(`\nОтчёт: ${REPORT}`);

// --- 5. Пишем новый файл в новом формате ---

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const out = '// auto-generated\n\nexport default ' +
  JSON.stringify(results, null, 2) +
  ';\n';
fs.writeFileSync(path.join(OUT_DIR, '_converted.js'), out, 'utf8');

console.log(`Новый файл: ${path.join(OUT_DIR, '_converted.js')}`);