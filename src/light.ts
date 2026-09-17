import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerLight } from '@/elements/DotLottiePlayerLight'
import { tagName } from '@/utils/constants'

export { RendererType } from '@aarsteinmedia/lottie-web/utils'

export { PlayerEvent, PlayMode }
export default DotLottiePlayerLight
export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export { tagName } from '@/utils/constants'
export { MouseOut, PlayerState } from '@/utils/enums'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerLight()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayerLight)
}