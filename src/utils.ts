import {
  strFromU8,
  strToU8,
  unzip as unzipOrg,
  zip,
  type Unzipped,
  type Zippable,
} from 'fflate'
import type {
  AnimationData,
  LottieAsset,
  LottieManifest,
} from '@aarsteinmedia/lottie-web'
import { createElementID } from '@aarsteinmedia/lottie-web/utils'
import { ObjectFit } from '@/enums'

export class CustomError extends Error {
  status?: number
}

export const addExt = (ext: string, str?: string) => {
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
  aspectRatio = (objectFit: string) => {
    switch (objectFit) {
      case ObjectFit.Contain:
      case ObjectFit.ScaleDown:
        return 'xMidYMid meet'
      case ObjectFit.Cover:
        return 'xMidYMid slice'
      case ObjectFit.Fill:
        return 'none'
      case ObjectFit.None:
        return 'xMinYMin slice'
      default:
        return 'xMidYMid meet'
    }
  },
  /**
   * Convert Base64 encoded string to Uint8Array
   * @param { string } str Base64 encoded string
   * @returns { Uint8Array } UTF-8/Latin-1 binary
   */
  base64ToU8 = (str: string) =>
    strToU8(
      isServer()
        ? Buffer.from(parseBase64(str), 'base64').toString('binary')
        : atob(parseBase64(str)),
      true
    ),
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
    manifest: LottieManifest
    fileName?: string
    shouldDownload?: boolean
  }) => {
    try {
      // Input validation
      if (!animations.length || !manifest) {
        throw new Error(
          `Missing or malformed required parameter(s):\n ${
            animations.length ? '- manifest\n' : ''
          } ${manifest ? '- animations\n' : ''}`
        )
      }

      const manifestCompressionLevel = 0,
        animationCompressionLevel = 9,
        // Prepare the dotLottie file
        name = addExt('lottie', fileName) || `${createElementID()}.lottie`,
        dotlottie: Zippable = {
          'manifest.json': [
            strToU8(JSON.stringify(manifest), true),
            { level: manifestCompressionLevel },
          ],
        }

      // Add animations and assets to the dotLottie file
      const { length } = animations
      for (let i = 0; i < length; i++) {
        const { length: jLen } = animations[i].assets
        for (let j = 0; j < jLen; j++) {
          if (
            !animations[i].assets[j].p ||
            (!isImage(animations[i].assets[j]) &&
              !isAudio(animations[i].assets[j]))
          ) {
            continue
          }

          const { p: file, u: path } = animations[i].assets[j]

          if (!file) {
            continue
          }
          // Original asset.id caused issues with multianimations
          const assetId = createElementID(),
            isEncoded = file.startsWith('data:'),
            ext = isEncoded ? getExtFromB64(file) : getExt(file),
            // Check if the asset is already base64-encoded. If not, get path, fetch it, and encode it
            dataURL = isEncoded
              ? file
              : await fileToBase64(
                  path
                    ? (path.endsWith('/') && `${path}${file}`) ||
                        `${path}/${file}`
                    : file
                )

          animations[i].assets[j].p = `${assetId}.${ext}`

          // Asset is embedded, so path empty string
          animations[i].assets[j].u = ''

          // Asset is encoded
          animations[i].assets[j].e = 1

          dotlottie[
            `${isAudio(animations[i].assets[j]) ? 'audio' : 'images'}/${assetId}.${ext}`
          ] = [base64ToU8(dataURL), { level: animationCompressionLevel }]
        }

        dotlottie[`animations/${manifest.animations[i].id}.json`] = [
          strToU8(JSON.stringify(animations[i]), true),
          { level: animationCompressionLevel },
        ]
      }

      const buffer = await getArrayBuffer(dotlottie)

      return shouldDownload
        ? download(buffer, {
            mimeType: 'application/zip',
            name,
          })
        : buffer
    } catch (err) {
      console.error(`❌ ${handleErrors(err).message}`)
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
        throw new Error(
          "createJSON: Missing or malformed required parameter(s):\n - animation\n'"
        )
      }

      const name = addExt('json', fileName) || `${createElementID()}.json`,
        jsonString = JSON.stringify(animation)
      return shouldDownload
        ? download(jsonString, {
            mimeType: 'application/json',
            name,
          })
        : jsonString
    } catch (err) {
      console.error(`❌ ${handleErrors(err).message}`)
    }
  },
  /**
   * Download file, either SVG or dotLottie.
   * @param { string } data The data to be downloaded
   * @param { string } name Don't include file extension in the filename
   */
  download = (
    data: string | ArrayBuffer,
    options?: {
      name: string
      mimeType: string
    }
  ) => {
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
          reject()
        }
        reader.readAsDataURL(blob)
      } catch (e) {
        reject(e)
      }
    })
  },
  frameOutput = (frame?: number) =>
    ((frame ?? 0) + 1).toString().padStart(3, '0'),
  getAnimationData = async (
    input: unknown
  ): Promise<{
    animations?: AnimationData[]
    manifest: LottieManifest | null
    isDotLottie: boolean
  }> => {
    try {
      if (!input || (typeof input !== 'string' && typeof input !== 'object')) {
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

      const result = await fetch(input, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      })

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
    } catch (err) {
      console.error(`❌ ${handleErrors(err).message}`)
      return {
        animations: undefined,
        isDotLottie: false,
        manifest: null,
      }
    }
  },
  getArrayBuffer = async (zippable: Zippable) => {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      zip(zippable, { level: 9 }, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        if (!(data.buffer instanceof ArrayBuffer)) {
          reject('Data is not transferable')
          return
        }
        resolve(data.buffer)
      })
    })
    return arrayBuffer
  },
  /**
   * Get extension from filename, URL or path
   * @param { string } str Filename, URL or path
   */
  getExt = (str?: string) => {
    if (typeof str !== 'string' || !str || !hasExt(str)) {
      return
    }
    return str.split('.').pop()?.toLowerCase()
  },
  getExtFromB64 = (str: string) => {
    const mime = str.split(':')[1].split(';')[0],
      ext = mime.split('/')[1].split('+')[0]
    return ext
  },
  /**
   * Parse URL to get filename
   * @param { string } src The url string
   * @param { boolean } keepExt Whether to include file extension
   * @returns { string } Filename, in lowercase
   */
  getFilename = (src: string, keepExt?: boolean) => {
    // Because the regex strips all special characters, we need to extract the file extension, so we can add it later if we need it
    const ext = getExt(src)
    return `${src
      .split('/')
      .pop()
      ?.replace(/\.[^.]*$/, '')
      .replace(/\W+/g, '-')}${keepExt && ext ? `.${ext}` : ''}` // .toLowerCase()
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

    if (unzipped[`a/${manifest.animations[0].id}.json`]) {
      animationsFolder = 'a'
    }

    for (let i = 0; i < length; i++) {
      const str = strFromU8(
          unzipped[`${animationsFolder}/${manifest.animations[i].id}.json`]
        ),
        lottie: AnimationData = JSON.parse(prepareString(str))

      toResolve.push(resolveAssets(unzipped, lottie.assets))
      data.push(lottie)
    }

    await Promise.all(toResolve)

    return {
      data,
      manifest,
    }
  },
  getManifest = (unzipped: Unzipped) => {
    const file = strFromU8(unzipped['manifest.json'], false),
      manifest: LottieManifest = JSON.parse(file)

    if (!('animations' in manifest)) {
      throw new Error('Manifest not found')
    }
    if (!manifest.animations.length) {
      throw new Error('No animations listed in manifest')
    }

    return manifest
  },
  getMimeFromExt = (ext?: string) => {
    switch (ext) {
      case 'svg':
      case 'svg+xml':
        return 'image/svg+xml'
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
      case 'gif':
      case 'webp':
      case 'avif':
        return `image/${ext}`
      case 'mp3':
      case 'mpeg':
      case 'wav':
        return `audio/${ext}`
      default:
        return ''
    }
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
  hasExt = (path?: string) => {
    const lastDotIndex = path?.split('/').pop()?.lastIndexOf('.')
    return (
      (lastDotIndex ?? 0) > 1 && path && path.length - 1 > (lastDotIndex ?? 0)
    )
  },
  isAudio = (asset: LottieAsset) =>
    !('h' in asset) &&
    !('w' in asset) &&
    'p' in asset &&
    'e' in asset &&
    'u' in asset &&
    'id' in asset,
  isBase64 = (str?: string) => {
    if (!str) {
      return false
    }
    const regex =
      /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
    return regex.test(parseBase64(str))
  },
  isImage = (asset: LottieAsset) =>
    'w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset,
  isServer = () => !(typeof window !== 'undefined' && window.document),
  parseBase64 = (str: string) => str.substring(str.indexOf(',') + 1),
  prepareString = (str: string) =>
    str
      .replace(new RegExp(/"""/, 'g'), '""')
      .replace(/(["'])(.*?)\1/g, (_match, quote: string, content: string) => {
        const replacedContent = content.replace(/[^\w\s\d.#]/g, '')
        return `${quote}${replacedContent}${quote}`
      }),
  resolveAssets = async (unzipped: Unzipped, assets?: LottieAsset[]) => {
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

      toResolve.push(
        new Promise<void>((resolveAsset) => {
          const assetB64 = isServer()
            ? Buffer.from(u8).toString('base64')
            : btoa(
                u8.reduce(
                  (dat, byte) => `${dat}${String.fromCharCode(byte)}`,
                  ''
                )
              )

          assets[i].p =
            assets[i].p?.startsWith('data:') || isBase64(assets[i].p)
              ? assets[i].p
              : `data:${getMimeFromExt(getExt(assets[i].p))};base64,${assetB64}`
          assets[i].e = 1
          assets[i].u = ''

          resolveAsset()
        })
      )
    }

    await Promise.all(toResolve)
  },
  unzip = async (
    resp: Response
    // filter: UnzipFileFilter = () => true
  ): Promise<Unzipped> => {
    const u8 = new Uint8Array(await resp.arrayBuffer()),
      unzipped = await new Promise<Unzipped>((resolve, reject) => {
        unzipOrg(
          u8,
          /* { filter }, */ (err, file) => {
            if (err) {
              reject(err)
            }
            resolve(file)
          }
        )
      })
    return unzipped
  }
