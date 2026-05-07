import type { CEMConfig } from '@/types'

const cemConfig: CEMConfig = {
  catalyst: false,
  dependencies: false,
  dev: false,
  exclude: ['dev', '**/*.test.*'],
  fast: false,
  globs: ['dist/full.js'],
  litelement: false,
  outdir: '.',
  packagejson: true,
  stencil: false,
  watch: false,
}

export default cemConfig
