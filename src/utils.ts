import type {
  AnimationData,
  LottieAsset,
  LottieManifest,
} from '@aarsteinmedia/lottie-web'

import { createElementID, PreserveAspectRatio } from '@aarsteinmedia/lottie-web/utils'
import {
  strFromU8,
  strToU8,
  unzip as unzipOrg,
  zip,
  type Unzipped,
  type Zippable,
} from 'fflate'

import { ObjectFit } from '@/enums'

export class CustomError extends Error {
  status?: number
}

/**
 * Methods used locally and exported.
 */
export const getManifest = (unzipped: Unzipped) => {
    const file = strFromU8(unzipped['manifest.json'], false),
      manifest: LottieManifest = JSON.parse(file)

    if (!('animations' in manifest)) {
      throw new Error('Manifest not found')
    }
    if (manifest.animations.length === 0) {
      throw new Error('No animations listed in manifest')
    }

    return manifest
  },
  isServer = () => !(typeof window !== 'undefined' && window.document)

/**
 * Methods used only locally.
 */
const hasExt = (path?: string) => {
  const lastDotIndex = path?.split('/').pop()?.lastIndexOf('.')

  return (
    (lastDotIndex ?? 0) > 1 && path && path.length - 1 > (lastDotIndex ?? 0)
  )
}

/**
 * Get extension from filename, URL or path.
 */
export const getExt = (str?: string) => {
  if (typeof str !== 'string' || !str || !hasExt(str)) {
    return
  }

  return str.split('.').pop()?.toLowerCase()
}

const unzip = async (resp: Response): Promise<Unzipped> => {
    const u8 = new Uint8Array(await resp.arrayBuffer()),
      unzipped = await new Promise<Unzipped>((resolve, reject) => {
        unzipOrg(u8,
          (err, file) => {
            if (err) {
              reject(err)
            }
            resolve(file)
          })
      })

    return unzipped
  },
  getArrayBuffer = async (zippable: Zippable) => {
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
  getMimeFromExt = (ext?: string) => {
    switch (ext) {
      case 'svg':
      case 'svg+xml': {
        return 'image/svg+xml'
      }
      case 'jpg':
      case 'jpeg': {
        return 'image/jpeg'
      }
      case 'png':
      case 'gif':
      case 'webp':
      case 'avif': {
        return `image/${ext}`
      }
      case 'mp3':
      case 'mpeg':
      case 'wav': {
        return `audio/${ext}`
      }
      default: {
        return ''
      }
    }
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
  parseBase64 = (str: string) => str.slice(Math.max(0, str.indexOf(',') + 1)),
  isBase64 = (str?: string) => {
    if (!str) {
      return false
    }
    const regex =
      /^(?:[0-9a-z+/]{4})*(?:[0-9a-z+/]{2}==|[0-9a-z+/]{3}=)?$/i

    return regex.test(parseBase64(str))
  },
  resolveAssets = async (unzipped?: Unzipped, assets?: LottieAsset[]) => {
    if (!Array.isArray(assets)) {
      return
    }

    const toResolve: Promise<void>[] = [],
      { length } = assets

    for (let i = 0; i < length; i++) {
      if (!isAudio(assets[i]) && !isImage(assets[i])) {
        continue
      }

      const type = isImage(assets[i]) ? 'images' : 'audio',
        u8 = unzipped?.[`${type}/${assets[i].p}`]

      if (!u8) {
        continue
      }

      toResolve.push(new Promise<void>((resolveAsset) => {
        let assetB64: string

        if (isServer()) {
          assetB64 = Buffer.from(u8).toString('base64')
        } else {
          let result = ''
          const { length: jLen } = u8

          for (let j = 0; j < jLen; j++) {
            result += String.fromCharCode(u8[j])
          }

          assetB64 = btoa(result)
        }

        assets[i].p =
          assets[i].p?.startsWith('data:') || isBase64(assets[i].p)
            ? assets[i].p
            : `data:${getMimeFromExt(getExt(assets[i].p))};base64,${assetB64}`
        assets[i].e = 1
        assets[i].u = ''

        resolveAsset()
      }))
    }

    await Promise.all(toResolve)
  },
  prepareString = (str: string) =>
    str
      .replaceAll(new RegExp(/"""/, 'g'), '""')
      .replaceAll(/(["'])(.*?)\1/g, (
        _match, quote: string, content: string
      ) => {
        const replacedContent = content.replaceAll(/[^\w\s.#]/g, '')

        return `${quote}${replacedContent}${quote}`
      }),
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
  },
  getLottieJSON = async (resp: Response) => {
    const unzipped = await unzip(resp),
      manifest = getManifest(unzipped),
      data = [],
      toResolve: Promise<void>[] = [],
      { length } = manifest.animations

    /**
     * Check whether Lottie animations folder is abbreviated.
     */
    let animationsFolder = 'animations'

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (unzipped[`a/${manifest.animations[0].id}.json`]) {
      animationsFolder = 'a'
    }

    for (let i = 0; i < length; i++) {
      const str = strFromU8(unzipped[`${animationsFolder}/${manifest.animations[i].id}.json`]),
        lottie: AnimationData = JSON.parse(prepareString(str))

      // Handle Expressions
      const { length: jLen } = lottie.layers

      for (let j = 0; j < jLen; j++) {
        const { ks: shape } = lottie.layers[j],
          props = Object.keys(shape) as (keyof typeof shape)[],
          { length: pLen } = props

        for (let p = 0; p < pLen; p++) {
          const { e: isEncoded, x: expression } = shape[props[p]] as {
            x?: string;
            e?: 0 | 1
          }

          if (!expression || !isEncoded) {
            continue
          }

          // Base64 Decode to handle compression
          // @ts-expect-error
          lottie.layers[j].ks[props[p]].x = atob(expression)
        }

      }

      toResolve.push(resolveAssets(unzipped, lottie.assets))
      data.push(lottie)
    }

    await Promise.all(toResolve)

    return {
      data,
      manifest,
    }
  }

/**
 * Download file, either SVG or dotLottie.
 */
export const download = (data: string | ArrayBuffer,
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
  aspectRatio = (objectFit: ObjectFit) => {
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
   * Convert Base64 encoded string to Uint8Array.
   *
   * @param str - Base64 encoded string.
   * @returns UTF-8/Latin-1 binary.
   */
  base64ToU8 = (str: string) =>
    strToU8(isServer()
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
      status: isServer() ? 500 : 400,
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
  /**
   * Convert a JSON Lottie to dotLottie or combine several animations and download new dotLottie file in your browser.
   */
  createDotLottie = async ({
    animations = [],
    fileName,
    manifest,
    shouldDownload = true,
  }: {
    animations?: AnimationData[]
    manifest?: LottieManifest
    fileName?: string
    shouldDownload?: boolean
  }) => {
    try {
      // Input validation
      if (animations.length === 0 || !manifest) {
        throw new Error(`Missing or malformed required parameter(s):\n ${
          animations.length > 0 ? '- manifest\n' : ''
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
      console.error(`❌ ${handleErrors(error).message}`)

      return null
    }
  },
  createJSON = ({
    animation,
    fileName,
    shouldDownload,
  }: {
    animation?: AnimationData
    fileName?: string
    shouldDownload?: boolean
  }) => {
    try {
      if (!animation) {
        throw new Error('createJSON: Missing or malformed required parameter(s):\n - animation\n\'')
      }

      const name = addExt('json', fileName) || `${createElementID()}.json`,
        jsonString = JSON.stringify(animation)

      if (shouldDownload) {
        download(jsonString, {
          mimeType: 'application/json',
          name,
        })
      }

      return
    } catch (error) {
      console.error(`❌ ${handleErrors(error).message}`)
    }
  },
  frameOutput = (frame?: number) =>
    ((frame ?? 0) + 1).toString().padStart(3, '0'),
  getAnimationData = async (input: unknown): Promise<{
    animations?: AnimationData[]
    manifest: LottieManifest | null
    isDotLottie: boolean
  }> => {
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
        const error = new CustomError(result.statusText)

        error.status = result.status
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
      console.error(`❌ ${handleErrors(error).message}`)

      return {
        animations: undefined,
        isDotLottie: false,
        manifest: null,
      }
    }
  }
