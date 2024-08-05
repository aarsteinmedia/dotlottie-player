import {
  strFromU8,
  strToU8,
  unzip as unzipOrg,
  zip,
  type Unzipped,
  type Zippable
} from 'fflate'
import type {
  LottieAsset,
  LottieJSON,
  LottieManifest,
} from './types'

export enum ObjectFit {
  Contain = 'contain',
  Cover = 'cover',
  Fill = 'fill',
  ScaleDown = 'scale-down',
  None = 'none'
}

export enum PlayerState {
  Completed = 'completed',
  Destroyed = 'destroyed',
  Error = 'error',
  Frozen = 'frozen',
  Loading = 'loading',
  Paused = 'paused',
  Playing = 'playing',
  Stopped = 'stopped',
}

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export enum PlayerEvents {
  Complete = 'complete',
  Destroyed = 'destroyed',
  Error = 'error',
  Frame = 'frame',
  Freeze = 'freeze',
  Load = 'load',
  Loop = 'loop',
  Next = 'next',
  Pause = 'pause',
  Play = 'play',
  Previous = 'previous',
  Ready = 'ready',
  Rendered = 'rendered',
  Stop = 'stop',
}

export enum PreserveAspectRatio {
  Contain = 'xMidYMid meet',
  Cover = 'xMidYMid slice',
  None = 'xMinYMin slice',
  Initial = 'none'
}

export class CustomError extends Error {
  status?: number
}

export const addExt = (ext: string, str?: string) => {
    if (!str) {return}
    if (getExt(str)) {
      if (getExt(str) === ext)
      {return str}

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
    strToU8(isServer() ?
      Buffer.from(parseBase64(str), 'base64').toString('binary') :
      atob(parseBase64(str)), true),

  /**
   * Convert a JSON Lottie to dotLottie or combine several animations and download new dotLottie file in your browser.
   */
  createDotLottie = async ({
    animations,
    manifest,
    fileName,
    shouldDownload = true
  }: {
    animations?: LottieJSON[]
    manifest: LottieManifest
    fileName?: string
    shouldDownload?: boolean
  }) => {
    try {
      if (!animations?.length || !manifest) {
        throw new Error(
          `Missing or malformed required parameter(s):\n ${
            animations?.length ? '- manifest\n' : ''} ${
            manifest ? '- animations\n' : ''}`
        )
      }

      const name = addExt('lottie', fileName) || `${useId()}.lottie`,

        dotlottie: Zippable = {
          'manifest.json': [
            strToU8(JSON.stringify(manifest), true),
            { level: 0 } // <- Level of compression (no compression)
          ]
        }

      for (const [i, animation] of animations.entries()) {
        for (const asset of animation.assets ?? []) {
          if (!asset.p || (!isImage(asset) && !isAudio(asset))) {
            continue
          }

          const { p: file, u: path } = asset,
            // asset.id caused issues with multianimations
            assetId = /* asset.id || */ useId('asset'),
            isEncoded = file.startsWith('data:'),
            ext = isEncoded ? getExtFromB64(file) : getExt(file),

            // Check if the asset is already base64-encoded. If not, get path, fetch it, and encode it
            dataURL = isEncoded ? file : await fileToBase64(path ? ((path.endsWith('/') && `${path}${file}`) || `${path}/${file}`) : file)

          asset.p = `${assetId}.${ext}`

          // Asset is embedded, so path empty string
          asset.u = ''

          // Asset is encoded
          asset.e = 1

          dotlottie[`${isAudio(asset) ? 'audio' : 'images'}/${assetId}.${ext}`] =
          [
            base64ToU8(dataURL),
            { level: 9 } // <- Level of compression
          ]
        }

        dotlottie[`animations/${manifest.animations[i].id}.json`] =
        [
          strToU8(JSON.stringify(animation), true),
          { level: 9 } // <- Level of compression
        ]
      }

      const buffer = await getArrayBuffer(dotlottie)

      return shouldDownload ?
        download(buffer, {
          name,
          mimeType: 'application/zip'
        }) : buffer
    } catch (err) {
      console.error(`❌ ${handleErrors(err).message}`)
    }
  },

  createJSON = ({
    animation,
    fileName,
    shouldDownload
  }: {
    animation?: LottieJSON
    fileName?: string
    shouldDownload?: boolean
  }) => {
    try {
      if (!animation) {
        throw new Error(
          'Missing or malformed required parameter(s):\n - animation\n\''
        )
      }

      const name = addExt('json', fileName) || `${useId()}.json`,
        jsonString = JSON.stringify(animation)
      return shouldDownload ?
        download(jsonString, {
          name,
          mimeType: 'application/json'
        }) : jsonString
    } catch(err) {
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
      name: string,
      mimeType: string
    }
  ) => {
    const blob = new Blob([data], { type: options?.mimeType }),

      fileName = options?.name || useId(),
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

  getAnimationData = async (input: unknown): Promise<{
    animations?: LottieJSON[]
    manifest?: LottieManifest
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
          manifest: undefined,
          isDotLottie: false
        }
      }

      const result = await fetch(input, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
      })

      if (!result.ok) {
        const error = new CustomError(result.statusText)
        error.status = result.status
        throw error
      }

      /**
       * Check if file is JSON, first by parsing file name for extension,
       * then – if filename has no extension – by cloning the response
       * and parsing it for content.
       */
      const ext = getExt(input)
      if (ext === 'json' || !ext) {
        if (ext) {
          const lottie = await result.json()
          return {
            animations: [lottie],
            manifest: undefined,
            isDotLottie: false
          }
        }
        const text = await result.clone().text()
        try {
          const lottie = JSON.parse(text)
          return {
            animations: [lottie],
            manifest: undefined,
            isDotLottie: false
          }
        } catch(e) {
          console.warn(e)
        }
      }

      const { data, manifest } = await getLottieJSON(result)

      return {
        animations: data,
        manifest,
        isDotLottie: true
      }

    } catch (err) {
      console.error(`❌ ${handleErrors(err).message}`)
      return {
        animations: undefined,
        manifest: undefined,
        isDotLottie: false
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
    if (!str || !hasExt(str))
    {return}
    const ext = str.split('.').pop()?.toLowerCase()
    return ext
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
    return `${src.split('/').pop()?.replace(/\.[^.]*$/, '').replace(/\W+/g, '-')}${keepExt && ext ? `.${ext}` : ''}` // .toLowerCase()
  },

  getLottieJSON = async (resp: Response) => {
    const unzipped = await unzip(resp),
      manifest = getManifest(unzipped),
      data = [],
      toResolve: Promise<void>[] = []
    for (const { id } of manifest.animations) {
      const str = strFromU8(unzipped[`animations/${id}.json`]),
        lottie: LottieJSON = JSON.parse(prepareString(str))

      toResolve.push(resolveAssets(unzipped, lottie.assets))
      data.push(lottie)
    }

    await Promise.all(toResolve)

    return {
      data,
      manifest
    }
  },

  getManifest = (unzipped: Unzipped) => {
    const file = strFromU8(unzipped['manifest.json'], false),
      manifest: LottieManifest = JSON.parse(file)

    if (!('animations' in manifest))
    {throw new Error('Manifest not found')}
    if (!manifest.animations.length)
    {throw new Error('No animations listed in manifest')}

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
      status: isServer() ? 500 : 400
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
    return (lastDotIndex ?? 0) > 1 && path && path.length - 1 > (lastDotIndex ?? 0)
  },

  isAudio = (asset: LottieAsset) =>
    !('h' in asset) && !('w' in asset) && 'p' in asset && 'e' in asset && 'u' in asset && 'id' in asset,

  isBase64 = (str?: string) => {
    if (!str)
    {return false}
    const regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
    return regex.test(parseBase64(str))
  },

  isImage = (asset: LottieAsset) =>
    'w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset,

  isServer = () =>
    !(typeof window !== 'undefined' && window.document),

  parseBase64 = (str: string) =>
    str.substring(str.indexOf(',') + 1),

  prepareString = (str: string) => str.replace(new RegExp(/"""/, 'g'), '""').replace(/(["'])(.*?)\1/g, (_match, quote: string, content: string) => {
    const replacedContent = content.replace(/[^\w\s\d.#]/g, '')
    return `${quote}${replacedContent}${quote}`
  }),

  resolveAssets = async (unzipped: Unzipped, assets?: LottieAsset[]) => {
    if (!Array.isArray(assets)) {
      return
    }

    const toResolve: Promise<void>[] = []

    for (const asset of assets) {
      if (!isAudio(asset) && !isImage(asset)) {
        continue
      }

      const type = isImage(asset) ? 'images' : 'audio',
        u8 = unzipped?.[`${type}/${asset.p}`]

      if (!u8) {
        continue
      }

      toResolve.push(
        new Promise<void>(resolveAsset => {
          const assetB64 = isServer() ? Buffer.from(u8).toString('base64') :
            btoa(u8.reduce((dat, byte) => (
              `${dat}${String.fromCharCode(byte)}`
            ), ''))

          asset.p = (asset.p?.startsWith('data:') || isBase64(asset.p)) ? asset.p :
            `data:${getMimeFromExt(getExt(asset.p))};base64,${assetB64}`
          asset.e = 1
          asset.u = ''

          resolveAsset()
        })
      )
    }

    await Promise.all(toResolve)
  },

  unzip = async (
    resp: Response,
    // filter: UnzipFileFilter = () => true
  ): Promise<Unzipped> => {
    const u8 = new Uint8Array(await resp.arrayBuffer()),
      unzipped = await new Promise<Unzipped>((resolve, reject) => {
        unzipOrg(u8, /* { filter }, */ (err, file) => {
          if (err) {
            reject(err)
          }
          resolve(file)
        })
      })
    return unzipped
  },

  useId = (prefix?: string) => {
    const s4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    return (`${prefix ?? `:${s4()}`}_${s4()}`)
  }