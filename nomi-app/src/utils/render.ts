// src/utils/render.ts
// Парсер мини-разметки + HTML-адаптер.
// Логика перенесена 1:1 из старого render/render.js.

import type { TheoryBlock, TheoryTable } from '@/types/topic'

/* ---------- 1. ПАРСЕР ---------- */

export type RichSegment =
  | { t: 't'; s: string }
  | { t: 'b'; s: string }
  | { t: 'i'; s: string }
  | { t: 'c'; s: string }

export function richSegments(text: string | null | undefined): RichSegment[] {
  if (text == null) return []
  const src = String(text)
  const out: RichSegment[] = []
  const re = /\*\*([^*]+?)\*\*|\*([^*]+?)\*|`([^`]+?)`/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out.push({ t: 't', s: src.slice(last, m.index) })
    if (m[1] != null) out.push({ t: 'b', s: m[1] })
    else if (m[2] != null) out.push({ t: 'i', s: m[2] })
    else if (m[3] != null) out.push({ t: 'c', s: m[3] })
    last = re.lastIndex
  }
  if (last < src.length) out.push({ t: 't', s: src.slice(last) })
  return out
}

interface PreparedBlock {
  h?: RichSegment[]
  p?: RichSegment[]
  ul?: RichSegment[][]
  ol?: RichSegment[][]
  table?: { head: RichSegment[][]; rows: RichSegment[][][] }
  callout?: RichSegment[]
  tone?: string
  code?: string
}

export function prepareBlock(block: TheoryBlock): PreparedBlock | null {
  if (!block || typeof block !== 'object') return null
  const out: PreparedBlock = {}
  if (block.h) out.h = richSegments(block.h)
  if (block.p) out.p = richSegments(block.p)
  if (Array.isArray(block.ul) && block.ul.length) out.ul = block.ul.map(richSegments)
  if (Array.isArray(block.ol) && block.ol.length) out.ol = block.ol.map(richSegments)
  if (block.table && Array.isArray(block.table.head) && Array.isArray(block.table.rows)) {
    out.table = {
      head: block.table.head.map(richSegments),
      rows: block.table.rows.map((r) => r.map(richSegments))
    }
  }
  if (block.callout) {
    out.callout = richSegments(block.callout)
    if (block.tone) out.tone = block.tone
  }
  if (block.code) out.code = String(block.code)
  return Object.keys(out).length ? out : null
}

export function prepareTheory(blocks: TheoryBlock[] | null | undefined): PreparedBlock[] {
  if (!blocks) return []
  if (!Array.isArray(blocks)) {
    console.warn('[render] theory is not an array:', blocks)
    return []
  }
  return blocks.map(prepareBlock).filter((b): b is PreparedBlock => b !== null)
}

/* ---------- 2. HTML-ADAPTER ---------- */

function escapeHtmlLocal(s: string | null | undefined): string {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function segToHtml(seg: RichSegment): string {
  const s = escapeHtmlLocal(seg.s)
  if (seg.t === 'b') return '<strong>' + s + '</strong>'
  if (seg.t === 'i') return '<em>' + s + '</em>'
  if (seg.t === 'c') return '<code>' + s + '</code>'
  return s
}

function segsToHtml(segs: RichSegment[]): string {
  if (!segs || !segs.length) return ''
  return segs.map(segToHtml).join('')
}

export function renderTheoryHTML(blocks: TheoryBlock[] | null | undefined): string {
  return prepareTheory(blocks)
    .map((b) => {
      let html = ''
      if (b.h) html += '<h3>' + segsToHtml(b.h) + '</h3>'
      if (b.p) html += '<p>' + segsToHtml(b.p) + '</p>'
      if (b.ul)
        html +=
          '<ul>' + b.ul.map((i) => '<li>' + segsToHtml(i) + '</li>').join('') + '</ul>'
      if (b.ol)
        html +=
          '<ol>' + b.ol.map((i) => '<li>' + segsToHtml(i) + '</li>').join('') + '</ol>'
      if (b.table) {
        const head = b.table.head.map((h) => '<th>' + segsToHtml(h) + '</th>').join('')
        const body = b.table.rows
          .map(
            (r) =>
              '<tr>' + r.map((c) => '<td>' + segsToHtml(c) + '</td>').join('') + '</tr>'
          )
          .join('')
        html +=
          '<table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>'
      }
      if (b.callout)
        html += '<div class="callout ' + (b.tone || '') + '">' + segsToHtml(b.callout) + '</div>'
      if (b.code) html += '<pre><code>' + escapeHtmlLocal(b.code) + '</code></pre>'
      return html
    })
    .join('')
}