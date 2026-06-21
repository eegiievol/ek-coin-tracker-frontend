import { useState, useEffect, useCallback } from 'react'
import { fetchSymbols, fetchVolumeChange } from './api/client'
import type { SymbolInfo, Interval, VolumeChangeSeries } from './api/client'
import SymbolSelect from './components/SymbolSelect'
import SimpleDropdown from './components/SimpleDropdown'
import VolumeChart, { buildColorMap } from './components/VolumeChart'
import ChartLegend from './components/ChartLegend'

const DEFAULT_SELECTED = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT',
  'DOGEUSDT','ADAUSDT','AVAXUSDT','LINKUSDT','DOTUSDT']

const INTERVAL_OPTIONS: { value: Interval; label: string }[] = [
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

export default function App() {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([])
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED)
  const [interval, setInterval] = useState<Interval>('1d')
  const [limit, setLimit] = useState('100')
  const [data, setData] = useState<VolumeChangeSeries | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [colors, setColors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSymbols()
      .then(setSymbols)
      .catch(() => setError('Failed to load symbols'))
  }, [])

  const load = useCallback(async () => {
    const syms = selected.length > 0 ? selected : DEFAULT_SELECTED
    setLoading(true)
    setError('')
    try {
      const result = await fetchVolumeChange(syms, interval, Number(limit))
      setData(result)
      setColors(buildColorMap(result.symbols))
      setHidden(new Set())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [selected, interval, limit])

  // Auto-load on param change
  useEffect(() => { load() }, [load])

  const visibleSymbols = data?.symbols.filter(s => !hidden.has(s)) ?? []

  function toggleHidden(sym: string) {
    setHidden(prev => {
      const next = new Set(prev)
      next.has(sym) ? next.delete(sym) : next.add(sym)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px 20px', gap: 16 }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>1. Exchange</div>
          <button style={{
            background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9',
            padding: '6px 14px', borderRadius: 4, cursor: 'default', fontSize: 13,
          }}>
            Binance Futures
          </button>
        </div>

        <SymbolSelect symbols={symbols} selected={selected} onChange={setSelected} />

        <SimpleDropdown
          label="Interval"
          value={interval}
          options={INTERVAL_OPTIONS}
          onChange={setInterval}
        />

        <SimpleDropdown
          label="Candles"
          value={limit}
          options={LIMIT_OPTIONS}
          onChange={setLimit}
        />

        <button
          onClick={load}
          disabled={loading}
          style={{
            background: '#1f6feb', border: 'none', color: '#fff',
            padding: '6px 18px', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 13, opacity: loading ? 0.6 : 1, alignSelf: 'flex-end',
          }}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#e6edf3', letterSpacing: '0.02em' }}>
          Exchange Specific Volume Analyzer
        </h2>
      </div>

      {error && (
        <div style={{
          background: '#2d1b1b', border: '1px solid #6e2e2e', borderRadius: 6,
          padding: '10px 16px', color: '#f85149', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Chart + Legend */}
      {data && (
        <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <VolumeChart
              series={data.series}
              symbols={visibleSymbols}
              interval={interval}
              colors={colors}
            />
          </div>
          <div style={{
            width: 160, flexShrink: 0,
            background: '#0d1117', border: '1px solid #21262d',
            borderRadius: 6, padding: '10px 8px',
          }}>
            <ChartLegend
              symbols={data.symbols}
              colors={colors}
              series={data.series}
              hidden={hidden}
              onToggle={toggleHidden}
            />
          </div>
        </div>
      )}

      {loading && !data && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
          Loading chart data…
        </div>
      )}
    </div>
  )
}
