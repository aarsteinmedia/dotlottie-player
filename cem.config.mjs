/**
 * @type {import('./src/types').CEMConfig}
 * */
const cemConfig = {
  catalyst: false,
  dependencies: false,
  dev: false,
  exclude: ['dev', '**/*.test.*'],
  fast: false,
  globs: ['dist/**/*.js'],
  litelement: false,
  outdir: '.',
  packagejson: true,
  stencil: false,
  watch: false,
}

export default cemConfig
