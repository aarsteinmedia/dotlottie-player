import type {
  AddAnimationParams, ConvertParams, Result
} from '@aarsteinmedia/lottie-web'

type Convert = (params: ConvertParams) => Promise<Result>
type AddAnimation = (params: AddAnimationParams) => Promise<Result>

interface InlineInterface {
  addAnimation: AddAnimation;
  convert: Convert,
}
let dotlottieTools: null | InlineInterface = null,
  loadPromise: Promise<{
    convert: Convert,
    addAnimation: AddAnimation
  }> | null = null

export function loadDotLottieTools() {
  if (dotlottieTools) {
    return Promise.resolve(dotlottieTools)
  }

  loadPromise = loadPromise ?? (async () => {
    const { addAnimation, convert } = await import('@aarsteinmedia/lottie-web/dotlottie')

    dotlottieTools = {
      addAnimation,
      convert
    }

    return {
      addAnimation,
      convert
    }
  })()

  return loadPromise
}