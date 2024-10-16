import { PlayerState, PlayMode } from '@/enums'
import type { DotLottiePlayer } from '@/elements/DotLottiePlayer'

/**
 * Render Controls
 */
export default function renderControls(this: DotLottiePlayer) {
  if (!this.controls) {
    return
  }

  const slot = this.shadow.querySelector('slot[name=controls]')
  if (!slot) {
    return
  }

  slot.innerHTML = /* HTML */ `
    <div
      class="lottie-controls toolbar ${this.playerState === PlayerState.Error
        ? 'has-error'
        : ''}"
      aria-label="Lottie Animation controls"
    >
      <button
        class="togglePlay"
        data-active="false"
        tabindex="0"
        aria-label="Toggle Play/Pause"
      >
        <svg width="24" height="24" aria-hidden="true" focusable="false">
          <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
        </svg>
      </button>

      <button class="stop" data-active="true" tabindex="0" aria-label="Stop">
        <svg width="24" height="24" aria-hidden="true" focusable="false">
          <path d="M6 6h12v12H6V6z" />
        </svg>
      </button>
      <button class="prev" tabindex="0" aria-label="Previous animation" hidden>
        <svg width="24" height="24" aria-hidden="true" focusable="false">
          <path d="M17.9 18.2 8.1 12l9.8-6.2v12.4zm-10.3 0H6.1V5.8h1.5v12.4z" />
        </svg>
      </button>
      <button class="next" tabindex="0" aria-label="Next animation" hidden>
        <svg width="24" height="24" aria-hidden="true" focusable="false">
          <path d="m6.1 5.8 9.8 6.2-9.8 6.2V5.8zM16.4 5.8h1.5v12.4h-1.5z" />
        </svg>
      </button>
      <form class="progress-container${this.simple ? ' simple' : ''}">
        <input
          class="seeker"
          type="range"
          min="0"
          max="100"
          step="1"
          value="${this._seeker.toString()}"
          aria-valuemin="0"
          aria-valuemax="100"
          role="slider"
          aria-valuenow="${this._seeker.toString()}"
          tabindex="0"
          aria-label="Slider for search"
        />
        <progress max="100" value="${this._seeker}"></progress>
      </form>
      ${this.simple
        ? ''
        : /* HTML */ ` <button
              class="toggleLoop"
              data-active="${this.loop}"
              tabindex="0"
              aria-label="Toggle loop"
            >
              <svg width="24" height="24" aria-hidden="true" focusable="false">
                <path
                  d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z"
                />
              </svg>
            </button>
            <button
              class="toggleBoomerang"
              data-active="${this.mode === PlayMode.Bounce}"
              aria-label="Toggle boomerang"
              tabindex="0"
            >
              <svg width="24" height="24" aria-hidden="true" focusable="false">
                <path
                  d="m11.8 13.2-.3.3c-.5.5-1.1 1.1-1.7 1.5-.5.4-1 .6-1.5.8-.5.2-1.1.3-1.6.3s-1-.1-1.5-.3c-.6-.2-1-.5-1.4-1-.5-.6-.8-1.2-.9-1.9-.2-.9-.1-1.8.3-2.6.3-.7.8-1.2 1.3-1.6.3-.2.6-.4 1-.5.2-.2.5-.2.8-.3.3 0 .7-.1 1 0 .3 0 .6.1.9.2.9.3 1.7.9 2.4 1.5.4.4.8.7 1.1 1.1l.1.1.4-.4c.6-.6 1.2-1.2 1.9-1.6.5-.3 1-.6 1.5-.7.4-.1.7-.2 1-.2h.9c1 .1 1.9.5 2.6 1.4.4.5.7 1.1.8 1.8.2.9.1 1.7-.2 2.5-.4.9-1 1.5-1.8 2-.4.2-.7.4-1.1.4-.4.1-.8.1-1.2.1-.5 0-.9-.1-1.3-.3-.8-.3-1.5-.9-2.1-1.5-.4-.4-.8-.7-1.1-1.1h-.3zm-1.1-1.1c-.1-.1-.1-.1 0 0-.3-.3-.6-.6-.8-.9-.5-.5-1-.9-1.6-1.2-.4-.3-.8-.4-1.3-.4-.4 0-.8 0-1.1.2-.5.2-.9.6-1.1 1-.2.3-.3.7-.3 1.1 0 .3 0 .6.1.9.1.5.4.9.8 1.2.5.4 1.1.5 1.7.5.5 0 1-.2 1.5-.5.6-.4 1.1-.8 1.6-1.3.1-.3.3-.5.5-.6zM13 12c.5.5 1 1 1.5 1.4.5.5 1.1.9 1.9 1 .4.1.8 0 1.2-.1.3-.1.6-.3.9-.5.4-.4.7-.9.8-1.4.1-.5 0-.9-.1-1.4-.3-.8-.8-1.2-1.7-1.4-.4-.1-.8-.1-1.2 0-.5.1-1 .4-1.4.7-.5.4-1 .8-1.4 1.2-.2.2-.4.3-.5.5z"
                />
              </svg>
            </button>
            <button
              class="toggleSettings"
              aria-label="Settings"
              aria-haspopup="true"
              aria-expanded="${!!this._isSettingsOpen}"
              aria-controls="${this._identifier}-settings"
            >
              <svg width="24" height="24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="5.4" r="2.5" />
                <circle cx="12" cy="12" r="2.5" />
                <circle cx="12" cy="18.6" r="2.5" />
              </svg>
            </button>
            <div id="${this._identifier}-settings" class="popover" hidden>
              <button
                class="convert"
                aria-label="Convert JSON animation to dotLottie format"
                tabindex="0"
                hidden
              >
                <svg
                  width="24"
                  height="24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z"
                  />
                </svg>
                Convert to dotLottie
              </button>
              <button
                class="snapshot"
                aria-label="Download still image"
                tabindex="0"
              >
                <svg
                  width="24"
                  height="24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M16.8 10.8 12 15.6l-4.8-4.8h3V3.6h3.6v7.2h3zM12 15.6H3v4.8h18v-4.8h-9zm7.8 2.4h-2.4v-1.2h2.4V18z"
                  />
                </svg>
                Download still image
              </button>
            </div>`}
    </div>
  `

  const togglePlay = this.shadow.querySelector('.togglePlay')
  if (togglePlay instanceof HTMLButtonElement) {
    togglePlay.onclick = this.togglePlay
  }

  const stop = this.shadow.querySelector('.stop')
  if (stop instanceof HTMLButtonElement) {
    stop.onclick = this.stop
  }

  const prev = this.shadow.querySelector('.prev')
  if (prev instanceof HTMLButtonElement) {
    prev.onclick = this.prev
  }

  const next = this.shadow.querySelector('.next')
  if (next instanceof HTMLButtonElement) {
    next.onclick = this.next
  }

  const seeker = this.shadow.querySelector('.seeker')
  if (seeker instanceof HTMLInputElement) {
    seeker.onchange = this._handleSeekChange
    seeker.onmousedown = this._freeze
  }

  if (!this.simple) {
    const toggleLoop = this.shadow.querySelector('.toggleLoop')
    if (toggleLoop instanceof HTMLButtonElement) {
      toggleLoop.onclick = this.toggleLoop
    }

    const toggleBoomerang = this.shadow.querySelector('.toggleBoomerang')
    if (toggleBoomerang instanceof HTMLButtonElement) {
      toggleBoomerang.onclick = this.toggleBoomerang
    }

    const convert = this.shadow.querySelector('.convert')
    if (convert instanceof HTMLButtonElement) {
      convert.onclick = this.convert as unknown as () => void
    }

    const snapshot = this.shadow.querySelector('.snapshot')
    if (snapshot instanceof HTMLButtonElement) {
      snapshot.onclick = this.snapshot
    }

    const toggleSettings = this.shadow.querySelector('.toggleSettings')
    if (toggleSettings instanceof HTMLButtonElement) {
      toggleSettings.onclick = this._handleSettingsClick
      toggleSettings.onblur = this._handleBlur
    }
  }
}
