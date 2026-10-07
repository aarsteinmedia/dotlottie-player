import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import autoprefixer from 'autoprefixer'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import flexbugs from 'postcss-flexbugs-fixes'
import {
  defineConfig, type Plugin, type RollupOptions
} from 'rollup'
import { dts } from 'rollup-plugin-dts'
import template from 'rollup-plugin-html-literals'
import livereload from 'rollup-plugin-livereload'
import { serve } from 'rollup-plugin-opener'
import postcss from 'rollup-plugin-postcss'
import pluginSummary from 'rollup-plugin-summary'
import { minify, swc } from 'rollup-plugin-swc3'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'

type Version = 'full' | 'light' | 'svg' | 'canvas' | 'utilities'
type OutputType = 'esm' | 'iife'

interface InputsDef {
  file: string
  name: Version
}

interface MinifyOptions {
  parts: {
    text: string;
    start: number;
    end: number;
  }[]
}

const isProd = process.env.NODE_ENV !== 'development',
  version = (process.env.VER ?? 'full') as Version,
  type = (process.env.TYPE ?? 'esm') as OutputType,
  __dirname = dirname(fileURLToPath(import.meta.url)),

  /** Opening or closing tag of any element, including custom elements. */
  markup = /<\/?[a-z][a-z\d-]*[\s/>]/i,

  external = [
    '@aarsteinmedia/lottie-web',
    '@aarsteinmedia/lottie-web/light',
    '@aarsteinmedia/lottie-web/svg',
    '@aarsteinmedia/lottie-web/canvas',
    '@aarsteinmedia/lottie-web/utils',
    '@aarsteinmedia/lottie-web/dotlottie',
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ],

  inputs: readonly InputsDef[] = [
    {
      file: resolve(
        __dirname, 'src', 'full.ts'
      ),
      name: 'full'
    },
    {
      file: resolve(
        __dirname, 'src', 'light.ts'
      ),
      name: 'light'
    },
    {
      file: resolve(
        __dirname, 'src', 'svg.ts'
      ),
      name: 'svg'
    },
    {
      file: resolve(
        __dirname, 'src', 'canvas.ts'
      ),
      name: 'canvas'
    },
    {
      file: resolve(
        __dirname, 'src', 'utilities.ts'
      ),
      name: 'utilities'
    }
  ] as const,

  plugins = (preferBuiltins = false): Plugin[] => [
    typescriptPaths(),
    postcss({
      inject: false,
      /**
       * `mergeRules` is disabled because cssnano is not aware of native
       * nesting, and grouping selectors across vendor-prefixed
       * pseudo-elements can invalidate a whole selector list.
       */
      minimize: isProd && { preset: ['default', { mergeRules: false }] },
      plugins: isProd
        ? [
          flexbugs(), autoprefixer({ flexbox: 'no-2009' }),
        ]
        : [],
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    template({
      include: [resolve(
        __dirname, 'src', '**'
      )],
      options: {
        shouldMinify({ parts }: MinifyOptions) {
          // Templates marked with a /* HTML */ comment are untagged,
          // so match on the markup itself
          return parts.some(({ text }) => markup.test(text))
        },
      },
    }),
    json({ compact: true }),
    nodeResolve({
      extensions: ['.ts'],
      preferBuiltins,
    }),
    swc(),
  ],

  unpkgPlugins = ((): Plugin[] =>
    isProd ? [
      ...plugins(),
      minify(),
      pluginSummary(),
    ] : plugins())(),

  modulePlugins = ((): Plugin[] =>

    isProd ? [
      ...plugins(true), pluginSummary()
    ] : [
      ...plugins(true),
      serve({
        browser: 'firefox',
        open: true,
      }),
      livereload(),
    ])(),

  jsInput = Object.fromEntries(inputs.map((i) => [i.name, i.file])),
  dtsInput = Object.fromEntries(inputs.map((i) => [
    i.name, resolve(
      __dirname, 'types', `${i.name}.d.ts`
    ),
  ])),

  unpkgs = inputs.filter(({ name }) => name !== 'utilities').map((input) => defineConfig({
    input: input.file,
    output: {
      exports: 'named',
      extend: true,
      file: `./dist/unpkg-${input.name}.js`,
      format: 'iife',
      inlineDynamicImports: true,
      name: '@aarsteinmedia/dotlottie-player'
    },
    plugins: unpkgPlugins,
  })),

  modules = defineConfig([{
    external,
    input: jsInput,
    output: {
      chunkFileNames: 'chunks/[name]-[hash].js',
      dir: resolve(__dirname, 'dist'),
      entryFileNames: '[name].js',
      exports: 'named',
      format: 'esm',
    },
    plugins: modulePlugins,
  }, {
    external,
    input: dtsInput,
    output: {
      chunkFileNames: 'chunks/[name]-[hash].d.ts',
      dir: resolve(__dirname, 'dist'),
      entryFileNames: '[name].d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  }
  ]),

  ver = version === 'light' ? 1 : 0

let output: RollupOptions | RollupOptions[]

if (isProd) {
  output = [...unpkgs, ...modules]
} else {
  if (type === 'iife') {
    output = unpkgs[ver]
  } else {
    output = modules[ver]
  }
}

export default output
