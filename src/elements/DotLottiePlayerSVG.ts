import type {
  AnimationConfiguration,
  Vector2,
} from '@aarsteinmedia/lottie-web'

import Lottie from '@aarsteinmedia/lottie-web/svg'
import {
  type PreserveAspectRatio,
  RendererType,
} from '@aarsteinmedia/lottie-web/utils'

import DotLottiePlayerBase from '@/elements/DotLottiePlayerBase'

/**
 * DotLottie Player Web Component.
 */
export default class DotLottiePlayerSVG extends DotLottiePlayerBase {

  // @ts-expect-error: TODO:
  public override loadAnimation = Lottie.loadAnimation

  override get renderer() {
    return RendererType.SVG
  }

  constructor() {
    super()
    this.isLight = true
  }

  protected override setOptions({
    container,
    hasAutoplay,
    hasLoop,
    initialSegment,
    preserveAspectRatio,
  }: {
    container?: HTMLElement
    rendererType: RendererType;
    initialSegment?: Vector2;
    hasAutoplay: boolean;
    hasLoop: boolean;
    preserveAspectRatio: PreserveAspectRatio
  }) {
    const options: AnimationConfiguration<RendererType.SVG> = {
      autoplay: hasAutoplay,
      container,
      initialSegment,
      loop: hasLoop,
      renderer: RendererType.SVG,
      rendererSettings: {
        hideOnTransparent: true,
        imagePreserveAspectRatio: preserveAspectRatio,
        preserveAspectRatio,
        progressiveLoad: true,
      },
    }

    return options
  }
}