import 'react/jsx-runtime';
import 'react/jsx-dev-runtime';
import type { AnimationSettings } from '@aarsteinmedia/lottie-web';
import type { Plugin } from '@custom-elements-manifest/analyzer';
import type DotLottiePlayer from './elements/DotLottiePlayer';
import type { tagName } from '.';
export interface Animation extends AnimationSettings {
    id: string;
}
export interface AnimationAttributes extends Animation {
    url: string;
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
