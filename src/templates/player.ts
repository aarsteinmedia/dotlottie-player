import type { DotLottiePlayerBase } from '@/elements/DotLottiePlayerBase'

/**
 * Render Player.
 */
export function renderPlayer(this: DotLottiePlayerBase) {

  if (!this.shadow || !this.template) {
    throw new Error('No Shadow Element or Template')
  }

  this.template.innerHTML = /* HTML */ `
    <div class="animation-container main">
      <figure class="animation"></figure>
      <slot name="controls"></slot>
    </div>
  `

  const fragment = this.template.content.cloneNode(true) as DocumentFragment,
    container = fragment.querySelector('.animation-container'),
    figure = fragment.querySelector('figure')

  if (!(container instanceof HTMLDivElement) || !figure) {
    throw new Error('Template is broken')
  }

  container.dataset.controls = String(this.controls)
  figure.style.background = this.background

  /**
   * If player has aria-description, it's safe to assume
   * language should be the same as `document.documentElement.lang`.
   * Accessible labels on controls are only in English, so with no
   * aria tag, and controls enabled, lang should reflect this.
   * With neither controls or description, the lang attribute is
   * not needed.
   */
  if (this.description || this.controls) {
    container.lang = this.description ? document.documentElement.lang : 'en'
  }

  if (this.description) {
    figure.setAttribute('aria-label', this.description)
  }

  this.shadow.replaceChildren(fragment)
}
