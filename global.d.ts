declare module '*.css' {
  const content: string

  export default content
}

declare module 'stylelint-config-recommended' {
  import type { Config } from 'stylelint'

  const config: Config

  export default config
}

// declare global {
//   import type DotLottiePlayer from '@/elements/DotLottiePlayer'
//   import type DotLottiePlayerCanvas from '@/elements/DotLottiePlayerCanvas'
//   import type DotLottiePlayerLight from '@/elements/DotLottiePlayerLight'
//   import type DotLottiePlayerSVG from '@/svg'

//   function dotLottiePlayer(): DotLottiePlayer | DotLottiePlayerLight | DotLottiePlayerSVG | DotLottiePlayerCanvas
// }