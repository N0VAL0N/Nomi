// src/data/topics.ts
import allRaw from './topics/index.js'
import { SUBJECT_ICONS } from './subjects'
import type { RawTopic, Topic } from '@/types/topic'

let cache: Topic[] | null = null

export function getAllTopics(): Topic[] {
  if (cache) return cache
  cache = (allRaw as RawTopic[]).map((t) => ({
    id: t.id,
    class: t.class,
    classGroup: t.classGroup || '5-6',
    subject: t.subject,
    title: t.title,
    short: t.short || '',
    icon: SUBJECT_ICONS[t.subject] || '📘',
    theory: t.theory || [],
    problems: (t.problems || []).map((p) => ({
      q: p.q,
      solution: p.solution || p.answer || '',
      hint: p.hint || ''
    })),
    formulas: t.formulas || []
  }))
  return cache
}

export function getTopicsByClass(grade: number): Topic[] {
  return getAllTopics().filter((t) => t.class === grade)
}

export function getTopicsByClassAndSubject(grade: number, subject: string | null): Topic[] {
  const all = getTopicsByClass(grade)
  if (!subject) return all
  return all.filter((t) => t.subject === subject)
}

export function getSubjectsForClass(grade: number): string[] {
  const set = new Set<string>()
  getTopicsByClass(grade).forEach((t) => set.add(t.subject))
  return Array.from(set).sort()
}