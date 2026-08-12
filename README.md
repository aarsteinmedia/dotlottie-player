# AM LottiePlayer

![Awesome Vector Animations](/.github/readmeBanner.svg)

We proudly claim this to be the most versatile, lightweight, and efficient Lottie Player Web Component available. It's compatible with server-side rendering and completely framework-agnostic.

### Choosing a build

| Import | When to use it |
| ------ | -------------- |
| `@aarsteinmedia/dotlottie-player` | Full player: all renderers, [expressions](https://helpx.adobe.com/after-effects/using/expression-basics.html), SVG effects, plus convert/combine on the fly. |
| `@aarsteinmedia/dotlottie-player/svg` | SVG renderer with expressions and SVG effects, but without convert/combine. Use this when you need those features but don’t want to load the full build. |
| `@aarsteinmedia/dotlottie-player/canvas` | Canvas renderer – usually easier on the hardware and visually similar to SVG for most animations. Most SVG-specific effects aren’t available, and animation support isn’t as broad as SVG. |
| `@aarsteinmedia/dotlottie-player/light` | Smallest build: SVG only, with expressions and SVG effects stripped out. No convert/combine. |

## Demo

Here is [a demo](https://www.aarstein.media/en/dotlottie-player), running on Next.js with TypeScript.

## Installation

### In HTML

- Import from CDN:
  - Full:
    ```html
    <script src="https://unpkg.com/@aarsteinmedia/dotlottie-player@latest/dist/unpkg-full.js"></script>
    ```
  - SVG:
    ```html
    <script src="https://unpkg.com/@aarsteinmedia/dotlottie-player@latest/dist/unpkg-svg.js"></script>
    ```
  - Canvas:
    ```html
    <script src="https://unpkg.com/@aarsteinmedia/dotlottie-player@latest/dist/unpkg-canvas.js"></script>
    ```
  - Light:
    ```html
    <script src="https://unpkg.com/@aarsteinmedia/dotlottie-player@latest/dist/unpkg-light.js"></script>
    ```

- Import from `node_modules` the same way, e.g. `/node_modules/@aarsteinmedia/dotlottie-player/dist/unpkg-full.js`.

### In JavaScript or TypeScript

1. Install using npm, pnpm, or yarn:

    ```bash
    pnpm add @aarsteinmedia/dotlottie-player
    ```

2. Import in your app (pick one build):

    ```js
    import '@aarsteinmedia/dotlottie-player'
    // or:
    import '@aarsteinmedia/dotlottie-player/svg'
    import '@aarsteinmedia/dotlottie-player/canvas'
    import '@aarsteinmedia/dotlottie-player/light'
    ```

Because this is a Web Component, you're adding it to the global scope of your web app. Unlike modular components, it should only be imported once – preferably early in your app lifecycle.

If you're using TypeScript and want to import the component type, do it modularly in addition to the global import:

```ts
import '@aarsteinmedia/dotlottie-player' // Do this once globally.
import type DotLottiePlayer from '@aarsteinmedia/dotlottie-player' // Do this per file that needs the type.
```

⚠️ Note that this pattern may provoke linter errors, such as `import/no-duplicates`.

## Usage

Add the `dotlottie-player` element to your markup and point the `src` to a Lottie animation of your choice:

```html
<dotlottie-player
  autoplay
  controls
  subframe
  loop
  id="find-me"
  src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
  style="width: 320px; margin: auto;"
>
</dotlottie-player>
```

### Load animation

To set animations programmatically, use the `load()` method.

```javascript
const player = document.querySelector('#find-me')
await player?.load('https://storage.googleapis.com/aarsteinmedia/am.lottie')
```

### Convert to dotLottie

*(Full build only.)*

If you have a Lottie JSON animation and want to convert it to a dotLottie file – to leverage compression, combine multiple animations, and maintain a tidy file library – you can use the `convert()` method. This will trigger a browser download.

If `controls` are visible, there’s also a convert button in the context menu on the right-hand side.

### Convert to JSON

*(Full build only.)*

If you're debugging a dotLottie animation (e.g., expressions aren’t working as expected), you can convert it to JSON either using the `convert()` method or via the convert button if `controls` are enabled.

### Combine animations

*(Full build only.)*

To combine multiple animations into a single dotLottie file, use the `addAnimation()` method. This also triggers a browser download. Source files can be either dotLottie or JSON, and the output will always be dotLottie:

```javascript
const player = document.querySelector('#find-me')
await player?.addAnimation([
  { id: 'animation_1', url: '/url/to/animation_1.lottie' },
  { id: 'animation_2', url: '/url/to/animation_2.json', direction: -1, speed: 2 }
])
```

You can also use this method without any `<dotlottie-player>` on the page. As long as the script is loaded, `dotLottiePlayer()` is available as a global method.

```js
await dotLottiePlayer().addAnimation([
  { id: 'animation_1', url: '/path/to/animation_1.lottie' },
  { id: 'animation_2', url: '/path/to/animation_2.json', direction: -1, speed: 2 }
])
```

The new file will automatically load the first animation when initialized. You can toggle between animations using the `next()` and `prev()` methods, or the navigation buttons in the controls.

Here’s how to control playback settings for multiple animations:

```html
<dotlottie-player
  subframe
  id="find-me"
  src="/path/to/combined-animations.lottie"
>
</dotlottie-player>
```

```js
const player = document.querySelector('#find-me')
player?.setMultiAnimationSettings([
  {
    autoplay: true
  },
  {
    autoplay: true,
    loop: true
  }
])
```

### Angular

1. Import the component in `app.component.ts`.

```ts
import { Component } from '@angular/core'
import '@aarsteinmedia/dotlottie-player'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'your-app-name'
}
```

2. Add the player to your HTML template.

### React.js / Next.js

Because this is a Web Component and not a React component, note that you must use the `class` attribute (not `className`) when assigning a CSS class.

If you prefer pure React logic, you may want to check out [@aarsteinmedia/dotlottie-react](https://www.npmjs.com/package/@aarsteinmedia/dotlottie-react).

```jsx
import '@aarsteinmedia/dotlottie-player'

function App() {
  return (
    <dotlottie-player
      autoplay
      controls
      loop
      class="your-class-name"
      src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
      style={{
        width: '320px',
        margin: 'auto'
      }}
    />
  )
}

export default App
```

If you're using TypeScript and want to assign a `ref`, do it like this:

```tsx
import { useRef } from 'react'
import '@aarsteinmedia/dotlottie-player'
import type DotLottiePlayer from '@aarsteinmedia/dotlottie-player'

function App() {
  const animation = useRef<DotLottiePlayer | null>(null)
  return (
    <dotlottie-player
      subframe
      ref={animation}
      src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
    />
  )
}

export default App
```

### Vue.js / Nuxt.js (using Vite.js)

1. Declare the `dotlottie-player` tag as a custom element, so Vue doesn’t try to resolve it as a Vue component.

#### In Vue.js

`vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => tag === 'dotlottie-player',
        }
      }
    })
  ]
})
```

#### In Nuxt.js

`nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag === 'dotlottie-player',
    }
  }
})
```

2. Import the package once for its side effect (registers the custom element).

#### In Vue.js

`main.ts`:

```ts
import { createApp } from 'vue'
import '@aarsteinmedia/dotlottie-player'
import App from './App.vue'

createApp(App).mount('#app')
```

#### In Nuxt.js

Create a `plugins` folder in your root if it doesn't exist already, and add a client plugin named e.g. `dotlottie-player.client.ts`:

```ts
import '@aarsteinmedia/dotlottie-player'

export default defineNuxtPlugin(() => {})
```

3. Use the element in your templates:

```vue
<template>
  <dotlottie-player
    src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
    autoplay
    controls
    subframe
    loop
    style="width: 320px; margin: auto;"
  />
</template>
```

## Properties

| Property / Attribute      | Description                                                                                                                   | Type                                                      | Default           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------- |
| `animateOnScroll`         | Animate by scrolling.                                                                                                         | `boolean`                                                 | `false`           |
| `autoplay`                | Play animation on load.                                                                                                       | `boolean`                                                 | `false`           |
| `background`              | Background color.                                                                                                             | `string`                                                  | `transparent`     |
| `controls`                | Show controls.                                                                                                                | `boolean`                                                 | `false`           |
| `count`                   | Number of times to loop animation.                                                                                            | `number`                                                  | `0`               |
| `delay`                   | Delay playback on playOnVisible, in milliseconds.                                                                             | `number`                                                  | `0`               |
| `description`             | Description for screen readers.                                                                                               | `string`                                                  | `undefined`       |
| `direction`               | Direction of animation.                                                                                                       | `1` \| `-1`                                               | `1`               |
| `dontFreezeOnBlur`        | Disable freezing playback when the window loses focus (freeze-on-blur is the default).                                        | `boolean`                                                 | `false`           |
| `hover`                   | Whether to play on mouse hover.                                                                                               | `boolean`                                                 | `false`           |
| `intermission`            | Pause between loop iterations, in milliseconds.                                                                               | `number`                                                  | `0`               |
| `loop`                    | Whether to loop animation.                                                                                                    | `boolean`                                                 | `false`           |
| `mode`                    | Play mode.                                                                                                                    | `normal` \| `bounce`                                      | `normal`          |
| `mouseout`                | Action on mouseout.                                                                                                           | `void` \| `stop` \| `pause` \| `reverse`                  | `stop`            |
| `objectfit`               | Resizing of animation in container.                                                                                           | `contain` \| `cover` \| `fill` \| `none` \| `scale-down`  | `contain`         |
| `once`                    | Whether, if playOnVisible is true, to play once or anytime the animation is in view.                                          | `boolean`                                                 | `false`           |
| `playOnClick`             | Whether to toggle play on click.                                                                                              | `boolean`                                                 | `false`           |
| `playOnVisible`           | Play when visible.                                                                                                            | `boolean`                                                 | `false`           |
| `quiet`                   | Suppress the graphic error screen on critical load errors.                                                                    | `boolean`                                                 | `false`           |
| `renderer`                | Renderer to use (full build only; other builds lock this).                                                                    | `svg` \| `canvas` \| `html`                               | `svg`             |
| `selector`                | Play on clicked element by id attribute.                                                                                      | `string`                                                  | `undefined`       |
| `simple`                  | Hide advanced controls (loop, boomerang, convert, snapshot, settings).                                                        | `boolean`                                                 | `false`           |
| `speed`                   | Animation speed.                                                                                                              | `number`                                                  | `1`               |
| `src` _(required)_        | URL to Lottie JSON or dotLottie.                                                                                              | `string`                                                  | `undefined`       |
| `subframe`                | When enabled this can help to reduce flicker on some animations, especially on Safari and iOS devices.                        | `boolean`                                                 | `false`           |

## Methods

| Method                                                          | Function |
| --------------------------------------------------------------- | -------- |
| `addAnimation(params: AddAnimationParams) => Promise<Result>`   | *(Full build only.)* Combine animations into a new dotLottie file and trigger a download. |
| `convert(params: ConvertParams) => Promise<Result>`             | *(Full build only.)* Convert between JSON and dotLottie. Triggers a download in the browser. |
| `destroy() => void`                                             | Nullify animation and remove element from the DOM. |
| `getLottie() => AnimationItem \| null`                          | Returns the lottie-web instance used in the component. |
| `getManifest() => LottieManifest \| undefined`                  | Returns the dotLottie manifest, if any. |
| `getMultiAnimationSettings() => AnimationSettings[]`            | Returns multi-animation settings. |
| `getSegment() => [number, number] \| undefined`                 | Returns the current playback segment. |
| `load(src: string) => Promise<void>`                            | Load animation by URL or JSON string. |
| `next() => void`                                                | Next animation (if several in file). |
| `pause() => void`                                               | Pause. |
| `prev() => void`                                                | Previous animation (if several in file). |
| `play() => void`                                                | Play. |
| `reload() => Promise<void>`                                     | Reload. |
| `seek(value: number \| string) => void`                         | Go to frame. Can be a number or a percentage string (e.g. `50%`). |
| `setCount(value: number) => void`                               | Dynamically set number of loops. |
| `setDirection(value: 1 \| -1) => void`                          | Set direction. |
| `setLoop(value: boolean) => void`                               | Set looping. |
| `setMultiAnimationSettings(value: AnimationSettings[]) => void` | Set multi-animation settings. |
| `setSegment(value: [number, number]) => void`                   | Play only part of an animation. E.g. from frame 10 to frame 60 would be `[10, 60]`. |
| `setSpeed(value?: number) => void`                              | Set speed. |
| `setSubframe(value: boolean) => void`                           | Set subframe. |
| `snapshot(download?: boolean, name?: string) => string \| null` | Snapshot the current frame as SVG. Downloads by default when `download` is true. |
| `stop() => void`                                                | Stop. |
| `toggleBoomerang() => void`                                     | Toggle between `bounce` and `normal`. |
| `toggleLoop() => void`                                          | Toggle looping. |
| `togglePlay() => void`                                          | Toggle play. |

## Events

The following events are exposed and can be listened to via `addEventListener` calls.

| Name        | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `complete`  | Animation is complete – including all loops                     |
| `destroyed` | Animation is destroyed                                          |
| `error`     | The source cannot be parsed, fails to load, or has format errors |
| `frame`     | A new frame is entered                                          |
| `freeze`    | Animation is paused due to player being out of view             |
| `load`      | Animation is loaded                                             |
| `loop`      | A loop is completed                                             |
| `next`      | Switched to next animation in a multi-animation file            |
| `_play`     | Animation has started playing                                   |
| `_pause`    | Animation has paused                                            |
| `previous`  | Switched to previous animation in a multi-animation file        |
| `ready`     | Animation is loaded and player is ready                         |
| `rendered`  | Player UI has been rendered                                     |
| `stop`      | Animation has stopped                                           |

## WordPress Plugins
<img align="left" width="110" height="110" src="/.github/wpIcon.svg" style="margin-right:1em" />

We've made a free WordPress plugin that works with Gutenberg Blocks, Elementor, Divi Builder and Flatsome UX Builder: [AM LottiePlayer](https://www.aarstein.media/en/am-lottieplayer). It has all the functionality of this package, with a helpful user interface.

It's super lightweight – and only loads on pages where animations are used.

We've also made a premium WordPress plugin for purchase: [AM LottiePlayer PRO](https://www.aarstein.media/en/am-lottieplayer/pro). It has an easy-to-use GUI for combining and controlling multiple Lottie animations in a single file, converting JSON to dotLottie with drag-and-drop, and many more exclusive features.

## License

GPL-2.0-or-later
