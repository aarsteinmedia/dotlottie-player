import { isServer } from '@aarsteinmedia/lottie-web/utils'

import DotLottiePlayer from '@/elements/DotLottiePlayer'

export default DotLottiePlayer

export {
  PlayerEvents, PlayerState, PlayMode
} from '@/enums'

/**
 * Expose DotLottiePlayer class as global variable.
 *
 */
globalThis.dotLottiePlayer = (): DotLottiePlayer => new DotLottiePlayer()

export const tagName = 'dotlottie-player'

if (!isServer()) {
  customElements.define(tagName, DotLottiePlayer)
}
