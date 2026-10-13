// src/types/topic.ts
export interface TheoryTable {
  head: string[]
  rows: string[][]
}

export interface TheoryBlock {
  h?: string
  p?: string
  ul?: string[]
  ol?: string[]
  table?: TheoryTable
  callout?: string
  tone?: string
  code?: string
}

export interface RawProblem {
  q: string
  answer?: string
  solution?: string
  hint?: string
}

export interface RawTopic {
  id: string
  class: number
  classGroup?: string
  subject: string
  title: string
  short?: string
  theory: TheoryBlock[]
  problems?: RawProblem[]
  formulas?: string[]
}

export interface Problem {
  q: string
  solution: string
  hint: string
}

export interface Topic {
  id: string
  class: number
  classGroup: string
  subject: string
  title: string
  short: string
  icon: string
  theory: TheoryBlock[]
  problems: Problem[]
  formulas: string[]
}