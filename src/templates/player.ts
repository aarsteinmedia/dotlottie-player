import { PlayerState } from '@/enums'
import { DotLottiePlayer } from '@/elements/DotLottiePlayer'

/**
 * Render Player
 */
export default function renderPlayer(this: DotLottiePlayer) {
  this.template.innerHTML = /* HTML */ `
    <figure
      class="animation-container main"
      data-controls="${this.controls ?? false}"
      lang="${this.description ? document?.documentElement?.lang : 'en'}"
      role="img"
      aria-label="${this.description ?? 'Lottie animation'}"
      data-loaded="${this._playerState.loaded}"
    >
      <div class="animation" style="background:${this.background}">
        ${this.playerState === PlayerState.Error
          ? /* HTML */ ` <div class="error">
              <svg
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                xml:space="preserve"
                width="1920"
                height="1080"
                viewBox="0 0 1920 1080"
              >
                <path fill="#fff" d="M0 0h1920v1080H0z" />
                <path
                  fill="#3a6d8b"
                  d="M1190.2 531 1007 212.4c-22-38.2-77.2-38-98.8.5L729.5 531.3c-21.3 37.9 6.1 84.6 49.5 84.6l361.9.3c43.7 0 71.1-47.3 49.3-85.2zM937.3 288.7c.2-7.5 3.3-23.9 23.2-23.9 16.3 0 23 16.1 23 23.5 0 55.3-10.7 197.2-12.2 214.5-.1 1-.9 1.7-1.9 1.7h-18.3c-1 0-1.8-.7-1.9-1.7-1.4-17.5-13.4-162.9-11.9-214.1zm24.2 283.8c-13.1 0-23.7-10.6-23.7-23.7s10.6-23.7 23.7-23.7 23.7 10.6 23.7 23.7-10.6 23.7-23.7 23.7zM722.1 644h112.6v34.4h-70.4V698h58.8v31.7h-58.8v22.6h72.4v36.2H722.1V644zm162 57.1h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5h36.4v15.6zm78.9 0h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5H963v15.6zm39.5 36.2c0-31.3 22.2-54.8 56.6-54.8 34.4 0 56.2 23.5 56.2 54.8s-21.8 54.6-56.2 54.6c-34.4-.1-56.6-23.3-56.6-54.6zm74 0c0-17.4-6.1-29.1-17.8-29.1-11.7 0-17.4 11.7-17.4 29.1 0 17.4 5.7 29.1 17.4 29.1s17.8-11.8 17.8-29.1zm83.1-36.2h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5h36.4v15.6z"
                />
                <path fill="none" d="M718.9 807.7h645v285.4h-645z" />
                <text
                  fill="#3a6d8b"
                  style="text-align:center;position:absolute;left:100%;font-size:47px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'.SFNSText-Regular',sans-serif;"
                  x="50%"
                  y="848.017"
                  text-anchor="middle"
                >
                  ${this._errorMessage}
                </text>
              </svg>
            </div>`
          : ''}
      </div>
      <slot name="controls"></slot>
    </figure>
  `

  this.shadow.adoptedStyleSheets = [DotLottiePlayer.styles]
  this.shadow.appendChild(this.template.content.cloneNode(true))
}
