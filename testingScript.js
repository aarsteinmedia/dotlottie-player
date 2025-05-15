import files from './files.js'

const previewForm = document.querySelector('form#preview'),
  pathSelect = previewForm.querySelector('select'),
  fallbackSVG = 'assets/am.lottie',
  regex = /\.(?:lottie|json)$/

previewForm?.addEventListener('submit', viewFile)
pathSelect?.addEventListener('change', viewFile)

const { length } = files.sort()

for (let i = 0; i < length; i++) {
  const opt = document.createElement('option')

  opt.innerText = files[i]
  opt.value = `/assets/${files[i].split(' ')[0]}`
  pathSelect.appendChild(opt)
}

handleRefresh()

function handleRefresh() {
  const selection = localStorage.getItem('selection')

  if (selection) {
    pathSelect.value = selection
    viewFile(selection)

    return
  }
  if (previewForm?.path?.value) {
    const { value } = previewForm.path

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
}

/**
 * View converted SVG.
 */
async function viewFile(e) {
  let path

  if (e instanceof SubmitEvent) {
    e.preventDefault()
    const { value } = e.target.path

    path = value.includes('/')
      ? value
      : `assets/${value}${regex.test(value) ? '' : '.json'}`
  } else if (e instanceof Event) {
    path = e.target.value
    localStorage.setItem('selection', e.target.value)
  } else {
    path = e
  }
  const dotLottie = document.querySelector('.preview')

  try {
    if (!dotLottie) {
      throw new Error('No placeholder')
    }

    // const res = await fetch(path)

    // if (!res.ok) {
    //   throw new Error('Could not find file')
    // }

    dotLottie.load(path)

    // const { height, width } = svg.viewBox.baseVal

    // if (width - 150 > height) {
    //   container.style.flexDirection = 'column'
    // } else {
    //   container.style.flexDirection = 'row'
    // }
  } catch (error) {
    console.error(error)
  }
}
