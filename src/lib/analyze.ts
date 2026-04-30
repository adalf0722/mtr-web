import type { HopData, AnalyzedHop, AnalysisResult, HopStatus } from '../types'

export function analyze(target: string, hops: HopData[]): AnalysisResult {
  const analyzed: AnalyzedHop[] = hops.map((hop, i) => {
    const prevAvg = i > 0 ? hops[i - 1].avg : 0
    const rttSpike = hop.avg > 0 && (hop.avg - prevAvg) > 100

    let status: HopStatus = 'ok'
    if (hop.loss > 20) status = 'error'
    else if (hop.loss > 0) status = 'warn'
    if (rttSpike && status === 'ok') status = 'rtt-spike'

    return { ...hop, status, rttSpike }
  })

  const lastHop = analyzed[analyzed.length - 1]
  const middle = analyzed.slice(0, -1)
  const middleHasRealLoss = middle.some(h => h.loss > 20)
  const middleAllClean = middle.every(h => h.loss <= 5)

  // ICMP rate limit pattern: last hop shows loss but RTT is stable, and middle hops are clean.
  // Real packet loss usually correlates with RTT instability or sustained loss across many hops.
  const lastHopRttStable = lastHop && lastHop.avg > 0 && (lastHop.worst - lastHop.best) < 50
  const looksLikeRateLimit =
    lastHop && lastHop.loss > 0 && lastHop.loss <= 50 && middleAllClean && lastHopRttStable

  let summary: string
  let healthy: boolean

  if (lastHop && lastHop.loss > 50 && !looksLikeRateLimit) {
    summary = `目的地（${target}）或路徑存在問題，最後一跳有 ${lastHop.loss}% 封包掉失。建議聯繫 ISP 或等待對方修復。`
    healthy = false
  } else if (looksLikeRateLimit) {
    summary = `目的地對 ICMP 封包限速（顯示 ${lastHop.loss}% 假性掉包），但 RTT 穩定，實際連線正常。這是 Google、Cloudflare 等大型服務常見行為。`
    healthy = true
  } else if (middleHasRealLoss && lastHop && lastHop.loss <= 5) {
    summary = `中間節點對 ICMP 封包限速，目的地連線正常，通常不影響實際使用。這是路由器常見行為，不代表真實封包掉失。`
    healthy = true
  } else if (lastHop && lastHop.loss > 20) {
    summary = `目的地（${target}）或路徑存在問題，最後一跳有 ${lastHop.loss}% 封包掉失。建議聯繫 ISP 或等待對方修復。`
    healthy = false
  } else {
    summary = `路由路徑健康，無明顯封包掉失或延遲異常。`
    healthy = true
  }

  return { hops: analyzed, target, summary, healthy }
}
