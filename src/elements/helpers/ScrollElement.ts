import { clamp, isServer } from '@aarsteinmedia/lottie-web/utils'

import { PlayerState } from '@/canvas'
import { BaseElement } from '@/elements/helpers/BaseElement'
import {
  hasIOSupport, hasReducedMotion, hasVTSupport
} from '@/utils/constants'

export abstract class ScrollElement extends BaseElement {

  public isIntersecting = false

  private _intersectionObserver?: undefined | IntersectionObserver
  private _scrollProbe?: Animation | undefined

  public applyScrollProgress() {
    if (!this.animateOnScroll || !this._lottieInstance) {
      return
    }

    const progress = this._getScrollProgress()

    if (progress === null) {
      return
    }

    const { totalFrames } = this._lottieInstance,
      frame = progress * (totalFrames - 1),
      epsilon = this.subframe ? 0.1 : 0.5

    if (Math.abs(frame - this._playerState.frame) < epsilon) {
      return
    }

    this._playerState.frame = frame
    this._lottieInstance.goToAndStop(frame, true)
  }

  public cancelIntersectionObserver() {
    // Remove intersection observer for detecting component being out-of-view
    this._intersectionObserver?.disconnect()
    this._intersectionObserver = undefined
  }

  public cancelScrollProbe() {
    this._scrollProbe?.cancel()
    this._scrollProbe = undefined
  }

  public scrollLoop() {
    this._playerState.scrollLoopId = requestAnimationFrame(this.scrollLoop)
    this.applyScrollProgress()
  }

  public startScrollLoop() {
    if (isServer) {
      this.devLog('DotLottie: Scroll animations will not work in a Server Side Rendering context. Try to wrap this in a client component.')

      return
    }

    this._playerState.scrollLoopId ??= requestAnimationFrame(this.scrollLoop)
  }

  public stopScrollLoop() {
    if (this._playerState.scrollLoopId === undefined) {
      return
    }

    cancelAnimationFrame(this._playerState.scrollLoopId)
    this._playerState.scrollLoopId = undefined

    this.applyScrollProgress()
  }

  /**
   * Add IntersectionObserver.
   */
  protected _addIntersectionObserver() {
    if (
      !this._container ||
      this._intersectionObserver ||
      !hasIOSupport
    ) {
      return
    }

    this._intersectionObserver = new IntersectionObserver(([{ isIntersecting }]) => {
      this.isIntersecting = isIntersecting

      // Prevent animate on scroll for users with who prefers reduces motion.
      if (this.animateOnScroll && !hasReducedMotion) {
        if (isIntersecting) {
          this.startScrollLoop()
        } else {
          this.stopScrollLoop()
        }

        return
      }

      if (!isIntersecting || document.hidden) {
        if (this.playerState === PlayerState.Playing) {
          this._freeze()
        }

        return
      }
      if (
        !this.playOnVisible &&
        this.playerState === PlayerState.Frozen &&
        !(this.autoplay && hasReducedMotion)
      ) {
        this.play()
      }

      if (!this.playOnVisible || hasReducedMotion) {
        return
      }
      if (
        this.playerState === PlayerState.Completed &&
        !this.once
      ) {
        this.playerState = PlayerState.Playing
        this._lottieInstance?.goToAndPlay(this.direction === 1 ? 0 : this._lottieInstance.totalFrames)

        return
      }
      this._playerState.playTimeout = setTimeout(() => {
        this.play()
      }, this.delay)

      if (this.playerState === PlayerState.Playing) {
        clearTimeout(this._playerState.playTimeout)
      }
    })

    this._observeIntersectionTarget()
  }

  private _canDriveTimeline({ source }: ViewTimeline) {
    if (!source || source === document.scrollingElement) {
      return true
    }

    return getComputedStyle(source).overflowY !== 'hidden' &&
      source.scrollHeight > source.clientHeight
  }

  private _getGeometricScrollProgress() {
    if (!this._container) {
      return null
    }

    const { height, top } = this._container.getBoundingClientRect(),
      viewport = visualViewport?.height ?? innerHeight

    return clamp(
      (viewport - top) / (viewport + height), 0, 1
    )
  }

  private _getScrollProgress() {
    if (!this._container) {
      return null
    }

    if (!hasVTSupport) {
      return this._getGeometricScrollProgress()
    }

    const timeline = new ViewTimeline({
        axis: 'block',
        subject: this._container
      }),
      canDriveTimeline = this._canDriveTimeline(timeline)

    if (!canDriveTimeline) {
      this.devLog('[dotlottie-player] animateOnScroll: the player\'s nearest scrolling ancestor cannot ' +
        'scroll, so its ViewTimeline would never advance. This is almost always an ancestor ' +
        'with `overflow: hidden` — use `overflow: clip` instead. Falling back to viewport ' +
        'measurement.')

      return this._getGeometricScrollProgress()
    }

    this._scrollProbe ??= this._container.animate({ '--dotlottie-scroll': [0, 1] }, {
      fill: 'both',
      rangeEnd: 'cover 100%',
      rangeStart: 'cover 0%',
      timeline
    })

    return this._scrollProbe.effect?.getComputedTiming().progress ?? null
  }

  private _observeIntersectionTarget() {
    if (!this._intersectionObserver || !this._container) {
      return
    }

    this._intersectionObserver.disconnect()
    // Observing the host is more reliable than inner shadow nodes when ancestors
    // use overflow-* (IO / layout interaction quirks).
    this._intersectionObserver.observe(this._container)
  }
}
