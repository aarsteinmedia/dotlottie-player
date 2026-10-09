import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: 'jsdom',
          globals: false,
          include: ['src/**/*.{test,spec}.ts'],
          name: 'unit',
          setupFiles: [resolve(__dirname, 'vitest.setup.ts')],
        }
      }
    ]
  },
})
