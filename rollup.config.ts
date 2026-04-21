import type { Plugin, RollupOptions } from 'rollup'

import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import autoprefixer from 'autoprefixer'
import { readFile } from 'node:fs/promises'
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

  pkgBuffer = await readFile(new URL(resolve(__dirname, 'package.json'), import.meta.url)),
  pkg: typeof import('./package.json') = JSON.parse(pkgBuffer.toString()),

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

  inputs = [
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
  ],

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

  types: RollupOptions[] = inputs.map((input) => ({
    external,
    input: resolve(
      __dirname, 'types', `${input.name}.d.ts`
    ),
    output: {
      file: `./dist/${input.name}.d.ts`,
      format: 'esm',
    },
    plugins: [dts()],
  })),

  // jsInput = Object.fromEntries(inputs.map((i) => [i.name, i.file])),
  // dtsInput = Object.fromEntries(inputs.map((i) => [
  //   i.name, resolve(
  //     __dirname, 'types', `${i.name}.d.ts`
  //   ),
  // ])),

  unpkgs: RollupOptions[] = inputs.map((input) => ({
    input: input.file,
    onwarn,
    output: {
      exports: 'named',
      extend: true,
      file: `./dist/unpkg-${input.name}.js`,
      format: 'iife',
      name: pkg.name,
    },
    plugins: unpkgPlugins,
  })),

  modules: RollupOptions[] = inputs.map((input) => ({
    external,
    input: input.file,
    onwarn,
    output: {
      exports: 'named',
      file: `./dist/${input.name}.js`,
      format: 'esm',
    },
    plugins: modulePlugins,
  })),

  output = isProd ?
    [...modules,
      ...types,
      ...unpkgs] : modules

export default output[isLight ? 1 : 0]
