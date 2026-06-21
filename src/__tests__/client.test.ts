import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSymbols, fetchTickers, fetchVolumeChange } from '../api/client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(data: unknown, ok = true) {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 502,
    statusText: ok ? 'OK' : 'Bad Gateway',
    json: () => Promise.resolve(data),
  })
}

beforeEach(() => mockFetch.mockReset())

describe('fetchSymbols', () => {
  it('returns the symbols array from the API', async () => {
    mockFetch.mockReturnValue(mockResponse({
      count: 2,
      symbols: [
        { symbol: 'BTCUSDT', baseAsset: 'BTC' },
        { symbol: 'ETHUSDT', baseAsset: 'ETH' },
      ],
    }))

    const symbols = await fetchSymbols()
    expect(symbols).toHaveLength(2)
    expect(symbols[0].symbol).toBe('BTCUSDT')
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockReturnValue(mockResponse({ detail: 'Bybit error' }, false))
    await expect(fetchSymbols()).rejects.toThrow('Bybit error')
  })
})

describe('fetchTickers', () => {
  it('returns tickers array', async () => {
    mockFetch.mockReturnValue(mockResponse({
      count: 1,
      tickers: [{
        symbol: 'BTCUSDT', last_price: 64000, change_24h_pct: 1.5,
        high_24h: 65000, low_24h: 63000, volume_24h: 10000, turnover_24h: 640000000,
      }],
    }))

    const tickers = await fetchTickers()
    expect(tickers[0].symbol).toBe('BTCUSDT')
    expect(tickers[0].turnover_24h).toBe(640000000)
  })

  it('passes limit param to API', async () => {
    mockFetch.mockReturnValue(mockResponse({ count: 0, tickers: [] }))
    await fetchTickers(50)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=50'))
  })
})

describe('fetchVolumeChange', () => {
  it('passes symbols, interval and limit to API', async () => {
    mockFetch.mockReturnValue(mockResponse({
      interval: '1d', limit: 100,
      symbols: ['BTCUSDT', 'ETHUSDT'],
      series: [{ open_time: 1000, BTCUSDT: 0, ETHUSDT: 0 }],
    }))

    await fetchVolumeChange(['BTCUSDT', 'ETHUSDT'], '1d', 100)
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('symbols=BTCUSDT%2CETHUSDT')
    expect(url).toContain('interval=1d')
    expect(url).toContain('limit=100')
  })

  it('returns series data', async () => {
    const mockData = {
      interval: '1d', limit: 3,
      symbols: ['BTCUSDT'],
      series: [
        { open_time: 1000, BTCUSDT: 0 },
        { open_time: 2000, BTCUSDT: 50 },
      ],
    }
    mockFetch.mockReturnValue(mockResponse(mockData))

    const result = await fetchVolumeChange(['BTCUSDT'], '1d', 3)
    expect(result.series).toHaveLength(2)
    expect(result.series[1]['BTCUSDT']).toBe(50)
  })
})
