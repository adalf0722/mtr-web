export interface HopData {
  hop: number
  hosts: string[]
  loss: number
  sent: number
  avg: number
  best: number
  worst: number
  stddev: number
  asn?: string
  isp?: string
}

export type HopStatus = 'ok' | 'warn' | 'error' | 'rtt-spike'

export interface AnalyzedHop extends HopData {
  status: HopStatus
  rttSpike: boolean
}

export interface AnalysisResult {
  hops: AnalyzedHop[]
  target: string
  summary: string
  healthy: boolean
}

export interface MtrJsonReport {
  report: {
    mtr: {
      dst: string
      src: string
      tos: number
      psize: number
      bitpattern: number
      tests: number
    }
    hubs: Array<{
      count: number
      host: string
      'Loss%': number
      Snt: number
      Avg: number
      Best: number
      Wrst: number
      StDev: number
    }>
  }
}
