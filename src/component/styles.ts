import { css } from 'lit'

export default css`
  * {
    box-sizing: border-box;
  }

  :host {
    --lottie-player-toolbar-height: 35px;
    --lottie-player-toolbar-background-color: #FFF;
    --lottie-player-toolbar-icon-color: #000;
    --lottie-player-toolbar-icon-hover-color: #000;
    --lottie-player-toolbar-icon-active-color: #4285f4;
    --lottie-player-seeker-track-color: rgba(0, 0, 0, 0.2);
    --lottie-player-seeker-thumb-color: #4285f4;
    --lottie-player-seeker-display: block;

    display: block;
    width: 100%;
    height: 100%;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --lottie-player-toolbar-background-color: #000;
      --lottie-player-toolbar-icon-color: #FFF;
      --lottie-player-toolbar-icon-hover-color: #FFF;
      --lottie-player-seeker-track-color: rgba(255, 255, 255, 0.6);
    }
  }

  .main {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .animation {
    width: 100%;
    height: 100%;
    display: flex;
  }

  [data-controls="true"] .animation {
    height: calc(100% - 35px);
  }

  .animation-container {
    position: relative;
  }

  .popover {
    position: absolute;
    right: 5px;
    bottom: 40px;
    background-color: var(--lottie-player-toolbar-background-color);
    border-radius: 5px;
    padding: 10px 15px;
    border: solid 2px var(--lottie-player-toolbar-icon-color);
    animation: fadeIn .2s ease-in-out;
  }
  .popover::before {
    content: "";
    right: 10px;
    border: 7px solid transparent;
    border-top-color: transparent;
    margin-right: -7px;
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    top: 100%;
    border-top-color: var(--lottie-player-toolbar-icon-color);
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-items: center;
    background: var(--lottie-player-toolbar-background-color);
    margin: 0;
    height: 35px;
    padding: 5px;
    border-radius: 5px;
    gap: 5px;
  }

  .toolbar.has-error {
    pointer-events: none;
    opacity: .5;
  }

  .toolbar button {
    cursor: pointer;
    fill: var(--lottie-player-toolbar-icon-color);
    color: var(--lottie-player-toolbar-icon-color);
    display: flex;
    background: none;
    border: 0;
    padding: 0;
    outline: 0;
    height: 100%;
    margin: 0;
    align-items: center;
    gap: 5px;
    opacity: .9;
  }

  .toolbar button:hover {
    opacity: 1;
  }

  .toolbar button[data-active="true"] {
    opacity: 1;
    fill: var(--lottie-player-toolbar-icon-active-color);
  }

  .toolbar button:disabled {
    opacity: .5;
  }

  .toolbar button:focus {
    outline: 0;
  }

  .toolbar button svg {
    pointer-events: none;
  }

  .toolbar button svg > * {
    fill: inherit
  }

  .toolbar button.disabled svg {
    display: none;
  }

  .progress-container {
    position: relative;
    width: 100%;
  }

  .seeker, .seeker::-webkit-slider-runnable-track, .seeker::-webkit-slider-thumb, progress {
    -webkit-appearance: none;
    appearance: none;
    outline: none;
  }

  .seeker {
    width: 100%;
    height: 20px;
    border-radius: 3px;
    border: 0;
    cursor: pointer;
    background-color: transparent;
    /* background-color: var(--lottie-player-seeker-track-color); */
    display: var(--lottie-player-seeker-display);
    color: var(--lottie-player-seeker-thumb-color);
    margin: 0;
    padding: 7.5px 0;
    position: relative;
    z-index: 1;
  }
  progress {
    position: absolute;
    width: 100%;
    height: 5px;
    border-radius: 3px;
    border: 0;
    top: 0;
    left: 0;
    margin: 7.5px 0;
    background-color: var(--lottie-player-seeker-track-color);
    pointer-events: none;
  }
  ::-moz-progress-bar {
    background-color: var(--lottie-player-seeker-thumb-color);
  }
  ::-webkit-progress-inner-element {
    border-radius: 3px;
    overflow: hidden;
  }
  ::-webkit-slider-runnable-track {
    background-color: transparent;
  }
  ::-webkit-progress-value {
    background-color: var(--lottie-player-seeker-thumb-color);
  }
  .seeker::-webkit-slider-thumb {
    height: 15px;
    width: 15px;
    border-radius: 50%;
    border: 0;
    background-color: var(--lottie-player-seeker-thumb-color);
    cursor: pointer;
    transition: transform .2s ease-in-out;
    transform: scale(0);
  }
  .seeker:hover::-webkit-slider-thumb, .seeker:focus::-webkit-slider-thumb {
    transform: scale(1);
  }
  .seeker::-moz-range-progress {
    background-color: var(--lottie-player-seeker-thumb-color);
    height: 5px;
    border-radius: 3px;
  }
  .seeker::-moz-range-thumb {
    height: 15px;
    width: 15px;
    border-radius: 50%;
    background-color: var(--lottie-player-seeker-thumb-color);
    border: 0;
    cursor: pointer;
    transition: transform .2s ease-in-out;
    transform: scale(0);
  }
  .seeker:hover::-moz-range-thumb, .seeker:focus::-moz-range-thumb {
    transform: scale(1);
  }
  .seeker::-ms-track {
    width: 100%;
    height: 5px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  .seeker::-ms-fill-upper {
    background: var(--lottie-player-seeker-track-color);
    border-radius: 3px;
  }
  .seeker::-ms-fill-lower {
    background-color: var(--lottie-player-seeker-thumb-color);
    border-radius: 3px;
  }
  .seeker::-ms-thumb {
    border: 0;
    height: 15px;
    width: 15px;
    border-radius: 50%;
    background: var(--lottie-player-seeker-thumb-color);
    cursor: pointer;
    transition: transform .2s ease-in-out;
    transform: scale(0);
  }
  .seeker:hover::-ms-thumb, .seeker:focus::-ms-thumb {
    transform: scale(1);
  }
  .seeker:focus::-ms-fill-lower {
    background: var(--lottie-player-seeker-track-color);
  }
  .seeker:focus::-ms-fill-upper {
    background: var(--lottie-player-seeker-track-color);
  }

  .error {
    display: flex;
    margin: auto;
    justify-content: center;
    height: 100%;
    align-items: center;
  }

  .error svg {
    width: 100%;
    height: auto;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
`
