import { isServer } from '@/utils'

/**
 * Credit to:
 * @author Leonardo Favre <https://github.com/leofavre/observed-properties>
 * @description Enhanced HTML element with reactive state handlers
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
const UPDATE_ON_CONNECTED = Symbol('UPDATE_ON_CONNECTED')

if (isServer()) {
  // Mock HTMLElement for server-side rendering
  // @ts-ignore
  global.HTMLElement = class EmptyHTMLElement {}
}

/**
 * HTMLElement enhanced to track property changes
 */
export default class EnhancedElement extends HTMLElement {
  constructor() {
    super()
    // @ts-ignore
    const { observedProperties = [] } = this.constructor
    if (UPDATE_ON_CONNECTED in this) {
      this[UPDATE_ON_CONNECTED] = []
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
          if (
            UPDATE_ON_CONNECTED in this &&
            Array.isArray(this[UPDATE_ON_CONNECTED])
          ) {
            ;(this[UPDATE_ON_CONNECTED] as (keyof this)[]).push(propName)
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
    for (const propName of arr) {
      if (
        !('propertyChangedCallback' in this) ||
        typeof this.propertyChangedCallback !== 'function'
      ) {
        continue
      }

      if (propName in this) {
        this.propertyChangedCallback(
          propName,
          undefined,
          this[propName as keyof this]
        )
      }
    }
  }
}
