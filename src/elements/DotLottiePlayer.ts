import {
  loadAnimation,
  type AddAnimationParams,
  type AnimationConfiguration,
  type ConvertParams,
  type Vector2,
} from '@aarsteinmedia/lottie-web'
import {
  type PreserveAspectRatio,
  RendererType,
} from '@aarsteinmedia/lottie-web/utils'

import DotLottiePlayerBase from '@/elements/DotLottiePlayerBase'
import { loadDotLottieTools } from '@/elements/helpers/dotlottieLoader'

/**
 * DotLottie Player Web Component.
 */
export default class DotLottiePlayer extends DotLottiePlayerBase {

  public override async addAnimation(params: AddAnimationParams) {
    const { addAnimation } = await loadDotLottieTools()

    return await addAnimation(params)
  }

  public override async convert(params: ConvertParams) {
    const { convert } = await loadDotLottieTools()

    return await convert(params)
  }

  public override loadAnimation(config: AnimationConfiguration) {
    return loadAnimation(config)
  }

  protected override setOptions({
    container,
    hasAutoplay,
    hasLoop,
    initialSegment,
    preserveAspectRatio,
    rendererType
  }: {
    container?: undefined |  HTMLElement
    rendererType: RendererType
    initialSegment?: undefined |  Vector2
    hasAutoplay: boolean
    hasLoop: boolean
    preserveAspectRatio: PreserveAspectRatio
  }): AnimationConfiguration {
    const options: AnimationConfiguration = {
      autoplay: hasAutoplay,
      container,
      initialSegment,
      loop: hasLoop,
      renderer: rendererType,
      rendererSettings: { imagePreserveAspectRatio: preserveAspectRatio },
    }

    switch (this.renderer) {
      case RendererType.HTML:
      case RendererType.SVG: {
        options.rendererSettings = {
          ...options.rendererSettings,
          hideOnTransparent: true,
          preserveAspectRatio,
          progressiveLoad: true,
        }
        break
      }
      case RendererType.Canvas: {
        options.rendererSettings = {
          ...options.rendererSettings,
          preserveAspectRatio,
          progressiveLoad: true,
        }
        break
      }
    }

    return options
  }
}