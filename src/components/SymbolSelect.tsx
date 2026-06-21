import { useState, useRef, useEffect } from 'react'
import type { SymbolInfo } from '../api/client'

interface Props {
  symbols: SymbolInfo[]
  selected: string[]
  onChange: (v: string[]) => void
}

const DEFAULT_SYMBOLS = [
  'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT',
  'DOGEUSDT','ADAUSDT','AVAXUSDT','LINKUSDT','DOTUSDT',
]

export default function SymbolSelect({ symbols, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const isAll = selected.length === 0
  const filtered = symbols.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function toggle(sym: string) {
    if (selected.includes(sym)) {
      onChange(selected.filter(s => s !== sym))
    } else {
      onChange([...selected, sym])
    }
  }

  function selectAll() {
    onChange([])
    setOpen(false)
  }

  function selectDefaults() {
    onChange(DEFAULT_SYMBOLS.filter(s => symbols.some(sym => sym.symbol === s)))
    setOpen(false)
  }

  const label = isAll ? 'All' : selected.length === 1 ? selected[0] : `${selected.length} coins`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>2. Choose a Coin/s</div>
      <button onClick={() => setOpen(p => !p)} style={btnStyle}>
        {label} <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
      </button>

      {open && (
        <div style={dropdownStyle}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #21262d' }}>
            <input
              autoFocus
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={searchStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, padding: '6px 10px', borderBottom: '1px solid #21262d' }}>
            <button onClick={selectAll} style={quickBtn}>All</button>
            <button onClick={selectDefaults} style={quickBtn}>Top 10</button>
            {selected.length > 0 && (
              <button onClick={() => onChange([])} style={{ ...quickBtn, color: '#f85149' }}>Clear</button>
            )}
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {filtered.map(s => {
              const checked = selected.includes(s.symbol)
              return (
                <div
                  key={s.symbol}
                  onClick={() => toggle(s.symbol)}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: checked ? '#161b22' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#161b22')}
                  onMouseLeave={e => (e.currentTarget.style.background = checked ? '#161b22' : 'transparent')}
                >
                  <span style={{
                    width: 14, height: 14, border: '1px solid #30363d', borderRadius: 3,
                    background: checked ? '#1f6feb' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {checked && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                  </span>
                  {s.symbol}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: '#161b22',
  border: '1px solid #30363d',
  color: '#c9d1d9',
  padding: '6px 14px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  minWidth: 100,
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: 6,
  zIndex: 200,
  width: 220,
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
}

const searchStyle: React.CSSProperties = {
  width: '100%',
  background: '#161b22',
  border: '1px solid #30363d',
  color: '#c9d1d9',
  padding: '5px 8px',
  borderRadius: 4,
  fontSize: 12,
  outline: 'none',
}

const quickBtn: React.CSSProperties = {
  background: '#21262d',
  border: '1px solid #30363d',
  color: '#c9d1d9',
  padding: '3px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
}
