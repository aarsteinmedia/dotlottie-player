import type { LottieAsset } from '@aarsteinmedia/lottie-web'

import {
  createElementID, _isServer, PreserveAspectRatio
} from '@aarsteinmedia/lottie-web/utils'
import { strToU8 } from 'fflate'

import { ObjectFit } from '@/utils/enums'

const hasExt = (path?: string) => {
  const lastDotIndex = path?.split('/').pop()?.lastIndexOf('.')

  return (
    (lastDotIndex ?? 0) > 1 && path && path.length - 1 > (lastDotIndex ?? 0)
  )
}

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
  /**
   * Download file, either SVG or dotLottie.
   */
  download = (data: string | ArrayBuffer,
    options?: {
      name: string
      mimeType: string
    }) => {
    const blob = new Blob([data], { type: options?.mimeType }),
      fileName = options?.name || createElementID(),
      dataURL = URL.createObjectURL(blob),
      link = document.createElement('a')

    link.href = dataURL
    link.download = fileName
    link.hidden = true
    document.body.appendChild(link)

    link.click()

    setTimeout(() => {
      link.remove()
      URL.revokeObjectURL(dataURL)
    }, 1000)
  },
  getExt = (str?: string) => {
    if (typeof str !== 'string' || !str || !hasExt(str)) {
      return
    }

    return str.split('.').pop()?.toLowerCase()
  },

  /**
     * Parse URL to get filename.
     *
     * @param src - The url string.
     * @param keepExt - Whether to include file extension.
     * @returns Filename, in lowercase.
     */
  getFilename = (src: string, keepExt?: boolean) => {
    // Because the regex strips all special characters, we need to extract the file extension, so we can add it later if we need it
    let ext = getExt(src)

    ext = ext ? `.${ext}` : undefined

    return `${src
      .split('/')
      .pop()
      ?.replace(/\.[^.]*$/, '')
      .replaceAll(/\W+/g, '-')}${keepExt && ext ? ext : ''}`
  },

  addExt = (ext: string, str?: string) => {
    if (!str) {
      return
    }
    if (getExt(str)) {
      if (getExt(str) === ext) {
        return str
      }

      return `${getFilename(str)}.${ext}`
    }

    return `${str}.${ext}`
  },
  parseBase64 = (str: string) => str.slice(Math.max(0, str.indexOf(',') + 1)),
  /**
   * Convert Base64 encoded string to Uint8Array.
   *
   * @param str - Base64 encoded string.
   * @returns UTF-8/Latin-1 binary.
   */
  base64ToU8 = (str: string) =>
    strToU8(_isServer
      ? Buffer.from(parseBase64(str), 'base64').toString('binary')
      : atob(parseBase64(str)),
    true),
  getExtFromB64 = (str: string) => {
    const mime = str.split(':')[1].split(';')[0],
      ext = mime.split('/')[1].split('+')[0]

    return ext
  },
  handleErrors = (err: unknown) => {
    const res = {
      message: 'Unknown error',
      status: _isServer ? 500 : 400,
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
  isAudio = (asset: LottieAsset) =>
    !('h' in asset) &&
    !('w' in asset) &&
    'p' in asset &&
    'e' in asset &&
    'u' in asset &&
    'id' in asset,
  isImage = (asset: LottieAsset) =>
    'w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset,
  frameOutput = (frame?: number) =>
    ((frame ?? 0) + 1).toString().padStart(3, '0')
