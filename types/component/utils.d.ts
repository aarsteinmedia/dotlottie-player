import type { Unzipped, Zippable } from 'fflate';
import type { LottieAsset, LottieJSON, LottieManifest, ObjectFit } from './types';
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
    Next = "next",
    Pause = "pause",
    Play = "play",
    Previous = "previous",
    Ready = "ready",
    Rendered = "rendered",
    Stop = "stop"
}
export declare class CustomError extends Error {
    status?: number;
}
export declare const addExt: (ext: string, str?: string) => string | undefined, aspectRatio: (objectFit: ObjectFit) => "none" | "xMidYMid meet" | "xMidYMid slice" | "xMinYMin slice", base64ToU8: (str: string) => Uint8Array, createDotLottie: (animations: LottieJSON[], manifest: LottieManifest, filename?: string, triggerDownload?: boolean) => Promise<void | ArrayBuffer>, download: (data: string | ArrayBuffer, options?: {
    name: string;
    mimeType: string;
}) => void, handleErrors: (err: unknown) => {
    message: string;
    status: number;
}, frameOutput: (frame?: number) => string, getAnimationData: (input: unknown) => Promise<{
    animations: LottieJSON[] | null;
    manifest: LottieManifest | null;
    isDotLottie?: boolean;
}>, getArrayBuffer: (zippable: Zippable) => Promise<ArrayBuffer>, getExt: (str?: string) => string | undefined, getExtFromB64: (str: string) => string, getFilename: (src: string, keepExt?: boolean) => string, getLottieJSON: (resp: Response) => Promise<{
    data: LottieJSON[];
    manifest: LottieManifest;
}>, getManifest: (unzipped: Unzipped) => LottieManifest, getMimeFromExt: (ext?: string) => string, hasExt: (path?: string) => boolean | "" | undefined, isAudio: (asset: LottieAsset) => boolean, isImage: (asset: LottieAsset) => boolean, isServer: () => boolean, strToU8: (str: string) => Uint8Array, resolveAssets: (unzipped: Unzipped, assets?: LottieAsset[]) => Promise<void>, unzip: (resp: Response) => Promise<Unzipped>, useId: (prefix?: string) => string;
