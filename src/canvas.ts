import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerCanvas } from '@/elements/DotLottiePlayerCanvas'
import { tagName } from '@/utils/constants'

export { PlayerEvent, PlayMode }
export default DotLottiePlayerCanvas
export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export { tagName } from '@/utils/constants'
export { MouseOut, PlayerState } from '@/utils/enums'
export { RendererType } from '@aarsteinmedia/lottie-web/utils'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerCanvas()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayerCanvas)
}
