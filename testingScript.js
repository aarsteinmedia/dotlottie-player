import files from './files.js'

const previewForm = document.querySelector('form#preview'),
  pathSelect = previewForm.querySelector('select[name="path"]'),
  rendererSelect = previewForm.querySelector('select[name="renderer"]'),
  /**
   * @type {import('./src/elements/DotLottiePlayer').default}
   */
  dotLottie = document.querySelector('.preview'),
  fallbackSVG = 'assets/am.lottie',
  regex = /\.(?:lottie|json)$/

previewForm?.addEventListener('submit', viewFile)
pathSelect?.addEventListener('change', viewFile)
rendererSelect?.addEventListener('change', changeRenderer)

const { length } = files.sort()

for (let i = 0; i < length; i++) {
  const opt = document.createElement('option')

  opt.innerText = files[i]
  opt.value = `/assets/${files[i].trim()}`
  pathSelect.appendChild(opt)
}

handleRefresh()

function handleRefresh() {
  try {
    const selection = localStorage.getItem('selection')

    if (selection) {
      pathSelect.value = selection
      viewFile(selection)

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

function changeRenderer(e) {
  const { value: renderer } = e.target

  dotLottie.renderer = renderer
  handleRefresh()
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

    if (!dotLottie || !path || !path === '') {
      throw new Error('No placeholder')
    }

    await dotLottie.load(path)

    // dotLottie.addEventListener('complete', () => console.debug('complete'))
  } catch (error) {
    console.error(error)
  }
}
