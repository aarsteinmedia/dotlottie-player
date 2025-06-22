import type { AnimationConfiguration, Vector2 } from '@aarsteinmedia/lottie-web';
import { type PreserveAspectRatio, RendererType } from '@aarsteinmedia/lottie-web/utils';
import DotLottiePlayerBase from '../elements/DotLottiePlayerBase';
export default class DotLottiePlayerLight extends DotLottiePlayerBase {
    loadAnimation: typeof import("@aarsteinmedia/lottie-web/light").loadAnimation;
    get renderer(): RendererType;
    constructor();
    protected setOptions({ container, hasAutoplay, hasLoop, initialSegment, preserveAspectRatio, }: {
        container?: HTMLElement;
        rendererType: RendererType;
        initialSegment?: Vector2;
        hasAutoplay: boolean;
        hasLoop: boolean;
        preserveAspectRatio: PreserveAspectRatio;
    }): AnimationConfiguration<RendererType.SVG>;
}
