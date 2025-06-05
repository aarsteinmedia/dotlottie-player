import type { AnimationData, LottieManifest } from '@aarsteinmedia/lottie-web'

import { getExt, handleErrors } from '@/utils'
import getLottieJSON from '@/utils/getLottieJSON'

export default async function getAnimationData (input: unknown): Promise<{
  animations?: AnimationData[]
  manifest: LottieManifest | null
  isDotLottie: boolean
}> {
  try {
    if (!input || typeof input !== 'string' && typeof input !== 'object') {
      throw new Error('Broken file or invalid file format')
    }

    if (typeof input !== 'string') {
      const animations = Array.isArray(input) ? input : [input]

      return {
        animations,
        isDotLottie: false,
        manifest: null,
      }
    }

    const result = await fetch(input, { headers: { 'Content-Type': 'application/json; charset=UTF-8' } })

    if (!result.ok) {
      const error = new Error(result.statusText)

      throw error
    }

    /**
     * Check if file is JSON, first by parsing headers for content-type,
     * than by parsing filename, then – if filename has no extension – by
     * cloning the response and parsing response for content.
     */
    let isJSON = true
    const contentType = result.headers.get('content-type')

    if (contentType === 'application/zip+dotlottie') {
      isJSON = false
    }

    if (isJSON) {
      const ext = getExt(input)

      if (ext === 'json') {
        const lottie = await result.json()

        return {
          animations: [lottie],
          isDotLottie: false,
          manifest: null,
        }
      }
      const text = await result.clone().text()

      try {
        const lottie = JSON.parse(text)

        return {
          animations: [lottie],
          isDotLottie: false,
          manifest: null,
        }

      } catch (error) {
        /* empty */
      }
    }

    const { data, manifest } = await getLottieJSON(result)

    return {
      animations: data,
      isDotLottie: true,
      manifest,
    }
  } catch (error) {
    console.error(handleErrors(error).message)

    return {
      animations: undefined,
      isDotLottie: false,
      manifest: null,
    }
  }
}