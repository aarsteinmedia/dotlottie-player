import {
  isServer, PlayerEvent, PlayMode
} from '@aarsteinmedia/lottie-web/utils'

import { DotLottiePlayerLight } from '@/elements/DotLottiePlayerLight'
import { tagName } from '@/utils/enums'

export { RendererType } from '@aarsteinmedia/lottie-web/utils'

export { PlayerEvent, PlayMode }
// eslint-disable-next-line import/no-default-export
export default DotLottiePlayerLight
export { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'
export {
  MouseOut, PlayerState, tagName
} from '@/utils/enums'

/**
 * Expose DotLottiePlayer class as global variable.
 */
globalThis.dotLottiePlayer = () => new DotLottiePlayerLight()

if (!isServer) {
  customElements.define(tagName, DotLottiePlayerLight)
}