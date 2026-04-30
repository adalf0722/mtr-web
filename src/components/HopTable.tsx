import type { AnalyzedHop } from '../types'

const STATUS_STYLES: Record<string, string> = {
  ok:          'bg-green-900 text-green-300',
  warn:        'bg-yellow-900 text-yellow-300',
  error:       'bg-red-900 text-red-300',
  'rtt-spike': 'bg-yellow-900 text-yellow-300',
}

const STATUS_LABEL: Record<string, string> = {
  ok:          '正常',
  warn:        '輕微掉包',
  error:       '封包掉失',
  'rtt-spike': '延遲異常',
}

interface Props {
  hops: AnalyzedHop[]
}

export default function HopTable({ hops }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700 text-left">
            <th className="px-3 py-2">Hop</th>
            <th className="px-3 py-2">Host</th>
            <th className="px-3 py-2">ASN / ISP</th>
            <th className="px-3 py-2">Loss%</th>
            <th className="px-3 py-2">Avg RTT</th>
            <th className="px-3 py-2">Best / Worst</th>
            <th className="px-3 py-2">狀態</th>
          </tr>
        </thead>
        <tbody>
          {hops.map(hop => (
            <tr key={hop.hop} className="border-b border-gray-800 hover:bg-gray-800/40">
              <td className="px-3 py-2 text-gray-400">{hop.hop}</td>
              <td className="px-3 py-2">{hop.hosts[0]}</td>
              <td className="px-3 py-2 text-gray-400 text-xs">
                {hop.asn ? <span>{hop.asn} {hop.isp}</span> : <span className="text-gray-600">—</span>}
              </td>
              <td className="px-3 py-2">{hop.loss}%</td>
              <td className="px-3 py-2">{hop.avg > 0 ? `${hop.avg.toFixed(1)} ms` : '—'}</td>
              <td className="px-3 py-2 text-gray-400">
                {hop.avg > 0 ? `${hop.best.toFixed(1)} / ${hop.worst.toFixed(1)} ms` : '—'}
              </td>
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_STYLES[hop.status]}`}>
                  {STATUS_LABEL[hop.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
