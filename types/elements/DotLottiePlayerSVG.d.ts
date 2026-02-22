import type { AnimationConfiguration, Vector2 } from '@aarsteinmedia/lottie-web';
import { type PreserveAspectRatio, RendererType } from '@aarsteinmedia/lottie-web/utils';
import DotLottiePlayerBase from '../elements/DotLottiePlayerBase';
export default class DotLottiePlayerSVG extends DotLottiePlayerBase {
    loadAnimation: typeof import("@aarsteinmedia/lottie-web/svg").loadAnimation;
    get renderer(): RendererType;
    constructor();
    protected setOptions({ container, hasAutoplay, hasLoop, initialSegment, preserveAspectRatio, }: {
        container?: undefined | HTMLElement;
        rendererType: RendererType;
        initialSegment?: undefined | Vector2;
        hasAutoplay: boolean;
        hasLoop: boolean;
        preserveAspectRatio: PreserveAspectRatio;
    }): AnimationConfiguration<RendererType.SVG>;
}
