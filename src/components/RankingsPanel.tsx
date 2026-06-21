import { useState } from 'react'
import type { Ticker } from '../api/client'
import { formatUSDT } from '../pages/Volume24h'

type Mode = 'change' | 'volume'
const TOP_OPTIONS = [5, 10, 50] as const

interface Props {
  symbols: string[]
  colors: Record<string, string>
  series: Record<string, number>[]
  tickers: Ticker[]
  hidden: Set<string>
  onToggle: (sym: string) => void
}

export default function RankingsPanel({ symbols, colors, series, tickers, hidden, onToggle }: Props) {
  const [mode, setMode] = useState<Mode>('change')
  const [topN, setTopN] = useState<number>(10)

  const tickerMap = Object.fromEntries(tickers.map(t => [t.symbol, t]))
  const lastPoint = series[series.length - 1] ?? {}

  const ranked = [...symbols]
    .map(sym => ({
      sym,
      value: mode === 'change'
        ? ((lastPoint[sym] as number) ?? 0)
        : (tickerMap[sym]?.turnover_24h ?? 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>

      {/* Mode toggle */}
      <div style={{ display: 'flex' }}>
        {(['change', 'volume'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1,
            background: mode === m ? '#1f6feb' : '#161b22',
            border: '1px solid #30363d',
            color: '#c9d1d9',
            padding: '4px 0',
            cursor: 'pointer',
            fontSize: 10,
            borderRadius: m === 'change' ? '4px 0 0 4px' : '0 4px 4px 0',
          }}>
            {m === 'change' ? '% Change' : 'Vol $'}
          </button>
        ))}
      </div>

      {/* Top N selector */}
      <div style={{ display: 'flex', gap: 4 }}>
        {TOP_OPTIONS.map(n => (
          <button key={n} onClick={() => setTopN(n)} style={{
            flex: 1,
            background: topN === n ? '#21262d' : 'transparent',
            border: '1px solid #30363d',
            color: topN === n ? '#e6edf3' : '#8b949e',
            padding: '3px 0',
            cursor: 'pointer',
            fontSize: 10,
            borderRadius: 3,
          }}>
            {n}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 9, color: '#8b949e', paddingLeft: 2 }}>
        {mode === 'change' ? 'Vol % change (period end)' : '24h USDT turnover'}
      </div>

      {/* Ranked list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ranked.map((item, i) => {
          const isHidden = hidden.has(item.sym)
          const isPositive = item.value >= 0
          return (
            <div
              key={item.sym}
              onClick={() => onToggle(item.sym)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                cursor: 'pointer', opacity: isHidden ? 0.3 : 1,
                padding: '3px 4px', borderRadius: 3,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#161b22')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 9, color: '#555', width: 14, textAlign: 'right', flexShrink: 0 }}>
                {i + 1}
              </span>
              <span style={{
                width: 3, height: 10, borderRadius: 1, flexShrink: 0,
                background: colors[item.sym] ?? '#666',
              }} />
              <span style={{
                fontSize: 10, color: '#c9d1d9', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.sym.replace('USDT', '')}
              </span>
              <span style={{
                fontSize: 10, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                color: mode === 'change'
                  ? (isPositive ? '#22c55e' : '#ef4444')
                  : '#3b82f6',
              }}>
                {mode === 'change'
                  ? `${isPositive ? '+' : ''}${item.value.toFixed(1)}%`
                  : formatUSDT(item.value)
                }
              </span>
            </div>
          )
        })}

        {ranked.length === 0 && (
          <div style={{ color: '#8b949e', fontSize: 11, textAlign: 'center', marginTop: 20 }}>
            No data yet
          </div>
        )}
      </div>
    </div>
  )
}
