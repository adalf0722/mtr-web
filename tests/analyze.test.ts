import { describe, it, expect } from 'vitest'
import { analyze } from '../src/lib/analyze'
import type { HopData } from '../src/types'

const makeHop = (hop: number, loss: number, avg: number): HopData => ({
  hop, hosts: [`10.0.0.${hop}`], loss, sent: 10, avg, best: avg * 0.9, worst: avg * 1.2, stddev: 1,
})

describe('analyze', () => {
  it('marks loss=0 hops as ok', () => {
    const result = analyze('google.com', [makeHop(1, 0, 5), makeHop(2, 0, 12)])
    expect(result.hops[0].status).toBe('ok')
    expect(result.hops[1].status).toBe('ok')
    expect(result.healthy).toBe(true)
  })

  it('marks loss 1-20% as warn', () => {
    const result = analyze('google.com', [makeHop(1, 0, 5), makeHop(2, 15, 12)])
    expect(result.hops[1].status).toBe('warn')
  })

  it('marks loss >20% as error', () => {
    const result = analyze('google.com', [makeHop(1, 0, 5), makeHop(2, 50, 12)])
    expect(result.hops[1].status).toBe('error')
  })

  it('marks rtt spike >100ms over previous hop', () => {
    const result = analyze('google.com', [makeHop(1, 0, 5), makeHop(2, 0, 150)])
    expect(result.hops[1].rttSpike).toBe(true)
    expect(result.hops[1].status).toBe('rtt-spike')
  })

  it('summary: middle loss but last hop ok → ICMP rate limit message', () => {
    const hops = [makeHop(1, 0, 5), makeHop(2, 100, 0), makeHop(3, 0, 12)]
    const result = analyze('google.com', hops)
    expect(result.summary).toContain('ICMP')
    expect(result.healthy).toBe(true)
  })

  it('summary: last hop has loss → path problem message', () => {
    const hops = [makeHop(1, 0, 5), makeHop(2, 0, 12), makeHop(3, 60, 200)]
    const result = analyze('google.com', hops)
    expect(result.summary).toContain('ISP')
    expect(result.healthy).toBe(false)
  })

  it('summary: all ok → healthy message', () => {
    const hops = [makeHop(1, 0, 5), makeHop(2, 0, 12)]
    const result = analyze('google.com', hops)
    expect(result.summary).toContain('健康')
    expect(result.healthy).toBe(true)
  })
})
