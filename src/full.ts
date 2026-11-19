import { IS_SERVER } from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayer } from '@/elements/DotLottiePlayer'
import { TAG_NAME } from '@/utils/constants'

export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export default DotLottiePlayer

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayer()

if (!IS_SERVER && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, DotLottiePlayer)
}
