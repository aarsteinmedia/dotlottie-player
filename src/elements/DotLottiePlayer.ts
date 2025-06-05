import Lottie, {
  type AnimationConfiguration,
  type AnimationData,
  type AnimationDirection,
  type AnimationItem,
  type AnimationSettings,
  type LottieManifest,
  type Vector2,
} from '@aarsteinmedia/lottie-web'
import { createElementID, isServer } from '@aarsteinmedia/lottie-web/utils'

import type {
  AnimationAttributes,
  AnimateOnScroll,
  Autoplay,
  Controls,
  Loop,
  Subframe,
  ConvertParams,
} from '@/types'

import PropertyCallbackElement from '@/elements/helpers/PropertyCallbackElement'
import styles from '@/styles.css'
import renderControls from '@/templates/controls'
import renderPlayer from '@/templates/player'
import {
  aspectRatio,
  download,
  frameOutput,
  getFilename,
  handleErrors
} from '@/utils'
import createDotLottie from '@/utils/createDotLottie'
import createJSON from '@/utils/createJSON'
import {
  ObjectFit,
  PlayMode,
  PlayerEvents,
  PlayerState,
  PreserveAspectRatio,
  RendererType,
} from '@/utils/enums'
import getAnimationData from '@/utils/getAnimationData'

const generator = '@aarsteinmedia/dotlottie-player'

/**
 * DotLottie Player Web Component.
 */
export default class DotLottiePlayer extends PropertyCallbackElement {
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
      'mode',
      'speed',
      'src',
      'subframe',
    ]
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

  /**
   * Player state.
   */
  public playerState: PlayerState = PlayerState.Loading
  public shadow: ShadowRoot | undefined

  /**
   * Store source for later use, when player is loaded programatically.
   */
  public source?: string
  public template: HTMLTemplateElement

  /**
   * Whether to trigger next frame with scroll.
   */
  set animateOnScroll(value: AnimateOnScroll) {
    this.setAttribute('animateOnScroll', Boolean(value).toString())
  }

  get animateOnScroll() {
    const val = this.getAttribute('animateOnScroll')

    return Boolean(val === 'true' || val === '' || val === '1')
  }

  /**
   * Autoplay.
   */
  set autoplay(value: Autoplay) {
    this.setAttribute('autoplay', Boolean(value).toString())
  }

  get autoplay() {
    const val = this.getAttribute('autoplay')

    return Boolean(val === 'true' || val === '' || val === '1')
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
  set controls(value: Controls) {
    this.setAttribute('controls', Boolean(value).toString())
  }

  get controls() {
    const val = this.getAttribute('controls')

    return Boolean(val === 'true' || val === '' || val === '1')
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
   * Whether to play on mouseover.
   */
  set hover(value: boolean) {
    this.setAttribute('hover', value.toString())
  }

  get hover() {
    const val = this.getAttribute('hover')

    return Boolean(val === 'true' || val === '' || val === '1')
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

  /**
   * Loop animation.
   */
  set loop(value: Loop) {
    this.setAttribute('loop', Boolean(value).toString())
  }

  get loop() {
    const val = this.getAttribute('loop')

    return Boolean(val === 'true' || val === '' || val === '1')
  }

  /**
   * Play mode.
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
   * Hide advanced controls.
   */
  set simple(value: boolean) {
    this.setAttribute('simple', value.toString())
  }

  get simple() {
    const val = this.getAttribute('simple')

    return Boolean(val === 'true' || val === '' || val === '1')
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
  set subframe(value: Subframe) {
    this.setAttribute('subframe', Boolean(value).toString())
  }

  get subframe() {
    const val = this.getAttribute('subframe')

    return Boolean(val === 'true' || val === '' || val === '1')
  }

  /**
   * Animation Container.
   */
  protected _container: HTMLElement | null = null

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
  private _intersectionObserver?: IntersectionObserver
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
    this._renderControls = this._renderControls.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.toggleLoop = this.toggleLoop.bind(this)
    this.toggleBoomerang = this.toggleBoomerang.bind(this)

    this.convert = this.convert.bind(this)
    this.destroy = this.destroy.bind(this)


    this.template = document.createElement('template')
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  /**
   * Creates a new dotLottie file, by combinig several animations.
   * If set to false the function returns an ArrayBuffer. Defaults to true.
   */
  public async addAnimation(
    configs: AnimationAttributes[],
    fileName?: string,
    shouldDownload = true
  ): Promise<{
      result?: null | ArrayBuffer
      success: boolean
      error?: string
    }> {
    // Initialize meta object for animation, with fallbacks for
    // when the method is called indepenently
    const {
      animations = [],
      manifest = {
        animations: this.src
          ? [
            { id: this._identifier },
          ]
          : [],
      },
    } = this.src ? await getAnimationData(this.src) : {}

    try {
      if (!manifest) {
        throw new Error('Manifest is not set')
      }
      manifest.generator = generator
      const { length } = configs

      for (let i = 0; i < length; i++) {
        const { url } = configs[i],
          { animations: animationsToAdd } = await getAnimationData(url)

        if (!animationsToAdd) {
          throw new Error('No animation loaded')
        }
        if (manifest.animations.some(({ id }) => id === configs[i].id)) {
          throw new Error('Duplicate id for animation')
        }

        manifest.animations = [...manifest.animations, { id: configs[i].id }]

        animations.push(...animationsToAdd)
      }

      return {
        result: await createDotLottie({
          animations,
          fileName,
          manifest,
          shouldDownload,
        }),
        success: true,
      }
    } catch (error) {
      return {
        error: handleErrors(error).message,
        success: false,
      }
    }
  }

  /**
   * Runs when the value of an attribute is changed on the component.
   */
  async attributeChangedCallback(
    name: string,
    _oldValue: unknown,
    value: string
  ) {
    if (!this._lottieInstance || !this.shadow) {
      return
    }

    if (name === 'animateOnScroll') {
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
    }

    if (name === 'autoplay') {
      if (this.animateOnScroll) {
        return
      }
      if (value === '' || Boolean(value)) {
        this.play()

        return
      }
      this.stop()
    }

    if (name === 'controls') {
      this._renderControls()
    }

    if (name === 'direction') {
      if (Number(value) === -1) {
        this.setDirection(-1)

        return
      }
      this.setDirection(1)
    }

    if (name === 'hover' && this._container) {
      if (value === '' || Boolean(value)) {
        this._container.addEventListener('mouseenter', this._mouseEnter)
        this._container.addEventListener('mouseleave', this._mouseLeave)

        return
      }
      this._container.removeEventListener('mouseenter', this._mouseEnter)
      this._container.removeEventListener('mouseleave', this._mouseLeave)
    }

    if (name === 'loop') {
      const toggleLoop = this.shadow.querySelector('.toggleLoop')

      if (toggleLoop instanceof HTMLButtonElement) {
        toggleLoop.dataset.active = value
      }
      this.setLoop(value === '' || Boolean(value))
    }

    if (name === 'mode') {
      const toggleBoomerang = this.shadow.querySelector('.toggleBoomerang')

      if (toggleBoomerang instanceof HTMLButtonElement) {
        toggleBoomerang.dataset.active = (value as PlayMode === PlayMode.Bounce).toString()
      }
      this._isBounce = value as PlayMode === PlayMode.Bounce
    }

    if (name === 'speed') {
      const val = Number(value)

      if (val && !isNaN(val)) {
        this.setSpeed(val)
      }
    }

    if (name === 'src') {
      await this.load(value)
    }

    if (name === 'subframe') {
      this.setSubframe(value === '' || Boolean(value))
    }
  }

  /**
   * Initialize everything on component first render.
   */
  override async connectedCallback() {
    await super.connectedCallback()
    await this._render()

    if (!this.shadow) {
      throw new Error('Missing Shadow element')
    }

    this._container = this.shadow.querySelector('.animation')
    this._renderControls()

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

  public async convert({
    animations: animationsFromProps,
    fileName,
    manifest,
    shouldDownload = true,
    src: srcFromProps,
    typeCheck,
  }: ConvertParams) {
    const src = srcFromProps || this.src || this.source

    if (!src && !animationsFromProps?.length) {
      throw new Error('No animation to convert')
    }

    let animations = animationsFromProps

    if (!animations) {
      const animationData = await getAnimationData(src)

      animations = animationData.animations
    }

    if (typeCheck || this._isDotLottie) {

      return createJSON({
        animation: animations?.[0],
        fileName: `${getFilename(fileName || src || 'converted')}.json`,
        shouldDownload,
      })
    }

    return createDotLottie({
      animations,
      fileName: `${getFilename(fileName || src || 'converted')}.lottie`,
      manifest: {
        ...manifest ?? this._manifest,
        generator,
      } as LottieManifest,
      shouldDownload,
    })
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
   *
   */
  public getMultiAnimationSettings() {
    return this._multiAnimationSettings
  }

  /**
   * Get playback segment.
   *
   */
  public getSegment() {
    return this._segment
  }

  /**
   * Initialize Lottie Web player.
   */
  public async load(src: string | null) {
    if (!this.shadowRoot || !src) {
      return
    }

    this.source = src

    // Load the resource
    try {
      const {
        animations, isDotLottie, manifest
      } = await getAnimationData(src)

      if (
        !animations ||
        animations.some((animation) => !this._isLottie(animation))
      ) {
        throw new Error('Broken or corrupted file')
      }

      this._isBounce = this.mode === PlayMode.Bounce
      if (this._multiAnimationSettings.length > 0 && this._multiAnimationSettings[this._currentAnimation]?.mode) {
        this._isBounce =
          this._multiAnimationSettings[this._currentAnimation].mode as PlayMode ===
          PlayMode.Bounce
      }

      if (manifest?.animations.length === 1) {
        manifest.animations[0].autoplay = this.autoplay
        manifest.animations[0].loop = this.loop
      }

      this._isDotLottie = Boolean(isDotLottie)
      this._animations = animations
      this._manifest = manifest ?? {
        animations: [
          {
            autoplay: !this.animateOnScroll && this.autoplay,
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
        (this.autoplay ||
          this._multiAnimationSettings[this._currentAnimation]?.autoplay)
      ) {
        this.playerState = PlayerState.Playing
      }

      // Initialize lottie player and load animation
      this._lottieInstance = Lottie.loadAnimation({
        ...this._getOptions(),
        animationData: animations[this._currentAnimation],
      })
    } catch (error) {
      this._errorMessage = handleErrors(error).message

      this.playerState = PlayerState.Error

      this.dispatchEvent(new CustomEvent(PlayerEvents.Error))

      return
    }

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

    try {
      this._lottieInstance.pause()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Pause))
    } finally {
      this.playerState = PlayerState.Paused
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

    try {
      this._lottieInstance.play()
      this.dispatchEvent(new CustomEvent(PlayerEvents.Play))
    } finally {
      this.playerState = PlayerState.Playing
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
      stop = this.shadow.querySelector('.stop'),
      prev = this.shadow.querySelector('.prev'),
      next = this.shadow.querySelector('.next'),
      seeker = this.shadow.querySelector('.seeker'),
      progress = this.shadow.querySelector('progress'),
      popover = this.shadow.querySelector('.popover'),
      convert = this.shadow.querySelector('.convert'),
      snapshot = this.shadow.querySelector('.snapshot')

    if (
      !(togglePlay instanceof HTMLButtonElement) ||
      !(stop instanceof HTMLButtonElement) ||
      !(next instanceof HTMLButtonElement) ||
      !(prev instanceof HTMLButtonElement) ||
      !(seeker instanceof HTMLInputElement) ||
      !(progress instanceof HTMLProgressElement)
    ) {
      return
    }

    if (name === 'playerState') {
      togglePlay.dataset.active = (
        value === PlayerState.Playing || value === PlayerState.Paused
      ).toString()
      stop.dataset.active = (value === PlayerState.Stopped).toString()

      if (value === PlayerState.Playing) {
        togglePlay.innerHTML = /* HTML */ `
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path
              d="M14.016 5.016H18v13.969h-3.984V5.016zM6 18.984V5.015h3.984v13.969H6z"
            />
          </svg>
        `
      } else {
        togglePlay.innerHTML = /* HTML */ `
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
          </svg>
        `
      }
    }

    if (name === '_seeker' && typeof value === 'number') {
      seeker.value = value.toString()
      seeker.ariaValueNow = value.toString()
      progress.value = value
    }

    if (name === '_animations' && Array.isArray(value) && this._currentAnimation + 1 < value.length) {
      next.hidden = false
    }

    if (name === '_currentAnimation' && typeof value === 'number') {
      next.hidden = value + 1 >= this._animations.length
      prev.hidden = !value
    }

    if (
      name === '_isSettingsOpen' &&
      typeof value === 'boolean' &&
      popover instanceof HTMLDivElement &&
      convert instanceof HTMLButtonElement &&
      snapshot instanceof HTMLButtonElement
    ) {
      popover.hidden = !value
      convert.hidden = false
      snapshot.hidden = this.renderer !== RendererType.SVG

      if (this._isDotLottie) {
        convert.ariaLabel = 'Convert dotLottie to JSON'
        convert.innerHTML = convert.innerHTML.replace('dotLottie', 'JSON')
      } else {
        convert.ariaLabel = 'Convert JSON animation to dotLottie format'
        convert.innerHTML = convert.innerHTML.replace('JSON', 'dotLottie')
      }
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
   *
   */
  public setMultiAnimationSettings(settings: AnimationSettings[]) {
    this._multiAnimationSettings = settings
  }

  /**
   * Set playback segment.
   *
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
    const curr = this._multiAnimationSettings[this._currentAnimation]

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
   * Handles click and drag actions on the progress track.
   *
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
  protected _handleSettingsClick = ({ target }: Event) => {
    this._toggleSettings()
    // Because Safari does not add focus on click, we need to add it manually, so the onblur event will fire
    if (target instanceof HTMLElement) {
      target.focus()
    }
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
      this._intersectionObserver ||
      !('IntersectionObserver' in window)
    ) {
      return
    }

    this._intersectionObserver = new IntersectionObserver((entries) => {
      const { length } = entries

      for (let i = 0; i < length; i++) {
        if (!entries[i].isIntersecting || document.hidden) {
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
   *
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

    const options: AnimationConfiguration<
      RendererType.SVG | RendererType.Canvas | RendererType.HTML
    > = {
      autoplay: hasAutoplay,
      container: this._container,
      initialSegment,
      loop: hasLoop,
      renderer: this.renderer,
      rendererSettings: { imagePreserveAspectRatio: preserveAspectRatio },
    }

    switch (this.renderer) {
      case RendererType.SVG: {
        options.rendererSettings = {
          ...options.rendererSettings,
          hideOnTransparent: true,
          preserveAspectRatio,
          progressiveLoad: true,
        }
        break
      }
      case RendererType.Canvas: {
        options.rendererSettings = {
          ...options.rendererSettings,
          // @ts-expect-error TODO:
          clearCanvas: true,
          preserveAspectRatio,
          progressiveLoad: true,
        }
        break
      }
      case RendererType.HTML: {
        options.rendererSettings = {
          ...options.rendererSettings,
          hideOnTransparent: true,
        }
      }
    }

    return options
  }

  /**
   * Handle scroll.
   */
  private _handleScroll() {
    if (!this.animateOnScroll || !this._lottieInstance) {
      return
    }
    if (isServer()) {
      console.warn('DotLottie: Scroll animations might not work properly in a Server Side Rendering context. Try to wrap this in a client component.')

      return
    }
    if (this._playerState.visible) {
      if (this._playerState.scrollTimeout) {
        clearTimeout(this._playerState.scrollTimeout)
      }
      this._playerState.scrollTimeout = setTimeout(() => {
        this.playerState = PlayerState.Paused
      }, 400)

      const adjustedScroll =
        scrollY > this._playerState.scrollY
          ? scrollY - this._playerState.scrollY
          : this._playerState.scrollY - scrollY,
        clampedScroll = Math.min(Math.max(adjustedScroll / 3, 1),
          this._lottieInstance.totalFrames * 3),
        roundedScroll = clampedScroll / 3

      requestAnimationFrame(() => {
        if (roundedScroll < (this._lottieInstance?.totalFrames ?? 0)) {
          this.playerState = PlayerState.Playing
          this._lottieInstance?.goToAndStop(roundedScroll, true)
        } else {
          this.playerState = PlayerState.Paused
        }
      })
    }
  }

  private _handleWindowBlur({ type }: FocusEvent) {
    if (this.playerState === PlayerState.Playing && type === 'blur') {
      this._freeze()
    }
    if (this.playerState === PlayerState.Frozen && type === 'focus') {
      this.play()
    }
  }

  private _isLottie(json: AnimationData) {
    const mandatory = [
      'v',
      'ip',
      'op',
      'layers',
      'fr',
      'w',
      'h'
    ]

    return mandatory.every((field: string) =>
      Object.hasOwn(json, field))
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
    if (this.hover && this.playerState !== PlayerState.Playing) {
      this.play()
    }
  }

  /**
   * Handle MouseLeave.
   */
  private _mouseLeave() {
    if (this.hover && this.playerState === PlayerState.Playing) {
      this.stop()
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
      this._lottieInstance = Lottie.loadAnimation({
        ...this._getOptions(),
        animationData: this._animations[this._currentAnimation],
      })
      // Check play mode for current animation
      if (this._multiAnimationSettings[this._currentAnimation]?.mode) {
        this._isBounce =
          this._multiAnimationSettings[this._currentAnimation].mode as PlayMode ===
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

    if (this._container && this.hover) {
      this._container[method]('mouseenter', this._mouseEnter)
      this._container[method]('mouseleave', this._mouseLeave)
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
