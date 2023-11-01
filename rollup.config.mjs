import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import summary from 'rollup-plugin-summary'
import { swc, minify as swcMinify } from 'rollup-plugin-swc3'

import template from 'rollup-plugin-html-literals'

import pkg from './package.json' assert { type: 'json' }

const input = './src/index.ts',
  dev = './dev/index.js',
  extensions = ['.js', '.ts'],
  external = [
    'lit',
    'lit/decorators.js',
    'lottie-web',
    'fflate'
  ],
  plugins = (preferBuiltins = false) => ([
    template(),
    replace({
      preventAssignment: false,
      'Reflect.decorate': 'undefined'
    }),
    json(),
    nodeResolve({
      extensions,
      jsnext: true,
      module: true,
      preferBuiltins
    }),
    commonjs(),
    swc(),
  ]),
  unpkgPlugins = (minify = false) => ([
    ...plugins(),
    minify && swcMinify(),
    minify && summary()
  ]),
  modulePlugins = () => ([
    ...plugins(true),
    summary(),
  ])

export default [
  {
    input: './types/src/index.d.ts',
    output: {
      file: pkg.types,
      format: 'esm'
    },
    plugins: [
      dts(),
    ]
  },
  {
    input,
    output: {
      extend: true,
      file: pkg.unpkg,
      format: 'iife',
      name: pkg.name,
    },
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') return
      warn(warning)
    },
    plugins: unpkgPlugins(true),
  },
  {
    input,
    output: {
      extend: true,
      file: dev,
      format: 'iife',
      name: pkg.name,
    },
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') return
      warn(warning)
    },
    plugins: unpkgPlugins(),
  },
  {
    input,
    external,
    output: [
      {
        file: pkg.module,
        format: 'esm',
      },
      {
        file: pkg.exports['.'].require,
        format: 'cjs'
      }
    ],
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') return
      warn(warning)
    },
    plugins: modulePlugins(),
  }
]