import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerSVG } from '@/elements/DotLottiePlayerSVG'
import { tagName } from '@/utils/enums'

export { RendererType } from '@aarsteinmedia/lottie-web/utils'

export { PlayerEvent, PlayMode }
// eslint-disable-next-line import/no-default-export
export default DotLottiePlayerSVG
export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export {
  MouseOut, PlayerState, tagName
} from '@/utils/enums'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerSVG()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayerSVG)
}
