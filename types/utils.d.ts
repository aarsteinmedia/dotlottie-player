import type { AnimationData, LottieManifest } from '@aarsteinmedia/lottie-web';
import { PreserveAspectRatio } from '@aarsteinmedia/lottie-web/utils';
import { type Unzipped } from 'fflate';
import { ObjectFit } from './enums';
export declare class CustomError extends Error {
    status?: number;
}
export declare const getManifest: (unzipped: Unzipped) => LottieManifest;
export declare const getExt: (str?: string) => string | undefined;
export declare const download: (data: string | ArrayBuffer, options?: {
    name: string;
    mimeType: string;
}) => void, getFilename: (src: string, keepExt?: boolean) => string, addExt: (ext: string, str?: string) => string | undefined, aspectRatio: (objectFit: ObjectFit) => PreserveAspectRatio, base64ToU8: (str: string) => Uint8Array<ArrayBufferLike>, getExtFromB64: (str: string) => string, handleErrors: (err: unknown) => {
    message: string;
    status: number;
}, createDotLottie: ({ animations, fileName, manifest, shouldDownload, }: {
    animations?: AnimationData[];
    manifest?: LottieManifest;
    fileName?: string;
    shouldDownload?: boolean;
}) => Promise<ArrayBuffer | null>, createJSON: ({ animation, fileName, shouldDownload, }: {
    animation?: AnimationData;
    fileName?: string;
    shouldDownload?: boolean;
}) => void, frameOutput: (frame?: number) => string, getAnimationData: (input: unknown) => Promise<{
    animations?: AnimationData[];
    manifest: LottieManifest | null;
    isDotLottie: boolean;
}>;
