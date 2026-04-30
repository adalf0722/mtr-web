import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseMtr } from '../lib/parseMtr'
import { encodeData } from '../lib/encode'

function detectOs(): 'mac' | 'windows' | 'linux' {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac')) return 'mac'
  return 'linux'
}

const CLI_DOWNLOADS = {
  mac:     { label: 'macOS (Apple Silicon)', file: 'mtr-runner-darwin-arm64' },
  windows: { label: 'Windows (64-bit)',       file: 'mtr-runner-windows-amd64.exe' },
  linux:   { label: 'Linux (64-bit)',          file: 'mtr-runner-linux-amd64' },
}

const RELEASES_URL = 'https://github.com/YOUR_ORG/mtr-runner/releases/latest/download'

export default function HomePage() {
  const [target, setTarget] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const os = detectOs()
  const download = CLI_DOWNLOADS[os]

  async function handlePaste() {
    setError('')
    try {
      const trimmed = pasteText.trim()
      const parsed = parseMtr(trimmed)
      const asJson = JSON.stringify({
        report: {
          mtr: { dst: parsed.target, src: '', tos: 0, psize: 64, bitpattern: 0, tests: 10 },
          hubs: parsed.hops.map(h => ({
            count: h.hop,
            host: h.hosts[0],
            'Loss%': h.loss,
            Snt: h.sent,
            Avg: h.avg,
            Best: h.best,
            Wrst: h.worst,
            StDev: h.stddev,
          })),
        },
      })
      const data = await encodeData(asJson)
      navigate(`/result?data=${data}`)
    } catch (e) {
      setError(`無法解析：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const cliCmd = `${download.file} --target ${target || 'example.com'} --site ${typeof window !== 'undefined' ? window.location.origin : 'https://your-site.com'}`

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">MTR 封包分析</h1>
      <p className="text-gray-400 mb-8">測試你的網路路徑到某個站點是否有封包掉失問題</p>

      <div className="mb-8">
        <label className="block text-sm text-gray-400 mb-2">目標 IP / 域名</label>
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
          placeholder="google.com 或 8.8.8.8"
          value={target}
          onChange={e => setTarget(e.target.value)}
        />
      </div>

      <div className="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <h2 className="font-semibold mb-3">1. 下載並執行 MTR Runner</h2>
        <p className="text-gray-400 text-sm mb-3">偵測到你使用 {download.label}</p>
        <a
          href={`${RELEASES_URL}/${download.file}`}
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm mb-3"
        >
          下載 {download.file}
        </a>
        <p className="text-gray-400 text-sm mb-2">下載後在終端機執行：</p>
        <pre className="bg-gray-800 rounded p-3 text-xs text-green-300 overflow-x-auto">{cliCmd}</pre>
        <p className="text-gray-500 text-xs mt-2">執行完成後瀏覽器會自動開啟結果頁</p>
      </div>

      <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
        <h2 className="font-semibold mb-3">2. 或手動貼上 MTR 輸出</h2>
        <p className="text-gray-400 text-sm mb-2">支援 <code className="text-blue-400">mtr --report</code>、<code className="text-blue-400">mtr --json</code>、<code className="text-blue-400">mtr --csv</code></p>
        <textarea
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-blue-500 h-32 resize-none"
          placeholder="貼上 MTR 輸出..."
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        <button
          className="mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm"
          disabled={!pasteText.trim()}
          onClick={handlePaste}
        >
          分析
        </button>
      </div>
    </div>
  )
}
