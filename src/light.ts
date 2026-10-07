import { isServer } from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerLight } from '@/elements/DotLottiePlayerLight'
import { tagName } from '@/utils/constants'

export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayerLight

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerLight()

if (!isServer && !customElements.get(tagName)) {
  customElements.define(tagName, DotLottiePlayerLight)
}