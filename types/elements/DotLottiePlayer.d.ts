import { type AnimationConfiguration, type Vector2 } from '@aarsteinmedia/lottie-web';
import { addAnimation, convert } from '@aarsteinmedia/lottie-web/dotlottie';
import { type PreserveAspectRatio, RendererType } from '@aarsteinmedia/lottie-web/utils';
import DotLottiePlayerBase from '../elements/DotLottiePlayerBase';
export default class DotLottiePlayer extends DotLottiePlayerBase {
    addAnimation: typeof addAnimation;
    convert: typeof convert;
    loadAnimation: typeof import("@aarsteinmedia/lottie-web").loadAnimation;
    protected setOptions({ container, hasAutoplay, hasLoop, initialSegment, preserveAspectRatio, rendererType }: {
        container?: undefined | HTMLElement;
        rendererType: RendererType;
        initialSegment?: undefined | Vector2;
        hasAutoplay: boolean;
        hasLoop: boolean;
        preserveAspectRatio: PreserveAspectRatio;
    }): AnimationConfiguration<RendererType>;
}
