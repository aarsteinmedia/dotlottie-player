import type { AnimationData, LottieManifest } from '@aarsteinmedia/lottie-web'

import { createElementID } from '@aarsteinmedia/lottie-web/utils'
import {
  strToU8, zip, type Zippable
} from 'fflate'

import {
  addExt, base64ToU8, download, getExt, getExtFromB64, handleErrors, isAudio, isImage
} from '@/utils'

const getArrayBuffer = async (zippable: Zippable) => {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      zip(
        zippable, { level: 9 }, (err, data) => {
          if (err) {
            reject(err)

            return
          }
          if (!(data.buffer instanceof ArrayBuffer)) {
            reject(new Error('Data is not transferable'))

            return
          }
          resolve(data.buffer)
        }
      )
    })

    return arrayBuffer
  },
  fileToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url),
      blob = await response.blob()

    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()

        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)

            return
          }
          reject(new Error('Could not create bas64'))
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        reject(error as Error)
      }
    })
  }

/**
   * Convert a JSON Lottie to dotLottie or combine several animations and download new dotLottie file in your browser.
   */
export default async function createDotLottie ({
  animations = [],
  fileName,
  manifest,
  shouldDownload = true,
}: {
  animations?: AnimationData[]
  manifest?: LottieManifest
  fileName?: string
  shouldDownload?: boolean
}) {
  try {
    // Input validation
    if (animations.length === 0 || !manifest) {
      throw new Error(`Missing or malformed required parameter(s):\n ${animations.length > 0 ? '- manifest\n' : ''
      } ${manifest ? '- animations\n' : ''}`)
    }

    const manifestCompressionLevel = 0,
      animationCompressionLevel = 9,
      /**
       * Prepare the dotLottie file.
       */
      name = addExt('lottie', fileName) || `${createElementID()}.lottie`,
      dotlottie: Zippable = {
        'manifest.json': [
          strToU8(JSON.stringify(manifest), true), { level: manifestCompressionLevel },
        ],
      }


    // Add animations and assets to the dotLottie file
    const { length } = animations

    for (let i = 0; i < length; i++) {
      const { length: jLen } = animations[i].assets

      // Prepare assets
      for (let j = 0; j < jLen; j++) {
        const asset = animations[i].assets[j]

        if (
          !asset.p ||
          !isImage(asset) &&
          !isAudio(asset)
        ) {
          continue
        }

        const { p: file, u: path } = asset

        if (!file) {
          continue
        }
        // Original asset.id caused issues with multianimations
        const assetId = createElementID(),
          isEncoded = file.startsWith('data:'),
          ext = isEncoded ? getExtFromB64(file) : getExt(file),
          /**
           * Check if the asset is already base64-encoded. If not, get path, fetch it, and encode it.
           */
          dataURL = isEncoded
            ? file
            : await fileToBase64(path
              ? path.endsWith('/') && `${path}${file}` ||
                `${path}/${file}`
              : file)

        // Asset is encoded
        // eslint-disable-next-line require-atomic-updates
        animations[i].assets[j].e = 1
        // eslint-disable-next-line require-atomic-updates
        animations[i].assets[j].p = `${assetId}.${ext}`
        // Asset is embedded, so path empty string
        // eslint-disable-next-line require-atomic-updates
        animations[i].assets[j].u = ''


        dotlottie[
          `${isAudio(asset) ? 'audio' : 'images'}/${assetId}.${ext}`
        ] = [base64ToU8(dataURL), { level: animationCompressionLevel }]
      }

      // Prepare expressions
      const { length: kLen } = animations[i].layers

      for (let k = 0; k < kLen; k++) {
        const { ks: shape } = animations[i].layers[k],
          props = Object.keys(shape) as (keyof typeof shape)[],
          { length: pLen } = props

        for (let p = 0; p < pLen; p++) {
          const { x: expression } = shape[props[p]] as { x?: string }

          if (!expression) {
            continue
          }

          // Base64 Encode to handle compression
          // @ts-expect-error: We have checked this property is set
          animations[i].layers[k].ks[props[p]].x = btoa(expression)

          // Set e (encoded) to 1
          // @ts-expect-error: We have checked this property is set
          animations[i].layers[k].ks[props[p]].e = 1
        }

      }

      dotlottie[`a/${manifest.animations[i].id}.json`] = [
        strToU8(JSON.stringify(animations[i]), true), { level: animationCompressionLevel },
      ]
    }

    const buffer = await getArrayBuffer(dotlottie)

    if (shouldDownload) {
      download(buffer, {
        mimeType: 'application/zip',
        name,
      })

      return null
    }

    return buffer
  } catch (error) {
    console.error(handleErrors(error).message)

    return null
  }
}