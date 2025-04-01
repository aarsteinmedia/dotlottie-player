import 'react/jsx-runtime';
import 'react/jsx-dev-runtime';
import type { AnimationSettings } from '@aarsteinmedia/lottie-web';
import type { Plugin } from '@custom-elements-manifest/analyzer';
import type DotLottiePlayer from './elements/DotLottiePlayer';
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
    packagejson: boolean;
    stencil: boolean;
    watch: boolean;
    plugins: Array<() => Plugin>;
    overrideModuleCreation({ globs, ts, }: {
        ts: unknown;
        globs: string[];
    }): unknown[];
}
declare global {
    interface HTMLElementTagNameMap {
        'dotlottie-player': DotLottiePlayer;
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
            'dotlottie-player': JSXLottiePlayer;
        }
    }
}
declare module 'react/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            'dotlottie-player': JSXLottiePlayer;
        }
    }
}
declare module 'react/jsx-dev-runtime' {
    namespace JSX {
        interface IntrinsicElements {
            'dotlottie-player': JSXLottiePlayer;
        }
    }
}
export {};
