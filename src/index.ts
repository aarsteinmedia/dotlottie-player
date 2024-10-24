import { isServer } from '@/utils'
import DotLottiePlayer from '@/elements/DotLottiePlayer'

export default DotLottiePlayer

export { PlayMode, PlayerEvents, PlayerState } from '@/enums'

/**
 * Expose DotLottiePlayer class as global variable
 * @returns { DotLottiePlayer }
 */
globalThis.dotLottiePlayer = (): DotLottiePlayer => new DotLottiePlayer()

export const tagName = 'dotlottie-player'

if (!isServer()) {
  customElements.define('dotlottie-player', DotLottiePlayer)
}
