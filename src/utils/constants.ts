import { isServer } from '@aarsteinmedia/lottie-web/utils'

const hoverQuery = isServer ? null : matchMedia('(any-hover: hover)')

export const tagName = 'dotlottie-player',
  reducedMotionQuery = isServer ? null : matchMedia('(prefers-reduced-motion: reduce)'),
  hasIOSupport = !isServer && 'IntersectionObserver' in window,
  hasVTSupport = !isServer && 'ViewTimeline' in window,
  isDev = process.env.NODE_ENV === 'development',
  // isTouch = !isServer && 'ontouchstart' in window,
  hasHover = hoverQuery?.matches