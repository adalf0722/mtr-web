import type { HopData, MtrJsonReport } from '../types'

export interface ParseResult {
  target: string
  hops: HopData[]
}

export function parseMtr(input: string): ParseResult {
  const trimmed = input.trim()
  if (trimmed.startsWith('{')) return parseJson(trimmed)
  if (trimmed.startsWith('MTR.')) return parseCsv(trimmed)
  if (trimmed.includes('Loss%') && trimmed.includes('.|--')) return parseText(trimmed)
  throw new Error('Unrecognized MTR format')
}

function parseJson(input: string): ParseResult {
  const data: MtrJsonReport = JSON.parse(input)
  const { dst } = data.report.mtr
  const hops: HopData[] = data.report.hubs.map(h => ({
    hop: h.count,
    hosts: [h.host],
    loss: h['Loss%'],
    sent: h.Snt,
    avg: h.Avg,
    best: h.Best,
    worst: h.Wrst,
    stddev: h.StDev,
  }))
  return { target: dst, hops }
}

function parseText(input: string): ParseResult {
  const lines = input.split('\n')
  const hops: HopData[] = []

  for (const line of lines) {
    const hopMatch = line.match(/^\s*(\d+)\.\|--\s+(\S+)\s+([\d.]+)%\s+(\d+)\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
    if (hopMatch) {
      hops.push({
        hop: parseInt(hopMatch[1]),
        hosts: [hopMatch[2]],
        loss: parseFloat(hopMatch[3]),
        sent: parseInt(hopMatch[4]),
        avg: parseFloat(hopMatch[5]),
        best: parseFloat(hopMatch[6]),
        worst: parseFloat(hopMatch[7]),
        stddev: parseFloat(hopMatch[8]),
      })
    }
  }

  const lastKnown = [...hops].reverse().find(h => h.hosts[0] !== '???')
  const target = lastKnown?.hosts[0] ?? 'unknown'

  return { target, hops }
}

function parseCsv(input: string): ParseResult {
  const lines = input.split('\n').map(l => l.trim()).filter(Boolean)
  let target = ''
  const hops: HopData[] = []

  for (const line of lines) {
    if (line.startsWith('MTR.')) {
      const parts = line.split(',')
      target = parts[5] ?? 'unknown'
    } else if (line.startsWith('HUB,')) {
      const p = line.split(',')
      hops.push({
        hop: parseInt(p[1]),
        hosts: [p[2]],
        loss: parseFloat(p[3]),
        sent: parseInt(p[4]),
        avg: parseFloat(p[5]),
        best: parseFloat(p[7]),
        worst: parseFloat(p[8]),
        stddev: parseFloat(p[9] ?? '0'),
      })
    }
  }

  return { target, hops }
}
