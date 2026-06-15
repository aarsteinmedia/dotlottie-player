import DotLottiePlayerBase from '@/elements/DotLottiePlayerBase'

/**
 * Render Player.
 */
export default async function renderPlayer(this: DotLottiePlayerBase) {

  if (!this.shadow || !this.template) {
    throw new Error('No Shadow Element or Template')
  }

  this.template.innerHTML = /* HTML */ `
    <div
      class="animation-container main"
      data-controls="${this.controls ?? false}"
      lang="${this.description ? document.documentElement.lang : 'en'}"
      data-loaded="${this._playerState.loaded}"
    >
      <figure
        class="animation"
        style="background:${this.background}"
        ${this.description ?
          /* HTML */ `
            aria-label="${this.description}"
          `
            :
            ''
        }
      >
      </figure>
      <slot name="controls"></slot>
    </div>
  `

  this.shadow.adoptedStyleSheets = [await DotLottiePlayerBase.styles()]
  this.shadow.appendChild(this.template.content.cloneNode(true))
}
