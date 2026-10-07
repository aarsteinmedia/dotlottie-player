import { isServer } from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerCanvas } from '@/elements/DotLottiePlayerCanvas'
import { tagName } from '@/utils/constants'

export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayerCanvas

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerCanvas()

if (!isServer && !customElements.get(tagName)) {
  customElements.define(tagName, DotLottiePlayerCanvas)
}
