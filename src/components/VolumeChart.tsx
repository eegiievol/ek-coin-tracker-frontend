import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { Interval } from '../api/client'

interface Props {
  series: Record<string, number>[]
  symbols: string[]
  interval: Interval
  colors: Record<string, string>
}

const PALETTE = [
  '#22c55e','#f59e0b','#3b82f6','#ef4444','#a855f7',
  '#06b6d4','#f97316','#ec4899','#10b981','#6366f1',
  '#84cc16','#14b8a6','#e11d48','#8b5cf6','#0ea5e9',
  '#d97706','#059669','#dc2626','#7c3aed','#0891b2',
  '#65a30d','#0d9488','#be123c','#6d28d9','#0369a1',
  '#b45309','#047857','#b91c1c','#5b21b6','#075985',
]

export function buildColorMap(symbols: string[]): Record<string, string> {
  return Object.fromEntries(symbols.map((s, i) => [s, PALETTE[i % PALETTE.length]]))
}

function formatTime(ts: number, interval: Interval): string {
  const d = new Date(ts)
  if (interval === '1w' || interval === '1d') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatPct(v: number) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value).slice(0, 10)
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
      padding: '10px 14px', fontSize: 12, maxHeight: 300, overflowY: 'auto',
    }}>
      <div style={{ color: '#8b949e', marginBottom: 6 }}>{new Date(label).toLocaleString()}</div>
      {sorted.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: p.value >= 0 ? '#22c55e' : '#ef4444' }}>{formatPct(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function VolumeChart({ series, symbols, interval, colors }: Props) {
  if (!series.length) return null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={series} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
        <XAxis
          dataKey="open_time"
          tickFormatter={ts => formatTime(ts as number, interval)}
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={{ stroke: '#21262d' }}
          tickLine={false}
          minTickGap={60}
        />
        <YAxis
          tickFormatter={v => `${v}%`}
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <ReferenceLine y={0} stroke="#30363d" strokeDasharray="4 2" />
        <Tooltip content={<CustomTooltip />} />
        {symbols.map(sym => (
          <Line
            key={sym}
            type="linear"
            dataKey={sym}
            stroke={colors[sym]}
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
