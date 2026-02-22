import Lottie, {
  type AnimationConfiguration,
  type Vector2,
} from '@aarsteinmedia/lottie-web'
import { addAnimation, convert } from '@aarsteinmedia/lottie-web/dotlottie'
import {
  type PreserveAspectRatio,
  RendererType,
} from '@aarsteinmedia/lottie-web/utils'

import DotLottiePlayerBase from '@/elements/DotLottiePlayerBase'

/**
 * DotLottie Player Web Component.
 */
export default class DotLottiePlayer extends DotLottiePlayerBase {

  public override addAnimation = addAnimation

  public override convert = convert

  public override loadAnimation = Lottie.loadAnimation

  protected override setOptions({
    container,
    hasAutoplay,
    hasLoop,
    initialSegment,
    preserveAspectRatio,
    rendererType
  }: {
    container?: undefined |  HTMLElement
    rendererType: RendererType;
    initialSegment?: undefined |  Vector2;
    hasAutoplay: boolean;
    hasLoop: boolean;
    preserveAspectRatio: PreserveAspectRatio
  }) {
    const options: AnimationConfiguration<
      RendererType.SVG | RendererType.Canvas | RendererType.HTML
    > = {
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
          // @ts-expect-error TODO:
          clearCanvas: true,
          preserveAspectRatio,
          progressiveLoad: true,
        }
        break
      }
      // case RendererType.HTML: {
      //   options.rendererSettings = {
      //     ...options.rendererSettings,
      //     hideOnTransparent: true,
      //   }
      // }
    }

    return options
  }
}
