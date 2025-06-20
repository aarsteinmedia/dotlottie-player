import 'react/jsx-runtime';
import 'react/jsx-dev-runtime';
import type { AnimationData, AnimationSettings, LottieManifest } from '@aarsteinmedia/lottie-web';
import type { Plugin } from '@custom-elements-manifest/analyzer';
import type DotLottiePlayer from './elements/DotLottiePlayer';
import type { tagName } from './index';
interface AnimationAttributes extends AnimationSettings {
    id: string;
    url: string;
}
export interface ConvertParams {
    animations?: AnimationData[];
    currentAnimation?: number;
    fileName?: string;
    generator?: string;
    isDotLottie?: boolean;
    manifest?: LottieManifest;
    shouldDownload?: boolean;
    src?: string;
    typeCheck?: boolean;
}
export interface AddAnimationParams {
    configs: AnimationAttributes[];
    fileName?: string;
    generator: string;
    id?: string;
    shouldDownload?: boolean;
    src?: string;
}
export interface Result {
    error?: string;
    result?: null | string | ArrayBuffer;
    success: boolean;
}
export type AnimateOnScroll = boolean | '' | null;
export type Autoplay = boolean | '' | 'autoplay' | null;
export type Controls = boolean | '' | 'controls' | null;
export type Loop = boolean | '' | 'loop' | null;
export type Subframe = boolean | '' | null;
export interface CEMConfig {
    catalyst: boolean;
    dependencies: boolean;
    dev: boolean;
    exclude: string[];
    fast: boolean;
    globs: ['src/**/*.ts'];
    litelement: boolean;
    outdir: string;
    overrideModuleCreation: ({ globs, ts, }: {
        ts: unknown;
        globs: string[];
    }) => unknown[];
    packagejson: boolean;
    plugins: (() => Plugin)[];
    stencil: boolean;
    watch: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        [tagName]: DotLottiePlayer;
    }
    function dotLottiePlayer(): DotLottiePlayer;
}
type JSXLottiePlayer = Omit<Partial<DotLottiePlayer>, 'style'> & {
    class?: string;
    ref?: React.RefObject<unknown>;
    style?: React.CSSProperties;
    src: string;
};
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            [tagName]: JSXLottiePlayer;
        }
    }
}
declare module 'react/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [tagName]: JSXLottiePlayer;
        }
    }
}
declare module 'react/jsx-dev-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            [tagName]: JSXLottiePlayer;
        }
    }
}
export {};
