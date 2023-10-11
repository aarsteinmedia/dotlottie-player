import {
  strFromU8,
  unzip as unzipOrg,
  zip
} from 'fflate'

import { CustomError } from './types'

import type {
  // UnzipFileFilter,
  Unzipped,
  Zippable
} from 'fflate'
import type {
  LottieAsset,
  LottieJSON,
  LottieManifest,
  ObjectFit,
} from './types'

export const addExt = (ext: string, str?: string) => {
  if (!str) return
  if (getExt(str)) {
    if (getExt(str) === ext)
      return str

    return `${getFilename(str)}.${ext}`
  }
  return `${str}.${ext}`
},

  aspectRatio = (objectFit: ObjectFit) => {
    switch (objectFit) {
      case 'contain':
      case 'scale-down':
        return 'xMidYMid meet';
      case 'cover':
        return 'xMidYMid slice';
      case 'fill':
        return 'none';
      case 'none':
        return 'xMinYMin slice';
      default:
        return 'xMidYMid meet';
    }
  },
  /**
   * Convert Base64 encoded string to Uint8Array
   * @param { string } str Base64 encoded string
   * @returns { Uint8Array} UTF-8/Latin-1 binary
   */
  base64ToU8 = (str: string) => {
    const parsedStr = str.substring(str.indexOf(',') + 1)
    return strToU8(isServer() ?
      Buffer.from(parsedStr, 'base64').toString('binary') :
        atob(parsedStr))
  },

  /**
   * Convert a JSON Lottie to dotLottie or combine several animations and download new dotLottie file in your browser.
   * @param { LottieJSON[] } animations The animations to combine.
   * @param { LottieManifest } manifest Manifest of meta information.
   * @param { string } filename Name of file to download. If not specified a random string will be generated.
   * @param { boolean } triggerDownload Whether to trigger a download in the browser. Defaults to true.
   */
  createDotLottie = async (
    animations: LottieJSON[],
    manifest: LottieManifest,
    filename?: string,
    triggerDownload = true
  ) => {
    try {
      if (!animations?.length || !manifest) {
        throw new Error('Missing required params')
      }

      const name = addExt('lottie', filename) || `${useId()}.lottie`,

        dotlottie: Zippable = {
          'manifest.json': [
            strToU8(JSON.stringify(manifest)),
            { level: 0 }
          ]
        }

      for (const [i, animation] of animations.entries()) {
        if (animation.assets?.length) {
          for (const asset of animation.assets) {
            const { id, p } = asset
            if (id && p) {
              const ext = getExtFromB64(p)
              asset.p = `${id}.${ext}`
              asset.e = 0
              dotlottie[`images/${id}.${ext}`]
                = [base64ToU8(p), { level: 9 }]
            }
          }
        }

        dotlottie[`animations/${manifest.animations[i].id}.json`] =
          [strToU8(JSON.stringify(animation)), { level: 9 }]
      }

      const buffer = await getArrayBuffer(dotlottie)

      return triggerDownload ?
        download(buffer, {
          name,
          mimeType: 'application/zip'
        }) : buffer
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

  frameOutput = (frame?: number) => {
    return ((frame ?? 0) + 1).toString().padStart(3, '0')
  },

  getAnimationData = async (input: unknown): Promise<{
    animations: LottieJSON[] | null
    manifest: LottieManifest | null
    isDotLottie?: boolean
  }> => {
    try {
      if (!input || (typeof input !== 'string' && typeof input !== 'object')) {
        throw new Error('Broken file or invalid file format')
      }

      if (typeof input !== 'string') {
        const animations =
          Array.isArray(input) ? input : [input]
        return {
          animations,
          manifest: null,
        }
      }

      const result = await fetch(input)

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
            manifest: null,
          }
        }
        const text = await result.clone().text()
        try {
          const lottie = JSON.parse(text)
          return {
            animations: [lottie],
            manifest: null,
          }
        } catch { /* Empty */ }
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
        animations: null,
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
      return
    return str.split('.').pop()?.toLowerCase()
  },

  getExtFromB64 = (str: string) => {
    const mime = str.split(':')[1].split(';')[0]
    return mime.split('/')[1].split('+')[0]
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
    return `${src.replace(/\.[^.]*$/, '').replace(/\W+/g, '')}${keepExt && ext ? `.${ext}` : ''}`.toLowerCase()
  },

  getLottieJSON = async (resp: Response) => {
    const unzipped = await unzip(resp),
      manifest = getManifest(unzipped),
      data = []
    for (const { id } of manifest.animations) {
      const str = strFromU8(unzipped[`animations/${id}.json`]),
        lottie: LottieJSON = JSON.parse(str)
      await resolveAssets(unzipped, lottie.assets)
      data.push(lottie)
    }

    return {
      data,
      manifest
    }
  },

  getManifest = (unzipped: Unzipped) => {
    const file = strFromU8(unzipped['manifest.json'], false),
      manifest: LottieManifest = JSON.parse(file)

    if (!('animations' in manifest))
      throw new Error('Manifest not found')
    if (!manifest.animations.length)
      throw new Error('No animations listed in manifest')

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

  hasExt = (path?: string) => {
    const lastDotIndex = path?.split('/').pop()?.lastIndexOf('.')
    return (lastDotIndex ?? 0) > 1 && path && path.length - 1 > (lastDotIndex ?? 0)
  },

  isAudio = (asset: LottieAsset) => {
    return !('h' in asset) && !('w' in asset) && 'p' in asset && 'e' in asset && 'u' in asset && 'id' in asset
  },

  isImage = (asset: LottieAsset) =>{
    return 'w' in asset && 'h' in asset && !('xt' in asset) && 'p' in asset
  },

  isServer = () => {
    return !(typeof window !== 'undefined' && window.document)
  },

  /**
   * Convert string to Uint8Array
   * @param { string } str Base64 encoded string
   * @returns { Uint8Array} UTF-8/Latin-1 binary
   */
  strToU8 = (str: string) => {
    const u8 = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
      u8[i] = str.charCodeAt(i)
    }
    return u8
  },

  resolveAssets = async (unzipped: Unzipped, assets?: LottieAsset[]) => {
    if (!Array.isArray(assets))
      return

    const toResolve: Promise<void>[] = []

    for (const asset of assets) {
      if (!isAudio(asset) && !isImage(asset))
        continue

      const type = isImage(asset) ? 'images' : 'audio',
        u8 = unzipped?.[`${type}/${asset.p}`]

      if (!u8)
        continue

      toResolve.push(
        new Promise<void>(resolveAsset => {
          const assetB64 = isServer() ? Buffer.from(u8).toString('base64') :
            btoa(u8.reduce((dat, byte) => (
              dat + String.fromCharCode(byte)
            ), ''))

          asset.p = `data:${getMimeFromExt(getExt(asset.p))};base64,${assetB64}`
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
        unzipOrg(u8, /*{ filter },*/ (err, file) => {
          if (err) {
            reject(err)
          }
          resolve(file)
        })
      })
    return unzipped
  },

  useId = (prefix?: string) => {
    const s4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (`${prefix ?? `:${s4()}`}-${s4()}`)
  }