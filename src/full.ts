import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import DotLottiePlayer from '@/elements/DotLottiePlayer'
import { tagName } from '@/utils/enums'

export { PlayerEvent, PlayMode }
export default DotLottiePlayer

export {
  MouseOut, PlayerState, tagName
} from '@/utils/enums'
export { RendererType } from '@aarsteinmedia/lottie-web/utils'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayer()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayer)
}