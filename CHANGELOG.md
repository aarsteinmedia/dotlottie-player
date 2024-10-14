# @aarsteinmedia/dotlottie-player

## 3.2.3 (2024-10-14)

### Patch Changes
  - Migrated from eslint@8 to eslint@9
  - Added Changelog

## 3.2.2 (2024-9-27)

### Patch Changes
  - Minor stylistic changes

## 3.2.1 (2024-9-3)

### Patch Changes
  - Minor stylistic changes

## 3.2.0 (2024-9-2)

### Patch Changes
  - Refactored code
    - Code splitting for maintainability, with no intended changes for how the component is consumed

## 3.1.0 (2024-9-2)

### Patch Changes
  - Added support for AVIF images
  - Refactored return types
    - `addAnimation` now returns object ```typescript { result?: Promise<void | ArrayBuffer>; success:boolean; error?: string; }`

## 3.0.0 (2024-9-6)

### Patch Changes
  - Removed dependencies
    - @lit
  - Refactored imports
    - BREAKING CHANGE:
      - `- import type { DotLottiePlayer } from '@aarsteinmedia/dotlottie-player'
      + import type DotLottiePlayer from '@aarsteinmedia/dotlottie-player'`