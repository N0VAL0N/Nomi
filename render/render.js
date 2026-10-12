// render/render.js

/* ============================================================
   NOMI — RENDER
   ------------------------------------------------------------
   Парсер мини-разметки + HTML-адаптер.
   Единственная функция, которую видит app.js: renderTheoryHTML.

   Мини-разметка:
     **жирный**  -> { t:'b' }
     *курсив*    -> { t:'i' }
     `код`       -> { t:'c' }
     обычный     -> { t:'t' }

   Формат блока теории (все поля опциональны):
     { h, p, ul, ol, table: { head, rows }, callout, tone, code }
   ============================================================ */

/* ---------- 1. ПАРСЕР (остаётся навсегда, в т.ч. в Vue) ---------- */

export function richSegments(text) {
  if (text == null) return [];
  const src = String(text);
  const out = [];
  const re = /\*\*([^*]+?)\*\*|\*([^*]+?)\*|`([^`]+?)`/g;
  let last = 0;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out.push({ t: 't', s: src.slice(last, m.index) });
    if (m[1] != null) out.push({ t: 'b', s: m[1] });
    else if (m[2] != null) out.push({ t: 'i', s: m[2] });
    else if (m[3] != null) out.push({ t: 'c', s: m[3] });
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ t: 't', s: src.slice(last) });
  return out;
}

export function prepareBlock(block) {
  if (!block || typeof block !== 'object') return null;
  const out = {};
  if (block.h) out.h = richSegments(block.h);
  if (block.p) out.p = richSegments(block.p);
  if (Array.isArray(block.ul) && block.ul.length) out.ul = block.ul.map(richSegments);
  if (Array.isArray(block.ol) && block.ol.length) out.ol = block.ol.map(richSegments);
  if (block.table && Array.isArray(block.table.head) && Array.isArray(block.table.rows)) {
    out.table = {
      head: block.table.head.map(richSegments),
      rows: block.table.rows.map(r => r.map(richSegments))
    };
  }
  if (block.callout) {
    out.callout = richSegments(block.callout);
    if (block.tone) out.tone = block.tone;
  }
  if (block.code) out.code = String(block.code);
  return Object.keys(out).length ? out : null;
}

export function prepareTheory(blocks) {
  if (!blocks) return [];
  if (!Array.isArray(blocks)) {
    console.warn('[render] theory is not an array:', blocks);
    return [];
  }
  return blocks.map(prepareBlock).filter(Boolean);
}

/* ---------- 2. HTML-ADAPTER (удалить при переезде на Vue) ---------- */

function escapeHtmlLocal(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function segToHtml(seg) {
  const s = escapeHtmlLocal(seg.s);
  if (seg.t === 'b') return '<strong>' + s + '</strong>';
  if (seg.t === 'i') return '<em>' + s + '</em>';
  if (seg.t === 'c') return '<code>' + s + '</code>';
  return s;
}
function segsToHtml(segs) {
  if (!segs || !segs.length) return '';
  return segs.map(segToHtml).join('');
}

export function renderTheoryHTML(blocks) {
  return prepareTheory(blocks).map(b => {
    let html = '';
    if (b.h) html += '<h3>' + segsToHtml(b.h) + '</h3>';
    if (b.p) html += '<p>' + segsToHtml(b.p) + '</p>';
    if (b.ul) html += '<ul>' + b.ul.map(i => '<li>' + segsToHtml(i) + '</li>').join('') + '</ul>';
    if (b.ol) html += '<ol>' + b.ol.map(i => '<li>' + segsToHtml(i) + '</li>').join('') + '</ol>';
    if (b.table) {
      const head = b.table.head.map(h => '<th>' + segsToHtml(h) + '</th>').join('');
      const body = b.table.rows.map(r => '<tr>' + r.map(c => '<td>' + segsToHtml(c) + '</td>').join('') + '</tr>').join('');
      html += '<table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>';
    }
    if (b.callout) html += '<div class="callout ' + (b.tone || '') + '">' + segsToHtml(b.callout) + '</div>';
    if (b.code) html += '<pre><code>' + escapeHtmlLocal(b.code) + '</code></pre>';
    return html;
  }).join('');
}