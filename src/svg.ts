import {
  isServer, PlayerEvents, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import DotLottiePlayerSVG from '@/elements/DotLottiePlayerSVG'
import { tagName } from '@/utils/enums'

export { PlayerEvents, PlayMode }
export default DotLottiePlayerSVG

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
