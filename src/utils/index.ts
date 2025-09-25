import type { AnimationData } from '@aarsteinmedia/lottie-web'

import { isServer, PreserveAspectRatio } from '@aarsteinmedia/lottie-web/utils'

import { ObjectFit } from '@/utils/enums'

/**
 * Get extension from filename, URL or path.
 */
export const aspectRatio = (objectFit: ObjectFit) => {
    switch (objectFit) {
      case ObjectFit.Contain:
      case ObjectFit.ScaleDown: {
        return PreserveAspectRatio.Contain
      }
      case ObjectFit.Cover: {
        return PreserveAspectRatio.Cover
      }
      case ObjectFit.Fill: {
        return PreserveAspectRatio.Initial
      }
      case ObjectFit.None: {
        return PreserveAspectRatio.None
      }
      default: {
        return PreserveAspectRatio.Contain
      }
    }
  },

  handleErrors = (err: unknown) => {
    const res = {
      message: 'Unknown error',
      status: isServer ? 500 : 400,
    }

    if (err && typeof err === 'object') {
      if ('message' in err && typeof err.message === 'string') {
        res.message = err.message
      }
      if ('status' in err) {
        res.status = Number(err.status)
      }
    }

    return res
  },

  isLottie = (json: AnimationData) => {
    const mandatory = [
      'v',
      'ip',
      'op',
      'layers',
      'fr',
      'w',
      'h'
    ]

    return mandatory.every((field: string) =>
      Object.hasOwn(json, field))
  },

  isTouch = () => 'ontouchstart' in window,

  frameOutput = (frame?: number) =>
    ((frame ?? 0) + 1).toString().padStart(3, '0')
