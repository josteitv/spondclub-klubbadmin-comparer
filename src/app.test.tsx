import { render, screen } from '@testing-library/preact'
import { describe, expect, it, vi } from 'vitest'
import { App } from './app.tsx'

vi.stubGlobal('__APP_VERSION__', '1.2.3+abc1234')

describe('App', () => {
  it('says the tool is not working yet', () => {
    render(<App />)
    expect(screen.getByRole('status').textContent).toMatch(/fungerer ikke ennå/)
  })

  it('shows the title and the version', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Medlemssjekk' })).toBeTruthy()
    expect(screen.getByText('Versjon 1.2.3+abc1234')).toBeTruthy()
  })
})
