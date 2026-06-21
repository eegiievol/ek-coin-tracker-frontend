import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderHome() {
  return render(<MemoryRouter><Home /></MemoryRouter>)
}

describe('Home', () => {
  it('renders app title', () => {
    renderHome()
    expect(screen.getByText('EK Coin Tracker')).toBeInTheDocument()
  })

  it('renders both navigation cards', () => {
    renderHome()
    expect(screen.getByText('Эзлэхүүний өөрчлөлт')).toBeInTheDocument()
    expect(screen.getByText('24 цагийн эзлэхүүн')).toBeInTheDocument()
  })

  it('navigates to /analyzer on first card click', () => {
    renderHome()
    fireEvent.click(screen.getByText('Эзлэхүүний өөрчлөлт'))
    expect(mockNavigate).toHaveBeenCalledWith('/analyzer')
  })

  it('navigates to /volume24h on second card click', () => {
    renderHome()
    fireEvent.click(screen.getByText('24 цагийн эзлэхүүн'))
    expect(mockNavigate).toHaveBeenCalledWith('/volume24h')
  })
})
