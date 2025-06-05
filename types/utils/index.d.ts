import type { LottieAsset } from '@aarsteinmedia/lottie-web';
import { PreserveAspectRatio } from '@aarsteinmedia/lottie-web/utils';
import { ObjectFit } from '../utils/enums';
export declare const aspectRatio: (objectFit: ObjectFit) => PreserveAspectRatio, download: (data: string | ArrayBuffer, options?: {
    name: string;
    mimeType: string;
}) => void, getExt: (str?: string) => string | undefined, getFilename: (src: string, keepExt?: boolean) => string, addExt: (ext: string, str?: string) => string | undefined, parseBase64: (str: string) => string, base64ToU8: (str: string) => Uint8Array<ArrayBufferLike>, getExtFromB64: (str: string) => string, handleErrors: (err: unknown) => {
    message: string;
    status: number;
}, isAudio: (asset: LottieAsset) => boolean, isImage: (asset: LottieAsset) => boolean, frameOutput: (frame?: number) => string;
