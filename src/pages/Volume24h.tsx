import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchTickers } from '../api/client'
import type { Ticker } from '../api/client'

function formatUSDT(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000)     return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000)         return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const t: Ticker = payload[0].payload
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
      padding: '10px 14px', fontSize: 12,
    }}>
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

export default function Volume24h() {
  const navigate = useNavigate()
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topN, setTopN] = useState(30)

  useEffect(() => {
    setLoading(true)
    fetchTickers(100)
      .then(setTickers)
      .catch(() => setError('Failed to load ticker data'))
      .finally(() => setLoading(false))
  }, [])

  const displayed = tickers.slice(0, topN)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px 20px', gap: 16 }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/')} style={backBtn}>← Home</button>
        <span style={{ color: '#30363d' }}>|</span>
        <span style={{ fontSize: 13, color: '#8b949e' }}>24H Volume Ranking</span>
      </div>

      {/* Title + controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#e6edf3' }}>
          24H Volume Ranking — Bybit USDT Perpetuals
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {[15, 30, 50].map(n => (
            <button key={n} onClick={() => setTopN(n)} style={{
              background: topN === n ? '#1f6feb' : '#161b22',
              border: '1px solid #30363d', color: '#c9d1d9',
              padding: '4px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12,
            }}>
              Top {n}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
          Loading…
        </div>
      )}

      {!loading && !error && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayed}
              layout="vertical"
              margin={{ top: 4, right: 80, left: 20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatUSDT}
                tick={{ fill: '#8b949e', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="symbol"
                width={110}
                tick={{ fill: '#c9d1d9', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="turnover_24h" radius={[0, 3, 3, 0]}>
                {displayed.map((t, i) => (
                  <Cell
                    key={t.symbol}
                    fill={i < 3 ? '#3b82f6' : i < 10 ? '#1d4ed8' : '#1e3a5f'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
