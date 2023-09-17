# AM LottiePlayer Web Component

![Awesome Vector Animations](/.github/readmeBanner.svg)

The most versatile and efficient Lottie Player Web Component out there!

The component is built with Lit and compiled with Rust. It's compatible with server side rendering, and like any good web component it's framework agnostic.

If you only need to render animations as SVG we've made light version: [@aarsteinmedia/dotlottie-player-light](https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player-light).

## Demo

Here is [a demo](https://www.aarstein.media/en/dev/dotlottie-player), running on Next.js 13 using TypeScript.

## Installation

### In HTML

- Import from CDN:

```xml
<script src="https://unpkg.com/@aarsteinmedia/dotlottie-player@latest/dist/index.js"></script>
```

- Import from node_modules directory:

```xml
<script src="/node_modules/@aarsteinmedia/dotlottie-player/dist/index.js"></script>
```

### In JavaScript or TypeScript

1. Install using npm or yarn:

```shell
npm install --save @aarsteinmedia/dotlottie-player
```

2. Import in your app:

```javascript
import '@aarsteinmedia/dotlottie-player'
```

## Usage

Add the element `dotlottie-player` to your markup and point `src` to a Lottie animation of your choice. If you're working in SSR environments like Next.js or Nuxt.js, it might be a good idea to set reflective booleans (like `autoplay`, `controls` and `loop`) to an empty string instead of `true` – to mimic how modern browsers treats these values in markup, as opposed to how Node.js treats them. This way you avoid hydration errors.

```xml
<dotlottie-player
  autoplay=""
  controls=""
  loop=""
  src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
  style="width: 320px; margin: auto;"
>
</dotlottie-player>
```

To set animations programmatically, use the `load()` method.

```javascript
const lottiePlayer = document.querySelector('dotlottie-player')
lottiePlayer.load('https://storage.googleapis.com/aarsteinmedia/am.lottie')
```

### Angular

1. Import the component in `app.component.ts`.

```typescript
import { Component } from '@angular/core'
import '@aarsteinmedia/dotlottie-player'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'your-app-name';
}
```

2. Add the player to your html template.

### React.js / Next.js

If you've already imported the library in a parent component, you don't need to import it again in children of that component. If you want to assign the element a class note that you need to use the `class` namespace, and not `className`.

```jsx
import '@aarsteinmedia/dotlottie-player'

function App() {
  return (
    <dotlottie-player
      class="your-class-name"
      src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
      autoplay=""
      controls=""
      loop=""
      style={{
        width: '320px',
        margin: 'auto'
      }}
    />
  )
}

export default App
```

If you're using TypeScript and want to assign the component a `ref`, you can do it like this:

```tsx
import { useRef } from 'react'
import '@aarsteinmedia/dotlottie-player'
import type { DotLottiePlayer } from '@aarsteinmedia/dotlottie-player'

function App() {
  const animation = useRef<DotLottiePlayer | null>(null)
  return (
    <dotlottie-player
      ref={animation}
      src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
    />
  )
}

export default App
```

### Vue.js / Nuxt.js (using Vite.js)

Compared to React and Angular there's a couple of extra steps, but surely nothing too daunting.

1. Declare the dotlottie-player tag as a custom element, to prevent Vue from attempting to resolve it.

#### In Vue.js
`vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag: string) => ['dotlottie-player'].includes(tag),
        }
      }
    })
  ]
})
```

#### In Nuxt.js
`nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => ['dotlottie-player'].includes(tag),
    }
  }
})
```

2. Import/initiate the component.

#### In Vue.js
`main.ts`:

```typescript
import { createApp } from 'vue'
import { DotLottiePlayer } from '@aarsteinmedia/dotlottie-player'
import App from './App.vue'

const app = createApp(App)
app.component('DotLottiePlayer', DotLottiePlayer)
```

#### In Nuxt.js
Create a `plugins` folder in your root if it doesn't exist already, add a file named `dotlottie-player.js`:

```javascript
import { DotLottiePlayer } from '@aarsteinmedia/dotlottie-player'

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.component('DotLottiePlayer', DotLottiePlayer)
})
```

3. The component can now be used in your pages or components template tags.

```vue
<template>
  <dotlottie-player
    src="https://storage.googleapis.com/aarsteinmedia/am.lottie"
    autoplay=""
    controls=""
    loop=""
    style="width: 320px; margin: auto;"
  />
</template>
```

## Properties

| Property / Attribute  | Description                                                                                             | Type                                     | Default           |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| `autoplay`            | Play animation on load                                                                                  | `boolean`                                | `false`           |
| `background`          | Background color                                                                                        | `string`                                 | `undefined`       |
| `controls`            | Show controls                                                                                           | `boolean`                                | `false`           |
| `count`               | Number of times to loop animation                                                                       | `number`                                 | `undefined`       |
| `direction`           | Direction of animation                                                                                  | `1` \| `-1`                              | `1`               |
| `hover`               | Whether to play on mouse hover                                                                          | `boolean`                                | `false`           |
| `loop`                | Whether to loop animation                                                                               | `boolean`                                | `false`           |
| `mode`                | Play mode                                                                                               | `normal` \| `bounce`                     | `normal`          |
| `objectfit`           | Resizing of animation in container                                                                      | `contain` \| `cover` \| `fill` \| `none` | `contain`         |
| `renderer`            | Renderer to use                                                                                         | `svg` \| `canvas` \| `html`              | `svg`             |
| `segment`             | Play only part of an animation. E. g. from frame 10 to frame 60 would be `[10, 60]`                     | `[number, number]`                       | `undefined`       |
| `speed`               | Animation speed                                                                                         | `number`                                 | `1`               |
| `src` _(required)_    | URL to LottieJSON or dotLottie                                                                          | `string`                                 | `undefined`       |
| `subframe`            | When enabled this can help to reduce flicker on some animations, especially on Safari and iOS devices.  | `boolean`                                | `true`           |

## Methods

| Method                                    | Function
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `addAnimation(config: Config[]) => void`  | Add animation. Triggers download of new dotLottie file.                                                   |
| `convert() => void`                       | If the current animation is in JSON format – convert it to dotLottie. Triggers a download in the browser. |
| `destroy() => void`                       | Nullify animation and remove element from the DOM.                                                        |
| `getLottie() => AnimationItem \| null`    | Returns the lottie-web instance used in the component                                                     |
| `load(src: string) => void`               | Load animation by URL or JSON object                                                                      |
| `next() => void`                          | Next animation (if several in file)                                                                       |
| `pause() => void`                         | Pause                                                                                                     |
| `prev() => void`                          | Previous animation (if several in file)                                                                   |
| `play() => void`                          | Play                                                                                                      |
| `reload() => void`                        | Reload                                                                                                    |
| `seek(value: number \| string) => void`   | Go to frame. Can be a number or a percentage string (e. g. 50%).                                          |
| `setDirection(value: 1 \| -1) => void`    | Set Direction                                                                                             |
| `setLooping(value: boolean) => void`      | Set Looping                                                                                               |
| `setSpeed(value?: number) => void`        | Set Speed                                                                                                 |
| `setSubframe(value: boolean) => void`     | Set subframe                                                                                              |
| `snapshot() => string`                    | Snapshot the current frame as SVG. Triggers a download in the browser.                                    |
| `stop() => void`                          | Stop                                                                                                      |
| `toggleBoomerang() => void`               | Toggle between `bounce` and `normal`                                                                      |
| `toggleLooping() => void`                 | Toggle looping                                                                                            |
| `togglePlay() => void`                    | Toggle play                                                                                               |

## Events

The following events are exposed and can be listened to via `addEventListener` calls.

| Name       | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| `complete` | Animation is complete – including all loops                      |
| `destroyed`| Animation is destroyed                                           |
| `error`    | The source cannot be parsed, fails to load or has format errors  |
| `frame`    | A new frame is entered                                           |
| `freeze`   | Animation is paused due to player being out of view              |
| `load`     | Animation is loaded                                              |
| `loop`     | A loop is completed                                              |
| `play`     | Animation has started playing                                    |
| `pause`    | Animation has paused                                             |
| `ready`    | Animation is loaded and player is ready                          |
| `stop`     | Animation has stopped                                            |

## WordPress Plugin
<img align="left" width="110" height="110" src="/.github/wpIcon.svg" />

We've made a free WordPress plugin that works with Gutenberg Blocks, Elementor, Divi Builder and Flatsome UX Builder: [AM LottiePlayer](https://wordpress.org/plugins/am-lottieplayer/). It has all the functionality of this package, with a helpful user interface.

It's super lightweight – and only loads on pages where animations are used.

## License

GPL-2.0-or-later