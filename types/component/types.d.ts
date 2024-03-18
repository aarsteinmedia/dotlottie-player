import type { AnimationDirection } from 'lottie-web';
import type { CSSProperties, RefObject } from 'react';
import type { DotLottiePlayer } from '.';
import type { PlayMode } from './utils';
type BoolInt = 0 | 1;
interface Shape {
    a: ShapeData;
    o: ShapeData;
    p: ShapeData;
    r: ShapeData;
    s: ShapeData;
}
interface ShapeData {
    a: BoolInt;
    k: number | number[];
    ix: number;
}
interface Layer {
    ao: BoolInt;
    bm: number;
    completed: boolean;
    ddd: BoolInt;
    ip: number;
    ks: object;
    nm: string;
    op: number;
    shapes: Shape[];
    sr: number;
    st: number;
    td: number;
    ty: number;
}
export interface LottieAsset {
    e?: BoolInt;
    layers?: Layer[];
    h?: number;
    id?: string;
    nm?: string;
    p?: string;
    u?: string;
    xt?: number;
    w?: number;
}
export interface LottieJSON {
    assets?: LottieAsset[];
    ddd: BoolInt;
    fr: number;
    h: number;
    ip: number;
    layers: Layer[];
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
export type AnimateOnScroll = boolean | '' | null;
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
