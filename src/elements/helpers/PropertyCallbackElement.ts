import { isServer } from '@/utils'

/**
 * Credit to:
 * @author Leonardo Favre <https://github.com/leofavre/observed-properties>
 */

const UPDATE_ON_CONNECTED = Symbol('UPDATE_ON_CONNECTED')

if (isServer()) {
  // Mock HTMLElement for server-side rendering
  global.HTMLElement =
    class EmptyHTMLElement {} as unknown as typeof global.HTMLElement
}

/**
 * HTMLElement enhanced to track property changes
 */
export default class PropertyCallbackElement extends HTMLElement {
  constructor() {
    super()
    const { observedProperties = [] } = this.constructor as any
    if (UPDATE_ON_CONNECTED in this) {
      this[UPDATE_ON_CONNECTED] = []
    }

    if (
      'propertyChangedCallback' in this &&
      typeof this.propertyChangedCallback === 'function'
    ) {
      const { length } = observedProperties
      for (let i = 0; i < length; i++) {
        const initialValue = this[observedProperties[i] as keyof this],
          CACHED_VALUE = Symbol(observedProperties[i] as string)

        // @ts-expect-error: ingore
        this[CACHED_VALUE] = initialValue

        Object.defineProperty(this, observedProperties[i], {
          get() {
            return this[CACHED_VALUE]
          },
          set(value) {
            const oldValue = this[CACHED_VALUE]
            this[CACHED_VALUE] = value
            this.propertyChangedCallback(observedProperties[i], oldValue, value)
          },
        })
        if (typeof initialValue !== 'undefined') {
          if (
            UPDATE_ON_CONNECTED in this &&
            Array.isArray(this[UPDATE_ON_CONNECTED])
          ) {
            ;(this[UPDATE_ON_CONNECTED] as (keyof this)[]).push(
              observedProperties[i]
            )
          }
        }
      }
    }
  }

  connectedCallback() {
    let arr = []
    if (
      UPDATE_ON_CONNECTED in this &&
      Array.isArray(this[UPDATE_ON_CONNECTED])
    ) {
      arr = this[UPDATE_ON_CONNECTED]
    }
    const { length } = arr
    for (let i = 0; i < length; i++) {
      if (
        !('propertyChangedCallback' in this) ||
        typeof this.propertyChangedCallback !== 'function'
      ) {
        continue
      }

      if (arr[i] in this) {
        this.propertyChangedCallback(
          arr[i],
          undefined,
          this[arr[i] as keyof this]
        )
      }
    }
  }
}
