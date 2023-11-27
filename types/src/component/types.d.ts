import type { AnimationDirection } from 'lottie-web';
import type { CSSProperties, RefObject } from 'react';
import type { DotLottiePlayer } from '.';
import type { PlayMode } from './utils';
export interface LottieAsset {
    e: 0 | 1;
    id: string;
    p: string;
    u: string;
}
export interface ImageAsset extends LottieAsset {
    h: number;
    layers?: unknown[];
    w: number;
}
export interface LottieJSON {
    assets?: LottieAsset[];
    ddd: number;
    fr: number;
    h: number;
    ip: number;
    layers: unknown[];
    markers: unknown[];
    meta: {
        a: string;
        d: string;
        g: string;
        k: string;
        tc: string;
    };
    nm: string;
    op: number;
    v: string;
    w: number;
}
export interface AnimationSettings {
    autoplay?: Autoplay;
    loop?: Loop;
    direction?: AnimationDirection;
    mode?: PlayMode;
    speed?: number;
}
export interface Animation extends AnimationSettings {
    id: string;
}
export interface AnimationConfig extends Animation {
    url: string;
}
export interface LottieManifest {
    animations: Animation[];
    author?: string;
    description?: string;
    generator?: string;
    keywords?: string;
    version?: string;
}
export type Autoplay = boolean | '' | 'autoplay' | null;
export type Controls = boolean | '' | 'controls' | null;
export type Loop = boolean | '' | 'loop' | null;
export type Subframe = boolean | '' | null;
export type ObjectFit = 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
export type PreserveAspectRatio = 'xMidYMid meet' | 'xMidYMid slice' | 'xMinYMin slice' | 'none';
type JSXLottiePlayer = Omit<Partial<DotLottiePlayer>, 'style'> & {
    class?: string;
    ref?: RefObject<unknown>;
    style?: CSSProperties;
    src: string;
};
declare global {
    interface HTMLElementTagNameMap {
        'dotlottie-player': DotLottiePlayer;
    }
    function dotLottiePlayer(): DotLottiePlayer;
    namespace JSX {
        interface IntrinsicElements {
            'dotlottie-player': JSXLottiePlayer;
        }
    }
}
export {};
