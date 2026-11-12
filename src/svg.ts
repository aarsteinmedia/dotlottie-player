import { IS_SERVER } from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerSVG } from '@/elements/DotLottiePlayerSVG'
import { TAG_NAME } from '@/utils/constants'

export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayerSVG
/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerSVG()

if (!IS_SERVER && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DotLottiePlayerSVG)
}
