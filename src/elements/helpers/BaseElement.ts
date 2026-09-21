import type {
  AnimationData, AnimationDirection, AnimationItem, HTMLBooleanAttribute
} from '@aarsteinmedia/lottie-web'

import {
  createElementID, PlayMode, PreserveAspectRatio
} from '@aarsteinmedia/lottie-web/utils'

import { RendererType } from '@/elements/DotLottiePlayerBase'
import { PropertyCallbackElement } from '@/elements/helpers/PropertyCallbackElement'
import styles from '@/styles.css'
import { isEnum, parseHTMLBooleans } from '@/utils'
import { isDev } from '@/utils/constants'
import {
  MouseOut, ObjectFit, PlayerState
} from '@/utils/enums'

const getStyles = async () => {
    const styleSheet = new CSSStyleSheet()

    await styleSheet.replace(styles)

    return styleSheet
  },
  notImplemented = 'Method is not implemented'

export abstract class BaseElement extends PropertyCallbackElement {
  /**
   * Return the styles for the component.
   */
  static get styles() {
    return getStyles
  }

  /**
   * Player state.
   */
  public playerState: PlayerState = PlayerState.Loading

  /**
   * Whether to trigger next frame with scroll.
   */
  set animateOnScroll(value: HTMLBooleanAttribute) {
    this.setAttribute('animateOnScroll', Boolean(value).toString())
  }

  get animateOnScroll() {
    const val = this.getAttribute('animateOnScroll')

    return parseHTMLBooleans(val)
  }

  public get animations() {
    return this._animations
  }

  /**
   * Autoplay.
   */
  set autoplay(value: HTMLBooleanAttribute) {
    this.setAttribute('autoplay', Boolean(value).toString())
  }

  get autoplay() {
    const val = this.getAttribute('autoplay')

    return parseHTMLBooleans(val)
  }

  /**
   * Background color.
   */
  set background(value: string) {
    this.setAttribute('background', value)
  }

  get background() {
    return this.getAttribute('background') || 'transparent'
  }

  /**
   * Show controls.
   */
  set controls(value: HTMLBooleanAttribute) {
    this.setAttribute('controls', Boolean(value).toString())
  }

  get controls() {
    const val = this.getAttribute('controls')

    return parseHTMLBooleans(val)
  }

  /**
   * Number of times to loop.
   */
  set count(value: number) {
    this.setAttribute('count', value.toString())
  }

  get count() {
    const val = this.getAttribute('count')

    if (val) {
      return Number(val)
    }

    return 0
  }

  public get currentAnimation() {
    return this._currentAnimation
  }

  /**
   * Delay playback on playOnVisible.
   */
  set delay(value: number) {
    this.setAttribute('delay', value.toString())
  }

  get delay() {
    const val = this.getAttribute('delay')

    if (val) {
      return Number(val)
    }

    return 0
  }

  /**
   * Description for screen readers.
   */
  set description(value: string | null) {
    if (value) {
      this.setAttribute('description', value)
    }
  }

  get description() {
    return this.getAttribute('description')
  }

  /**
   * Direction of animation.
   */
  set direction(value: AnimationDirection) {
    this.setAttribute('direction', value.toString())
  }

  get direction() {
    const val = Number(this.getAttribute('direction'))

    if (val === -1) {
      return val
    }

    return 1
  }

  /**
   * Whether to freeze animation when window loses focus.
   */
  set dontFreezeOnBlur(value: HTMLBooleanAttribute) {
    this.setAttribute('dontFreezeOnBlur', Boolean(value).toString())
  }

  get dontFreezeOnBlur() {
    const val = this.getAttribute('dontFreezeOnBlur')

    return parseHTMLBooleans(val)
  }

  /**
   * Whether to play on mouseover.
   */
  set hover(value: HTMLBooleanAttribute) {
    this.setAttribute('hover', Boolean(value).toString())
  }

  get hover() {
    const val = this.getAttribute('hover')

    return parseHTMLBooleans(val)
  }

  /**
   * Pause between loop iterations, in milliseconds.
   */
  set intermission(value: number) {
    this.setAttribute('intermission', value.toString())
  }

  get intermission() {
    const val = Number(this.getAttribute('intermission'))

    if (!isNaN(val)) {
      return val
    }

    return 0
  }

  /**
   * Loop animation.
   */
  set loop(value: HTMLBooleanAttribute) {
    this.setAttribute('loop', Boolean(value).toString())
  }

  get loop() {
    const val = this.getAttribute('loop')

    return parseHTMLBooleans(val)
  }

  /**
   * Play mode.
   */
  set mode(value: PlayMode) {
    this.setAttribute('mode', value)
  }

  get mode() {
    const val = this.getAttribute('mode')

    if (val === PlayMode.Bounce) {
      return val
    }

    return PlayMode.Normal
  }

  /**
   * Action on mouseout.
   */
  set mouseout(value: MouseOut) {
    this.setAttribute('mouseout', value)
  }

  get mouseout() {
    const val = this.getAttribute('mouseout')

    switch (val) {
      case MouseOut.Void:
      case MouseOut.Pause:
      case MouseOut.Reverse: {
        return val
      }
      default: {
        return MouseOut.Stop
      }
    }
  }

  /**
   * Resizing to container.
   */
  set objectfit(value: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down') {
    this.setAttribute('objectfit', value)
  }

  get objectfit() {
    const val = this.getAttribute('objectfit')

    if (isEnum(val, ObjectFit)) {
      return val
    }

    return ObjectFit.Contain
  }

  /**
   * Whether to play once or reset,
   * if playOnVisible is true.
   */
  set once(value: HTMLBooleanAttribute) {
    this.setAttribute('once', Boolean(value).toString())
  }

  get once() {
    const val = this.getAttribute('once')

    return parseHTMLBooleans(val)
  }

  /**
   * Whether to toggle play on click.
   */
  set playOnClick(value: HTMLBooleanAttribute) {
    this.setAttribute('playOnClick', Boolean(value).toString())
  }

  get playOnClick() {
    const val = this.getAttribute('playOnClick')

    return parseHTMLBooleans(val)
  }

  /**
   * Play when visible.
   */
  set playOnVisible(value: HTMLBooleanAttribute) {
    this.setAttribute('playOnVisible', Boolean(value).toString())
  }

  get playOnVisible() {
    const val = this.getAttribute('playOnVisible')

    return parseHTMLBooleans(val)
  }

  /**
   * Resizing to container (Deprecated).
   */
  set preserveAspectRatio(value: PreserveAspectRatio | null) {
    this.setAttribute('preserveAspectRatio',
      value || PreserveAspectRatio.Contain)
  }

  get preserveAspectRatio() {
    const val = this.getAttribute('preserveAspectRatio')

    if (isEnum(val, PreserveAspectRatio)) {
      return val
    }

    return null
  }

  /**
   * Whether to display error screen on load error.
   */
  set quiet(value: HTMLBooleanAttribute) {
    this.setAttribute('quiet', Boolean(value).toString())
  }

  get quiet() {
    const val = this.getAttribute('quiet')

    return parseHTMLBooleans(val)
  }

  /**
   * Renderer to use: svg, canvas or html.
   */
  set renderer(value: RendererType) {
    this.setAttribute('renderer', value)
  }

  get renderer() {
    const val = this.getAttribute('renderer')

    if (val === RendererType.Canvas || val === RendererType.HTML) {
      return val
    }

    return RendererType.SVG
  }

  /**
   * Play on clicked element by id attribute, other than animation.
   */
  set selector(value: string | null) {
    if (value) {
      this.setAttribute('selector', value)

      return
    }
    this.removeAttribute('selector')
  }

  get selector() {
    return this.getAttribute('selector')
  }

  /**
   * Hide advanced controls.
   */
  set simple(value: HTMLBooleanAttribute) {
    this.setAttribute('simple', Boolean(value).toString())
  }

  get simple() {
    const val = this.getAttribute('simple')

    return parseHTMLBooleans(val)
  }

  /**
   * Speed.
   */
  set speed(value: number) {
    this.setAttribute('speed', value.toString())
  }

  get speed() {
    const val = this.getAttribute('speed')

    if (val !== null && !isNaN(Number(val))) {
      return Number(val)
    }

    return 1
  }

  /**
   * Source, either path or JSON string.
   */
  set src(value: string | null) {
    this.setAttribute('src', value || '')
  }

  get src() {
    return this.getAttribute('src')
  }

  /**
   * Subframe.
   */
  set subframe(value: HTMLBooleanAttribute) {
    this.setAttribute('subframe', Boolean(value).toString())
  }

  get subframe() {
    const val = this.getAttribute('subframe')

    return parseHTMLBooleans(val)
  }

  /**
   * This is included in watched properties,
   * so that next-button will show up
   * on load, if controls are visible.
   */
  protected _animations: AnimationData[] = []

  /**
   * Animation Container.
   */
  protected _container: HTMLElement | null = null

  /**
   * Which animation to show, if several.
   */
  protected _currentAnimation = 0

  protected _errorMessage = 'Something went wrong'

  protected _identifier = this.id || createElementID()

  protected _lottieInstance: AnimationItem | null = null

  protected _playerState: {
    prev: PlayerState
    count: number
    loaded: boolean
    scrollLoopId?: number | undefined
    frame: number
    playTimeout: ReturnType<typeof setTimeout> | null
  } = {
    count: 0,
    frame: 0,
    loaded: false,
    playTimeout: null,
    prev: PlayerState.Loading,
  }

  private _toLog: unknown = null

  public clearDevLog() {
    this._toLog = null
  }

  public devLog(toLog: unknown, type: 'error' | 'info' | 'warn' = 'error') {
    if (!isDev) {
      return
    }

    if (this._toLog !== null) {
      return
    }

    this._toLog = toLog

    switch (type) {
      case 'info': {
        console.info(this._toLog)
        break
      }
      case 'warn': {
        console.warn(this._toLog)
        break
      }

      default: {
        console.error(this._toLog)
      }
    }
  }

  public play() {
    throw new Error(notImplemented)
  }

  protected _freeze() {
    throw new Error(notImplemented)
  }
}