import { fixture } from '@open-wc/testing'
import { assert, expect } from '@esm-bundle/chai'
import DotLottiePlayer from '@/index'

describe('DotLottiePlayer Component', () => {
  let el: DotLottiePlayer

  beforeEach(async () => {
    el = await fixture<DotLottiePlayer>(
      /* HTML */ `<dotlottie-player
        controls
        src="./assets/dev.lottie"
      ></dotlottie-player>`
    )

    assert(el instanceof DotLottiePlayer)
  })

  it('Is loaded', () => {
    assert('load' in el)
  })

  it('Passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible()
  })

  // it('Downloads SVG snapshot', () => {
  //   let download: SVGElement | null = null
  //   try {
  //     if (!('snapshot' in el)) {
  //       throw new Error('Could not load Lottie Player')
  //     }
  //     const svg = el.snapshot(false),
  //       domParser = new DOMParser()
  //     if (!svg) {
  //       throw new Error('Could not download file')
  //     }
  //     const htmlDoc = domParser.parseFromString(svg, 'text/html')
  //     if (htmlDoc.getElementsByTagName('parsererror').length > 0) {
  //       throw new Error(
  //         htmlDoc.getElementsByTagName('parsererror')[0].innerHTML
  //       )
  //     }
  //     if (htmlDoc.body.childNodes[0] instanceof SVGElement) {
  //       download = htmlDoc.body.childNodes[0]
  //     }
  //   } catch (e) {
  //     console.error('❌ Error while parsing SVG: ', e)
  //   }
  //   assert(download instanceof SVGElement)
  // })
})
