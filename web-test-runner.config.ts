import type { TestRunnerConfig } from '@web/test-runner'

import { esbuildPlugin } from '@web/dev-server-esbuild'
import { importMapsPlugin } from '@web/dev-server-import-maps'
import { fromRollup } from '@web/dev-server-rollup'
import { fileURLToPath } from 'node:url'
import rollupPostcss from 'rollup-plugin-postcss'
import { typescriptPaths as rollupTypescriptPaths } from 'rollup-plugin-typescript-paths'

const typescriptPaths = fromRollup(rollupTypescriptPaths),
  postcss = fromRollup(rollupPostcss),

  testRunnerConfig: TestRunnerConfig = {
    // browsers: [playwrightLauncher({ product: 'firefox' })],
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    nodeResolve: true,
    plugins: [
      typescriptPaths({ preserveExtensions: true }),
      importMapsPlugin({ inject: { importMap: { imports: { '@/': './src/' } } } }),
      esbuildPlugin({
        json: true,
        loaders: { '.scss': 'css' },
        target: 'esnext',
        ts: true,
        tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
      }),
      postcss(),
    ],
  }

export default testRunnerConfig
