import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayer } from '@/elements/DotLottiePlayer'
import { tagName } from '@/utils/constants'

export { PlayerEvent, PlayMode }
export default DotLottiePlayer
export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export { tagName } from '@/utils/constants'
export { MouseOut, PlayerState } from '@/utils/enums'
export { RendererType } from '@aarsteinmedia/lottie-web/utils'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayer()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayer)
}