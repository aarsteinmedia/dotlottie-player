import { getExt } from '@aarsteinmedia/lottie-web/utils'
import { expect } from '@esm-bundle/chai'

it('Get extension from filename, URL or path', () => {
  expect(getExt('cat.jpg')).to.equal('jpg')
  expect(getExt('Hello world.jpeg')).to.equal('jpeg')
  expect(getExt('image.AVIF')).to.equal('avif')
  expect(getExt('converted.jpg.webp')).to.equal('webp')
})
