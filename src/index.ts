import { DotLottiePlayer } from './component'

export { DotLottiePlayer }
export { PlayMode, PlayerEvents, PlayerState } from './utils'

/**
 * Expose DotLottiePlayer class as global variable
 * @returns { DotLottiePlayer }
 */
globalThis.dotLottiePlayer = (): DotLottiePlayer => new DotLottiePlayer()