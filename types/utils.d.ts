import { type Unzipped, type Zippable } from 'fflate';
import type { LottieAsset, LottieJSON, LottieManifest } from './types';
export declare class CustomError extends Error {
    status?: number;
}
export declare const addExt: (ext: string, str?: string) => string | undefined, aspectRatio: (objectFit: string) => "none" | "xMidYMid meet" | "xMidYMid slice" | "xMinYMin slice", base64ToU8: (str: string) => Uint8Array<ArrayBufferLike>, createDotLottie: ({ animations, fileName, manifest, shouldDownload, }: {
    animations?: LottieJSON[];
    manifest: LottieManifest;
    fileName?: string;
    shouldDownload?: boolean;
}) => Promise<void | ArrayBuffer>, createJSON: ({ animation, fileName, shouldDownload, }: {
    animation?: LottieJSON;
    fileName?: string;
    shouldDownload?: boolean;
}) => string | void, download: (data: string | ArrayBuffer, options?: {
    name: string;
    mimeType: string;
}) => void, fileToBase64: (url: string) => Promise<string>, frameOutput: (frame?: number) => string, getAnimationData: (input: unknown) => Promise<{
    animations?: LottieJSON[];
    manifest?: LottieManifest;
    isDotLottie: boolean;
}>, getArrayBuffer: (zippable: Zippable) => Promise<ArrayBuffer>, getExt: (str?: string) => string | undefined, getExtFromB64: (str: string) => string, getFilename: (src: string, keepExt?: boolean) => string, getLottieJSON: (resp: Response) => Promise<{
    data: LottieJSON[];
    manifest: LottieManifest;
}>, getManifest: (unzipped: Unzipped) => LottieManifest, getMimeFromExt: (ext?: string) => string, handleErrors: (err: unknown) => {
    message: string;
    status: number;
}, hasExt: (path?: string) => boolean | "" | undefined, isAudio: (asset: LottieAsset) => boolean, isBase64: (str?: string) => boolean, isImage: (asset: LottieAsset) => boolean, isServer: () => boolean, parseBase64: (str: string) => string, prepareString: (str: string) => string, resolveAssets: (unzipped: Unzipped, assets?: LottieAsset[]) => Promise<void>, unzip: (resp: Response) => Promise<Unzipped>, useId: (prefix?: string) => string;
