import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { decodeData } from '../lib/encode'
import { parseMtr } from '../lib/parseMtr'
import { analyze } from '../lib/analyze'
import { lookupAsn } from '../lib/asn'
import HopTable from '../components/HopTable'
import SummaryBox from '../components/SummaryBox'
import type { AnalysisResult } from '../types'

type State = { phase: 'loading' } | { phase: 'error'; message: string } | { phase: 'done'; result: AnalysisResult }

export default function ResultPage() {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<State>({ phase: 'loading' })

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) { setState({ phase: 'error', message: '缺少 data 參數' }); return }

    ;(async () => {
      try {
        const json = await decodeData(data)
        const parsed = parseMtr(json)
        const result = analyze(parsed.target, parsed.hops)

        setState({ phase: 'done', result })

        const enriched = await Promise.all(
          result.hops.map(async hop => {
            const info = await lookupAsn(hop.hosts[0])
            return info ? { ...hop, asn: info.asn, isp: info.isp } : hop
          })
        )
        setState({ phase: 'done', result: { ...result, hops: enriched } })
      } catch (e) {
        setState({ phase: 'error', message: `解析失敗：${e instanceof Error ? e.message : String(e)}` })
      }
    })()
  }, [searchParams])

  if (state.phase === 'loading') {
    return <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <p className="text-gray-400">分析中...</p>
    </div>
  }

  if (state.phase === 'error') {
    return <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <p className="text-red-400">{state.message}</p>
    </div>
  }

  const { result } = state
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">MTR 分析報告</h1>
      <p className="text-gray-400 mb-6 text-sm">目標：{result.target}</p>
      <div className="mb-4">
        <SummaryBox summary={result.summary} healthy={result.healthy} />
      </div>
      <HopTable hops={result.hops} />
      <p className="mt-6 text-xs text-gray-600">此頁面 URL 可直接分享，所有資料儲存在網址中，不上傳任何伺服器。</p>
    </div>
  )
}
