import { isServer, PlayerEvents } from '@aarsteinmedia/lottie-web/utils'

import DotLottiePlayer from '@/elements/DotLottiePlayer'

export { PlayerEvents }
export default DotLottiePlayer

export { PlayerState, PlayMode } from '@/utils/enums'

/**
 * Expose DotLottiePlayer class as global variable.
 *
 */
globalThis.dotLottiePlayer = (): DotLottiePlayer => new DotLottiePlayer()

export const tagName = 'dotlottie-player'

if (!isServer) {
  customElements.define(tagName, DotLottiePlayer)
}
