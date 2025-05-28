# Changelog for @aarsteinmedia/dotlottie-player

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changelog was only added since [3.2.3], so it's not exhaustive. [Please report any missing noteable changes to us](https://github.com/aarsteinmedia/dotlottie-player/issues), and we'll add them promptly.

## [5.0.3] - 28-05-2025

### Changed

- Improved dotLottie parsing and generation to keep expressions from being mangled by compression.

## [5.0.1] - 23-05-2025

### Changed

- Added support for abbreviated (optimized) Lottie format.

## [5.0.0] - 25-02-2025

### Changed

- Added TypeScript compatibility with React 19 JSX
- BREAKING CHANGE:
  - Dropped support for CommonJS
  - Set ESM Module as main script, and moved IIFE to unpkg-folder

## [4.0.14] - 21-02-2025

### Changed

- Fixed CSS bug
- Updated backend script

## [4.0.13] - 05-02-2025

### Changed

- Changed from ES2021 to ES2022

## [4.0.12] - 26-01-2025

### Changed

- Dropped scss
- Flat Config Eslint

## [4.0.11] - 02-12-2024

### Changed

- Improved type safety and error handling

## [4.0.10] - 20-11-2024

### Changed

- Better attribute handling

## [4.0.9] - 12-11-2024

### Changed

- Fixed bug with setting playback direction

## [4.0.8] - 03-11-2024

### Changed

- Made it possible to set certain properties before lottie instance is loaded

## [4.0.7] - 03-11-2024

### Changed

- Made download optional for snapshot

- Made snapshot work for programatically set instances

- Changed CSS to respect hidden-attribute

## [4.0.4] - 31-10-2024

### Changed

- Added Changelog to npm package

- Removed minification from module versions

## [4.0.3] - 30-10-2024

### Changed

- Fixed typo causing externals to be bundled

## [4.0.2] - 30-10-2024

### Changed

- Conditionally loading of controls

## [4.0.1] - 29-10-2024

### Changed

- Added attribute listener to `src`

## [4.0.0] - 24-10-2024

### Changed

- Refactored type import
  - BREAKING CHANGE:
    ```diff
    - import type { DotLottiePlayer } from '@aarsteinmedia/dotlottie-player'
    + import type DotLottiePlayer from '@aarsteinmedia/dotlottie-player'
    ```
- Rich data moved from attributes to properties
  - BREAKING CHANGE:
  ```diff
  <dotlottie-player
    id="find-me"
    - multianimationsettings="[{ autoplay: true, loop: false }]"
    - segment="[0, 1]"
  ></dotlottie-player>

  + const player = document.querySelector('#find-me')
  + player?.setMultianimationsettings([{ autoplay: true, loop: false }])
  + player?.setSegment([0, 1])
  ```

- Moved `./dist/custom-elements.json` to `./custom-elements.json`

### Added

  - Added unit tests

## [3.2.5] - 21-10-2024

### Changed

- Fixed typo, causing some types not to be resolved

## [3.2.4] - 20-10-2024

### Changed

- Extended browser support

## [3.2.3] - 14-10-2024

### Added

- Added Changelog

### Changed

- Migrated from eslint@8 to eslint@9

## [3.2.2] - 27-09-2024

### Changed

- Minor stylistic changes

## [3.2.1] - 03-09-2024

### Changed

- Minor stylistic changes

## [3.2.0] - 02-09-2024

### Changed

- Refactored code
  - Code splitting for maintainability, with no intended changes for how the component is consumed

## [3.1.0] - 02-09-2024

### Added

- Added support for AVIF images in assets

### Changed

- Refactored return types
  - `addAnimation` now returns object
  ```typescript
  public async addAnimation(
    configs: AnimationAttributes[],
    fileName?: string,
    shouldDownload = true
  ): Promise<{
    result?: void | ArrayBuffer
    success: boolean
    error?: string
  }>
  ```

## [3.0.0] - 06-09-2024

### Changed

- Refactored imports
  - BREAKING CHANGE:
    ```diff
    - import type DotLottiePlayer from '@aarsteinmedia/dotlottie-player'
    + import type { DotLottiePlayer } from '@aarsteinmedia/dotlottie-player'
    ```

### Removed

- Removed dependencies
  - `@lit`

[5.0.3]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/5.0.3
[5.0.1]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/5.0.1
[5.0.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/5.0.0
[4.0.14]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.14
[4.0.13]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.13
[4.0.12]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.12
[4.0.11]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.11
[4.0.10]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.10
[4.0.9]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.9
[4.0.8]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.8
[4.0.7]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.7
[4.0.4]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.4
[4.0.3]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.3
[4.0.2]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.2
[4.0.1]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.1
[4.0.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.0
[3.2.5]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.5
[3.2.4]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.4
[3.2.3]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.3
[3.2.2]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.2
[3.2.1]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.1
[3.2.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.0
[3.1.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.1.0
[3.0.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.0.0