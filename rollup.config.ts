import type { Plugin, RollupOptions } from 'rollup'

import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import autoprefixer from 'autoprefixer'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import flexbugs from 'postcss-flexbugs-fixes'
import { dts } from 'rollup-plugin-dts'
import template from 'rollup-plugin-html-literals'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-opener'
import postcss from 'rollup-plugin-postcss'
import pluginSummary from 'rollup-plugin-summary'
import { minify, swc } from 'rollup-plugin-swc3'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'

const isProd = process.env.NODE_ENV !== 'development',
  isLight = process.env.VER === 'light',
  __dirname = path.dirname(fileURLToPath(import.meta.url)),

  pkgBuffer = await readFile(new URL(path.resolve(__dirname, 'package.json'), import.meta.url)),
  pkg: typeof import('./package.json') = JSON.parse(pkgBuffer.toString()),

  external = [
    '@aarsteinmedia/lottie-web',
    '@aarsteinmedia/lottie-web/light',
    '@aarsteinmedia/lottie-web/utils',
    '@aarsteinmedia/lottie-web/dotlottie',
    'fflate',
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ],

  inputs = [
    {
      file: path.resolve(
        __dirname, 'src', 'full.ts'
      ),
      name: 'full'
    }, {
      file: path.resolve(
        __dirname, 'src', 'light.ts'
      ),
      name: 'light'
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
        path.resolve(
          __dirname, 'src', 'elements', 'DotLottiePlayer.ts'
        ), path.resolve(
          __dirname, 'src', 'templates', '*'
        ),
      ],
      options: {
        shouldMinify({ parts }: {
          parts: {
            text: string;
            start: number;
            end: number;
          }[]
        }) {
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
    commonjs(),
    swc(),
  ],

  unpkgPlugins = ((): Plugin[] =>
    isProd ? [
      ...plugins(),
      minify(),
      pluginSummary(),
    ] : plugins())(),

  modulePlugins = (): Plugin[] =>

    isProd ? [
      ...plugins(true), pluginSummary()
    ] : [
      ...plugins(true),
      serve({
        browser: 'firefox',
        open: true
      }),
      livereload(),
    ],

  types: RollupOptions[] = inputs.map((input) => ({
    external,
    input: path.resolve(
      __dirname, 'types', `${input.name}.d.ts`
    ),
    output: {
      file: `./dist/${input.name}.d.ts`,
      format: 'esm',
    },
    plugins: [dts()],
  })),

  unpkgs: RollupOptions[] = inputs.map((input) => ({
    input: input.file,
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return
      }
      warn(warning)
    },
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
    onwarn(warning, warn) {
      if (
        warning.code === 'CIRCULAR_DEPENDENCY'
      ) {
        return
      }
      warn(warning)
    },
    output: {
      exports: 'named',
      file: `./dist/${input.name}.js`,
      format: 'esm',
    },
    plugins: modulePlugins(),
  })),

  output = isProd ?
    [...modules,
      ...types,
      ...unpkgs] : modules[isLight ? 1 : 0]

export default output
