import { describe, it, expect } from 'vitest'
import { buildColorMap } from '../components/VolumeChart'

// formatUSDT is local to Volume24h — test it inline here
function formatUSDT(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000)     return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000)         return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

describe('formatUSDT', () => {
  it('formats billions correctly', () => {
    expect(formatUSDT(12_190_000_000)).toBe('$12.19B')
  })
  it('formats millions correctly', () => {
    expect(formatUSDT(785_750_000)).toBe('$785.75M')
  })
  it('formats thousands correctly', () => {
    expect(formatUSDT(9_160_000)).toBe('$9.16M')
  })
  it('formats thousands correctly', () => {
    expect(formatUSDT(1_500)).toBe('$1.50K')
  })
  it('formats sub-thousand values', () => {
    expect(formatUSDT(500)).toBe('$500.00')
  })
})

describe('buildColorMap', () => {
  it('assigns a color to each symbol', () => {
    const map = buildColorMap(['BTCUSDT', 'ETHUSDT', 'SOLUSDT'])
    expect(Object.keys(map)).toHaveLength(3)
    expect(map['BTCUSDT']).toMatch(/^#/)
    expect(map['ETHUSDT']).toMatch(/^#/)
  })

  it('assigns distinct colors to first symbols', () => {
    const map = buildColorMap(['BTCUSDT', 'ETHUSDT'])
    expect(map['BTCUSDT']).not.toBe(map['ETHUSDT'])
  })

  it('handles empty array', () => {
    expect(buildColorMap([])).toEqual({})
  })
})
