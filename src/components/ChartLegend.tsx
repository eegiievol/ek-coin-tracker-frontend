interface Props {
  symbols: string[]
  colors: Record<string, string>
  series: Record<string, number>[]
  hidden: Set<string>
  onToggle: (sym: string) => void
}

export default function ChartLegend({ symbols, colors, series, hidden, onToggle }: Props) {
  const last = series[series.length - 1] ?? {}

  const sorted = [...symbols].sort((a, b) => {
    const av = (last[a] as number) ?? -Infinity
    const bv = (last[b] as number) ?? -Infinity
    return bv - av
  })

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      overflowY: 'auto', maxHeight: '100%', paddingRight: 4,
    }}>
      {sorted.map(sym => {
        const val = last[sym] as number | undefined
        const isHidden = hidden.has(sym)
        return (
          <div
            key={sym}
            onClick={() => onToggle(sym)}
            title="Click to toggle"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', opacity: isHidden ? 0.3 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <span style={{
              width: 20, height: 2, background: colors[sym],
              flexShrink: 0, borderRadius: 1,
            }} />
            <span style={{ fontSize: 11, color: '#c9d1d9', flex: 1 }}>{sym}</span>
            {val !== undefined && (
              <span style={{
                fontSize: 10, color: val >= 0 ? '#22c55e' : '#ef4444',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {val >= 0 ? '+' : ''}{val.toFixed(1)}%
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
