// tools/split.mjs
// node tools/split.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.join(__dirname, '..', 'topics', '_converted.js');
const OUT_DIR = path.join(__dirname, '..', 'topics');
const REPORT = path.join(__dirname, 'split-report.txt');

// --- 1. Загружаем сконвертированные темы ---

let topics;
try {
  const mod = await import('file://' + SRC + '?t=' + Date.now());
  topics = mod.default;
} catch (e) {
  console.error('Не смог загрузить _converted.js:', e.message);
  process.exit(1);
}
console.log(`Всего тем: ${topics.length}`);

// --- 2. Маппинг subject -> имя файла ---

const SUBJECT_TO_FILE = {
  'Русский язык': 'russian',
  'Литература': 'literature',
  'Литературное чтение': 'literature',
  'Математика': 'math',
  'Алгебра': 'algebra',
  'Геометрия': 'geometry',
  'Окружающий мир': 'world',
  'История': 'history',
  'Обществознание': 'social',
  'География': 'geography',
  'Биология': 'biology',
  'Физика': 'physics',
  'Химия': 'chemistry',
  'Информатика': 'informatics',
  'Английский язык': 'english',
  'Английский': 'english',
  'ИЗО': 'art',
  'Музыка': 'music',
  'ОБЖ': 'obzh',
  'ОБЗР': 'obzh',
  'Астрономия': 'astronomy',
  'Чтение': 'literature',
  'Труд': 'tech',
  'Физкультура': 'pe'
};

// --- 3. Разбиваем на группы ---

const files = new Map(); // key: "1-4/russian", value: [topics...]
const unknown = [];

topics.forEach(t => {
  let group = t.classGroup;
  if (!group) {
    // если нет classGroup — вычисляем по class
    const c = t.class || 5;
    if (c <= 4) group = '1-4';
    else if (c <= 6) group = '5-6';
    else if (c <= 9) group = '7-9';
    else group = '10-11';
  }

  const fileBase = SUBJECT_TO_FILE[t.subject];
  if (!fileBase) {
    unknown.push(`${t.id} (subject="${t.subject}")`);
    return;
  }

  const key = `${group}/${fileBase}`;
  if (!files.has(key)) files.set(key, []);
  files.get(key).push(t);
});

// --- 4. Пишем файлы ---

const written = [];

for (const [key, arr] of files.entries()) {
  const [group, subject] = key.split('/');
  const dir = path.join(OUT_DIR, group);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `${subject}.js`;
  const filePath = path.join(dir, fileName);

  // Сортируем по классу, потом по id
  arr.sort((a, b) => (a.class || 0) - (b.class || 0) || a.id.localeCompare(b.id));

  const header = `// topics/${group}/${fileName}\n// auto-generated from _converted.js\n\n`;
  const body = 'export default ' + JSON.stringify(arr, null, 2) + ';\n';

  fs.writeFileSync(filePath, header + body, 'utf8');
  written.push(`topics/${group}/${fileName} — ${arr.length} тем`);
}

// --- 5. Генерируем topics/index.js ---

const imports = [];
const spreads = [];
let idx = 0;

const sortedKeys = Array.from(files.keys()).sort();
sortedKeys.forEach(key => {
  const [group, subject] = key.split('/');
  const varName = `t${idx++}`;
  imports.push(`import ${varName} from './${group}/${subject}.js';`);
  spreads.push(`  ...${varName},`);
});

const indexContent = `// topics/index.js
// auto-generated. Не редактировать руками — только через tools/split.mjs
// Чтобы добавить новый файл тем — сгенерируй его и перезапусти split.mjs

${imports.join('\n')}

export default [
${spreads.join('\n')}
];
`;

fs.writeFileSync(path.join(OUT_DIR, 'index.js'), indexContent, 'utf8');

// --- 6. Отчёт ---

const lines = [];
lines.push(`Всего тем: ${topics.length}`);
lines.push(`Файлов создано: ${written.length}`);
lines.push('');
lines.push('=== ФАЙЛЫ ===');
written.forEach(w => lines.push('  ' + w));
if (unknown.length) {
  lines.push('');
  lines.push('=== НЕ РАСПОЗНАННЫЕ ПРЕДМЕТЫ ===');
  unknown.forEach(u => lines.push('  ' + u));
  lines.push('');
  lines.push('Добавь эти предметы в SUBJECT_TO_FILE в tools/split.mjs');
}
fs.writeFileSync(REPORT, lines.join('\n'), 'utf8');

console.log(lines.join('\n'));
console.log(`\nОтчёт: ${REPORT}`);
console.log(`Индекс: topics/index.js`);