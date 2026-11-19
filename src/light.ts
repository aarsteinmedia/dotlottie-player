import { IS_SERVER } from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerLight } from '@/elements/DotLottiePlayerLight'
import { TAG_NAME } from '@/utils/constants'

export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayerLight

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerLight()

if (!IS_SERVER && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DotLottiePlayerLight)
}
