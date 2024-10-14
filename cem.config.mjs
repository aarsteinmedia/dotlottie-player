export default {
  /** Enable special handling for catalyst */
  catalyst: false,
  /** Include third party custom elements manifests */
  dependencies: false,
  /** Run in dev mode, provides extra logging */
  dev: false,
  /** Globs to exclude */
  exclude: ['dev'],
  /** Enable special handling for fast */
  fast: false,
  /** Globs to analyze */
  globs: ['src/**/*.ts'],
  /** Enable special handling for litelement */
  litelement: true,
  /** Directory to output CEM to */
  outdir: 'dist',
  /** Output CEM path to `package.json`, defaults to true */
  packagejson: true,
  /** Enable special handling for stencil */
  stencil: false,
  /** Run in watch mode, runs on file changes */
  watch: false,
}
