export type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'

export interface SymbolInfo {
  symbol: string
  baseAsset: string
}

export interface VolumeChangeSeries {
  interval: string
  limit: number
  symbols: string[]
  series: Record<string, number>[]
}

const BASE = import.meta.env.VITE_API_URL ?? ''

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(BASE + path, location.origin)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? res.statusText)
  }
  return res.json()
}

export async function fetchSymbols(): Promise<SymbolInfo[]> {
  const data = await get<{ count: number; symbols: SymbolInfo[] }>('/api/symbols')
  return data.symbols
}

export interface Ticker {
  symbol: string
  last_price: number
  change_24h_pct: number
  high_24h: number
  low_24h: number
  volume_24h: number
  turnover_24h: number
}

export async function fetchTickers(limit = 100): Promise<Ticker[]> {
  const data = await get<{ count: number; tickers: Ticker[] }>(`/api/tickers?limit=${limit}`)
  return data.tickers
}

export async function fetchVolumeChange(
  symbols: string[],
  interval: Interval,
  limit: number,
): Promise<VolumeChangeSeries> {
  return get('/api/volume/change', {
    symbols: symbols.join(','),
    interval,
    limit: String(limit),
  })
}
