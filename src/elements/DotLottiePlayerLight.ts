import type { AnimationConfiguration } from '@aarsteinmedia/lottie-web'

import { loadAnimation } from '@aarsteinmedia/lottie-web/light'
import { RendererType } from '@aarsteinmedia/lottie-web/utils'

import type { Options } from '@/types'

import { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'

/**
 * DotLottie Player Web Component.
 */
export class DotLottiePlayerLight extends DotLottiePlayerBase {

  override get renderer() {
    if (super.renderer !== RendererType.SVG) {
      this.devLog(`[dotlottie-player] renderer "${super.renderer}" is not available in ` +
        '@aarsteinmedia/dotlottie-player/light, falling back to "svg". Import from ' +
        '@aarsteinmedia/dotlottie-player to use other renderers.',
      'warn')
    }

    return RendererType.SVG
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