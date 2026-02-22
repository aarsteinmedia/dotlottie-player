import type { CEMConfig } from '@/types'

const cemConfig: CEMConfig = {
  catalyst: false,
  dependencies: false,
  dev: false,
  exclude: ['dev', '**/*.test.*'],
  fast: false,
  globs: ['dist/index.js'],
  litelement: false,
  outdir: '.',
  packagejson: true,
  stencil: false,
  watch: false,
}

export default cemConfig
