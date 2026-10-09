import {
  beforeEach,
  describe, expect, test, vi
} from 'vitest'

import '../dist/unpkg-full.js'

vi.mock('@aarsteinmedia/lottie-web', () => ({ loadAnimation: vi.fn() }))

beforeEach(() => {
  document.body.innerHTML = '' // Clean up DOM between tests
})

describe('SSR', () => {
  test('UNPKG dotlottie-player mounts in DOM', () => {
    document.body.innerHTML = '<dotlottie-player src="/assets/am.lottie"></dotlottie-player>'

    const dotLottiePlayer = document.body.querySelector('dotlottie-player')

    expect(dotLottiePlayer).not.toBeNull()

    expect(dotLottiePlayer?.shadowRoot).not.toBeNull()

    const container = dotLottiePlayer?.shadowRoot?.querySelector('figure')

    expect(container).not.toBeNull()

  })
})