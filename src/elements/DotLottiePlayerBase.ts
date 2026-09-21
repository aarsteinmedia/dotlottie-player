import type {
  AddAnimationParams,
  AnimationConfiguration,
  AnimationDirection,
  AnimationItem,
  AnimationSettings,
  ConvertParams,
  LottieManifest,
  Result,
  Vector2,
} from '@aarsteinmedia/lottie-web'

import { getAnimationData } from '@aarsteinmedia/lottie-web/dotlottie'
import {
  createElementID,
  download,
  getFilename,
  RendererType,
  PlayerEvent,
  PlayMode,
  type PreserveAspectRatio,
} from '@aarsteinmedia/lottie-web/utils'

import type { Settings } from '@/types'

import { loadControlsModule } from '@/elements/helpers/controlsLoader'
import { loadErrorModule } from '@/elements/helpers/errorLoader'
import { ScrollElement } from '@/elements/helpers/ScrollElement'
import { updatePlayPauseButton } from '@/templates/controls'
import { renderPlayer } from '@/templates/player'
import {
  aspectRatio,
  frameOutput,
  handleErrors,
  isEnum,
  isLottie,
  isTouch,
} from '@/utils'
import { hasReducedMotion } from '@/utils/constants'
import {
  MouseOut,
  type ObjectFit,
  PlayerState,
} from '@/utils/enums'

const notImplemented = 'Method is not implemented'

export { RendererType }

/**
 * DotLottie Player Web Component.
 */
export abstract class DotLottiePlayerBase extends ScrollElement {

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
    ] as const
  }

  public isLight = false

  public shadow: ShadowRoot | undefined
  /**
   * Store source for later use, when player is loaded programmatically.
   */
  public source?: string

  public template?: HTMLTemplateElement

  public get isDotLottie() {
    return this._isDotLottie
  }

  /**
   * Whether settings toolbar is open.
   */
  protected _isSettingsOpen = false

  protected _render = renderPlayer

  /**
   * Seeker.
   */
  protected _seeker = 0

  private _controlsLoadId = 0

  private _errorLoadId = 0

  private _isBounce = false
  private _isDotLottie = false

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
    this._handleSeekChange = this._handleSeekChange.bind(this)
    this._handleWindowBlur = this._handleWindowBlur.bind(this)
    this._loopComplete = this._loopComplete.bind(this)
    this._mouseEnter = this._mouseEnter.bind(this)
    this._mouseLeave = this._mouseLeave.bind(this)
    this._onVisibilityChange = this._onVisibilityChange.bind(this)
    this.scrollLoop = this.scrollLoop.bind(this)
    // this.startScrollLoop = this.startScrollLoop.bind(this)
    this._switchInstance = this._switchInstance.bind(this)
    this._handleSettingsClick = this._handleSettingsClick.bind(this)

    this.togglePlay = this.togglePlay.bind(this)
    this.stop = this.stop.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
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

    this.clearDevLog()

    switch (name) {
      case 'animateOnScroll': {
        if (value === '' || Boolean(value)) {
          this._lottieInstance.autoplay = false

          if (this.isIntersecting) {
            this.startScrollLoop()
          }

          return
        }
        this.stopScrollLoop()
        break
      }

      case 'autoplay': {
        if (this.animateOnScroll || this.playOnVisible || hasReducedMotion) {
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
        await this._renderControls()
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

        if (!isEnum(value, PlayMode)) {
          break
        }

        if (toggleBoomerang instanceof HTMLButtonElement) {
          toggleBoomerang.dataset.active = (value === PlayMode.Bounce).toString()
        }
        this._isBounce = value === PlayMode.Bounce
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
    void (async () => {
      try {
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

        // Add intersection observer for detecting component being out-of-view.
        this._addIntersectionObserver()

        this.dispatchEvent(new CustomEvent(PlayerEvent.Rendered))
      } catch (error) {
        void this._handleError(error)
      }
    })()
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

    this.cancelScrollProbe()

    this.playerState = PlayerState.Destroyed

    this._lottieInstance.destroy()
    this._lottieInstance = null

    this.stopScrollLoop()

    this.dispatchEvent(new CustomEvent(PlayerEvent.Destroyed))
    this.remove()

    document.removeEventListener('visibilitychange', this._onVisibilityChange)
  }

  /**
   * Cleanup on component destroy.
   */
  disconnectedCallback() {
    this.cancelIntersectionObserver()

    this.cancelScrollProbe()

    if (this._playerState.scrollLoopId) {
      cancelAnimationFrame(this._playerState.scrollLoopId)
    }

    if (this._playerState.playTimeout) {
      clearTimeout(this._playerState.playTimeout)
    }

    // Remove the attached Visibility API's change event listener
    document.removeEventListener('visibilitychange', this._onVisibilityChange)

    // Destroy the animation instance
    this.destroy()

    this.clearDevLog()
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

      if (!animations?.every(isLottie)) {
        throw new Error('Broken or corrupted file')
      }

      this._handleLdScript()

      this._isBounce = this.mode === PlayMode.Bounce
      if (this._multiAnimationSettings.length > 0 && this._multiAnimationSettings[this._currentAnimation]?.mode) {
        this._isBounce =
          this._multiAnimationSettings[this._currentAnimation]?.mode ===
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
      this._clearPrevious()

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

      // Set progress on load if AnimateOnScroll
      if (this.animateOnScroll) {
        this.applyScrollProgress()
      }

      // Start playing if autoplay is enabled
      if (
        (this.autoplay ||
          this.animateOnScroll ||
          this.playOnVisible) &&
          this.direction === -1
      ) {
        this.seek('99%')
      }

      await this._renderControls()

    } catch (error) {
      await this._handleError(error)
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
      this.dispatchEvent(new CustomEvent(PlayerEvent.Pause))
    } catch(error) {
      hasError = true
      this.devLog(error)
    } finally {
      this.playerState = hasError ? PlayerState.Error : PlayerState.Paused
    }
  }

  /**
   * Play.
   */
  public override play() {
    if (!this._lottieInstance) {
      return
    }
    this._playerState.prev = this.playerState

    let hasError = false

    try {
      this._lottieInstance.play()

      this.dispatchEvent(new CustomEvent(PlayerEvent.Play))
    } catch(error) {
      hasError = true
      this.devLog(error)
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
      updatePlayPauseButton(togglePlay, value as PlayerState)

      stopButton.dataset.active = (value === PlayerState.Stopped).toString()
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
    const matches = RegExp(/^(\d+)(%?)$/).exec(value.toString())

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
      this.devLog(error)

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
      this.dispatchEvent(new CustomEvent(PlayerEvent.Stop))
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
  protected override _freeze() {
    if (!this._lottieInstance) {
      return
    }

    this._playerState.prev = this.playerState

    try {
      this._lottieInstance.pause()
      this.dispatchEvent(new CustomEvent(PlayerEvent.Freeze))
    } finally {
      this.playerState = PlayerState.Frozen
    }
  }

  /**
   * Handle blur.
   */
  protected _handleBlur() {
    const blurTimeout = setTimeout(() => {
      this._toggleSettings(false)
    }, 200)

    if (!this._isSettingsOpen) {
      clearTimeout(blurTimeout)
    }
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

  protected _renderControls = async () => {
    const slot = this.shadow?.querySelector('slot[name=controls]')

    if (!slot) {
      return
    }

    if (!this.controls) {
      slot.innerHTML = ''

      return
    }

    const loadId = ++this._controlsLoadId,
      { renderControls } = await loadControlsModule()

    if (loadId !== this._controlsLoadId) {
      return
    }

    renderControls.call(this)
  }

  protected async _showError() {
    if (this.playerState !== PlayerState.Error) {
      return
    }

    const figure = this.shadow?.querySelector('.animation'),

      /**
       * Hide controls if visible.
       */
      controlSlot = this.shadow?.querySelector('slot[name=controls]')

    if (controlSlot) {
      controlSlot.innerHTML = ''
    }

    if (!(figure instanceof HTMLElement)) {
      return
    }

    const loadId = ++this._errorLoadId,
      { errorScreen } = await loadErrorModule()

    if (loadId !== this._errorLoadId) {
      return
    }

    figure.innerHTML = errorScreen(this._errorMessage)
  }

  protected setOptions(_options: {
    container?: undefined | HTMLElement
    rendererType: RendererType
    initialSegment?: undefined | Vector2
    hasAutoplay: boolean
    hasLoop: boolean
    preserveAspectRatio: PreserveAspectRatio
  }): AnimationConfiguration {
    throw new Error('Method not implemented')
  }

  /**
   * Add event listeners.
   */
  private _addEventListeners() {
    this._toggleEventListeners('add')
  }

  private _clearPrevious() {
    this._lottieInstance?.destroy()

    const figure = this.shadow?.querySelector('.animation')

    if (figure) {
      figure.innerHTML = ''
    }
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

    this.dispatchEvent(new CustomEvent(PlayerEvent.Complete, {
      detail: {
        frame: currentFrame,
        seeker: this._seeker,
      },
    }))
  }

  private _dataFailed() {
    this.playerState = PlayerState.Error
    this.dispatchEvent(new CustomEvent(PlayerEvent.Error))
  }

  private _dataReady() {
    this.dispatchEvent(new CustomEvent(PlayerEvent.Load))
  }

  private _DOMLoaded() {
    this.dispatchEvent(new CustomEvent(PlayerEvent.Ready))
  }

  private _enterFrame() {
    if (!this._lottieInstance) {
      return
    }
    const { currentFrame, totalFrames } = this._lottieInstance

    this._seeker = Math.round(currentFrame / totalFrames * 100)

    this.dispatchEvent(new CustomEvent(PlayerEvent.Frame, {
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
    // Disable autoplay on reduced-motion.
    if (this.animateOnScroll || hasReducedMotion) {
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

  private async _handleError(error: unknown) {
    this.playerState = PlayerState.Error

    if (!this.quiet) {
      this._errorMessage = handleErrors(error).message
      await this._showError()
    }

    this.dispatchEvent(new CustomEvent(PlayerEvent.Error))

    this.devLog(error)
  }

  private _handleLdScript() {
    const ldScript = this.parentElement?.querySelector('script[type="application/ld+json"]')

    if (!ldScript) {
      return
    }
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

  private _handleSelector(method: 'addEventListener' | 'removeEventListener') {
    if (!this.selector) {
      return
    }
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
      outPoint = this._segment ? this._segment[1] : totalFrames

    if (this.count) {
      if (this._isBounce) {
        this._playerState.count += 0.5
      } else {
        this._playerState.count += 1
      }

      if (this._playerState.count >= this.count) {
        this.setLoop(false)

        this.playerState = PlayerState.Completed
        this.dispatchEvent(new CustomEvent(PlayerEvent.Complete))

        return
      }
    }

    this.dispatchEvent(new CustomEvent(PlayerEvent.Loop))

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
    if (!this.hover || !this._lottieInstance || isTouch() || hasReducedMotion) {
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
    if (!this.hover || !this._lottieInstance || isTouch() || hasReducedMotion) {
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
    if (this.autoplay && hasReducedMotion) {
      return
    }

    if (
      document.hidden &&
      this.playerState === PlayerState.Playing
    ) {
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
      this._lottieInstance?.destroy()
      this.cancelScrollProbe()

      // Re-initialize lottie player
      this._lottieInstance = this.loadAnimation({
        ...this._getOptions(),
        animationData: this._animations[this._currentAnimation],
      })
      // Check play mode for current animation
      if (this._multiAnimationSettings[this._currentAnimation]?.mode) {
        this._isBounce =
          this._multiAnimationSettings[this._currentAnimation]?.mode ===
          PlayMode.Bounce
      }

      // Remove event listeners to new Lottie instance, and add new
      this._removeEventListeners()
      this._addEventListeners()

      this.dispatchEvent(new CustomEvent(isPrevious ? PlayerEvent.Previous : PlayerEvent.Next))

      if (
        this._multiAnimationSettings[this._currentAnimation]?.autoplay ??
        this.autoplay
      ) {
        if (this.animateOnScroll) {

          // Get instant scroll position
          this.applyScrollProgress()

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

      this.dispatchEvent(new CustomEvent(PlayerEvent.Error))
    }
  }

  /**
   * Toggle event listeners.
   */
  private _toggleEventListeners(action: 'add' | 'remove') {
    const method = action === 'add' ? 'addEventListener' : 'removeEventListener'

    if (this._lottieInstance) {
      this._lottieInstance[method](PlayerEvent.EnterFrame, this._enterFrame)
      this._lottieInstance[method](PlayerEvent.Complete, this._complete)
      this._lottieInstance[method](PlayerEvent.LoopComplete, this._loopComplete)
      this._lottieInstance[method](PlayerEvent.DOMLoaded, this._DOMLoaded)
      this._lottieInstance[method](PlayerEvent.DataReady, this._dataReady)
      this._lottieInstance[method](PlayerEvent.DataFailed, this._dataFailed)
    }

    this._handleSelector(method)

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
