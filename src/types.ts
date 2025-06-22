/* eslint-disable @typescript-eslint/no-namespace */
import 'react/jsx-runtime'
import 'react/jsx-dev-runtime'

import type { Plugin } from '@custom-elements-manifest/analyzer'

import type DotLottiePlayer from '@/elements/DotLottiePlayer'
import type DotLottiePlayerLight from '@/elements/DotLottiePlayerLight'
import type { tagName } from '@/utils/enums'

export type AnimateOnScroll = boolean | '' | null
export type Autoplay = boolean | '' | 'autoplay' | null
export type Controls = boolean | '' | 'controls' | null
export type Loop = boolean | '' | 'loop' | null
export type Subframe = boolean | '' | null
export interface CEMConfig {
  /** Enable special handling for catalyst. */
  catalyst: boolean
  /** Include third party custom elements manifests. */
  dependencies: boolean
  /** Run in dev mode, provides extra logging. */
  dev: boolean
  /** Globs to exclude. */
  exclude: string[]
  /** Enable special handling for fast. */
  fast: boolean
  /** Globs to analyze. */
  globs: ['src/**/*.ts']
  /** Enable special handling for litelement. */
  litelement: boolean
  /** Directory to output CEM to. */
  outdir: string
  /** Overrides default module creation. */
  overrideModuleCreation: ({
    globs,
    ts,
  }: {
    /**
     * TypeScrip.
     */
    ts: unknown
    globs: string[]
  }) => unknown[]
  /** Output CEM path to `package.json`, defaults to true. */
  packagejson: boolean
  /** Provide custom plugins. */
  plugins: (() => Plugin)[]
  /** Enable special handling for stencil. */
  stencil: boolean
  /** Run in watch mode, runs on file changes. */
  watch: boolean
}

declare global {
  interface HTMLElementTagNameMap { [tagName]: DotLottiePlayer | DotLottiePlayerLight }
  function dotLottiePlayer(): DotLottiePlayer | DotLottiePlayerLight
}

type JSXLottiePlayer = Omit<Partial<DotLottiePlayer | DotLottiePlayerLight>, 'style'> & {
  class?: string
  ref?: React.RefObject<unknown>
  style?: React.CSSProperties
  src: string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements { [tagName]: JSXLottiePlayer}
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements { [tagName]: JSXLottiePlayer}
  }
}

declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements { [tagName]: JSXLottiePlayer}
  }
}
