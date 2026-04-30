interface Props {
  summary: string
  healthy: boolean
}

export default function SummaryBox({ summary, healthy }: Props) {
  const borderColor = healthy ? 'border-green-700' : 'border-red-700'
  const bgColor = healthy ? 'bg-green-900/20' : 'bg-red-900/20'
  const icon = healthy ? '✓' : '✗'
  const iconColor = healthy ? 'text-green-400' : 'text-red-400'

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4 flex gap-3`}>
      <span className={`text-lg font-bold ${iconColor} mt-0.5`}>{icon}</span>
      <p className="text-gray-200 text-sm leading-relaxed">{summary}</p>
    </div>
  )
}
