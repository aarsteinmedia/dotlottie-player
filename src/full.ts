import { isServer } from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayer } from '@/elements/DotLottiePlayer'
import { tagName } from '@/utils/constants'

export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayer

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayer()

if (!isServer && !customElements.get(tagName)) {
  customElements.define(tagName, DotLottiePlayer)
}