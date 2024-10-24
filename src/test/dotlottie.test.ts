import { fixture } from '@open-wc/testing'
import { expect } from '@esm-bundle/chai'
import DotLottiePlayer from '@/elements/DotLottiePlayer'

describe('DotLottiePlayer Component', () => {
  let el: DotLottiePlayer

  beforeEach(async () => {
    el = await fixture<DotLottiePlayer>(
      /* HTML */ `<dotlottie-player
        animateOnScroll
        autoplay
        controls
        subframe
        src="./assets/dev.lottie"
      ></dotlottie-player>`
    )
  })

  it('passes the a11y audit', async () => {
    await expect(el).shadowDom.to.be.accessible()
  })
})
