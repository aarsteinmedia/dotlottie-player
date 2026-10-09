import { vitest } from 'vitest'

Object.defineProperty(
  window, 'matchMedia', {
    value: vitest.fn().mockImplementation(query => ({
      addEventListener: vitest.fn(),
      addListener: vitest.fn(), // deprecated
      dispatchEvent: vitest.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vitest.fn(),
      removeListener: vitest.fn(), // deprecated
    })),
    writable: true,
  }
)