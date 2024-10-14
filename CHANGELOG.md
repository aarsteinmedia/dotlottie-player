# @aarsteinmedia/dotlottie-player

## 3.2.3

### Patch Changes
  - Migrated from eslint@8 to eslint@9

## 3.2.2

### Patch Changes
  - Minor stylistic changes

## 3.2.1

### Patch Changes
  - Minor stylistic changes

## 3.2.0

### Patch Changes
  - Refactored code
    - Code splitting for maintainability, with no intended changes for how the component is consumed

## 3.1.0

### Patch Changes
  - Added support for AVIF images
  - Refactored return types
    - `addAnimation` now returns object ```typescript { result?: Promise<void | ArrayBuffer>; success:boolean; error?: string; }`

## 3.0.0

### Patch Changes
  - Removed dependencies
    - @lit
  - Refactored imports
    - BREAKING CHANGE:
      - `- import type { DotLottiePlayer } from '@aarsteinmedia/dotlottie-player'
      + import type DotLottiePlayer from '@aarsteinmedia/dotlottie-player'`