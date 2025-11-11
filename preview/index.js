import files from './files.js'

const previewForm = document.querySelector('form#preview'),
  pathSelect = previewForm.querySelector('select[name="path"]'),
  rendererSelect = previewForm.querySelector('select[name="renderer"]'),
  attributesSelect = previewForm.querySelector('select[name="attributes"]'),
  mouseoutSelect = previewForm.querySelector('select[name="mouseout"]'),

  loremIpsum = [...document.getElementsByClassName('lorem-ipsum')],
  /**
   * @type {import('../src/elements/DotLottiePlayer').default[]}
   */
  dotLotties = [...document.getElementsByClassName('preview')],
  fallbackSVG = 'assets/am.lottie',
  regex = /\.(?:lottie|json)$/

previewForm?.addEventListener('submit', viewFile)
pathSelect?.addEventListener('change', viewFile)
rendererSelect?.addEventListener('change', changeRenderer)
attributesSelect?.addEventListener('change', setAttributes)
mouseoutSelect?.addEventListener('change', setMouseout)

const { length } = files.sort()

for (let i = 0; i < length; i++) {
  const opt = document.createElement('option')

  opt.innerText = files[i]
  opt.value = `/assets/${files[i].trim()}`
  pathSelect.appendChild(opt)
}

function handleRefresh() {
  try {
    const selection = localStorage.getItem('selection'),
      renderer = localStorage.getItem('renderer'),
      attributes = localStorage.getItem('attributes'),
      mouseout = localStorage.getItem('mouseout')

    if (selection || renderer || attributes || mouseout) {
      if (selection) {
        pathSelect.value = selection
        viewFile(selection)
      }

      if (renderer) {
        rendererSelect.value = renderer
        changeRenderer(renderer)
      }

      if (attributes) {
        attributesSelect.value = attributes
        setAttributes(attributes)
      }

      if (mouseout) {
        mouseoutSelect.value = mouseout
        setMouseout(mouseout)
      }

      return
    }

    if (previewForm?.path?.value) {
      const { value } = previewForm.path,
        path = value.includes('/')
          ? value
          : `assets/${value}${regex.test(value) ? '' : '.json'}`

      viewFile(path)

      return
    }

    const { search } = window.location

    if (!search) {
      viewFile(fallbackSVG)

      return
    }
    const searchParams = new URLSearchParams(search)

    if (searchParams.has('path') && previewForm.path) {
      previewForm.path.value = searchParams.get('path')

      const path = searchParams.get('path'),
        query = path.includes('/')
          ? path
          : `sandbox/svg-original/${path}${path.endsWith('.svg') ? '' : '.svg'}`

      viewFile(query)
    }
  } catch (error) {
    console.error(error)
  }
}

function setMouseout(e) {
  let action

  if (e instanceof Event) {
    action = e.target.value
  } else {
    action = e
  }

  dotLotties[0].mouseout = action

  localStorage.setItem('mouseout', action)
}

function setAttributes(e) {
  let attributes

  if (e instanceof Event) {
    attributes = e.target.value
  } else {
    attributes = e
  }

  dotLotties[0].autoplay = attributes === 'autoplay'
  dotLotties[0].animateOnScroll = attributes === 'animateOnScroll'
  dotLotties[0].hover = attributes === 'hover'
  dotLotties[0].playOnClick = attributes === 'playOnClick'
  dotLotties[0].playOnVisible = attributes === 'playOnVisible'
  mouseoutSelect.parentElement.hidden = attributes !== 'hover'
  loremIpsum.forEach(element => {
    element.hidden =
      attributes !== 'animateOnScroll' &&
      attributes !== 'autoplay' &&
      attributes !== 'playOnVisible'
  })

  localStorage.setItem('attributes', attributes)
}

async function changeRenderer(e) {
  let renderer

  if (e instanceof Event) {
    renderer = e.target.value
  } else {
    renderer = e
  }

  if (dotLotties[0].renderer === renderer) {
    return
  }

  dotLotties.forEach(element => {
    element.renderer = renderer
  })
  localStorage.setItem('renderer', renderer)

  const selection = localStorage.getItem('selection'),
    attributes = localStorage.getItem('attributes')

  if (selection) {
    if (
      attributes === 'animateOnScroll' ||
      attributes === 'autoplay' ||
      attributes === 'playOnVisible'
    ) {

      dotLotties.forEach( async (el) => {
        await el.load(selection)
      })

      return
    }
    await dotLotties[0].load(selection)
  }
}

/**
 * View converted SVG.
 *
 * @param e - Either the submit event, the change event or the string value.
 */
async function viewFile(e) {
  try {
    let path

    if (e instanceof SubmitEvent) {
      e.preventDefault()
      const { value } = e.target.path

      path = value.includes('/')
        ? value
        : `assets/${value}${regex.test(value) ? '' : '.json'}`
    } else if (e instanceof Event) {
      path = e.target.value
      localStorage.setItem('selection', path)
    } else {
      path = e
    }

    if (!dotLotties[0] || !path || !path === '') {
      throw new Error('No placeholder')
    }

    const attributes = localStorage.getItem('attributes')

    if (
      attributes === 'animateOnScroll' ||
      attributes === 'autoplay' ||
      attributes === 'playOnVisible'
    ) {
      dotLotties.forEach(async el => {
        await el.load(path)

        // eslint-disable-next-line require-atomic-updates
        el.animateOnScroll = attributes === 'animateOnScroll'
        // eslint-disable-next-line require-atomic-updates
        el.autoplay = attributes === 'autoplay'
        // eslint-disable-next-line require-atomic-updates
        el.playOnVisible = attributes === 'playOnVisible'

      })
    } else {
      await dotLotties[0].load(path)
    }

    // dotLottie.addEventListener('complete', () => console.debug('complete'))
  } catch (error) {
    console.error(error)
  }
}

async function preview(full = true) {
  if (full) {
    await import('../dist/full.js')
  } else {
    await import('../dist/light.js')
  }

  handleRefresh()
}

await preview()