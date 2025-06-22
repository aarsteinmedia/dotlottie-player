import {
  isServer, PlayerEvents, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import DotLottiePlayerLight from '@/elements/DotLottiePlayerLight'
import { tagName } from '@/utils/enums'

export { PlayerEvents, PlayMode }
export default DotLottiePlayerLight

export { PlayerState, tagName } from '@/utils/enums'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerLight()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayerLight)
}
