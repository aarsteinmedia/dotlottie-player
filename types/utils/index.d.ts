import type { AnimationData } from '@aarsteinmedia/lottie-web';
import { PreserveAspectRatio } from '@aarsteinmedia/lottie-web/utils';
import { ObjectFit } from '../utils/enums';
export declare const aspectRatio: (objectFit: ObjectFit) => PreserveAspectRatio, handleErrors: (err: unknown) => {
    message: string;
    status: number;
}, isLottie: (json: AnimationData) => boolean, frameOutput: (frame?: number) => string;
