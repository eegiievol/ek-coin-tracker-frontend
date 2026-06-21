import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, ReferenceLine,
} from 'recharts'
import { fetchTickers, fetchVolumeRaw, fetchSymbols } from '../api/client'
import type { Ticker, Interval, SymbolInfo } from '../api/client'
import { buildColorMap } from '../components/VolumeChart'
import SymbolSelect from '../components/SymbolSelect'
import SimpleDropdown from '../components/SimpleDropdown'
import ChartLegend from '../components/ChartLegend'

export function formatUSDT(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000)     return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000)         return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

type View = 'ranking' | 'history'

const DEFAULT_SELECTED = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']

const INTERVAL_OPTIONS: { value: Interval; label: string }[] = [
  { value: '1m',  label: '1M'  },
  { value: '5m',  label: '5M'  },
  { value: '15m', label: '15M' },
  { value: '1h',  label: '1H'  },
  { value: '4h',  label: '4H'  },
  { value: '1d',  label: '1D'  },
  { value: '1w',  label: '1W'  },
]

const LIMIT_OPTIONS = [
  { value: '50',  label: '50 candles'  },
  { value: '100', label: '100 candles' },
  { value: '200', label: '200 candles' },
  { value: '500', label: '500 candles' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RankingTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const t: Ticker = payload[0].payload
  return (
    <div style={tooltipStyle}>
      <div style={{ color: '#e6edf3', fontWeight: 600, marginBottom: 6 }}>{t.symbol}</div>
      <div style={{ color: '#8b949e', marginBottom: 2 }}>24h Volume: <span style={{ color: '#3b82f6' }}>{formatUSDT(t.turnover_24h)}</span></div>
      <div style={{ color: '#8b949e', marginBottom: 2 }}>Price: <span style={{ color: '#c9d1d9' }}>${t.last_price.toLocaleString()}</span></div>
      <div style={{ color: '#8b949e' }}>
        24h Change:{' '}
        <span style={{ color: t.change_24h_pct >= 0 ? '#22c55e' : '#ef4444' }}>
          {t.change_24h_pct >= 0 ? '+' : ''}{t.change_24h_pct.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HistoryTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value).slice(0, 10)
  return (
    <div style={{ ...tooltipStyle, maxHeight: 280, overflowY: 'auto' }}>
      <div style={{ color: '#8b949e', marginBottom: 6 }}>{new Date(label).toLocaleString()}</div>
      {sorted.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: '#c9d1d9' }}>{formatUSDT(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function formatTime(ts: number, interval: Interval): string {
  const d = new Date(ts)
  if (interval === '1w' || interval === '1d')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function Volume24h() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('ranking')

  // Ranking state
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [topN, setTopN] = useState(30)

  // History state
  const [allSymbols, setAllSymbols] = useState<SymbolInfo[]>([])
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED)
  const [interval, setInterval] = useState<Interval>('1d')
  const [limit, setLimit] = useState('100')
  const [historySeries, setHistorySeries] = useState<Record<string, number>[]>([])
  const [historySymbols, setHistorySymbols] = useState<string[]>([])
  const [colors, setColors] = useState<Record<string, string>>({})
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load ranking data
  useEffect(() => {
    if (view !== 'ranking') return
    setLoading(true)
    setError('')
    fetchTickers(100)
      .then(setTickers)
      .catch(() => setError('Failed to load ticker data'))
      .finally(() => setLoading(false))
  }, [view])

  // Load symbol list for history picker
  useEffect(() => {
    fetchSymbols().then(setAllSymbols).catch(() => {})
  }, [])

  // Load history data
  const loadHistory = useCallback(async () => {
    const syms = selected.length > 0 ? selected : DEFAULT_SELECTED
    setLoading(true)
    setError('')
    try {
      const result = await fetchVolumeRaw(syms, interval, Number(limit))
      setHistorySeries(result.series)
      setHistorySymbols(result.symbols)
      setColors(buildColorMap(result.symbols))
      setHidden(new Set())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [selected, interval, limit])

  useEffect(() => {
    if (view === 'history') loadHistory()
  }, [view, loadHistory])

  function toggleHidden(sym: string) {
    setHidden(prev => {
      const next = new Set(prev)
      next.has(sym) ? next.delete(sym) : next.add(sym)
      return next
    })
  }

  const visibleSymbols = historySymbols.filter(s => !hidden.has(s))
  const displayedTickers = tickers.slice(0, topN)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px 20px', gap: 16 }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/')} style={backBtn}>← Home</button>
        <span style={{ color: '#30363d' }}>|</span>
        <span style={{ fontSize: 13, color: '#8b949e' }}>24H Volume</span>
      </div>

      {/* View toggle + controls */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['ranking', 'history'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? '#1f6feb' : '#161b22',
              border: '1px solid #30363d', color: '#c9d1d9',
              padding: '6px 20px', cursor: 'pointer', fontSize: 13,
              borderRadius: v === 'ranking' ? '4px 0 0 4px' : '0 4px 4px 0',
              borderRight: v === 'ranking' ? 'none' : '1px solid #30363d',
            }}>
              {v === 'ranking' ? 'Ranking' : 'History'}
            </button>
          ))}
        </div>

        {view === 'ranking' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[15, 30, 50].map(n => (
              <button key={n} onClick={() => setTopN(n)} style={{
                background: topN === n ? '#1f6feb' : '#161b22',
                border: '1px solid #30363d', color: '#c9d1d9',
                padding: '4px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
              }}>Top {n}</button>
            ))}
          </div>
        )}

        {view === 'history' && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <SymbolSelect symbols={allSymbols} selected={selected} onChange={setSelected} />
            <SimpleDropdown label="Interval" value={interval} options={INTERVAL_OPTIONS} onChange={setInterval} />
            <SimpleDropdown label="Candles"  value={limit}    options={LIMIT_OPTIONS}    onChange={setLimit}    />
            <button onClick={loadHistory} disabled={loading} style={{
              background: '#1f6feb', border: 'none', color: '#fff',
              padding: '6px 18px', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 500, color: '#e6edf3', textAlign: 'center' }}>
        {view === 'ranking' ? '24H Volume Ranking — Bybit USDT Perpetuals' : '24H Volume History — USDT Turnover'}
      </h2>

      {error && <div style={errorBox}>{error}</div>}

      {loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
          Loading…
        </div>
      )}

      {/* Ranking bar chart */}
      {!loading && !error && view === 'ranking' && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayedTickers} layout="vertical" margin={{ top: 4, right: 80, left: 20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
              <XAxis type="number" tickFormatter={formatUSDT} tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="symbol" width={110} tick={{ fill: '#c9d1d9', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<RankingTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="turnover_24h" radius={[0, 3, 3, 0]}>
                {displayedTickers.map((t, i) => (
                  <Cell key={t.symbol} fill={i < 3 ? '#3b82f6' : i < 10 ? '#1d4ed8' : '#1e3a5f'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History line chart */}
      {!loading && !error && view === 'history' && historySeries.length > 0 && (
        <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historySeries} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
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
                  tickFormatter={formatUSDT}
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <ReferenceLine y={0} stroke="#30363d" strokeDasharray="4 2" />
                <Tooltip content={<HistoryTooltip />} />
                {visibleSymbols.map(sym => (
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
          </div>
          <div style={{ width: 160, flexShrink: 0, background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '10px 8px' }}>
            <ChartLegend
              symbols={historySymbols}
              colors={colors}
              series={historySeries}
              hidden={hidden}
              onToggle={toggleHidden}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const backBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid #30363d', color: '#8b949e',
  padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
}

const errorBox: React.CSSProperties = {
  background: '#2d1b1b', border: '1px solid #6e2e2e', borderRadius: 6,
  padding: '10px 16px', color: '#f85149', fontSize: 13,
}

const tooltipStyle: React.CSSProperties = {
  background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '10px 14px', fontSize: 12,
}
