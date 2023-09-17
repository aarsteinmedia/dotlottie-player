import type { Unzipped } from 'fflate';
import type { RefObject } from 'react';
import type { DotLottiePlayer } from '.';
export declare enum PlayerState {
    Completed = "completed",
    Destroyed = "destroyed",
    Error = "error",
    Frozen = "frozen",
    Loading = "loading",
    Paused = "paused",
    Playing = "playing",
    Stopped = "stopped"
}
export declare enum PlayMode {
    Bounce = "bounce",
    Normal = "normal"
}
export declare enum PlayerEvents {
    Complete = "complete",
    Destroyed = "destroyed",
    Error = "error",
    Frame = "frame",
    Freeze = "freeze",
    Load = "load",
    Loop = "loop",
    Pause = "pause",
    Play = "play",
    Ready = "ready",
    Rendered = "rendered",
    Stop = "stop"
}
export interface LottieAssets {
    id?: string;
    p?: string;
    e?: number;
    layers?: [];
}
export interface LottieManifest {
    animations: [Record<string, unknown>];
    version?: string;
}
export interface LottieAnimation extends Unzipped {
    "manifest.json": Uint8Array;
}
export type Autoplay = boolean | '' | 'autoplay' | null;
export type Controls = boolean | '' | 'controls' | null;
export type Loop = boolean | '' | 'loop' | null;
export type Subframe = boolean | '' | null;
export type ObjectFit = 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
export type PreserveAspectRatio = 'xMidYMid meet' | 'xMidYMid slice' | 'xMinYMin slice' | 'none';
interface ReactLottiePlayer extends Partial<DotLottiePlayer> {
    class?: string;
    ref?: RefObject<unknown>;
    style?: any;
}
declare global {
    interface HTMLElementTagNameMap {
        'dotlottie-player': DotLottiePlayer;
    }
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'dotlottie-player': ReactLottiePlayer;
        }
    }
}
export {};
//# sourceMappingURL=types.d.ts.map