import { IS_SERVER } from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerCanvas } from '@/elements/DotLottiePlayerCanvas'
import { TAG_NAME } from '@/utils/constants'

export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayerCanvas

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerCanvas()

if (!IS_SERVER && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DotLottiePlayerCanvas)
}
