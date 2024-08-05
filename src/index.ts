import Lottie, {
  type AnimationConfig as LottieConfig,
  type AnimationDirection,
  type AnimationEventName,
  type AnimationItem,
  type AnimationSegment,
  type RendererType
} from 'lottie-web'
import pkg from '../package.json'
import EnhancedElement from './observeProperties'
import {
  aspectRatio,
  createDotLottie,
  createJSON,
  download,
  frameOutput,
  getAnimationData,
  getFilename,
  handleErrors,
  isServer,
  ObjectFit,
  PlayMode,
  PlayerEvents,
  PlayerState,
  PreserveAspectRatio,
  useId,
} from './utils'
import {
  AnimationSettings,
  AnimateOnScroll,
  AnimationConfig,
  Autoplay,
  Controls,
  Loop,
  LottieJSON,
  LottieManifest,
  Subframe
} from './types'
import styles from './styles.scss'

/**
 * dotLottie Player Web Component
 * @export
 * @class DotLottiePlayer
 * @extends { EnhancedElement }
 */
export class DotLottiePlayer extends EnhancedElement {
  shadow: ShadowRoot

  template: HTMLTemplateElement

  constructor() {
    super()
    this._complete = this._complete.bind(this)
    this._dataReady = this._dataReady.bind(this)
    this._dataFailed = this._dataFailed.bind(this)
    this._DOMLoaded = this._DOMLoaded.bind(this)
    this._enterFrame = this._enterFrame.bind(this)
    this._freeze = this._freeze.bind(this)
    this._handleBlur = this._handleBlur.bind(this)
    this._handleScroll = this._handleScroll.bind(this)
    this._handleSeekChange = this._handleSeekChange.bind(this)
    this._handleWindowBlur = this._handleWindowBlur.bind(this)
    this._loopComplete = this._loopComplete.bind(this)
    this._mouseEnter = this._mouseEnter.bind(this)
    this._mouseLeave = this._mouseLeave.bind(this)
    this._onVisibilityChange = this._onVisibilityChange.bind(this)
    this._switchInstance = this._switchInstance.bind(this)

    this.togglePlay = this.togglePlay.bind(this)
    this.stop = this.stop.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
    this.renderControls = this.renderControls.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.toggleLoop = this.toggleLoop.bind(this)
    this.toggleBoomerang = this.toggleBoomerang.bind(this)

    this.convert = this.convert.bind(this)
    this.destroy = this.destroy.bind(this)

    this.template = document.createElement('template')
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  /**
   * Initialize everything on component first render
   */
  override async connectedCallback() {
    super.connectedCallback()
    this.render()

    this._container = this.shadow.querySelector('.animation')
    if (this.controls) {
      this.renderControls()
    }

    // Add listener for Visibility API's change event.
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibilityChange)
    }

    // Add intersection observer for detecting component being out-of-view.
    this._addIntersectionObserver()

    // Setup lottie player
    await this.load(this.src)
    this.dispatchEvent(new CustomEvent(PlayerEvents.Rendered))
  }

  /**
   * Cleanup on component destroy
   */
  disconnectedCallback() {

    // Remove intersection observer for detecting component being out-of-view
    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect()
      this._intersectionObserver = undefined
    }

    // Destroy the animation instance
    if (this._lottieInstance) {
      this._lottieInstance.destroy()
    }

    // Remove the attached Visibility API's change event listener
    document.removeEventListener('visibilitychange', this._onVisibilityChange)
  }

  /**
   * Attributes to observe
   */
  static get observedAttributes() {
    return [
      'animateOnScroll',
      'autoplay',
      'background',
      'count',
      'description',
      'direction',
      'hover',
      'intermission',
      'loop',
      'mode',
      'multiAnimationSettings',
      'objectfit',
      'preserveAspectRatio',
      'renderer',
      'segment',
      'simple',
      'speed',
      'subframe',
    ]
  }

  /**
   * Runs when the value of an attribute is changed on the component
   */
  attributeChangedCallback(name: string, _oldValue: unknown, value: string) {
    const toggleLoop = this.shadow.querySelector('#toggleLoop'),
      toggleBoomerang = this.shadow.querySelector('#toggleBoomerang')

    if (
      !(toggleLoop instanceof HTMLButtonElement)
      || !(toggleBoomerang instanceof HTMLButtonElement)
    ) {
      return
    }

    if (name === 'loop') {
      toggleLoop.dataset.active = value
    }

    if (name === 'mode') {
      toggleBoomerang.dataset.active = (value === PlayMode.Bounce).toString()
    }
  }

  static get observedProperties() {
    return [
      'playerState',
      '_isSettingsOpen',
      '_seeker',
      '_currentAnimation',
      '_animations'
    ]
  }

  // name: string, oldValue: string, newValue: string
  propertyChangedCallback(name: string, _oldValue: unknown, value: unknown) {
    if (!this.shadow) {
      return
    }

    const togglePlay = this.shadow.querySelector('#togglePlay'),
      stop = this.shadow.querySelector('#stop'),
      prev = this.shadow.querySelector('#prev'),
      next = this.shadow.querySelector('#next'),
      seeker = this.shadow.querySelector('#seeker'),
      progress = this.shadow.querySelector('progress'),
      popover = this.shadow.querySelector('.popover'),
      convert = this.shadow.querySelector('#convert')

    if (
      !(togglePlay instanceof HTMLButtonElement)
      || !(stop instanceof HTMLButtonElement)
      || !(next instanceof HTMLButtonElement)
      || !(prev instanceof HTMLButtonElement)
      || !(seeker instanceof HTMLInputElement)
      || !(progress instanceof HTMLProgressElement)
    ) {
      return
    }

    if (name === 'playerState') {

      togglePlay.dataset.active = (value === PlayerState.Playing || value === PlayerState.Paused).toString()
      stop.dataset.active = (value === PlayerState.Stopped).toString()

      if (value === PlayerState.Playing) {
        togglePlay.innerHTML = `
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M14.016 5.016H18v13.969h-3.984V5.016zM6 18.984V5.015h3.984v13.969H6z" />
          </svg>
        `
      } else {
        togglePlay.innerHTML = `
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
          </svg>
        `
      }
    }

    if (
      name === '_seeker'
      && typeof value === 'number'
    ) {
      seeker.value = value.toString()
      seeker.ariaValueNow = value.toString()
      progress.value = value
    }

    if (
      name === '_animations'
      && Array.isArray(value)
    ) {
      if ((this._currentAnimation + 1) < value.length) {
        next.hidden = false
      }
    }

    if (
      name === '_currentAnimation'
      && typeof value === 'number'
    ) {
      if ((value + 1) >= this._animations.length) {
        next.hidden = true
      } else {
        next.hidden = false
      }

      if (value) {
        prev.hidden = false
      } else {
        prev.hidden = true
      }
    }

    if (
      name === '_isSettingsOpen'
      && typeof value === 'boolean'
      && popover instanceof HTMLDivElement
      && convert instanceof HTMLButtonElement
    ) {
      popover.hidden = !value
      convert.hidden = this._isDotLottie
    }
  }

  /**
   * Whether to trigger next frame with scroll
   */
  set animateOnScroll(value: AnimateOnScroll) {
    this.setAttribute('animateOnScroll', (!!value).toString())
  }

  get animateOnScroll() {
    const val = this.getAttribute('animateOnScroll')
    if (val === 'true' || val === '' || val === '1') {
      return true
    }
    return false
  }

  /**
   * Autoplay
   */
  set autoplay(value: Autoplay) {
    this.setAttribute('autoplay', (!!value).toString())
  }

  get autoplay() {
    const val = this.getAttribute('autoplay')
    if (val === 'true' || val === '' || val === '1') {
      return true
    }
    return false
  }

  /**
   * Background color
   */
  set background(value: string) {
    this.setAttribute('background', value)
  }

  get background() {
    return this.getAttribute('background') || 'transparent'
  }

  /**
   * Show controls
   */
  set controls(value: Controls) {
    this.setAttribute('controls', (!!value).toString())
  }

  get controls() {
    const val = this.getAttribute('controls')
    if (val === 'true' || val === '' || val === '1') {
      return true
    }
    return false
  }

  /**
   * Number of times to loop
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

  /**
   * Description for screen readers
   */
  set description(value: string) {
    this.setAttribute('description', value)
  }

  get description() {
    return this.getAttribute('description') || ''
  }

  /**
   * Direction of animation
   */
  set direction(value: AnimationDirection) {
    this.setAttribute('direction', value.toString())
  }

  get direction() {
    const val = Number(this.getAttribute(''))
    if (val === -1) {
      return val
    }
    return 1
  }

  /**
   * Whether to play on mouseover
   */
  set hover(value: boolean) {
    this.setAttribute('hover', value.toString())
  }

  get hover() {
    const val = this.getAttribute('hover')
    if (val === 'true' || val === '' || val === '1') {
      return true
    }
    return false
  }

  /**
   * Pause between loop intrations, in miliseconds
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
   * Loop animation
   */
  set loop(value: Loop) {
    this.setAttribute('loop', (!!value).toString())
  }

  get loop() {
    const val = this.getAttribute('loop')
    if (val === 'true' || val === '' || val === '1') {
      return true
    }
    return false
  }

  /**
   * Play mode
   */
  set mode(value: PlayMode) {
    this.setAttribute('mode', value.toString())
  }

  get mode() {
    const val = this.getAttribute('mode')
    if (val === PlayMode.Bounce) {
      return val
    }
    return PlayMode.Normal
  }

  /**
   * Multi-animation settings
   * If set, these will override conflicting settings
   */
  set multiAnimationSettings(value: AnimationSettings[]) {
    this.setAttribute('multiAnimationSettings', JSON.stringify(value))
  }

  get multiAnimationSettings() {
    const val = JSON.parse(this.getAttribute('multiAnimationSettings') || 'null')
    if (Array.isArray(val)) {
      return val
    }
    return []
  }

  /**
   * Resizing to container
  */
  set objectfit(value: string) {
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
   * Resizing to container (Deprecated)
  */
  set preserveAspectRatio(value: PreserveAspectRatio | null) {
    this.setAttribute('preserveAspectRatio', value || PreserveAspectRatio.Contain)
  }

  get preserveAspectRatio() {
    const val = this.getAttribute('preserveAspectRatio')
    if (val && Object.values(PreserveAspectRatio).includes(val as PreserveAspectRatio)) {
      return val as PreserveAspectRatio
    }
    return null
  }

  /**
   * Renderer to use: svg, canvas or html
   */
  set renderer(value: RendererType) {
    this.setAttribute('renderer', value)
  }

  get renderer() {
    const val = this.getAttribute('renderer')
    if (val === 'canvas' || val === 'html') {
      return val
    }
    return 'svg'
  }

  /**
   * Segment
   */
  set segment(value: AnimationSegment | undefined) {
    this.setAttribute('segment', JSON.stringify(value))
  }

  get segment() {
    const val = JSON.parse(this.getAttribute('segment') || 'null')
    if (Array.isArray(val)) {
      return val as AnimationSegment
    }
    return undefined
  }

  /**
   * Hide advanced controls
   */
  // public simple?: boolean = false
  set simple(value: boolean) {
    this.setAttribute('simple', value.toString())
  }

  get simple() {
    const val = this.getAttribute('simple')
    if (val === 'true' || val === '' || val === '1') {
      return true
    }
    return false
  }

  /**
   * Speed
   */
  set speed(value: number) {
    this.setAttribute('speed', value?.toString())
  }

  get speed() {
    const val = this.getAttribute('speed')
    if (val !== null && !isNaN(Number(val))) {
      return Number(val)
    }
    return 1
  }

  /**
   * Source, either path or JSON string
   */
  set src(value: string | null) {
    this.setAttribute('src', value || '')
  }

  get src() {
    return this.getAttribute('src')
  }

  /**
   * Subframe
   */
  set subframe(value: Subframe) {
    this.setAttribute('subframe', (!!value).toString())
  }

  get subframe() {
    const val = this.getAttribute('subframe')
    if (val === 'true' || val === '' || val === '1') {
      return true
    }
    return false
  }

  /**
   * Animation Container
   */
  protected _container!: Element | null

  /**
   * @state
   * Player state
   */
  public playerState?: PlayerState = PlayerState.Loading

  /**
   * @state
   * Whether settings toolbar is open
   */
  private _isSettingsOpen = false

  /**
   * @state
   * Seeker
   */
  private _seeker = 0

  /**
   * @state
   * Which animation to show, if several
   */
  private _currentAnimation = 0

  private _intersectionObserver?: IntersectionObserver
  private _lottieInstance: AnimationItem | null = null
  private _identifier = this.id || useId('dotlottie')
  private _errorMessage = 'Something went wrong'

  private _isBounce = false

  private _isDotLottie = false

  private _manifest!: LottieManifest

  /**
   * @state
   * This is set to state, so that next-button will show up
   * on load, if controls are visible
   */
  private _animations!: LottieJSON[]

  private _playerState: {
    prev: PlayerState
    count: number
    loaded: boolean
    visible: boolean
    scrollY: number
    scrollTimeout: NodeJS.Timeout | null
  } = {
      prev: PlayerState.Loading,
      count: 0,
      loaded: false,
      visible: false,
      scrollY: 0,
      scrollTimeout: null
    }

  /**
   * Get options from props
   * @returns { LottieConfig }
   */
  private _getOptions() {
    if (!this._container) {
      throw new Error('Container not rendered')
    }
    const preserveAspectRatio =
      this.preserveAspectRatio ?? (this.objectfit && aspectRatio(this.objectfit)),

      currentAnimationSettings =
        this.multiAnimationSettings?.length ? this.multiAnimationSettings?.[this._currentAnimation] : undefined,
      currentAnimationManifest = this._manifest.animations?.[this._currentAnimation]

    // Loop
    let loop = !!this.loop
    if (currentAnimationManifest.loop !== undefined && this.loop === undefined) {
      loop = !!currentAnimationManifest.loop
    }
    if (currentAnimationSettings?.loop !== undefined) {
      loop = !!currentAnimationSettings.loop
    }

    // Autoplay
    let autoplay = !!this.autoplay
    if (currentAnimationManifest.autoplay !== undefined && this.autoplay === undefined) {
      autoplay = !!currentAnimationManifest.autoplay
    }
    if (currentAnimationSettings?.autoplay !== undefined) {
      autoplay = !!currentAnimationSettings.autoplay
    }
    if (this.animateOnScroll) {
      autoplay = false
    }

    // Segment
    let initialSegment = this.segment
    if (this.segment?.every(val => val > 0)) {
      initialSegment = [this.segment[0] - 1, this.segment[1] -1]
    }
    if (this.segment?.some(val => val < 0)) {
      initialSegment = undefined
    }

    const options: LottieConfig<'svg' | 'canvas' | 'html'> =
      {
        container: this._container,
        loop,
        autoplay,
        renderer: this.renderer,
        initialSegment,
        rendererSettings: {
          imagePreserveAspectRatio: preserveAspectRatio,
          // runExpressions: false <-- TODO: Security measure, not tested
        }
      }

    switch (this.renderer) {
    case 'svg':
      options.rendererSettings = {
        ...options.rendererSettings,
        hideOnTransparent: true,
        preserveAspectRatio,
        progressiveLoad: true,
      }
      break
    case 'canvas':
      options.rendererSettings = {
        ...options.rendererSettings,
        clearCanvas: true,
        preserveAspectRatio,
        progressiveLoad: true,
      }
      break
    case 'html':
      options.rendererSettings = {
        ...options.rendererSettings,
        hideOnTransparent: true
      }
    }
    return options
  }

  /**
   * Add IntersectionObserver
   */
  private _addIntersectionObserver() {
    if (
      !this._container
      || this._intersectionObserver
      || !('IntersectionObserver' in window)
    ) {
      return
    }

    this._intersectionObserver =
      new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting || document.hidden) {
            if (this.playerState === PlayerState.Playing) {
              this._freeze()
            }
            this._playerState.visible = false
            continue
          }
          if (!this.animateOnScroll && this.playerState === PlayerState.Frozen) {
            this.play()
          }
          if (!this._playerState.scrollY) {
            this._playerState.scrollY = scrollY
          }
          this._playerState.visible = true
        }
      })

    this._intersectionObserver.observe(this._container)
  }

  /**
   * Initialize Lottie Web player
   */
  public async load(src: string | null) {
    if (!this.shadowRoot || !src) {
      return
    }

    // Load the resource
    try {
      const { animations, manifest, isDotLottie } =
        await getAnimationData(src)

      if (!animations || animations.some(animation => !this._isLottie(animation))) {
        throw new Error('Broken or corrupted file')
      }

      this._isBounce = this.mode === PlayMode.Bounce
      if (this.multiAnimationSettings?.length) {
        if (this.multiAnimationSettings[this._currentAnimation]?.mode) {
          this._isBounce = this.multiAnimationSettings[this._currentAnimation].mode === PlayMode.Bounce
        }
      }

      this._isDotLottie = !!isDotLottie
      this._animations = animations
      this._manifest = manifest ?? {
        animations: [{
          id: useId(),
          autoplay: !this.animateOnScroll && this.autoplay,
          loop: this.loop,
          direction: this.direction,
          mode: this.mode,
          speed: this.speed
        }]
      }

      // Clear previous animation, if any
      if (this._lottieInstance) {
        this._lottieInstance.destroy()
      }

      this.playerState = PlayerState.Stopped
      if (!this.animateOnScroll
        && (this.autoplay
        || this.multiAnimationSettings?.[this._currentAnimation]?.autoplay
        )) {
        this.playerState = PlayerState.Playing
      }

      // Initialize lottie player and load animation
      this._lottieInstance = Lottie.loadAnimation({
        ...this._getOptions(),
        animationData: animations[this._currentAnimation],
      })
    } catch (err) {
      this._errorMessage = handleErrors(err).message

      this.playerState = PlayerState.Error

      this.dispatchEvent(new CustomEvent(PlayerEvents.Error))
      return
    }

    this._addEventListeners()

    const speed = this.multiAnimationSettings?.[this._currentAnimation]?.speed ??
      this.speed ?? this._manifest.animations[this._currentAnimation].speed,

      direction = this.multiAnimationSettings?.[this._currentAnimation]?.direction ??
        this.direction ?? this._manifest.animations[this._currentAnimation].direction ?? 1

    // Set initial playback speed and direction
    this.setSpeed(speed)
    this.setDirection(direction)
    this.setSubframe(!!this.subframe)

    // Start playing if autoplay is enabled
    if (this.autoplay || this.animateOnScroll) {
      if (this.direction === -1) {
        this.seek('99%')
      }

      if (!('IntersectionObserver' in window)) {
        if (!this.animateOnScroll) {
          this.play()
        }
        this._playerState.visible = true
      }

      this._addIntersectionObserver()

    }
  }

  /**
   * Get Lottie Manifest
   */
  public getManifest() {
    return this._manifest
  }

  /**
   * Add event listeners
   */
  private _addEventListeners() {
    if (!this._lottieInstance) {
      return
    }

    this.shadow.querySelector('#togglePlay')?.addEventListener('click', this.togglePlay)
    this.shadow.querySelector('#stop')?.addEventListener('click', this.stop)
    this.shadow.querySelector('#prev')?.addEventListener('click', this.prev)
    this.shadow.querySelector('#next')?.addEventListener('click', this.next)
    this.shadow.querySelector('#toggleLoop')?.addEventListener('click', this.toggleLoop)
    this.shadow.querySelector('#toggleBoomerang')?.addEventListener('click', this.toggleBoomerang)
    // The convert function has an object parameter with optional values, and is therefor safe to cast in this way
    this.shadow.querySelector('#convert')?.addEventListener('click', this.convert as unknown as () => void)
    this.shadow.querySelector('#snapshot')?.addEventListener('click', this.snapshot)

    const toggleSettings = this.shadow.querySelector('#seeker')
    toggleSettings?.addEventListener('change', this._handleSeekChange)
    toggleSettings?.addEventListener('mousedown', this._freeze)

    const settings = this.shadow.querySelector('#toggleSettings')
    settings?.addEventListener('click', this._handleSettingsClick)
    settings?.addEventListener('blur', this._handleBlur)

    // Calculate and save the current progress of the animation
    this._lottieInstance.addEventListener<AnimationEventName>('enterFrame', this._enterFrame)

    // Handle animation play complete
    this._lottieInstance.addEventListener<AnimationEventName>('complete', this._complete)

    this._lottieInstance.addEventListener<AnimationEventName>('loopComplete', this._loopComplete)

    // Handle lottie-web ready event
    this._lottieInstance.addEventListener<AnimationEventName>('DOMLoaded', this._DOMLoaded)

    // Handle animation data load complete
    this._lottieInstance.addEventListener<AnimationEventName>('data_ready', this._dataReady)

    // Set error state when animation load fail event triggers
    this._lottieInstance.addEventListener<AnimationEventName>('data_failed', this._dataFailed)

    if (this._container && this.hover) {
      // Set handlers to auto play animation on hover if enabled
      this._container.addEventListener('mouseenter', this._mouseEnter)
      this._container.addEventListener('mouseleave', this._mouseLeave)
    }

    addEventListener('focus', this._handleWindowBlur, { passive: true, capture: false })
    addEventListener('blur', this._handleWindowBlur, { passive: true, capture: false })

    if (this.animateOnScroll) {
      addEventListener('scroll', this._handleScroll, { passive: true, capture: true })
    }
  }

  /**
   * Remove event listeners
   */
  private _removeEventListeners() {
    if (!this._lottieInstance || !this._container) {
      return
    }

    this.shadow.querySelector('#togglePlay')?.removeEventListener('click', this.togglePlay)
    this.shadow.querySelector('#stop')?.removeEventListener('click', this.stop)
    this.shadow.querySelector('#prev')?.removeEventListener('click', this.prev)
    this.shadow.querySelector('#next')?.removeEventListener('click', this.next)
    this.shadow.querySelector('#toggleLoop')?.removeEventListener('click', this.toggleLoop)
    this.shadow.querySelector('#toggleBoomerang')?.removeEventListener('click', this.toggleBoomerang)
    // The convert function has an object parameter with optional values, and is therefor safe to cast in this way
    this.shadow.querySelector('#convert')?.removeEventListener('click', this.convert as unknown as () => void)
    this.shadow.querySelector('#snapshot')?.removeEventListener('click', this.snapshot)

    const seeker = this.shadow.querySelector('#seeker')
    seeker?.removeEventListener('change', this._handleSeekChange)
    seeker?.removeEventListener('mousedown', this._freeze)

    const toggleSettings = this.shadow.querySelector('#toggleSettings')
    toggleSettings?.removeEventListener('click', this._handleSettingsClick)
    toggleSettings?.removeEventListener('blur', this._handleBlur)

    this._lottieInstance.removeEventListener<AnimationEventName>('enterFrame', this._enterFrame)
    this._lottieInstance.removeEventListener<AnimationEventName>('complete', this._complete)
    this._lottieInstance.removeEventListener<AnimationEventName>('loopComplete', this._loopComplete)
    this._lottieInstance.removeEventListener<AnimationEventName>('DOMLoaded', this._DOMLoaded)
    this._lottieInstance.removeEventListener<AnimationEventName>('data_ready', this._dataReady)
    this._lottieInstance.removeEventListener<AnimationEventName>('data_failed', this._dataFailed)

    this._container.removeEventListener('mouseenter', this._mouseEnter)
    this._container.removeEventListener('mouseleave', this._mouseLeave)

    removeEventListener('focus', this._handleWindowBlur, true)
    removeEventListener('blur', this._handleWindowBlur, true)
    removeEventListener('scroll', this._handleScroll, true)
  }

  private _loopComplete() {
    if (!this._lottieInstance) {
      return
    }

    const {
      // firstFrame,
        totalFrames,
        playDirection,
      } = this._lottieInstance,
      inPoint = this.segment ? this.segment[0] : 0,
      outPoint = this.segment ? this.segment[0] : totalFrames

    if (this.count) {

      if (this._isBounce) {
        this._playerState.count += 0.5
      } else {
        this._playerState.count += 1
      }

      if (this._playerState.count >= this.count) {
        this.setLooping(false)

        this.playerState = PlayerState.Completed
        this.dispatchEvent(new CustomEvent(PlayerEvents.Complete))

        return
      }
    }

    this.dispatchEvent(new CustomEvent(PlayerEvents.Loop))

    if (this._isBounce) {
      this._lottieInstance.goToAndStop(
        playDirection === -1 ? inPoint : outPoint * 0.99, true
      )

      this._lottieInstance.setDirection(playDirection * -1 as AnimationDirection)

      return setTimeout(() => {
        if (!this.animateOnScroll) {
          this._lottieInstance?.play()
        }
      }, this.intermission)
    }

    this._lottieInstance.goToAndStop(
      playDirection === -1 ? outPoint * 0.99 : inPoint, true
    )

    return setTimeout(() => {
      if (!this.animateOnScroll) {
        this._lottieInstance?.play()
      }
    }, this.intermission)
  }

  private _enterFrame() {
    if (!this._lottieInstance) {
      return
    }
    const { currentFrame, totalFrames } = this._lottieInstance
    this._seeker = Math.round((currentFrame / totalFrames) * 100)

    this.dispatchEvent(
      new CustomEvent(PlayerEvents.Frame, {
        detail: {
          frame: currentFrame,
          seeker: this._seeker,
        },
      }),
    )
  }

  private _complete() {
    if (!this._lottieInstance) {
      return
    }

    if (this._animations.length > 1) {
      if (this.multiAnimationSettings?.[this._currentAnimation + 1]?.autoplay) {
        return this.next()
      }
      if (this.loop && this._currentAnimation === this._animations.length - 1) {
        this._currentAnimation = 0
        return this._switchInstance()
      }
    }

    const { currentFrame, totalFrames } = this._lottieInstance
    this._seeker = Math.round((currentFrame / totalFrames) * 100)

    this.playerState = PlayerState.Completed

    this.dispatchEvent(
      new CustomEvent(PlayerEvents.Complete, {
        detail: {
          frame: currentFrame,
          seeker: this._seeker,
        },
      }),
    )
  }

  private _DOMLoaded() {
    this._playerState.loaded = true
    this.dispatchEvent(new CustomEvent(PlayerEvents.Ready))
  }

  private _dataReady() {
    this.dispatchEvent(new CustomEvent(PlayerEvents.Load))
  }

  private _dataFailed() {
    this.playerState = PlayerState.Error
    this.dispatchEvent(new CustomEvent(PlayerEvents.Error))
  }

  private _handleWindowBlur({ type }: FocusEvent) {
    if (this.playerState === PlayerState.Playing && type === 'blur') {
      this._freeze()
    }
    if (this.playerState === PlayerState.Frozen && type === 'focus') {
      this.play()
    }
  }


  /**
   * Handle MouseEnter
   */
  private _mouseEnter() {
    if (this.hover && this.playerState !== PlayerState.Playing) {
      this.play()
    }
  }

  /**
   * Handle MouseLeave
   */
  private _mouseLeave() {
    if (this.hover && this.playerState === PlayerState.Playing) {
      this.stop()
    }
  }

  /**
   * Handle visibility change events
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
   * Handle scroll
   */
  private _handleScroll() {
    if (!this.animateOnScroll || !this._lottieInstance) {
      return
    }
    if (isServer()) {
      console.warn('DotLottie: Scroll animations might not work properly in a Server Side Rendering context. Try to wrap this in a client component.')
    }
    if (this._playerState.visible) {
      const adjustedScroll =
        scrollY > this._playerState.scrollY ? scrollY - this._playerState.scrollY :
          this._playerState.scrollY - scrollY,
        clampedScroll = Math.min(Math.max(adjustedScroll / 3, 1), this._lottieInstance.totalFrames * 3),
        roundedScroll = (clampedScroll / 3)

      requestAnimationFrame(() => {
        if (roundedScroll < (this._lottieInstance?.totalFrames ?? 0)) {
          this.playerState = PlayerState.Playing
          this._lottieInstance?.goToAndStop(roundedScroll, true)
        } else {
          this.playerState = PlayerState.Paused
        }
      })
    }
    if (this._playerState.scrollTimeout) {
      clearTimeout(this._playerState.scrollTimeout)
    }
    this._playerState.scrollTimeout = setTimeout(() => {
      this.playerState = PlayerState.Paused
    }, 400)
  }

  /**
   * Handles click and drag actions on the progress track
   * @param { Event & { HTMLInputElement } } event
   */
  private _handleSeekChange({ target }: Event) {
    if (
      !(target instanceof HTMLInputElement)
      || !this._lottieInstance
      || isNaN(Number(target.value))
    ) {
      return
    }

    this.seek(
      Math.round((Number(target.value) / 100) * this._lottieInstance.totalFrames)
    )

    // setTimeout(() => {
    //   if (target.parentElement instanceof HTMLFormElement) {
    //     target.parentElement.reset()
    //   }
    // }, 100)
  }

  private _isLottie(json: LottieJSON) {
    const mandatory: string[] =
      ['v', 'ip', 'op', 'layers', 'fr', 'w', 'h']

    return mandatory.every((field: string) =>
      Object.prototype.hasOwnProperty.call(json, field))
  }

  /**
   * Creates a new dotLottie file, by combinig several animations
   * @param { [ AnimationConfig ] } configs
   * @param { string } fileName
   * @param { boolean } shouldDownload Whether to trigger a download in the browser.
   * If set to false the function returns an ArrayBuffer. Defaults to true.
   *
   */
  public async addAnimation(
    configs: AnimationConfig[],
    fileName?: string,
    shouldDownload = true
  ) {
    // Initialize meta object for animation, with fallbacks for
    // when the method is called indepenently
    const {
      animations = [],
      manifest = {
        animations: this.src ? [{
          id: this._identifier,
        }] : []
      }
    } = this.src ? await getAnimationData(this.src) : {}
    try {
      manifest.generator = pkg.name
      for (const config of configs) {
        const { url } = config,
          { animations: animationsToAdd } = await getAnimationData(url)
        if (!animationsToAdd) {
          throw new Error('No animation loaded')
        }
        if (manifest.animations.some(({ id }) => id === config.id)) {
          throw new Error('Duplicate id for animation')
        }

        manifest.animations = [
          ...manifest.animations,
          { id: config.id }
        ]

        animations?.push(...animationsToAdd)
      }

      return createDotLottie({
        animations,
        manifest,
        fileName,
        shouldDownload
      })
    } catch (err) {
      console.error(handleErrors(err).message)
    }
  }

  /**
   * Returns the lottie-web instance used in the component
   */
  public getLottie() {
    return this._lottieInstance
  }

  /**
   * Play
   */
  public async play() {
    if (!this._lottieInstance) {
      return
    }
    if (this.playerState) {
      this._playerState.prev = this.playerState
    }

    try {
      this._lottieInstance.play()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Play))
    } finally {
      this.playerState = PlayerState.Playing
    }
  }

  /**
   * Pause
   */
  public pause() {
    if (!this._lottieInstance) {
      return
    }
    if (this.playerState) {
      this._playerState.prev = this.playerState
    }

    try {
      this._lottieInstance.pause()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Pause))
    } finally {
      this.playerState = PlayerState.Paused
    }
  }

  /**
   * Stop
   */
  public stop() {
    if (!this._lottieInstance) {
      return
    }
    if (this.playerState) {
      this._playerState.prev = this.playerState
    }
    this._playerState.count = 0

    try {
      this._lottieInstance.stop()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Stop))
    } finally {
      this.playerState = PlayerState.Stopped
    }
  }

  /**
   * Destroy animation and element
   */
  public destroy() {
    if (!this._lottieInstance) {
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
   * Seek to a given frame
   * @param { number | string } value Frame to seek to
   */
  public seek(value: number | string) {
    if (!this._lottieInstance) {
      return
    }

    // Extract frame number from either number or percentage value
    const matches = value.toString().match(/^([0-9]+)(%?)$/)
    if (!matches) {
      return
    }

    // Calculate and set the frame number
    const frame =
      Math.round(matches[2] === '%' ?
        (this._lottieInstance.totalFrames * Number(matches[1])) / 100 :
        Number(matches[1]))

    // Set seeker to new frame number
    this._seeker = frame

    // Send lottie player to the new frame
    if (
      this.playerState === PlayerState.Playing ||
      (this.playerState === PlayerState.Frozen &&
        this._playerState.prev === PlayerState.Playing)
    ) {
      this._lottieInstance.goToAndPlay(frame, true)
      this.playerState = PlayerState.Playing
      return
    }
    this._lottieInstance.goToAndStop(frame, true)
    this._lottieInstance.pause()
  }

  /**
   * Snapshot and download the current frame as SVG
   */
  public snapshot() {
    if (!this.shadowRoot || !this.src) {
      return
    }

    // Get SVG element and serialize markup
    const svgElement = this.shadowRoot.querySelector('.animation svg'),
      data =
        svgElement instanceof Node ?
          new XMLSerializer().serializeToString(svgElement) : null

    if (!data) {
      console.error('Could not serialize data')
      return
    }

    download(
      data,
      {
        name: `${getFilename(this.src)}-${frameOutput(this._seeker)}.svg`,
        mimeType: 'image/svg+xml'
      }
    )

    return data
  }

  /**
   * Toggles subframe, for more smooth animations
   * @param { boolean } value Whether animation uses subframe
   */
  public setSubframe(value: boolean) {
    if (!this._lottieInstance) {
      return
    }
    this.subframe = value
    this._lottieInstance.setSubframe(value)
  }

  /**
   * Dynamically set count for loops
   */
  public setCount(value: number) {
    if (!this._lottieInstance) {
      return
    }
    this.count = value
  }

  /**
   * Freeze animation.
   * This internal state pauses animation and is used to differentiate between
   * user requested pauses and component instigated pauses.
   */
  private _freeze() {
    if (!this._lottieInstance) {
      return
    }

    if (this.playerState) {
      this._playerState.prev = this.playerState
    }

    try {
      this._lottieInstance.pause()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Freeze))
    } finally {
      this.playerState = PlayerState.Frozen
    }
  }

  /**
   * Reload animation
   */
  public async reload() {
    if (!this._lottieInstance || !this.src) {
      return
    }

    this._lottieInstance.destroy()

    await this.load(this.src)
  }

  /**
   * Set animation playback speed
   * @param { number } value Playback speed
   */
  public setSpeed(value = 1) {
    if (!this._lottieInstance) {
      return
    }
    this.speed = value
    this._lottieInstance.setSpeed(value)
  }

  /**
   * Animation play direction
   * @param { AnimationDirection } value Animation direction
   */
  public setDirection(value: AnimationDirection) {
    if (!this._lottieInstance) {
      return
    }
    this.direction = value
    this._lottieInstance.setDirection(value)
  }

  /**
   * Set loop
   * @param { boolean } value
   */
  public setLooping(value: boolean) {
    if (!this._lottieInstance) {
      return
    }
    this.loop = value
    this._lottieInstance.setLoop(value)
  }

  /**
   * Set Multi-animation settings
   * @param { AnimationSettings[] } settings
   */
  public setMultiAnimationSettings(settings: AnimationSettings[]) {
    if (!this._lottieInstance) {
      return
    }
    this.multiAnimationSettings = settings
  }

  /**
   * Toggle playing state
   */
  public togglePlay() {
    if (!this._lottieInstance) {
      return
    }

    const { currentFrame, playDirection, totalFrames } = this._lottieInstance
    if (this.playerState === PlayerState.Playing) {
      return this.pause()
    }
    if (this.playerState !== PlayerState.Completed) {
      return this.play()
    }
    this.playerState = PlayerState.Playing
    if (this._isBounce) {
      this.setDirection(playDirection * -1 as AnimationDirection)
      return this._lottieInstance.goToAndPlay(currentFrame, true)
    }
    if (playDirection === -1) {
      return this._lottieInstance.goToAndPlay(totalFrames, true)
    }
    return this._lottieInstance.goToAndPlay(0, true)
  }

  /**
   * Toggle loop
   */
  public toggleLoop() {
    this.setLooping(!this.loop)
  }

  /**
   * Toggle Boomerang
   */
  public toggleBoomerang() {
    const curr = this.multiAnimationSettings?.[this._currentAnimation]

    if (curr?.mode !== undefined) {
      if (curr.mode === PlayMode.Normal) {
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
   * Toggle show Settings
   */
  private _toggleSettings(flag?: boolean) {
    if (flag === undefined) {
      this._isSettingsOpen = !this._isSettingsOpen
      return
    }
    this._isSettingsOpen = flag
  }

  /**
   * Handle settings click event
   */
  private _handleSettingsClick = ({ target }: Event) => {
    this._toggleSettings()
    // Because Safari does not add focus on click, we need to add it manually, so the onblur event will fire
    if (target instanceof HTMLElement) {
      target.focus()
    }
  }

  /**
   * Handle blur
   */
  private _handleBlur() {
    setTimeout(() => this._toggleSettings(false), 200)
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
      this._lottieInstance = Lottie.loadAnimation({
        ...this._getOptions(),
        animationData: this._animations[this._currentAnimation],
      })

      // Check play mode for current animation
      if (this.multiAnimationSettings?.[this._currentAnimation]?.mode) {
        this._isBounce =
          this.multiAnimationSettings[this._currentAnimation].mode === PlayMode.Bounce
      }

      // Remove event listeners to new Lottie instance, and add new
      this._removeEventListeners()
      this._addEventListeners()

      this.dispatchEvent(new CustomEvent(isPrevious ? PlayerEvents.Previous : PlayerEvents.Next))

      if (this.multiAnimationSettings?.[this._currentAnimation]?.autoplay ?? this.autoplay) {
        if (this.animateOnScroll) {
          this._lottieInstance?.goToAndStop(0, true)
          this.playerState = PlayerState.Paused
          return
        }

        this._lottieInstance?.goToAndPlay(0, true)
        this.playerState = PlayerState.Playing
        return
      }

      this._lottieInstance?.goToAndStop(0, true)
      this.playerState = PlayerState.Stopped
    } catch (err) {
      this._errorMessage = handleErrors(err).message

      this.playerState = PlayerState.Error

      this.dispatchEvent(new CustomEvent(PlayerEvents.Error))
    }
  }

  /**
   * Skip to next animation
   */
  public next() {
    this._currentAnimation++
    this._switchInstance()
  }

  /**
   * Skip to previous animation
   */
  public prev() {
    this._currentAnimation--
    this._switchInstance(true)
  }

  public async convert({
    typeCheck,
    manifest,
    animations,
    src,
    fileName,
    shouldDownload = true
  }: {
    /** External type safety */
    typeCheck?: boolean

    /** Externally added manifest */
    manifest?: LottieManifest

    /** Externally added animations */
    animations?: LottieJSON[]

    src?: string

    fileName?: string

    /** Whether to trigger a download in the browser. Defaults to true */
    shouldDownload?: boolean
  }) {

    if (typeCheck || this._isDotLottie) {
      return createJSON({
        animation: (await getAnimationData(src || this.src))?.animations?.[0],
        fileName: `${getFilename(fileName || this.src || 'converted')}.json`,
        shouldDownload
      })
    }

    return createDotLottie({
      animations: animations || (await getAnimationData(this.src))?.animations,
      manifest: {
        ...(manifest || this._manifest),
        generator: pkg.name
      },
      fileName: `${getFilename(fileName || this.src || 'converted')}.lottie`,
      shouldDownload
    })
  }

  /**
   * Return the styles for the component
   */
  static get styles() {
    const styleSheet = new CSSStyleSheet()
    styleSheet.replace(styles)
    return styleSheet
  }

  protected renderControls() {
    const slot = this.shadow.querySelector('slot[name=controls]')
    if (!slot) {
      return
    }

    slot.innerHTML = `
      <div
        class="lottie-controls toolbar ${this.playerState === PlayerState.Error ? 'has-error' : ''}"
        aria-label="Lottie Animation controls"
      >
        <button
          id="togglePlay"
          data-active="false"
          tabindex="0"
          aria-label="Toggle Play/Pause"
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
          </svg>
        </button>

         <button
          id="stop"
          data-active="true"
          tabindex="0"
          aria-label="Stop"
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M6 6h12v12H6V6z" />
          </svg>
        </button>
        <button
          id="prev"
          tabindex="0"
          aria-label="Previous animation"
          hidden
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M17.9 18.2 8.1 12l9.8-6.2v12.4zm-10.3 0H6.1V5.8h1.5v12.4z"/>
          </svg>
        </button>
        <button
          id="next"
          tabindex="0"
          aria-label="Next animation"
          hidden
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="m6.1 5.8 9.8 6.2-9.8 6.2V5.8zM16.4 5.8h1.5v12.4h-1.5z"/>
          </svg>
        </button>
        <form class="progress-container${this.simple ? ' simple' : ''}">
          <input
            id="seeker"
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
          <progress
            max="100"
            value="${this._seeker}"
          >
          </progress>
        </form>
        ${this.simple ? '' :
    `
        <button
          id="toggleLoop"
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
          id="toggleBoomerang"
          data-active="${this._isBounce}"
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
          id="toggleSettings"
          aria-label="Settings"
          aria-haspopup="true"
          aria-expanded="${!!this._isSettingsOpen}"
          aria-controls="${this._identifier}-settings"
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="5.4" r="2.5"/>
            <circle cx="12" cy="12" r="2.5"/>
            <circle cx="12" cy="18.6" r="2.5"/>
          </svg>
        </button>
        <div
          id="${this._identifier}-settings"
          class="popover"
          hidden
        >
          <button
            id="convert"
            aria-label="Convert JSON animation to dotLottie format"
            tabindex="0"
            hidden
          >
            <svg width="24" height="24" aria-hidden="true" focusable="false">
              <path
                d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z"
              />
            </svg> Convert to dotLottie
          </button>
          <button
            id="snapshot"
            aria-label="Download still image"
            tabindex="0"
          >
            <svg width="24" height="24" aria-hidden="true" focusable="false">
              <path
                d="M16.8 10.8 12 15.6l-4.8-4.8h3V3.6h3.6v7.2h3zM12 15.6H3v4.8h18v-4.8h-9zm7.8 2.4h-2.4v-1.2h2.4V18z"
              />
            </svg> Download still image
          </button>
        </div>`
}

      </div>
    `
  }

  protected render() {
    this.template.innerHTML = `
      <figure
        class="animation-container main"
        data-controls="${this.controls ?? false}"
        lang="${this.description ? document?.documentElement?.lang : 'en'}"
        role="img"
        aria-label="${this.description ?? 'Lottie animation'}"
        data-loaded="${this._playerState.loaded}"
      >
        <div
          class="animation"
          style="background:${this.background}"
        >
          ${this.playerState === PlayerState.Error ?
    `
        <div class="error">
          <svg
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            xml:space="preserve"
            width="1920"
            height="1080"
            viewBox="0 0 1920 1080"
          >
            <path fill="#fff" d="M0 0h1920v1080H0z"/>
            <path fill="#3a6d8b" d="M1190.2 531 1007 212.4c-22-38.2-77.2-38-98.8.5L729.5 531.3c-21.3 37.9 6.1 84.6 49.5 84.6l361.9.3c43.7 0 71.1-47.3 49.3-85.2zM937.3 288.7c.2-7.5 3.3-23.9 23.2-23.9 16.3 0 23 16.1 23 23.5 0 55.3-10.7 197.2-12.2 214.5-.1 1-.9 1.7-1.9 1.7h-18.3c-1 0-1.8-.7-1.9-1.7-1.4-17.5-13.4-162.9-11.9-214.1zm24.2 283.8c-13.1 0-23.7-10.6-23.7-23.7s10.6-23.7 23.7-23.7 23.7 10.6 23.7 23.7-10.6 23.7-23.7 23.7zM722.1 644h112.6v34.4h-70.4V698h58.8v31.7h-58.8v22.6h72.4v36.2H722.1V644zm162 57.1h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5h36.4v15.6zm78.9 0h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5H963v15.6zm39.5 36.2c0-31.3 22.2-54.8 56.6-54.8 34.4 0 56.2 23.5 56.2 54.8s-21.8 54.6-56.2 54.6c-34.4-.1-56.6-23.3-56.6-54.6zm74 0c0-17.4-6.1-29.1-17.8-29.1-11.7 0-17.4 11.7-17.4 29.1 0 17.4 5.7 29.1 17.4 29.1s17.8-11.8 17.8-29.1zm83.1-36.2h.6c8.3-12.9 18.2-17.8 31.3-17.8 3 0 5.1.4 6.3 1v32.6h-.8c-22.4-3.8-35.6 6.3-35.6 29.5v42.3h-38.2V685.5h36.4v15.6z"/>
            <path fill="none" d="M718.9 807.7h645v285.4h-645z"/>
            <text
              fill="#3a6d8b"
              style="text-align:center;position:absolute;left:100%;font-size:47px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'.SFNSText-Regular',sans-serif;"
              x="50%"
              y="848.017"
              text-anchor="middle"
            >${this._errorMessage}</text>
          </svg>
        </div>` : ''}
      </div>
      <slot name="controls"></slot>
    </figure>
    `

    this.shadow.adoptedStyleSheets = [DotLottiePlayer.styles]
    this.shadow.appendChild(this.template.content.cloneNode(true))
  }
}

export { PlayMode, PlayerEvents, PlayerState } from './utils'

/**
 * Expose DotLottiePlayer class as global variable
 * @returns { DotLottiePlayer }
 */
globalThis.dotLottiePlayer = (): DotLottiePlayer => new DotLottiePlayer()

export const tagName = 'dotlottie-player'

if (!isServer()) {
  customElements.define('dotlottie-player', DotLottiePlayer)
}