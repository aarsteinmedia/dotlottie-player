import { IS_SERVER } from '@aarsteinmedia/lottie-web/utils'

const hoverQuery = IS_SERVER ? null : matchMedia('(any-hover: hover)')

export const TAG_NAME = 'dotlottie-player',
  // Keep this dynamic (as opposed to hoverQuery) since users at least in theory can change settings mid session
  reducedMotionQuery = IS_SERVER ? null : matchMedia('(prefers-reduced-motion: reduce)'),
  HAS_IO_SUPPORT = !IS_SERVER && 'IntersectionObserver' in window,
  HAS_VT_SUPPORT = !IS_SERVER && 'ViewTimeline' in window,
  IS_DEV = typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
  HAS_HOVER = hoverQuery?.matches
