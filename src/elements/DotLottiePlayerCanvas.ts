import type { AnimationConfiguration } from '@aarsteinmedia/lottie-web'

import { loadAnimation } from '@aarsteinmedia/lottie-web/canvas'
import { RendererType } from '@aarsteinmedia/lottie-web/utils'

import type { Options } from '@/types'

import { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'

/**
 * DotLottie Player Web Component.
 */
export class DotLottiePlayerCanvas extends DotLottiePlayerBase {

  override get renderer() {
    if (super.renderer !== RendererType.Canvas) {
      this.devLog(`[dotlottie-player] renderer "${super.renderer}" is not available in ` +
        '@aarsteinmedia/dotlottie-player/canvas, falling back to "canvas". Import from ' +
        '@aarsteinmedia/dotlottie-player to use other renderers.',
      'warn')
    }


    return RendererType.Canvas
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
  }: Options) {
    const options: AnimationConfiguration<RendererType.Canvas> = {
      autoplay: hasAutoplay,
      container,
      initialSegment,
      loop: hasLoop,
      renderer: RendererType.Canvas,
      rendererSettings: {
        clearCanvas: true,
        contentVisibility: 'visible',
        id: this.id,
        imagePreserveAspectRatio: preserveAspectRatio,
        preserveAspectRatio,
        progressiveLoad: true,
      },
    }

    return options
  }
}