import type {
  AddAnimationParams,
  AnimationConfiguration,
  AnimationData,
  AnimationDirection,
  AnimationItem,
  AnimationSettings,
  ConvertParams,
  HTMLBooleanAttribute,
  LottieManifest,
  Result,
  Vector2,
} from '@aarsteinmedia/lottie-web'

import { getAnimationData } from '@aarsteinmedia/lottie-web/dotlottie'
import {
  createElementID,
  download,
  getFilename,
  isServer,
  RendererType,
  PlayerEvents,
  PlayMode,
  PreserveAspectRatio,
  clamp
} from '@aarsteinmedia/lottie-web/utils'

import type { Settings } from '@/types'

import PropertyCallbackElement from '@/elements/helpers/PropertyCallbackElement'
import styles from '@/styles.css'
import renderControls from '@/templates/controls'
import pauseIcon from '@/templates/icons/pauseIcon'
import playIcon from '@/templates/icons/playIcon'
import renderPlayer from '@/templates/player'
import {
  aspectRatio,
  frameOutput,
  handleErrors,
  isLottie,
  isTouch
} from '@/utils'
import {
  MouseOut,
  ObjectFit,
  PlayerState,
} from '@/utils/enums'

const notImplemented = 'Method is not implemented'

/**
 * DotLottie Player Web Component.
 */
export default abstract class DotLottiePlayerBase extends PropertyCallbackElement {

  /**
   * Attributes to observe.
   */
  static get observedAttributes() {
    return [
      'animateOnScroll',
      'autoplay',
      'controls',
      'direction',
      'hover',
      'loop',
      // 'mouseout',
      'mode',
      'playOnClick',
      'playOnVisible',
      'selector',
      'speed',
      'src',
      'subframe',
    ] as const
  }

  static get observedProperties() {
    return [
      'playerState',
      '_isSettingsOpen',
      '_seeker',
      '_currentAnimation',
      '_animations',
    ]
  }

  /**
   * Return the styles for the component.
   */
  static get styles() {
    return async () => {
      const styleSheet = new CSSStyleSheet()

      await styleSheet.replace(styles)

      return styleSheet
    }
  }

  public isLight = false

  /**
   * Player state.
   */
  public playerState: PlayerState = PlayerState.Loading

  public shadow: ShadowRoot | undefined
  /**
   * Store source for later use, when player is loaded programatically.
   */
  public source?: string

  public template?: HTMLTemplateElement

  /**
   * Whether to trigger next frame with scroll.
   */
  set animateOnScroll(value: HTMLBooleanAttribute) {
    this.setAttribute('animateOnScroll', Boolean(value).toString())
  }

  get animateOnScroll() {
    const val = this.getAttribute('animateOnScroll')

    return val === 'true' || val === '' || val === '1'
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

    return val === 'true' || val === '' || val === '1'
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

    return val === 'true' || val === '' || val === '1'
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

    return val === 'true' || val === '' || val === '1'
  }

  /**
   * Whether to play on mouseover.
   */
  set hover(value: HTMLBooleanAttribute) {
    this.setAttribute('hover', Boolean(value).toString())
  }

  get hover() {
    const val = this.getAttribute('hover')

    return val === 'true' || val === '' || val === '1'
  }

  /**
   * Pause between loop intrations, in miliseconds.
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

  public get isDotLottie() {
    return this._isDotLottie
  }

  /**
   * Loop animation.
   */
  set loop(value: HTMLBooleanAttribute) {
    this.setAttribute('loop', Boolean(value).toString())
  }

  get loop() {
    const val = this.getAttribute('loop')

    return val === 'true' || val === '' || val === '1'
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

    if (val && Object.values(ObjectFit).includes(val as ObjectFit)) {
      return val as ObjectFit
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

    return val === 'true' || val === '' || val === '1'
  }

  /**
   * Whether to toggle play on click.
   */
  set playOnClick(value: HTMLBooleanAttribute) {
    this.setAttribute('playOnClick', Boolean(value).toString())
  }

  get playOnClick() {
    const val = this.getAttribute('playOnClick')

    return val === 'true' || val === '' || val === '1'
  }

  /**
   * Play when visible.
   */
  set playOnVisible(value: HTMLBooleanAttribute) {
    this.setAttribute('playOnVisible', Boolean(value).toString())
  }

  get playOnVisible() {
    const val = this.getAttribute('playOnVisible')

    return val === 'true' || val === '' || val === '1'
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

    if (
      val &&
      Object.values(PreserveAspectRatio).includes(val as PreserveAspectRatio)
    ) {
      return val as PreserveAspectRatio
    }

    return null
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

    return val === 'true' || val === '' || val === '1'
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

    return val === 'true' || val === '' || val === '1'
  }

  /**
   * Animation Container.
   */
  protected _container: HTMLElement | null = null

  protected _DOMRect: DOMRect | null = null

  protected _errorMessage = 'Something went wrong'

  protected _identifier = this.id || createElementID()

  /**
   * Whether settings toolbar is open.
   */
  protected _isSettingsOpen = false

  protected _playerState: {
    prev: PlayerState
    count: number
    loaded: boolean
    visible: boolean
    scrollY: number
    scrollTimeout: NodeJS.Timeout | null
  } = {
      count: 0,
      loaded: false,
      prev: PlayerState.Loading,
      scrollTimeout: null,
      scrollY: 0,
      visible: false,
    }

  protected _render = renderPlayer

  protected _renderControls = renderControls

  /**
   * Seeker.
   */
  protected _seeker = 0

  /**
   * This is included in watched properties,
   * so that next-button will show up
   * on load, if controls are visible.
   */
  private _animations: AnimationData[] = []
  /**
   * Which animation to show, if several.
   */
  private _currentAnimation = 0
  private _intersectionObserver?: undefined | IntersectionObserver
  private _isBounce = false
  private _isDotLottie = false

  private _lottieInstance: AnimationItem | null = null

  private _manifest?: LottieManifest
  /**
   * Multi-animation settings.
   */
  private _multiAnimationSettings: AnimationSettings[] = []

  /**
   * Segment.
   */
  private _segment?: Vector2

  constructor() {
    super()
    this._complete = this._complete.bind(this)
    this._dataFailed = this._dataFailed.bind(this)
    this._dataReady = this._dataReady.bind(this)
    this._DOMLoaded = this._DOMLoaded.bind(this)
    this._enterFrame = this._enterFrame.bind(this)
    this._freeze = this._freeze.bind(this)
    this._handleBlur = this._handleBlur.bind(this)
    this._handleClick = this._handleClick.bind(this)
    this._handleScroll = this._handleScroll.bind(this)
    this._handleSeekChange = this._handleSeekChange.bind(this)
    this._handleWindowBlur = this._handleWindowBlur.bind(this)
    this._loopComplete = this._loopComplete.bind(this)
    this._mouseEnter = this._mouseEnter.bind(this)
    this._mouseLeave = this._mouseLeave.bind(this)
    this._onVisibilityChange = this._onVisibilityChange.bind(this)
    this._switchInstance = this._switchInstance.bind(this)
    this._handleSettingsClick = this._handleSettingsClick.bind(this)

    this.togglePlay = this.togglePlay.bind(this)
    this.stop = this.stop.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
    this._renderControls = this._renderControls.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.toggleLoop = this.toggleLoop.bind(this)
    this.toggleBoomerang = this.toggleBoomerang.bind(this)

    this.destroy = this.destroy.bind(this)

    this.template = document.createElement('template')
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  public addAnimation(_params: AddAnimationParams): Promise<Result> {
    throw new Error(notImplemented)
  }

  /**
   * Runs when the value of an attribute is changed on the component.
   */
  async attributeChangedCallback(
    name: typeof DotLottiePlayerBase.observedAttributes[number],
    _oldValue: unknown,
    value: string
  ) {
    if (
      !this._lottieInstance ||
      !this.shadow ||
      !this._container
    ) {
      return
    }

    switch (name) {
      case 'animateOnScroll': {
        if (value === '' || Boolean(value)) {
          this._lottieInstance.autoplay = false
          addEventListener(
            'scroll', this._handleScroll, {
              capture: true,
              passive: true,
            }
          )

          return
        }
        removeEventListener(
          'scroll', this._handleScroll, true
        )
        break
      }

      case 'autoplay': {
        if (this.animateOnScroll || this.playOnVisible) {
          return
        }
        if (value === '' || Boolean(value)) {
          this.play()

          return
        }
        this.stop()
        break
      }

      case 'controls': {
        this._renderControls()
        break
      }

      case 'direction': {
        if (Number(value) === -1) {
          this.setDirection(-1)

          return
        }
        this.setDirection(1)
        break
      }

      case 'hover': {
        if (value === '' || Boolean(value)) {
          this._container.addEventListener('mouseenter', this._mouseEnter)
          this._container.addEventListener('mouseleave', this._mouseLeave)

          return
        }
        this._container.removeEventListener('mouseenter', this._mouseEnter)
        this._container.removeEventListener('mouseleave', this._mouseLeave)
        break
      }

      case 'loop': {
        const toggleLoop = this.shadow.querySelector('.toggleLoop')

        if (toggleLoop instanceof HTMLButtonElement) {
          toggleLoop.dataset.active = value
        }
        this.setLoop(value === '' || Boolean(value))
        break
      }

      case 'mode': {
        const toggleBoomerang = this.shadow.querySelector('.toggleBoomerang')

        if (toggleBoomerang instanceof HTMLButtonElement) {
          toggleBoomerang.dataset.active = (value as PlayMode === PlayMode.Bounce).toString()
        }
        this._isBounce = value as PlayMode === PlayMode.Bounce
        break
      }

      case 'playOnClick': {
        if (value === '' || Boolean(value)) {
          this._lottieInstance.autoplay = false
          this._container.addEventListener('click', this._handleClick)

          return
        }
        this._container.removeEventListener('click', this._handleClick)
        break
      }

      case 'playOnVisible': {
        if (value === '' || Boolean(value)) {
          this._lottieInstance.autoplay = false
        }
        break
      }

      case 'selector': {
        const selector = document.getElementById(this.selector ?? '')

        selector?.addEventListener('click', this._handleClick)
        break
      }

      case 'speed': {
        const val = Number(value)

        if (val && !isNaN(val)) {
          this.setSpeed(val)
        }

        break
      }

      case 'src': {
        await this.load(value)
        break
      }

      case 'subframe': {
        this.setSubframe(value === '' || Boolean(value))
        break
      }
    }
  }

  /**
   * Initialize everything on component first render.
   */
  override connectedCallback() {
    super.connectedCallback()
    try {
      void (async () => {
        await this._render()

        if (!this.shadow) {
          throw new Error('Missing Shadow element')
        }

        this._container = this.shadow.querySelector('.animation')

        // Setup lottie player
        await this.load(this.src)

        // Add listener for Visibility API's change event.
        if (typeof document.hidden !== 'undefined') {
          document.addEventListener('visibilitychange', this._onVisibilityChange)
        }

        if (this._container) {
          this._DOMRect = this._container.getBoundingClientRect()
        }

        // Add intersection observer for detecting component being out-of-view.
        this._addIntersectionObserver()

        this.dispatchEvent(new CustomEvent(PlayerEvents.Rendered))
      })()
    } catch (error) {
      console.error(error)
      this.dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }

  public convert(_params: ConvertParams): Promise<Result> {
    throw new Error(notImplemented)
  }

  /**
   * Destroy animation and element.
   */
  public destroy() {
    if (!this._lottieInstance?.destroy) {
      return
    }

    this.playerState = PlayerState.Destroyed

    this._lottieInstance.destroy()
    this._lottieInstance = null
    this.dispatchEvent(new CustomEvent(PlayerEvents.Destroyed))
    this.remove()

    document.removeEventListener('visibilitychange', this._onVisibilityChange)
  }

  /**
   * Cleanup on component destroy.
   */
  disconnectedCallback() {
    // Remove intersection observer for detecting component being out-of-view
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect()
      this._intersectionObserver = undefined
    }

    // Remove the attached Visibility API's change event listener
    document.removeEventListener('visibilitychange', this._onVisibilityChange)

    // Destroy the animation instance
    this.destroy()
  }

  /**
   * Returns the lottie-web instance used in the component.
   */
  public getLottie() {
    return this._lottieInstance
  }

  /**
   * Get Lottie Manifest.
   */
  public getManifest() {
    return this._manifest
  }

  /**
   * Get Multi-animation settings.
   */
  public getMultiAnimationSettings() {
    return this._multiAnimationSettings
  }

  /**
   * Get playback segment.
   */
  public getSegment() {
    return this._segment
  }

  /**
   * Initialize Lottie Web player.
   */
  public async load(src: string | null) {
    try {
      if (!this.shadowRoot || !src) {
        return
      }

      this.source = src

      // Load the resource

      const {
        animations, isDotLottie, manifest
      } = await getAnimationData(src)

      if (
        !animations ||
        animations.some((animation) => !isLottie(animation))
      ) {
        throw new Error('Broken or corrupted file')
      }

      const ldScript = this.parentElement?.querySelector('script[type="application/ld+json"]')

      if (ldScript) {
        const settings = JSON.parse(ldScript.innerHTML) as Settings

        if (settings.selector) {
          this.selector = settings.selector
        }

        if (settings.segment) {
          this.setSegment(settings.segment as Vector2)
        }

        if (settings.multiAnimationSettings) {
          this.setMultiAnimationSettings(settings.multiAnimationSettings)
        }
      }

      this._isBounce = this.mode === PlayMode.Bounce
      if (this._multiAnimationSettings.length > 0 && this._multiAnimationSettings[this._currentAnimation]?.mode) {
        this._isBounce =
          this._multiAnimationSettings[this._currentAnimation]?.mode as PlayMode ===
          PlayMode.Bounce
      }

      // Relevant for dotLotties with multiple animations
      const firstAnimation = manifest?.animations[0]

      if (firstAnimation) {
        firstAnimation.autoplay = !this.animateOnScroll && !this.playOnVisible && this.autoplay
        firstAnimation.loop = this.loop
      }

      this._isDotLottie = isDotLottie
      this._animations = animations
      this._manifest = manifest ?? {
        animations: [
          {
            autoplay: !this.animateOnScroll && !this.playOnVisible && this.autoplay,
            direction: this.direction,
            id: createElementID(),
            loop: this.loop,
            mode: this.mode,
            speed: this.speed,
          },
        ],
      }

      // Clear previous animation, if any
      this._lottieInstance?.destroy()

      this.playerState = PlayerState.Stopped
      if (
        !this.animateOnScroll &&
        // !this.playOnVisible &&
        (
          this.autoplay ||
          this._multiAnimationSettings[this._currentAnimation]?.autoplay ||
          this.playOnVisible
        )
      ) {
        this.playerState = PlayerState.Playing
      }

      // Initialize lottie player and load animation
      this._lottieInstance = this.loadAnimation({
        ...this._getOptions(),
        animationData: animations[this._currentAnimation],
      })


      this._addEventListeners()

      const speed =
      this._multiAnimationSettings[this._currentAnimation]?.speed ??
      this.speed,
        direction =
        this._multiAnimationSettings[this._currentAnimation]?.direction ??
        this.direction

      // Set initial playback speed and direction
      this._lottieInstance.setSpeed(speed)
      this._lottieInstance.setDirection(direction)
      this._lottieInstance.setSubframe(Boolean(this.subframe))

      // Start playing if autoplay is enabled
      if (
        (this.autoplay ||
          this.animateOnScroll ||
          this.playOnVisible) &&
          this.direction === -1
      ) {
        this.seek('99%')

        // if (!('IntersectionObserver' in window)) {
        //   if (!this.animateOnScroll) {
        //     this.play()
        //   }
        //   this._playerState.visible = true
        // }

        // this._addIntersectionObserver()
      }

      this._renderControls()

      if (this.autoplay || this.playOnVisible) {
        const togglePlay = this.shadow?.querySelector('.togglePlay')

        if (togglePlay) {
          togglePlay.innerHTML = pauseIcon
        }
      }
    } catch (error) {
      console.error(error)

      this._errorMessage = handleErrors(error).message

      this.playerState = PlayerState.Error

      this.dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }

  public loadAnimation(_config: AnimationConfiguration): AnimationItem {
    throw new Error(notImplemented)
  }

  /**
   * Skip to next animation.
   */
  public next() {
    this._currentAnimation++
    this._switchInstance()
  }

  /**
   * Pause.
   */
  public pause() {
    if (!this._lottieInstance) {
      return
    }
    this._playerState.prev = this.playerState

    let hasError = false

    try {
      this._lottieInstance.pause()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Pause))
    } catch(error) {
      hasError = true
      console.error(error)
    } finally {
      this.playerState = hasError ? PlayerState.Error : PlayerState.Paused
    }
  }

  /**
   * Play.
   */
  public play() {
    if (!this._lottieInstance) {
      return
    }
    this._playerState.prev = this.playerState

    let hasError = false

    try {
      this._lottieInstance.play()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Play))
    } catch(error) {
      hasError = true
      console.error(error)
    } finally {
      this.playerState = hasError ? PlayerState.Error : PlayerState.Playing
    }
  }

  /**
   * Skip to previous animation.
   */
  public prev() {
    this._currentAnimation--
    this._switchInstance(true)
  }

  /**
   * Name: string, oldValue: string, newValue: string.
   */
  override propertyChangedCallback(
    name: string, _oldValue: unknown, value: unknown
  ) {
    if (!this.shadow) {
      return
    }

    const togglePlay = this.shadow.querySelector('.togglePlay'),
      stopButton = this.shadow.querySelector('.stop'),
      prevButton = this.shadow.querySelector('.prev'),
      nextButton = this.shadow.querySelector('.next'),
      seeker = this.shadow.querySelector('.seeker'),
      progress = this.shadow.querySelector('progress'),
      popover = this.shadow.querySelector('.popover'),
      convertButton = this.shadow.querySelector('.convert'),
      snapshot = this.shadow.querySelector('.snapshot')

    if (
      !(togglePlay instanceof HTMLButtonElement) ||
      !(stopButton instanceof HTMLButtonElement) ||
      !(nextButton instanceof HTMLButtonElement) ||
      !(prevButton instanceof HTMLButtonElement) ||
      !(seeker instanceof HTMLInputElement) ||
      !(progress instanceof HTMLProgressElement)
    ) {
      return
    }

    if (name === 'playerState') {
      togglePlay.dataset.active = (
        value === PlayerState.Playing || value === PlayerState.Paused
      ).toString()
      stopButton.dataset.active = (value === PlayerState.Stopped).toString()

      if (value === PlayerState.Playing) {
        togglePlay.innerHTML = pauseIcon
      } else {
        togglePlay.innerHTML = playIcon
      }
    }

    if (name === '_seeker' && typeof value === 'number') {
      seeker.value = value.toString()
      seeker.ariaValueNow = value.toString()
      progress.value = value
    }

    if (name === '_animations' && Array.isArray(value) && this._currentAnimation + 1 < value.length) {
      nextButton.hidden = false
    }

    if (name === '_currentAnimation' && typeof value === 'number') {
      nextButton.hidden = value + 1 >= this._animations.length
      prevButton.hidden = !value
    }

    if (
      name === '_isSettingsOpen' &&
      typeof value === 'boolean' &&
      popover instanceof HTMLDivElement &&
      convertButton instanceof HTMLButtonElement &&
      snapshot instanceof HTMLButtonElement
    ) {
      popover.hidden = !value
      convertButton.hidden = this.isLight
      snapshot.hidden = this.renderer !== RendererType.SVG
    }
  }

  /**
   * Reload animation.
   */
  public async reload() {
    if (!this._lottieInstance || !this.src) {
      return
    }

    this._lottieInstance.destroy()
    await this.load(this.src)
  }

  /**
   * Seek to a given frame.
   *
   * @param value - Frame to seek to.
   */
  public seek(value: number | string) {
    if (!this._lottieInstance) {
      return
    }

    // Extract frame number from either number or percentage value
    const matches = value.toString().match(/^(\d+)(%?)$/)

    if (!matches) {
      return
    }

    // Calculate and set the frame number
    const frame = Math.round(matches[2] === '%'
      ? this._lottieInstance.totalFrames * Number(matches[1]) / 100
      : Number(matches[1]))

    // Set seeker to new frame number
    this._seeker = frame

    // Send lottie player to the new frame
    if (
      this.playerState === PlayerState.Playing ||
      this.playerState === PlayerState.Frozen &&
      this._playerState.prev === PlayerState.Playing
    ) {
      this._lottieInstance.goToAndPlay(frame, true)
      this.playerState = PlayerState.Playing

      return
    }
    this._lottieInstance.goToAndStop(frame, true)
    this._lottieInstance.pause()
  }

  /**
   * Dynamically set count for loops.
   */
  public setCount(value: number) {
    this.count = value
  }

  /**
   * Animation play direction.
   *
   * @param value - Animation direction.
   */
  public setDirection(value: AnimationDirection) {
    if (!this._lottieInstance) {
      return
    }
    this._lottieInstance.setDirection(value)
  }

  /**
   * Set loop.
   *
   */
  public setLoop(value: boolean) {
    if (!this._lottieInstance) {
      return
    }
    this._lottieInstance.setLoop(value)
  }

  /**
   * Set Multi-animation settings.
   */
  public setMultiAnimationSettings(settings: AnimationSettings[]) {
    this._multiAnimationSettings = settings
  }

  /**
   * Set playback segment.
   */
  public setSegment(segment: Vector2) {
    this._segment = segment
  }

  /**
   * Set animation playback speed.
   *
   * @param value - Playback speed.
   */
  public setSpeed(value = 1) {
    if (!this._lottieInstance) {
      return
    }
    this._lottieInstance.setSpeed(value)
  }

  /**
   * Toggles subframe, for more smooth animations.
   *
   * @param value - Whether animation uses subframe.
   */
  public setSubframe(value: boolean) {
    if (!this._lottieInstance) {
      return
    }
    this._lottieInstance.setSubframe(value)
  }

  /**
   * Snapshot and download the current frame as SVG.
   */
  public snapshot(shouldDownload = true, name = 'AM Lottie') {
    try {
      if (!this.shadowRoot) {
        throw new Error('Unknown error')
      }

      // Get SVG element and serialize markup
      const svgElement = this.shadowRoot.querySelector('.animation svg')

      if (!svgElement) {
        throw new Error('Could not retrieve animation from DOM')
      }

      const data =
        svgElement instanceof Node
          ? new XMLSerializer().serializeToString(svgElement)
          : null

      if (!data) {
        throw new Error('Could not serialize SVG element')
      }

      if (shouldDownload) {
        download(data, {
          mimeType: 'image/svg+xml',
          name: `${getFilename(this.src || name)}-${frameOutput(this._seeker)}.svg`,
        })
      }

      return data
    } catch (error) {
      console.error(error)

      return null
    }
  }

  /**
   * Stop.
   */
  public stop() {
    if (!this._lottieInstance) {
      return
    }
    this._playerState.prev = this.playerState
    this._playerState.count = 0

    try {
      this._lottieInstance.stop()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Stop))
    } finally {
      this.playerState = PlayerState.Stopped
    }
  }

  /**
   * Toggle Boomerang.
   */
  public toggleBoomerang() {
    const curr = this._multiAnimationSettings[this._currentAnimation] ?? {}

    if (curr.mode !== undefined) {
      if (curr.mode as PlayMode === PlayMode.Normal) {
        curr.mode = PlayMode.Bounce
        this._isBounce = true

        return
      }
      curr.mode = PlayMode.Normal
      this._isBounce = false

      return
    }

    if (this.mode === PlayMode.Normal) {
      this.mode = PlayMode.Bounce
      this._isBounce = true

      return
    }

    this.mode = PlayMode.Normal
    this._isBounce = false
  }

  /**
   * Toggle loop.
   */
  public toggleLoop() {
    const hasLoop = !this.loop

    this.loop = hasLoop
    this.setLoop(hasLoop)
  }

  /**
   * Toggle playing state.
   */
  public togglePlay() {
    if (!this._lottieInstance) {
      return
    }

    const {
      currentFrame, playDirection, totalFrames
    } = this._lottieInstance

    if (this.playerState === PlayerState.Playing) {
      this.pause()

      return
    }
    if (this.playerState !== PlayerState.Completed) {
      this.play()

      return
    }
    this.playerState = PlayerState.Playing
    if (this._isBounce) {
      this.setDirection((playDirection * -1) as AnimationDirection)

      this._lottieInstance.goToAndPlay(currentFrame, true)

      return
    }
    if (playDirection === -1) {
      this._lottieInstance.goToAndPlay(totalFrames, true)

      return
    }

    this._lottieInstance.goToAndPlay(0, true)
  }

  /**
   * Freeze animation.
   * This internal state pauses animation and is used to differentiate between
   * user requested pauses and component instigated pauses.
   */
  protected _freeze() {
    if (!this._lottieInstance) {
      return
    }

    this._playerState.prev = this.playerState

    try {
      this._lottieInstance.pause()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Freeze))
    } finally {
      this.playerState = PlayerState.Frozen
    }
  }

  /**
   * Handle blur.
   */
  protected _handleBlur() {
    setTimeout(() => { this._toggleSettings(false) }, 200)
  }

  /**
   * Handle click.
   */
  protected _handleClick() {
    if (!this.playOnClick && !this.selector) {
      return
    }

    this.togglePlay()
  }

  /**
   * Handles click and drag actions on the progress track.
   */
  protected _handleSeekChange({ target }: Event) {
    if (
      !(target instanceof HTMLInputElement) ||
      !this._lottieInstance ||
      isNaN(Number(target.value))
    ) {
      return
    }

    this.seek(Math.round(Number(target.value) / 100 * this._lottieInstance.totalFrames))
  }

  /**
   * Handle settings click event.
   */
  protected _handleSettingsClick({ target }: Event) {
    this._toggleSettings()
    // Because Safari does not add focus on click, we need to add it manually, so the onblur event will fire
    if (target instanceof HTMLElement) {
      target.focus()
    }
  }

  protected setOptions(_options: {
    container?: undefined |  HTMLElement
    rendererType: RendererType
    initialSegment?: undefined |  Vector2
    hasAutoplay: boolean
    hasLoop: boolean
    preserveAspectRatio: PreserveAspectRatio
  }): AnimationConfiguration<
    RendererType.SVG | RendererType.Canvas | RendererType.HTML
    > {
    throw new Error('Method not implemented')
  }

  /**
   * Add event listeners.
   */
  private _addEventListeners() {
    this._toggleEventListeners('add')
  }

  /**
   * Add IntersectionObserver.
   */
  private _addIntersectionObserver() {
    if (
      !this._container ||
      this._intersectionObserver
    ) {
      return
    }

    if (!('IntersectionObserver' in window)) {
      this._intersectionObserverFallback()

      removeEventListener(
        'scroll', this._intersectionObserverFallback, true
      )
      addEventListener(
        'scroll', this._intersectionObserverFallback, {
          capture: true,
          passive: true
        }
      )

      return
    }

    this._intersectionObserver = new IntersectionObserver((entries) => {
      const { length } = entries

      for (let i = 0; i < length; i++) {
        if (!entries[i]?.isIntersecting || document.hidden) {
          if (this.playerState === PlayerState.Playing) {
            this._freeze()
          }
          this._playerState.visible = false
          continue
        }
        if (
          !this.animateOnScroll &&
          !this.playOnVisible &&
          this.playerState === PlayerState.Frozen
        ) {
          this.play()
        }

        if (this.playOnVisible) {
          if (
            this.playerState === PlayerState.Completed &&
            !this.once
          ) {
            this.playerState = PlayerState.Playing
            this._lottieInstance?.goToAndPlay(this.direction === 1 ? 0 : this._lottieInstance.totalFrames)
          } else {
            setTimeout(() => {
              this.play()
            }, this.delay)

          }
        }

        /**
         * If the player is a ways down the page, we need to account for this by
         * setting _playerState.scrollY to the current scroll position. However, we
         * also need to check that the player hasn't been scrolled past, so we check
         * boundingClientRect as well.
         */
        if (!this._playerState.scrollY && (entries[i]?.boundingClientRect.y || 0) > 0) {
          this._playerState.scrollY = scrollY
        }
        this._playerState.visible = true

      }
    })

    this._intersectionObserver.observe(this._container)
  }

  private _complete() {
    if (!this._lottieInstance) {
      return
    }

    if (this._animations.length > 1) {
      if (
        this._multiAnimationSettings[this._currentAnimation + 1]?.autoplay
      ) {
        this.next()

        return
      }
      if (this.loop && this._currentAnimation === this._animations.length - 1) {
        this._currentAnimation = 0

        this._switchInstance()

        return
      }
    }

    const { currentFrame, totalFrames } = this._lottieInstance

    this._seeker = Math.round(currentFrame / totalFrames * 100)

    this.playerState = PlayerState.Completed

    this.dispatchEvent(new CustomEvent(PlayerEvents.Complete, {
      detail: {
        frame: currentFrame,
        seeker: this._seeker,
      },
    }))
  }

  private _dataFailed() {
    this.playerState = PlayerState.Error
    this.dispatchEvent(new CustomEvent(PlayerEvents.Error))
  }

  private _dataReady() {
    this.dispatchEvent(new CustomEvent(PlayerEvents.Load))
  }

  private _DOMLoaded() {
    this._playerState.loaded = true
    this.dispatchEvent(new CustomEvent(PlayerEvents.Ready))
  }

  private _enterFrame() {
    if (!this._lottieInstance) {
      return
    }
    const { currentFrame, totalFrames } = this._lottieInstance

    this._seeker = Math.round(currentFrame / totalFrames * 100)

    this.dispatchEvent(new CustomEvent(PlayerEvents.Frame, {
      detail: {
        frame: currentFrame,
        seeker: this._seeker,
      },
    }))
  }

  /**
   * Get options from props.
   */
  private _getOptions() {
    if (!this._container) {
      throw new Error('Container not rendered')
    }
    const preserveAspectRatio =
      this.preserveAspectRatio ??
      aspectRatio(this.objectfit as ObjectFit),
      currentAnimationSettings = this._multiAnimationSettings.length > 0
        ? this._multiAnimationSettings[this._currentAnimation]
        : undefined,
      currentAnimationManifest =
        this._manifest?.animations[this._currentAnimation]

    // Loop
    let hasLoop = Boolean(this.loop)

    if (
      currentAnimationManifest?.loop !== undefined
    ) {
      hasLoop = Boolean(currentAnimationManifest.loop)
    }
    if (currentAnimationSettings?.loop !== undefined) {
      hasLoop = Boolean(currentAnimationSettings.loop)
    }

    // Autoplay
    let hasAutoplay = Boolean(this.autoplay)

    if (
      currentAnimationManifest?.autoplay !== undefined
    ) {
      hasAutoplay = Boolean(currentAnimationManifest.autoplay)
    }
    if (currentAnimationSettings?.autoplay !== undefined) {
      hasAutoplay = Boolean(currentAnimationSettings.autoplay)
    }
    if (this.animateOnScroll) {
      hasAutoplay = false
    }

    // Segment
    let initialSegment = this._segment

    if (this._segment?.every((val) => val > 0)) {
      initialSegment = [this._segment[0] - 1, this._segment[1] - 1]
    }
    if (this._segment?.some((val) => val < 0)) {
      initialSegment = undefined
    }

    return this.setOptions({
      container: this._container,
      hasAutoplay,
      hasLoop,
      initialSegment,
      preserveAspectRatio,
      rendererType: this.renderer
    })
  }

  /**
   * Handle scroll.
   */
  private _handleScroll() {
    if (!this.animateOnScroll || !this._DOMRect || !this._lottieInstance) {
      return
    }
    if (isServer) {
      console.warn('DotLottie: Scroll animations might not work properly in a Server Side Rendering context. Try to wrap this in a client component.')

      return
    }
    if (!this._playerState.visible) {
      return
    }
    if (this._playerState.scrollTimeout) {
      clearTimeout(this._playerState.scrollTimeout)
    }
    this._playerState.scrollTimeout = setTimeout(() => {
      this.playerState = PlayerState.Paused
    }, 400)

    const { totalFrames } = this._lottieInstance

    let scrollPosition = scrollY - this._playerState.scrollY

    if (scrollY <= this._playerState.scrollY) {
      scrollPosition = this._playerState.scrollY - scrollY
    }

    const {
      bottom, height, top
    } = this._DOMRect
    let offset = height - bottom

    if (top >= innerHeight) {
      offset = height
    }

    const scrollProgress = scrollPosition / (innerHeight + offset),
      currentFrame = clamp(
        scrollProgress * (totalFrames - 1), 0, totalFrames
      )

    requestAnimationFrame(() => {
      if (currentFrame >= totalFrames) {
        this.playerState = PlayerState.Paused

        return
      }

      this.playerState = PlayerState.Playing
      this._lottieInstance?.goToAndStop(currentFrame, true)
    })
  }

  private _handleWindowBlur({ type }: FocusEvent) {
    if (this.dontFreezeOnBlur) {
      return
    }
    if (this.playerState === PlayerState.Playing && type === 'blur') {
      this._freeze()
    }
    if (this.playerState === PlayerState.Frozen && type === 'focus') {
      this.play()
    }
  }

  private _intersectionObserverFallback() {
    if (!this._container) {
      return
    }
    const {
      bottom, left, right, top
    } = this._container.getBoundingClientRect()


    this._playerState.visible =
      top >= 0 &&
      left >= 0 &&
      bottom <= innerHeight &&
      right <= innerWidth

    if (
      this.autoplay ||
      this.playOnVisible ||
      this.playerState === PlayerState.Playing ||
      this.playerState === PlayerState.Frozen
    ) {
      if (this._playerState.visible) {
        this.play()
      } else {
        this._freeze()
      }
    }

  }

  private _loopComplete() {
    if (!this._lottieInstance) {
      return
    }

    const {
        playDirection,
        // firstFrame,
        totalFrames,
      } = this._lottieInstance,
      inPoint = this._segment ? this._segment[0] : 0,
      outPoint = this._segment ? this._segment[0] : totalFrames

    if (this.count) {
      if (this._isBounce) {
        this._playerState.count += 0.5
      } else {
        this._playerState.count += 1
      }

      if (this._playerState.count >= this.count) {
        this.setLoop(false)

        this.playerState = PlayerState.Completed
        this.dispatchEvent(new CustomEvent(PlayerEvents.Complete))

        return
      }
    }

    this.dispatchEvent(new CustomEvent(PlayerEvents.Loop))

    if (this._isBounce) {
      this._lottieInstance.goToAndStop(playDirection === -1 ? inPoint : outPoint * 0.99,
        true)

      this._lottieInstance.setDirection((playDirection * -1) as AnimationDirection)

      return setTimeout(() => {
        if (!this.animateOnScroll) {
          this._lottieInstance?.play()
        }
      }, this.intermission)
    }

    this._lottieInstance.goToAndStop(playDirection === -1 ? outPoint * 0.99 : inPoint,
      true)

    return setTimeout(() => {
      if (!this.animateOnScroll) {
        this._lottieInstance?.play()
      }
    }, this.intermission)
  }

  /**
   * Handle MouseEnter.
   */
  private _mouseEnter() {
    if (!this.hover || !this._lottieInstance || isTouch()) {
      return
    }

    if (this.mouseout === MouseOut.Reverse) {
      this._lottieInstance.setDirection(1)
    }

    if (this.playerState === PlayerState.Completed) {
      this._lottieInstance.goToAndPlay(0, true)
      this.playerState = PlayerState.Playing

      return
    }

    if (this.playerState !== PlayerState.Playing) {
      this.play()
    }
  }

  /**
   * Handle MouseLeave.
   */
  private _mouseLeave() {
    if (!this.hover || !this._lottieInstance || isTouch()) {
      return
    }

    switch (this.mouseout) {
      case MouseOut.Void: {
        break
      }
      case MouseOut.Pause: {
        this.pause()
        break
      }
      case MouseOut.Reverse: {
        // const { direction = 1 } =
        //   this._multiAnimationSettings.length > 0 ?
        //     this._multiAnimationSettings[this._currentAnimation + 1] ?? { direction: 1 } : this,
        //   newDirection = direction * -1 as AnimationDirection

        this._lottieInstance.setDirection(-1)
        this.play()
        break
      }
      default: {
        this.stop()
      }
    }
  }

  /**
   * Handle visibility change events.
   */
  private _onVisibilityChange() {
    if (document.hidden && this.playerState === PlayerState.Playing) {
      this._freeze()

      return
    }

    if (this.playerState === PlayerState.Frozen) {
      this.play()
    }
  }

  /**
   * Remove event listeners.
   */
  private _removeEventListeners() {
    this._toggleEventListeners('remove')
  }

  private _switchInstance(isPrevious = false) {
    // Bail early if there is not animation to play
    if (!this._animations[this._currentAnimation]) {
      return
    }

    try {
      // Clear previous animation
      if (this._lottieInstance) {
        this._lottieInstance.destroy()
      }

      // Re-initialize lottie player
      this._lottieInstance = this.loadAnimation({
        ...this._getOptions(),
        animationData: this._animations[this._currentAnimation],
      })
      // Check play mode for current animation
      if (this._multiAnimationSettings[this._currentAnimation]?.mode) {
        this._isBounce =
          this._multiAnimationSettings[this._currentAnimation]?.mode as PlayMode ===
          PlayMode.Bounce
      }

      // Remove event listeners to new Lottie instance, and add new
      this._removeEventListeners()
      this._addEventListeners()

      this.dispatchEvent(new CustomEvent(isPrevious ? PlayerEvents.Previous : PlayerEvents.Next))

      if (
        this._multiAnimationSettings[this._currentAnimation]?.autoplay ??
        this.autoplay
      ) {
        if (this.animateOnScroll) {
          this._lottieInstance.goToAndStop(0, true)
          this.playerState = PlayerState.Paused

          return
        }

        this._lottieInstance.goToAndPlay(0, true)
        this.playerState = PlayerState.Playing

        return
      }

      this._lottieInstance.goToAndStop(0, true)
      this.playerState = PlayerState.Stopped
    } catch (error) {
      this._errorMessage = handleErrors(error).message

      this.playerState = PlayerState.Error

      this.dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }

  /**
   * Toggle event listeners.
   */
  private _toggleEventListeners(action: 'add' | 'remove') {
    const method = action === 'add' ? 'addEventListener' : 'removeEventListener'

    if (this._lottieInstance) {
      this._lottieInstance[method]('enterFrame', this._enterFrame)
      this._lottieInstance[method]('complete', this._complete)
      this._lottieInstance[method]('loopComplete', this._loopComplete)
      this._lottieInstance[method]('DOMLoaded', this._DOMLoaded)
      this._lottieInstance[method]('data_ready', this._dataReady)
      this._lottieInstance[method]('data_failed', this._dataFailed)
    }

    if (this.selector) {
      const selector = document.getElementById(this.selector)

      if (selector) {
        if (this.hover) {
          selector[method]('mouseenter', this._mouseEnter)
          selector[method]('mouseleave', this._mouseLeave)
        } else {
          selector[method]('click', this._handleClick)
        }
      } else {
        this.selector = null
      }
    }

    if (this._container && !this.selector) {
      if (this.hover) {
        this._container[method]('mouseenter', this._mouseEnter)
        this._container[method]('mouseleave', this._mouseLeave)
      }
      if (this.playOnClick) {
        this._container[method]('click', this._handleClick)
      }
    }

    window[method](
      'focus', this._handleWindowBlur as EventListener, {
        capture: false,
        passive: true,
      }
    )
    window[method](
      'blur', this._handleWindowBlur as EventListener, {
        capture: false,
        passive: true,
      }
    )

    if (this.animateOnScroll) {
      window[method](
        'scroll', this._handleScroll, {
          capture: true,
          passive: true,
        }
      )
    }
  }

  /**
   * Toggle show Settings.
   */
  private _toggleSettings(flag?: boolean) {
    if (flag === undefined) {
      this._isSettingsOpen = !this._isSettingsOpen

      return
    }
    this._isSettingsOpen = flag
  }
}
