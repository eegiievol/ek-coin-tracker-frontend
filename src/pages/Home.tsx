import { useNavigate } from 'react-router-dom'

const cards = [
  {
    path: '/analyzer',
    title: 'Volume Change Analyzer',
    description: 'Track volume % change over time across multiple coins on the same chart.',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
        <polyline points="4,38 14,28 22,32 32,16 42,22 48,10"
          stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: '#22c55e',
  },
  {
    path: '/volume24h',
    title: '24H Volume Ranking',
    description: 'See which coins have the highest USDT trading volume in the last 24 hours.',
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
        <rect x="4"  y="28" width="8"  height="16" rx="2" fill="#3b82f6"/>
        <rect x="16" y="18" width="8"  height="26" rx="2" fill="#3b82f6"/>
        <rect x="28" y="10" width="8"  height="34" rx="2" fill="#3b82f6"/>
        <rect x="40" y="4"  width="8"  height="40" rx="2" fill="#60a5fa"/>
      </svg>
    ),
    accent: '#3b82f6',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 40, padding: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>
          <svg viewBox="0 0 64 64" width="56" height="56">
            <circle cx="32" cy="32" r="32" fill="#0d1117"/>
            <polyline points="8,44 18,36 26,40 36,22 46,28 56,14"
              fill="none" stroke="#22c55e" strokeWidth="4"
              strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="56" cy="14" r="4" fill="#22c55e"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
          EK Coin Tracker
        </h1>
        <p style={{ color: '#8b949e', fontSize: 15 }}>
          Bybit USDT Perpetual Futures — Real-time volume analytics
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {cards.map(card => (
          <div
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              background: '#0d1117',
              border: `1px solid #21262d`,
              borderRadius: 12,
              padding: '32px 28px',
              width: 260,
              cursor: 'pointer',
              transition: 'border-color 0.2s, transform 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = card.accent
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#21262d'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            }}
          >
            <div>{card.icon}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#e6edf3', marginBottom: 8 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.6 }}>
                {card.description}
              </div>
            </div>
            <div style={{ fontSize: 13, color: card.accent, marginTop: 'auto' }}>
              Open →
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
