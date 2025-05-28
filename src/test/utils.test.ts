import { expect } from '@esm-bundle/chai'

import { getExt } from '@/utils'

it('Get extension from filename, URL or path', () => {
  expect(getExt('cat.jpg')).to.equal('jpg')
  expect(getExt('Hello world.jpeg')).to.equal('jpeg')
  expect(getExt('image.AVIF')).to.equal('avif')
  expect(getExt('converted.jpg.webp')).to.equal('webp')
})
