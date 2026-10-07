/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { isServer } from '@aarsteinmedia/lottie-web/utils'

/**
 * Credit to: Leonardo Favre https://github.com/leofavre/observed-properties.
 */

if (isServer) {
  // Mock HTMLElement for server-side rendering
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  globalThis.HTMLElement ??=
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class EmptyHTMLElement { } as unknown as typeof globalThis.HTMLElement
}

/**
 * HTMLElement enhanced to track property changes.
 */
export abstract class PropertyCallbackElement extends HTMLElement {
  constructor() {
    super()

    const { observedProperties } =
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
    }
  }

  propertyChangedCallback(
    _name: string, _oldValue: unknown, _value: unknown
  ) {
    throw new Error(`${this.constructor.name}: Method propertyChangedCallback is not implemented`)
  }
}
