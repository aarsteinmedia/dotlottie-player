import type { LottieAsset } from '@aarsteinmedia/lottie-web'
import type { Unzipped } from 'fflate'

import { isServer } from '@aarsteinmedia/lottie-web/utils'

import {
  getExt, isAudio, isImage,
  parseBase64
} from '@/utils'

const getMimeFromExt = (ext?: string) => {
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
  isBase64 = (str?: string) => {
    if (!str) {
      return false
    }
    const regex =
      /^(?:[0-9a-z+/]{4})*(?:[0-9a-z+/]{2}==|[0-9a-z+/]{3}=)?$/i

    return regex.test(parseBase64(str))
  }

export default async function resolveAssets (unzipped?: Unzipped, assets?: LottieAsset[]) {
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

      if (isServer) {
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
}