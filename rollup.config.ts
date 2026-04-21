import type { Plugin, RollupOptions } from 'rollup'

import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import autoprefixer from 'autoprefixer'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import flexbugs from 'postcss-flexbugs-fixes'
import { dts } from 'rollup-plugin-dts'
import template from 'rollup-plugin-html-literals'
import livereload from 'rollup-plugin-livereload'
import { serve } from 'rollup-plugin-opener'
import postcss from 'rollup-plugin-postcss'
import pluginSummary from 'rollup-plugin-summary'
import { minify, swc } from 'rollup-plugin-swc3'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'

// type Mode = 'development' | 'production'
type Ver = 'full' | 'light' | 'svg' | 'canvas'
// type OutputType = 'esm' | 'iife'
// type Target = 'modules' | 'unpkg' | 'types' | 'all'

interface InputsDef {
  file: string
  name: Ver
}

interface MinifyOptions {
  parts: {
    text: string;
    start: number;
    end: number;
  }[]
}

const isProd = process.env.NODE_ENV !== 'development',
  isLight = process.env.VER === 'light',
  __dirname = dirname(fileURLToPath(import.meta.url)),

  external = [
    '@aarsteinmedia/lottie-web',
    '@aarsteinmedia/lottie-web/light',
    '@aarsteinmedia/lottie-web/svg',
    '@aarsteinmedia/lottie-web/canvas',
    '@aarsteinmedia/lottie-web/utils',
    '@aarsteinmedia/lottie-web/dotlottie',
    'fflate',
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ],

  // parseEnv = (_env = process.env) => {
  //   const mode: Mode =
  //     _env.NODE_ENV === 'development' ? 'development' : 'production',
  //     ver: Ver =
  //       _env.VER === 'light' ? 'light' : 'full',
  //     outputType: OutputType =
  //       _env.TYPE === 'iife' ? 'iife' : 'esm',
  //     target: Target =
  //       (_env.TARGET as Target | undefined) ?? 'all'

  //   return {
  //     mode,
  //     outputType,
  //     target,
  //     ver
  //   }
  // },

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
    }
  ] as const,

  plugins = (preferBuiltins = false): Plugin[] => [
    typescriptPaths(),
    postcss({
      inject: false,
      plugins: isProd
        ? [
          flexbugs(), autoprefixer({ flexbox: 'no-2009' }),
        ]
        : [],
    }),
    template({
      include: [
        resolve(
          __dirname, 'src', 'elements', 'DotLottiePlayer.ts'
        ), resolve(
          __dirname, 'src', 'templates', '*'
        ),
      ],
      options: {
        shouldMinify({ parts }: MinifyOptions) {
          return parts.some(({ text }) =>
          // Matches Polymer templates that are not tagged
            text.includes('<figure') ||
            text.includes('<div') ||
            text.includes('<svg'))
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

  onwarn: RollupOptions['onwarn'] = (warning, warn) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return
    }
    warn(warning)
  },

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
        openPage: isLight ? 'light.html' : undefined
      }),
      livereload(),
    ])(),

  jsInput = Object.fromEntries(inputs.map((i) => [i.name, i.file])),
  dtsInput = Object.fromEntries(inputs.map((i) => [
    i.name, resolve(
      __dirname, 'types', `${i.name}.d.ts`
    ),
  ])),

  unpkgs: RollupOptions[] = inputs.map((input) => ({
    input: input.file,
    onwarn,
    output: {
      exports: 'named',
      extend: true,
      file: `./dist/unpkg-${input.name}.js`,
      format: 'iife',
      name: '@aarsteinmedia/dotlottie-player',
    },
    plugins: unpkgPlugins,
  })),

  modules: RollupOptions[] = [{
    external,
    input: jsInput,
    onwarn,
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
  ],

  // env = parseEnv(),

  output = isProd ?
    [...unpkgs, ...modules] : modules[isLight ? 1 : 0]

export default output
