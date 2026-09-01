import { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'

/**
 * Render Player.
 */
export async function renderPlayer(this: DotLottiePlayerBase) {

  if (!this.shadow || !this.template) {
    throw new Error('No Shadow Element or Template')
  }

  let langAttribute = ''

  /**
   * If player has aria-description, it's safe to assume
   * language should be the same as `document.documentElement.lang`.
   * Accessible labels on controls are only in English, so with no
   * aria tag, and controls enabled, lang should reflect this.
   * With neither controls or description, the lang attribute is
   * not needed.
   */
  if (this.description || this.controls) {
    const lang = this.description ? document.documentElement.lang : 'en'

    langAttribute = `lang="${lang}"`
  }

  this.template.innerHTML = /* HTML */ `
    <div
      class="animation-container main"
      data-controls="${this.controls ?? false}"
      ${langAttribute}
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
