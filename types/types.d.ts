import 'react/jsx-runtime';
import 'react/jsx-dev-runtime';
import type { Plugin } from '@custom-elements-manifest/analyzer';
import type DotLottiePlayer from './elements/DotLottiePlayer';
import type DotLottiePlayerLight from './elements/DotLottiePlayerLight';
import type { tagName } from './utils/enums';
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
        [tagName]: DotLottiePlayer | DotLottiePlayerLight;
    }
    function dotLottiePlayer(): DotLottiePlayer | DotLottiePlayerLight;
}
type JSXLottiePlayer = Omit<Partial<DotLottiePlayer | DotLottiePlayerLight>, 'style'> & {
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
