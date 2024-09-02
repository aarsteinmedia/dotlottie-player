import { isServer } from './utils'

/**
 * Credit to:
 * @author Leonardo Favre <https://github.com/leofavre/observed-properties>
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
const UPDATE_ON_CONNECTED = Symbol('UPDATE_ON_CONNECTED')

if (isServer()) {
  // Mock HTMLElement on server-side
  global.HTMLElement = class EmptyHTMLElement extends HTMLElement {}
}

/**
 * HTMLElement enhanced to track property changes
 */
export default class EnhancedElement extends HTMLElement {
  [key: symbol]: unknown

  constructor() {
    super()
    const { observedProperties = [] } = this
      .constructor as typeof EnhancedElement

    if (UPDATE_ON_CONNECTED in this) {
      this[UPDATE_ON_CONNECTED] = [] as (keyof this)[]
    }

    if (
      'propertyChangedCallback' in this &&
      typeof this.propertyChangedCallback === 'function'
    ) {
      for (const propName of observedProperties as (keyof this)[]) {
        const initialValue = this[propName],
          CACHED_VALUE = Symbol(propName as string)

        // @ts-ignore
        this[CACHED_VALUE] = initialValue

        Object.defineProperty(this, propName, {
          get() {
            return this[CACHED_VALUE]
          },
          set(value) {
            const oldValue = this[CACHED_VALUE]
            this[CACHED_VALUE] = value
            this.propertyChangedCallback(propName, oldValue, value)
          },
        })

        if (typeof initialValue !== 'undefined') {
          ;(this[UPDATE_ON_CONNECTED] as (keyof this)[])?.push(propName)
        }
      }
    }
  }

  static observedProperties: (keyof EnhancedElement)[] = []

  connectedCallback() {
    let arr: (keyof this)[] = []
    if (
      UPDATE_ON_CONNECTED in this &&
      Array.isArray(this[UPDATE_ON_CONNECTED])
    ) {
      arr = this[UPDATE_ON_CONNECTED]
    }
    for (const propName of arr) {
      if (
        !('propertyChangedCallback' in this) ||
        typeof this.propertyChangedCallback !== 'function'
      ) {
        continue
      }
      this.propertyChangedCallback(propName, undefined, this[propName])
    }
  }
}
