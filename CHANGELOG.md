# Changelog for @aarsteinmedia/dotlottie-player

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changelog was only added since [3.2.3], so it's not exhaustive. [Please report any missing noteable changes to us](https://github.com/aarsteinmedia/dotlottie-player/issues), and we'll add them promptly.

## [4.0.0] - 24-10-2014

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
    - multianimationsettings="[{ autoplay: true, loop: false }]"
    - segment="[0, 1]"
  ></dotlottie-player>

  + dotLottiePlayer.setMultianimationsettings([{ autoplay: true, loop: false }])
  + dotLottiePlayer.setSegment([0, 1])
  ```

- Moved `./dist/custom-elements.json` to `./custom-elements.json`

### Added

  - Added unit tests

## [3.2.5] - 21-10-2014

### Changed

- Fixed typo, causing some types not to be resolved

## [3.2.4] - 20-10-2014

### Changed

- Extended browser support

## [3.2.3] - 14-10-2014

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

[4.0.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/4.0.0
[3.2.5]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.5
[3.2.4]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.4
[3.2.3]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.3
[3.2.2]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.2
[3.2.1]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.1
[3.2.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.2.0
[3.1.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.1.0
[3.0.0]: https://www.npmjs.com/package/@aarsteinmedia/dotlottie-player/v/3.0.0