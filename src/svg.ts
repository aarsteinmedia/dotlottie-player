import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerSVG } from '@/elements/DotLottiePlayerSVG'
import { tagName } from '@/utils/constants'

export { RendererType } from '@aarsteinmedia/lottie-web/utils'

export { PlayerEvent, PlayMode }
export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayerSVG
export { tagName } from '@/utils/constants'
export { MouseOut, PlayerState } from '@/utils/enums'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerSVG()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayerSVG)
}
