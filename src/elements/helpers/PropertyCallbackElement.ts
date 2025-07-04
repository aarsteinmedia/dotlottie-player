/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { isServer } from '@aarsteinmedia/lottie-web/utils'

/**
 * Credit to: Leonardo Favre https://github.com/leofavre/observed-properties.
 */

const updateOnConnected = Symbol('UPDATE_ON_CONNECTED')

if (isServer) {
  // Mock HTMLElement for server-side rendering
  global.HTMLElement =
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class EmptyHTMLElement { } as unknown as typeof global.HTMLElement
}

/**
 * HTMLElement enhanced to track property changes.
 */
export default abstract class PropertyCallbackElement extends HTMLElement {
  constructor() {
    super()

    if (updateOnConnected in this) {
      this[updateOnConnected] = []
    }

    const { observedProperties = [] } =
      this.constructor as unknown as { observedProperties: string[] }

    const { length } = observedProperties

    for (let i = 0; i < length; i++) {
      const initialValue = this[observedProperties[i] as keyof this],
        cachedValue = Symbol(observedProperties[i]) as keyof this

      this[cachedValue] = initialValue

      Object.defineProperty(
        this, observedProperties[i] ?? '', {
          get() {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return this[cachedValue]
          },
          set(value) {
            const oldValue = this[cachedValue]

            this[cachedValue] = value
            this.propertyChangedCallback(
              observedProperties[i], oldValue, value
            )
          },
        }
      )
      if (
        typeof initialValue !== 'undefined' &&
        updateOnConnected in this &&
        Array.isArray(this[updateOnConnected])
      ) {
        ; (this[updateOnConnected] as (keyof this)[]).push(observedProperties[i] as keyof this)
      }
    }
  }


  connectedCallback() {
    let arr: string[] = []

    if (
      updateOnConnected in this &&
      Array.isArray(this[updateOnConnected])
    ) {
      arr = this[updateOnConnected]
    }
    const { length } = arr

    for (let i = 0; i < length; i++) {
      if (
        !('propertyChangedCallback' in this) ||
        typeof this.propertyChangedCallback !== 'function'
      ) {
        continue
      }

      if (arr[i] ?? '' in this) {
        this.propertyChangedCallback(
          arr[i] ?? '',
          undefined,
          this[arr[i] as keyof this]
        )
      }
    }
  }

  propertyChangedCallback(
    _name: string, _oldValue: unknown, _value: unknown
  ) {
    throw new Error(`${this.constructor.name}: Method propertyChangedCallback is not implemented`)
  }
}
