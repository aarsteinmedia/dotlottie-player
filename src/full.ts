import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayer } from '@/elements/DotLottiePlayer'
import { tagName } from '@/utils/enums'

export { PlayerEvent, PlayMode }
// eslint-disable-next-line import/no-default-export
export default DotLottiePlayer
export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
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