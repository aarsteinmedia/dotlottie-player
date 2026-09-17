import { isServer } from '@aarsteinmedia/lottie-web/utils'

export const tagName = 'dotlottie-player',
  hasReducedMotion = !isServer && matchMedia('(prefers-reduced-motion: reduce)').matches,
  hasIOSupport = !isServer && 'IntersectionObserver' in window,
  hasVTSupport = !isServer && 'ViewTimeline' in window