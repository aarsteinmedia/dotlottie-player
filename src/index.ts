import { isServer } from './utils'
import { DotLottiePlayer } from './DotLottiePlayer'

export default DotLottiePlayer

export { PlayMode, PlayerEvents, PlayerState } from './utils'

/**
 * Expose DotLottiePlayer class as global variable
 * @returns { DotLottiePlayer }
 */
globalThis.dotLottiePlayer = (): DotLottiePlayer => new DotLottiePlayer()

export const tagName = 'dotlottie-player'

if (!isServer()) {
  customElements.define('dotlottie-player', DotLottiePlayer)
}
