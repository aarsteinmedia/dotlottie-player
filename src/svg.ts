import { isServer } from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerSVG } from '@/elements/DotLottiePlayerSVG'
import { tagName } from '@/utils/constants'

export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayerSVG
/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerSVG()

if (!isServer && !customElements.get(tagName)) {
  customElements.define(tagName, DotLottiePlayerSVG)
}
