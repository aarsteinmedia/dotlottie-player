import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerCanvas } from '@/elements/DotLottiePlayerCanvas'
import { tagName } from '@/utils/enums'

export { PlayerEvent, PlayMode }
// eslint-disable-next-line import/no-default-export
export default DotLottiePlayerCanvas
export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export {
  MouseOut, PlayerState, tagName
} from '@/utils/enums'
export { RendererType } from '@aarsteinmedia/lottie-web/utils'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerCanvas()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayerCanvas)
}
