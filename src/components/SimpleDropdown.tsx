import { useState, useRef, useEffect } from 'react'

interface Props<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}

export default function SimpleDropdown<T extends string>({ label, value, options, onChange }: Props<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const current = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>{label}</div>
      <button onClick={() => setOpen(p => !p)} style={btnStyle}>
        {current?.label ?? value} <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
      </button>
      {open && (
        <div style={dropStyle}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                padding: '7px 14px',
                cursor: 'pointer',
                fontSize: 13,
                background: opt.value === value ? '#161b22' : 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#161b22')}
              onMouseLeave={e => (e.currentTarget.style.background = opt.value === value ? '#161b22' : 'transparent')}
            >
              {opt.label}
            </div>
          ))}
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
}

const dropStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: 6,
  zIndex: 200,
  minWidth: 120,
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
}
