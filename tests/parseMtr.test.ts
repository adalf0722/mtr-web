import { describe, it, expect } from 'vitest'
import { parseMtr } from '../src/lib/parseMtr'

const JSON_FIXTURE = JSON.stringify({
  report: {
    mtr: { dst: 'google.com', src: '192.168.1.1', tos: 0, psize: 64, bitpattern: 0, tests: 10 },
    hubs: [
      { count: 1, host: '192.168.1.1', 'Loss%': 0, Snt: 10, Avg: 1.2, Best: 0.9, Wrst: 2.1, StDev: 0.3 },
      { count: 2, host: '???',         'Loss%': 100, Snt: 10, Avg: 0,   Best: 0,   Wrst: 0,   StDev: 0   },
      { count: 3, host: '8.8.8.8',    'Loss%': 0,   Snt: 10, Avg: 12.4, Best: 11.1, Wrst: 14.2, StDev: 0.8 },
    ],
  },
})

const TEXT_FIXTURE = `
Start: 2024-01-15T10:00:00+0800
HOST: myhost                    Loss%   Snt   Last   Avg  Best  Wrst StDev
  1.|-- 192.168.1.1              0.0%    10    1.2   1.2   0.9   2.1   0.3
  2.|-- ???                    100.0%    10    0.0   0.0   0.0   0.0   0.0
  3.|-- 8.8.8.8                  0.0%    10   12.4  12.4  11.1  14.2   0.8
`

const CSV_FIXTURE = `MTR.6,myhost,0,0,64,google.com,10
HUB,1,192.168.1.1,0.0,10,1.2,1.2,0.9,2.1,0.3
HUB,2,???,100.0,10,0.0,0.0,0.0,0.0,0.0
HUB,3,8.8.8.8,0.0,10,12.4,12.4,11.1,14.2,0.8`

describe('parseMtr', () => {
  it('parses mtr JSON format', () => {
    const result = parseMtr(JSON_FIXTURE)
    expect(result.target).toBe('google.com')
    expect(result.hops).toHaveLength(3)
    expect(result.hops[0]).toMatchObject({ hop: 1, hosts: ['192.168.1.1'], loss: 0, avg: 1.2 })
    expect(result.hops[1]).toMatchObject({ hop: 2, hosts: ['???'], loss: 100 })
    expect(result.hops[2]).toMatchObject({ hop: 3, hosts: ['8.8.8.8'], loss: 0, avg: 12.4 })
  })

  it('parses mtr text format', () => {
    const result = parseMtr(TEXT_FIXTURE)
    expect(result.hops).toHaveLength(3)
    expect(result.hops[0]).toMatchObject({ hop: 1, hosts: ['192.168.1.1'], loss: 0 })
    expect(result.hops[2]).toMatchObject({ hop: 3, hosts: ['8.8.8.8'], avg: 12.4 })
  })

  it('parses mtr CSV format', () => {
    const result = parseMtr(CSV_FIXTURE)
    expect(result.hops).toHaveLength(3)
    expect(result.hops[0]).toMatchObject({ hop: 1, loss: 0 })
    expect(result.hops[1]).toMatchObject({ hop: 2, loss: 100 })
  })

  it('throws on unrecognized format', () => {
    expect(() => parseMtr('random garbage text')).toThrow('Unrecognized MTR format')
  })
})
