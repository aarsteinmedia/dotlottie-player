import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'fs/promises'
import autoprefixer from 'autoprefixer'
import commonjs from '@rollup/plugin-commonjs'
import { dts } from 'rollup-plugin-dts'
import flexbugs from 'postcss-flexbugs-fixes'
import json from '@rollup/plugin-json'
import livereload from 'rollup-plugin-livereload'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'
import * as summary from 'rollup-plugin-summary'
import { minify, swc } from 'rollup-plugin-swc3'
import template from 'rollup-plugin-html-literals'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'

const isProd = process.env.NODE_ENV !== 'development',
  __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename),
  pkg = JSON.parse(
    (
      await readFile(
        new URL(path.resolve(__dirname, 'package.json'), import.meta.url)
      )
    ).toString()
  ),
  input = path.resolve(__dirname, 'src', 'index.ts'),
  plugins = (preferBuiltins = false) => [
    typescriptPaths(),
    postcss({
      inject: false,
      plugins: isProd
        ? [
            flexbugs(),
            autoprefixer({
              flexbox: 'no-2009',
            }),
          ]
        : [],
    }),
    template({
      include: [
        path.resolve(__dirname, 'src', 'index.ts'),
        path.resolve(__dirname, 'src', 'templates', '*'),
      ],
      options: {
        shouldMinify(template) {
          return template.parts.some(
            (part) =>
              // Matches Polymer templates that are not tagged
              part.text.includes('<figure') ||
              part.text.includes('<div') ||
              part.text.includes('<svg')
          )
        },
      },
    }),
    json({
      compact: true,
    }),
    nodeResolve({
      extensions: ['.ts'],
      preferBuiltins,
    }),
    commonjs(),
    swc(),
  ],
  unpkgPlugins = () => [
    ...plugins(),
    isProd && minify(),
    isProd && summary.default(),
    !isProd &&
      serve({
        open: true,
      }),
    !isProd && livereload(),
  ],
  modulePlugins = () => [...plugins(true), summary.default()],
  types = {
    input: path.resolve(__dirname, 'types', 'index.d.ts'),
    output: {
      file: pkg.types,
      format: 'esm',
    },
    plugins: [dts()],
  },
  unpkg = {
    input,
    onwarn(warning, warn) {
      if (
        warning.code === 'THIS_IS_UNDEFINED' ||
        warning.code === 'EVAL' ||
        warning.code === 'CIRCULAR_DEPENDENCY'
      ) {
        return
      }
      warn(warning)
    },
    output: {
      exports: 'named',
      extend: true,
      file: pkg.unpkg,
      format: 'iife',
      name: pkg.name,
    },
    plugins: unpkgPlugins(),
  },
  module = {
    external: ['lottie-web', 'fflate'],
    input,
    onwarn(warning, warn) {
      if (
        warning.code === 'THIS_IS_UNDEFINED' ||
        warning.code === 'CIRCULAR_DEPENDENCY'
      ) {
        return
      }
      warn(warning)
    },
    output: [
      {
        exports: 'named',
        file: pkg.module,
        format: 'esm',
      },
      {
        exports: 'named',
        file: pkg.exports['.'].require,
        format: 'cjs',
      },
    ],
    plugins: modulePlugins(),
  }

export default isProd ? [module, types, unpkg] : unpkg
